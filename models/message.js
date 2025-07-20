import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'sender.participantType'
    },
    participantType: {
      type: String,
      required: true,
      enum: ['User', 'influencers']
    },
    role: {
      type: String,
      required: true,
      enum: ['brand', 'influencer', 'admin', 'vendor']
    },
    name: {
      type: String,
      required: true
    }
  },
  messageType: {
    type: String,
    enum: ['text', 'offer', 'acceptance', 'decline', 'negotiation', 'system'],
    default: 'text'
  },
  content: {
    text: {
      type: String
    },
    offer: {
      amount: Number,
      description: String,
      deadline: Date,
      requirements: [String]
    },
    response: {
      type: String,
      enum: ['accepted', 'declined', 'negotiated'],
      message: String
    }
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [
    {
      participantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      reaction: {
        type: String,
        enum: ['like', 'love', 'laugh', 'angry', 'sad'],
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  readBy: [
    {
      participantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [
    {
      originalContent: String,
      editedAt: Date,
      editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      }
    }
  ]
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ 'sender.participantId': 1 });
messageSchema.index({ messageType: 1 });

export default mongoose.model('Message', messageSchema);
