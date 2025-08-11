# Influencer Schema Documentation

This document describes the complete Influencer schema structure, including the new dynamic social media array system.

## Schema Overview

The Influencer schema represents influencer profiles with comprehensive personal information, social media presence, and professional details. It has been updated to use a dynamic social media array structure for better flexibility and scalability.

## Complete Schema Definition

```javascript
const influencerSchema = new mongoose.Schema({
  // Basic Information
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
  
  // Personal Details
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
  
  // Media and Content
  media: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'media',
    required: false
  }],
  
  // Professional Information
  influencerType: {
    type: String,
    enum: ['micro', 'macro', 'mega', 'nano'],
    required: false
  },
  
  // Dynamic Social Media Array (NEW)
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
  
  // Additional Information
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
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['influencer', 'admin'],
    default: 'influencer'
  }
}, { timestamps: true });
```

## Field Descriptions

### Basic Information

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Full name of the influencer |
| `phone` | String | No* | Phone number (unique) |
| `phoneCode` | String | No | International phone code (e.g., "+91") |
| `email` | String | No* | Email address (unique) |
| `about` | String | No | Bio/description (max 500 characters) |

*Either `phone` + `phoneCode` OR `email` is required.

### Personal Details

| Field | Type | Description |
|-------|------|-------------|
| `dateOfBirth` | Date | Birth date |
| `spokenLanguages` | Array[String] | Languages spoken by influencer |
| `country` | String | Country of residence |
| `addresses` | Object | Address information |
| `addresses.streetAddress` | String | Street address |
| `addresses.state` | String | State/province |
| `addresses.country` | String | Country |
| `addresses.pinCode` | String | ZIP/postal code |
| `addresses.latitude` | String | GPS latitude |
| `addresses.longitude` | String | GPS longitude |
| `maritalStatus` | Enum | One of: 'single', 'married', 'divorced', 'widowed' |
| `children` | Number | Number of children (min: 0) |
| `pets` | Number | Number of pets (min: 0) |

### Professional Information

| Field | Type | Description |
|-------|------|-------------|
| `influencerType` | Enum | One of: 'micro', 'macro', 'mega', 'nano' |
| `website` | String | Personal/professional website URL |
| `workType` | Enum | One of: 'full-time', 'part-time', 'freelance' |
| `influencerSince` | Number | Year started influencing (1900 - current year) |

### Media and Content

| Field | Type | Description |
|-------|------|-------------|
| `media` | Array[ObjectId] | References to uploaded media files |
| `genre` | Array[ObjectId] | References to content genres |

### Social Media Array (Dynamic)

Each social media platform entry contains:

#### Core Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `platform` | Enum | Yes | Platform name (instagram, facebook, etc.) |
| `handle` | String | No | Username/handle (e.g., "@johndoe") |
| `url` | String | No | Direct URL to profile |

#### Follower Data
| Field | Type | Description |
|-------|------|-------------|
| `followers.actual` | Number | Real follower count |
| `followers.bought` | Number | Purchased follower count |

#### Engagement Metrics
| Field | Type | Description |
|-------|------|-------------|
| `engagement.averagePerPost` | Number | Average engagement per post |
| `engagement.topEngagementPerPost` | Number | Highest engagement on a single post |
| `engagement.maximumLikes` | Number | Maximum likes received |

#### Platform-Specific Metrics
| Field | Type | Description |
|-------|------|-------------|
| `metrics.videosPosted` | Number | Total videos posted |
| `metrics.postsCount` | Number | Total posts count |
| `metrics.averageViews` | Number | Average views per content |
| `metrics.subscribers` | Number | Subscriber count (YouTube, etc.) |

#### Status Fields
| Field | Type | Description |
|-------|------|-------------|
| `isVerified` | Boolean | Platform verification status |
| `isActive` | Boolean | Whether platform is currently active |
| `addedAt` | Date | When platform was added to profile |

### System Fields

