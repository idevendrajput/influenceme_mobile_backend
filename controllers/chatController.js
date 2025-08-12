import Chat from '../models/chat.js';
import Message from '../models/message.js';
import User from '../models/user.js';
import Influencer from '../models/influencer.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';

// Socket.IO instance will be passed from server.js
let io = null;
export const setSocketIO = (socketIO) => {
  io = socketIO;
};

// Helper function to get user details based on type
const getUserDetails = async (participantId, participantType) => {
  if (participantType === 'User') {
    return await User.findById(participantId).select('fullName email role');
  } else if (participantType === 'influencers') {
    return await Influencer.findById(participantId).select('name fullName email role');
  }
  return null;
};

// Helper function to determine participant type based on role
const getParticipantType = (role) => {
  return role === 'influencer' ? 'influencers' : 'User';
};

// Create or get existing chat room
export const createOrGetChatRoom = async (req, res) => {
  try {
    const { participantIds, roles } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
      return errorResponse(res, 'At least 2 participants are required', 400);
    }

    if (!roles || !Array.isArray(roles) || roles.length !== participantIds.length) {
      return errorResponse(res, 'Roles array must match participants array', 400);
    }

    // Generate room ID based on sorted participant IDs (for consistency)
    const sortedIds = [...participantIds].sort();
    let roomId = sortedIds.join('_');

    // Check if chat room already exists
    let existingChat = await Chat.findOne({
      roomId: roomId
    }).populate('participants.participantId');

    if (existingChat) {
      return successResponse(res, 'Chat room found', existingChat);
    }

    // Create participants array
    const participants = participantIds.map((id, index) => ({
      participantId: id,
      participantType: getParticipantType(roles[index]),
      role: roles[index]
    }));

    // Create new chat room
    const newChat = new Chat({
      roomId: roomId,
      participants: participants,
      chatType: 'brand_influencer',
      createdBy: {
        participantId: req.user.id,
        participantType: getParticipantType(req.user.role)
      }
    });

    await newChat.save();
    
    // Populate participant details
    await newChat.populate('participants.participantId');

    return successResponse(res, 'Chat room created successfully', newChat);

  } catch (error) {
    console.error('Error creating chat room:', error);
    return errorResponse(res, 'Failed to create chat room', 500);
  }
};

// Get user's chat rooms
export const getUserChatRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const participantType = getParticipantType(userRole);

    const chatRooms = await Chat.find({
      'participants.participantId': userId,
      status: 'active'
    })
    .populate('participants.participantId', 'fullName name email role')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    // Format response with participant details
    const formattedChats = await Promise.all(chatRooms.map(async (chat) => {
      const otherParticipants = chat.participants.filter(p => 
        p.participantId._id.toString() !== userId.toString()
      );

      return {
        _id: chat._id,
        roomId: chat.roomId,
        chatType: chat.chatType,
        status: chat.status,
        participants: otherParticipants.map(p => ({
          id: p.participantId._id,
          name: p.participantId.fullName || p.participantId.name,
          email: p.participantId.email,
          role: p.role
        })),
        lastMessage: chat.lastMessage,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      };
    }));

    return successResponse(res, 'Chat rooms retrieved successfully', formattedChats);

  } catch (error) {
    console.error('Error getting user chat rooms:', error);
    return errorResponse(res, 'Failed to retrieve chat rooms', 500);
  }
};

