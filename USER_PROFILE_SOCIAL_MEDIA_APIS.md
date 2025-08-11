# User Profile & Social Media Update APIs Documentation

This document provides comprehensive API documentation for User Profile management and Social Media updates in the InfluenceMe Mobile Backend. These APIs enable dynamic social media platform management with the latest array-based structure.

## Base Information

- **Base URL**: `http://your-server.com/api/users`
- **Authentication**: Bearer Token (JWT) required for profile operations
- **Content-Type**: `application/json` or `multipart/form-data` (for file uploads)
- **Response Format**: JSON with consistent structure

## Authentication

Profile management endpoints require authentication. Include the JWT token in the request headers:

```http
Authorization: Bearer <your-jwt-token>
```

---

## User Profile Data Model

### Complete User Profile Structure

```javascript
{
  "id": "string",                        // User ID
  "name": "string",                      // Display name (required)
  "phone": "string",                     // Phone number (unique, optional)
  "phoneCode": "string",                 // Country phone code (+91, +1, etc.)
  "email": "string",                     // Email address (unique, optional)
  "about": "string",                     // Profile description (max 500 chars)
  "dateOfBirth": "string",               // ISO date string
  "spokenLanguages": ["string"],         // Array of languages
  "country": "string",                   // Country name
  "addresses": {                         // Address object
    "streetAddress": "string",
    "state": "string", 
    "country": "string",
    "pinCode": "string",
    "latitude": "string",
    "longitude": "string"
  },
  "maritalStatus": "string",             // "single" | "married" | "divorced" | "widowed"
  "children": "number",                  // Number of children (min: 0)
  "pets": "number",                      // Number of pets (min: 0)
  "media": ["ObjectId"],                 // Array of media file references
  "influencerType": "string",            // "micro" | "macro" | "mega" | "nano"
  "socialMedia": [                       // Dynamic social media array
    {
      "platform": "string",             // Platform name (required)
      "handle": "string",               // Username/handle
      "url": "string",                  // Profile URL
      "followers": {
        "actual": "number",             // Real followers count
        "bought": "number"              // Bought followers count
      },
      "engagement": {
        "averagePerPost": "number",     // Average engagement per post
        "topEngagementPerPost": "number", // Highest engagement on single post
        "maximumLikes": "number"        // Maximum likes received
      },
      "metrics": {
        "videosPosted": "number",       // Total videos posted
        "postsCount": "number",         // Total posts count
        "averageViews": "number",       // Average views per content
        "subscribers": "number"         // Subscriber count (YouTube)
      },
      "isVerified": "boolean",          // Platform verification status
      "isActive": "boolean",            // Whether platform is active
      "addedAt": "string"               // When platform was added (ISO date)
    }
  ],
  "website": "string",                   // Personal website URL
  "genre": ["ObjectId"],                 // Array of genre references
  "workType": "string",                  // "full-time" | "part-time" | "freelance"
  "influencerSince": "number",           // Year started influencing
  "isActive": "boolean",                 // Account status
  "role": "string",                      // "influencer" | "admin"
  "createdAt": "string",                 // ISO timestamp
  "updatedAt": "string"                  // ISO timestamp
}
```

### Supported Social Media Platforms

- `instagram` - Instagram
- `facebook` - Facebook
- `linkedin` - LinkedIn
- `youtube` - YouTube
- `twitter` - Twitter/X
- `tiktok` - TikTok
- `snapchat` - Snapchat
- `pinterest` - Pinterest
- `other` - Other platforms

---

## API Endpoints

### 1. Get User Profile

**Endpoint**: `GET /api/users/profile`  
**Authentication**: Required  

#### Request

```http
GET /api/users/profile
Authorization: Bearer <your-jwt-token>
```

#### Response

