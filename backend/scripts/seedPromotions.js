import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Promotion from '../models/Promotion.js';
import User from '../models/User.js';

dotenv.config();

const seedPromotions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zuna-xosokeno');
    console.log('✅ Connected to MongoDB');

    // Find admin user to set as creator
    const adminUser = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    if (!adminUser) {
      console.log('❌ No admin user found. Please create admin first.');
      return;
    }

    // Check if first deposit promotion already exists
    const existingPromotion = await Promotion.findOne({ type: 'first_deposit' });
    if (existingPromotion) {
      console.log('✅ First deposit promotion already exists');
      return;
    }

    // Create first deposit promotion
    const firstDepositPromotion = await Promotion.create({
      name: 'Khuyến mãi nạp tiền lần đầu',
      description: 'Tặng 50% giá trị nạp cho lần nạp tiền đầu tiên',
      type: 'first_deposit',
      condition: {
        minAmount: 10000, // Tối thiểu 10,000 VNĐ
        maxAmount: 1000000, // Tối đa 1,000,000 VNĐ
        userRoles: ['user']
      },
      reward: {
        type: 'percentage',
        value: 50, // 50%
        maxReward: 500000 // Tối đa 500,000 VNĐ
      },
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 năm
      maxUsage: -1, // Không giới hạn
      currentUsage: 0,
      maxUsagePerUser: 1, // Mỗi user chỉ được 1 lần
      isActive: true,
      isAutoApply: true,
      priority: 100,
      terms: 'Khuyến mãi chỉ áp dụng cho lần nạp tiền đầu tiên của mỗi tài khoản. Số tiền thưởng tối đa 500,000 VNĐ.',
      createdBy: adminUser._id
    });

    console.log('✅ Created first deposit promotion:', firstDepositPromotion.name);
    console.log('   - Tặng 50% giá trị nạp');
    console.log('   - Tối thiểu: 10,000 VNĐ');
    console.log('   - Tối đa: 1,000,000 VNĐ');
    console.log('   - Thưởng tối đa: 500,000 VNĐ');
    console.log('   - Mỗi user chỉ được 1 lần');

  } catch (error) {
    console.error('❌ Error seeding promotions:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

seedPromotions();


