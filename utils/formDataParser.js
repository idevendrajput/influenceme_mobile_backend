/**
 * Utility functions for parsing form data
 */
import {parse} from "dotenv";

// Parse JSON string fields from form data
export const parseJSONField = (value) => {
    if (!value) return undefined;
    try {
        return JSON.parse(value);
    } catch (error) {
        return value; // Return as string if not valid JSON
    }
};

// Parse array fields from form data
export const parseArrayField = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        // Try to parse as JSON array first
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [value];
        } catch {
            // If not JSON, split by comma
            return value.split(',').map(item => item.trim()).filter(item => item);
        }
    }
    return [value];
};

// Parse boolean fields from form data
export const parseBooleanField = (value) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
    }
    return Boolean(value);
};

// Parse number fields from form data
export const parseNumberField = (value) => {
    if (!value) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
};

// Parse date fields from form data
export const parseDateField = (value) => {
    if (!value) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
};

// Main function to parse all form data
export const parseFormData = (body, files = {}) => {
    const parsed = { ...body };
    
    // Parse common array fields
    if (parsed.spokenLanguages) {
        parsed.spokenLanguages = parseArrayField(parsed.spokenLanguages);
    }
    
    if (parsed.genre) {
        parsed.genre = parseArrayField(parsed.genre);
    }
    
    if (parsed.media) {
        parsed.media = parseArrayField(parsed.media);
    }
    
    // Parse number fields
    if (parsed.children !== undefined) {
        parsed.children = parseNumberField(parsed.children);
    }
    
    if (parsed.pets !== undefined) {
        parsed.pets = parseNumberField(parsed.pets);
    }
    
    if (parsed.influencerSince !== undefined) {
        parsed.influencerSince = parseNumberField(parsed.influencerSince);
    }
    
    // Parse dynamic socialMedia array
    if (parsed.socialMedia) {
        if (typeof parsed.socialMedia === 'string') {
            parsed.socialMedia = parseJSONField(parsed.socialMedia);
        }
        
        if (Array.isArray(parsed.socialMedia)) {
            parsed.socialMedia = parsed.socialMedia.map(platform => {
                if (typeof platform === 'string') {
                    platform = parseJSONField(platform);
                }
                
                if (platform && typeof platform === 'object') {
                    // Parse number fields in followers
                    if (platform.followers) {
                        if (platform.followers.actual !== undefined) {
                            platform.followers.actual = parseNumberField(platform.followers.actual);
                        }
                        if (platform.followers.bought !== undefined) {
                            platform.followers.bought = parseNumberField(platform.followers.bought);
                        }
                    }
                    
                    // Parse number fields in engagement
                    if (platform.engagement) {
                        if (platform.engagement.averagePerPost !== undefined) {
                            platform.engagement.averagePerPost = parseNumberField(platform.engagement.averagePerPost);
                        }
                        if (platform.engagement.topEngagementPerPost !== undefined) {
                            platform.engagement.topEngagementPerPost = parseNumberField(platform.engagement.topEngagementPerPost);
                        }
                        if (platform.engagement.maximumLikes !== undefined) {
                            platform.engagement.maximumLikes = parseNumberField(platform.engagement.maximumLikes);
                        }
                    }
                    
                    // Parse number fields in metrics
                    if (platform.metrics) {
                        if (platform.metrics.videosPosted !== undefined) {
                            platform.metrics.videosPosted = parseNumberField(platform.metrics.videosPosted);
                        }
                        if (platform.metrics.postsCount !== undefined) {
                            platform.metrics.postsCount = parseNumberField(platform.metrics.postsCount);
                        }
                        if (platform.metrics.averageViews !== undefined) {
                            platform.metrics.averageViews = parseNumberField(platform.metrics.averageViews);
                        }
                        if (platform.metrics.subscribers !== undefined) {
                            platform.metrics.subscribers = parseNumberField(platform.metrics.subscribers);
                        }
                    }
                    
                    // Parse boolean fields
                    if (platform.isVerified !== undefined) {
                        platform.isVerified = parseBooleanField(platform.isVerified);
                    }
                    if (platform.isActive !== undefined) {
                        platform.isActive = parseBooleanField(platform.isActive);
                    }
                    
                    // Parse date field
                    if (platform.addedAt) {
                        platform.addedAt = parseDateField(platform.addedAt);
                    }
                    
                    // Ensure platform name is lowercase
                    if (platform.platform) {
                        platform.platform = platform.platform.toLowerCase();
                    }
                }
                
                return platform;
            }).filter(platform => platform && platform.platform); // Filter out invalid entries
        } else if (parsed.socialMedia && typeof parsed.socialMedia === 'object') {
            // If it's a single object instead of array, convert to array
            parsed.socialMedia = [parsed.socialMedia];
        }
    }

    // Parse date fields
    if (parsed.dateOfBirth) {
        parsed.dateOfBirth = parseDateField(parsed.dateOfBirth);
    }
    
    // Parse boolean fields
    if (parsed.isActive !== undefined) {
        parsed.isActive = parseBooleanField(parsed.isActive);
    }
    
    // Parse nested address object
    if (parsed.addresses) {
        if (typeof parsed.addresses === 'string') {
            parsed.addresses = parseJSONField(parsed.addresses);
        }
    } else {
        // Build addresses object from individual fields
        const addressFields = ['streetAddress', 'state', 'country', 'pinCode', 'latitude', 'longitude'];
        const addresses = {};
        let hasAddressField = false;
        
        addressFields.forEach(field => {
            if (parsed[`addresses.${field}`] || parsed[`address_${field}`]) {
                addresses[field] = parsed[`addresses.${field}`] || parsed[`address_${field}`];
                hasAddressField = true;
                delete parsed[`addresses.${field}`];
                delete parsed[`address_${field}`];
            }
        });
        
        if (hasAddressField) {
            parsed.addresses = addresses;
        }
    }
    
    // Handle uploaded files
    if (files) {
        if (files.profileImage && files.profileImage[0]) {
            parsed.profileImage = files.profileImage[0].filename;
        }
        
        if (files.media && files.media.length > 0) {
            parsed.uploadedMedia = files.media.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            }));
        }
        
        if (files.documents && files.documents.length > 0) {
            parsed.uploadedDocuments = files.documents.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            }));
        }
    }
    
    return parsed;
};
