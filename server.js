import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import connectDB from './config/db.js';
import authRoutes from "./routes/user/authRoutes.js"
import userRoutes from './routes/user/userRoutes.js';
import genreRoutes from './routes/genreRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { successResponse, errorResponse } from './utils/responseHelper.js';

dotenv.config();

const app = express();

connectDB();

// CORS Configuration - Allow all origins for IP-based access
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
            // Allow localhost for development
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                return callback(null, true);
            }
            
            // Allow any IP address for now (you can restrict this later)
            if (origin.match(/^https?:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?$/)) {
                return callback(null, true);
            }
            
            // For now, allow all origins (you can restrict this in production)
            callback(null, true);
        },
        credentials: true,
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded files)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    return successResponse(res, 'Server is running', {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404 handler
app.use('*', (req, res) => {
    return errorResponse(res, 'Route not found', 404);
});

// Multer error handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return errorResponse(res, 'File too large. Maximum size is 50MB.', 400);
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return errorResponse(res, 'Too many files. Maximum 10 files allowed.', 400);
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return errorResponse(res, 'Unexpected file field.', 400);
        }
        return errorResponse(res, err.message, 400);
    }

    if (err.message === 'Only images and videos are allowed') {
        return errorResponse(res, err.message, 400);
    }
    
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    return errorResponse(res, 'Something went wrong!', 500);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
