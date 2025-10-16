import cron from 'node-cron';
import mongoose from 'mongoose';
import Game from '../models/Game.js';
import Bet from '../models/Bet.js';
import User from '../models/User.js';

// Start cron jobs
export const startCronJobs = () => {
  console.log('🕐 Starting cron jobs...');
  
  // Check every minute for games that need status updates
  cron.schedule('* * * * *', async () => {
    try {
      await updateGameStatuses();
    } catch (error) {
      console.error('❌ Error updating game statuses:', error);
    }
  });
  
  console.log('✅ Cron jobs started successfully');
};

// Update game statuses based on current time
const updateGameStatuses = async () => {
  const now = new Date();
  
  // Update pending → active (games that should start now)
  const gamesToActivate = await Game.updateMany(
    { 
      status: 'pending', 
      startTime: { $lte: now },
      endTime: { $gt: now },
      isActive: true
    },
    { status: 'active' }
  );
  
  if (gamesToActivate.modifiedCount > 0) {
    console.log(`🎮 Activated ${gamesToActivate.modifiedCount} games`);
  }
  
  // Update active → completed (games that should end now)
  const gamesToComplete = await Game.find({
    status: 'active', 
    endTime: { $lte: now },
    isActive: true
  });
  
  if (gamesToComplete.length > 0) {
    console.log(`⏰ Found ${gamesToComplete.length} games to complete`);
    
    for (const game of gamesToComplete) {
      await completeGame(game);
    }
  }
};

// Complete a game and process all bets
const completeGame = async (game) => {
  try {
    console.log(`🎯 Completing game: ${game.title} (${game._id})`);
    
    // Generate result if not already generated
    if (!game.result || game.result.length === 0) {
      console.log(`🎲 Generating result for game: ${game.title}`);
      let result = [];
      
      if (game.type === 'keno') {
        // Generate 20 random numbers for Keno
        const numbers = Array.from({ length: 80 }, (_, i) => i + 1);
        for (let i = 0; i < 20; i++) {
          const randomIndex = Math.floor(Math.random() * numbers.length);
          result.push(numbers.splice(randomIndex, 1)[0]);
        }
      } else if (game.type === 'big-small' || game.type === 'even-odd') {
        // Generate 20 random numbers for Big/Small or Even/Odd
        const numbers = Array.from({ length: 80 }, (_, i) => i + 1);
        for (let i = 0; i < 20; i++) {
          const randomIndex = Math.floor(Math.random() * numbers.length);
          result.push(numbers.splice(randomIndex, 1)[0]);
        }
      } else {
        // Generate random numbers for other types
        const numbers = Array.from({ length: 80 }, (_, i) => i + 1);
        for (let i = 0; i < 10; i++) {
          const randomIndex = Math.floor(Math.random() * numbers.length);
          result.push(numbers.splice(randomIndex, 1)[0]);
        }
      }
      
      game.result = result;
      console.log(`🎯 Generated result for ${game.title}:`, result);
    }
    
    // Update game status to completed
    game.status = 'completed';
    game.endTime = new Date(); // Ensure end time is current
    await game.save();
    
    // Get all pending bets for this game
    const pendingBets = await Bet.find({ 
      gameId: game._id, 
      status: 'pending' 
    });
    
    if (pendingBets.length === 0) {
      console.log(`📝 No pending bets for game ${game._id}`);
      return;
    }
    
    console.log(`🎲 Processing ${pendingBets.length} bets for game ${game._id}`);
    
    // Process each bet
    for (const bet of pendingBets) {
      await processBet(bet, game);
    }
    
    // Update game statistics
    await updateGameStats(game._id);
    
    console.log(`✅ Completed game: ${game.title}`);
    
  } catch (error) {
    console.error(`❌ Error completing game ${game._id}:`, error);
  }
};