// Get messages for a specific chat room
export const getChatMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Verify user is participant in this chat
    const chat = await Chat.findOne({
      roomId: roomId,
      'participants.participantId': userId
    });

    if (!chat) {
      return errorResponse(res, 'Chat room not found or access denied', 404);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ roomId })
      .populate('sender.participantId', 'fullName name email')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await Message.countDocuments({ roomId });

    return successResponse(res, 'Messages retrieved successfully', {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / parseInt(limit)),
        totalMessages,
        hasMore: skip + messages.length < totalMessages
      }
    });

  } catch (error) {
    console.error('Error getting chat messages:', error);
    return errorResponse(res, 'Failed to retrieve messages', 500);
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { roomId, messageType = 'text', content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify user is participant in this chat
    const chat = await Chat.findOne({
      roomId: roomId,
      'participants.participantId': userId,
      status: 'active'
    });

    if (!chat) {
      return errorResponse(res, 'Chat room not found or access denied', 404);
    }

    // Get sender details
    const senderDetails = await getUserDetails(userId, getParticipantType(userRole));
    if (!senderDetails) {
      return errorResponse(res, 'Sender details not found', 404);
    }

    // Create message
    const message = new Message({
      roomId,
      sender: {
        participantId: userId,
        participantType: getParticipantType(userRole),
        role: userRole,
        name: senderDetails.fullName || senderDetails.name
      },
      messageType,
      content,
      status: 'sent'
    });

    await message.save();

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Populate message details for response
    await message.populate('sender.participantId', 'fullName name email');

    return successResponse(res, 'Message sent successfully', message);

  } catch (error) {
    console.error('Error sending message:', error);
    return errorResponse(res, 'Failed to send message', 500);
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { messageIds } = req.body;
    const userId = req.user.id;

    // Verify user is participant in this chat
    const chat = await Chat.findOne({
      roomId: roomId,
      'participants.participantId': userId
    });

    if (!chat) {
      return errorResponse(res, 'Chat room not found or access denied', 404);
    }

    // Update messages
    const updateResult = await Message.updateMany(
      {
        _id: { $in: messageIds },
        roomId: roomId,
        'readBy.participantId': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            participantId: userId,
            readAt: new Date()
          }
        },
        $set: { status: 'read' }
      }
    );

    return successResponse(res, 'Messages marked as read', {
      modifiedCount: updateResult.modifiedCount
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    return errorResponse(res, 'Failed to mark messages as read', 500);
  }
};

// Get unread message count
export const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all chat rooms user is part of
    const userChats = await Chat.find({
      'participants.participantId': userId,
      status: 'active'
    }).select('roomId');

    const roomIds = userChats.map(chat => chat.roomId);

    // Count unread messages across all rooms
    const unreadCount = await Message.countDocuments({
      roomId: { $in: roomIds },
      'sender.participantId': { $ne: userId },
      'readBy.participantId': { $ne: userId }
    });

    return successResponse(res, 'Unread count retrieved successfully', {
      unreadCount
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    return errorResponse(res, 'Failed to get unread count', 500);
  }
};

// Add admin to existing chat (for monitoring)
export const addAdminToChat = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { adminId } = req.body;

    // Verify requester is admin
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Only admins can perform this action', 403);
    }

    const chat = await Chat.findOne({ roomId });
    if (!chat) {
      return errorResponse(res, 'Chat room not found', 404);
    }

    // Check if admin is already a participant
    const existingParticipant = chat.participants.find(p => 
      p.participantId.toString() === adminId.toString()
    );

    if (existingParticipant) {
      return errorResponse(res, 'Admin is already a participant', 400);
    }

    // Add admin to participants
    chat.participants.push({
      participantId: adminId,
      participantType: 'User',
      role: 'admin'
    });

    await chat.save();

    return successResponse(res, 'Admin added to chat successfully', chat);

  } catch (error) {
    console.error('Error adding admin to chat:', error);
    return errorResponse(res, 'Failed to add admin to chat', 500);
  }
};

// 🔐 **ADVANCED FEATURES** 🔐

// Message encryption/decryption utilities
const encryptMessage = (text, key = process.env.CHAT_ENCRYPTION_KEY || 'default-secret-key') => {
  try {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Return original if encryption fails
  }
};

const decryptMessage = (encryptedText, key = process.env.CHAT_ENCRYPTION_KEY || 'default-secret-key') => {
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return encrypted if decryption fails
  }
};

// 📷 Send media message (images, videos, documents)
export const sendMediaMessage = async (req, res) => {
  try {
    const { roomId, messageType = 'media', caption = '' } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const files = req.files;

    if (!files || files.length === 0) {
      return errorResponse(res, 'No files provided', 400);
    }

    // Verify user is participant in this chat
    const chat = await Chat.findOne({
      roomId: roomId,
      'participants.participantId': userId,
      status: 'active'
    });

    if (!chat) {
      return errorResponse(res, 'Chat room not found or access denied', 404);
    }

    // Get sender details
    const senderDetails = await getUserDetails(userId, getParticipantType(userRole));
    if (!senderDetails) {
      return errorResponse(res, 'Sender details not found', 404);
    }

    // Process each file
    const mediaFiles = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/chat/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 
            file.mimetype.startsWith('video/') ? 'video' : 
            file.mimetype.startsWith('audio/') ? 'audio' : 'document'
    }));

    // Create message with media content
    const message = new Message({
      roomId,
      sender: {
        participantId: userId,
        participantType: getParticipantType(userRole),
        role: userRole,
        name: senderDetails.fullName || senderDetails.name
      },
      messageType: 'media',
      content: {
        text: encryptMessage(caption), // Encrypt caption
        media: mediaFiles
      },
      status: 'sent'
    });

    await message.save();

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Populate and decrypt for response
    await message.populate('sender.participantId', 'fullName name email');
    if (message.content.text) {
      message.content.text = decryptMessage(message.content.text);
    }

    // Emit to Socket.IO if available
    if (io) {
      io.to(roomId).emit('newMessage', {
        _id: message._id,
        roomId: message.roomId,
        sender: message.sender,
        messageType: message.messageType,
        content: message.content,
        status: message.status,
        createdAt: message.createdAt
      });
    }

    return successResponse(res, 'Media message sent successfully', message);

  } catch (error) {
    console.error('Error sending media message:', error);
    return errorResponse(res, 'Failed to send media message', 500);
  }
};

