import mongoose from 'mongoose';
import Game from '../models/Game.js';
import Bet from '../models/Bet.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/validation.js';

// Get game templates (3 game cố định)
export const getGameTemplates = asyncHandler(async (req, res) => {
  const templates = await Game.find({ 
    type: { $in: ['keno', 'big-small', 'even-odd'] },
    isActive: true 
  }).sort({ type: 1 });

  res.json({
    success: true,
    count: templates.length,
    data: templates
  });
});

// Get all games
export const getGames = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, status } = req.query;
  const skip = (page - 1) * limit;
  
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  
  const games = await Game.find(filter)
    .populate('createdBy', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  // Ensure all games have correct status based on current time
  const now = new Date();
  const updatedGames = [];
  
  for (const game of games) {
    let correctStatus = game.status;
    
    if (now < game.startTime) {
      correctStatus = 'pending';
    } else if (now >= game.startTime && now < game.endTime) {
      correctStatus = 'active';
    } else if (now >= game.endTime) {
      correctStatus = 'completed';
    }
    
    // Update status if it's incorrect
    if (game.status !== correctStatus) {
      console.log(`🔄 Correcting game ${game._id} status from ${game.status} to ${correctStatus}`);
      game.status = correctStatus;
      await game.save();
    }
    
    updatedGames.push(game);
  }
  
  const total = await Game.countDocuments(filter);
  
  res.json({
    success: true,
    count: updatedGames.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: updatedGames
  });
});

// Get game by ID
export const getGameById = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id)
    .populate('createdBy', 'fullName email');
  
  if (!game) {
    return res.status(404).json({
      success: false,
      message: 'Game not found'
    });
  }
  
  // Ensure status is correct based on current time
  const now = new Date();
  let correctStatus = game.status;
  
  if (now < game.startTime) {
    correctStatus = 'pending';
  } else if (now >= game.startTime && now < game.endTime) {
    correctStatus = 'active';
  } else if (now >= game.endTime) {
    correctStatus = 'completed';
  }
  
  // Update status if it's incorrect
  if (game.status !== correctStatus) {
    console.log(`🔄 Correcting game ${game._id} status from ${game.status} to ${correctStatus}`);
    game.status = correctStatus;
    await game.save();
  }
  
  // Ensure payoutRates exists and has default values if empty or missing
  const hasEmptyPayoutRates = !game.payoutRates || 
    (game.payoutRates instanceof Map && game.payoutRates.size === 0) ||
    (typeof game.payoutRates === 'object' && Object.keys(game.payoutRates).length === 0);
  
  if (hasEmptyPayoutRates) {
    const defaultPayoutRates = new Map([
      ['1', 1.0],
      ['2', 2.0],
      ['3', 5.0],
      ['4', 10.0],
      ['5', 20.0],
      ['6', 50.0],
      ['7', 100.0],
      ['8', 200.0],
      ['9', 500.0],
      ['10', 1000.0]
    ]);
    game.payoutRates = defaultPayoutRates;
    await game.save();
  }
  
  res.json({
    success: true,
    data: game
  });
});

// Create game directly
export const createGame = asyncHandler(async (req, res) => {
  const { 
    type, 
    title, 
    description, 
    minBetAmount, 
    maxBetAmount, 
    startTime, 
    endTime, 
    payoutRates 
  } = req.body;

  // Validate required fields
  if (!type || !title || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: type, title, startTime, endTime'
    });
  }

  // Validate game type
  const validTypes = ['keno', 'big-small', 'even-odd', 'special', 'anniversary'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid game type'
    });
  }

  // Validate bet amounts
  if (minBetAmount && maxBetAmount && minBetAmount >= maxBetAmount) {
    return res.status(400).json({
      success: false,
      message: 'Max bet amount must be greater than min bet amount'
    });
  }

  // Validate times
  if (new Date(endTime) <= new Date(startTime)) {
    return res.status(400).json({
      success: false,
      message: 'End time must be after start time'
    });
  }

  // Create game
  const gameData = {
    type,
    title,
    description: description || '',
    minBetAmount: minBetAmount || 1000,
    maxBetAmount: maxBetAmount || 1000000,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    payoutRates: payoutRates || new Map(),
    status: 'pending',
    createdBy: req.user._id
  };

  const game = await Game.create(gameData);

  res.status(201).json({
    success: true,
    message: 'Game created successfully',
    data: game
  });
});

