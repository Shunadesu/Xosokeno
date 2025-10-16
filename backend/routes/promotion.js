import express from 'express';
import { body } from 'express-validator';
import { 
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getActivePromotions,
  getApplicablePromotions,
  incrementPromotionUsage,
  getPromotionStats
} from '../controllers/promotionController.js';
import { authenticate, requireAdmin, validate } from '../middleware/validation.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// Validation rules
const promotionValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('type')
    .isIn(['first_deposit', 'daily', 'weekly', 'monthly', 'special', 'event', 'referral'])
    .withMessage('Invalid promotion type'),
  body('condition.minAmount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum amount must be non-negative'),
  body('condition.maxAmount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum amount must be non-negative'),
  body('reward.type')
    .isIn(['percentage', 'fixed', 'multiplier'])
    .withMessage('Invalid reward type'),
  body('reward.value')
    .isFloat({ min: 0 })
    .withMessage('Reward value must be non-negative'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('maxUsage')
    .optional()
    .isInt({ min: -1 })
    .withMessage('Max usage must be -1 (unlimited) or positive'),
  body('maxUsagePerUser')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max usage per user must be at least 1'),
  body('priority')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Priority must be between 0 and 100')
];

// Public routes
router.get('/active', getActivePromotions);
router.get('/applicable', authenticate, getApplicablePromotions);

// Admin routes
router.get('/', authenticate, requireAdmin, getPromotions);
router.get('/stats', authenticate, requireAdmin, getPromotionStats);
router.get('/:id', authenticate, requireAdmin, getPromotionById);
router.post('/', 
  authenticate, 
  requireAdmin, 
  upload.single('banner'), 
  promotionValidation, 
  validate, 
  createPromotion
);
router.put('/:id', 
  authenticate, 
  requireAdmin, 
  upload.single('banner'), 
  promotionValidation, 
  validate, 
  updatePromotion
);
router.delete('/:id', authenticate, requireAdmin, deletePromotion);
router.post('/:id/increment-usage', authenticate, requireAdmin, incrementPromotionUsage);

export default router;