// 🎵 Send voice message
export const sendVoiceMessage = async (req, res) => {
  try {
    const { roomId, duration } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const audioFile = req.file;

    if (!audioFile) {
      return errorResponse(res, 'No audio file provided', 400);
    }

    // Verify user is participant in this chat
    const chat = await Chat.findOne({
      roomId: roomId,
      'participants.participantId': userId,
      status: 'active'
    });

    if (!chat) {
      return errorResponse(res, 'Chat room not found or access denied', 404);
    }

    // Get sender details
    const senderDetails = await getUserDetails(userId, getParticipantType(userRole));
    if (!senderDetails) {
      return errorResponse(res, 'Sender details not found', 404);
    }

    // Create voice message
    const message = new Message({
      roomId,
      sender: {
        participantId: userId,
        participantType: getParticipantType(userRole),
        role: userRole,
        name: senderDetails.fullName || senderDetails.name
      },
      messageType: 'voice',
      content: {
        voice: {
          filename: audioFile.filename,
          url: `/uploads/voice/${audioFile.filename}`,
          duration: parseInt(duration) || 0,
          size: audioFile.size
        }
      },
      status: 'sent'
    });

    await message.save();

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Populate for response
    await message.populate('sender.participantId', 'fullName name email');

    // Emit to Socket.IO
    if (io) {
      io.to(roomId).emit('newMessage', message);
    }

    return successResponse(res, 'Voice message sent successfully', message);

  } catch (error) {
    console.error('Error sending voice message:', error);
    return errorResponse(res, 'Failed to send voice message', 500);
  }
};

// 😀 Add reaction to message
export const addReactionToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body; // 'like', 'love', 'laugh', 'angry', 'sad'
    const userId = req.user.id;

    if (!['like', 'love', 'laugh', 'angry', 'sad'].includes(reaction)) {
      return errorResponse(res, 'Invalid reaction type', 400);
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return errorResponse(res, 'Message not found', 404);
    }

    // Verify user has access to this message's room
    const chat = await Chat.findOne({
      roomId: message.roomId,
      'participants.participantId': userId
    });

    if (!chat) {
      return errorResponse(res, 'Access denied', 403);
    }

    // Remove existing reaction from this user (if any)
    message.reactions = message.reactions.filter(r => 
      r.participantId.toString() !== userId.toString()
    );

    // Add new reaction
    message.reactions.push({
      participantId: userId,
      reaction: reaction,
      createdAt: new Date()
    });

    await message.save();

    // Emit to Socket.IO
    if (io) {
      io.to(message.roomId).emit('messageReaction', {
        messageId: message._id,
        userId: userId,
        reaction: reaction,
        timestamp: new Date()
      });
    }

    return successResponse(res, 'Reaction added successfully', {
      messageId: message._id,
      reactions: message.reactions
    });

  } catch (error) {
    console.error('Error adding reaction:', error);
    return errorResponse(res, 'Failed to add reaction', 500);
  }
};

