# User Profile Management Flow

This document covers the complete user profile management system, including profile retrieval, updates, and user listing with filtering capabilities.

## Overview

The user profile system manages comprehensive influencer profiles with personal information, social media presence, and professional details. It supports dynamic social media management and advanced filtering capabilities.

## Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Get Profile    │    │  Update Profile  │    │   List Users    │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Populate Media  │    │  Parse Form Data │    │ Apply Filters   │
│ & Genre Data    │    │  Validate Data   │    │ & Pagination    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Return Complete │    │  Update Social   │    │ Return Filtered │
│ Profile Data    │    │  Media Array     │    │ User List       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Profile Management Endpoints

### 1. Get User Profile

**Endpoint**: `GET /api/users/profile`  
**Purpose**: Retrieve authenticated user's complete profile  
**Authentication**: Required (Bearer Token)

#### Request Format

```http
GET /api/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Response Format

```json
{
  "status": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com",
    "fullName": "John Doe",
    "dateOfBirth": "1995-01-15T00:00:00.000Z",
    "spokenLanguages": ["English", "Hindi"],
    "country": "India",
    "addresses": {
      "streetAddress": "123 Main Street",
      "state": "Maharashtra",
      "country": "India",
      "pinCode": "400001",
      "latitude": "19.0760",
      "longitude": "72.8777"
    },
    "role": "influencer",
    "maritalStatus": "single",
    "children": 0,
    "pets": 1,
    "media": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "filename": "profile_image.jpg",
        "originalName": "john_profile.jpg",
        "mimetype": "image/jpeg",
        "size": 1024768
      }
    ],
    "influencerType": "micro",
    "socialMedia": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "platform": "instagram",
        "handle": "@johndoe",
        "url": "https://instagram.com/johndoe",
        "followers": {
          "actual": 50000,
          "bought": 0
        },
        "engagement": {
          "averagePerPost": 2500,
          "topEngagementPerPost": 5000,
          "maximumLikes": 8000
        },
        "metrics": {
          "videosPosted": 0,
          "postsCount": 150,
          "averageViews": 0,
          "subscribers": 0
        },
        "isVerified": true,
        "isActive": true,
        "addedAt": "2025-01-09T12:00:00.000Z"
      }
    ],
    "website": "https://johndoe.com",
    "genre": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Technology",
        "icon": "tech-icon",
        "index": 1
      }
    ],
    "workType": "full-time",
    "influencerSince": 2020,
    "createdAt": "2025-01-09T10:00:00.000Z",
    "updatedAt": "2025-01-09T12:00:00.000Z"
  }
}
```

#### Business Logic

1. **Authentication**: Verify JWT token and extract user ID
2. **Data Retrieval**: Find user by ID with populated references
3. **Population**: Include genre and media details
4. **Response**: Return complete profile data

### 2. Update User Profile

**Endpoint**: `PUT /api/users/profile`  
**Purpose**: Update authenticated user's profile information  
**Authentication**: Required (Bearer Token)

#### Request Format

```json
{
  "name": "John Doe Updated",
  "about": "Professional tech influencer with 5 years of experience",
  "dateOfBirth": "1995-01-15",
  "spokenLanguages": ["English", "Hindi", "Spanish"],
  "country": "India",
  "addresses": {
    "streetAddress": "456 New Street",
    "state": "Maharashtra",
    "country": "India",
    "pinCode": "400002",
    "latitude": "19.0760",
    "longitude": "72.8777"
  },
  "maritalStatus": "married",
  "children": 1,
  "pets": 2,
  "socialMedia": [
    {
      "platform": "instagram",
      "handle": "@johndoe_updated",
      "url": "https://instagram.com/johndoe_updated",
      "followers": {
        "actual": 75000,
        "bought": 1000
      },
      "engagement": {
        "averagePerPost": 3500,
        "topEngagementPerPost": 7000,
        "maximumLikes": 12000
      },
      "metrics": {
        "postsCount": 200
      },
      "isVerified": true,
      "isActive": true
    },
    {
      "platform": "youtube",
      "handle": "JohnDoeChannel",
      "url": "https://youtube.com/@johndoe",
      "followers": {
        "actual": 25000,
        "bought": 0
      },
      "metrics": {
        "videosPosted": 45,
        "subscribers": 25000,
        "averageViews": 15000
      },
      "isVerified": false,
      "isActive": true
    }
  ],
  "website": "https://johndoe.com",
  "workType": "full-time",
  "influencerSince": 2020,
  "genre": ["507f1f77bcf86cd799439014", "507f1f77bcf86cd799439015"]
}
```

#### Response Format

```json
{
  "status": true,
  "message": "User profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe Updated",
    "phone": "1234567890",
    "email": "john@example.com",
    "fullName": "John Doe Updated",
    "role": "influencer",
    "media": [],
    "genre": [
      "507f1f77bcf86cd799439014",
      "507f1f77bcf86cd799439015"
    ],
    "updatedAt": "2025-01-09T14:00:00.000Z"
  }
}
```

#### Business Logic

1. **Form Data Parsing**: Process form data with proper type conversions
2. **Field Updates**: Update only provided fields (preserves existing data)
3. **Social Media Management**: Use dynamic `addSocialMedia()` method
4. **Validation**: Validate media and genre IDs if provided
5. **Address Handling**: Support nested address object updates
6. **Response**: Return basic updated user information

#### Update Validations

- **Media IDs**: Validate that provided media IDs exist in database
- **Genre IDs**: Validate that provided genre IDs exist in database
- **Social Media**: Validate platform names and structure
- **Data Types**: Automatic type conversion for numbers, dates, booleans

### 3. Get All Users (List Users)

**Endpoint**: `GET /api/users`  
**Purpose**: Retrieve list of users with filtering and pagination  
**Authentication**: None required (public endpoint)

#### Request Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | Number | Page number for pagination | `1` |
| `limit` | Number | Number of users per page | `10` |
| `country` | String | Filter by country | `India` |
| `influencerType` | String | Filter by influencer type | `micro` |
| `workType` | String | Filter by work type | `full-time` |
| `genre` | String | Comma-separated genre IDs | `id1,id2` |
| `maritalStatus` | String | Filter by marital status | `single` |
| `minFollowers` | Number | Minimum followers count | `1000` |
| `platform` | String | Filter by social media platform | `instagram` |
| `name` | String | Search by name | `john` |
| `sortBy` | String | Field to sort by | `createdAt` |
| `sortOrder` | String | Sort order (asc/desc) | `desc` |

#### Example Request

```http
GET /api/users?page=1&limit=5&country=India&minFollowers=5000&platform=instagram&sortBy=createdAt&sortOrder=desc
```

#### Response Format

```json
{
  "status": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "phone": "1234567890",
        "phoneCode": "+91",
        "email": "john@example.com",
        "about": "Professional tech influencer",
        "spokenLanguages": ["English", "Hindi"],
        "country": "India",
        "children": 0,
        "pets": 1,
        "media": [],
        "influencerType": "micro",
        "socialMedia": [
          {
            "platform": "instagram",
            "handle": "@johndoe",
            "url": "https://instagram.com/johndoe",
            "followers": {
              "actual": 50000,
              "bought": 0
            },
            "engagement": {
              "averagePerPost": 2500,
              "topEngagementPerPost": 5000,
              "maximumLikes": 8000
            },
            "isVerified": true,
            "isActive": true,
            "addedAt": "2025-01-09T12:00:00.000Z"
          }
        ],
        "genre": [],
        "isActive": true,
        "role": "influencer",
        "createdAt": "2025-01-09T10:00:00.000Z",
        "updatedAt": "2025-01-09T12:00:00.000Z"
      }
    ],
    "filters": {
      "applied": {
        "page": "1",
        "limit": "5",
        "country": "India",
        "minFollowers": "5000",
        "platform": "instagram"
      },
      "available": {
        "countries": ["India", "USA", "UK"],
        "influencerTypes": ["micro", "macro", "mega", "nano"],
        "workTypes": ["full-time", "part-time", "freelance"],
        "maritalStatuses": ["single", "married", "divorced", "widowed"]
      }
    }
  },
  "page": 1,
  "totalPages": 3
}
```

#### Advanced Filtering

##### Social Media Platform Filtering

The system supports filtering by specific social media platforms:

```javascript
// Filter users who have Instagram accounts
GET /api/users?platform=instagram

