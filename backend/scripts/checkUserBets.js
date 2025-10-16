import mongoose from 'mongoose';
import Bet from '../models/Bet.js';
import User from '../models/User.js';
import Game from '../models/Game.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zuna-xosokeno';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected for checking user bets');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log('👋 MongoDB disconnected');
};

const checkUserBets = async () => {
  await connectDB();
  
  try {
    // Get all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users`);
    
    // Get all bets
    const allBets = await Bet.find({}).populate('userId', 'fullName email').populate('gameId', 'title type');
    console.log(`🎲 Found ${allBets.length} total bets`);
    
    // Group bets by user
    const betsByUser = {};
    allBets.forEach(bet => {
      const userId = bet.userId._id.toString();
      if (!betsByUser[userId]) {
        betsByUser[userId] = {
          user: bet.userId,
          bets: []
        };
      }
      betsByUser[userId].bets.push(bet);
    });
    
    console.log(`\n📊 Bets by user:`);
    Object.entries(betsByUser).forEach(([userId, data]) => {
      console.log(`\n👤 User: ${data.user.fullName} (${data.user.email})`);
      console.log(`   ID: ${userId}`);
      console.log(`   Bets: ${data.bets.length}`);
      
      data.bets.forEach((bet, index) => {
        console.log(`   ${index + 1}. Game: ${bet.gameId?.title || 'Unknown'} (${bet.gameId?._id})`);
        console.log(`      Bet Type: ${bet.betType}`);
        console.log(`      Amount: ${bet.amount}`);
        console.log(`      Status: ${bet.status}`);
        console.log(`      Created: ${new Date(bet.createdAt).toLocaleString('vi-VN')}`);
      });
    });
    
    // Check specific game
    const gameId = '68eb621f3e32e32dcea17fee'; // From the console logs
    console.log(`\n🎮 Checking bets for game: ${gameId}`);
    
    const gameBets = await Bet.find({ gameId }).populate('userId', 'fullName email');
    console.log(`📊 Found ${gameBets.length} bets for this game`);
    
    gameBets.forEach((bet, index) => {
      console.log(`   ${index + 1}. User: ${bet.userId.fullName} (${bet.userId._id})`);
      console.log(`      Bet Type: ${bet.betType}`);
      console.log(`      Amount: ${bet.amount}`);
      console.log(`      Status: ${bet.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking user bets:', error);
  } finally {
    await disconnectDB();
  }
};

checkUserBets();
