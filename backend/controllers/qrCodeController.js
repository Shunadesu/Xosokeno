import QRCode from '../models/QRCode.js';
import { asyncHandler } from '../middleware/validation.js';
import { uploadSingleImage, deleteImage } from '../utils/cloudinary.js';

// Get all QR codes (for users and admin)
export const getQRCodes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  // Check if user is admin
  const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');

  let query = {};
  let populateFields = [];

  if (isAdmin) {
    // Admin can see all QR codes with full details
    populateFields = [
      { path: 'createdBy', select: 'fullName email' },
      { path: 'updatedBy', select: 'fullName email' }
    ];
  } else {
    // Regular users can only see active QR codes without sensitive info
    query = { isActive: true };
    populateFields = [
      { path: 'createdBy', select: 'fullName' }
    ];
  }

  const qrCodes = await QRCode.find(query)
    .populate(populateFields)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await QRCode.countDocuments(query);

  res.json({
    success: true,
    count: qrCodes.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: qrCodes
  });
});

// Get QR code by ID
export const getQRCodeById = asyncHandler(async (req, res) => {
  const qrCode = await QRCode.findById(req.params.id)
    .populate('createdBy', 'fullName email')
    .populate('updatedBy', 'fullName email');

  if (!qrCode) {
    return res.status(404).json({
      success: false,
      message: 'QR Code not found'
    });
  }

  res.json({
    success: true,
    data: qrCode
  });
});

// Create QR code
export const createQRCode = asyncHandler(async (req, res) => {
  const qrCodeData = { ...req.body };
  
  // Handle QR image upload
  if (req.file) {
    const imageResult = await uploadSingleImage(req.file, 'qr-codes');
    qrCodeData.qrImage = imageResult;
  }

  // Set created by
  qrCodeData.createdBy = req.user._id;

  const qrCode = await QRCode.create(qrCodeData);

  res.status(201).json({
    success: true,
    message: 'QR Code created successfully',
    data: qrCode
  });
});

// Update QR code
export const updateQRCode = asyncHandler(async (req, res) => {
  const qrCode = await QRCode.findById(req.params.id);

  if (!qrCode) {
    return res.status(404).json({
      success: false,
      message: 'QR Code not found'
    });
  }

  const updateData = { ...req.body };
  
  // Handle QR image upload
  if (req.file) {
    // Delete old image if exists
    if (qrCode.qrImage.public_id) {
      await deleteImage(qrCode.qrImage.public_id);
    }
    
    const imageResult = await uploadSingleImage(req.file, 'qr-codes');
    updateData.qrImage = imageResult;
  }

  // Set updated by
  updateData.updatedBy = req.user._id;

  const updatedQRCode = await QRCode.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'QR Code updated successfully',
    data: updatedQRCode
  });
});

// Delete QR code
export const deleteQRCode = asyncHandler(async (req, res) => {
  const qrCode = await QRCode.findById(req.params.id);

  if (!qrCode) {
    return res.status(404).json({
      success: false,
      message: 'QR Code not found'
    });
  }

  // Delete image from Cloudinary
  if (qrCode.qrImage.public_id) {
    await deleteImage(qrCode.qrImage.public_id);
  }

  await QRCode.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'QR Code deleted successfully'
  });
});

// Get active QR codes
export const getActiveQRCodes = asyncHandler(async (req, res) => {
  const qrCodes = await QRCode.getActiveQRCodes();

  res.json({
    success: true,
    count: qrCodes.length,
    data: qrCodes
  });
});

// Get QR codes by amount range
export const getQRCodesByAmount = asyncHandler(async (req, res) => {
  const { amount } = req.params;
  const amountNumber = parseInt(amount);

  if (isNaN(amountNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid amount'
    });
  }

  const qrCodes = await QRCode.getQRCodesByAmount(amountNumber);

  res.json({
    success: true,
    count: qrCodes.length,
    data: qrCodes
  });
});

// Increment usage
export const incrementUsage = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid amount is required'
    });
  }

  const qrCode = await QRCode.incrementUsage(req.params.id, amount);

  if (!qrCode) {
    return res.status(404).json({
      success: false,
      message: 'QR Code not found'
    });
  }

  res.json({
    success: true,
    message: 'Usage incremented successfully',
    data: qrCode
  });
});

// Get usage statistics
export const getUsageStats = asyncHandler(async (req, res) => {
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

  const stats = await QRCode.getUsageStats(start, end);

  res.json({
    success: true,
    data: {
      period: { startDate: start, endDate: end },
      statistics: stats
    }
  });
});



