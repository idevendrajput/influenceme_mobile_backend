# Authentication Flow Documentation

This document covers the complete authentication flow in the InfluenceMe backend, including user registration, login, and token management.

## Overview

The authentication system supports multiple user types (influencers, brands, admins) with JWT-based token authentication and role-based authorization.

## Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Check User    │    │    Registration   │    │      Login      │
│    Exists       │───▶│                  │───▶│                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  User Exists?   │    │   Create User    │    │  Generate JWT   │
│   Response      │    │   Hash Password  │    │     Token       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Authentication Endpoints

### 1. Check User Exists

**Endpoint**: `POST /api/auth/check_user_exists`  
**Purpose**: Check if a user already exists before registration  
**Authentication**: None required

#### Request Format

```json
{
  "email": "user@example.com",
  "phone": "1234567890",
  "phoneCode": "+91"
}
```

#### Response Format

```json
{
  "status": true,
  "message": "User does not exist",
  "data": {
    "exists": false
  }
}
```

#### Business Logic

1. Check if user exists by email OR phone+phoneCode combination
2. Return boolean flag indicating existence
3. Used by frontend to decide between login/register flow

### 2. User Registration

**Endpoint**: `POST /api/auth/register`  
**Purpose**: Register a new influencer account  
**Authentication**: None required

#### Request Format

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "phoneCode": "+91",
  "about": "Professional influencer specializing in tech content",
  "country": "India",
  "dateOfBirth": "1995-01-15",
  "spokenLanguages": ["English", "Hindi"],
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
  "workType": "full-time",
  "influencerSince": 2020
}
```

#### Response Format

```json
{
  "status": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "phoneCode": "+91",
      "country": "India",
      "role": "influencer",
      "isActive": true,
      "createdAt": "2025-01-09T12:00:00.000Z",
      "updatedAt": "2025-01-09T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Business Logic

1. **Validation**: Check required fields (name, email OR phone)
2. **Uniqueness**: Verify email and phone+phoneCode are unique
3. **Data Processing**: Parse form data using `formDataParser`
4. **User Creation**: Create user with parsed data
5. **Token Generation**: Generate JWT token for immediate login
6. **Response**: Return user data (excluding sensitive info) and token

#### Registration Validations

- **Required Fields**: `name` and either `email` or `phone`
- **About Field**: Maximum 500 characters
- **Date of Birth**: Valid date format
- **Email**: Must be unique if provided
- **Phone**: Must be unique when combined with phoneCode
- **Social Media**: Must follow dynamic socialMedia array structure

### 3. User Login

**Endpoint**: `POST /api/auth/login`  
**Purpose**: Authenticate existing user  
**Authentication**: None required

#### Request Format

```json
{
  "email": "john@example.com",
  "phone": "1234567890",
  "phoneCode": "+91"
}
```

**Note**: Provide either `email` OR combination of `phone` + `phoneCode`

#### Response Format

```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "phoneCode": "+91",
      "country": "India",
      "role": "influencer",
      "socialMedia": [...],
      "createdAt": "2025-01-09T12:00:00.000Z",
      "updatedAt": "2025-01-09T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Business Logic

1. **Find User**: Search by email OR phone+phoneCode
2. **Account Status**: Verify user account is active
3. **Token Generation**: Create JWT token
4. **Response**: Return full user profile and token

**⚠️ Security Note**: Current implementation doesn't verify passwords during login. This should be implemented for production use.

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

### Token Usage

Include token in Authorization header for protected endpoints:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Authentication Middleware

### Purpose

Validates JWT tokens and populates `req.user` with user information for protected routes.

### Implementation Flow

1. **Extract Token**: From `Authorization: Bearer <token>` header
2. **Verify Token**: Using JWT secret
3. **Find User**: Query database using token payload ID
4. **Populate Request**: Add user data to `req.user`
5. **Continue**: Call `next()` middleware

### User Object Structure

```javascript
req.user = {
  id: "507f1f77bcf86cd799439011",
  role: "influencer",
  name: "John Doe",
  email: "john@example.com",
  // ... other user fields
}
```

## Authorization System

### Role-Based Access Control

The system supports role-based authorization using the `authorize` middleware:

```javascript
// Allow only admins
router.post('/admin-only', authenticate, authorize('admin'), handler);

// Allow multiple roles
router.get('/multi-role', authenticate, authorize('admin', 'influencer'), handler);
```

### Available Roles

- **`influencer`**: Standard influencer accounts
- **`admin`**: Administrative accounts with elevated privileges
- **Future**: `brand`, `vendor` roles can be added

## Error Handling

### Common Error Responses

```json
{
  "status": false,
  "message": "Error description",
  "data": null
}
```

### Error Scenarios

| Status Code | Error Message | Cause |
|------------|---------------|--------|
| 400 | "Name is required" | Missing required field |
| 400 | "Email already exists" | Duplicate email |
| 400 | "Phone number already exists" | Duplicate phone |
| 404 | "User not found" | Login with non-existent user |
| 403 | "Account is deactivated" | Login with inactive account |
| 401 | "Not authorized, no token provided" | Missing auth header |
| 401 | "Not authorized, token failed" | Invalid/expired token |

## Security Considerations

### Implemented Security

1. **Password Hashing**: Uses bcrypt with salt rounds
2. **JWT Security**: Secure token generation and validation
3. **Input Validation**: Form data parsing and validation
4. **Unique Constraints**: Prevents duplicate accounts
5. **Account Status**: Active/inactive account management

### Security Recommendations

1. **Password Verification**: Implement password checking in login
2. **Rate Limiting**: Add rate limiting for auth endpoints
3. **Account Lockout**: Implement failed login attempts tracking
4. **Token Refresh**: Add refresh token mechanism
5. **Password Strength**: Enforce strong password requirements

## Integration Examples

### Frontend Integration

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
  const result = await response.json();
  if (result.status) {
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
  }
  return result;
};

// Login user
const loginUser = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const result = await response.json();
  if (result.status) {
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
  }
  return result;
};
```

### Mobile App Integration

```javascript
// Store token securely
import AsyncStorage from '@react-native-async-storage/async-storage';

const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('authToken');
  return token ? `Bearer ${token}` : null;
};
```

## Testing

### Manual Testing Commands

```bash
# Check user exists
curl -X POST "http://localhost:3001/api/auth/check_user_exists" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Register user
curl -X POST "http://localhost:3001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# Login user
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Automated Testing

Consider implementing test cases for:
- Valid registration scenarios
- Duplicate account prevention
- Login with valid/invalid credentials
- Token validation and expiration
- Role-based authorization

---

**Last Updated**: January 2025  
**Flow Version**: 1.0.0
