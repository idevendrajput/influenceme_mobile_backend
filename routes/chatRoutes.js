import express from 'express';
import {
  createOrGetChatRoom,
  getUserChatRooms,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  addAdminToChat
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Chat room management
router.post('/rooms', createOrGetChatRoom);
router.get('/rooms', getUserChatRooms);
router.get('/rooms/:roomId/messages', getChatMessages);

// Message management
router.post('/messages', sendMessage);
router.put('/rooms/:roomId/messages/read', markMessagesAsRead);
router.get('/messages/unread-count', getUnreadMessageCount);

// Admin functions
router.post('/rooms/:roomId/add-admin', addAdminToChat);

export default router;
