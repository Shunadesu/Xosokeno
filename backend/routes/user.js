import express from 'express';
import { body } from 'express-validator';
import { 
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserStats,
  getFavoriteNumbers,
  updateFavoriteNumbers,
  updatePreferences
} from '../controllers/userController.js';
import { authenticate, validate } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('vi-VN')
    .withMessage('Please provide a valid Vietnamese phone number')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

const favoriteNumbersValidation = [
  body('numbers')
    .isArray({ min: 1, max: 20 })
    .withMessage('Numbers must be an array with 1-20 items'),
  body('numbers.*')
    .isInt({ min: 1, max: 80 })
    .withMessage('Each number must be between 1 and 80')
];

const preferencesValidation = [
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be boolean'),
  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification preference must be boolean'),
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be boolean'),
  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be light or dark')
];

// Routes
router.get('/profile', getUserProfile);
router.put('/profile', updateProfileValidation, validate, updateUserProfile);
router.put('/change-password', changePasswordValidation, validate, changePassword);
router.get('/stats', getUserStats);
router.get('/favorite-numbers', getFavoriteNumbers);
router.put('/favorite-numbers', favoriteNumbersValidation, validate, updateFavoriteNumbers);
router.put('/preferences', preferencesValidation, validate, updatePreferences);

export default router;





