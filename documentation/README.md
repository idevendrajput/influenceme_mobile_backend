# InfluenceMe Backend Documentation

Welcome to the comprehensive documentation for the InfluenceMe backend API. This documentation covers all the flows, endpoints, and features available in the system.

## 📁 Documentation Structure

### API Documentation
- [Authentication Flow](./flows/authentication.md) - User registration, login, and token management
- [User Profile Management](./flows/user-profile.md) - Profile creation, updates, and retrieval
- [Social Media Management](./flows/social-media.md) - Dynamic social media platform handling
- [Chat System](./flows/chat-system.md) - Real-time messaging and communication
- [Offer Management](./flows/offer-management.md) - Brand-influencer collaboration offers
- [Content Management](./flows/content-management.md) - Genres, settings, and media handling

### API Reference
- [Authentication APIs](./api/authentication.md)
- [User APIs](./api/users.md)
- [Chat APIs](./api/chat.md)
- [Offers APIs](./api/offers.md)
- [Genres APIs](./api/genres.md)
- [Settings APIs](./api/settings.md)

### Data Schemas
- [User Schema](./schemas/user.md)
- [Influencer Schema](./schemas/influencer.md)
- [Chat Schema](./schemas/chat.md)
- [Message Schema](./schemas/message.md)
- [Offer Schema](./schemas/offer.md)

### Examples
- [API Usage Examples](./examples/api-usage.md)
- [Socket.IO Examples](./examples/socket-io.md)
- [Migration Examples](./examples/migration.md)

## 🚀 Quick Start

1. **Server Setup**: Check [deployment guide](../DEPLOYMENT_GUIDE.md)
2. **API Testing**: Use the [health check endpoint](./api/health.md)
3. **Authentication**: Start with [user registration](./flows/authentication.md#registration)
4. **Real-time Chat**: Implement [Socket.IO integration](./flows/chat-system.md#socket-io-integration)

## 📋 Feature Overview

### ✅ Implemented Features

- **Multi-role Authentication** (Influencers, Brands, Admins)
- **Dynamic Social Media Management** (Instagram, YouTube, Facebook, LinkedIn, TikTok, etc.)
- **Real-time Chat System** with typing indicators and read receipts
- **Offer/Negotiation System** between brands and influencers
- **Profile Management** with rich social media metrics
- **Content Classification** with genres and categories
- **File Upload Support** for media and documents

### 🔄 Recent Updates

- **Dynamic Social Media Structure**: Migrated from individual platform fields to flexible array-based system
- **Enhanced Security**: JWT-based authentication with role-based authorization
- **Improved Real-time Features**: Advanced Socket.IO implementation with room management
- **Migration Scripts**: Automated database migration tools

## 🛠 Technical Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Authentication**: JWT tokens
- **File Handling**: Multer
- **Process Management**: PM2 ready

## 📊 API Statistics

- **Total Endpoints**: 25+
- **Authentication Required**: 18 endpoints
- **Real-time Features**: 10+ Socket.IO events
- **Admin Only**: 8 endpoints
- **Public Access**: 7 endpoints

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based authorization
- Input validation and sanitization
- CORS configuration
- File upload security

## 📈 Performance Features

- MongoDB indexing for optimal queries
- Pagination support for large datasets
- Efficient social media filtering
- Real-time connection management
- Error handling and logging

## 🤝 Contributing

1. Read the [API guidelines](./api/guidelines.md)
2. Check [schema documentation](./schemas/)
3. Follow [example patterns](./examples/)
4. Test using provided [test scripts](../test-chat-client.js)

## 📞 Support

For technical support or questions:
- Review relevant flow documentation
- Check API examples
- Refer to schema definitions
- Test with provided clients

---

**Last Updated**: January 2025  
**API Version**: 1.0.3  
**Documentation Version**: 1.0.0
