import Bet from '../models/Bet.js';
import Game from '../models/Game.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/validation.js';

// Get all bets
export const getBets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, betType, search } = req.query;
  const skip = (page - 1) * limit;
  
  const filter = {};
  if (status) filter.status = status;
  if (betType) filter.betType = betType;
  
  // Search filter
  if (search && search.trim()) {
    filter.$or = [
      { betSlip: { $regex: search.trim(), $options: 'i' } }
    ];
  }
  
  const bets = await Bet.find(filter)
    .populate('userId', 'fullName email phone')
    .populate('gameId', 'type title startTime endTime result')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Bet.countDocuments(filter);
  
  res.json({
    success: true,
    count: bets.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: bets
  });
});

// Get bet by ID
export const getBetById = asyncHandler(async (req, res) => {
  const bet = await Bet.findById(req.params.id)
    .populate('userId', 'fullName email phone')
    .populate('gameId', 'type title startTime endTime result');
  
  if (!bet) {
    return res.status(404).json({
      success: false,
      message: 'Bet not found'
    });
  }
  
  res.json({
    success: true,
    data: bet
  });
});

// Place bet
export const placeBet = asyncHandler(async (req, res) => {
  const { gameId, numbers, betType, amount } = req.body;
  
  // Check if game exists and is active
  const game = await Game.findById(gameId);
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
  
  // Check if user has sufficient balance
  if (req.user.balance < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient balance'
    });
  }
  
  // Validate numbers based on bet type
  if (betType === 'keno') {
    if (numbers.length < 1 || numbers.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Keno bets must have 1-20 numbers'
      });
    }
  }
  
  // Validate sum-three bet types (numbers array can be empty)
  if (['tai', 'xiu', 'chan', 'le', 'taiChan', 'taiLe', 'xiuChan', 'xiuLe'].includes(betType)) {
    // For sum-three games, numbers array should be empty or can be ignored
    // Bet type is sufficient for these games
  }
  
  // Create bet
  const bet = await Bet.create({
    userId: req.user._id,
    gameId,
    numbers,
    betType,
    amount,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Update user balance
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { balance: -amount }
  });
  
  // Update game stats
  await Game.findByIdAndUpdate(gameId, {
    $inc: { 
      totalBets: 1,
      totalAmount: amount
    }
  });
  
  // Update user balance in response
  const updatedUser = await User.findById(req.user._id).select('balance');
  
  res.status(201).json({
    success: true,
    message: 'Bet placed successfully',
    data: {
      bet,
      newBalance: updatedUser.balance
    }
  });
});

// Get user bets
export const getUserBets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (page - 1) * limit;
  
  const filter = { userId: req.user._id };
  if (status) filter.status = status;
  
  console.log(`🎯 Fetching bets for user: ${req.user._id}`);
  console.log(`🔍 Filter:`, filter);
  
  const bets = await Bet.find(filter)
    .populate('gameId', 'type title startTime endTime result')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  console.log(`📊 Found ${bets.length} bets for user ${req.user._id}`);
  
  const total = await Bet.countDocuments(filter);
  
  res.json({
    success: true,
    count: bets.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: bets
  });
});

// Get game bets
export const getGameBets = asyncHandler(async (req, res) => {
  const { gameId } = req.params;
  
  const bets = await Bet.getGameBets(gameId);
  
  res.json({
    success: true,
    count: bets.length,
    data: bets
  });
});

// Get winning bets
export const getWinningBets = asyncHandler(async (req, res) => {
  const { gameId } = req.params;
  
  const bets = await Bet.getWinningBets(gameId);
  
  res.json({
    success: true,
    count: bets.length,
    data: bets
  });
});

// Get bet statistics
export const getBetStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const stats = await Bet.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalWinnings: { $sum: '$winAmount' }
      }
    }
  ]);
  
  const totalStats = await Bet.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalBets: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalWinnings: { $sum: '$winAmount' },
        netProfit: { $sum: { $subtract: ['$winAmount', '$amount'] } }
      }
    }
  ]);
  
  res.json({
    success: true,
    data: {
      byStatus: stats,
      total: totalStats[0] || {
        totalBets: 0,
        totalAmount: 0,
        totalWinnings: 0,
        netProfit: 0
      }
    }
  });
});

// Cancel bet
export const cancelBet = asyncHandler(async (req, res) => {
  const bet = await Bet.findById(req.params.id);
  
  if (!bet) {
    return res.status(404).json({
      success: false,
      message: 'Bet not found'
    });
  }
  
  if (bet.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this bet'
    });
  }
  
  if (bet.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel bet that is not pending'
    });
  }
  
  // Check if game is still active
  const game = await Game.findById(bet.gameId);
  if (!game || game.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel bet for inactive game'
    });
  }
  
  // Update bet status
  bet.status = 'cancelled';
  await bet.save();
  
  // Refund user balance
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { balance: bet.amount }
  });
  
  // Update game stats
  await Game.findByIdAndUpdate(bet.gameId, {
    $inc: { 
      totalBets: -1,
      totalAmount: -bet.amount
    }
  });
  
  // Update user balance in response
  const updatedUser = await User.findById(req.user._id).select('balance');
  
  res.json({
    success: true,
    message: 'Bet cancelled successfully',
    data: {
      bet,
      newBalance: updatedUser.balance
    }
  });
});