// Filter users with Instagram AND minimum followers
GET /api/users?platform=instagram&minFollowers=10000
```

##### Complex Query Logic

```javascript
// Users with minimum followers across any platform
filter.socialMedia = {
  $elemMatch: {
    "followers.actual": { $gte: minFollowers }
  }
};

// Users with specific platform AND minimum followers
filter.$and = [
  { socialMedia: { $elemMatch: { platform: "instagram" } } },
  { socialMedia: { $elemMatch: { "followers.actual": { $gte: minFollowers } } } }
];
```

## Data Processing Features

### Form Data Parser Integration

The system uses advanced form data parsing for handling complex nested objects:

```javascript
// Automatic type conversion
parsedData.children = parseNumberField(parsedData.children);
parsedData.dateOfBirth = parseDateField(parsedData.dateOfBirth);

// Social media array processing
if (parsedData.socialMedia && Array.isArray(parsedData.socialMedia)) {
  parsedData.socialMedia = parsedData.socialMedia.map(platform => {
    // Parse followers numbers
    if (platform.followers?.actual) {
      platform.followers.actual = parseNumberField(platform.followers.actual);
    }
    // Parse engagement metrics
    if (platform.engagement?.averagePerPost) {
      platform.engagement.averagePerPost = parseNumberField(platform.engagement.averagePerPost);
    }
    // Ensure platform name is lowercase
    platform.platform = platform.platform.toLowerCase();
    return platform;
  });
}
```

### Social Media Management

The system provides helper methods for managing social media platforms:

```javascript
// Add or update social media platform
user.addSocialMedia({
  platform: 'instagram',
  handle: '@newhandle',
  followers: { actual: 10000, bought: 0 }
});

