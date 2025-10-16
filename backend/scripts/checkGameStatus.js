import mongoose from 'mongoose';
import Game from '../models/Game.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zuna-xosokeno';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected for checking game status');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log('👋 MongoDB disconnected');
};

const checkGameStatus = async () => {
  await connectDB();
  
  try {
    const now = new Date();
    console.log(`🕐 Current time: ${now.toLocaleString('vi-VN')}`);
    
    // Find all games
    const allGames = await Game.find({}).sort({ createdAt: -1 });
    console.log(`\n🔍 Found ${allGames.length} total games`);
    
    // Check each game
    for (const game of allGames) {
      console.log(`\n🎮 Game: ${game.title} (${game._id})`);
      console.log(`   Type: ${game.type}`);
      console.log(`   Status: ${game.status}`);
      console.log(`   isActive: ${game.isActive}`);
      console.log(`   Start Time: ${new Date(game.startTime).toLocaleString('vi-VN')}`);
      console.log(`   End Time: ${new Date(game.endTime).toLocaleString('vi-VN')}`);
      
      // Check if game should be active based on time
      const shouldBeActive = now >= game.startTime && now < game.endTime;
      const shouldBeCompleted = now >= game.endTime;
      
      console.log(`   Should be active: ${shouldBeActive}`);
      console.log(`   Should be completed: ${shouldBeCompleted}`);
      console.log(`   Has result: ${game.result ? game.result.length : 0} numbers`);
      
      // Check if status matches time
      if (game.status === 'active' && shouldBeCompleted) {
        console.log(`   ⚠️  WARNING: Game is active but should be completed!`);
      } else if (game.status === 'pending' && shouldBeActive) {
        console.log(`   ⚠️  WARNING: Game is pending but should be active!`);
      } else if (game.status === 'completed' && !shouldBeCompleted) {
        console.log(`   ⚠️  WARNING: Game is completed but shouldn't be!`);
      } else {
        console.log(`   ✅ Status matches time`);
      }
    }
    
    // Check for games that might be affected by cron
    const gamesToActivate = await Game.find({
      status: 'pending',
      startTime: { $lte: now },
      endTime: { $gt: now },
      isActive: true
    });
    
    const gamesToComplete = await Game.find({
      status: 'active',
      endTime: { $lte: now },
      isActive: true
    });
    
    console.log(`\n📊 Cron Job Analysis:`);
    console.log(`   Games to activate: ${gamesToActivate.length}`);
    console.log(`   Games to complete: ${gamesToComplete.length}`);
    
    if (gamesToActivate.length > 0) {
      console.log(`\n🎮 Games that will be activated by cron:`);
      gamesToActivate.forEach(game => {
        console.log(`   - ${game.title} (${game._id})`);
      });
    }
    
    if (gamesToComplete.length > 0) {
      console.log(`\n⏰ Games that will be completed by cron:`);
      gamesToComplete.forEach(game => {
        console.log(`   - ${game.title} (${game._id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking game status:', error);
  } finally {
    await disconnectDB();
  }
};

checkGameStatus();
