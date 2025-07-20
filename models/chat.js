import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  participants: [
    {
      participantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'participants.participantType'
      },
      participantType: {
        type: String,
        required: true,
        enum: ['User', 'influencers'] // User collection includes brands, vendors, admins
      },
      role: {
        type: String,
        required: true,
        enum: ['brand', 'influencer', 'admin', 'vendor']
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  chatType: {
    type: String,
    required: true,
    enum: ['brand_influencer', 'group_chat'],
    default: 'brand_influencer'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  createdBy: {
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'createdBy.participantType'
    },
    participantType: {
      type: String,
      required: true,
      enum: ['User', 'influencers']
    }
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
chatSchema.index({ roomId: 1 });
chatSchema.index({ 'participants.participantId': 1 });
chatSchema.index({ createdAt: -1 });

export default mongoose.model('Chat', chatSchema);
