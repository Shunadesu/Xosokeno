import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Game from './models/Game.js';
import QRCode from './models/QRCode.js';
import Banner from './models/Banner.js';
import Promotion from './models/Promotion.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zuna-xosokeno', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Game.deleteMany({});
    await QRCode.deleteMany({});
    await Banner.deleteMany({});
    await Promotion.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create super admin user
    const superAdmin = await User.create({
      email: 'admin@zuna-xosokeno.com',
      phone: '0123456789',
      password: 'admin123',
      fullName: 'Super Admin',
      role: 'super_admin',
      balance: 10000000,
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true
    });

    console.log('👑 Created super admin user');

    // Create regular admin user
    const admin = await User.create({
      email: 'admin2@zuna-xosokeno.com',
      phone: '0123456790',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'admin',
      balance: 5000000,
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true
    });

    console.log('👨‍💼 Created admin user');

    // Create test users
    const testUsers = await User.create([
      {
        email: 'user1@test.com',
        phone: '0123456791',
        password: 'user123',
        fullName: 'Test User 1',
        role: 'user',
        balance: 100000,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true
      },
      {
        email: 'user2@test.com',
        phone: '0123456792',
        password: 'user123',
        fullName: 'Test User 2',
        role: 'user',
        balance: 50000,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true
      }
    ]);

    console.log('👥 Created test users');

    // Create QR codes
    const qrCodes = await QRCode.create([
      {
        name: 'Vietcombank - Nguyễn Văn A',
        bankName: 'Vietcombank',
        accountNumber: '1234567890',
        accountHolder: 'Nguyễn Văn A',
        qrImage: {
          public_id: 'sample_qr_1',
          url: 'https://res.cloudinary.com/sample/image/upload/v1234567890/qr_codes/sample_qr_1.jpg',
          width: 300,
          height: 300,
          format: 'jpg'
        },
        minAmount: 10000,
        maxAmount: 5000000,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        name: 'Techcombank - Trần Thị B',
        bankName: 'Techcombank',
        accountNumber: '0987654321',
        accountHolder: 'Trần Thị B',
        qrImage: {
          public_id: 'sample_qr_2',
          url: 'https://res.cloudinary.com/sample/image/upload/v1234567890/qr_codes/sample_qr_2.jpg',
          width: 300,
          height: 300,
          format: 'jpg'
        },
        minAmount: 5000,
        maxAmount: 10000000,
        isActive: true,
        createdBy: superAdmin._id
      }
    ]);

    console.log('💳 Created QR codes');

    // Create banners
    const banners = await Banner.create([
      {
        title: 'Kỷ niệm 14 năm thành lập',
        description: 'Sự kiện đặc biệt với phần thưởng cao hơn',
        type: 'event',
        gameType: 'anniversary',
        image: {
          public_id: 'banner_anniversary',
          url: 'https://res.cloudinary.com/sample/image/upload/v1234567890/banners/banner_anniversary.jpg',
          width: 800,
          height: 400,
          format: 'jpg'
        },
        position: 1,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        buttonText: 'Tham gia ngay',
        link: '/games/anniversary',
        createdBy: superAdmin._id
      },
      {
        title: 'Keno Big/Small/Even/Odd',
        description: 'Cách chơi mới với tỷ lệ thắng cao',
        type: 'game',
        gameType: 'big-small',
        image: {
          public_id: 'banner_big_small',
          url: 'https://res.cloudinary.com/sample/image/upload/v1234567890/banners/banner_big_small.jpg',
          width: 800,
          height: 400,
          format: 'jpg'
        },
        position: 2,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        buttonText: 'Chơi ngay',
        link: '/games/big-small',
        createdBy: superAdmin._id
      },
      {
        title: 'Keno Xổ số tự chọn',
        description: 'Tự chọn số may mắn của bạn',
        type: 'game',
        gameType: 'keno',
        image: {
          public_id: 'banner_keno',
          url: 'https://res.cloudinary.com/sample/image/upload/v1234567890/banners/banner_keno.jpg',
          width: 800,
          height: 400,
          format: 'jpg'
        },
        position: 3,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        buttonText: 'Chọn số',
        link: '/games/keno',
        createdBy: superAdmin._id
      },
      {
        title: 'Giờ hoàng đạo',
        description: 'Khung giờ đặc biệt với tỷ lệ thắng cao hơn',
        type: 'game',
        gameType: 'special',
        image: {
          public_id: 'banner_special',
          url: 'https://res.cloudinary.com/sample/image/upload/v1234567890/banners/banner_special.jpg',
          width: 800,
          height: 400,
          format: 'jpg'
        },
        position: 4,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        buttonText: 'Tham gia',
        link: '/games/special',
        createdBy: superAdmin._id
      }
    ]);

    console.log('🖼️ Created banners');

    // Create promotions
    const promotions = await Promotion.create([
      {
        name: 'Khuyến mãi nạp tiền lần đầu',
        description: 'Thưởng 20% cho lần nạp tiền đầu tiên',
        type: 'first_deposit',
        condition: {
          minAmount: 10000,
          maxAmount: 1000000
        },
        reward: {
          type: 'percentage',
          value: 20,
          maxReward: 200000
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        maxUsage: -1, // unlimited
        maxUsagePerUser: 1,
        isActive: true,
        isAutoApply: true,
        priority: 100,
        createdBy: superAdmin._id
      },
      {
        name: 'Khuyến mãi giờ vàng',
        description: 'Thưởng 10% cho nạp tiền vào giờ vàng (8:00-18:00)',
        type: 'daily',
        condition: {
          minAmount: 50000,
          maxAmount: 5000000,
          timeRange: {
            startTime: '08:00',
            endTime: '18:00'
          }
        },
        reward: {
          type: 'percentage',
          value: 10,
          maxReward: 100000
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        maxUsage: -1, // unlimited
        maxUsagePerUser: 3,
        isActive: true,
        isAutoApply: true,
        priority: 80,
        createdBy: superAdmin._id
      }
    ]);

    console.log('🎁 Created promotions');

    // Create sample games
    const now = new Date();
    const games = await Game.create([
      {
        type: 'keno',
        title: 'Keno Xổ số tự chọn',
        description: 'Chọn số may mắn từ 1-80',
        startTime: new Date(now.getTime() + 5 * 60 * 1000), // 5 minutes from now
        endTime: new Date(now.getTime() + 10 * 60 * 1000), // 10 minutes from now
        status: 'pending',
        maxNumbers: 20,
        minBetAmount: 1000,
        maxBetAmount: 1000000,
        payoutRates: new Map([
          [1, 1.0],
          [2, 2.0],
          [3, 5.0],
          [4, 10.0],
          [5, 20.0],
          [6, 50.0],
          [7, 100.0],
          [8, 200.0],
          [9, 500.0],
          [10, 1000.0]
        ]),
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        type: 'big-small',
        title: 'Keno Big/Small',
        description: 'Đoán số lớn (11-20) hoặc nhỏ (1-10)',
        startTime: new Date(now.getTime() + 15 * 60 * 1000), // 15 minutes from now
        endTime: new Date(now.getTime() + 20 * 60 * 1000), // 20 minutes from now
        status: 'pending',
        minBetAmount: 1000,
        maxBetAmount: 1000000,
        payoutRates: new Map([
          [1, 1.0] // 1:1 payout for big/small
        ]),
        isActive: true,
        createdBy: superAdmin._id
      }
    ]);

    console.log('🎮 Created sample games');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Super Admin: ${superAdmin.email}`);
    console.log(`- Admin: ${admin.email}`);
    console.log(`- Test Users: ${testUsers.length}`);
    console.log(`- QR Codes: ${qrCodes.length}`);
    console.log(`- Banners: ${banners.length}`);
    console.log(`- Promotions: ${promotions.length}`);
    console.log(`- Games: ${games.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding
seedData();





