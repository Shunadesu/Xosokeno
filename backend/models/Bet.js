import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: [true, 'Game ID is required']
  },
  numbers: {
    type: [Number],
    required: [true, 'Numbers are required'],
    validate: {
      validator: function(numbers) {
        // For Big/Small/Even/Odd games, numbers array can be empty
        if (['big', 'small', 'even', 'odd'].includes(this.betType)) {
          return numbers.length >= 0 && numbers.length <= 20;
        }
        // For Keno game, numbers array must have 1-20 items
        return numbers.length >= 1 && numbers.length <= 20 && 
               numbers.every(num => num >= 1 && num <= 80);
      },
      message: 'Numbers must be between 1-80 and maximum 20 numbers'
    }
  },
  betType: {
    type: String,
    required: [true, 'Bet type is required'],
    enum: ['keno', 'big', 'small', 'even', 'odd', 'special']
  },
  amount: {
    type: Number,
    required: [true, 'Bet amount is required'],
    min: [1000, 'Minimum bet amount is 1000'],
    max: [1000000, 'Maximum bet amount is 1000000']
  },
  winAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'won', 'lost', 'cancelled'],
    default: 'pending'
  },
  matchedNumbers: {
    type: [Number],
    default: []
  },
  matchedCount: {
    type: Number,
    default: 0
  },
  payoutRate: {
    type: Number,
    default: 0
  },
  isSpecial: {
    type: Boolean,
    default: false
  },
  specialMultiplier: {
    type: Number,
    default: 1.0
  },
  betSlip: {
    type: String,
    unique: true,
    sparse: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  processedAt: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for net profit/loss
betSchema.virtual('netAmount').get(function() {
  return this.winAmount - this.amount;
});

// Virtual for is winning bet
betSchema.virtual('isWinning').get(function() {
  return this.status === 'won' && this.winAmount > 0;
});

// Pre-save middleware to generate bet slip
betSchema.pre('save', function(next) {
  if (this.isNew) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.betSlip = `BET-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Pre-save middleware to calculate winnings
betSchema.pre('save', function(next) {
  if (this.status === 'won' && this.matchedCount > 0) {
    // Calculate payout based on matched numbers
    const basePayout = this.amount * this.payoutRate;
    const specialBonus = this.isSpecial ? basePayout * (this.specialMultiplier - 1) : 0;
    this.winAmount = basePayout + specialBonus;
  }
  next();
});

// Static method to get user bets
betSchema.statics.getUserBets = function(userId, limit = 20, skip = 0) {
  return this.find({ userId })
    .populate('gameId', 'type title startTime endTime result')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get game bets
betSchema.statics.getGameBets = function(gameId) {
  return this.find({ gameId })
    .populate('userId', 'fullName email phone')
    .sort({ createdAt: -1 });
};

// Static method to get winning bets
betSchema.statics.getWinningBets = function(gameId) {
  return this.find({ 
    gameId, 
    status: 'won' 
  })
  .populate('userId', 'fullName email phone')
  .sort({ winAmount: -1 });
};

// Static method to calculate total bets for a game
betSchema.statics.getGameStats = function(gameId) {
  return this.aggregate([
    { $match: { gameId: new mongoose.Types.ObjectId(gameId) } },
    {
      $group: {
        _id: null,
        totalBets: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalWinnings: { $sum: '$winAmount' },
        winningBets: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } }
      }
    }
  ]);
};

// Indexes
betSchema.index({ userId: 1 });
betSchema.index({ gameId: 1 });
betSchema.index({ status: 1 });
betSchema.index({ betType: 1 });
betSchema.index({ createdAt: -1 });
betSchema.index({ betSlip: 1 });
betSchema.index({ amount: -1 });
betSchema.index({ winAmount: -1 });

const Bet = mongoose.model('Bet', betSchema);

export default Bet;


