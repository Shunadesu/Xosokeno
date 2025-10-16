import express from 'express';
import { 
  getWalletBalance,
  getTransactions,
  getTransactionById,
  getWalletStats,
  getBalanceHistory
} from '../controllers/walletController.js';
import { authenticate } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/balance', getWalletBalance);
router.get('/transactions', getTransactions);
router.get('/transactions/:id', getTransactionById);
router.get('/stats', getWalletStats);
router.get('/balance-history', getBalanceHistory);

export default router;





