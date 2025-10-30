import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import gameRoutes from './routes/game.js';
import betRoutes from './routes/bet.js';
import walletRoutes from './routes/wallet.js';
import depositRoutes from './routes/deposit.js';
import qrCodeRoutes from './routes/qrCode.js';
import promotionRoutes from './routes/promotion.js';
import bannerRoutes from './routes/banner.js';
import adminRoutes from './routes/admin.js';

// Import middleware
import { errorHandler, notFound } from './middleware/validation.js';

// Import cron service
import { startCronJobs } from './services/cronService.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet());
app.use(compression());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration - Allow all origins
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ Missing MONGODB_URI in environment variables. Please set it in your .env file.');
  // Do not start cron jobs when DB URI is missing
} else {
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    // Start cron jobs only after successful DB connection
    startCronJobs();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    // Do not start cron jobs on failed DB connection
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/qr-codes', qrCodeRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/ads', bannerRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});


