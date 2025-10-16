import express from 'express';
import { body } from 'express-validator';
import { 
  getQRCodes,
  getQRCodeById,
  createQRCode,
  updateQRCode,
  deleteQRCode,
  getActiveQRCodes,
  getQRCodesByAmount,
  incrementUsage,
  getUsageStats
} from '../controllers/qrCodeController.js';
import { authenticate, requireAdmin, validate } from '../middleware/validation.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// Validation rules
const qrCodeValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('bankName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Bank name must be between 1 and 50 characters'),
  body('accountNumber')
    .matches(/^[0-9]{8,20}$/)
    .withMessage('Account number must be 8-20 digits'),
  body('accountHolder')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Account holder name must be between 1 and 100 characters'),
  body('minAmount')
    .isInt({ min: 1000 })
    .withMessage('Minimum amount must be at least 1000'),
  body('maxAmount')
    .isInt({ min: 1000 })
    .withMessage('Maximum amount must be at least 1000'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Instructions cannot exceed 500 characters')
];

// Public routes
router.get('/active', getActiveQRCodes);
router.get('/amount/:amount', getQRCodesByAmount);

// Admin routes (for management) - must come before /:id route
router.get('/admin', authenticate, requireAdmin, getQRCodes);

// User routes (authenticated users can view QR codes for deposits)
router.get('/', authenticate, getQRCodes);

// Get QR code by ID (must come after /admin)
router.get('/:id', getQRCodeById);
router.post('/', 
  authenticate, 
  requireAdmin, 
  upload.single('qrImage'), 
  qrCodeValidation, 
  validate, 
  createQRCode
);

router.put('/:id', 
  authenticate, 
  requireAdmin, 
  upload.single('qrImage'), 
  qrCodeValidation, 
  validate, 
  updateQRCode
);

router.delete('/:id', authenticate, requireAdmin, deleteQRCode);
router.post('/:id/increment-usage', authenticate, requireAdmin, incrementUsage);
router.get('/stats/usage', authenticate, requireAdmin, getUsageStats);

export default router;



