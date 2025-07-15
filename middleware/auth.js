// This file assumes the existing authenticate middleware is also here or will be merged.

import jwt from 'jsonwebtoken';
import User from '../models/influencer.js';
import { errorResponse } from '../utils/responseHelper.js';

// Existing authenticate middleware (if you had it, ensure it's here)
export const authenticate = async (req, res, next) => {
    try {
        let token;

        // Check if token is in Authorization header as Bearer token
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // If you're using cookies for token storage, you might check req.cookies.token here too
        // else if (req.cookies.token) {
        //     token = req.cookies.token;
        // }

        if (!token) {
            return errorResponse(res, 'Not authorized, no token provided.', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your actual JWT_SECRET
        req.user = await User.findById(decoded.id); // Attach user to request
        if (!req.user) {
            return errorResponse(res, 'User not found.', 404);
        }
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
