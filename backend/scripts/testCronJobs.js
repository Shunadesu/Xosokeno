import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Game from '../models/Game.js';
import Bet from '../models/Bet.js';
import User from '../models/User.js';
import { processGameManually } from '../services/cronService.js';

// Load environment variables
dotenv.config();

const testCronJobs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zuna-xosokeno');
    console.log('✅ Connected to MongoDB');

    // Create a test game that should be active now
    const now = new Date();
    const startTime = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    const endTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

    console.log('🎮 Creating test game...');
    const testGame = await Game.create({
      type: 'keno',
      title: 'Test Keno Game',
      description: 'Test game for cron jobs',
      startTime,
      endTime,
      status: 'active',
      maxNumbers: 20,
      minBetAmount: 1000,
      maxBetAmount: 1000000,
      payoutRates: new Map([
        ['1', 1.0],
        ['2', 2.0],
        ['3', 5.0],
        ['4', 10.0],
        ['5', 20.0]
      ]),
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    });

    console.log(`✅ Created test game: ${testGame._id}`);

    // Create a test user
    const testUser = await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '0123456789',
      password: 'hashedpassword',
      balance: 100000,
      isActive: true
    });

    console.log(`✅ Created test user: ${testUser._id}`);

    // Create a test bet
    const testBet = await Bet.create({
      userId: testUser._id,
      gameId: testGame._id,
      numbers: [1, 5, 10, 15, 20],
      betType: 'keno',
      amount: 10000,
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent'
    });

    console.log(`✅ Created test bet: ${testBet._id}`);

    // Generate result for the game
    console.log('🎲 Generating game result...');
    const numbers = Array.from({ length: 80 }, (_, i) => i + 1);
    const result = [];
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      result.push(numbers.splice(randomIndex, 1)[0]);
    }

    testGame.result = result;
    testGame.status = 'completed';
    await testGame.save();

    console.log(`✅ Game result: [${result.join(', ')}]`);

    // Process the game manually
    console.log('🔄 Processing game manually...');
    const processResult = await processGameManually(testGame._id);
    
    if (processResult.success) {
      console.log('✅ Game processed successfully');
    } else {
      console.log('❌ Game processing failed:', processResult.message);
    }

    // Check the bet result
    const updatedBet = await Bet.findById(testBet._id);
    console.log(`📊 Bet result:`, {
      status: updatedBet.status,
      matchedNumbers: updatedBet.matchedNumbers,
      matchedCount: updatedBet.matchedCount,
      winAmount: updatedBet.winAmount
    });

    // Check user balance
    const updatedUser = await User.findById(testUser._id);
    console.log(`💰 User balance: ${updatedUser.balance} VND`);

    // Check game stats
    const updatedGame = await Game.findById(testGame._id);
    console.log(`📈 Game stats:`, {
      totalBets: updatedGame.totalBets,
      totalAmount: updatedGame.totalAmount,
      totalWinnings: updatedGame.totalWinnings
    });

    // Clean up
    console.log('🧹 Cleaning up test data...');
    await Bet.findByIdAndDelete(testBet._id);
    await User.findByIdAndDelete(testUser._id);
    await Game.findByIdAndDelete(testGame._id);

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
testCronJobs();
