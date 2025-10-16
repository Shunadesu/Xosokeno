import Promotion from '../models/Promotion.js';
import { asyncHandler } from '../middleware/validation.js';
import { uploadSingleImage, deleteImage } from '../utils/cloudinary.js';

// Get all promotions
export const getPromotions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, isActive } = req.query;
  const skip = (page - 1) * limit;
  
  const filter = {};
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  const promotions = await Promotion.find(filter)
    .populate('createdBy', 'fullName email')
    .populate('updatedBy', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Promotion.countDocuments(filter);
  
  res.json({
    success: true,
    count: promotions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: promotions
  });
});

// Get promotion by ID
export const getPromotionById = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id)
    .populate('createdBy', 'fullName email')
    .populate('updatedBy', 'fullName email');
  
  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: 'Promotion not found'
    });
  }
  
  res.json({
    success: true,
    data: promotion
  });
});

// Create promotion
export const createPromotion = asyncHandler(async (req, res) => {
  const promotionData = { ...req.body };
  
  // Handle banner upload
  if (req.file) {
    const imageResult = await uploadSingleImage(req.file, 'promotions');
    promotionData.banner = imageResult;
  }
  
  // Set created by
  promotionData.createdBy = req.user._id;
  
  const promotion = await Promotion.create(promotionData);
  
  res.status(201).json({
    success: true,
    message: 'Promotion created successfully',
    data: promotion
  });
});

// Update promotion
export const updatePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id);
  
  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: 'Promotion not found'
    });
  }
  
  const updateData = { ...req.body };
  
  // Handle banner upload
  if (req.file) {
    // Delete old banner if exists
    if (promotion.banner?.public_id) {
      await deleteImage(promotion.banner.public_id);
    }
    
    const imageResult = await uploadSingleImage(req.file, 'promotions');
    updateData.banner = imageResult;
  }
  
  // Set updated by
  updateData.updatedBy = req.user._id;
  
  const updatedPromotion = await Promotion.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );
  
  res.json({
    success: true,
    message: 'Promotion updated successfully',
    data: updatedPromotion
  });
});

// Delete promotion
export const deletePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id);
  
  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: 'Promotion not found'
    });
  }
  
  // Delete banner from Cloudinary
  if (promotion.banner?.public_id) {
    await deleteImage(promotion.banner.public_id);
  }
  
  await Promotion.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Promotion deleted successfully'
  });
});

// Get active promotions
export const getActivePromotions = asyncHandler(async (req, res) => {
  const promotions = await Promotion.getActivePromotions();
  
  res.json({
    success: true,
    count: promotions.length,
    data: promotions
  });
});

// Get applicable promotions
export const getApplicablePromotions = asyncHandler(async (req, res) => {
  const { amount } = req.query;
  const amountNumber = parseInt(amount) || 0;
  
  const promotions = await Promotion.getApplicablePromotions(
    req.user._id,
    amountNumber,
    req.user.role
  );
  
  res.json({
    success: true,
    count: promotions.length,
    data: promotions
  });
});

// Increment promotion usage
export const incrementPromotionUsage = asyncHandler(async (req, res) => {
  const promotion = await Promotion.incrementUsage(req.params.id);
  
  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: 'Promotion not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Promotion usage incremented',
    data: promotion
  });
});

// Get promotion statistics
export const getPromotionStats = asyncHandler(async (req, res) => {
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
  
  const stats = await Promotion.getPromotionStats(start, end);
  
  res.json({
    success: true,
    data: {
      period: { startDate: start, endDate: end },
      statistics: stats
    }
  });
});





