import express from 'express';
import {
  createOrGetChatRoom,
  getUserChatRooms,
  getChatMessages,
  sendMessage
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Core chat routes only (minimal API)
router.post('/rooms', createOrGetChatRoom);
router.get('/rooms', getUserChatRooms);
router.get('/rooms/:roomId/messages', getChatMessages);
router.post('/messages', sendMessage);

// 🚫 Advanced, experimental, admin, and media routes removed for simplicity

export default router;
