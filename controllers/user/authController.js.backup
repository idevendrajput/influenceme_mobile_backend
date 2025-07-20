import jwt from 'jsonwebtoken';
import dotenv from "dotenv"
import User from "../../models/influencer.js";
import Influencer from "../../models/influencer.js";
import { successResponse, errorResponse } from '../../utils/responseHelper.js';
import { parseFormData } from '../../utils/formDataParser.js';

dotenv.config();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Registration Handler
// @influence registration
export const register = async (req, res) => {
    try {
        // Parse form data
        const parsedData = parseFormData(req.body, req.files);
        const { name, email, country, phone, fullName, dateOfBirth, spokenLanguages } = parsedData;

        if(name == null) {
            return errorResponse(res, 'Name is required', 400);
        }

        if (!email && !phone) {
            return errorResponse(res, 'Name and either email or phone is required', 400);
        }
        
        // Check if user already exists
        const existingUserByPhone = phone ? await User.findOne({ phone }) : null;
        const existingUserByEmail = email ? await User.findOne({ email }) : null;


        if (existingUserByPhone) {
            return errorResponse(res, 'Phone number already exists', 400);
        }
        
        if (existingUserByEmail) {
            return errorResponse(res, 'Email already exists', 400);
        }

        // Create new user with parsed data
        const user = await Influencer.create(parsedData);

        // Generate token
        const token = generateToken(user._id);

        return successResponse(res, 'User registered successfully', {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                country: user.country,
                role: user.role
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
        const { email, phone } = parsedData;
        
        if (!email && !phone) {
            return errorResponse(res, 'Email or phone number is required', 400);
        }
        
        const existingUserByPhone = phone ? await User.findOne({ phone }) : null;
        const existingUserByEmail = email ? await User.findOne({ email }) : null;
        
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
        const { email, phone } = parsedData;

        if (!email && !phone) {
            return errorResponse(res, 'Email or phone number is required', 400);
        }

        // Find user by email or phone
        const query = {};
        if (email) query.email = email;
        if (phone) query.phone = phone;
        
        const user = await User.findOne(query);

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Check if user is active
        if (!user.isActive) {
            return errorResponse(res, 'Account is deactivated', 403);
        }

        // Generate token
        const token = generateToken(user._id);

        return successResponse(res, 'Login successful', {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                country: user.country,
                role: user.role
            },
            token
        });
    } catch (error) {
        return errorResponse(res, error.message, 400);
    }
};