```javascript
{
  "status": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "64f1234567890abcdef12345",
    "name": "John Doe",
    "phone": "1234567890",
    "phoneCode": "+1",
    "email": "john@example.com",
    "about": "Tech influencer specializing in mobile apps and gadgets",
    "dateOfBirth": "1995-01-15T00:00:00.000Z",
    "spokenLanguages": ["English", "Spanish"],
    "country": "United States",
    "addresses": {
      "streetAddress": "123 Tech Street",
      "state": "California", 
      "country": "United States",
      "pinCode": "90210",
      "latitude": "34.0522",
      "longitude": "-118.2437"
    },
    "maritalStatus": "single",
    "children": 0,
    "pets": 1,
    "media": ["64f1234567890abcdef12346"],
    "influencerType": "micro",
    "socialMedia": [
      {
        "platform": "instagram",
        "handle": "@johndoe_tech",
        "url": "https://instagram.com/johndoe_tech",
        "followers": {
          "actual": 50000,
          "bought": 0
        },
        "engagement": {
          "averagePerPost": 2500,
          "topEngagementPerPost": 8000,
          "maximumLikes": 12000
        },
        "metrics": {
          "postsCount": 200,
          "averageViews": 5000
        },
        "isVerified": true,
        "isActive": true,
        "addedAt": "2024-01-01T10:00:00.000Z"
      },
      {
        "platform": "youtube",
        "handle": "JohnDoeTech",
        "url": "https://youtube.com/@johndoetech",
        "followers": {
          "actual": 25000,
          "bought": 0
        },
        "metrics": {
          "videosPosted": 120,
          "subscribers": 25000,
          "averageViews": 15000
        },
        "isVerified": false,
        "isActive": true,
        "addedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "website": "https://johndoe.tech",
    "genre": ["64f1234567890abcdef12347"],
    "workType": "full-time",
    "influencerSince": 2020,
    "role": "influencer",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-09T12:00:00.000Z"
  }
}
```

---

### 2. Update User Profile

**Endpoint**: `PUT /api/users/profile`  
**Authentication**: Required  
**Content-Type**: `application/json` or `multipart/form-data`

#### Request Body (JSON)

```javascript
{
  "name": "John Doe Updated",
  "about": "Updated: Tech influencer specializing in AI and mobile apps",
  "country": "Canada",
  "spokenLanguages": ["English", "French"],
  "maritalStatus": "married",
  "children": 1,
  "pets": 2,
  "addresses": {
    "streetAddress": "456 New Tech Avenue",
    "state": "Ontario",
    "country": "Canada",
    "pinCode": "K1A 0A6",
    "latitude": "45.4215",
    "longitude": "-75.6972"
  },
  "socialMedia": [
    {
      "platform": "instagram",
      "handle": "@johndoe_tech_ca",
      "url": "https://instagram.com/johndoe_tech_ca",
      "followers": {
        "actual": 55000,
        "bought": 0
      },
      "engagement": {
        "averagePerPost": 2750,
        "topEngagementPerPost": 9000,
        "maximumLikes": 15000
      },
      "metrics": {
        "postsCount": 220,
        "averageViews": 5500
      },
      "isVerified": true,
      "isActive": true
    },
    {
      "platform": "tiktok",
      "handle": "@johndoetech",
      "url": "https://tiktok.com/@johndoetech",
      "followers": {
        "actual": 75000,
        "bought": 0
      },
      "engagement": {
        "averagePerPost": 3750,
        "topEngagementPerPost": 12000,
        "maximumLikes": 50000
      },
      "metrics": {
        "videosPosted": 150,
        "averageViews": 25000
      },
      "isVerified": false,
      "isActive": true
    }
  ],
  "workType": "freelance",
  "influencerSince": 2019
}
```

#### Response

```javascript
{
  "status": true,
  "message": "User profile updated successfully",
  "data": {
    "_id": "64f1234567890abcdef12345",
    "name": "John Doe Updated",
    "phone": "1234567890",
    "email": "john@example.com",
    "role": "influencer",
    "media": ["64f1234567890abcdef12346"],
    "genre": ["64f1234567890abcdef12347"],
    "updatedAt": "2024-01-09T15:30:00.000Z"
  }
}
```

