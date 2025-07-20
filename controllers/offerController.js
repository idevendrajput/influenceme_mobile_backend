import Offer from '../models/offer.js';
import Chat from '../models/chat.js';
import Message from '../models/message.js';
import User from '../models/user.js';
import Influencer from '../models/influencer.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// Helper function to get user details
const getUserDetails = async (userId, userType) => {
  if (userType === 'User') {
    return await User.findById(userId).select('fullName email role');
  } else {
    return await Influencer.findById(userId).select('name fullName email role');
  }
};

// Create offer from brand to influencer
export const createOffer = async (req, res) => {
  try {
    const {
      influencerId,
      offerDetails: {
        title,
        description,
        amount,
        currency = 'USD',
        deadline,
        requirements = [],
        deliverables = []
      }
    } = req.body;

    const brandId = req.user.id;

    // Verify brand role
    if (req.user.role !== 'brand') {
      return errorResponse(res, 'Only brands can create offers', 403);
    }

    // Verify influencer exists
    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      return errorResponse(res, 'Influencer not found', 404);
    }

    // Create or get chat room
    const sortedIds = [brandId, influencerId].sort();
    const roomId = sortedIds.join('_');

    let chat = await Chat.findOne({ roomId });
    
    if (!chat) {
      // Create new chat room
      chat = new Chat({
        roomId,
        participants: [
          {
            participantId: brandId,
            participantType: 'User',
            role: 'brand'
          },
          {
            participantId: influencerId,
            participantType: 'influencers',
            role: 'influencer'
          }
        ],
        chatType: 'brand_influencer',
        createdBy: {
          participantId: brandId,
          participantType: 'User'
        }
      });
      await chat.save();
    }

    // Create offer
    const offer = new Offer({
      brandId,
      influencerId,
      roomId,
      offerDetails: {
        title,
        description,
        amount,
        currency,
        deadline: new Date(deadline),
        requirements,
        deliverables
      },
      status: 'pending'
    });

    await offer.save();

    // Get brand details for message
    const brandDetails = await User.findById(brandId).select('fullName');

    // Create offer message in chat
    const offerMessage = new Message({
      roomId,
      sender: {
        participantId: brandId,
        participantType: 'User',
        role: 'brand',
        name: brandDetails.fullName
      },
      messageType: 'offer',
      content: {
        text: `New offer: ${title}`,
        offer: {
          amount,
          description,
          deadline: new Date(deadline),
          requirements
        }
      },
      status: 'sent'
    });

    await offerMessage.save();

    // Update chat's last message
    chat.lastMessage = offerMessage._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Populate offer details
    await offer.populate('brandId', 'fullName email');
    await offer.populate('influencerId', 'name fullName email');

    return successResponse(res, 'Offer created successfully', {
      offer,
      message: offerMessage,
      roomId
    });

  } catch (error) {
    console.error('Error creating offer:', error);
    return errorResponse(res, 'Failed to create offer', 500);
  }
};

// Respond to offer (Accept/Decline/Negotiate)
export const respondToOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { responseType, message, negotiationDetails } = req.body;
    const influencerId = req.user.id;

    // Verify influencer role
    if (req.user.role !== 'influencer') {
      return errorResponse(res, 'Only influencers can respond to offers', 403);
    }

    // Find offer
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return errorResponse(res, 'Offer not found', 404);
    }

    // Verify influencer is the recipient
    if (offer.influencerId.toString() !== influencerId.toString()) {
      return errorResponse(res, 'You are not authorized to respond to this offer', 403);
    }

    // Check if offer is still pending
    if (offer.status !== 'pending' && offer.status !== 'negotiated') {
      return errorResponse(res, 'Offer is no longer available for response', 400);
    }

    // Add response to offer
    const response = {
      responseType,
      message,
      respondedAt: new Date()
    };

    if (responseType === 'negotiate' && negotiationDetails) {
      response.negotiationDetails = negotiationDetails;
    }

    offer.responses.push(response);

    // Update offer status
    switch (responseType) {
      case 'accept':
        offer.status = 'accepted';
        offer.acceptedAt = new Date();
        offer.finalTerms = {
          agreedAmount: offer.offerDetails.amount,
          agreedDeadline: offer.offerDetails.deadline,
          finalRequirements: offer.offerDetails.requirements,
          finalDeliverables: offer.offerDetails.deliverables
        };
        break;
      case 'decline':
        offer.status = 'declined';
        break;
      case 'negotiate':
        offer.status = 'negotiated';
        break;
    }

    await offer.save();

    // Get influencer details for message
    const influencerDetails = await Influencer.findById(influencerId).select('name fullName');

    // Create response message in chat
    const responseMessage = new Message({
      roomId: offer.roomId,
      sender: {
        participantId: influencerId,
        participantType: 'influencers',
        role: 'influencer',
        name: influencerDetails.fullName || influencerDetails.name
      },
      messageType: responseType === 'accept' ? 'acceptance' : 
                  responseType === 'decline' ? 'decline' : 'negotiation',
      content: {
        text: message || `Offer ${responseType}ed`,
        response: {
          type: responseType,
          message: message
        }
      },
      status: 'sent'
    });

    await responseMessage.save();

    // Update chat's last message
    await Chat.findOneAndUpdate(
      { roomId: offer.roomId },
      { 
        lastMessage: responseMessage._id,
        updatedAt: new Date()
      }
    );

    // Populate offer details
    await offer.populate('brandId', 'fullName email');
    await offer.populate('influencerId', 'name fullName email');

    return successResponse(res, `Offer ${responseType}ed successfully`, {
      offer,
      response: responseMessage
    });

  } catch (error) {
    console.error('Error responding to offer:', error);
    return errorResponse(res, 'Failed to respond to offer', 500);
  }
};

