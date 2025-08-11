import mongoose from 'mongoose';

const influencerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    default: undefined
  },
  phoneCode: String,
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    default: undefined
  },
  about: {
    type: String,
    required: false,
    trim: true,
    maxLength: 500
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  spokenLanguages: {
    type: [String],
    required: false,
    default: []
  },
  country: {
    type: String,
    required: false,
    trim: true
  },
  addresses: {
    streetAddress: String,
    state: String,
    country: String,
    pinCode: String,
    latitude: String,
    longitude: String
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed'],
    required: false
  },
  children: {
    type: Number,
    min: 0,
    default: 0
  },
  pets: {
    type: Number,
    min: 0,
    default: 0
  },
  media: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'media',
    required: false
  }],
  influencerType: {
    type: String,
    enum: ['micro', 'macro', 'mega', 'nano'],
    required: false
  },
  socialMedia: [{
    platform: {
      type: String,
      required: true,
      enum: ['instagram', 'facebook', 'linkedin', 'youtube', 'twitter', 'tiktok', 'snapchat', 'pinterest', 'other'],
      lowercase: true,
      trim: true
    },
    handle: {
      type: String,
      required: false,
      trim: true
    },
    url: {
      type: String,
      required: false,
      trim: true
    },
    followers: {
      actual: {
        type: Number,
        min: 0,
        default: 0
      },
      bought: {
        type: Number,
        min: 0,
        default: 0
      }
    },
    engagement: {
      averagePerPost: {
        type: Number,
        min: 0,
        default: 0
      },
      topEngagementPerPost: {
        type: Number,
        min: 0,
        default: 0
      },
      maximumLikes: {
        type: Number,
        min: 0,
        default: 0
      }
    },
    // Platform-specific metrics
    metrics: {
      videosPosted: {
        type: Number,
        min: 0,
        default: 0
      },
      postsCount: {
        type: Number,
        min: 0,
        default: 0
      },
      averageViews: {
        type: Number,
        min: 0,
        default: 0
      },
      subscribers: {
        type: Number,
        min: 0,
        default: 0
      }
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  website: String,
  genre: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'genre',
    required: false
  }],
  workType: {
    type: String,
    enum: ['full-time', 'part-time', 'freelance'],
    required: false
  },
  influencerSince: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear(),
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['influencer', 'admin'],
    default: 'influencer'
  }
}, {timestamps: true});

influencerSchema.pre('validate', function (next) {
  if (!this.phone && !this.email) {
    this.invalidate('phone', 'Either phone or email is required.');
    this.invalidate('email', 'Either phone or email is required.');
  }
  next();
});

// Helper method to add or update social media platform
influencerSchema.methods.addSocialMedia = function(platformData) {
  const existingIndex = this.socialMedia.findIndex(
    sm => sm.platform === platformData.platform.toLowerCase()
  );
  
  if (existingIndex > -1) {
    // Update existing platform
    this.socialMedia[existingIndex] = {
      ...this.socialMedia[existingIndex].toObject(),
      ...platformData,
      platform: platformData.platform.toLowerCase()
    };
  } else {
    // Add new platform
    this.socialMedia.push({
      ...platformData,
      platform: platformData.platform.toLowerCase()
    });
  }
};

// Helper method to get social media by platform
influencerSchema.methods.getSocialMediaByPlatform = function(platform) {
  return this.socialMedia.find(sm => sm.platform === platform.toLowerCase());
};

// Helper method to remove social media platform
influencerSchema.methods.removeSocialMedia = function(platform) {
  this.socialMedia = this.socialMedia.filter(
    sm => sm.platform !== platform.toLowerCase()
  );
};

// Helper method to get total followers across all platforms
influencerSchema.methods.getTotalFollowers = function() {
  return this.socialMedia.reduce((total, sm) => {
    return total + (sm.followers?.actual || 0);
  }, 0);
};

// Helper method to get active social media platforms
influencerSchema.methods.getActivePlatforms = function() {
  return this.socialMedia.filter(sm => sm.isActive);
};

// Transform output
influencerSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  return userObject;
};

export default mongoose.model('influencers', influencerSchema);
