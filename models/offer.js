import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  influencerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'influencers',
    required: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  offerDetails: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    deadline: {
      type: Date,
      required: true
    },
    requirements: {
      type: [String],
      default: []
    },
    deliverables: {
      type: [String],
      default: []
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'negotiated', 'completed', 'cancelled'],
    default: 'pending'
  },
  responses: [
    {
      responseType: {
        type: String,
        enum: ['accept', 'decline', 'negotiate'],
        required: true
      },
      message: {
        type: String
      },
      negotiationDetails: {
        proposedAmount: Number,
        proposedDeadline: Date,
        counterRequirements: [String]
      },
      respondedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  finalTerms: {
    agreedAmount: Number,
    agreedDeadline: Date,
    finalRequirements: [String],
    finalDeliverables: [String]
  },
  acceptedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
offerSchema.index({ brandId: 1, influencerId: 1 });
offerSchema.index({ status: 1 });
offerSchema.index({ 'offerDetails.deadline': 1 });

export default mongoose.model('Offer', offerSchema);
