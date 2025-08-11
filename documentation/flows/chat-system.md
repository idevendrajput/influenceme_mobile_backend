# Chat System Flow

This document covers the complete real-time chat system, including REST API endpoints, Socket.IO integration, room management, and messaging features.

## Overview

The chat system enables real-time communication between brands and influencers through a combination of REST APIs for chat management and Socket.IO for real-time messaging features like typing indicators, read receipts, and live message delivery.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   REST API      │    │   Socket.IO      │    │   Database      │
│  (HTTP/HTTPS)   │    │  (WebSocket)     │    │   (MongoDB)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Chat Management │    │ Real-time Events │    │ Chat & Message  │
│ Message Storage │    │ Typing Indicators│    │   Collections   │
│ Read Receipts   │    │ Room Management  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Create/Get      │    │   Join Room      │    │  Send Message   │
│  Chat Room      │    │  (Socket.IO)     │    │  (Socket.IO)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Store in DB     │    │ Room Validation  │    │ Broadcast to    │
│ Generate RoomID │    │ Add to Room      │    │ Room Members    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Return Chat     │    │ Emit User Joined │    │ Store Message   │
│ Room Details    │    │ Update Presence  │    │ Send Delivery   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## REST API Endpoints

### 1. Create or Get Chat Room

**Endpoint**: `POST /api/chats/rooms`  
**Purpose**: Create a new chat room or retrieve existing one between participants  
**Authentication**: Required (Bearer Token)

#### Request Format

```json
{
  "participantIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ],
  "roles": ["influencer", "brand"]
}
```

#### Response Format

```json
{
  "status": true,
  "message": "Chat room created successfully",
  "data": {
    "roomId": "507f1f77bcf86cd799439011_507f1f77bcf86cd799439012",
    "participants": [
      {
        "participantId": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "influencer"
        },
        "participantType": "influencers",
        "role": "influencer",
        "joinedAt": "2025-01-09T12:00:00.000Z"
      },
      {
        "participantId": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Brand Inc",
          "email": "brand@example.com",
          "role": "brand"
        },
        "participantType": "User",
        "role": "brand",
        "joinedAt": "2025-01-09T12:00:00.000Z"
      }
    ],
    "chatType": "brand_influencer",
    "status": "active",
    "createdAt": "2025-01-09T12:00:00.000Z",
    "updatedAt": "2025-01-09T12:00:00.000Z"
  }
}
```

#### Business Logic

1. **Room ID Generation**: Creates consistent room ID by sorting participant IDs
2. **Duplicate Check**: Returns existing room if already created
3. **Participant Types**: Determines collection type based on user role
4. **Population**: Includes full participant details in response

### 2. Get User Chat Rooms

**Endpoint**: `GET /api/chats/rooms`  
**Purpose**: Retrieve all chat rooms for authenticated user  
**Authentication**: Required (Bearer Token)

#### Request Format

```http
GET /api/chats/rooms
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response Format

```json
{
  "status": true,
  "message": "Chat rooms retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "roomId": "507f1f77bcf86cd799439011_507f1f77bcf86cd799439012",
      "chatType": "brand_influencer",
      "status": "active",
      "participants": [
        {
          "id": "507f1f77bcf86cd799439012",
          "name": "Brand Inc",
          "email": "brand@example.com",
          "role": "brand"
        }
      ],
      "lastMessage": {
        "_id": "507f1f77bcf86cd799439014",
        "content": "Hello! Looking forward to collaborating with you.",
        "createdAt": "2025-01-09T12:30:00.000Z"
      },
      "createdAt": "2025-01-09T12:00:00.000Z",
      "updatedAt": "2025-01-09T12:30:00.000Z"
    }
  ]
}
```

#### Business Logic

1. **User Filter**: Only returns rooms where user is a participant
2. **Active Rooms**: Filters out inactive or blocked rooms
3. **Other Participants**: Excludes requesting user from participant list
4. **Last Message**: Includes most recent message for each room
5. **Sorting**: Orders by most recent activity

### 3. Get Chat Messages

**Endpoint**: `GET /api/chats/rooms/:roomId/messages`  
**Purpose**: Retrieve message history for a specific chat room  
**Authentication**: Required (Bearer Token)

#### Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `roomId` | String | Required | Chat room identifier |
| `page` | Number | 1 | Page number for pagination |
| `limit` | Number | 50 | Messages per page |

#### Example Request

```http
GET /api/chats/rooms/507f1f77bcf86cd799439011_507f1f77bcf86cd799439012/messages?page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response Format

