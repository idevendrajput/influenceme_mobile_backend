import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true
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
    enum: [
      'text', 'media', 'voice', 'offer', 'acceptance', 'decline', 'negotiation', 
      'system', 'location', 'contact', 'forwarded', 'poll', 'sticker', 'gif', 'campaign_offer'
    ],
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
    },
    // 📷 Media content (images, videos, documents)
    media: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      type: {
        type: String,
        enum: ['image', 'video', 'audio', 'document']
      },
      thumbnail: String, // For videos
      duration: Number   // For videos/audio
    }],
    // 🎵 Voice message content
    voice: {
      filename: String,
      url: String,
      duration: Number, // in seconds
      size: Number,
      waveform: [Number] // Audio waveform data
    },
    // 🔗 Link preview
    link: {
      url: String,
      title: String,
      description: String,
      image: String,
      siteName: String
    },
    // 🌍 Location sharing
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
      placeName: String
    },
    // 👤 Contact sharing
    contact: {
      name: String,
      phone: String,
      email: String
    },
    // ↪️ Forwarded message info
    forwarded: {
      originalSender: String,
      originalMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
      },
      originalRoomId: String,
      forwardedAt: Date
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
        enum: ['like', 'love', 'laugh', 'angry', 'sad', 'wow', 'care', 'thumbs_up', 'thumbs_down', 'heart'],
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
      originalContent: mongoose.Schema.Types.Mixed,
      editedAt: {
        type: Date,
        default: Date.now
      },
      editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      }
    }
  ],
  // 🗑️ Soft deletion tracking
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  deletedAt: Date,
  // 🔐 Encryption metadata
  isEncrypted: {
    type: Boolean,
    default: false
  },
  encryptionMethod: {
    type: String,
    enum: ['aes-256-cbc', 'none'],
    default: 'none'
  },
  // 🏷️ Message priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  // 📱 Platform info
  sentFrom: {
    platform: {
      type: String,
      enum: ['web', 'mobile', 'desktop', 'api'],
      default: 'api'
    },
    device: String,
    version: String
  },
  // ⏰ Message scheduling
  scheduledFor: Date,
  isScheduled: {
    type: Boolean,
    default: false
  },
  // 🌐 Translation support
  translations: [{
    language: String,
    translatedText: String,
    translatedAt: Date
  }],
  // 📊 Message analytics
  analytics: {
    deliveredAt: Date,
    readAt: Date,
    clicks: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ 'sender.participantId': 1 });
messageSchema.index({ messageType: 1 });

export default mongoose.model('Message', messageSchema);
