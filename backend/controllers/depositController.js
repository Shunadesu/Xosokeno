import Deposit from '../models/Deposit.js';
import QRCode from '../models/QRCode.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/validation.js';
import { uploadSingleImage } from '../utils/cloudinary.js';

// Get user deposits
export const getDeposits = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search, userId } = req.query;
  const skip = (page - 1) * limit;
  
  // For admin, don't filter by userId unless specified
  const filter = {};
  if (req.user.role === 'user') {
    filter.userId = req.user._id;
  } else if (userId) {
    // Admin can filter by specific userId
    filter.userId = userId;
  }
  if (status) filter.status = status;
  
  // Search filter
  if (search && search.trim()) {
    filter.$or = [
      { note: { $regex: search.trim(), $options: 'i' } }
    ];
  }
  
  const deposits = await Deposit.find(filter)
    .populate('userId', 'fullName email phone')
    .populate('qrCodeId', 'name bankName accountNumber')
    .populate('promotionApplied', 'name type reward')
    .populate('confirmedBy', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Deposit.countDocuments(filter);
  
  res.json({
    success: true,
    count: deposits.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: deposits
  });
});

// Get deposit by ID
export const getDepositById = asyncHandler(async (req, res) => {
  const deposit = await Deposit.findById(req.params.id)
    .populate('qrCodeId', 'name bankName accountNumber')
    .populate('promotionApplied', 'name type reward')
    .populate('confirmedBy', 'fullName email');
  
  if (!deposit) {
    return res.status(404).json({
      success: false,
      message: 'Deposit not found'
    });
  }
  
  // Check if user owns this deposit or is admin
  if (deposit.userId.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this deposit'
    });
  }
  
  res.json({
    success: true,
    data: deposit
  });
});

// Create deposit
export const createDeposit = asyncHandler(async (req, res) => {
  const { amount, method, qrCodeId, note } = req.body;
  
  // Validate QR code if method is qr_code
  if (method === 'qr_code' && qrCodeId) {
    const qrCode = await QRCode.findById(qrCodeId);
    if (!qrCode || !qrCode.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code'
      });
    }
    
    if (amount < qrCode.minAmount || amount > qrCode.maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Amount must be between ${qrCode.minAmount} and ${qrCode.maxAmount}`
      });
    }
  }
  
  const depositData = {
    userId: req.user._id,
    amount,
    method,
    note,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  };
  
  if (qrCodeId) {
    depositData.qrCodeId = qrCodeId;
  }
  
  // Handle transaction image upload
  if (req.file) {
    const imageResult = await uploadSingleImage(req.file, 'deposits');
    depositData.transactionImage = imageResult;
  }
  
  const deposit = await Deposit.create(depositData);
  
  res.status(201).json({
    success: true,
    message: 'Deposit request created successfully',
    data: deposit
  });
});

// Update deposit status (Admin only)
export const updateDepositStatus = asyncHandler(async (req, res) => {
  const { status, adminNote, rejectionReason } = req.body;
  
  const deposit = await Deposit.findById(req.params.id);
  
  if (!deposit) {
    return res.status(404).json({
      success: false,
      message: 'Deposit not found'
    });
  }
  
  const updateData = {
    status,
    confirmedBy: req.user._id,
    confirmedAt: new Date(),
    processedAt: new Date()
  };
  
  if (adminNote) updateData.adminNote = adminNote;
  if (rejectionReason) updateData.rejectionReason = rejectionReason;
  
  const updatedDeposit = await Deposit.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );
  
  // If confirmed, add money to user balance
  if (status === 'confirmed') {
    await User.findByIdAndUpdate(deposit.userId, {
      $inc: { balance: deposit.amount }
    });
  }
  
  res.json({
    success: true,
    message: 'Deposit status updated successfully',
    data: updatedDeposit
  });
});

// Get pending deposits (Admin only)
export const getPendingDeposits = asyncHandler(async (req, res) => {
  const deposits = await Deposit.getPendingDeposits();
  
  res.json({
    success: true,
    count: deposits.length,
    data: deposits
  });
});

// Get deposits by status (Admin only)
export const getDepositsByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const { limit = 50 } = req.query;
  
  const deposits = await Deposit.getDepositsByStatus(status, parseInt(limit));
  
  res.json({
    success: true,
    count: deposits.length,
    data: deposits
  });
});

// Get deposit statistics (Admin only)
export const getDepositStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let start, end;
  
  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    // Default to last 30 days
    end = new Date();
    start = new Date();
    start.setDate(start.getDate() - 30);
  }
  
  const stats = await Deposit.getDepositStats(start, end);
  
  res.json({
    success: true,
    data: {
      period: { startDate: start, endDate: end },
      statistics: stats
    }
  });
});

// Get daily deposit summary (Admin only)
export const getDailyDepositSummary = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  
  const summary = await Deposit.getDailyDepositSummary(parseInt(days));
  
  res.json({
    success: true,
    data: summary
  });
});

// Confirm deposit (Admin only)
export const confirmDeposit = asyncHandler(async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);
  
  if (!deposit) {
    return res.status(404).json({
      success: false,
      message: 'Deposit not found'
    });
  }
  
  if (deposit.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Deposit is not pending'
    });
  }
  
  // Update deposit status
  deposit.status = 'confirmed';
  deposit.confirmedBy = req.user._id;
  deposit.confirmedAt = new Date();
  deposit.processedAt = new Date();
  await deposit.save();
  
  // Add money to user balance
  await User.findByIdAndUpdate(deposit.userId, {
    $inc: { balance: deposit.amount }
  });
  
  res.json({
    success: true,
    message: 'Deposit confirmed successfully',
    data: deposit
  });
});

// Reject deposit (Admin only)
export const rejectDeposit = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const deposit = await Deposit.findById(req.params.id);
  
  if (!deposit) {
    return res.status(404).json({
      success: false,
      message: 'Deposit not found'
    });
  }
  
  if (deposit.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Deposit is not pending'
    });
  }
  
  // Update deposit status
  deposit.status = 'rejected';
  deposit.rejectionReason = reason;
  deposit.confirmedBy = req.user._id;
  deposit.confirmedAt = new Date();
  deposit.processedAt = new Date();
  await deposit.save();
  
  res.json({
    success: true,
    message: 'Deposit rejected successfully',
    data: deposit
  });
});



