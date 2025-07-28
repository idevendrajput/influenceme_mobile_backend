import Chat from '../models/chat.js';
import Message from '../models/message.js';
import User from '../models/user.js';
import Influencer from '../models/influencer.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { v4 as uuidv4 } from 'uuid';

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
