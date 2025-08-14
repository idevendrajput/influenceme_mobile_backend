// This file assumes the existing authenticate middleware is also here or will be merged.

import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Influencer from '../models/influencer.js';
import { errorResponse } from '../utils/responseHelper.js';
import { verifyToken as jwtVerifyToken, validateCrossBackendAccess } from '../utils/jwtService.js';

// Helper function to find user in appropriate collection
const findUserByIdAndRole = async (userId, role) => {
    if (role === 'influencer') {
        return await Influencer.findById(userId);
    } else {
        return await User.findById(userId);
    }
};

// Cross-backend compatible authentication middleware
export const authenticate = async (req, res, next) => {
    try {
        let token;

        // Check if token is in Authorization header as Bearer token
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return errorResponse(res, 'Not authorized, no token provided.', 401);
        }

        // Use unified JWT service for token verification
        let decoded;
        try {
            decoded = jwtVerifyToken(token);
        } catch (jwtError) {
            // Fallback to old JWT verification for backward compatibility
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        }
        
        // Validate cross-backend access
        if (!validateCrossBackendAccess(decoded, 'mobile')) {
            return errorResponse(res, 'Token not valid for this backend.', 403);
        }
        
        // Try to find user in appropriate collection based on role
        let user = null;
        if (decoded.role) {
            user = await findUserByIdAndRole(decoded.id, decoded.role);
        } else {
            // Fallback: try both collections if role is not in token
            user = await User.findById(decoded.id) || await Influencer.findById(decoded.id);
        }
        
        if (!user) {
            return errorResponse(res, 'User not found.', 404);
        }
        
        // Attach user with ID and role to request
        req.user = {
            id: user._id,
            role: user.role,
            source: decoded.source || 'mobile',
            platform: decoded.platform || 'influence-me',
            ...user.toObject()
        };
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return errorResponse(res, 'Not authorized, token failed.', 401);
    }
};

/**
 * Middleware to authorize users based on their role.
 * @param  {...string} roles - The roles that are allowed to access the route (e.g., 'admin', 'influencer').
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return errorResponse(res, 'Not authorized, user role missing.', 403);
        }
        if (!roles.includes(req.user.role)) {
            return errorResponse(res, `User role (${req.user.role}) is not authorized to access this route.`, 403);
        }
        next();
    };
};

// Alias for backward compatibility
export { authenticate as verifyToken };
