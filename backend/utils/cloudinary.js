import cloudinary from 'cloudinary';
import { v2 as cloudinaryV2 } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate Cloudinary configuration
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration missing!');
  console.error('Required environment variables:');
  console.error('CLOUDINARY_CLOUD_NAME:', cloudName ? '✅' : '❌');
  console.error('CLOUDINARY_API_KEY:', apiKey ? '✅' : '❌');
  console.error('CLOUDINARY_API_SECRET:', apiSecret ? '✅' : '❌');
  throw new Error('Cloudinary configuration is incomplete');
}

// Configure Cloudinary
cloudinaryV2.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

console.log('✅ Cloudinary configured successfully');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

// Upload single image to Cloudinary
export const uploadSingleImage = async (file, folder = 'zuna-xosokeno') => {
  try {
    console.log('📤 Uploading image to Cloudinary:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      folder: folder
    });

    if (!file.buffer) {
      throw new Error('File buffer is missing');
    }

    const result = await cloudinaryV2.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        folder,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      }
    );

    console.log('✅ Upload successful:', result.public_id);

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

// Upload multiple images to Cloudinary
export const uploadMultipleImages = async (files, folder = 'zuna-xosokeno') => {
  try {
    const uploadPromises = files.map(file => uploadSingleImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinaryV2.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

// Delete multiple images from Cloudinary
export const deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinaryV2.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete images: ${error.message}`);
  }
};

// Generate image URL with transformations
export const generateImageUrl = (publicId, transformations = {}) => {
  return cloudinaryV2.url(publicId, {
    ...transformations,
    secure: true
  });
};

// Upload image with specific transformations
export const uploadImageWithTransformations = async (file, folder, transformations = {}) => {
  try {
    const result = await cloudinaryV2.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        folder,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' },
          ...transformations
        ]
      }
    );

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    throw new Error(`Failed to upload image with transformations: ${error.message}`);
  }
};

// Generate responsive image URLs
export const generateResponsiveUrls = (publicId, baseTransformations = {}) => {
  const sizes = [
    { width: 320, height: 240, suffix: 'sm' },
    { width: 640, height: 480, suffix: 'md' },
    { width: 1024, height: 768, suffix: 'lg' },
    { width: 1920, height: 1080, suffix: 'xl' }
  ];

  const urls = {};
  
  sizes.forEach(size => {
    urls[size.suffix] = cloudinaryV2.url(publicId, {
      ...baseTransformations,
      width: size.width,
      height: size.height,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
      secure: true
    });
  });

  return urls;
};

// Optimize image for web
export const optimizeForWeb = (publicId, width, height) => {
  return cloudinaryV2.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
    secure: true
  });
};

// Create thumbnail
export const createThumbnail = (publicId, size = 150) => {
  return cloudinaryV2.url(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
    secure: true
  });
};

export { upload };
export default cloudinaryV2;

