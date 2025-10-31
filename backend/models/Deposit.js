import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  qrCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode',
    required: function() {
      return this.method === 'qr_code';
    }
  },
  amount: {
    type: Number,
    required: [true, 'Deposit amount is required'],
    min: [10000, 'Minimum deposit amount is 10000'],
    max: [10000000, 'Maximum deposit amount is 10000000']
  },
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['qr_code', 'momo', 'zalopay', 'card', 'bank_transfer']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  transactionImage: {
    public_id: String,
    url: String,
    width: Number,
    height: Number,
    format: String
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, 'Note cannot exceed 200 characters']
  },
  adminNote: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin note cannot exceed 500 characters']
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Rejection reason cannot exceed 200 characters']
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmedAt: Date,
  processedAt: Date,
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  externalTransactionId: {
    type: String,
    trim: true
  },
  fee: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: function() {
      return this.status === 'completed';
    }
  },
  promotionApplied: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion'
  },
  bonusAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total amount including bonus
depositSchema.virtual('totalAmount').get(function() {
  return this.netAmount + this.bonusAmount;
});

// Virtual for processing time
depositSchema.virtual('processingTime').get(function() {
  if (this.processedAt && this.createdAt) {
    return this.processedAt - this.createdAt;
  }
  return null;
});

// Virtual for is pending
depositSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

// Virtual for is completed
depositSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Pre-save middleware to generate transaction ID
depositSchema.pre('save', function(next) {
  if (this.isNew && !this.transactionId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.transactionId = `DEP-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Pre-save middleware to calculate net amount
depositSchema.pre('save', function(next) {
  if (this.status === 'completed') {
    this.netAmount = this.amount - this.fee;
  }
  next();
});

// Static method to get user deposits
depositSchema.statics.getUserDeposits = function(userId, limit = 20, skip = 0) {
  return this.find({ userId })
    .populate('qrCodeId', 'name bankName accountNumber')
    .populate('promotionApplied', 'name type reward')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get pending deposits
depositSchema.statics.getPendingDeposits = function() {
  return this.find({ status: 'pending' })
    .populate('userId', 'fullName email phone')
    .populate('qrCodeId', 'name bankName accountNumber')
    .sort({ createdAt: -1 });
};

// Static method to get deposits by status
depositSchema.statics.getDepositsByStatus = function(status, limit = 50) {
  return this.find({ status })
    .populate('userId', 'fullName email phone')
    .populate('qrCodeId', 'name bankName accountNumber')
    .populate('confirmedBy', 'fullName email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get deposit statistics
depositSchema.statics.getDepositStats = function(startDate, endDate) {
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
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalNetAmount: { $sum: '$netAmount' },
        totalBonusAmount: { $sum: '$bonusAmount' }
      }
    }
  ]);
};

// Static method to get daily deposit summary
depositSchema.statics.getDailyDepositSummary = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalNetAmount: { $sum: '$netAmount' },
        totalBonusAmount: { $sum: '$bonusAmount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Indexes
depositSchema.index({ userId: 1 });
depositSchema.index({ qrCodeId: 1 });
depositSchema.index({ status: 1 });
depositSchema.index({ method: 1 });
depositSchema.index({ createdAt: -1 });
depositSchema.index({ transactionId: 1 });
depositSchema.index({ confirmedAt: -1 });
depositSchema.index({ amount: -1 });

const Deposit = mongoose.model('Deposit', depositSchema);

export default Deposit;




