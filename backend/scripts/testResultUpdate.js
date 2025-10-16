import mongoose from 'mongoose';
import Game from '../models/Game.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zuna-xosokeno';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected for testing result update');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log('👋 MongoDB disconnected');
};

const testResultUpdate = async () => {
  await connectDB();
  
  try {
    // Find all completed games
    const completedGames = await Game.find({ status: 'completed' });
    console.log(`🔍 Found ${completedGames.length} completed games`);
    
    for (const game of completedGames) {
      console.log(`\n🎮 Game: ${game.title} (${game._id})`);
      console.log(`   Type: ${game.type}`);
      console.log(`   Status: ${game.status}`);
      console.log(`   Has Result: ${game.result ? 'Yes' : 'No'}`);
      if (game.result) {
        console.log(`   Result Length: ${game.result.length}`);
        console.log(`   Result: [${game.result.slice(0, 5).join(', ')}${game.result.length > 5 ? '...' : ''}]`);
      }
    }
    
    // Find games without results
    const gamesWithoutResults = await Game.find({
      status: 'completed',
      $or: [
        { result: { $exists: false } },
        { result: { $size: 0 } }
      ]
    });
    
    console.log(`\n❌ Found ${gamesWithoutResults.length} completed games WITHOUT results:`);
    for (const game of gamesWithoutResults) {
      console.log(`   - ${game.title} (${game._id}) - ${game.type}`);
    }
    
    // Test updating a game with result
    if (gamesWithoutResults.length > 0) {
      const testGame = gamesWithoutResults[0];
      console.log(`\n🧪 Testing result update for: ${testGame.title}`);
      
      // Generate test result
      let result = [];
      if (testGame.type === 'keno' || testGame.type === 'big-small' || testGame.type === 'even-odd') {
        const numbers = Array.from({ length: 80 }, (_, i) => i + 1);
        for (let i = 0; i < 20; i++) {
          const randomIndex = Math.floor(Math.random() * numbers.length);
          result.push(numbers.splice(randomIndex, 1)[0]);
        }
      } else {
        const numbers = Array.from({ length: 80 }, (_, i) => i + 1);
        for (let i = 0; i < 10; i++) {
          const randomIndex = Math.floor(Math.random() * numbers.length);
          result.push(numbers.splice(randomIndex, 1)[0]);
        }
      }
      
      // Update game with result
      const updatedGame = await Game.findByIdAndUpdate(
        testGame._id,
        { result: result },
        { new: true }
      );
      
      console.log(`✅ Updated game with result: [${result.slice(0, 5).join(', ')}...]`);
      console.log(`   New result length: ${updatedGame.result.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing result update:', error);
  } finally {
    await disconnectDB();
  }
};

testResultUpdate();