// Get specific platform data
const instagramData = user.getSocialMediaByPlatform('instagram');

// Remove platform
user.removeSocialMedia('facebook');

// Get total followers across all platforms
const totalFollowers = user.getTotalFollowers();

// Get active platforms only
const activePlatforms = user.getActivePlatforms();
```

## Validation System

### Profile Update Validations

1. **Media Validation**:
   ```javascript
   if (parsedData.media && Array.isArray(parsedData.media)) {
     const existingMedia = await Media.find({ '_id': { $in: parsedData.media } });
     if (existingMedia.length !== parsedData.media.length) {
       return errorResponse(res, 'One or more provided media IDs are invalid.', 400);
     }
   }
   ```

2. **Genre Validation**:
   ```javascript
   if (parsedData.genre && Array.isArray(parsedData.genre)) {
     const existingGenres = await Genre.find({ '_id': { $in: parsedData.genre } });
     if (existingGenres.length !== parsedData.genre.length) {
       return errorResponse(res, 'One or more provided genre IDs are invalid.', 400);
     }
   }
   ```

3. **Social Media Validation**:
   - Platform names must be from allowed enum values
   - Follower counts must be non-negative numbers
   - URLs must be valid format (if provided)
   - Handle format validation

## Error Handling

### Common Error Scenarios

| Status Code | Error Message | Cause |
|------------|---------------|--------|
| 401 | "Not authorized, no token provided" | Missing authentication |
| 404 | "User not found" | Invalid user ID |
| 400 | "One or more provided media IDs are invalid" | Invalid media references |
| 400 | "One or more provided genre IDs are invalid" | Invalid genre references |
| 500 | "Server error" | Database or server issues |

### Error Response Format

```json
{
  "status": false,
  "message": "Error description",
  "data": null
}
```

## Integration Examples

### Frontend Profile Management

```javascript
// Get user profile
const getUserProfile = async (token) => {
  const response = await fetch('/api/users/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Update user profile
const updateUserProfile = async (token, profileData) => {
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  return response.json();
};

// Add social media platform
const addSocialMediaPlatform = async (token, platformData) => {
  const profile = await getUserProfile(token);
  const updatedSocialMedia = [...profile.data.socialMedia, platformData];
  
  return updateUserProfile(token, {
    socialMedia: updatedSocialMedia
  });
};
```

### User Listing with Filters

```javascript
// Advanced user search
const searchUsers = async (filters) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      queryParams.append(key, filters[key]);
    }
  });
  
  const response = await fetch(`/api/users?${queryParams.toString()}`);
  return response.json();
};

// Example usage
const results = await searchUsers({
  country: 'India',
  influencerType: 'micro',
  minFollowers: 5000,
  platform: 'instagram',
  page: 1,
  limit: 10
});
```

## Performance Considerations

### Database Optimization

1. **Indexes**: 
   - `country` field for location filtering
   - `influencerType` for type filtering  
   - `socialMedia.platform` for platform filtering
   - `socialMedia.followers.actual` for follower filtering

2. **Pagination**: 
   - Limit query results with skip/limit
   - Count documents separately for total pages

3. **Population**:
   - Selective population of only required fields
   - Lean queries for list endpoints

### Caching Recommendations

- Cache frequently accessed user profiles
- Cache filter option lists (countries, types, etc.)
- Implement Redis for session management
- Cache aggregated social media statistics

## Testing

### Manual Testing Commands

```bash
# Get user profile
curl -X GET "http://localhost:3001/api/users/profile" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Update profile
curl -X PUT "http://localhost:3001/api/users/profile" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "about": "Updated bio"}'

# List users with filters
curl -X GET "http://localhost:3001/api/users?country=India&minFollowers=1000&platform=instagram&limit=5"
```

### Test Scenarios

1. **Profile Retrieval**: Valid token, invalid token, non-existent user
2. **Profile Updates**: Valid data, invalid media IDs, invalid genre IDs
3. **Social Media**: Add platform, update platform, remove platform
4. **Filtering**: Single filters, combined filters, edge cases
5. **Pagination**: First page, middle pages, last page, out of range

---

**Last Updated**: January 2025  
**Flow Version**: 1.0.0
