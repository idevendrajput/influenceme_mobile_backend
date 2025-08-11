# Social Media Management Flow

This document covers the dynamic social media management system, including the new flexible array-based structure, migration from old individual fields, and platform-specific handling.

## Overview

The social media management system has been redesigned to support unlimited social media platforms through a dynamic array structure, replacing the previous individual field approach (instagram, facebook, etc.).

## Architecture Change

### Old Structure (Deprecated)
```javascript
// Individual fields for each platform
{
  instagram: { url: "...", followers: { actual: 1000, bought: 0 } },
  facebook: { url: "...", followers: { actual: 500, bought: 0 } },
  linkedin: { url: "...", followers: { actual: 200, bought: 0 } },
  youtube: { url: "...", followers: 100, videosPosted: 10 }
}
```

### New Structure (Current)
```javascript
// Dynamic array supporting any platform
{
  socialMedia: [
    {
      platform: "instagram",
      handle: "@username",
      url: "https://instagram.com/username",
      followers: { actual: 1000, bought: 0 },
      engagement: { averagePerPost: 50, topEngagementPerPost: 100 },
      metrics: { postsCount: 150 },
      isVerified: true,
      isActive: true
    },
    {
      platform: "youtube",
      handle: "ChannelName",
      url: "https://youtube.com/@channel",
      followers: { actual: 2000, bought: 0 },
      metrics: { videosPosted: 25, subscribers: 2000, averageViews: 5000 },
      isVerified: false,
      isActive: true
    }
  ]
}
```

## Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Add Social    │    │ Update Existing  │    │ Remove Social   │
│   Platform      │    │   Platform       │    │   Platform      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Validate      │    │   Find Existing  │    │   Filter Out    │
│   Platform      │    │   Platform       │    │   Platform      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Add to Array    │    │ Update Platform  │    │  Save Changes   │
│ Save Changes    │    │  Save Changes    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Social Media Schema

### Complete Schema Definition

```javascript
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
}]
```

### Supported Platforms

| Platform | Key Features | Specific Metrics |
|----------|-------------|-----------------|
| `instagram` | Stories, Posts, Reels | postsCount, averageViews |
| `youtube` | Videos, Subscribers | videosPosted, subscribers, averageViews |
| `facebook` | Posts, Pages | postsCount |
| `linkedin` | Professional content | postsCount |
| `twitter` | Tweets, Threads | postsCount |
| `tiktok` | Short videos | videosPosted, averageViews |
| `snapchat` | Stories, Snaps | postsCount |
| `pinterest` | Pins, Boards | postsCount |
| `other` | Custom platforms | General metrics |

## Helper Methods

The system provides built-in helper methods for managing social media platforms:

### 1. Add Social Media Platform

```javascript
// Add or update a platform
user.addSocialMedia({
  platform: 'instagram',
  handle: '@newinfluencer',
  url: 'https://instagram.com/newinfluencer',
  followers: {
    actual: 15000,
    bought: 500
  },
  engagement: {
    averagePerPost: 750,
    topEngagementPerPost: 1500,
    maximumLikes: 2500
  },
  metrics: {
    postsCount: 200
  },
  isVerified: true,
  isActive: true
});
```

**Logic**: If platform exists, it updates the existing entry. If not, it adds a new entry.

### 2. Get Platform Data

```javascript
// Get specific platform information
const instagramData = user.getSocialMediaByPlatform('instagram');

// Returns:
{
  platform: 'instagram',
  handle: '@username',
  url: 'https://instagram.com/username',
  followers: { actual: 15000, bought: 500 },
  // ... other fields
}
```

### 3. Remove Platform

```javascript
// Remove a platform entirely
user.removeSocialMedia('facebook');
```

### 4. Calculate Statistics

```javascript
// Get total followers across all platforms
const totalFollowers = user.getTotalFollowers();
// Returns: 45000 (sum of all actual followers)

// Get only active platforms
const activePlatforms = user.getActivePlatforms();
// Returns: array of platforms where isActive: true
```