// Get user's offers (brands see sent offers, influencers see received offers)
export const getUserOffers = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, page = 1, limit = 20 } = req.query;

    let filter = {};
    
    if (userRole === 'brand') {
      filter.brandId = userId;
    } else if (userRole === 'influencer') {
      filter.influencerId = userId;
    } else if (userRole === 'admin') {
      // Admin can see all offers
    } else {
      return errorResponse(res, 'Invalid user role for viewing offers', 403);
    }

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const offers = await Offer.find(filter)
      .populate('brandId', 'fullName email')
      .populate('influencerId', 'name fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOffers = await Offer.countDocuments(filter);

    return successResponse(res, 'Offers retrieved successfully', {
      offers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOffers / parseInt(limit)),
        totalOffers,
        hasMore: skip + offers.length < totalOffers
      }
    });

  } catch (error) {
    console.error('Error getting user offers:', error);
    return errorResponse(res, 'Failed to retrieve offers', 500);
  }
};

// Get specific offer details
export const getOfferDetails = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const offer = await Offer.findById(offerId)
      .populate('brandId', 'fullName email')
      .populate('influencerId', 'name fullName email');

    if (!offer) {
      return errorResponse(res, 'Offer not found', 404);
    }

    // Check access permissions
    if (userRole !== 'admin' && 
        offer.brandId._id.toString() !== userId.toString() && 
        offer.influencerId._id.toString() !== userId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    return successResponse(res, 'Offer details retrieved successfully', offer);

  } catch (error) {
    console.error('Error getting offer details:', error);
    return errorResponse(res, 'Failed to retrieve offer details', 500);
  }
};

// Update offer status (for admins or completion)
export const updateOfferStatus = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { status, completionNotes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return errorResponse(res, 'Offer not found', 404);
    }

    // Check permissions
    if (userRole !== 'admin' && 
        (status === 'completed' && offer.brandId.toString() !== userId.toString())) {
      return errorResponse(res, 'Access denied', 403);
    }

    // Update status
    offer.status = status;
    
    if (status === 'completed') {
      offer.completedAt = new Date();
      if (completionNotes) {
        offer.completionNotes = completionNotes;
      }
    }

    await offer.save();

    // Create system message in chat
    if (status === 'completed' || status === 'cancelled') {
      const systemMessage = new Message({
        roomId: offer.roomId,
        sender: {
          participantId: userId,
          participantType: userRole === 'influencer' ? 'influencers' : 'User',
          role: userRole,
          name: 'System'
        },
        messageType: 'system',
        content: {
          text: `Offer has been ${status}`
        },
        status: 'sent'
      });

      await systemMessage.save();

      // Update chat's last message
      await Chat.findOneAndUpdate(
        { roomId: offer.roomId },
        { 
          lastMessage: systemMessage._id,
          updatedAt: new Date()
        }
      );
    }

    await offer.populate('brandId', 'fullName email');
    await offer.populate('influencerId', 'name fullName email');

    return successResponse(res, 'Offer status updated successfully', offer);

  } catch (error) {
    console.error('Error updating offer status:', error);
    return errorResponse(res, 'Failed to update offer status', 500);
  }
};

// Get offer analytics (for admins)
export const getOfferAnalytics = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Only admins can access analytics', 403);
    }

    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get offer statistics
    const totalOffers = await Offer.countDocuments(dateFilter);
    
    const offersByStatus = await Offer.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const averageOfferAmount = await Offer.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, avgAmount: { $avg: '$offerDetails.amount' } } }
    ]);

    const topBrands = await Offer.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$brandId', offerCount: { $sum: 1 } } },
      { $sort: { offerCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'brandDetails'
        }
      }
    ]);

    const topInfluencers = await Offer.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$influencerId', offerCount: { $sum: 1 } } },
      { $sort: { offerCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'influencers',
          localField: '_id',
          foreignField: '_id',
          as: 'influencerDetails'
        }
      }
    ]);

    return successResponse(res, 'Analytics retrieved successfully', {
      totalOffers,
      offersByStatus,
      averageOfferAmount: averageOfferAmount[0]?.avgAmount || 0,
      topBrands,
      topInfluencers
    });

  } catch (error) {
    console.error('Error getting offer analytics:', error);
    return errorResponse(res, 'Failed to retrieve analytics', 500);
  }
};
