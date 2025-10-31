import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'QR Code name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true,
    maxlength: [50, 'Bank name cannot exceed 50 characters']
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true,
    match: [/^[0-9]{8,20}$/, 'Please enter a valid account number']
  },
  accountHolder: {
    type: String,
    required: [true, 'Account holder name is required'],
    trim: true,
    maxlength: [100, 'Account holder name cannot exceed 100 characters']
  },
  qrImage: {
    public_id: {
      type: String,
      required: [true, 'QR image public ID is required']
    },
    url: {
      type: String,
      required: [true, 'QR image URL is required']
    },
    width: Number,
    height: Number,
    format: String
  },
  minAmount: {
    type: Number,
    required: [true, 'Minimum amount is required'],
    min: [10000, 'Minimum amount must be at least 10000'],
    default: 10000
  },
  maxAmount: {
    type: Number,
    required: [true, 'Maximum amount is required'],
    min: [10000, 'Maximum amount must be at least 10000'],
    default: 10000000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  lastUsed: Date,
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Instructions cannot exceed 500 characters']
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

// Virtual for average amount per use
qrCodeSchema.virtual('averageAmount').get(function() {
  return this.usageCount > 0 ? (this.totalAmount / this.usageCount).toFixed(0) : 0;
});

// Virtual for usage frequency (times per day)
qrCodeSchema.virtual('usageFrequency').get(function() {
  if (!this.lastUsed) return 0;
  const daysSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  return daysSinceCreation > 0 ? (this.usageCount / daysSinceCreation).toFixed(2) : 0;
});

// Pre-save middleware to validate amount range
qrCodeSchema.pre('save', function(next) {
  if (this.maxAmount <= this.minAmount) {
    next(new Error('Maximum amount must be greater than minimum amount'));
  }
  next();
});

// Static method to get active QR codes
qrCodeSchema.statics.getActiveQRCodes = function() {
  return this.find({ isActive: true })
    .sort({ usageCount: -1 });
};

// Static method to get QR codes by amount range
qrCodeSchema.statics.getQRCodesByAmount = function(amount) {
  return this.find({
    isActive: true,
    minAmount: { $lte: amount },
    maxAmount: { $gte: amount }
  })
  .sort({ usageCount: -1 });
};

// Static method to increment usage
qrCodeSchema.statics.incrementUsage = function(qrCodeId, amount) {
  return this.findByIdAndUpdate(
    qrCodeId,
    { 
      $inc: { 
        usageCount: 1, 
        totalAmount: amount 
      },
      $set: { lastUsed: new Date() }
    },
    { new: true }
  );
};

// Static method to get usage statistics
qrCodeSchema.statics.getUsageStats = function(startDate, endDate) {
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
        _id: null,
        totalQRCodes: { $sum: 1 },
        totalUsage: { $sum: '$usageCount' },
        totalAmount: { $sum: '$totalAmount' },
        averageUsage: { $avg: '$usageCount' },
        averageAmount: { $avg: '$totalAmount' }
      }
    }
  ]);
};

// Indexes
qrCodeSchema.index({ bankName: 1 });
qrCodeSchema.index({ accountNumber: 1 });
qrCodeSchema.index({ isActive: 1 });
qrCodeSchema.index({ usageCount: -1 });
qrCodeSchema.index({ totalAmount: -1 });
qrCodeSchema.index({ createdAt: -1 });
qrCodeSchema.index({ lastUsed: -1 });

const QRCode = mongoose.model('QRCode', qrCodeSchema);

export default QRCode;




