import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Game from '../models/Game.js';

dotenv.config();

const gameTemplates = [
  {
    type: 'keno',
    title: 'Keno Tự chọn',
    description: 'Chọn số từ 1-80, hệ thống sẽ quay 20 số ngẫu nhiên',
    maxNumbers: 10,
    minBetAmount: 1000,
    maxBetAmount: 1000000,
    payoutRates: new Map([
      ['1', 1.0],
      ['2', 2.0],
      ['3', 5.0],
      ['4', 10.0],
      ['5', 20.0],
      ['6', 50.0],
      ['7', 100.0],
      ['8', 200.0],
      ['9', 500.0],
      ['10', 1000.0]
    ]),
    startTime: new Date(),
    endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 năm sau
    isActive: true,
    createdBy: new mongoose.Types.ObjectId() // Sẽ được cập nhật sau
  },
  {
    type: 'big-small',
    title: 'Big/Small',
    description: 'Đoán tổng 20 số > 810 (Big) hoặc < 810 (Small)',
    maxNumbers: 20,
    minBetAmount: 1000,
    maxBetAmount: 1000000,
    payoutRates: new Map([
      ['big', 1.95],
      ['small', 1.95]
    ]),
    startTime: new Date(),
    endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 năm sau
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    type: 'even-odd',
    title: 'Even/Odd',
    description: 'Đoán tổng 20 số là chẵn (Even) hoặc lẻ (Odd)',
    maxNumbers: 20,
    minBetAmount: 1000,
    maxBetAmount: 1000000,
    payoutRates: new Map([
      ['even', 1.95],
      ['odd', 1.95]
    ]),
    startTime: new Date(),
    endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 năm sau
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  }
];

const seedGameTemplates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zuna-xosokeno');
    console.log('✅ MongoDB connected successfully');

    // Xóa các game template cũ
    await Game.deleteMany({ type: { $in: ['keno', 'big-small', 'even-odd'] } });
    console.log('🗑️ Old game templates deleted');

    // Tạo game templates mới
    const createdTemplates = await Game.insertMany(gameTemplates);
    console.log(`🎮 Created ${createdTemplates.length} game templates:`);
    
    createdTemplates.forEach(template => {
      console.log(`  - ${template.title} (${template.type})`);
    });

    console.log('\n🎉 Game templates seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding game templates:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected.');
    process.exit(0);
  }
};

seedGameTemplates();