## Data Processing

### Form Data Parser Integration

The system automatically processes social media data from various input formats:

```javascript
// Parse dynamic socialMedia array
if (parsed.socialMedia) {
  if (typeof parsed.socialMedia === 'string') {
    parsed.socialMedia = parseJSONField(parsed.socialMedia);
  }
  
  if (Array.isArray(parsed.socialMedia)) {
    parsed.socialMedia = parsed.socialMedia.map(platform => {
      // Parse follower numbers
      if (platform.followers) {
        if (platform.followers.actual !== undefined) {
          platform.followers.actual = parseNumberField(platform.followers.actual);
        }
        if (platform.followers.bought !== undefined) {
          platform.followers.bought = parseNumberField(platform.followers.bought);
        }
      }
      
      // Parse engagement metrics
      if (platform.engagement) {
        platform.engagement.averagePerPost = parseNumberField(platform.engagement.averagePerPost);
        platform.engagement.topEngagementPerPost = parseNumberField(platform.engagement.topEngagementPerPost);
        platform.engagement.maximumLikes = parseNumberField(platform.engagement.maximumLikes);
      }
      
      // Parse platform-specific metrics
      if (platform.metrics) {
        Object.keys(platform.metrics).forEach(key => {
          platform.metrics[key] = parseNumberField(platform.metrics[key]);
        });
      }
      
      // Parse boolean fields
      platform.isVerified = parseBooleanField(platform.isVerified);
      platform.isActive = parseBooleanField(platform.isActive);
      
      // Ensure platform name is lowercase
      platform.platform = platform.platform.toLowerCase();
      
      return platform;
    }).filter(platform => platform && platform.platform);
  }
}
```

### Input Format Examples

#### JSON String Format
```json
{
  "socialMedia": "[{\"platform\":\"instagram\",\"followers\":{\"actual\":\"10000\"}]"
}
```

#### Direct Array Format
```json
{
  "socialMedia": [
    {
      "platform": "instagram",
      "handle": "@user",
      "followers": {
        "actual": 10000,
        "bought": 0
      }
    }
  ]
}
```

#### Mixed Format Support
```json
{
  "socialMedia": {
    "platform": "instagram",
    "followers": {
      "actual": "5000"
    }
  }
}
```
*This will be converted to array format automatically*

## Platform-Specific Features

### Instagram Integration

```javascript
{
  platform: "instagram",
  handle: "@foodblogger",
  url: "https://instagram.com/foodblogger",
  followers: {
    actual: 50000,
    bought: 2000
  },
  engagement: {
    averagePerPost: 2500,
    topEngagementPerPost: 8000,
    maximumLikes: 15000
  },
  metrics: {
    postsCount: 500,
    averageViews: 3000 // for reels
  },
  isVerified: true,
  isActive: true
}
```

### YouTube Integration

```javascript
{
  platform: "youtube",
  handle: "TechReviewChannel",
  url: "https://youtube.com/@techreview",
  followers: {
    actual: 100000,
    bought: 0
  },
  engagement: {
    averagePerPost: 5000, // likes per video
    topEngagementPerPost: 15000,
    maximumLikes: 25000
  },
  metrics: {
    videosPosted: 150,
    subscribers: 100000,
    averageViews: 50000
  },
  isVerified: true,
  isActive: true
}
```

### TikTok Integration

```javascript
{
  platform: "tiktok",
  handle: "@dancer",
  url: "https://tiktok.com/@dancer",
  followers: {
    actual: 75000,
    bought: 0
  },
  engagement: {
    averagePerPost: 3750,
    topEngagementPerPost: 10000,
    maximumLikes: 50000
  },
  metrics: {
    videosPosted: 300,
    averageViews: 25000
  },
  isVerified: false,
  isActive: true
}
```

## Filtering and Querying

### Platform-Based Filtering

