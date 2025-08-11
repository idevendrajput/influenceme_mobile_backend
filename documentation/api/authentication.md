# Authentication API Reference

Complete API reference for authentication endpoints in the InfluenceMe backend.

## Base URL

```
http://localhost:3001/api/auth
```

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/check_user_exists` | Check if user exists | No |
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |

---

## POST /check_user_exists

Check if a user already exists in the system before registration.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "phone": "1234567890",
  "phoneCode": "+91"
}
```

**Parameters:**
- `email` (string, optional): User's email address
- `phone` (string, optional): User's phone number
- `phoneCode` (string, optional): Phone country code (required if phone is provided)

**Note:** Either `email` OR combination of `phone` + `phoneCode` must be provided.

### Response

**Success (200):**
```json
{
  "status": true,
  "message": "User does not exist",
  "data": {
    "exists": false
  }
}
```

**Success - User Exists (200):**
```json
{
  "status": true,
  "message": "User already exists",
  "data": {
    "exists": true
  }
}
```

**Error (400):**
```json
{
  "status": false,
  "message": "Email or phone number is required",
  "data": null
}
```

---

## POST /register

Register a new influencer account in the system.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "phoneCode": "+91",
  "about": "Professional tech influencer",
  "country": "India",
  "dateOfBirth": "1995-01-15",
  "spokenLanguages": ["English", "Hindi"],
  "maritalStatus": "single",
  "children": 0,
  "pets": 1,
  "addresses": {
    "streetAddress": "123 Main Street",
    "state": "Maharashtra",
    "country": "India",
    "pinCode": "400001",
    "latitude": "19.0760",
    "longitude": "72.8777"
  },
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
      "isActive": true
    }
  ],
  "workType": "full-time",
  "influencerSince": 2020
}
```

**Required Parameters:**
- `name` (string): User's full name

**One of the following is required:**
- `email` (string): Valid email address
- `phone` + `phoneCode` (string): Phone number with country code

**Optional Parameters:**
- `about` (string, max 500 chars): User description
- `country` (string): User's country
- `dateOfBirth` (string): Date in YYYY-MM-DD format
- `spokenLanguages` (array): List of languages
- `maritalStatus` (string): "single", "married", "divorced", "widowed"
- `children` (number): Number of children
- `pets` (number): Number of pets
- `addresses` (object): Address information
- `influencerType` (string): "micro", "macro", "mega", "nano"
- `socialMedia` (array): Social media platforms data
- `workType` (string): "full-time", "part-time", "freelance"
- `influencerSince` (number): Year started influencing

### Response

**Success (201):**
```json
{
  "status": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "about": "Professional tech influencer",
      "email": "john@example.com",
      "phone": "1234567890",
      "phoneCode": "+91",
      "country": "India",
      "spokenLanguages": ["English", "Hindi"],
      "children": 0,
      "pets": 1,
      "addresses": {
        "streetAddress": "123 Main Street",
        "state": "Maharashtra",
        "country": "India",
        "pinCode": "400001",
        "latitude": "19.0760",
        "longitude": "72.8777"
      },
      "influencerType": "micro",
      "workType": "full-time",
      "influencerSince": 2020,
      "role": "influencer",
      "isActive": true,
      "createdAt": "2025-01-09T12:00:00.000Z",
      "updatedAt": "2025-01-09T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

**Missing Required Field (400):**
```json
{
  "status": false,
  "message": "Name is required",
  "data": null
}
```

**Duplicate Email (400):**
```json
{
  "status": false,
  "message": "Email already exists",
  "data": null
}
```

**Duplicate Phone (400):**
```json
{
  "status": false,
  "message": "Phone number already exists",
  "data": null
}
```

**Invalid About Length (400):**
```json
{
  "status": false,
  "message": "About field cannot exceed 500 characters",
  "data": null
}
```

**Invalid Date Format (400):**
```json
{
  "status": false,
  "message": "Invalid date of birth format",
  "data": null
}
```

---

## POST /login

Authenticate existing user and retrieve JWT token.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

**OR**

```json
{
  "phone": "1234567890",
  "phoneCode": "+91"
}
```

**Parameters:**
- `email` (string, optional): User's email address
- `phone` (string, optional): User's phone number
- `phoneCode` (string, optional): Phone country code (required if phone is provided)

**Note:** Either `email` OR combination of `phone` + `phoneCode` must be provided.

### Response

**Success (200):**
```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "about": "Professional tech influencer",
      "email": "john@example.com",
      "phoneCode": "+91",
      "phone": "1234567890",
      "country": "India",
      "dateOfBirth": "1995-01-15T00:00:00.000Z",
      "spokenLanguages": ["English", "Hindi"],
      "maritalStatus": "single",
      "children": 0,
      "pets": 1,
      "addresses": {
        "streetAddress": "123 Main Street",
        "state": "Maharashtra",
        "country": "India",
        "pinCode": "400001",
        "latitude": "19.0760",
        "longitude": "72.8777"
      },
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
          "isActive": true
        }
      ],
      "workType": "full-time",
      "influencerSince": 2020,
      "role": "influencer",
      "isActive": true,
      "createdAt": "2025-01-09T12:00:00.000Z",
      "updatedAt": "2025-01-09T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

**Missing Credentials (400):**
```json
{
  "status": false,
  "message": "Email or phone number is required",
  "data": null
}
```

**User Not Found (404):**
```json
{
  "status": false,
  "message": "User not found",
  "data": null
}
```

**Account Deactivated (403):**
```json
{
  "status": false,
  "message": "Account is deactivated",
  "data": null
}
```

---

## JWT Token Structure

### Token Payload
```json
{
  "id": "507f1f77bcf86cd799439011",
  "iat": 1754743370,
  "exp": 1757335370
}
```

### Token Configuration
- **Algorithm**: HS256
- **Expiration**: 30 days (configurable via `JWT_EXPIRE` env var)
- **Secret**: Stored in `JWT_SECRET` environment variable

### Using the Token

Include the token in the Authorization header for protected endpoints:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request data or missing required fields |
| 403 | Forbidden | Account is deactivated or access denied |
| 404 | Not Found | User not found |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limiting

**Recommendation**: Implement rate limiting for authentication endpoints to prevent abuse:

- **Registration**: 5 requests per hour per IP
- **Login**: 10 requests per hour per IP
- **Check User Exists**: 20 requests per hour per IP

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Password Verification**: Current implementation doesn't verify passwords during login. This should be implemented for production use.

2. **Input Validation**: All input should be validated and sanitized before processing.

3. **Rate Limiting**: Implement rate limiting to prevent brute force attacks.

4. **HTTPS**: Always use HTTPS in production to protect token transmission.

5. **Token Storage**: Store JWT tokens securely on the client side (secure storage for mobile, httpOnly cookies for web).

---

## Example Usage

### JavaScript/Node.js
```javascript
// Check if user exists
const checkUser = async (email) => {
  const response = await fetch('/api/auth/check_user_exists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};

// Register user
const registerUser = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Login user
const loginUser = async (email) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};
```

### cURL Examples
```bash
# Check user exists
curl -X POST "http://localhost:3001/api/auth/check_user_exists" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Register user
curl -X POST "http://localhost:3001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "about": "Test influencer"
  }'

# Login user
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

**Last Updated**: January 2025  
**API Version**: 1.0.3
