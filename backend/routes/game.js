import express from 'express';
import { body } from 'express-validator';
import { 
  getGameTemplates,
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  getActiveGames,
  getUpcomingGames,
  getCompletedGames,
  getGameStats,
  generateGameResult
} from '../controllers/gameController.js';
import { processGameManually } from '../services/cronService.js';
import { authenticate, requireAdmin, validate } from '../middleware/validation.js';

const router = express.Router();

// Validation rules for creating games
const createGameValidation = [
  body('type')
    .isIn(['keno', 'big-small', 'even-odd', 'special', 'anniversary', 'sum-three'])
    .withMessage('Invalid game type'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid date'),
  body('endTime')
    .isISO8601()
    .withMessage('End time must be a valid date'),
  body('maxNumbers')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Max numbers must be between 1 and 20'),
  body('minBetAmount')
    .optional()
    .isInt({ min: 1000 })
    .withMessage('Minimum bet amount must be at least 1000'),
  body('maxBetAmount')
    .optional()
    .isInt({ min: 1000 })
    .withMessage('Maximum bet amount must be at least 1000')
];

// Validation rules for updating games (more flexible)
const updateGameValidation = [
  body('type')
    .optional()
    .isIn(['keno', 'big-small', 'even-odd', 'special', 'anniversary'])
    .withMessage('Invalid game type'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('startTime')
    .optional()
    .isISO8601()
    .withMessage('Start time must be a valid date'),
  body('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid date'),
  body('maxNumbers')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Max numbers must be between 1 and 20'),
  body('minBetAmount')
    .optional()
    .isInt({ min: 1000 })
    .withMessage('Minimum bet amount must be at least 1000'),
  body('maxBetAmount')
    .optional()
    .isInt({ min: 1000 })
    .withMessage('Maximum bet amount must be at least 1000'),
  body('status')
    .optional()
    .isIn(['pending', 'active', 'completed', 'cancelled'])
    .withMessage('Invalid game status')
];

// Admin routes for getting all games (must be before /:id routes)
router.get('/admin', authenticate, requireAdmin, getGames);

// Public routes
router.get('/templates', getGameTemplates);
router.get('/active', getActiveGames);
router.get('/upcoming', getUpcomingGames);
router.get('/completed', getCompletedGames);
router.get('/', getGames); // Keep public route for frontend
router.get('/:id', getGameById);
router.get('/:id/stats', getGameStats);

// Admin routes
router.post('/', 
  authenticate, 
  requireAdmin, 
  createGameValidation, 
  validate, 
  createGame
);

router.put('/:id', 
  authenticate, 
  requireAdmin, 
  updateGameValidation, 
  validate, 
  updateGame
);

router.delete('/:id', 
  authenticate, 
  requireAdmin, 
  deleteGame
);

router.post('/:id/generate-result', 
  authenticate, 
  requireAdmin, 
  generateGameResult
);

router.post('/:id/process-manually', 
  authenticate, 
  requireAdmin, 
  processGameManually
);

export default router;

