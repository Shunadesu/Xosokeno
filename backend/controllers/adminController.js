import User from '../models/User.js';
import Game from '../models/Game.js';
import Bet from '../models/Bet.js';
import Deposit from '../models/Deposit.js';
import QRCode from '../models/QRCode.js';
import Promotion from '../models/Promotion.js';
import Banner from '../models/Banner.js';
import { asyncHandler } from '../middleware/validation.js';

// Get admin dashboard data
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Get user statistics
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const newUsersToday = await User.countDocuments({
    createdAt: { $gte: today }
  });
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: thisMonth }
  });
  
  // Get game statistics
  const totalGames = await Game.countDocuments();
  const activeGames = await Game.countDocuments({ status: 'active' });
  const completedGames = await Game.countDocuments({ status: 'completed' });
  
  // Get bet statistics
  const totalBets = await Bet.countDocuments();
  const totalBetAmount = await Bet.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalWinnings = await Bet.aggregate([
    { $group: { _id: null, total: { $sum: '$winAmount' } } }
  ]);
  
  // Get deposit statistics
  const totalDeposits = await Deposit.countDocuments();
  const pendingDeposits = await Deposit.countDocuments({ status: 'pending' });
  const totalDepositAmount = await Deposit.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  // Get recent activities
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('fullName email createdAt');
  
  const recentBets = await Bet.find()
    .populate('userId', 'fullName email')
    .populate('gameId', 'type title')
    .sort({ createdAt: -1 })
    .limit(5);
  
  const recentDeposits = await Deposit.find()
    .populate('userId', 'fullName email')
    .populate('qrCodeId', 'name bankName')
    .sort({ createdAt: -1 })
    .limit(5);
  
  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsersToday,
        newThisMonth: newUsersThisMonth
      },
      games: {
        total: totalGames,
        active: activeGames,
        completed: completedGames
      },
      bets: {
        total: totalBets,
        totalAmount: totalBetAmount[0]?.total || 0,
        totalWinnings: totalWinnings[0]?.total || 0,
        netProfit: (totalBetAmount[0]?.total || 0) - (totalWinnings[0]?.total || 0)
      },
      deposits: {
        total: totalDeposits,
        pending: pendingDeposits,
        totalAmount: totalDepositAmount[0]?.total || 0
      },
      recentActivities: {
        users: recentUsers,
        bets: recentBets,
        deposits: recentDeposits
      }
    }
  });
});

// Get users
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, isActive } = req.query;
  const skip = (page - 1) * limit;
  
  const filter = {};
  
  // Search filter
  if (search && search.trim()) {
    filter.$or = [
      { fullName: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
      { phone: { $regex: search.trim(), $options: 'i' } }
    ];
  }
  
  // Role filter
  if (role && role.trim()) {
    filter.role = role.trim();
  }
  
  // Active status filter
  if (isActive !== undefined && isActive !== '') {
    filter.isActive = isActive === 'true' || isActive === true;
  }
  
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await User.countDocuments(filter);
  
  res.json({
    success: true,
    count: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: users
  });
});

// Create admin user (Super Admin only)
export const createAdmin = asyncHandler(async (req, res) => {
  const { email, phone, password, fullName, role = 'admin' } = req.body;

  // Validate required fields
  if (!email || !phone || !password || !fullName) {
    return res.status(400).json({
      success: false,
      message: 'Email, phone, password, and full name are required'
    });
  }

  // Validate role
  if (!['admin', 'super_admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be either admin or super_admin'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email or phone number'
    });
  }

  // Create admin user
  const adminUser = await User.create({
    email,
    phone,
    password,
    fullName,
    role,
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true
  });

  res.status(201).json({
    success: true,
    message: 'Admin user created successfully',
    data: {
      id: adminUser._id,
      email: adminUser.email,
      phone: adminUser.phone,
      fullName: adminUser.fullName,
      role: adminUser.role,
      isActive: adminUser.isActive,
      createdAt: adminUser.createdAt
    }
  });
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Get user statistics
  const betStats = await Bet.aggregate([
    { $match: { userId: user._id } },
    {
      $group: {
        _id: null,
        totalBets: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalWinnings: { $sum: '$winAmount' }
      }
    }
  ]);
  
  const depositStats = await Deposit.aggregate([
    { $match: { userId: user._id } },
    {
      $group: {
        _id: null,
        totalDeposits: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
  
  res.json({
    success: true,
    data: {
      user,
      statistics: {
        bets: betStats[0] || { totalBets: 0, totalAmount: 0, totalWinnings: 0 },
        deposits: depositStats[0] || { totalDeposits: 0, totalAmount: 0 }
      }
    }
  });
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { fullName, email, phone, role, isActive, balance } = req.body;
  
  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (role) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (balance !== undefined) updateData.balance = balance;
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

// Delete user (Super Admin only)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Check if user has any bets or deposits
  const hasBets = await Bet.countDocuments({ userId: user._id });
  const hasDeposits = await Deposit.countDocuments({ userId: user._id });
  
  if (hasBets > 0 || hasDeposits > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete user with existing bets or deposits'
    });
  }
  
  await User.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Get admin statistics
export const getAdminStats = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const days = parseInt(period);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // User statistics
  const userStats = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
  
  // Bet statistics
  const betStats = await Bet.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalWinnings: { $sum: '$winAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
  
  // Deposit statistics
  const depositStats = await Deposit.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
  
  res.json({
    success: true,
    data: {
      period: { startDate, endDate, days },
      userStats,
      betStats,
      depositStats
    }
  });
});

// Get system logs
export const getSystemLogs = asyncHandler(async (req, res) => {
  // This would typically connect to a logging service
  // For now, we'll return a placeholder
  res.json({
    success: true,
    message: 'System logs endpoint - implement with logging service',
    data: []
  });
});

// Get admin settings
export const getAdminSettings = asyncHandler(async (req, res) => {
  // This would typically come from a settings collection
  // For now, we'll return default settings
  res.json({
    success: true,
    data: {
      siteName: 'Zuna Xosokeno',
      maintenanceMode: false,
      registrationEnabled: true,
      maxBetAmount: 1000000,
      minBetAmount: 1000,
      gameInterval: 5,
      specialHours: [8, 12, 18],
      specialMultiplier: 1.2
    }
  });
});

// Update admin settings
export const updateAdminSettings = asyncHandler(async (req, res) => {
  // This would typically update a settings collection
  // For now, we'll return success
  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: req.body
  });
});