// ✏️ Edit message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return errorResponse(res, 'Message not found', 404);
    }

    // Verify user is the sender
    if (message.sender.participantId.toString() !== userId.toString()) {
      return errorResponse(res, 'Can only edit own messages', 403);
    }

    // Check if message is older than 15 minutes (edit time limit)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.createdAt < fifteenMinutesAgo) {
      return errorResponse(res, 'Cannot edit messages older than 15 minutes', 400);
    }

    // Store original content in edit history
    if (!message.editHistory) {
      message.editHistory = [];
    }
    
    message.editHistory.push({
      originalContent: message.content.text || JSON.stringify(message.content),
      editedAt: new Date(),
      editedBy: userId
    });

    // Update content
    if (typeof content === 'string') {
      message.content = { text: encryptMessage(content) };
    } else {
      message.content = { ...message.content, ...content };
      if (message.content.text) {
        message.content.text = encryptMessage(message.content.text);
      }
    }
    
    message.isEdited = true;
    message.updatedAt = new Date();
    
    await message.save();

    // Decrypt for response
    if (message.content.text) {
      message.content.text = decryptMessage(message.content.text);
    }

    // Emit to Socket.IO
    if (io) {
      io.to(message.roomId).emit('messageEdited', {
        messageId: message._id,
        newContent: message.content,
        isEdited: true,
        editedAt: message.updatedAt
      });
    }

    return successResponse(res, 'Message edited successfully', message);

  } catch (error) {
    console.error('Error editing message:', error);
    return errorResponse(res, 'Failed to edit message', 500);
  }
};

// 🗑️ Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteFor = 'me' } = req.body; // 'me' or 'everyone'
    const userId = req.user.id;
    const userRole = req.user.role;

    const message = await Message.findById(messageId);
    if (!message) {
      return errorResponse(res, 'Message not found', 404);
    }

    // Verify access
    const canDeleteForEveryone = 
      message.sender.participantId.toString() === userId.toString() ||
      userRole === 'admin';

    if (deleteFor === 'everyone' && !canDeleteForEveryone) {
      return errorResponse(res, 'Can only delete for everyone if you are the sender or admin', 403);
    }

    if (deleteFor === 'everyone') {
      // Delete message completely
      message.messageType = 'system';
      message.content = { text: encryptMessage('This message was deleted') };
      message.isDeleted = true;
      await message.save();

      // Emit to Socket.IO
      if (io) {
        io.to(message.roomId).emit('messageDeleted', {
          messageId: message._id,
          deletedFor: 'everyone',
          timestamp: new Date()
        });
      }
    } else {
      // Delete for current user only (add to deletedFor array)
      if (!message.deletedFor) {
        message.deletedFor = [];
      }
      
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }
    }

    return successResponse(res, 'Message deleted successfully', {
      messageId: message._id,
      deletedFor
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    return errorResponse(res, 'Failed to delete message', 500);
  }
};

// 🔍 Search messages
export const searchMessages = async (req, res) => {
  try {
    const { query, roomId } = req.query;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    if (!query || query.trim().length < 3) {
      return errorResponse(res, 'Search query must be at least 3 characters', 400);
    }

    // Build search filters
    let searchFilter = {
      $or: [
        { 'content.text': { $regex: query, $options: 'i' } },
        { 'sender.name': { $regex: query, $options: 'i' } }
      ],
      deletedFor: { $ne: userId }, // Exclude messages deleted by user
      isDeleted: { $ne: true } // Exclude messages deleted for everyone
    };

    // If roomId specified, search only in that room
    if (roomId) {
      // Verify user has access to this room
      const chat = await Chat.findOne({
        roomId: roomId,
        'participants.participantId': userId
      });

      if (!chat) {
        return errorResponse(res, 'Access denied to this chat room', 403);
      }

      searchFilter.roomId = roomId;
    } else {
      // Search across all user's chats
      const userChats = await Chat.find({
        'participants.participantId': userId,
        status: 'active'
      }).select('roomId');

      const roomIds = userChats.map(chat => chat.roomId);
      searchFilter.roomId = { $in: roomIds };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find(searchFilter)
      .populate('sender.participantId', 'fullName name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Decrypt messages for response
    const decryptedMessages = messages.map(msg => {
      const messageObj = msg.toObject();
      if (messageObj.content && messageObj.content.text) {
        try {
          messageObj.content.text = decryptMessage(messageObj.content.text);
        } catch (error) {
          // If decryption fails, keep original
        }
      }
      return messageObj;
    });

    const totalResults = await Message.countDocuments(searchFilter);

    return successResponse(res, 'Messages found', {
      messages: decryptedMessages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResults / parseInt(limit)),
        totalResults,
        hasMore: skip + messages.length < totalResults
      },
      searchQuery: query
    });

  } catch (error) {
    console.error('Error searching messages:', error);
    return errorResponse(res, 'Failed to search messages', 500);
  }
};