```json
{
  "status": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "roomId": "507f1f77bcf86cd799439011_507f1f77bcf86cd799439012",
        "sender": {
          "participantId": {
            "_id": "507f1f77bcf86cd799439011",
            "name": "John Doe",
            "email": "john@example.com"
          },
          "participantType": "influencers",
          "role": "influencer",
          "name": "John Doe"
        },
        "messageType": "text",
        "content": "Hello! Thank you for reaching out.",
        "status": "read",
        "readBy": [
          {
            "participantId": "507f1f77bcf86cd799439012",
            "readAt": "2025-01-09T12:35:00.000Z"
          }
        ],
        "createdAt": "2025-01-09T12:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalMessages": 45,
      "hasMore": true
    }
  }
}
```

### 4. Send Message (REST API)

**Endpoint**: `POST /api/chats/messages`  
**Purpose**: Send a message through REST API (alternative to Socket.IO)  
**Authentication**: Required (Bearer Token)

#### Request Format

```json
{
  "roomId": "507f1f77bcf86cd799439011_507f1f77bcf86cd799439012",
  "messageType": "text",
  "content": "Hello! This is my message."
}
```

#### Response Format

```json
{
  "status": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "roomId": "507f1f77bcf86cd799439011_507f1f77bcf86cd799439012",
    "sender": {
      "participantId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "participantType": "influencers",
      "role": "influencer",
      "name": "John Doe"
    },
    "messageType": "text",
    "content": "Hello! This is my message.",
    "status": "sent",
    "createdAt": "2025-01-09T12:45:00.000Z"
  }
}
```

### 5. Mark Messages as Read

**Endpoint**: `PUT /api/chats/rooms/:roomId/messages/read`  
**Purpose**: Mark specific messages as read by the authenticated user  
**Authentication**: Required (Bearer Token)

#### Request Format

```json
{
  "messageIds": [
    "507f1f77bcf86cd799439015",
    "507f1f77bcf86cd799439016"
  ]
}
```

#### Response Format

```json
{
  "status": true,
  "message": "Messages marked as read",
  "data": {
    "modifiedCount": 2
  }
}
```

### 6. Get Unread Message Count

**Endpoint**: `GET /api/chats/messages/unread-count`  
**Purpose**: Get total unread message count across all rooms  
**Authentication**: Required (Bearer Token)

#### Response Format

```json
{
  "status": true,
  "message": "Unread count retrieved successfully",
  "data": {
    "unreadCount": 8
  }
}
```

## Socket.IO Real-time Features

### Connection and Authentication

#### Client Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token',
    userId: '507f1f77bcf86cd799439011',
    userRole: 'influencer',
    userName: 'John Doe'
  }
});
```

#### Server-side Authentication

```javascript
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    // For testing, allow test tokens
    if (token.startsWith('test-token-')) {
      socket.userId = socket.handshake.auth.userId;
      socket.userRole = socket.handshake.auth.userRole;
      socket.userName = socket.handshake.auth.userName;
      return next();
    }
    
    // TODO: Add proper JWT verification for production
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // ... verification logic
    
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});
```

### Room Management Events

#### Join Room

**Client Side:**
```javascript
socket.emit('joinRoom', {
  roomId: '507f1f77bcf86cd799439011_507f1f77bcf86cd799439012',
  userId: '507f1f77bcf86cd799439011'
});

// Listen for confirmation
socket.on('roomJoined', (data) => {
  console.log('Successfully joined room:', data.roomId);
});

// Listen for other users joining
socket.on('userJoined', (data) => {
  console.log(`${data.name} (${data.role}) joined the room`);
});
```

**Server Response:**
```json
{
  "roomId": "507f1f77bcf86cd799439011_507f1f77bcf86cd799439012",
  "message": "Successfully joined room",
  "timestamp": "2025-01-09T12:00:00.000Z"
}
```

#### Leave Room

**Client Side:**
```javascript
socket.emit('leaveRoom', {
  roomId: '507f1f77bcf86cd799439011_507f1f77bcf86cd799439012'
});

// Listen for confirmation
socket.on('roomLeft', (data) => {
  console.log('Successfully left room:', data.roomId);
});

// Listen for other users leaving
socket.on('userLeft', (data) => {
  console.log(`${data.name} left the room`);
});
```

### Messaging Events

#### Send Message

**Client Side:**
```javascript
const messageId = Date.now().toString();
const tempId = `temp_${messageId}`;

