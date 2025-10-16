import User from '../models/User.js';
import Bet from '../models/Bet.js';
import Deposit from '../models/Deposit.js';
import { asyncHandler } from '../middleware/validation.js';

// Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  res.json({
    success: true,
    data: user
  });
});

// Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  
  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (phone) updateData.phone = phone;
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user._id).select('+password');
  
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }
  
  user.password = newPassword;
  await user.save();
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Get user stats
export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Get bet statistics
  const betStats = await Bet.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalBets: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalWinnings: { $sum: '$winAmount' },
        winningBets: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
        losingBets: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } }
      }
    }
  ]);
  
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
  
  // Get recent activity
  const recentBets = await Bet.find({ userId })
    .populate('gameId', 'type title startTime endTime result')
    .sort({ createdAt: -1 })
    .limit(5);
  
  const recentDeposits = await Deposit.find({ userId })
    .populate('qrCodeId', 'name bankName')
    .sort({ createdAt: -1 })
    .limit(5);
  
  res.json({
    success: true,
    data: {
      betStats: betStats[0] || {
        totalBets: 0,
        totalAmount: 0,
        totalWinnings: 0,
        winningBets: 0,
        losingBets: 0
      },
      depositStats: depositStats[0] || {
        totalDeposits: 0,
        totalDepositAmount: 0,
        totalBonusAmount: 0
      },
      recentBets,
      recentDeposits
    }
  });
});

// Get favorite numbers
export const getFavoriteNumbers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('favoriteNumbers');
  
  res.json({
    success: true,
    data: user.favoriteNumbers || []
  });
});

// Update favorite numbers
export const updateFavoriteNumbers = asyncHandler(async (req, res) => {
  const { numbers } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { favoriteNumbers: numbers },
    { new: true, runValidators: true }
  ).select('favoriteNumbers');
  
  res.json({
    success: true,
    message: 'Favorite numbers updated successfully',
    data: user.favoriteNumbers
  });
});

// Update preferences
export const updatePreferences = asyncHandler(async (req, res) => {
  const { notifications, theme } = req.body;
  
  const updateData = {};
  if (notifications) updateData['preferences.notifications'] = notifications;
  if (theme) updateData['preferences.theme'] = theme;
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('preferences');
  
  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: user.preferences
  });
});




