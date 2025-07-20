import express from 'express';
import {
  createOffer,
  respondToOffer,
  getUserOffers,
  getOfferDetails,
  updateOfferStatus,
  getOfferAnalytics
} from '../controllers/offerController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Offer management
router.post('/', createOffer);
router.get('/', getUserOffers);
router.get('/:offerId', getOfferDetails);
router.put('/:offerId/respond', respondToOffer);
router.put('/:offerId/status', updateOfferStatus);

// Analytics (admin only)
router.get('/analytics/overview', getOfferAnalytics);

export default router;
