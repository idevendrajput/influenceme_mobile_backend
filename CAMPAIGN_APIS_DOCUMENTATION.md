# Campaign APIs Documentation

This document provides comprehensive API documentation for the Campaign management system in the InfluenceMe platform. These APIs are designed for integration with frontend applications and AI agents.

## Base Information

- **Base URL**: `http://your-server.com/api`
- **Authentication**: Bearer Token (JWT) required for all endpoints
- **Content-Type**: `application/json` or `multipart/form-data` (for image uploads)
- **Response Format**: JSON

## Authentication

All campaign endpoints require authentication. Include the JWT token in the request headers:

```http
Authorization: Bearer <your-jwt-token>
```

---

## Campaign Data Model

### Campaign Object Structure

```javascript
{
  "id": "string",                    // Campaign ID
  "name": "string",                  // Campaign name (required)
  "image": "string",                 // Cloudinary image URL
  "type": "string",                  // "standard" | "auction"
  "compensationType": "string",      // "paid" | "barter"
  "status": "string",               // "draft" | "active" | "upcoming" | "paused" | "completed"
  "budget": "number",               // Required for paid campaigns
  "startDate": "string",            // ISO date string (required)
  "endDate": "string",              // ISO date string (required)
  "minBid": "number",              // Required for auction + paid campaigns
  "targetEngagement": "number",     // Required for standard campaigns
  "description": "string",          // Campaign description
  "barterDetails": "string",        // Required for barter campaigns
  "locations": ["string"],          // Array of location strings
  "deliverables": [                 // Array of deliverable objects
    {
      "type": "string",             // "post" | "story" | "reel" | "video" | "mention"
      "quantity": "number",         // Minimum 1
      "description": "string"       // Optional description
    }
  ],
  "createdBy": "string",            // User ID who created the campaign
  "createdAt": "string",            // ISO timestamp
  "updatedAt": "string"             // ISO timestamp
}
```

### Deliverable Types

- `post` - Social media post
- `story` - Story content
- `reel` - Reel/short video content
- `video` - Full video content
- `mention` - Brand mention

### Campaign Types

- `standard` - Fixed price campaign
- `auction` - Bidding-based campaign

### Compensation Types

- `paid` - Monetary compensation
- `barter` - Product/service exchange

### Campaign Status

- `draft` - Campaign is being created/edited
- `active` - Campaign is live and accepting applications
- `upcoming` - Campaign is scheduled for future
- `paused` - Campaign is temporarily stopped
- `completed` - Campaign has ended

---

## API Endpoints

### 1. Create Campaign

**Endpoint**: `POST /api/campaigns`  
**Authentication**: Required  
**Content-Type**: `multipart/form-data` (for image upload) or `application/json`

#### Request Body

```javascript
{
  "name": "Summer Fashion Campaign 2024",
  "type": "standard",
  "compensationType": "paid",
  "status": "draft",
  "budget": 5000,
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-06-30T23:59:59.000Z",
  "targetEngagement": 10000,
  "description": "Looking for fashion influencers to showcase our summer collection",
  "locations": ["New York", "Los Angeles", "Miami"],
  "deliverables": [
    {
      "type": "post",
      "quantity": 2,
      "description": "Instagram posts featuring summer outfits"
    },
    {
      "type": "story",
      "quantity": 5,
      "description": "Behind-the-scenes stories"
    }
  ]
}
```

#### Form Data Fields (when uploading image)

- `image`: File (optional) - Campaign image
- All other fields as above (can be sent as form data strings)
- Arrays should be JSON stringified: `deliverables: JSON.stringify([...])`

#### Response

```javascript
{
  "success": true,
  "message": "Campaign created successfully",
  "data": {
    "id": "60d5ecb74b24a1a3f8c9e1a2",
    "name": "Summer Fashion Campaign 2024",
    "image": "https://res.cloudinary.com/your-cloud/image/upload/v123456/campaigns/campaign.jpg",
    "type": "standard",
    "compensationType": "paid",
    "status": "draft",
    "budget": 5000,
    "startDate": "2024-06-01T00:00:00.000Z",
    "endDate": "2024-06-30T23:59:59.000Z",
    "targetEngagement": 10000,
    "description": "Looking for fashion influencers to showcase our summer collection",
    "locations": ["New York", "Los Angeles", "Miami"],
    "deliverables": [
      {
        "type": "post",
        "quantity": 2,
        "description": "Instagram posts featuring summer outfits"
      }
    ],
    "createdBy": "60d5ecb74b24a1a3f8c9e1a1",
    "createdAt": "2024-01-09T10:00:00.000Z",
    "updatedAt": "2024-01-09T10:00:00.000Z"
  }
}
```

#### Error Response

```javascript
{
  "success": false,
  "message": "Campaign name is required"
}
```

---

### 2. Get User Campaigns

**Endpoint**: `GET /api/campaigns`  
**Authentication**: Required  

#### Request

```http
GET /api/campaigns
Authorization: Bearer <your-jwt-token>
```

#### Response

```javascript
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "60d5ecb74b24a1a3f8c9e1a3",
      "name": "Holiday Campaign 2024",
      "image": "https://res.cloudinary.com/your-cloud/image/upload/v123456/campaigns/holiday.jpg",
      "type": "auction",
      "compensationType": "paid",
      "status": "active",
      "budget": 10000,
      "minBid": 500,
      "startDate": "2024-12-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z",
      "description": "Holiday season promotion campaign",
      "locations": ["Nationwide"],
      "deliverables": [...],
      "createdBy": "60d5ecb74b24a1a3f8c9e1a1",
      "createdAt": "2024-01-08T10:00:00.000Z",
      "updatedAt": "2024-01-09T10:00:00.000Z"
    },
    // ... more campaigns
  ]
}
```

