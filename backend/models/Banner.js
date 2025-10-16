import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Banner type is required'],
    enum: ['game', 'promotion', 'announcement', 'event']
  },
  gameType: {
    type: String,
    enum: ['keno', 'big-small', 'even-odd', 'special', 'anniversary'],
    required: function() {
      return this.type === 'game';
    }
  },
  image: {
    public_id: {
      type: String,
      required: [true, 'Image public ID is required']
    },
    url: {
      type: String,
      required: [true, 'Image URL is required']
    },
    width: Number,
    height: Number,
    format: String
  },
  mobileImage: {
    public_id: String,
    url: String,
    width: Number,
    height: Number,
    format: String
  },
  link: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  buttonText: {
    type: String,
    default: 'Tham gia',
    trim: true,
    maxlength: [20, 'Button text cannot exceed 20 characters']
  },
  position: {
    type: Number,
    required: [true, 'Banner position is required'],
    min: [1, 'Position must be at least 1'],
    max: [10, 'Position cannot exceed 10']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  displayConditions: {
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
    userGroups: [String],
    excludeUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  clickCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  },
  isSpecial: {
    type: Boolean,
    default: false
  },
  specialEffects: {
    animation: {
      type: String,
      enum: ['none', 'fade', 'slide', 'bounce', 'pulse'],
      default: 'none'
    },
    glow: {
      type: Boolean,
      default: false
    },
    priority: {
      type: Number,
      default: 0
    }
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
bannerSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Virtual for days remaining
bannerSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diffTime = this.endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for conversion rate percentage
bannerSchema.virtual('conversionRatePercentage').get(function() {
  return this.viewCount > 0 ? (this.clickCount / this.viewCount * 100).toFixed(2) : 0;
});

// Pre-save middleware to validate dates
bannerSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Pre-save middleware to update conversion rate
bannerSchema.pre('save', function(next) {
  if (this.viewCount > 0) {
    this.conversionRate = this.clickCount / this.viewCount;
  }
  next();
});

// Static method to get active banners
bannerSchema.statics.getActiveBanners = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  })
  .sort({ position: 1, specialEffects: { priority: -1 } });
};

// Static method to get banners by type
bannerSchema.statics.getBannersByType = function(type) {
  return this.find({ 
    type,
    isActive: true 
  })
  .sort({ position: 1 });
};

// Static method to get game banners
bannerSchema.statics.getGameBanners = function() {
  return this.find({ 
    type: 'game',
    isActive: true 
  })
  .sort({ position: 1 });
};

// Static method to increment view count
bannerSchema.statics.incrementViewCount = function(bannerId) {
  return this.findByIdAndUpdate(
    bannerId,
    { $inc: { viewCount: 1 } },
    { new: true }
  );
};

// Static method to increment click count
bannerSchema.statics.incrementClickCount = function(bannerId) {
  return this.findByIdAndUpdate(
    bannerId,
    { $inc: { clickCount: 1 } },
    { new: true }
  );
};

// Indexes
bannerSchema.index({ type: 1 });
bannerSchema.index({ gameType: 1 });
bannerSchema.index({ position: 1 });
bannerSchema.index({ isActive: 1 });
bannerSchema.index({ startDate: 1 });
bannerSchema.index({ endDate: 1 });
bannerSchema.index({ createdAt: -1 });
bannerSchema.index({ clickCount: -1 });
bannerSchema.index({ viewCount: -1 });

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;




