# Social Media Structure Restructuring - Summary of Changes

## Overview
The social media fields in the influencer model have been restructured from simple strings and numbers to objects to better support the client's requirements for tracking detailed social media metrics.

## Files Modified

### 1. `models/influencer.js`
**Changes:**
- Removed simple fields: `instagram`, `facebook`, `linkedin`, `youtube` (as strings)
- Removed follower count fields: `instagramFollowers`, `facebookFollowers`, `linkedInFollowers`, `youTubeSubscribers`, `twitterFollowers`
- Added structured objects for each platform:

#### Instagram Object
```javascript
instagram: {
  url: String,
  followers: {
    actual: Number,
    bought: Number
  },
  engagement: {
    averagePerPost: Number,
    topEngagementPerPost: Number,
    maximumLikesPerPost: Number
  }
}
```

#### Facebook Object
```javascript
facebook: {
  url: String,
  followers: {
    actual: Number,
    bought: Number
  }
}
```

#### LinkedIn Object
```javascript
linkedin: {
  url: String,
  followers: {
    actual: Number,
    bought: Number
  }
}
```

#### YouTube Object
```javascript
youtube: {
  url: String,
  followers: Number,
  videosPosted: Number,
  maximumLikesPerVideo: Number
}
```

### 2. `controllers/user/userController.js`
**Changes:**
- Updated `getProfile()` to return new social media object structure
- Updated `updateProfile()` to handle nested object updates for social media
- Updated `getAllUsers()` filtering logic to work with new nested structure:
  - Changed `instagramFollowers` → `instagram.followers.actual`
  - Changed `facebookFollowers` → `facebook.followers.actual`
  - Changed `linkedInFollowers` → `linkedin.followers.actual`
  - Changed `youTubeSubscribers` → `youtube.followers`
- Removed `twitter` references as it wasn't in the new requirements

### 3. `utils/formDataParser.js`
**Changes:**
- Removed parsing for old fields: `instagramFollowers`, `facebookFollowers`, `linkedInFollowers`, `youTubeSubscribers`, `twitterFollowers`
- Added comprehensive parsing for new social media objects
- Added JSON parsing support for nested objects
- Added number field parsing for all numeric values in social media objects

### 4. `package.json`
**Changes:**
- Added migration script: `"migrate:social-media": "node scripts/migrate-social-media.js"`

## New Files Created

### 1. `scripts/migrate-social-media.js`
- Migration script to convert existing data from old structure to new structure
- Handles backward compatibility by mapping old fields to new object structure
- Includes option to remove old fields after migration

### 2. `docs/SOCIAL_MEDIA_STRUCTURE.md`
- Comprehensive documentation of the new social media object structure
- API usage examples
- Migration instructions
- Benefits and breaking changes

### 3. `CHANGES_SUMMARY.md`
- This file - summary of all changes made

## Migration Process

To migrate existing data:
```bash
npm run migrate:social-media
```

This will:
1. Convert `instagram` (string) → `instagram.url`
2. Convert `instagramFollowers` (number) → `instagram.followers.actual`
3. Convert `facebook` (string) → `facebook.url`
4. Convert `facebookFollowers` (number) → `facebook.followers.actual`
5. Convert `linkedin` (string) → `linkedin.url`
6. Convert `linkedInFollowers` (number) → `linkedin.followers.actual`
7. Convert `youtube` (string) → `youtube.url`
8. Convert `youTubeSubscribers` (number) → `youtube.followers`
9. Initialize new fields with default values

## Breaking Changes

1. **API Response Format**: All social media data now returns as objects instead of simple strings/numbers
2. **Request Format**: When updating profiles, social media data must be sent as objects
3. **Database Schema**: Old fields are replaced with new object structure
4. **Filtering**: Query parameters for filtering by followers now work on nested fields

## Benefits

1. **Detailed Tracking**: Can now track actual vs bought followers
2. **Engagement Metrics**: Instagram engagement data is now stored
3. **Extensibility**: Easy to add new fields to any platform
4. **Data Integrity**: Better validation and structure for social media data
5. **Analytics**: More data points available for analysis

## Testing

After migration, test the following:
1. User profile retrieval (`GET /api/users/profile`)
2. User profile updates (`PUT /api/users/profile`)
3. User listing with filters (`GET /api/users?minFollowers=1000`)
4. Social media object updates (partial updates)

## Client Integration

The frontend will need to update to:
1. Send social media data as objects instead of simple values
2. Handle the new response format for social media data
3. Update forms to capture the new fields (actual/bought followers, engagement metrics)
4. Update any filtering/sorting logic to work with nested fields