---

### 3. Get All Users (with Filtering)

**Endpoint**: `GET /api/users`  
**Authentication**: Not required (public)  

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | Number | Page number | `page=1` |
| `limit` | Number | Items per page | `limit=20` |
| `country` | String | Filter by country | `country=India` |
| `influencerType` | String | Filter by influencer type | `influencerType=micro` |
| `workType` | String | Filter by work type | `workType=full-time` |
| `genre` | String | Comma-separated genre IDs | `genre=id1,id2` |
| `maritalStatus` | String | Filter by marital status | `maritalStatus=single` |
| `minFollowers` | Number | Minimum followers count | `minFollowers=10000` |
| `platform` | String | Filter by social platform | `platform=instagram` |
| `name` | String | Search by name | `name=john` |
| `sortBy` | String | Sort field | `sortBy=createdAt` |
| `sortOrder` | String | Sort order | `sortOrder=desc` |

#### Example Request

```http
GET /api/users?country=India&influencerType=micro&platform=instagram&minFollowers=5000&page=1&limit=10
```

#### Response

```javascript
{
  "status": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        // ... user objects with all profile data
      }
    ],
    "filters": {
      "applied": {
        "country": "India",
        "influencerType": "micro",
        "platform": "instagram",
        "minFollowers": "5000"
      },
      "available": {
        "countries": ["India", "United States", "Canada", "..."],
        "influencerTypes": ["micro", "macro", "mega", "nano"],
        "workTypes": ["full-time", "part-time", "freelance"],
        "maritalStatuses": ["single", "married", "divorced", "widowed"]
      }
    }
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 5
  }
}
```

---

## Social Media Management

### Adding New Social Media Platform

To add a new social media platform, include it in the `socialMedia` array during profile update:

```javascript
{
  "socialMedia": [
    // ... existing platforms
    {
      "platform": "linkedin",
      "handle": "johndoe-tech",
      "url": "https://linkedin.com/in/johndoe-tech",
      "followers": {
        "actual": 5000,
        "bought": 0
      },
      "engagement": {
        "averagePerPost": 250,
        "topEngagementPerPost": 800,
        "maximumLikes": 1200
      },
      "metrics": {
        "postsCount": 50,
        "averageViews": 1000
      },
      "isVerified": false,
      "isActive": true
    }
  ]
}
```

### Updating Existing Platform

To update an existing platform, include the platform with updated data. The system will find and update the existing platform based on the `platform` field:

```javascript
{
  "socialMedia": [
    {
      "platform": "instagram",
      "followers": {
        "actual": 60000,  // Updated follower count
        "bought": 0
      },
      "engagement": {
        "averagePerPost": 3000,  // Updated engagement
        "topEngagementPerPost": 10000,
        "maximumLikes": 18000
      },
      "metrics": {
        "postsCount": 250,  // Updated post count
        "averageViews": 6000
      }
    }
  ]
}
```

### Removing Platform

To remove a platform, you can either:

1. **Set isActive to false:**
```javascript
{
  "socialMedia": [
    {
      "platform": "twitter",
      "isActive": false  // Deactivate platform
    }
  ]
}
```

2. **Send array without the platform** (it will be removed from the profile)

---

## Helper Methods Available in Model

The Influencer model includes several helper methods for social media management:

### addSocialMedia(platformData)
Adds or updates a social media platform:

```javascript
// Usage in controller or business logic
user.addSocialMedia({
  platform: "instagram",
  handle: "@newhandle",
  followers: { actual: 1000, bought: 0 },
  isActive: true
});
await user.save();
```

### getSocialMediaByPlatform(platform)
Retrieves specific platform data:

