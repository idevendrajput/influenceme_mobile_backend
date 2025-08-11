import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Unified JWT Service for InfluenceMe Platform
 * This service ensures consistent JWT token generation and verification
 * across Mobile Backend and Website Backend
 */

// Common JWT configuration
const JWT_CONFIG = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '30d',
    issuer: 'influence-me-platform',
    audience: ['mobile-backend', 'website-backend']
};

/**
 * Generate JWT token with unified structure
 * @param {Object} payload - User data for token
 * @param {string} payload.id - User ID
 * @param {string} payload.role - User role (influencer, brand, vendor, admin)
 * @param {string} payload.email - User email (optional)
 * @param {string} payload.name - User name (optional)
 * @param {string} [payload.source] - Source backend (mobile/website)
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
    const tokenPayload = {
        id: payload.id,
        role: payload.role,
        email: payload.email,
        name: payload.name,
        source: payload.source || 'mobile',
        iat: Math.floor(Date.now() / 1000),
        platform: 'influence-me'
    };

    return jwt.sign(tokenPayload, JWT_CONFIG.secret, {
        expiresIn: JWT_CONFIG.expiresIn,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
    });
};

/**
 * Verify JWT token and extract payload
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid
 */
export const verifyToken = (token) => {
    return jwt.verify(token, JWT_CONFIG.secret, {
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
    });
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
    return jwt.decode(token);
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return true;
        
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

/**
 * Generate token for mobile backend users (influencers)
 * @param {Object} user - User object from influencer model
 * @returns {string} JWT token
 */
export const generateMobileToken = (user) => {
    return generateToken({
        id: user._id,
        role: user.role || 'influencer',
        email: user.email,
        name: user.name,
        source: 'mobile'
    });
};

/**
 * Generate token for website backend users (brands, vendors, admins)
 * @param {Object} user - User object from website user model
 * @returns {string} JWT token
 */
export const generateWebsiteToken = (user) => {
    return generateToken({
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.fullName || user.name,
        source: 'website'
    });
};

/**
 * Validate token compatibility between backends
 * @param {Object} decodedToken - Decoded JWT payload
 * @param {string} requestingBackend - Backend making the request ('mobile' or 'website')
 * @returns {boolean} True if token is valid for the requesting backend
 */
export const validateCrossBackendAccess = (decodedToken, requestingBackend) => {
    // Allow cross-backend access for specific roles
    const crossBackendRoles = ['admin', 'influencer', 'brand', 'vendor'];
    
    if (!crossBackendRoles.includes(decodedToken.role)) {
        return false;
    }
    
    // Check if token is from influence-me platform
    if (decodedToken.platform !== 'influence-me') {
        return false;
    }
    
    // Allow access regardless of source backend
    return true;
};

export default {
    generateToken,
    verifyToken,
    decodeToken,
    isTokenExpired,
    generateMobileToken,
    generateWebsiteToken,
    validateCrossBackendAccess,
    JWT_CONFIG
};