// 📤 Forward message
export const forwardMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { targetRoomIds } = req.body; // Array of room IDs to forward to
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!targetRoomIds || !Array.isArray(targetRoomIds) || targetRoomIds.length === 0) {
      return errorResponse(res, 'Target room IDs are required', 400);
    }

    const originalMessage = await Message.findById(messageId)
      .populate('sender.participantId', 'fullName name email');
    
    if (!originalMessage) {
      return errorResponse(res, 'Original message not found', 404);
    }

    // Verify user has access to original message
    const originalChat = await Chat.findOne({
      roomId: originalMessage.roomId,
      'participants.participantId': userId
    });

    if (!originalChat) {
      return errorResponse(res, 'Access denied to original message', 403);
    }

    // Get sender details
    const senderDetails = await getUserDetails(userId, getParticipantType(userRole));
    if (!senderDetails) {
      return errorResponse(res, 'Sender details not found', 404);
    }

    const forwardedMessages = [];

    // Forward to each target room
    for (const targetRoomId of targetRoomIds) {
      // Verify user has access to target room
      const targetChat = await Chat.findOne({
        roomId: targetRoomId,
        'participants.participantId': userId,
        status: 'active'
      });

      if (!targetChat) {
        console.log(`Skipping room ${targetRoomId} - access denied`);
        continue;
      }

      // Create forwarded message
      const forwardedMessage = new Message({
        roomId: targetRoomId,
        sender: {
          participantId: userId,
          participantType: getParticipantType(userRole),
          role: userRole,
          name: senderDetails.fullName || senderDetails.name
        },
        messageType: 'forwarded',
        content: {
          ...originalMessage.content,
          forwarded: {
            originalSender: originalMessage.sender.name,
            originalMessageId: originalMessage._id,
            originalRoomId: originalMessage.roomId,
            forwardedAt: new Date()
          }
        },
        status: 'sent'
      });

      await forwardedMessage.save();

      // Update target chat's last message
      targetChat.lastMessage = forwardedMessage._id;
      targetChat.updatedAt = new Date();
      await targetChat.save();

      forwardedMessages.push(forwardedMessage);

      // Emit to Socket.IO
      if (io) {
        io.to(targetRoomId).emit('newMessage', forwardedMessage);
      }
    }

    return successResponse(res, 'Message forwarded successfully', {
      originalMessageId: messageId,
      forwardedToRooms: forwardedMessages.length,
      forwardedMessages: forwardedMessages.map(msg => ({
        _id: msg._id,
        roomId: msg.roomId,
        createdAt: msg.createdAt
      }))
    });

  } catch (error) {
    console.error('Error forwarding message:', error);
    return errorResponse(res, 'Failed to forward message', 500);
  }
};

// 📊 Get chat statistics
export const getChatStatistics = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Verify user has access to this room
    const chat = await Chat.findOne({
      roomId: roomId,
      'participants.participantId': userId
    });

    if (!chat) {
      return errorResponse(res, 'Chat room not found or access denied', 404);
    }

    // Get various statistics
    const totalMessages = await Message.countDocuments({ roomId });
    const myMessages = await Message.countDocuments({ 
      roomId, 
      'sender.participantId': userId 
    });
    
    const mediaMessages = await Message.countDocuments({ 
      roomId, 
      messageType: 'media' 
    });
    
    const voiceMessages = await Message.countDocuments({ 
      roomId, 
      messageType: 'voice' 
    });

    // Get first and last message dates
    const firstMessage = await Message.findOne({ roomId }).sort({ createdAt: 1 });
    const lastMessage = await Message.findOne({ roomId }).sort({ createdAt: -1 });

    // Get most active participants
    const participantStats = await Message.aggregate([
      { $match: { roomId } },
      {
        $group: {
          _id: '$sender.participantId',
          messageCount: { $sum: 1 },
          senderName: { $first: '$sender.name' },
          lastMessageAt: { $max: '$createdAt' }
        }
      },
      { $sort: { messageCount: -1 } }
    ]);

    return successResponse(res, 'Chat statistics retrieved', {
      roomId,
      totalMessages,
      myMessages,
      mediaMessages,
      voiceMessages,
      chatDuration: {
        firstMessageAt: firstMessage?.createdAt,
        lastMessageAt: lastMessage?.createdAt,
        durationDays: firstMessage && lastMessage ? 
          Math.ceil((lastMessage.createdAt - firstMessage.createdAt) / (1000 * 60 * 60 * 24)) : 0
      },
      participantStats,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Error getting chat statistics:', error);
    return errorResponse(res, 'Failed to get chat statistics', 500);
  }
};

