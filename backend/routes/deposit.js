import express from 'express';
import { body } from 'express-validator';
import { 
  getDeposits,
  getDepositById,
  createDeposit,
  updateDepositStatus,
  getPendingDeposits,
  getDepositsByStatus,
  getDepositStats,
  getDailyDepositSummary,
  confirmDeposit,
  rejectDeposit
} from '../controllers/depositController.js';
import { authenticate, requireAdmin, validate } from '../middleware/validation.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// Validation rules
const depositValidation = [
  body('amount')
    .isInt({ min: 1000, max: 10000000 })
    .withMessage('Amount must be between 1000 and 10000000'),
  body('method')
    .isIn(['qr_code', 'momo', 'zalopay', 'card', 'bank_transfer'])
    .withMessage('Invalid payment method'),
  body('qrCodeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid QR code ID'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Note cannot exceed 200 characters')
];

const updateStatusValidation = [
  body('status')
    .isIn(['confirmed', 'rejected', 'completed'])
    .withMessage('Invalid status'),
  body('adminNote')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin note cannot exceed 500 characters'),
  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Rejection reason cannot exceed 200 characters')
];

// User routes (user can only see their own deposits)
router.get('/my', authenticate, getDeposits);
router.get('/:id', authenticate, getDepositById);
router.post('/', 
  authenticate, 
  upload.single('transactionImage'), 
  depositValidation, 
  validate, 
  createDeposit
);

// Admin routes (admin can see all deposits)
router.get('/', authenticate, requireAdmin, getDeposits);
router.get('/admin/pending', authenticate, requireAdmin, getPendingDeposits);
router.get('/admin/status/:status', authenticate, requireAdmin, getDepositsByStatus);
router.get('/admin/stats', authenticate, requireAdmin, getDepositStats);
router.get('/admin/daily-summary', authenticate, requireAdmin, getDailyDepositSummary);
router.put('/:id/status', 
  authenticate, 
  requireAdmin, 
  updateStatusValidation, 
  validate, 
  updateDepositStatus
);
router.post('/:id/confirm', authenticate, requireAdmin, confirmDeposit);
router.post('/:id/reject', authenticate, requireAdmin, rejectDeposit);

export default router;

