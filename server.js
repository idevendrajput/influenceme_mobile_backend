import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import cron from 'node-cron';
import connectDB from './config/db.js';
import authRoutes from "./routes/user/authRoutes.js"
import userRoutes from './routes/user/userRoutes.js';
import genreRoutes from './routes/genreRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { successResponse, errorResponse } from './utils/responseHelper.js';
import chatRoutes from './routes/chatRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import { setSocketIO } from './controllers/chatController.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🚀 Enhanced Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  },
  // Advanced configurations
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  // Connection state recovery
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
  // Adapter configuration for clustering (if needed)
  adapter: undefined // Can be configured for Redis adapter in production
});

await connectDB();

// 🔒 Security Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(compression());

// 🚯 Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// CORS Configuration - Allow all origins for IP-based access
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
            // Allow localhost for development
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                return callback(null, true);
            }
            
            // Allow any IP address for now (you can restrict this later)
            if (origin.match(/^https?:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?$/)) {
                return callback(null, true);
            }
            
            // For now, allow all origins (you can restrict this in production)
            callback(null, true);
        },
        credentials: true,
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded files)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/offers', offerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    return successResponse(res, 'Server is running', {
        timestamp: new Date().toISOString(),
        version: '1.0.3'
    });
});

// 📊 Store active users and their rooms with enhanced tracking
const activeUsers = new Map();
const userRooms = new Map();
const typingUsers = new Map(); // roomId -> Set of userIds
const userPresence = new Map(); // userId -> { status, lastSeen, currentRoom }
const roomParticipants = new Map(); // roomId -> Set of userIds
const messageQueue = new Map(); // userId -> Array of pending messages

// 🔄 Cleanup inactive users every 5 minutes
cron.schedule('*/5 * * * *', () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  for (const [userId, presence] of userPresence.entries()) {
    if (presence.lastSeen < fiveMinutesAgo && presence.status !== 'offline') {
      userPresence.set(userId, {
        ...presence,
        status: 'offline',
        lastSeen: new Date()
      });
      console.log(`User ${userId} marked as offline due to inactivity`);
    }
  }
});

// 🔔 Notification system
const sendNotification = (userId, notification) => {
  const user = activeUsers.get(userId);
  if (user && user.socketId) {
    io.to(user.socketId).emit('notification', notification);
  } else {
    // Queue notification for offline user
    if (!messageQueue.has(userId)) {
      messageQueue.set(userId, []);
    }
    messageQueue.get(userId).push({
      type: 'notification',
      data: notification,
      timestamp: new Date()
    });
  }
};

// Socket.IO middleware for authentication
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        
        // For testing purposes, allow test tokens
        if (token.startsWith('test-token-')) {
            socket.userId = socket.handshake.auth.userId;
            socket.userRole = socket.handshake.auth.userRole;
            socket.userName = socket.handshake.auth.userName;
            return next();
        }
        
        // TODO: Add proper JWT token verification for production
        socket.userId = socket.handshake.auth.userId;
        socket.userRole = socket.handshake.auth.userRole;
        socket.userName = socket.handshake.auth.userName;
        
        next();
    } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
    }
});

