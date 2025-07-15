import express from 'express';
import { checkUserExists, register, login} from '../../controllers/user/authController.js';
import { handleTextFormData, handleFormData } from '../../middleware/upload.js';

const router = express.Router();

// Check if user exists (public route)
router.post('/check_user_exists', handleTextFormData, checkUserExists);

// Registration
router.post('/register', handleFormData, register);

// Authentication
router.post('/login', handleTextFormData, login);

export default router;