```javascript
const instagramData = user.getSocialMediaByPlatform('instagram');
```

### removeSocialMedia(platform)
Removes a platform completely:

```javascript
user.removeSocialMedia('twitter');
await user.save();
```

### getTotalFollowers()
Calculates total followers across all platforms:

```javascript
const totalFollowers = user.getTotalFollowers();
```

### getActivePlatforms()
Gets only active platforms:

```javascript
const activePlatforms = user.getActivePlatforms();
```

---

## Usage Examples

### React/JavaScript Integration

```javascript
// Complete profile update with social media
const updateUserProfile = async (profileData) => {
  try {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    const result = await response.json();
    
    if (result.status) {
      console.log('Profile updated successfully');
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Profile update failed:', error);
    throw error;
  }
};

// Add new social media platform
const addInstagramAccount = async () => {
  const currentProfile = await getCurrentProfile();
  
  const updatedSocialMedia = [
    ...(currentProfile.socialMedia || []),
    {
      platform: "instagram",
      handle: "@mynewhandle",
      url: "https://instagram.com/mynewhandle",
      followers: {
        actual: 5000,
        bought: 0
      },
      engagement: {
        averagePerPost: 250,
        topEngagementPerPost: 800,
        maximumLikes: 1200
      },
      isVerified: false,
      isActive: true
    }
  ];
  
  return await updateUserProfile({
    socialMedia: updatedSocialMedia
  });
};

// Update specific platform metrics
const updateInstagramMetrics = async (newMetrics) => {
  const currentProfile = await getCurrentProfile();
  
  const updatedSocialMedia = currentProfile.socialMedia.map(platform => {
    if (platform.platform === 'instagram') {
      return {
        ...platform,
        ...newMetrics,
        platform: 'instagram' // Ensure platform field is preserved
      };
    }
    return platform;
  });
  
  return await updateUserProfile({
    socialMedia: updatedSocialMedia
  });
};

// Search influencers with specific criteria
const searchInfluencers = async (filters) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      queryParams.append(key, filters[key]);
    }
  });
  
  try {
    const response = await fetch(`/api/users?${queryParams.toString()}`);
    const result = await response.json();
    
    return result.status ? result.data : [];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
};
```

### React Hook for Profile Management

```javascript
import { useState, useEffect, useCallback } from 'react';

const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      if (result.status) {
        setProfile(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates) => {
    try {
      setError(null);
      const result = await updateUserProfile(updates);
      setProfile(prev => ({ ...prev, ...updates }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Social media specific methods
  const addSocialMediaPlatform = useCallback(async (platformData) => {
    const updatedSocialMedia = [
      ...(profile?.socialMedia || []),
      platformData
    ];
    return await updateProfile({ socialMedia: updatedSocialMedia });
  }, [profile, updateProfile]);

  const updateSocialMediaPlatform = useCallback(async (platform, updates) => {
    const updatedSocialMedia = profile?.socialMedia?.map(sm => 
      sm.platform === platform ? { ...sm, ...updates } : sm
    ) || [];
    return await updateProfile({ socialMedia: updatedSocialMedia });
  }, [profile, updateProfile]);

  const removeSocialMediaPlatform = useCallback(async (platform) => {
    const updatedSocialMedia = profile?.socialMedia?.filter(
      sm => sm.platform !== platform
    ) || [];
    return await updateProfile({ socialMedia: updatedSocialMedia });
  }, [profile, updateProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    addSocialMediaPlatform,
    updateSocialMediaPlatform,
    removeSocialMediaPlatform,
    refetch: fetchProfile
  };
};
```

---

## Validation Rules

### Required Fields
- `name`: Required, trimmed string
- Either `phone` OR `email` must be provided (enforced by pre-validation hook)