| Field | Type | Description |
|-------|------|-------------|
| `isActive` | Boolean | Whether user account is active |
| `role` | Enum | One of: 'influencer', 'admin' |
| `createdAt` | Date | Account creation timestamp (auto) |
| `updatedAt` | Date | Last update timestamp (auto) |

## Validation Rules

### Pre-save Validation
```javascript
influencerSchema.pre('validate', function (next) {
  if (!this.phone && !this.email) {
    this.invalidate('phone', 'Either phone or email is required.');
    this.invalidate('email', 'Either phone or email is required.');
  }
  next();
});
```

### Field Validations

- **Name**: Required, trimmed
- **Email**: Unique, lowercase, trimmed, sparse index
- **Phone**: Unique with phoneCode combination, sparse index
- **About**: Maximum 500 characters
- **Children/Pets**: Non-negative numbers
- **InfluencerSince**: Between 1900 and current year
- **Platform**: Must be from allowed enum values
- **Follower Counts**: Non-negative numbers
- **URLs**: Should be valid HTTP/HTTPS format

## Helper Methods

The schema includes several helper methods for social media management:

### addSocialMedia(platformData)
```javascript
// Add or update a social media platform
user.addSocialMedia({
  platform: 'instagram',
  handle: '@newhandle',
  followers: { actual: 10000, bought: 0 }
});
```

### getSocialMediaByPlatform(platform)
```javascript
// Get specific platform data
const instagramData = user.getSocialMediaByPlatform('instagram');
```

### removeSocialMedia(platform)
```javascript
// Remove a platform
user.removeSocialMedia('facebook');
```

### getTotalFollowers()
```javascript
// Get sum of all actual followers across platforms
const total = user.getTotalFollowers();
```

### getActivePlatforms()
```javascript
// Get only active platforms
const active = user.getActivePlatforms();
```

## Database Indexes

### Recommended Indexes
```javascript
// Basic indexes
db.influencers.createIndex({ email: 1 });
db.influencers.createIndex({ phone: 1, phoneCode: 1 });
db.influencers.createIndex({ country: 1 });
db.influencers.createIndex({ influencerType: 1 });
db.influencers.createIndex({ isActive: 1 });

// Social media indexes
db.influencers.createIndex({ "socialMedia.platform": 1 });
db.influencers.createIndex({ "socialMedia.followers.actual": 1 });
db.influencers.createIndex({ "socialMedia.isActive": 1 });
db.influencers.createIndex({ "socialMedia.isVerified": 1 });

// Compound indexes
db.influencers.createIndex({ 
  "socialMedia.platform": 1, 
  "socialMedia.followers.actual": 1 
});
```

## Example Documents

