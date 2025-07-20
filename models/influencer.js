import mongoose from 'mongoose';

const influencerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    default: null
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    default: null
  },
  fullName: {
    type: String,
    required: false,
    trim: true
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
  instagram: {
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
      maximumLikesPerPost: {
        type: Number,
        min: 0,
        default: 0
      }
    }
  },
  facebook: {
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
    }
  },
  linkedin: {
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
    }
  },
  youtube: {
    url: {
      type: String,
      required: false,
      trim: true
    },
    followers: {
      type: Number,
      min: 0,
      default: 0
    },
    videosPosted: {
      type: Number,
      min: 0,
      default: 0
    },
    maximumLikesPerVideo: {
      type: Number,
      min: 0,
      default: 0
    }
  },
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

// Transform output
influencerSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  return userObject;
};

export default mongoose.model('influencers', influencerSchema);
