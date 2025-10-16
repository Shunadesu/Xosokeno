import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Game from '../models/Game.js';
import Bet from '../models/Bet.js';
import Deposit from '../models/Deposit.js';

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return next(new Error('Authentication error: Invalid user'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// Setup socket handlers
export const setupSocketHandlers = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.fullName} (${socket.id})`);

    // Join user to their personal room
    socket.join(`user_${socket.user._id}`);

    // Join admin room if user is admin
    if (socket.user.role === 'admin' || socket.user.role === 'super_admin') {
      socket.join('admin_room');
    }

    // Handle game updates
    socket.on('join_game', async (gameId) => {
      try {
        const game = await Game.findById(gameId);
        if (game) {
          socket.join(`game_${gameId}`);
          socket.emit('game_joined', { gameId, game });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    socket.on('leave_game', (gameId) => {
      socket.leave(`game_${gameId}`);
      socket.emit('game_left', { gameId });
    });

    // Handle betting
    socket.on('place_bet', async (betData) => {
      try {
        // Validate bet data
        const { gameId, numbers, betType, amount } = betData;
        
        if (!gameId || !numbers || !betType || !amount) {
          socket.emit('bet_error', { message: 'Invalid bet data' });
          return;
        }

        // Check if game is active
        const game = await Game.findById(gameId);
        if (!game || game.status !== 'active') {
          socket.emit('bet_error', { message: 'Game is not active' });
          return;
        }

        // Check if user has sufficient balance
        if (socket.user.balance < amount) {
          socket.emit('bet_error', { message: 'Insufficient balance' });
          return;
        }

        // Create bet
        const bet = await Bet.create({
          userId: socket.user._id,
          gameId,
          numbers,
          betType,
          amount,
          ipAddress: socket.handshake.address,
          userAgent: socket.handshake.headers['user-agent']
        });

        // Update user balance
        await User.findByIdAndUpdate(socket.user._id, {
          $inc: { balance: -amount }
        });

        // Update game stats
        await Game.findByIdAndUpdate(gameId, {
          $inc: { 
            totalBets: 1,
            totalAmount: amount
          }
        });

        // Emit bet confirmation
        socket.emit('bet_placed', { bet });
        
        // Notify admin about new bet
        io.to('admin_room').emit('new_bet', { bet, user: socket.user });

        // Update user balance in real-time
        socket.emit('balance_updated', { 
          balance: socket.user.balance - amount 
        });

      } catch (error) {
        console.error('Bet placement error:', error);
        socket.emit('bet_error', { message: 'Failed to place bet' });
      }
    });

    // Handle deposit notifications
    socket.on('deposit_created', async (depositData) => {
      try {
        const deposit = await Deposit.create({
          ...depositData,
          userId: socket.user._id,
          ipAddress: socket.handshake.address,
          userAgent: socket.handshake.headers['user-agent']
        });

        // Notify admin about new deposit
        io.to('admin_room').emit('new_deposit', { deposit, user: socket.user });

        socket.emit('deposit_created', { deposit });
      } catch (error) {
        console.error('Deposit creation error:', error);
        socket.emit('deposit_error', { message: 'Failed to create deposit' });
      }
    });

    // Handle game result updates
    socket.on('game_result_updated', async (gameId) => {
      try {
        const game = await Game.findById(gameId);
        if (game && game.status === 'completed') {
          // Get all bets for this game
          const bets = await Bet.find({ gameId });
          
          // Process each bet
          for (const bet of bets) {
            if (bet.status === 'pending') {
              let matchedNumbers = [];
              let matchedCount = 0;
              let payoutRate = 0;

              // Calculate matched numbers based on bet type
              if (bet.betType === 'keno') {
                matchedNumbers = bet.numbers.filter(num => game.result.includes(num));
                matchedCount = matchedNumbers.length;
                payoutRate = game.payoutRates.get(matchedCount) || 0;
              } else if (bet.betType === 'big') {
                const bigNumbers = game.result.filter(num => num >= 11 && num <= 20);
                matchedCount = bigNumbers.length;
                payoutRate = matchedCount > 0 ? 1.0 : 0;
              } else if (bet.betType === 'small') {
                const smallNumbers = game.result.filter(num => num >= 1 && num <= 10);
                matchedCount = smallNumbers.length;
                payoutRate = matchedCount > 0 ? 1.0 : 0;
              } else if (bet.betType === 'even') {
                const evenNumbers = game.result.filter(num => num % 2 === 0);
                matchedCount = evenNumbers.length;
                payoutRate = matchedCount > 0 ? 1.0 : 0;
              } else if (bet.betType === 'odd') {
                const oddNumbers = game.result.filter(num => num % 2 === 1);
                matchedCount = oddNumbers.length;
                payoutRate = matchedCount > 0 ? 1.0 : 0;
              }

              // Update bet status
              const winAmount = payoutRate > 0 ? bet.amount * payoutRate : 0;
              const status = winAmount > 0 ? 'won' : 'lost';

              await Bet.findByIdAndUpdate(bet._id, {
                status,
                matchedNumbers,
                matchedCount,
                payoutRate,
                winAmount,
                processedAt: new Date()
              });

              // Update user balance if won
              if (status === 'won') {
                await User.findByIdAndUpdate(bet.userId, {
                  $inc: { balance: winAmount }
                });

                // Notify user about win
                io.to(`user_${bet.userId}`).emit('bet_won', {
                  bet,
                  winAmount,
                  game
                });
              } else {
                // Notify user about loss
                io.to(`user_${bet.userId}`).emit('bet_lost', {
                  bet,
                  game
                });
              }
            }
          }

          // Update game stats
          const gameStats = await Bet.getGameStats(gameId);
          if (gameStats.length > 0) {
            const stats = gameStats[0];
            await Game.findByIdAndUpdate(gameId, {
              totalWinnings: stats.totalWinnings
            });
          }

          // Broadcast game result to all users
          io.emit('game_result', { game });
        }
      } catch (error) {
        console.error('Game result update error:', error);
      }
    });

    // Handle deposit status updates
    socket.on('deposit_status_updated', async (depositId, status) => {
      try {
        const deposit = await Deposit.findById(depositId);
        if (deposit) {
          await Deposit.findByIdAndUpdate(depositId, {
            status,
            processedAt: new Date()
          });

          // If deposit is confirmed, update user balance
          if (status === 'confirmed') {
            await User.findByIdAndUpdate(deposit.userId, {
              $inc: { balance: deposit.amount }
            });

            // Notify user about confirmed deposit
            io.to(`user_${deposit.userId}`).emit('deposit_confirmed', {
              deposit,
              newBalance: deposit.userId.balance + deposit.amount
            });
          }

          // Notify admin about status update
          io.to('admin_room').emit('deposit_status_updated', {
            deposit,
            status
          });
        }
      } catch (error) {
        console.error('Deposit status update error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.fullName} (${socket.id})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.user.fullName}:`, error);
    });
  });

  // Broadcast game updates to all connected users
  const broadcastGameUpdate = (game) => {
    io.emit('game_update', { game });
  };

  // Broadcast deposit updates to admin
  const broadcastDepositUpdate = (deposit) => {
    io.to('admin_room').emit('deposit_update', { deposit });
  };

  // Export broadcast functions for use in controllers
  io.broadcastGameUpdate = broadcastGameUpdate;
  io.broadcastDepositUpdate = broadcastDepositUpdate;
};





