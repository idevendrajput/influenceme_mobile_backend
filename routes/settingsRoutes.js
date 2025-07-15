import express from 'express';
import { 
    getAllSettings, 
    getSettingByKey, 
    createSetting, 
    updateSetting, 
    deleteSetting, 
    toggleSetting, 
    getPublicSettings, 
    initializeSettings 
} from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicSettings);
router.get('/:key', getSettingByKey);

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllSettings);
router.post('/', authenticate, authorize('admin'), createSetting);
router.post('/init', authenticate, authorize('admin'), initializeSettings);
router.put('/:key', authenticate, authorize('admin'), updateSetting);
router.patch('/:key/toggle', authenticate, authorize('admin'), toggleSetting);
router.delete('/:key', authenticate, authorize('admin'), deleteSetting);

export default router;