### Field Constraints
- `about`: Maximum 500 characters
- `phone`: Must be unique if provided
- `email`: Must be unique if provided, automatically lowercase
- `children`: Minimum 0
- `pets`: Minimum 0
- `influencerSince`: Must be between 1900 and current year
- `socialMedia[].platform`: Must be one of the supported platforms
- `socialMedia[].followers.actual`: Minimum 0
- `socialMedia[].followers.bought`: Minimum 0

### Social Media Platform Rules
- `platform`: Required, automatically converted to lowercase
- `handle` and `url`: Optional but recommended
- `followers`, `engagement`, `metrics`: All numeric fields default to 0
- `isVerified`: Defaults to false
- `isActive`: Defaults to true
- `addedAt`: Automatically set to current date

---

## Error Handling

### Common Error Responses

| Status Code | Error Type | Description |
|------------|------------|-------------|
| 400 | Bad Request | Invalid media/genre IDs, validation errors |
| 401 | Unauthorized | Invalid or missing authentication token |
| 404 | Not Found | User not found |
| 500 | Internal Server Error | Server-side errors |

### Error Response Format

```javascript
{
  "status": false,
  "message": "Descriptive error message"
}
```

### Common Validation Errors

- `"Either phone or email is required."`
- `"One or more provided media IDs are invalid."`
- `"One or more provided genre IDs are invalid."`
- `"User not found"`
- `"Server error"`

---

## Migration from Old Structure

If you have existing data with the old individual platform fields (instagram, facebook, etc.), you need to migrate to the new `socialMedia` array structure. The mobile backend includes migration scripts and helper methods to handle this transition smoothly.

### Migration Script Usage

```bash
# Run migration script (if available)
node scripts/migrate-to-dynamic-social-media.js
```

---

## Security Considerations

1. **Authentication Required**: All profile operations require valid JWT tokens
2. **User Isolation**: Users can only access and modify their own profiles
3. **Input Validation**: All inputs are validated server-side
4. **Sensitive Data**: Password fields are automatically excluded from responses
5. **File Upload Security**: Media files are validated and stored securely

---

## Performance Optimization

1. **Populated Fields**: Profile responses include populated genre and media data
2. **Pagination**: User listing supports pagination for large datasets
3. **Filtering**: Advanced filtering options for efficient user discovery
4. **Indexing**: Database indexes on frequently queried fields
5. **Lean Queries**: User listing uses lean() for better performance

---

## API Documentation Paths

### For Frontend Agent Integration:

1. **Main Documentation**: `/Users/devendrasingh/WebstormProjects/influenceme_mobile_backend/USER_PROFILE_SOCIAL_MEDIA_APIS.md` (This file)

2. **Related Documentation Files**:
   - Authentication APIs: `/Users/devendrasingh/WebstormProjects/influenceme_mobile_backend/documentation/flows/authentication.md`
   - Campaign APIs: `/Users/devendrasingh/WebstormProjects/influenceme_mobile_backend/CAMPAIGN_APIS_DOCUMENTATION.md`
   - Chat System APIs: `/Users/devendrasingh/WebstormProjects/influenceme_mobile_backend/documentation/flows/chat-system.md`
   - API Usage Examples: `/Users/devendrasingh/WebstormProjects/influenceme_mobile_backend/documentation/examples/api-usage.md`
   - Social Media Structure: `/Users/devendrasingh/WebstormProjects/influenceme_mobile_backend/docs/SOCIAL_MEDIA_STRUCTURE.md`

3. **Model Files**:
   - Updated Influencer Model: `/Users/devendrasingh/WebstormProjects/influenceme_mobile_backend/models/influencer.js`
   - User Controller: `/Users/devendrasingh/WebstormProjects/influenceme_mobile_backend/controllers/user/userController.js`
   - User Routes: `/Users/devendrasingh/WebstormProjects/influenceme_mobile_backend/routes/user/userRoutes.js`

---

**Last Updated**: January 2025  
**API Version**: 1.0.3  
**Documentation Version**: 1.0.0