### Basic Influencer
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "about": "Tech influencer passionate about mobile apps",
  "country": "India",
  "spokenLanguages": ["English", "Hindi"],
  "influencerType": "micro",
  "socialMedia": [
    {
      "platform": "instagram",
      "handle": "@johndoe",
      "url": "https://instagram.com/johndoe",
      "followers": {
        "actual": 15000,
        "bought": 0
      },
      "engagement": {
        "averagePerPost": 750,
        "topEngagementPerPost": 2000,
        "maximumLikes": 3500
      },
      "metrics": {
        "postsCount": 120
      },
      "isVerified": false,
      "isActive": true,
      "addedAt": "2025-01-09T12:00:00.000Z"
    }
  ],
  "role": "influencer",
  "isActive": true,
  "createdAt": "2025-01-09T10:00:00.000Z",
  "updatedAt": "2025-01-09T12:00:00.000Z"
}
```

### Multi-Platform Influencer
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "9876543210",
  "phoneCode": "+1",
  "about": "Lifestyle blogger and content creator",
  "country": "USA",
  "dateOfBirth": "1992-05-15T00:00:00.000Z",
  "spokenLanguages": ["English", "Spanish"],
  "maritalStatus": "married",
  "children": 1,
  "pets": 2,
  "addresses": {
    "streetAddress": "456 Oak Avenue",
    "state": "California",
    "country": "USA",
    "pinCode": "90210",
    "latitude": "34.0522",
    "longitude": "-118.2437"
  },
  "influencerType": "macro",
  "socialMedia": [
    {
      "platform": "instagram",
      "handle": "@janelifestyle",
      "url": "https://instagram.com/janelifestyle",
      "followers": {
        "actual": 250000,
        "bought": 5000
      },
      "engagement": {
        "averagePerPost": 12500,
        "topEngagementPerPost": 35000,
        "maximumLikes": 50000
      },
      "metrics": {
        "postsCount": 800,
        "averageViews": 18000
      },
      "isVerified": true,
      "isActive": true,
      "addedAt": "2023-01-15T10:00:00.000Z"
    },
    {
      "platform": "youtube",
      "handle": "Jane's Lifestyle",
      "url": "https://youtube.com/@janelifestyle",
      "followers": {
        "actual": 85000,
        "bought": 0
      },
      "engagement": {
        "averagePerPost": 4250,
        "topEngagementPerPost": 15000,
        "maximumLikes": 22000
      },
      "metrics": {
        "videosPosted": 120,
        "subscribers": 85000,
        "averageViews": 45000
      },
      "isVerified": true,
      "isActive": true,
      "addedAt": "2023-03-20T14:30:00.000Z"
    },
    {
      "platform": "tiktok",
      "handle": "@janesmith",
      "url": "https://tiktok.com/@janesmith",
      "followers": {
        "actual": 180000,
        "bought": 0
      },
      "engagement": {
        "averagePerPost": 9000,
        "topEngagementPerPost": 25000,
        "maximumLikes": 100000
      },
      "metrics": {
        "videosPosted": 450,
        "averageViews": 65000
      },
      "isVerified": false,
      "isActive": true,
      "addedAt": "2023-06-10T09:15:00.000Z"
    }
  ],
  "website": "https://janesmith.com",
  "workType": "full-time",
  "influencerSince": 2021,
  "role": "influencer",
  "isActive": true,
  "createdAt": "2023-01-10T08:00:00.000Z",
  "updatedAt": "2025-01-09T12:00:00.000Z"
}
```

## Migration from Old Structure

The schema has been updated from individual platform fields to a dynamic array. Use the migration script to convert existing data:

```bash
npm run migrate:dynamic-social-media -- --confirm
```

### Before Migration (Old Structure)
```json
{
  "instagram": {
    "url": "https://instagram.com/user",
    "followers": { "actual": 10000, "bought": 0 }
  },
  "youtube": {
    "url": "https://youtube.com/@user",
    "followers": 5000,
    "videosPosted": 50
  }
}
```

### After Migration (New Structure)
```json
{
  "socialMedia": [
    {
      "platform": "instagram",
      "url": "https://instagram.com/user",
      "followers": { "actual": 10000, "bought": 0 },
      "isActive": true
    },
    {
      "platform": "youtube",
      "url": "https://youtube.com/@user",
      "followers": { "actual": 5000, "bought": 0 },
      "metrics": { "videosPosted": 50, "subscribers": 5000 },
      "isActive": true
    }
  ]
}
```

## Query Examples

### Find by Platform
```javascript
// Users with Instagram accounts
db.influencers.find({
  "socialMedia.platform": "instagram"
});

// Verified Instagram users
db.influencers.find({
  "socialMedia": {
    $elemMatch: {
      "platform": "instagram",
      "isVerified": true
    }
  }
});
```

### Find by Follower Count
```javascript
// Users with 10k+ followers on any platform
db.influencers.find({
  "socialMedia.followers.actual": { $gte: 10000 }
});

// Instagram users with 50k+ followers
db.influencers.find({
  "socialMedia": {
    $elemMatch: {
      "platform": "instagram",
      "followers.actual": { $gte: 50000 }
    }
  }
});
```

---

**Last Updated**: January 2025  
**Schema Version**: 2.0.0