// 📤 Export chat data
export const exportChatData = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { format = 'json' } = req.query; // 'json', 'csv', 'txt'
    const userId = req.user.id;

    // Verify user has access to this room
    const chat = await Chat.findOne({
      roomId: roomId,
      'participants.participantId': userId
    }).populate('participants.participantId', 'fullName name email');

    if (!chat) {
      return errorResponse(res, 'Chat room not found or access denied', 404);
    }

    // Get all messages
    const messages = await Message.find({ 
      roomId,
      deletedFor: { $ne: userId }, // Exclude messages deleted by user
      isDeleted: { $ne: true } // Exclude messages deleted for everyone
    })
    .populate('sender.participantId', 'fullName name email')
    .sort({ createdAt: 1 });

    // Decrypt messages
    const decryptedMessages = messages.map(msg => {
      const messageObj = msg.toObject();
      if (messageObj.content && messageObj.content.text) {
        try {
          messageObj.content.text = decryptMessage(messageObj.content.text);
        } catch (error) {
          // Keep encrypted if decryption fails
        }
      }
      return messageObj;
    });

    const exportData = {
      chat: {
        roomId: chat.roomId,
        participants: chat.participants.map(p => ({
          name: p.participantId.fullName || p.participantId.name,
          email: p.participantId.email,
          role: p.role,
          joinedAt: p.joinedAt
        })),
        createdAt: chat.createdAt,
        exportedAt: new Date(),
        messageCount: decryptedMessages.length
      },
      messages: decryptedMessages.map(msg => ({
        id: msg._id,
        sender: msg.sender.name,
        messageType: msg.messageType,
        content: msg.content,
        timestamp: msg.createdAt,
        isEdited: msg.isEdited,
        reactions: msg.reactions
      }))
    };

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="chat_${roomId}_${Date.now()}.json"`);
      return res.json(exportData);
    }

    // For other formats, we'll return JSON for now
    // TODO: Implement CSV and TXT export formats
    return successResponse(res, 'Chat exported successfully', exportData);

  } catch (error) {
    console.error('Error exporting chat data:', error);
    return errorResponse(res, 'Failed to export chat data', 500);
  }
};

// Override the original sendMessage to include encryption
export const sendEncryptedMessage = async (req, res) => {
  try {
    const { roomId, messageType = 'text', content, replyTo } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify user is participant in this chat
    const chat = await Chat.findOne({
      roomId: roomId,
      'participants.participantId': userId,
      status: 'active'
    });

    if (!chat) {
      return errorResponse(res, 'Chat room not found or access denied', 404);
    }

    // Get sender details
    const senderDetails = await getUserDetails(userId, getParticipantType(userRole));
    if (!senderDetails) {
      return errorResponse(res, 'Sender details not found', 404);
    }

    // Prepare message content with encryption
    let messageContent;
    if (typeof content === 'string') {
      messageContent = { text: encryptMessage(content) };
    } else if (typeof content === 'object') {
      messageContent = { ...content };
      if (messageContent.text) {
        messageContent.text = encryptMessage(messageContent.text);
      }
    } else {
      messageContent = { text: encryptMessage(String(content)) };
    }

    // Create message
    const message = new Message({
      roomId,
      sender: {
        participantId: userId,
        participantType: getParticipantType(userRole),
        role: userRole,
        name: senderDetails.fullName || senderDetails.name
      },
      messageType,
      content: messageContent,
      replyTo: replyTo || null,
      status: 'sent'
    });

    await message.save();

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Populate message details for response
    await message.populate('sender.participantId', 'fullName name email');
    if (replyTo) {
      await message.populate('replyTo');
    }

    // Decrypt for response
    const responseMessage = message.toObject();
    if (responseMessage.content.text) {
      responseMessage.content.text = decryptMessage(responseMessage.content.text);
    }

    // Emit to Socket.IO with decrypted content
    if (io) {
      io.to(roomId).emit('newMessage', responseMessage);
    }

    return successResponse(res, 'Encrypted message sent successfully', responseMessage);

  } catch (error) {
    console.error('Error sending encrypted message:', error);
    return errorResponse(res, 'Failed to send encrypted message', 500);
  }
};
