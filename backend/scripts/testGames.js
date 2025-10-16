import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Game from '../models/Game.js';

dotenv.config();

const testGames = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zuna-xosokeno');
    console.log('✅ MongoDB connected successfully');

    // Count total games
    const totalGames = await Game.countDocuments();
    console.log(`📊 Total games in database: ${totalGames}`);

    // Get all games
    const games = await Game.find().sort({ createdAt: -1 }).limit(5);
    console.log('\n🎮 Recent games:');
    games.forEach((game, index) => {
      console.log(`${index + 1}. ${game.title} (${game.type}) - Status: ${game.status}`);
    });

    // Get game templates
    const templates = await Game.find({ 
      type: { $in: ['keno', 'big-small', 'even-odd'] },
      isActive: true 
    });
    console.log(`\n🎯 Game templates: ${templates.length}`);
    templates.forEach(template => {
      console.log(`- ${template.title} (${template.type})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected.');
  }
};

testGames();