// Update game
export const updateGame = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);
  
  if (!game) {
    return res.status(404).json({
      success: false,
      message: 'Game not found'
    });
  }
  
  // Only update fields that are provided in the request
  const updateData = {};
  const allowedFields = ['title', 'description', 'startTime', 'endTime', 'minBetAmount', 'maxBetAmount', 'status', 'result'];
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });
  
  // Convert date strings to Date objects if provided
  if (updateData.startTime) {
    updateData.startTime = new Date(updateData.startTime);
  }
  if (updateData.endTime) {
    updateData.endTime = new Date(updateData.endTime);
  }
  
  const updatedGame = await Game.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('createdBy', 'fullName email');
  
  // If result was updated and game is completed, process bets
  if (updateData.result && updateData.status === 'completed') {
    console.log(`🎯 Result updated for game ${updatedGame._id}, processing bets...`);
    await processGameBets(updatedGame);
  }
  
  res.json({
    success: true,
    message: 'Game updated successfully',
    data: updatedGame
  });
});

// Delete game
export const deleteGame = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);
  
  if (!game) {
    return res.status(404).json({
      success: false,
      message: 'Game not found'
    });
  }
  
  await Game.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Game deleted successfully'
  });
});

// Get active games
export const getActiveGames = asyncHandler(async (req, res) => {
  const games = await Game.getActiveGames()
    .populate('createdBy', 'fullName email');
  
  res.json({
    success: true,
    count: games.length,
    data: games
  });
});

// Get upcoming games
export const getUpcomingGames = asyncHandler(async (req, res) => {
  const games = await Game.getUpcomingGames()
    .populate('createdBy', 'fullName email');
  
  res.json({
    success: true,
    count: games.length,
    data: games
  });
});

// Get completed games
export const getCompletedGames = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const games = await Game.getCompletedGames(parseInt(limit))
    .populate('createdBy', 'fullName email');
  
  res.json({
    success: true,
    count: games.length,
    data: games
  });
});

// Get game statistics
export const getGameStats = asyncHandler(async (req, res) => {
  const gameId = req.params.id;
  
  const game = await Game.findById(gameId);
  if (!game) {
    return res.status(404).json({
      success: false,
      message: 'Game not found'
    });
  }
  
  const stats = await Bet.getGameStats(gameId);
  
  res.json({
    success: true,
    data: {
      game,
      statistics: stats[0] || {
        totalBets: 0,
        totalAmount: 0,
        totalWinnings: 0,
        winningBets: 0
      }
    }
  });
});

// Generate game result
export const generateGameResult = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);
  
  if (!game) {
    return res.status(404).json({
      success: false,
      message: 'Game not found'
    });
  }
  
  if (game.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Game is not active'
    });
  }
  
  // Generate random numbers based on game type
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
  game.status = 'completed';
  game.endTime = new Date();
  await game.save();
  
  // Process all bets for this game
  await processGameBets(game);
  
  res.json({
    success: true,
    message: 'Game result generated successfully',
    data: {
      game,
      result
    }
  });
});

// Process all bets for a completed game
const processGameBets = async (game) => {
  try {
    console.log(`🎯 Processing bets for game: ${game.title} (${game._id})`);
    
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
    
    console.log(`✅ Completed processing bets for game: ${game.title}`);
    
  } catch (error) {
    console.error(`❌ Error processing bets for game ${game._id}:`, error);
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