```javascript
// Find users with specific platform
db.users.find({
  "socialMedia.platform": "instagram"
});

// Find users with Instagram AND minimum followers
db.users.find({
  $and: [
    { "socialMedia.platform": "instagram" },
    { "socialMedia.followers.actual": { $gte: 10000 } }
  ]
});

// Find users with any platform having minimum followers
db.users.find({
  "socialMedia": {
    $elemMatch: {
      "followers.actual": { $gte: 10000 }
    }
  }
});
```

### Advanced Query Examples

```javascript
// Users with verified Instagram accounts
db.users.find({
  "socialMedia": {
    $elemMatch: {
      "platform": "instagram",
      "isVerified": true
    }
  }
});

// Users with YouTube channels having 100+ videos
db.users.find({
  "socialMedia": {
    $elemMatch: {
      "platform": "youtube",
      "metrics.videosPosted": { $gte: 100 }
    }
  }
});

// Users active on multiple platforms
db.users.find({
  $expr: {
    $gt: [
      { $size: { $filter: {
        input: "$socialMedia",
        cond: { $eq: ["$$this.isActive", true] }
      }}},
      1
    ]
  }
});
```

## API Integration

### Add/Update Social Media Platform

```javascript
// Add new platform
const addPlatform = async (token, platformData) => {
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      socialMedia: [platformData] // Will be merged with existing
    })
  });
  return response.json();
};

// Example usage
await addPlatform(token, {
  platform: 'tiktok',
  handle: '@mynewhandle',
  url: 'https://tiktok.com/@mynewhandle',
  followers: {
    actual: 5000,
    bought: 0
  },
  isVerified: false,
  isActive: true
});
```

### Get Social Media Statistics

```javascript
// Get user profile with social media data
const getUserSocialMedia = async (token) => {
  const response = await fetch('/api/users/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const result = await response.json();
  
  if (result.status) {
    const socialMedia = result.data.socialMedia;
    
    // Calculate total followers
    const totalFollowers = socialMedia.reduce((total, platform) => {
      return total + (platform.followers?.actual || 0);
    }, 0);
    
    // Get platform count
    const platformCount = socialMedia.filter(p => p.isActive).length;
    
    // Get verified platforms
    const verifiedPlatforms = socialMedia.filter(p => p.isVerified);
    
    return {
      platforms: socialMedia,
      totalFollowers,
      platformCount,
      verifiedCount: verifiedPlatforms.length
    };
  }
  
  return null;
};
```

## Migration System

### Migration Script

The system includes a migration script to convert old individual fields to the new dynamic array:

```bash
# Run migration
npm run migrate:dynamic-social-media -- --confirm
```

### Migration Process

1. **Find Users**: Locate users with old structure (instagram, facebook, linkedin, youtube fields)
2. **Convert Data**: Transform individual fields to socialMedia array format
3. **Preserve Data**: Maintain all existing metrics and engagement data
4. **Clean Up**: Remove old fields after successful conversion
5. **Validate**: Ensure data integrity after migration

### Migration Example

**Before Migration:**
```javascript
{
  instagram: {
    url: "https://instagram.com/user",
    followers: { actual: 10000, bought: 0 },
    engagement: { averagePerPost: 500 }
  },
  youtube: {
    url: "https://youtube.com/@user",
    followers: 5000,
    videosPosted: 50
  }
}
```

**After Migration:**
```javascript
{
  socialMedia: [
    {
      platform: "instagram",
      url: "https://instagram.com/user",
      followers: { actual: 10000, bought: 0 },
      engagement: { 
        averagePerPost: 500,
        topEngagementPerPost: 0,
        maximumLikes: 0
      },
      metrics: {},
      isVerified: false,
      isActive: true,
      addedAt: "2025-01-09T12:00:00.000Z"
    },
    {
      platform: "youtube",
      url: "https://youtube.com/@user",
      followers: { actual: 5000, bought: 0 },
      engagement: {
        averagePerPost: 0,
        topEngagementPerPost: 0,
        maximumLikes: 0
      },
      metrics: {
        videosPosted: 50,
        subscribers: 5000
      },
      isVerified: false,
      isActive: true,
      addedAt: "2025-01-09T12:00:00.000Z"
    }
  ]
}
```

