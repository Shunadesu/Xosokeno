import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Game type is required'],
    enum: ['keno', 'big-small', 'even-odd', 'special', 'anniversary', 'sum-three']
  },
  title: {
    type: String,
    required: [true, 'Game title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  numbers: {
    type: [Number],
    validate: {
      validator: function(numbers) {
        return numbers.every(num => num >= 1 && num <= 80);
      },
      message: 'Numbers must be between 1 and 80'
    }
  },
  result: {
    type: [Number],
    validate: {
      validator: function(numbers) {
        return numbers.every(num => num >= 1 && num <= 80);
      },
      message: 'Result numbers must be between 1 and 80'
    }
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  isSpecial: {
    type: Boolean,
    default: false
  },
  specialMultiplier: {
    type: Number,
    default: 1.0,
    min: 1.0
  },
  maxNumbers: {
    type: Number,
    default: 20,
    min: 1,
    max: 20
  },
  minBetAmount: {
    type: Number,
    default: 1000,
    min: 1000
  },
  maxBetAmount: {
    type: Number,
    default: 1000000,
    min: 1000
  },
  payoutRates: {
    type: Map,
    of: Number,
    default: new Map([
      ['1', 1.0],
      ['2', 2.0],
      ['3', 5.0],
      ['4', 10.0],
      ['5', 20.0],
      ['6', 50.0],
      ['7', 100.0],
      ['8', 200.0],
      ['9', 500.0],
      ['10', 1000.0]
    ])
  },
  totalBets: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  totalWinnings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Convert Map to plain object for JSON serialization
      if (ret.payoutRates instanceof Map) {
        ret.payoutRates = Object.fromEntries(ret.payoutRates);
      } else if (ret.payoutRates && typeof ret.payoutRates === 'object') {
        // Already an object, ensure it's a plain object
        ret.payoutRates = { ...ret.payoutRates };
      }
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Convert Map to plain object
      if (ret.payoutRates instanceof Map) {
        ret.payoutRates = Object.fromEntries(ret.payoutRates);
      } else if (ret.payoutRates && typeof ret.payoutRates === 'object') {
        ret.payoutRates = { ...ret.payoutRates };
      }
      return ret;
    }
  }
});

// Virtual for game duration
gameSchema.virtual('duration').get(function() {
  return this.endTime - this.startTime;
});

// Virtual for profit/loss
gameSchema.virtual('profit').get(function() {
  return this.totalAmount - this.totalWinnings;
});

// Virtual for number of winners
gameSchema.virtual('winnerCount').get(function() {
  return this.totalWinnings > 0 ? Math.floor(this.totalWinnings / this.totalAmount * 100) : 0;
});

// Pre-save middleware to validate times
gameSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Static method to get active games
gameSchema.statics.getActiveGames = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startTime: { $lte: now },
    endTime: { $gte: now },
    isActive: true
  });
};

// Static method to get upcoming games
gameSchema.statics.getUpcomingGames = function() {
  const now = new Date();
  return this.find({
    status: 'pending',
    startTime: { $gt: now },
    isActive: true
  });
};

// Static method to get completed games
gameSchema.statics.getCompletedGames = function(limit = 10) {
  return this.find({
    status: 'completed'
  })
  .sort({ endTime: -1 })
  .limit(limit);
};

// Indexes
gameSchema.index({ type: 1 });
gameSchema.index({ status: 1 });
gameSchema.index({ startTime: 1 });
gameSchema.index({ endTime: 1 });
gameSchema.index({ isActive: 1 });
gameSchema.index({ createdAt: -1 });

const Game = mongoose.model('Game', gameSchema);

export default Game;


