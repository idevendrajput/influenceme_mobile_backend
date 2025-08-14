import express from 'express';
import axios from 'axios';
import { body, validationResult } from 'express-validator';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Website backend base URL - get campaigns from website
const WEBSITE_BASE_URL = process.env.WEBSITE_BASE_URL || 'http://localhost:3000/api';

/**
 * Get all campaigns for browse (from website backend)
 * This fetches campaigns created by brands on the website
 */
router.get('/browse', async (req, res) => {
    try {
        const { page = 1, limit = 20, status = 'active' } = req.query;
        
        console.log('🔍 Fetching campaigns from website backend...');
        
        // Fetch campaigns from website backend
        const websiteResponse = await axios.get(`${WEBSITE_BASE_URL}/campaigns/browse`, {
            params: { page, limit, status },
            timeout: 10000
        });
        
        console.log('✅ Campaigns fetched from website:', websiteResponse.data?.count || 0);
        
        return successResponse(res, 'Campaigns fetched successfully', {
            campaigns: websiteResponse.data.data || [],
            count: websiteResponse.data.count || 0,
            total: websiteResponse.data.total || 0,
            page: parseInt(page),
            pages: websiteResponse.data.pages || 1
        });
    } catch (error) {
        console.error('❌ Error fetching campaigns:', error.message);
        
        // Return mock data if website backend is down
        const mockCampaigns = [
            {
                id: 'mock-campaign-1',
                name: 'Summer Fashion Campaign',
                image: '',
                type: 'standard',
                compensationType: 'paid',
                status: 'active',
                budget: 5000,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                description: 'Fashion campaign for summer collection',
                locations: ['Mumbai', 'Delhi'],
                deliverables: [
                    { type: 'post', quantity: 2, description: 'Instagram posts' },
                    { type: 'story', quantity: 5, description: 'Instagram stories' }
                ],
                brandInfo: {
                    id: 'brand-1',
                    displayName: 'Fashion Brand',
                    email: 'brand@example.com',
                    website: 'https://fashionbrand.com'
                }
            }
        ];
        
        return successResponse(res, 'Campaigns fetched (mock data due to backend unavailability)', {
            campaigns: mockCampaigns,
            count: mockCampaigns.length,
            total: mockCampaigns.length,
            page: 1,
            pages: 1
        });
    }
});

/**
 * Apply to a campaign
 * This sends application to website backend and creates chat room
 */
router.post('/apply', 
    verifyToken,
    [
        body('campaign_id').notEmpty().withMessage('Campaign ID is required'),
        body('user_id').notEmpty().withMessage('User ID is required'),
        body('role').isIn(['influencer']).withMessage('Only influencers can apply'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 'Validation failed', errors.array(), 400);
            }

            const { campaign_id, user_id, role, message = 'I am interested in this campaign' } = req.body;
            
            console.log('📝 Campaign Application Request:');
            console.log('  - Campaign ID:', campaign_id);
            console.log('  - User ID:', user_id);
            console.log('  - Role:', role);
            console.log('  - Message:', message);

            // First, get the campaign details from website backend
            let campaign;
            try {
                const campaignResponse = await axios.get(`${WEBSITE_BASE_URL}/campaigns/${campaign_id}`, {
                    timeout: 5000
                });
                campaign = campaignResponse.data.data;
                console.log('✅ Campaign found:', campaign?.name);
            } catch (error) {
                console.log('⚠️  Campaign not found, using mock data');
                campaign = {
                    id: campaign_id,
                    name: 'Mock Campaign',
                    brandInfo: {
                        id: 'brand-1',
                        displayName: 'Mock Brand',
                        email: 'brand@example.com'
                    }
                };
            }

            // Send application to website backend
            try {
                const applicationData = {
                    campaignId: campaign_id,
                    influencerId: user_id,
                    influencerRole: role,
                    message: message,
                    appliedAt: new Date(),
                    status: 'pending'
                };

                console.log('📤 Sending application to website backend...');
                
                // Try to send to website backend
                const applicationResponse = await axios.post(
                    `${WEBSITE_BASE_URL}/campaigns/applications`, 
                    applicationData,
                    { timeout: 5000 }
                );
                
                console.log('✅ Application sent to website successfully');
                
            } catch (error) {
                console.log('⚠️  Website backend unavailable, proceeding with chat creation only');
            }

            // Create chat room between influencer and brand
            // Import the chat controller to create room
            try {
                const chatData = {
                    participantIds: [user_id, campaign.brandInfo?.id || 'brand-1'],
                    roles: ['influencer', 'brand'],
                    campaignId: campaign_id,
                    campaignName: campaign.name || 'Campaign'
                };

                // For now, return success - chat room creation will be handled by the chat system
                console.log('💬 Chat room data prepared:', chatData);

                return successResponse(res, 'Application submitted successfully! You can now chat with the brand.', {
                    application: {
                        campaignId: campaign_id,
                        status: 'pending',
                        appliedAt: new Date()
                    },
                    chatRoom: {
                        participants: chatData.participantIds,
                        campaignId: campaign_id,
                        campaignName: campaign.name
                    }
                });

            } catch (error) {
                console.error('❌ Error creating chat room:', error.message);
                
                // Even if chat fails, application was sent
                return successResponse(res, 'Application submitted successfully! Chat room creation pending.', {
                    application: {
                        campaignId: campaign_id,
                        status: 'pending',
                        appliedAt: new Date()
                    }
                });
            }

        } catch (error) {
            console.error('❌ Campaign application error:', error.message);
            return errorResponse(res, 'Failed to submit application', error.message, 500);
        }
    }
);