// Process individual bet
const processBet = async (bet, game) => {
  try {
    let matchedNumbers = [];
    let matchedCount = 0;
    let payoutRate = 0;
    let winAmount = 0;
    let status = 'lost';

    // Calculate winnings based on bet type
    if (bet.betType === 'keno') {
      // Keno: check how many numbers match
      matchedNumbers = bet.numbers.filter(num => game.result.includes(num));
      matchedCount = matchedNumbers.length;
      payoutRate = game.payoutRates?.get(matchedCount.toString()) || 0;
      winAmount = matchedCount > 0 ? bet.amount * payoutRate : 0;
      status = matchedCount > 0 ? 'won' : 'lost';
      
    } else if (bet.betType === 'big') {
      // Big: check if sum of 20 numbers >= 810
      const totalSum = game.result.reduce((sum, num) => sum + num, 0);
      matchedCount = totalSum >= 810 ? 1 : 0;
      payoutRate = matchedCount > 0 ? 1.95 : 0; // 1.95x payout
      winAmount = matchedCount > 0 ? bet.amount * payoutRate : 0;
      status = matchedCount > 0 ? 'won' : 'lost';
      
    } else if (bet.betType === 'small') {
      // Small: check if sum of 20 numbers <= 810
      const totalSum = game.result.reduce((sum, num) => sum + num, 0);
      matchedCount = totalSum <= 810 ? 1 : 0;
      payoutRate = matchedCount > 0 ? 1.95 : 0; // 1.95x payout
      winAmount = matchedCount > 0 ? bet.amount * payoutRate : 0;
      status = matchedCount > 0 ? 'won' : 'lost';
      
    } else if (bet.betType === 'even') {
      // Even: check if sum of 20 numbers is even
      const totalSum = game.result.reduce((sum, num) => sum + num, 0);
      matchedCount = totalSum % 2 === 0 ? 1 : 0;
      payoutRate = matchedCount > 0 ? 1.95 : 0; // 1.95x payout
      winAmount = matchedCount > 0 ? bet.amount * payoutRate : 0;
      status = matchedCount > 0 ? 'won' : 'lost';
      
    } else if (bet.betType === 'odd') {
      // Odd: check if sum of 20 numbers is odd
      const totalSum = game.result.reduce((sum, num) => sum + num, 0);
      matchedCount = totalSum % 2 === 1 ? 1 : 0;
      payoutRate = matchedCount > 0 ? 1.95 : 0; // 1.95x payout
      winAmount = matchedCount > 0 ? bet.amount * payoutRate : 0;
      status = matchedCount > 0 ? 'won' : 'lost';
    }

    // Update bet with results
    await Bet.findByIdAndUpdate(bet._id, {
      status,
      matchedNumbers,
      matchedCount,
      payoutRate,
      winAmount,
      processedAt: new Date()
    });

    // Add winnings to user balance if won
    if (status === 'won' && winAmount > 0) {
      await User.findByIdAndUpdate(bet.userId, {
        $inc: { balance: winAmount }
      });
      
      console.log(`💰 User ${bet.userId} won ${winAmount} VND from bet ${bet._id}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing bet ${bet._id}:`, error);
  }
};

// Update game statistics
const updateGameStats = async (gameId) => {
  try {
    const stats = await Bet.aggregate([
      { $match: { gameId: new mongoose.Types.ObjectId(gameId) } },
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalWinnings: { $sum: '$winAmount' },
          winningBets: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } }
        }
      }
    ]);

    if (stats.length > 0) {
      const gameStats = stats[0];
      await Game.findByIdAndUpdate(gameId, {
        totalBets: gameStats.totalBets,
        totalAmount: gameStats.totalAmount,
        totalWinnings: gameStats.totalWinnings
      });
      
      console.log(`📊 Updated stats for game ${gameId}: ${gameStats.totalBets} bets, ${gameStats.totalAmount} total amount, ${gameStats.totalWinnings} total winnings`);
    }
  } catch (error) {
    console.error(`❌ Error updating game stats for ${gameId}:`, error);
  }
};

// Manual function to process a specific game (for admin use)
export const processGameManually = async (gameId) => {
  try {
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }
    
    await completeGame(game);
    return { success: true, message: 'Game processed successfully' };
  } catch (error) {
    console.error('❌ Error processing game manually:', error);
    return { success: false, message: error.message };
  }
};