socket.emit('chatMessage', {
  roomId: '507f1f77bcf86cd799439011_507f1f77bcf86cd799439012',
  message: 'Hello everyone!',
  messageId: messageId,
  tempId: tempId
});

// Listen for delivery confirmation
socket.on('messageDelivered', (data) => {
  console.log('Message delivered:', data.messageId);
  // Update UI to show message as delivered
});
```

#### Receive Messages

**Client Side:**
```javascript
socket.on('newMessage', (data) => {
  console.log('New message received:', data);
  // Add message to chat UI
  addMessageToChat(data);
});
```

**Message Data Structure:**
```json
{
  "messageId": "1754743500123",
  "tempId": "temp_1754743500123",
  "content": "Hello everyone!",
  "sender": {
    "userId": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "role": "influencer"
  },
  "roomId": "507f1f77bcf86cd799439011_507f1f77bcf86cd799439012",
  "timestamp": "2025-01-09T12:45:00.000Z",
  "status": "sent"
}
```

### Typing Indicators

#### Start Typing

**Client Side:**
```javascript
// User starts typing
socket.emit('startTyping', {
  roomId: '507f1f77bcf86cd799439011_507f1f77bcf86cd799439012'
});

// Listen for other users typing
socket.on('userStartedTyping', (data) => {
  showTypingIndicator(data.name);
});
```

#### Stop Typing

**Client Side:**
```javascript
// User stops typing
socket.emit('stopTyping', {
  roomId: '507f1f77bcf86cd799439011_507f1f77bcf86cd799439012'
});

// Listen for typing stop
socket.on('userStoppedTyping', (data) => {
  hideTypingIndicator(data.name);
});
```

### Read Receipts

#### Mark Messages as Read

**Client Side:**
```javascript
socket.emit('markAsRead', {
  roomId: '507f1f77bcf86cd799439011_507f1f77bcf86cd799439012',
  messageIds: ['msg1', 'msg2', 'msg3']
});

// Listen for read receipts from others
socket.on('messagesRead', (data) => {
  console.log(`${data.readBy.name} read messages:`, data.messageIds);
  // Update UI to show read receipts
});
```

### Presence and Online Status

#### Get Online Users

**Client Side:**
```javascript
socket.emit('getOnlineUsers', {
  roomId: '507f1f77bcf86cd799439011_507f1f77bcf86cd799439012'
});

socket.on('onlineUsers', (data) => {
  console.log(`${data.count} users online:`, data.users);
  updateOnlineUsersList(data.users);
});
```

**Response Format:**
```json
{
  "roomId": "507f1f77bcf86cd799439011_507f1f77bcf86cd799439012",
  "users": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "role": "influencer",
      "socketId": "abc123"
    },
    {
      "userId": "507f1f77bcf86cd799439012",
      "name": "Brand Inc",
      "role": "brand",
      "socketId": "def456"
    }
  ],
  "count": 2
}
```

### Connection Health

#### Ping/Pong

**Client Side:**
```javascript
// Send ping to check connection
socket.emit('ping');

// Listen for pong response
socket.on('pong', (data) => {
  console.log('Connection alive:', data.timestamp);
});
```

### Error Handling

**Client Side:**
```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
  handleSocketError(data);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

## Data Models

### Chat Schema

