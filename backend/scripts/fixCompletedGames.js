import mongoose from 'mongoose';
import Game from '../models/Game.js';
import Bet from '../models/Bet.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zuna-xosokeno';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected for fixing completed games');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log('👋 MongoDB disconnected');
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
      payoutRate = game.payoutRates?.[matchedCount.toString()] || 0;
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

const fixCompletedGames = async () => {
  await connectDB();
  
  try {
    // Find all completed games without results
    const completedGamesWithoutResults = await Game.find({
      status: 'completed',
      $or: [
        { result: { $exists: false } },
        { result: { $size: 0 } }
      ]
    });
    
    console.log(`🔍 Found ${completedGamesWithoutResults.length} completed games without results`);
    
    for (const game of completedGamesWithoutResults) {
      console.log(`\n🎮 Processing game: ${game.title} (${game._id})`);
      
      // Generate result
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
      
      // Update game with result
      game.result = result;
      await game.save();
      console.log(`🎯 Generated result for ${game.title}:`, result);
      
      // Process all pending bets for this game
      const pendingBets = await Bet.find({ 
        gameId: game._id, 
        status: 'pending' 
      });
      
      if (pendingBets.length > 0) {
        console.log(`🎲 Processing ${pendingBets.length} pending bets for ${game.title}`);
        
        for (const bet of pendingBets) {
          await processBet(bet, game);
        }
        
        // Update game statistics
        await updateGameStats(game._id);
      }
      
      console.log(`✅ Fixed game: ${game.title}`);
    }
    
    console.log(`\n🎉 Successfully fixed ${completedGamesWithoutResults.length} completed games!`);
    
  } catch (error) {
    console.error('❌ Error fixing completed games:', error);
  } finally {
    await disconnectDB();
  }
};

fixCompletedGames();