// Socket.IO events
io.on('connection', (socket) => {
    console.log('User connected:', socket.id, 'UserId:', socket.userId);
    
    // Store active user
    activeUsers.set(socket.userId, {
        socketId: socket.id,
        userId: socket.userId,
        role: socket.userRole,
        name: socket.userName,
        connectedAt: new Date()
    });

    // Join room with enhanced validation
    socket.on('joinRoom', async ({ roomId, userId }) => {
        try {
            if (!roomId || !userId) {
                socket.emit('error', { message: 'Room ID and User ID are required' });
                return;
            }

            console.log(`${socket.userRole} (${socket.userName}) joined room: ${roomId}`);
            
            socket.join(roomId);
            
            if (!userRooms.has(socket.userId)) {
                userRooms.set(socket.userId, new Set());
            }
            userRooms.get(socket.userId).add(roomId);

            socket.to(roomId).emit('userJoined', {
                userId: socket.userId,
                name: socket.userName,
                role: socket.userRole,
                timestamp: new Date()
            });

            socket.emit('roomJoined', {
                roomId,
                message: 'Successfully joined room',
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', { message: 'Failed to join room', error: error.message });
        }
    });

    // Leave room
    socket.on('leaveRoom', ({ roomId }) => {
        try {
            if (!roomId) {
                socket.emit('error', { message: 'Room ID is required' });
                return;
            }

            socket.leave(roomId);
            
            if (userRooms.has(socket.userId)) {
                userRooms.get(socket.userId).delete(roomId);
            }

            if (typingUsers.has(roomId)) {
                typingUsers.get(roomId).delete(socket.userId);
                socket.to(roomId).emit('userStoppedTyping', {
                    userId: socket.userId,
                    name: socket.userName
                });
            }

            socket.to(roomId).emit('userLeft', {
                userId: socket.userId,
                name: socket.userName,
                role: socket.userRole,
                timestamp: new Date()
            });

            console.log(`${socket.userName} left room: ${roomId}`);
            
            socket.emit('roomLeft', {
                roomId,
                message: 'Successfully left room',
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error leaving room:', error);
            socket.emit('error', { message: 'Failed to leave room', error: error.message });
        }
    });

    // Handle chat message with delivery status
    socket.on('chatMessage', async ({ roomId, message, messageId, tempId }) => {
        try {
            if (!roomId || !message) {
                socket.emit('error', { message: 'Room ID and message are required' });
                return;
            }

            console.log(`Message from ${socket.userName} to ${roomId}:`, message);
            
            const enhancedMessage = {
                messageId: messageId || Date.now().toString(),
                tempId, 
                content: message,
                sender: {
                    userId: socket.userId,
                    name: socket.userName,
                    role: socket.userRole
                },
                roomId,
                timestamp: new Date(),
                status: 'sent'
            };

            socket.to(roomId).emit('newMessage', enhancedMessage);
            
            socket.emit('messageDelivered', {
                messageId: enhancedMessage.messageId,
                tempId,
                timestamp: new Date(),
                status: 'delivered'
            });

            if (typingUsers.has(roomId)) {
                typingUsers.get(roomId).delete(socket.userId);
                socket.to(roomId).emit('userStoppedTyping', {
                    userId: socket.userId,
                    name: socket.userName
                });
            }

        } catch (error) {
            console.error('Error handling chat message:', error);
            socket.emit('error', { message: 'Failed to send message', error: error.message });
        }
    });

    // Typing indicators
    socket.on('startTyping', ({ roomId }) => {
        try {
            if (!roomId) {
                socket.emit('error', { message: 'Room ID is required' });
                return;
            }

            if (!typingUsers.has(roomId)) {
                typingUsers.set(roomId, new Set());
            }
            
            typingUsers.get(roomId).add(socket.userId);
            
            socket.to(roomId).emit('userStartedTyping', {
                userId: socket.userId,
                name: socket.userName,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error handling start typing:', error);
        }
    });

    socket.on('stopTyping', ({ roomId }) => {
        try {
            if (!roomId) return;

            if (typingUsers.has(roomId)) {
                typingUsers.get(roomId).delete(socket.userId);
            }
            
            socket.to(roomId).emit('userStoppedTyping', {
                userId: socket.userId,
                name: socket.userName,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error handling stop typing:', error);
        }
    });

    // Message read receipts
    socket.on('markAsRead', ({ roomId, messageIds }) => {
        try {
            if (!roomId || !messageIds || !Array.isArray(messageIds)) {
                socket.emit('error', { message: 'Room ID and message IDs are required' });
                return;
            }

            socket.to(roomId).emit('messagesRead', {
                readBy: {
                    userId: socket.userId,
                    name: socket.userName
                },
                messageIds,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error handling mark as read:', error);
        }
    });

    // Get online users in room
    socket.on('getOnlineUsers', async ({ roomId }) => {
        try {
            if (!roomId) {
                socket.emit('error', { message: 'Room ID is required' });
                return;
            }

            const roomSockets = await io.in(roomId).fetchSockets();
            const onlineUsers = roomSockets.map(s => ({
                userId: s.userId,
                name: s.userName,
                role: s.userRole,
                socketId: s.id
            }));

            socket.emit('onlineUsers', {
                roomId,
                users: onlineUsers,
                count: onlineUsers.length
            });

        } catch (error) {
            console.error('Error getting online users:', error);
            socket.emit('error', { message: 'Failed to get online users', error: error.message });
        }
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log('User disconnected:', socket.id, 'UserId:', socket.userId, 'Reason:', reason);
        
        try {
            activeUsers.delete(socket.userId);
            
            for (const [roomId, typingSet] of typingUsers.entries()) {
                if (typingSet.has(socket.userId)) {
                    typingSet.delete(socket.userId);
                    socket.to(roomId).emit('userStoppedTyping', {
                        userId: socket.userId,
                        name: socket.userName
                    });
                }
            }
            
            if (userRooms.has(socket.userId)) {
                for (const roomId of userRooms.get(socket.userId)) {
                    socket.to(roomId).emit('userDisconnected', {
                        userId: socket.userId,
                        name: socket.userName,
                        role: socket.userRole,
                        timestamp: new Date(),
                        reason
                    });
                }
                userRooms.delete(socket.userId);
            }
            
        } catch (error) {
            console.error('Error during disconnect cleanup:', error);
        }
    });

    // Ping-pong for connection health
    socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date() });
    });
});

// 404 handler
app.use('*', (req, res) => {
    return errorResponse(res, 'Route not found', 404);
});

// Multer error handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return errorResponse(res, 'File too large. Maximum size is 50MB.', 400);
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return errorResponse(res, 'Too many files. Maximum 10 files allowed.', 400);
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return errorResponse(res, 'Unexpected file field.', 400);
        }
        return errorResponse(res, err.message, 400);
    }

    if (err.message === 'Only images and videos are allowed') {
        return errorResponse(res, err.message, 400);
    }
    
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    return errorResponse(res, 'Something went wrong!', 500);
});

const PORT = process.env.PORT || 3001;

// Pass Socket.IO instance to chat controller
setSocketIO(io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


