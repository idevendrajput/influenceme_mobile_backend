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
    
    // Parse social media objects
    if (parsed.instagram) {
        if (typeof parsed.instagram === 'string') {
            parsed.instagram = parseJSONField(parsed.instagram);
        }
        if (parsed.instagram && typeof parsed.instagram === 'object') {
            if (parsed.instagram.followers) {
                if (parsed.instagram.followers.actual !== undefined) {
                    parsed.instagram.followers.actual = parseNumberField(parsed.instagram.followers.actual);
                }
                if (parsed.instagram.followers.bought !== undefined) {
                    parsed.instagram.followers.bought = parseNumberField(parsed.instagram.followers.bought);
                }
            }
            if (parsed.instagram.engagement) {
                if (parsed.instagram.engagement.averagePerPost !== undefined) {
                    parsed.instagram.engagement.averagePerPost = parseNumberField(parsed.instagram.engagement.averagePerPost);
                }
                if (parsed.instagram.engagement.topEngagementPerPost !== undefined) {
                    parsed.instagram.engagement.topEngagementPerPost = parseNumberField(parsed.instagram.engagement.topEngagementPerPost);
                }
                if (parsed.instagram.engagement.maximumLikesPerPost !== undefined) {
                    parsed.instagram.engagement.maximumLikesPerPost = parseNumberField(parsed.instagram.engagement.maximumLikesPerPost);
                }
            }
        }
    }
    
    if (parsed.facebook) {
        if (typeof parsed.facebook === 'string') {
            parsed.facebook = parseJSONField(parsed.facebook);
        }
        if (parsed.facebook && typeof parsed.facebook === 'object') {
            if (parsed.facebook.followers) {
                if (parsed.facebook.followers.actual !== undefined) {
                    parsed.facebook.followers.actual = parseNumberField(parsed.facebook.followers.actual);
                }
                if (parsed.facebook.followers.bought !== undefined) {
                    parsed.facebook.followers.bought = parseNumberField(parsed.facebook.followers.bought);
                }
            }
        }
    }
    
    if (parsed.linkedin) {
        if (typeof parsed.linkedin === 'string') {
            parsed.linkedin = parseJSONField(parsed.linkedin);
        }
        if (parsed.linkedin && typeof parsed.linkedin === 'object') {
            if (parsed.linkedin.followers) {
                if (parsed.linkedin.followers.actual !== undefined) {
                    parsed.linkedin.followers.actual = parseNumberField(parsed.linkedin.followers.actual);
                }
                if (parsed.linkedin.followers.bought !== undefined) {
                    parsed.linkedin.followers.bought = parseNumberField(parsed.linkedin.followers.bought);
                }
            }
        }
    }
    
    if (parsed.youtube) {
        if (typeof parsed.youtube === 'string') {
            parsed.youtube = parseJSONField(parsed.youtube);
        }
        if (parsed.youtube && typeof parsed.youtube === 'object') {
            if (parsed.youtube.followers !== undefined) {
                parsed.youtube.followers = parseNumberField(parsed.youtube.followers);
            }
            if (parsed.youtube.videosPosted !== undefined) {
                parsed.youtube.videosPosted = parseNumberField(parsed.youtube.videosPosted);
            }
            if (parsed.youtube.maximumLikesPerVideo !== undefined) {
                parsed.youtube.maximumLikesPerVideo = parseNumberField(parsed.youtube.maximumLikesPerVideo);
            }
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
