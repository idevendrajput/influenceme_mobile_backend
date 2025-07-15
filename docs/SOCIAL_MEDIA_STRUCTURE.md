# Social Media Object Structure

This document describes the new social media object structure for the influencer model.

## Overview

The social media fields have been restructured from simple strings and numbers to objects that provide more detailed information about each platform.

## Data Structure

### Instagram
```javascript
instagram: {
  url: String,  // Instagram profile URL
  followers: {
    actual: Number,  // Actual number of followers
    bought: Number   // Number of bought followers
  },
  engagement: {
    averagePerPost: Number,          // Average engagement per post
    topEngagementPerPost: Number,    // Top engagement on a post
    maximumLikesPerPost: Number      // Maximum likes received on a post
  }
}
```

### Facebook
```javascript
facebook: {
  url: String,  // Facebook profile URL
  followers: {
    actual: Number,  // Actual number of followers
    bought: Number   // Number of bought followers
  }
}
```

### LinkedIn
```javascript
linkedin: {
  url: String,  // LinkedIn profile URL
  followers: {
    actual: Number,  // Actual number of followers
    bought: Number   // Number of bought followers
  }
}
```

### YouTube
```javascript
youtube: {
  url: String,                    // YouTube channel URL
  followers: Number,              // Number of subscribers
  videosPosted: Number,           // Total number of videos posted
  maximumLikesPerVideo: Number    // Maximum likes received on a video
}
```

## API Usage

### Creating/Updating an Influencer

When creating or updating an influencer profile, you can send the social media data in the new object format:

```javascript
// Example request body
{
  "instagram": {
    "url": "https://instagram.com/username",
    "followers": {
      "actual": 10000,
      "bought": 500
    },
    "engagement": {
      "averagePerPost": 1250,
      "topEngagementPerPost": 3000,
      "maximumLikesPerPost": 5000
    }
  },
  "facebook": {
    "url": "https://facebook.com/username",
    "followers": {
      "actual": 8000,
      "bought": 200
    }
  },
  "linkedin": {
    "url": "https://linkedin.com/in/username",
    "followers": {
      "actual": 3000,
      "bought": 0
    }
  },
  "youtube": {
    "url": "https://youtube.com/channel/username",
    "followers": 15000,
    "videosPosted": 120,
    "maximumLikesPerVideo": 2500
  }
}
```

### Partial Updates

You can update individual fields within the social media objects:

```javascript
// Update only Instagram followers
{
  "instagram": {
    "followers": {
      "actual": 12000
    }
  }
}

// Update only YouTube video count
{
  "youtube": {
    "videosPosted": 125
  }
}
```

## Migration

If you have existing data with the old structure, use the migration script:

```bash
node scripts/migrate-social-media.js
```

This will convert:
- `instagram` (string) → `instagram.url`
- `instagramFollowers` (number) → `instagram.followers.actual`
- `facebook` (string) → `facebook.url`
- `facebookFollowers` (number) → `facebook.followers.actual`
- `linkedin` (string) → `linkedin.url`
- `linkedInFollowers` (number) → `linkedin.followers.actual`
- `youtube` (string) → `youtube.url`
- `youTubeSubscribers` (number) → `youtube.followers`

## Query Examples

### Filter by minimum followers
```javascript
// Find influencers with at least 10k actual Instagram followers
GET /api/users?minFollowers=10000
```

### Sort by engagement
```javascript
// Sort by Instagram engagement (requires custom sort implementation)
// This would need to be added to the controller if needed
```

## Breaking Changes

1. **Field Names**: Old fields like `instagramFollowers`, `facebookFollowers`, etc. are no longer supported
2. **Data Format**: Social media data is now nested objects instead of simple strings/numbers
3. **API Responses**: All API responses now return the new object structure

## Benefits

1. **More Detailed Data**: Can track both actual and bought followers
2. **Engagement Metrics**: Instagram engagement data is now stored
3. **Extensibility**: Easy to add new fields to each platform
4. **Consistency**: All platforms follow a similar structure
5. **Better Analytics**: More data points for analysis and reporting