---

### 3. Get Single Campaign

**Endpoint**: `GET /api/campaigns/:id`  
**Authentication**: Required  

#### Request

```http
GET /api/campaigns/60d5ecb74b24a1a3f8c9e1a2
Authorization: Bearer <your-jwt-token>
```

#### Response

```javascript
{
  "success": true,
  "data": {
    "id": "60d5ecb74b24a1a3f8c9e1a2",
    "name": "Summer Fashion Campaign 2024",
    // ... full campaign object
  }
}
```

#### Error Response (Campaign Not Found)

```javascript
{
  "success": false,
  "message": "Campaign not found or you don't have permission to view it"
}
```

---

### 4. Update Campaign

**Endpoint**: `PUT /api/campaigns/:id`  
**Authentication**: Required  
**Content-Type**: `multipart/form-data` or `application/json`

#### Request Body

```javascript
{
  "name": "Updated Summer Fashion Campaign 2024",
  "status": "active",
  "budget": 7500,
  "description": "Updated campaign description with new requirements",
  "deliverables": [
    {
      "type": "post",
      "quantity": 3,
      "description": "Updated: Instagram posts featuring summer outfits"
    }
  ]
}
```

#### Response

```javascript
{
  "success": true,
  "message": "Campaign updated successfully",
  "data": {
    "id": "60d5ecb74b24a1a3f8c9e1a2",
    "name": "Updated Summer Fashion Campaign 2024",
    "status": "active",
    "budget": 7500,
    // ... updated campaign object
  }
}
```

---

## Validation Rules

### Required Fields

#### For All Campaigns:
- `name`: String (required, trimmed)
- `startDate`: Date (required, must be valid date)
- `endDate`: Date (required, must be after startDate)
- `type`: Enum ["standard", "auction"]
- `compensationType`: Enum ["paid", "barter"]

#### Conditional Requirements:

**For Paid Campaigns**:
- `budget`: Number (required when compensationType = "paid")

**For Auction + Paid Campaigns**:
- `minBid`: Number (required when type = "auction" AND compensationType = "paid")

**For Standard Campaigns**:
- `targetEngagement`: Number (required when type = "standard")

**For Barter Campaigns**:
- `barterDetails`: String (required when compensationType = "barter")

### Field Constraints

- `name`: Required, trimmed
- `budget`: Must be positive number
- `minBid`: Must be positive number
- `targetEngagement`: Must be positive number
- `deliverables[].quantity`: Must be minimum 1
- `deliverables[].type`: Must be one of ["post", "story", "reel", "video", "mention"]

---

## Usage Examples

### JavaScript/React Example

```javascript
// Create campaign with image upload
const createCampaign = async (campaignData, imageFile) => {
  const formData = new FormData();
  
  // Add image file if present
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  // Add campaign data
  Object.keys(campaignData).forEach(key => {
    if (Array.isArray(campaignData[key])) {
      formData.append(key, JSON.stringify(campaignData[key]));
    } else {
      formData.append(key, campaignData[key]);
    }
  });

  try {
    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

// Get user campaigns
const getUserCampaigns = async () => {
  try {
    const response = await fetch('/api/campaigns', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

// Update campaign status
const updateCampaignStatus = async (campaignId, status) => {
  try {
    const response = await fetch(`/api/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
};
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const result = await getUserCampaigns();
      if (result.success) {
        setCampaigns(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const createNewCampaign = async (campaignData, imageFile) => {
    try {
      const result = await createCampaign(campaignData, imageFile);
      if (result.success) {
        setCampaigns(prev => [result.data, ...prev]);
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    createNewCampaign
  };
};
```

---

## Error Handling

### Common Error Responses

| Status Code | Error Type | Description |
|------------|------------|-------------|
| 400 | Bad Request | Validation errors, missing required fields |
| 401 | Unauthorized | Invalid or missing authentication token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Campaign not found |
| 500 | Internal Server Error | Server-side errors |

### Error Response Format

```javascript
{
  "success": false,
  "message": "Descriptive error message"
}
```

### Common Validation Errors

- `"Campaign name is required"`
- `"Start date is required"`
- `"End date must be after start date"`
- `"Budget is required for paid campaigns"`
- `"Target engagement is required for standard campaigns"`
- `"Barter details are required for barter campaigns"`

---

## Integration Notes for AI Agents

### Data Formatting

1. **Dates**: Always send dates in ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`)
2. **Arrays**: When using FormData, stringify arrays using `JSON.stringify()`
3. **Numbers**: Ensure numeric fields are sent as numbers, not strings
4. **File Uploads**: Use multipart/form-data for image uploads

### Best Practices

1. **Authentication**: Always include the Bearer token in headers
2. **Error Handling**: Check the `success` field in responses
3. **Validation**: Validate data client-side before sending to API
4. **Loading States**: Handle loading states for better UX
5. **Image Optimization**: Compress images before upload

### Campaign Workflow

1. **Draft Creation**: Create campaign with status "draft"
2. **Review & Edit**: Update campaign details as needed
3. **Activation**: Change status to "active" when ready to launch
4. **Management**: Monitor and update campaign status as needed
5. **Completion**: Set status to "completed" when campaign ends

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Users can only access their own campaigns
3. **File Upload**: Images are uploaded to Cloudinary with security restrictions
4. **Input Validation**: All inputs are validated server-side
5. **Rate Limiting**: Consider implementing rate limiting for production use

---

**Last Updated**: January 2025  
**API Version**: 1.0.0  
**Documentation Version**: 1.0.0
