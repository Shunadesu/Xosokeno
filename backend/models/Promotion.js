import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Promotion name is required'],
    trim: true,
    maxlength: [100, 'Promotion name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Promotion type is required'],
    enum: ['first_deposit', 'daily', 'weekly', 'monthly', 'special', 'event', 'referral']
  },
  condition: {
    minAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    maxAmount: {
      type: Number,
      default: Infinity,
      min: 0
    },
    timeRange: {
      startTime: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
      },
      endTime: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
      }
    },
    userRoles: [{
      type: String,
      enum: ['user', 'admin', 'super_admin']
    }],
    minBalance: {
      type: Number,
      default: 0
    },
    maxBalance: {
      type: Number,
      default: Infinity
    },
    excludeUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    requiredGames: [{
      type: String,
      enum: ['keno', 'big-small', 'even-odd', 'special']
    }]
  },
  reward: {
    type: {
      type: String,
      required: [true, 'Reward type is required'],
      enum: ['percentage', 'fixed', 'multiplier']
    },
    value: {
      type: Number,
      required: [true, 'Reward value is required'],
      min: 0
    },
    maxReward: {
      type: Number,
      min: 0
    },
    minReward: {
      type: Number,
      min: 0
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  maxUsage: {
    type: Number,
    default: -1, // -1 means unlimited
    min: -1
  },
  currentUsage: {
    type: Number,
    default: 0,
    min: 0
  },
  maxUsagePerUser: {
    type: Number,
    default: 1,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAutoApply: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  banner: {
    public_id: String,
    url: String,
    width: Number,
    height: Number,
    format: String
  },
  terms: {
    type: String,
    trim: true,
    maxlength: [1000, 'Terms cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for is currently active
promotionSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.endDate >= now &&
         (this.maxUsage === -1 || this.currentUsage < this.maxUsage);
});

// Virtual for days remaining
promotionSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diffTime = this.endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for usage percentage
promotionSchema.virtual('usagePercentage').get(function() {
  if (this.maxUsage === -1) return 0;
  return this.maxUsage > 0 ? (this.currentUsage / this.maxUsage * 100).toFixed(2) : 0;
});

// Virtual for is time valid
promotionSchema.virtual('isTimeValid').get(function() {
  if (!this.condition.timeRange.startTime || !this.condition.timeRange.endTime) {
    return true;
  }
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const startTime = this.condition.timeRange.startTime.split(':').map(Number);
  const endTime = this.condition.timeRange.endTime.split(':').map(Number);
  const startMinutes = startTime[0] * 60 + startTime[1];
  const endMinutes = endTime[0] * 60 + endTime[1];
  
  return currentTime >= startMinutes && currentTime <= endMinutes;
});

// Pre-save middleware to validate dates
promotionSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  
  if (this.condition.maxAmount <= this.condition.minAmount) {
    next(new Error('Maximum amount must be greater than minimum amount'));
  }
  
  if (this.reward.maxReward && this.reward.minReward && 
      this.reward.maxReward <= this.reward.minReward) {
    next(new Error('Maximum reward must be greater than minimum reward'));
  }
  
  next();
});

// Static method to get active promotions
promotionSchema.statics.getActivePromotions = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { maxUsage: -1 },
      { currentUsage: { $lt: '$maxUsage' } }
    ]
  })
  .sort({ priority: -1, createdAt: -1 });
};

// Static method to get applicable promotions
promotionSchema.statics.getApplicablePromotions = function(userId, amount, userRole = 'user') {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    'condition.minAmount': { $lte: amount },
    'condition.maxAmount': { $gte: amount },
    $or: [
      { 'condition.userRoles': { $in: [userRole] } },
      { 'condition.userRoles': { $size: 0 } }
    ],
    'condition.excludeUsers': { $nin: [userId] },
    $or: [
      { maxUsage: -1 },
      { currentUsage: { $lt: '$maxUsage' } }
    ]
  })
  .sort({ priority: -1, createdAt: -1 });
};

// Static method to increment usage
promotionSchema.statics.incrementUsage = function(promotionId) {
  return this.findByIdAndUpdate(
    promotionId,
    { $inc: { currentUsage: 1 } },
    { new: true }
  );
};

// Static method to get promotion statistics
promotionSchema.statics.getPromotionStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalUsage: { $sum: '$currentUsage' },
        averageUsage: { $avg: '$currentUsage' }
      }
    }
  ]);
};

// Indexes
promotionSchema.index({ type: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ startDate: 1 });
promotionSchema.index({ endDate: 1 });
promotionSchema.index({ priority: -1 });
promotionSchema.index({ createdAt: -1 });
promotionSchema.index({ currentUsage: -1 });

const Promotion = mongoose.model('Promotion', promotionSchema);

export default Promotion;





