import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import User from "../../models/influencer.js";
import Influencer from "../../models/influencer.js";
import { successResponse, errorResponse } from '../../utils/responseHelper.js';
import { parseFormData } from '../../utils/formDataParser.js';
import { generateMobileToken } from '../../utils/jwtService.js';

dotenv.config();

// Old generateToken function removed - now using unified JWT service

// Registration Handler
// @influence registration
export const register = async (req, res) => {
    try {
        // Parse form data
        const parsedData = parseFormData(req.body, req.files);
        const { 
            name, 
            email, 
            country,
            phoneCode,
            phone,
            about,
            dateOfBirth, 
            spokenLanguages,
            maritalStatus,
            children,
            pets,
            addresses,
            influencerType,
            workType,
            influencerSince
        } = parsedData;

        if(!name) {
            return errorResponse(res, 'Name is required', 400);
        }

        if (!email && !phone) {
            return errorResponse(res, 'Name and either email or phone is required', 400);
        }
        
        // Validate about field length
        if (about && about.length > 500) {
            return errorResponse(res, 'About field cannot exceed 500 characters', 400);
        }
        
        // Validate date of birth format
        if (dateOfBirth && isNaN(new Date(dateOfBirth).getTime())) {
            return errorResponse(res, 'Invalid date of birth format', 400);
        }
        
        // Check if user already exists
        const existingUserByPhone = phone && phoneCode ? await User.findOne({ phone, phoneCode }).lean() : null;
        const existingUserByEmail = email ? await User.findOne({ email }).lean() : null;

        if (existingUserByPhone) {
            return errorResponse(res, 'Phone number already exists', 400);
        }
        
        if (existingUserByEmail) {
            return errorResponse(res, 'Email already exists', 400);
        }

        // Create new user with parsed data
        // Remove null phone to avoid duplicate key error
        if (!phone) {
            delete parsedData.phone;
        }
        if (!email) {
            delete parsedData.email;
        }
        const user = await Influencer.create(parsedData);

        // Generate token using unified JWT service
        const token = generateMobileToken(user._id, user.role || 'influencer');

        return successResponse(res, 'User registered successfully', {
            user: {
                id: user._id,
                name: user.name,
                about: user.about,
                email: user.email,
                phone: user.phone,
                phoneCode: user.phoneCode,
                country: user.country,
                dateOfBirth: user.dateOfBirth,
                spokenLanguages: user.spokenLanguages,
                maritalStatus: user.maritalStatus,
                children: user.children,
                pets: user.pets,
                addresses: user.addresses,
                influencerType: user.influencerType,
                workType: user.workType,
                influencerSince: user.influencerSince,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            token
        }, 201);
    } catch (error) {
        console.log(error)
        return errorResponse(res, error.message, 400);
    }
};

export const checkUserExists = async (req, res) => {
    try {
        // Parse form data
        const parsedData = parseFormData(req.body);
        const { email, phone, phoneCode } = parsedData;
        
        if (!email && !phone) {
            return errorResponse(res, 'Email or phone number is required', 400);
        }
        
        const existingUserByPhone = phone && phoneCode ? await User.findOne({ phone, phoneCode }).lean() : null;
        const existingUserByEmail = email ? await User.findOne({ email }).lean() : null;
        
        if (existingUserByPhone || existingUserByEmail) {
            return successResponse(res, 'User already exists', { exists: true });
        }
        
        return successResponse(res, 'User does not exist', { exists: false });
    } catch (error) {
        return errorResponse(res, error.message, 400);
    }
}

export const login = async (req, res) => {
    try {
        // Parse form data
        const parsedData = parseFormData(req.body);
        const { email, phone, phoneCode } = parsedData;

        if (!email && !phone) {
            return errorResponse(res, 'Email or phone number is required', 400);
        }

        // Find user by email or phone
        const query = {};
        if (email) query.email = email;
        if (phone && phoneCode) {
            query.phone = phone;
            query.phoneCode = phoneCode;
        }
        
        const user = await User.findOne(query).lean();

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Check if user is active
        if (!user.isActive) {
            return errorResponse(res, 'Account is deactivated', 403);
        }

        // Generate token using unified JWT service
        const token = generateMobileToken(user._id, user.role || 'influencer');

        return successResponse(res, 'Login successful', {
            user: {
                id: user._id,
                name: user.name,
                about: user.about,
                email: user.email,
                phoneCode: user.phoneCode,
                phone: user.phone,
                country: user.country,
                dateOfBirth: user.dateOfBirth,
                spokenLanguages: user.spokenLanguages,
                maritalStatus: user.maritalStatus,
                children: user.children,
                pets: user.pets,
                addresses: user.addresses,
                influencerType: user.influencerType,
                workType: user.workType,
                influencerSince: user.influencerSince,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            token
        });
    } catch (error) {
        return errorResponse(res, error.message, 400);
    }
};
