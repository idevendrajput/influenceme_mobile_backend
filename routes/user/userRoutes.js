import express from 'express';
import { updateProfile, getProfile, getAllUsers, getUserById, deleteUser } from '../../controllers/user/userController.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { handleFormData } from '../../middleware/upload.js';

const router = express.Router();

// Get user profile (authenticated users can get their own profile)
router.get('/profile', authenticate, getProfile);

// Update user profile (authenticated users can update their own profile)
router.put('/profile', authenticate, handleFormData, updateProfile);

// Get all users with pagination and filtering (public for now, can be restricted later)
router.get('/', getAllUsers);

// Get user by ID (admin only)
router.get('/:id', authenticate, authorize('admin'), getUserById);

// Delete user (admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;
