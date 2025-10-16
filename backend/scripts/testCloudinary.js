import dotenv from 'dotenv';
import { v2 as cloudinaryV2 } from 'cloudinary';

dotenv.config();

const testCloudinary = async () => {
  console.log('🧪 Testing Cloudinary configuration...\n');
  
  // Check environment variables
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  console.log('📋 Environment Variables:');
  console.log('CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Set' : '❌ Missing');
  console.log('CLOUDINARY_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
  console.log('CLOUDINARY_API_SECRET:', apiSecret ? '✅ Set' : '❌ Missing');
  
  if (!cloudName || !apiKey || !apiSecret) {
    console.log('\n❌ Cloudinary configuration is incomplete!');
    console.log('Please update your .env file with:');
    console.log('CLOUDINARY_CLOUD_NAME=your-cloud-name');
    console.log('CLOUDINARY_API_KEY=your-api-key');
    console.log('CLOUDINARY_API_SECRET=your-api-secret');
    return;
  }
  
  // Configure Cloudinary
  cloudinaryV2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  
  try {
    // Test connection
    console.log('\n🔗 Testing Cloudinary connection...');
    const result = await cloudinaryV2.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
    
    // Test upload with a simple image
    console.log('\n📤 Testing image upload...');
    const uploadResult = await cloudinaryV2.uploader.upload(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      {
        folder: 'test',
        resource_type: 'auto'
      }
    );
    console.log('✅ Test upload successful:', uploadResult.public_id);
    
    // Clean up test image
    await cloudinaryV2.uploader.destroy(uploadResult.public_id);
    console.log('✅ Test image cleaned up');
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
  }
};

testCloudinary();



