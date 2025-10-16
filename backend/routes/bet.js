import express from 'express';
import { body } from 'express-validator';
import { 
  getBets,
  getBetById,
  placeBet,
  getUserBets,
  getGameBets,
  getWinningBets,
  getBetStats,
  cancelBet
} from '../controllers/betController.js';
import { authenticate, validate } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const betValidation = [
  body('gameId')
    .isMongoId()
    .withMessage('Invalid game ID'),
  body('numbers')
    .isArray({ min: 0, max: 20 })
    .withMessage('Numbers must be an array with 0-20 items'),
  body('numbers.*')
    .isInt({ min: 1, max: 80 })
    .withMessage('Each number must be between 1 and 80'),
  body('betType')
    .isIn(['keno', 'big', 'small', 'even', 'odd', 'special'])
    .withMessage('Invalid bet type'),
  body('amount')
    .isInt({ min: 1000, max: 1000000 })
    .withMessage('Amount must be between 1000 and 1000000'),
  // Custom validation for numbers based on bet type
  body().custom((value, { req }) => {
    const { betType, numbers } = req.body;
    
    // For Keno game, numbers array must have 1-20 items
    if (betType === 'keno' && (!numbers || numbers.length === 0)) {
      throw new Error('Keno game requires at least 1 number');
    }
    
    // For Big/Small/Even/Odd games, numbers array can be empty
    if (['big', 'small', 'even', 'odd'].includes(betType)) {
      // Numbers array is optional for these bet types
      return true;
    }
    
    return true;
  })
];

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', getBets);
router.get('/user', getUserBets);
router.get('/game/:gameId', getGameBets);
router.get('/winning/:gameId', getWinningBets);
router.get('/stats', getBetStats);
router.get('/:id', getBetById);
router.post('/', betValidation, validate, placeBet);
router.post('/:id/cancel', cancelBet);

export default router;





