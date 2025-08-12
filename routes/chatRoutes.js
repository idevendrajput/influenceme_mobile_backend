import express from 'express';
import {
  createOrGetChatRoom,
  getUserChatRooms,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  addAdminToChat,
  // 🚀 Advanced Features
  sendMediaMessage,
  sendVoiceMessage,
  sendEncryptedMessage,
  addReactionToMessage,
  editMessage,
  deleteMessage,
  searchMessages,
  forwardMessage,
  getChatStatistics,
  exportChatData
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

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

// 🚀 **ADVANCED FEATURES** 🚀

// 📷 Media messaging
router.post('/messages/media', upload.array('files', 10), sendMediaMessage);
router.post('/messages/voice', upload.single('audio'), sendVoiceMessage);

// 🔐 Encrypted messaging
router.post('/messages/encrypted', sendEncryptedMessage);

// 😀 Message reactions
router.post('/messages/:messageId/reactions', addReactionToMessage);

// ✏️ Message editing & deletion
router.put('/messages/:messageId', editMessage);
router.delete('/messages/:messageId', deleteMessage);

// 🔍 Message search
router.get('/messages/search', searchMessages);

// 📤 Message forwarding
router.post('/messages/:messageId/forward', forwardMessage);

// 📊 Chat analytics
router.get('/rooms/:roomId/statistics', getChatStatistics);
router.get('/rooms/:roomId/export', exportChatData);

export default router;
