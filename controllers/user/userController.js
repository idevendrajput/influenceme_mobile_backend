import User from '../../models/influencer.js';
import Media from '../../models/media.js'; // Import Media model
import Genre from '../../models/genre.js'; // Import Genre model (if needed for populate)
import { successResponse, errorResponse } from '../../utils/responseHelper.js';
import { parseFormData } from '../../utils/formDataParser.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        // req.user is populated by the authenticate middleware
        // const { user_id } = parseFormData(req.body, req.files);

        const user = await User.findById(req.user._id)
            .populate('genre') // Populate genre details
            .populate('media'); // Populate media details

        if (user) {
            return successResponse(res, 'User profile retrieved successfully', {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                fullName: user.fullName,
                dateOfBirth: user.dateOfBirth,
                spokenLanguages: user.spokenLanguages,
                country: user.country,
                addresses: user.addresses,
                role: user.role,
                maritalStatus: user.maritalStatus,
                children: user.children,
                pets: user.pets,
                media: user.media,
                influencerType: user.influencerType,
                instagram: user.instagram,
                facebook: user.facebook,
                linkedin: user.linkedin,
                website: user.website,
                youtube: user.youtube,
                genre: user.genre,
                workType: user.workType,
                influencerSince: user.influencerSince,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
        } else {
            return errorResponse(res, 'User not found', 404);
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return errorResponse(res, 'Server error', 500);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        // Parse form data
        const parsedData = parseFormData(req.body, req.files);

        const user = await User.findById(req.user._id);

        if (user) {
            // Update fields from request body if they exist
            user.name = parsedData.name || user.name;
            user.phone = parsedData.phone || user.phone;
            user.email = parsedData.email || user.email;
            user.fullName = parsedData.fullName || user.fullName;
            user.dateOfBirth = parsedData.dateOfBirth || user.dateOfBirth;
            user.spokenLanguages = parsedData.spokenLanguages || user.spokenLanguages;
            user.country = parsedData.country || user.country;

            // Handle nested address updates
            if (parsedData.addresses) {
                user.addresses.streetAddress = parsedData.addresses.streetAddress || user.addresses.streetAddress;
                user.addresses.state = parsedData.addresses.state || user.addresses.state;
                user.addresses.country = parsedData.addresses.country || user.addresses.country;
                user.addresses.pinCode = parsedData.addresses.pinCode || user.addresses.pinCode;
                user.addresses.latitude = parsedData.addresses.latitude || user.addresses.latitude;
                user.addresses.longitude = parsedData.addresses.longitude || user.addresses.longitude;
            }

            user.maritalStatus = parsedData.maritalStatus || user.maritalStatus;
            user.children = parsedData.children || user.children;
            user.pets = parsedData.pets || user.pets;

            // For media and genre, you might want to replace the array or add/remove specific items.
            // This example replaces the array with new IDs.
            // Ensure parsedData.media and parsedData.genre contain valid ObjectId strings.
            if (parsedData.media && Array.isArray(parsedData.media)) {
                // Validate if provided media IDs exist if necessary
                const existingMedia = await Media.find({ '_id': { $in: parsedData.media } });
                if (existingMedia.length !== parsedData.media.length) {
                    return errorResponse(res, 'One or more provided media IDs are invalid.', 400);
                }
                user.media = parsedData.media;
            }

            if (parsedData.genre && Array.isArray(parsedData.genre)) {
                // Validate if provided genre IDs exist if necessary
                const existingGenres = await Genre.find({ '_id': { $in: parsedData.genre } });
                if (existingGenres.length !== parsedData.genre.length) {
                    return errorResponse(res, 'One or more provided genre IDs are invalid.', 400);
                }
                user.genre = parsedData.genre;
            }

            user.influencerType = parsedData.influencerType || user.influencerType;
            
            // Handle nested social media updates
            if (parsedData.instagram) {
                user.instagram = user.instagram || {};
                if (parsedData.instagram.url !== undefined) {
                    user.instagram.url = parsedData.instagram.url;
                }
                if (parsedData.instagram.followers) {
                    user.instagram.followers = user.instagram.followers || {};
                    if (parsedData.instagram.followers.actual !== undefined) {
                        user.instagram.followers.actual = parsedData.instagram.followers.actual;
                    }
                    if (parsedData.instagram.followers.bought !== undefined) {
                        user.instagram.followers.bought = parsedData.instagram.followers.bought;
                    }
                }
                if (parsedData.instagram.engagement) {
                    user.instagram.engagement = user.instagram.engagement || {};
                    if (parsedData.instagram.engagement.averagePerPost !== undefined) {
                        user.instagram.engagement.averagePerPost = parsedData.instagram.engagement.averagePerPost;
                    }
                    if (parsedData.instagram.engagement.topEngagementPerPost !== undefined) {
                        user.instagram.engagement.topEngagementPerPost = parsedData.instagram.engagement.topEngagementPerPost;
                    }
                    if (parsedData.instagram.engagement.maximumLikesPerPost !== undefined) {
                        user.instagram.engagement.maximumLikesPerPost = parsedData.instagram.engagement.maximumLikesPerPost;
                    }
                }
            }
            
            if (parsedData.facebook) {
                user.facebook = user.facebook || {};
                if (parsedData.facebook.url !== undefined) {
                    user.facebook.url = parsedData.facebook.url;
                }
                if (parsedData.facebook.followers) {
                    user.facebook.followers = user.facebook.followers || {};
                    if (parsedData.facebook.followers.actual !== undefined) {
                        user.facebook.followers.actual = parsedData.facebook.followers.actual;
                    }
                    if (parsedData.facebook.followers.bought !== undefined) {
                        user.facebook.followers.bought = parsedData.facebook.followers.bought;
                    }
                }
            }
            
            if (parsedData.linkedin) {
                user.linkedin = user.linkedin || {};
                if (parsedData.linkedin.url !== undefined) {
                    user.linkedin.url = parsedData.linkedin.url;
                }
                if (parsedData.linkedin.followers) {
                    user.linkedin.followers = user.linkedin.followers || {};
                    if (parsedData.linkedin.followers.actual !== undefined) {
                        user.linkedin.followers.actual = parsedData.linkedin.followers.actual;
                    }
                    if (parsedData.linkedin.followers.bought !== undefined) {
                        user.linkedin.followers.bought = parsedData.linkedin.followers.bought;
                    }
                }
            }
            
            if (parsedData.youtube) {
                user.youtube = user.youtube || {};
                if (parsedData.youtube.url !== undefined) {
                    user.youtube.url = parsedData.youtube.url;
                }
                if (parsedData.youtube.followers !== undefined) {
                    user.youtube.followers = parsedData.youtube.followers;
                }
                if (parsedData.youtube.videosPosted !== undefined) {
                    user.youtube.videosPosted = parsedData.youtube.videosPosted;
                }
                if (parsedData.youtube.maximumLikesPerVideo !== undefined) {
                    user.youtube.maximumLikesPerVideo = parsedData.youtube.maximumLikesPerVideo;
                }
            }
            
            user.website = parsedData.website || user.website;
            user.workType = parsedData.workType || user.workType;
            user.influencerSince = parsedData.influencerSince || user.influencerSince;


            const updatedUser = await user.save();

            // Return updated user data (excluding password)
            return successResponse(res, 'User profile updated successfully', {
                _id: updatedUser._id,
                name: updatedUser.name,
                phone: updatedUser.phone,
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                role: updatedUser.role,
                media: updatedUser.media,
                genre: updatedUser.genre,
                updatedAt: updatedUser.updatedAt,
            });
        } else {
            return errorResponse(res, 'User not found', 404);
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
        return errorResponse(res, 'Server error', 500);
    }
};

// @desc    Get all users with pagination and filtering
// @route   GET /api/users
// @access  Private/Admin or Public with limitations
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter = { isActive: true };
        
        // Add filters based on query parameters
        if (req.query.country) {
            filter.country = { $regex: req.query.country, $options: 'i' };
        }
        
        if (req.query.influencerType) {
            filter.influencerType = req.query.influencerType;
        }
        
        if (req.query.workType) {
            filter.workType = req.query.workType;
        }
        
        if (req.query.genre) {
            filter.genre = { $in: req.query.genre.split(',') };
        }
        
        if (req.query.maritalStatus) {
            filter.maritalStatus = req.query.maritalStatus;
        }
        
        if (req.query.minFollowers) {
            filter.$or = [
                { "instagram.followers.actual": { $gte: parseInt(req.query.minFollowers) } },
                { "facebook.followers.actual": { $gte: parseInt(req.query.minFollowers) } },
                { "linkedin.followers.actual": { $gte: parseInt(req.query.minFollowers) } },
                { "youtube.followers": { $gte: parseInt(req.query.minFollowers) } }
            ];
        }
        
        if (req.query.name) {
            filter.$or = [
                { name: { $regex: req.query.name, $options: 'i' } },
                { fullName: { $regex: req.query.name, $options: 'i' } }
            ];
        }
        
        // Build sort object
        let sort = {};
        if (req.query.sortBy) {
            const sortField = req.query.sortBy;
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
            sort[sortField] = sortOrder;
        } else {
            sort.createdAt = -1; // Default sort by creation date
        }
        
        // Execute query with pagination
        const users = await User.find(filter)
            .select('-password')
            .populate('genre')
            .populate('media')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();
        
        // Get total count for pagination
        const totalUsers = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalUsers / limit);
        
        return successResponse(res, 'Users retrieved successfully', {
            users,
            filters: {
                applied: req.query,
                available: {
                    countries: await User.distinct('country'),
                    influencerTypes: ['micro', 'macro', 'mega', 'nano'],
                    workTypes: ['full-time', 'part-time', 'freelance'],
                    maritalStatuses: ['single', 'married', 'divorced', 'widowed']
                }
            }
        }, 200, {
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error('Error fetching all users:', error);
        return errorResponse(res, 'Server error', 500);
    }
};

// @desc    Get user by ID (Admin only, or for specific use cases)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password') // Exclude password
            .populate('genre')
            .populate('media');

        if (user) {
            return successResponse(res, 'User retrieved successfully', user);
        } else {
            return errorResponse(res, 'User not found', 404);
        }
    } catch (error) {
        console.error(`Error fetching user with ID ${req.params.id}:`, error);
        return errorResponse(res, 'Server error', 500);
    }
};


// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Prevent admin from deleting themselves or other critical users
            // if (user.role === 'admin' && req.user.role !== 'superadmin') {
            //     return errorResponse(res, 'Cannot delete an admin user without superadmin privileges.', 403);
            // }

            await user.deleteOne(); // Use deleteOne() for Mongoose 6+
            return successResponse(res, 'User removed successfully', null);
        } else {
            return errorResponse(res, 'User not found', 404);
        }
    } catch (error) {
        console.error(`Error deleting user with ID ${req.params.id}:`, error);
        return errorResponse(res, 'Server error', 500);
    }
};