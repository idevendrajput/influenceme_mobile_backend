import Genre from '../models/genre.js';

// @desc    Get all genres
// @route   GET /api/genres
// @access  Public
export const getAllGenres = async (req, res) => {
    try {
        const genres = await Genre.find({})
            .sort({ index: 1, name: 1 })
            .lean();
        
        res.status(200).json({
            success: true,
            count: genres.length,
            data: genres
        });
    } catch (error) {
        console.error('Error fetching genres:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Get genre by ID
// @route   GET /api/genres/:id
// @access  Public
export const getGenreById = async (req, res) => {
    try {
        const genre = await Genre.findById(req.params.id);
        
        if (!genre) {
            return res.status(404).json({ 
                success: false,
                message: 'Genre not found' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: genre
        });
    } catch (error) {
        console.error('Error fetching genre:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Create new genre
// @route   POST /api/genres
// @access  Private/Admin
export const createGenre = async (req, res) => {
    try {
        const { name, icon, index } = req.body;
        
        if (!name) {
            return res.status(400).json({ 
                success: false,
                message: 'Genre name is required' 
            });
        }
        
        // Check if genre already exists
        const existingGenre = await Genre.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') } 
        });
        
        if (existingGenre) {
            return res.status(400).json({ 
                success: false,
                message: 'Genre already exists' 
            });
        }
        
        // If no index provided, set it to the next available index
        let genreIndex = index;
        if (!genreIndex) {
            const lastGenre = await Genre.findOne().sort({ index: -1 });
            genreIndex = lastGenre ? lastGenre.index + 1 : 1;
        }
        
        const genre = await Genre.create({
            name: name.trim(),
            icon,
            index: genreIndex
        });
        
        res.status(201).json({
            success: true,
            message: 'Genre created successfully',
            data: genre
        });
    } catch (error) {
        console.error('Error creating genre:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Update genre
// @route   PUT /api/genres/:id
// @access  Private/Admin
export const updateGenre = async (req, res) => {
    try {
        const { name, icon, index } = req.body;
        
        const genre = await Genre.findById(req.params.id);
        
        if (!genre) {
            return res.status(404).json({ 
                success: false,
                message: 'Genre not found' 
            });
        }
        
        // Check if updated name already exists (excluding current genre)
        if (name && name !== genre.name) {
            const existingGenre = await Genre.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: req.params.id }
            });
            
            if (existingGenre) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Genre name already exists' 
                });
            }
        }
        
        // Update fields
        genre.name = name?.trim() || genre.name;
        genre.icon = icon !== undefined ? icon : genre.icon;
        genre.index = index !== undefined ? index : genre.index;
        
        const updatedGenre = await genre.save();
        
        res.status(200).json({
            success: true,
            message: 'Genre updated successfully',
            data: updatedGenre
        });
    } catch (error) {
        console.error('Error updating genre:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Delete genre
// @route   DELETE /api/genres/:id
// @access  Private/Admin
export const deleteGenre = async (req, res) => {
    try {
        const genre = await Genre.findById(req.params.id);
        
        if (!genre) {
            return res.status(404).json({ 
                success: false,
                message: 'Genre not found' 
            });
        }
        
        // Check if genre is being used by any influencers
        const User = (await import('../models/influencer.js')).default;
        const usersWithGenre = await User.countDocuments({ genre: req.params.id });
        
        if (usersWithGenre > 0) {
            return res.status(400).json({ 
                success: false,
                message: `Cannot delete genre. It is being used by ${usersWithGenre} influencer(s)` 
            });
        }
        
        await genre.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Genre deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting genre:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Bulk update genre indexes
// @route   PUT /api/genres/bulk/reorder
// @access  Private/Admin
export const reorderGenres = async (req, res) => {
    try {
        const { genres } = req.body;
        
        if (!Array.isArray(genres)) {
            return res.status(400).json({ 
                success: false,
                message: 'Genres must be an array' 
            });
        }
        
        // Update each genre's index
        const updatePromises = genres.map(({ id, index }) => 
            Genre.findByIdAndUpdate(id, { index }, { new: true })
        );
        
        await Promise.all(updatePromises);
        
        const updatedGenres = await Genre.find({}).sort({ index: 1, name: 1 });
        
        res.status(200).json({
            success: true,
            message: 'Genres reordered successfully',
            data: updatedGenres
        });
    } catch (error) {
        console.error('Error reordering genres:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};
