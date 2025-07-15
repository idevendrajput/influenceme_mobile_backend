import express from 'express';
import { 
    getAllGenres, 
    getGenreById, 
    createGenre, 
    updateGenre, 
    deleteGenre, 
    reorderGenres 
} from '../controllers/genreController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllGenres);
router.get('/:id', getGenreById);

// Admin only routes
router.post('/', authenticate, authorize('admin'), createGenre);
router.put('/bulk/reorder', authenticate, authorize('admin'), reorderGenres);
router.put('/:id', authenticate, authorize('admin'), updateGenre);
router.delete('/:id', authenticate, authorize('admin'), deleteGenre);

export default router;
