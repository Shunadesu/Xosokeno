import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bet from '../models/Bet.js';
import Game from '../models/Game.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const testBetValidation = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zuna-xosokeno');
    console.log('✅ Connected to MongoDB');

    // Find a test user
    const testUser = await User.findOne({ email: 'test11@gmail.com' });
    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }
    console.log(`✅ Found test user: ${testUser.email}`);

    // Find an active game
    const activeGame = await Game.findOne({ status: 'active' });
    if (!activeGame) {
      console.log('❌ No active game found');
      return;
    }
    console.log(`✅ Found active game: ${activeGame.title}`);

    // Test 1: Keno bet with numbers (should work)
    console.log('\n🧪 Test 1: Keno bet with numbers');
    try {
      const kenoBet = new Bet({
        userId: testUser._id,
        gameId: activeGame._id,
        numbers: [1, 5, 10, 15, 20],
        betType: 'keno',
        amount: 10000,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      
      await kenoBet.save();
      console.log('✅ Keno bet created successfully');
      
      // Clean up
      await Bet.findByIdAndDelete(kenoBet._id);
    } catch (error) {
      console.log('❌ Keno bet failed:', error.message);
    }

    // Test 2: Big bet without numbers (should work)
    console.log('\n🧪 Test 2: Big bet without numbers');
    try {
      const bigBet = new Bet({
        userId: testUser._id,
        gameId: activeGame._id,
        numbers: [], // Empty array for Big/Small game
        betType: 'big',
        amount: 10000,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      
      await bigBet.save();
      console.log('✅ Big bet created successfully');
      
      // Clean up
      await Bet.findByIdAndDelete(bigBet._id);
    } catch (error) {
      console.log('❌ Big bet failed:', error.message);
    }

    // Test 3: Small bet without numbers (should work)
    console.log('\n🧪 Test 3: Small bet without numbers');
    try {
      const smallBet = new Bet({
        userId: testUser._id,
        gameId: activeGame._id,
        numbers: [], // Empty array for Big/Small game
        betType: 'small',
        amount: 10000,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      
      await smallBet.save();
      console.log('✅ Small bet created successfully');
      
      // Clean up
      await Bet.findByIdAndDelete(smallBet._id);
    } catch (error) {
      console.log('❌ Small bet failed:', error.message);
    }

    // Test 4: Even bet without numbers (should work)
    console.log('\n🧪 Test 4: Even bet without numbers');
    try {
      const evenBet = new Bet({
        userId: testUser._id,
        gameId: activeGame._id,
        numbers: [], // Empty array for Even/Odd game
        betType: 'even',
        amount: 10000,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      
      await evenBet.save();
      console.log('✅ Even bet created successfully');
      
      // Clean up
      await Bet.findByIdAndDelete(evenBet._id);
    } catch (error) {
      console.log('❌ Even bet failed:', error.message);
    }

    // Test 5: Keno bet without numbers (should fail)
    console.log('\n🧪 Test 5: Keno bet without numbers (should fail)');
    try {
      const invalidKenoBet = new Bet({
        userId: testUser._id,
        gameId: activeGame._id,
        numbers: [], // Empty array for Keno should fail
        betType: 'keno',
        amount: 10000,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      
      await invalidKenoBet.save();
      console.log('❌ Keno bet without numbers should have failed but succeeded');
      
      // Clean up
      await Bet.findByIdAndDelete(invalidKenoBet._id);
    } catch (error) {
      console.log('✅ Keno bet without numbers correctly failed:', error.message);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
testBetValidation();