```javascript
{
  roomId: String, // Unique room identifier
  participants: [
    {
      participantId: ObjectId, // Reference to User or Influencer
      participantType: String, // 'User' or 'influencers'
      role: String, // 'brand', 'influencer', 'admin'
      joinedAt: Date
    }
  ],
  chatType: String, // 'brand_influencer', 'group_chat'
  status: String, // 'active', 'inactive', 'blocked'
  lastMessage: ObjectId, // Reference to latest message
  createdBy: {
    participantId: ObjectId,
    participantType: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema

```javascript
{
  roomId: String, // Chat room identifier
  sender: {
    participantId: ObjectId,
    participantType: String,
    role: String,
    name: String
  },
  messageType: String, // 'text', 'image', 'offer', 'file'
  content: Mixed, // Text or structured data
  replyTo: ObjectId, // Reference to replied message
  status: String, // 'sent', 'delivered', 'read'
  readBy: [
    {
      participantId: ObjectId,
      readAt: Date
    }
  ],
  reactions: [
    {
      participantId: ObjectId,
      emoji: String,
      addedAt: Date
    }
  ],
  isEdited: Boolean,
  editHistory: [
    {
      content: Mixed,
      editedAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Integration Examples

### React Frontend Integration

```jsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatComponent = ({ roomId, userToken }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001', {
      auth: {
        token: userToken,
        userId: 'user-id',
        userRole: 'influencer',
        userName: 'User Name'
      }
    });

    // Join room
    newSocket.emit('joinRoom', { roomId, userId: 'user-id' });

    // Listen for messages
    newSocket.on('newMessage', (data) => {
      setMessages(prev => [...prev, data]);
    });

    // Listen for online users
    newSocket.on('onlineUsers', (data) => {
      setOnlineUsers(data.users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leaveRoom', { roomId });
      newSocket.disconnect();
    };
  }, [roomId, userToken]);

  const sendMessage = () => {
    if (socket && message.trim()) {
      socket.emit('chatMessage', {
        roomId,
        message: message.trim(),
        messageId: Date.now().toString(),
        tempId: `temp_${Date.now()}`
      });
      setMessage('');
    }
  };

  const startTyping = () => {
    socket?.emit('startTyping', { roomId });
  };

  const stopTyping = () => {
    socket?.emit('stopTyping', { roomId });
  };

  return (
    <div className="chat-container">
      <div className="online-users">
        Online: {onlineUsers.map(u => u.name).join(', ')}
      </div>
      
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.messageId} className="message">
            <strong>{msg.sender.name}:</strong> {msg.content}
          </div>
        ))}
      </div>
      
      <div className="message-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={startTyping}
          onBlur={stopTyping}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
```

### React Native Integration

```jsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatScreen = ({ roomId, userToken }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io('http://your-server.com', {
      auth: {
        token: userToken,
        userId: 'user-id',
        userRole: 'influencer',
        userName: 'User Name'
      },
      transports: ['websocket']
    });

    newSocket.emit('joinRoom', { roomId, userId: 'user-id' });

    newSocket.on('newMessage', (data) => {
      setMessages(prev => [...prev, data]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leaveRoom', { roomId });
      newSocket.disconnect();
    };
  }, []);

  // ... rest of component
};
```

## Performance Considerations

### Socket.IO Optimization

1. **Connection Pooling**: Limit concurrent connections
2. **Room Cleanup**: Remove users from rooms on disconnect
3. **Memory Management**: Clean up inactive rooms and old messages
4. **Event Throttling**: Limit typing indicator frequency

### Database Optimization

1. **Indexes**: 
   - `roomId` for message queries
   - `participants.participantId` for room filtering
   - `createdAt` for message ordering

2. **Message Pagination**: Load messages in chunks
3. **Read Receipt Optimization**: Batch read receipt updates

### Scalability Recommendations

1. **Redis Adapter**: For multi-server Socket.IO scaling
2. **Message Queue**: For high-volume message processing
3. **CDN**: For media file delivery
4. **Database Sharding**: For large message volumes

## Security Considerations

### Authentication

- JWT token validation for Socket.IO connections
- User role verification for room access
- Rate limiting for message sending

### Data Validation

- Message content sanitization
- Room access permissions
- File upload security (future feature)

### Privacy

- End-to-end encryption (recommended for production)
- Message retention policies
- User data anonymization options

## Testing

### Socket.IO Testing

```javascript
// Use the provided test client
node test-chat-client.js
```

### Manual API Testing

```bash
# Create chat room
curl -X POST "http://localhost:3001/api/chats/rooms" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"participantIds": ["id1", "id2"], "roles": ["influencer", "brand"]}'

# Get messages
curl -X GET "http://localhost:3001/api/chats/rooms/ROOM_ID/messages" \
  -H "Authorization: Bearer TOKEN"

# Send message
curl -X POST "http://localhost:3001/api/chats/messages" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roomId": "ROOM_ID", "messageType": "text", "content": "Hello"}'
```

## Troubleshooting

### Common Issues

1. **Connection Failures**: Check JWT token and authentication
2. **Message Not Delivering**: Verify room membership and permissions
3. **Typing Indicators Not Working**: Check room ID and socket connection
4. **Read Receipts Missing**: Ensure proper message ID format

### Debug Logging

```javascript
// Enable Socket.IO debug logging
localStorage.debug = 'socket.io-client:socket';

// Server-side logging
console.log('User connected:', socket.id, 'UserId:', socket.userId);
```

---

**Last Updated**: January 2025  
**Flow Version**: 1.0.0
