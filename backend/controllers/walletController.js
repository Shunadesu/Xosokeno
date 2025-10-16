import User from '../models/User.js';
import Bet from '../models/Bet.js';
import Deposit from '../models/Deposit.js';
import Game from '../models/Game.js';
import QRCode from '../models/QRCode.js';
import Promotion from '../models/Promotion.js';
import Banner from '../models/Banner.js';
import { asyncHandler } from '../middleware/validation.js';

// Get wallet balance
export const getWalletBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('balance');
  
  res.json({
    success: true,
    data: {
      balance: user.balance
    }
  });
});

// Get transactions (deposits and bets)
export const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  const skip = (page - 1) * limit;
  
  let transactions = [];
  
  if (!type || type === 'deposits') {
    const deposits = await Deposit.find({ userId: req.user._id })
      .populate('qrCodeId', 'name bankName')
      .populate('promotionApplied', 'name type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    transactions = deposits.map(deposit => ({
      id: deposit._id,
      type: 'deposit',
      amount: deposit.amount,
      status: deposit.status,
      method: deposit.method,
      createdAt: deposit.createdAt,
      description: `Deposit via ${deposit.method}`,
      qrCode: deposit.qrCodeId,
      promotion: deposit.promotionApplied
    }));
  }
  
  if (!type || type === 'bets') {
    const bets = await Bet.find({ userId: req.user._id })
      .populate('gameId', 'type title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const betTransactions = bets.map(bet => ({
      id: bet._id,
      type: 'bet',
      amount: -bet.amount,
      winAmount: bet.winAmount,
      status: bet.status,
      betType: bet.betType,
      createdAt: bet.createdAt,
      description: `${bet.betType} bet on ${bet.gameId?.title || 'Game'}`,
      game: bet.gameId
    }));
    
    transactions = [...transactions, ...betTransactions];
  }
  
  // Sort all transactions by date
  transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

// Get transaction by ID
export const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Try to find as deposit first
  let transaction = await Deposit.findById(id)
    .populate('qrCodeId', 'name bankName accountNumber')
    .populate('promotionApplied', 'name type reward');
  
  if (transaction) {
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transaction'
      });
    }
    
    return res.json({
      success: true,
      data: {
        ...transaction.toObject(),
        type: 'deposit'
      }
    });
  }
  
  // Try to find as bet
  transaction = await Bet.findById(id)
    .populate('gameId', 'type title startTime endTime result');
  
  if (transaction) {
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transaction'
      });
    }
    
    return res.json({
      success: true,
      data: {
        ...transaction.toObject(),
        type: 'bet'
      }
    });
  }
  
  res.status(404).json({
    success: false,
    message: 'Transaction not found'
  });
});

// Get wallet statistics
export const getWalletStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Get deposit statistics
  const depositStats = await Deposit.aggregate([
    { $match: { userId, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalDeposits: { $sum: 1 },
        totalDepositAmount: { $sum: '$amount' },
        totalBonusAmount: { $sum: '$bonusAmount' }
      }
    }
  ]);
  
  // Get bet statistics
  const betStats = await Bet.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalBets: { $sum: 1 },
        totalBetAmount: { $sum: '$amount' },
        totalWinnings: { $sum: '$winAmount' },
        netProfit: { $sum: { $subtract: ['$winAmount', '$amount'] } }
      }
    }
  ]);
  
  // Get current balance
  const user = await User.findById(userId).select('balance');
  
  res.json({
    success: true,
    data: {
      currentBalance: user.balance,
      depositStats: depositStats[0] || {
        totalDeposits: 0,
        totalDepositAmount: 0,
        totalBonusAmount: 0
      },
      betStats: betStats[0] || {
        totalBets: 0,
        totalBetAmount: 0,
        totalWinnings: 0,
        netProfit: 0
      }
    }
  });
});

// Get balance history
export const getBalanceHistory = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  
  const userId = req.user._id;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  // Get deposits
  const deposits = await Deposit.find({
    userId,
    status: 'completed',
    confirmedAt: { $gte: startDate, $lte: endDate }
  }).sort({ confirmedAt: 1 });
  
  // Get bets
  const bets = await Bet.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate }
  }).sort({ createdAt: 1 });
  
  // Combine and sort by date
  const history = [];
  
  deposits.forEach(deposit => {
    history.push({
      date: deposit.confirmedAt,
      type: 'deposit',
      amount: deposit.amount,
      description: `Deposit via ${deposit.method}`
    });
  });
  
  bets.forEach(bet => {
    history.push({
      date: bet.createdAt,
      type: 'bet',
      amount: -bet.amount,
      description: `${bet.betType} bet`
    });
    
    if (bet.winAmount > 0) {
      history.push({
        date: bet.processedAt || bet.createdAt,
        type: 'win',
        amount: bet.winAmount,
        description: `Win from ${bet.betType} bet`
      });
    }
  });
  
  // Sort by date
  history.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  res.json({
    success: true,
    data: {
      period: { startDate, endDate },
      history
    }
  });
});