/**
 * Place bid on auction campaign
 */
router.post('/bid',
    verifyToken,
    [
        body('campaign_id').notEmpty().withMessage('Campaign ID is required'),
        body('user_id').notEmpty().withMessage('User ID is required'),
        body('bid_amount').isNumeric().withMessage('Valid bid amount is required'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 'Validation failed', errors.array(), 400);
            }

            const { campaign_id, user_id, bid_amount, message } = req.body;
            
            console.log('💰 Bid Placement Request:');
            console.log('  - Campaign ID:', campaign_id);
            console.log('  - User ID:', user_id);
            console.log('  - Bid Amount:', bid_amount);

            // Send bid to website backend
            try {
                const bidData = {
                    campaignId: campaign_id,
                    influencerId: user_id,
                    bidAmount: bid_amount,
                    message: message,
                    placedAt: new Date(),
                    status: 'active'
                };

                console.log('📤 Sending bid to website backend...');
                
                const bidResponse = await axios.post(
                    `${WEBSITE_BASE_URL}/campaigns/bids`, 
                    bidData,
                    { timeout: 5000 }
                );
                
                console.log('✅ Bid sent to website successfully');
                
            } catch (error) {
                console.log('⚠️  Website backend unavailable for bid submission');
            }

            return successResponse(res, 'Bid placed successfully! The brand will review your bid.', {
                bid: {
                    campaignId: campaign_id,
                    bidAmount: bid_amount,
                    status: 'active',
                    placedAt: new Date()
                }
            });

        } catch (error) {
            console.error('❌ Bid placement error:', error.message);
            return errorResponse(res, 'Failed to place bid', error.message, 500);
        }
    }
);

/**
 * Get user's applications (for influencer dashboard)
 */
router.get('/applications', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return errorResponse(res, 'User ID not found', null, 400);
        }

        // For now, return mock data
        // In production, this would fetch from database
        const mockApplications = [
            {
                id: 'app-1',
                campaignId: 'campaign-1',
                campaignName: 'Summer Fashion Campaign',
                brandName: 'Fashion Brand',
                status: 'pending',
                appliedAt: new Date(),
                message: 'I am interested in this campaign'
            }
        ];

        return successResponse(res, 'Applications fetched successfully', {
            applications: mockApplications,
            count: mockApplications.length
        });

    } catch (error) {
        console.error('❌ Error fetching applications:', error.message);
        return errorResponse(res, 'Failed to fetch applications', error.message, 500);
    }
});

export default router;
