import express from 'express';
import { body } from 'express-validator';
import { 
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  incrementViewCount,
  incrementClickCount,
  getBannersByType,
  getGameBanners
} from '../controllers/bannerController.js';
import { authenticate, requireAdmin, validate } from '../middleware/validation.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// Validation rules
const bannerValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('type')
    .isIn(['game', 'promotion', 'announcement', 'event'])
    .withMessage('Invalid banner type'),
  body('gameType')
    .optional()
    .isIn(['keno', 'big-small', 'even-odd', 'special', 'anniversary'])
    .withMessage('Invalid game type'),
  body('position')
    .isInt({ min: 1, max: 10 })
    .withMessage('Position must be between 1 and 10'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('buttonText')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Button text cannot exceed 20 characters'),
  body('link')
    .optional()
    .isURL()
    .withMessage('Link must be a valid URL')
];

// Public routes
router.get('/', getBanners);
router.get('/active', getBanners);
router.get('/type/:type', getBannersByType);
router.get('/game', getGameBanners);
router.get('/:id', getBannerById);
router.post('/:id/view', incrementViewCount);
router.post('/:id/click', incrementClickCount);

// Admin routes
router.post('/', 
  authenticate, 
  requireAdmin, 
  upload.single('image'), 
  bannerValidation, 
  validate, 
  createBanner
);

router.put('/:id', 
  authenticate, 
  requireAdmin, 
  upload.single('image'), 
  bannerValidation, 
  validate, 
  updateBanner
);

router.delete('/:id', 
  authenticate, 
  requireAdmin, 
  deleteBanner
);

export default router;