## Validation Rules

### Platform Validation

```javascript
// Valid platforms
const validPlatforms = [
  'instagram', 'facebook', 'linkedin', 'youtube', 
  'twitter', 'tiktok', 'snapchat', 'pinterest', 'other'
];

// Platform name must be lowercase
platform = platform.toLowerCase();

// Platform must be from allowed list
if (!validPlatforms.includes(platform)) {
  throw new Error(`Invalid platform: ${platform}`);
}
```

### Follower Validation

```javascript
// Followers must be non-negative numbers
if (followers.actual < 0 || followers.bought < 0) {
  throw new Error('Follower counts must be non-negative');
}

// Bought followers cannot exceed actual followers
if (followers.bought > followers.actual) {
  throw new Error('Bought followers cannot exceed actual followers');
}
```

### URL Validation

```javascript
// Basic URL format validation
const urlPattern = /^https?:\/\/.+/;
if (url && !urlPattern.test(url)) {
  throw new Error('Invalid URL format');
}

// Platform-specific URL validation
const platformURLPatterns = {
  instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/,
  youtube: /^https?:\/\/(www\.)?youtube\.com\/.+/,
  tiktok: /^https?:\/\/(www\.)?tiktok\.com\/.+/
};
```

## Performance Optimization

### Database Indexes

```javascript
// Recommended indexes for social media queries
db.users.createIndex({ "socialMedia.platform": 1 });
db.users.createIndex({ "socialMedia.followers.actual": 1 });
db.users.createIndex({ "socialMedia.isActive": 1 });
db.users.createIndex({ "socialMedia.isVerified": 1 });

// Compound index for complex queries
db.users.createIndex({
  "socialMedia.platform": 1,
  "socialMedia.followers.actual": 1
});
```

### Query Optimization

```javascript
// Efficient platform filtering
const getUsersByPlatform = async (platform, minFollowers = 0) => {
  return await User.find({
    socialMedia: {
      $elemMatch: {
        platform: platform.toLowerCase(),
        "followers.actual": { $gte: minFollowers },
        isActive: true
      }
    }
  })
  .select('name socialMedia')
  .lean();
};
```

## Error Handling

### Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid platform" | Platform not in allowed list | Use valid platform names |
| "Negative follower count" | Negative numbers in followers | Ensure follower counts ≥ 0 |
| "Invalid URL format" | Malformed URL | Provide valid HTTP/HTTPS URLs |
| "Platform already exists" | Duplicate platform entry | Use update instead of add |

### Error Response Examples

```json
{
  "status": false,
  "message": "Invalid social media platform: instagramm",
  "data": null
}
```

```json
{
  "status": false,
  "message": "Follower count cannot be negative",
  "data": null
}
```

## Testing

### Unit Tests

```javascript
// Test platform addition
describe('Social Media Management', () => {
  test('should add new platform', () => {
    const user = new User();
    user.addSocialMedia({
      platform: 'instagram',
      followers: { actual: 1000, bought: 0 }
    });
    expect(user.socialMedia).toHaveLength(1);
    expect(user.socialMedia[0].platform).toBe('instagram');
  });
  
  test('should update existing platform', () => {
    const user = new User();
    user.addSocialMedia({
      platform: 'instagram',
      followers: { actual: 1000, bought: 0 }
    });
    user.addSocialMedia({
      platform: 'instagram',
      followers: { actual: 2000, bought: 0 }
    });
    expect(user.socialMedia).toHaveLength(1);
    expect(user.socialMedia[0].followers.actual).toBe(2000);
  });
});
```

### Integration Tests

```bash
# Test social media update endpoint
curl -X PUT "http://localhost:3001/api/users/profile" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "socialMedia": [
      {
        "platform": "instagram",
        "handle": "@testuser",
        "followers": {
          "actual": 5000,
          "bought": 0
        }
      }
    ]
  }'
```

---

**Last Updated**: January 2025  
**Flow Version**: 1.0.0
