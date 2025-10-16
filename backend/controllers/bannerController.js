import Banner from '../models/Banner.js';
import { asyncHandler } from '../middleware/validation.js';
import { uploadSingleImage, deleteImage } from '../utils/cloudinary.js';

// Get all banners
export const getBanners = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, isActive } = req.query;
  const skip = (page - 1) * limit;
  
  const filter = {};
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  const banners = await Banner.find(filter)
    .populate('createdBy', 'fullName email')
    .populate('updatedBy', 'fullName email')
    .sort({ position: 1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Banner.countDocuments(filter);

  res.json({
    success: true,
    count: banners.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: banners
  });
});

// Get banner by ID
export const getBannerById = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id)
    .populate('createdBy', 'fullName email')
    .populate('updatedBy', 'fullName email');

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: 'Banner not found'
    });
  }

  res.json({
    success: true,
    data: banner
  });
});

// Create banner
export const createBanner = asyncHandler(async (req, res) => {
  const bannerData = { ...req.body };
  
  // Handle image upload
  if (req.file) {
    const imageResult = await uploadSingleImage(req.file, 'banners');
    bannerData.image = imageResult;
  }

  // Set created by
  bannerData.createdBy = req.user._id;

  const banner = await Banner.create(bannerData);

  res.status(201).json({
    success: true,
    message: 'Banner created successfully',
    data: banner
  });
});

// Update banner
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: 'Banner not found'
    });
  }

  const updateData = { ...req.body };
  
  // Handle image upload
  if (req.file) {
    // Delete old image if exists
    if (banner.image.public_id) {
      await deleteImage(banner.image.public_id);
    }
    
    const imageResult = await uploadSingleImage(req.file, 'banners');
    updateData.image = imageResult;
  }

  // Set updated by
  updateData.updatedBy = req.user._id;

  const updatedBanner = await Banner.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Banner updated successfully',
    data: updatedBanner
  });
});

// Delete banner
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: 'Banner not found'
    });
  }

  // Delete image from Cloudinary
  if (banner.image.public_id) {
    await deleteImage(banner.image.public_id);
  }

  await Banner.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Banner deleted successfully'
  });
});

// Increment view count
export const incrementViewCount = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1 } },
    { new: true }
  );

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: 'Banner not found'
    });
  }

  res.json({
    success: true,
    message: 'View count incremented',
    data: { viewCount: banner.viewCount }
  });
});

// Increment click count
export const incrementClickCount = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(
    req.params.id,
    { $inc: { clickCount: 1 } },
    { new: true }
  );

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: 'Banner not found'
    });
  }

  res.json({
    success: true,
    message: 'Click count incremented',
    data: { clickCount: banner.clickCount }
  });
});

// Get banners by type
export const getBannersByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  
  const banners = await Banner.getBannersByType(type)
    .populate('createdBy', 'fullName email');

  res.json({
    success: true,
    count: banners.length,
    data: banners
  });
});

// Get game banners
export const getGameBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.getGameBanners()
    .populate('createdBy', 'fullName email');

  res.json({
    success: true,
    count: banners.length,
    data: banners
  });
});

