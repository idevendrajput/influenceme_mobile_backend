import Settings from '../models/settings.js';

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
export const getAllSettings = async (req, res) => {
    try {
        const { type, active } = req.query;
        
        const filter = {};
        if (type) filter.type = type;
        if (active !== undefined) filter.isActive = active === 'true';
        
        const settings = await Settings.find(filter)
            .populate('lastUpdatedBy', 'name email')
            .sort({ key: 1 })
            .lean();
        
        res.status(200).json({
            success: true,
            count: settings.length,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Get setting by key
// @route   GET /api/settings/:key
// @access  Public
export const getSettingByKey = async (req, res) => {
    try {
        const setting = await Settings.findOne({ 
            key: req.params.key, 
            isActive: true 
        })
        .populate('lastUpdatedBy', 'name email');
        
        if (!setting) {
            return res.status(404).json({ 
                success: false,
                message: 'Setting not found' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: setting
        });
    } catch (error) {
        console.error('Error fetching setting:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Create new setting
// @route   POST /api/settings
// @access  Private/Admin
export const createSetting = async (req, res) => {
    try {
        const { key, title, content, type, isActive } = req.body;
        
        if (!key || !title || !content) {
            return res.status(400).json({ 
                success: false,
                message: 'Key, title, and content are required' 
            });
        }
        
        // Check if setting already exists
        const existingSetting = await Settings.findOne({ key });
        
        if (existingSetting) {
            return res.status(400).json({ 
                success: false,
                message: 'Setting with this key already exists' 
            });
        }
        
        const setting = await Settings.create({
            key: key.toLowerCase().trim(),
            title: title.trim(),
            content,
            type: type || 'page',
            isActive: isActive !== undefined ? isActive : true,
            lastUpdatedBy: req.user._id
        });
        
        const populatedSetting = await Settings.findById(setting._id)
            .populate('lastUpdatedBy', 'name email');
        
        res.status(201).json({
            success: true,
            message: 'Setting created successfully',
            data: populatedSetting
        });
    } catch (error) {
        console.error('Error creating setting:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Update setting
// @route   PUT /api/settings/:key
// @access  Private/Admin
export const updateSetting = async (req, res) => {
    try {
        const { title, content, type, isActive } = req.body;
        
        const setting = await Settings.findOne({ key: req.params.key });
        
        if (!setting) {
            return res.status(404).json({ 
                success: false,
                message: 'Setting not found' 
            });
        }
        
        // Update fields
        setting.title = title?.trim() || setting.title;
        setting.content = content || setting.content;
        setting.type = type || setting.type;
        setting.isActive = isActive !== undefined ? isActive : setting.isActive;
        setting.lastUpdatedBy = req.user._id;
        setting.version += 1;
        
        const updatedSetting = await setting.save();
        
        const populatedSetting = await Settings.findById(updatedSetting._id)
            .populate('lastUpdatedBy', 'name email');
        
        res.status(200).json({
            success: true,
            message: 'Setting updated successfully',
            data: populatedSetting
        });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Delete setting
// @route   DELETE /api/settings/:key
// @access  Private/Admin
export const deleteSetting = async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: req.params.key });
        
        if (!setting) {
            return res.status(404).json({ 
                success: false,
                message: 'Setting not found' 
            });
        }
        
        await setting.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Setting deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting setting:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Toggle setting status
// @route   PATCH /api/settings/:key/toggle
// @access  Private/Admin
export const toggleSetting = async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: req.params.key });
        
        if (!setting) {
            return res.status(404).json({ 
                success: false,
                message: 'Setting not found' 
            });
        }
        
        setting.isActive = !setting.isActive;
        setting.lastUpdatedBy = req.user._id;
        setting.version += 1;
        
        const updatedSetting = await setting.save();
        
        const populatedSetting = await Settings.findById(updatedSetting._id)
            .populate('lastUpdatedBy', 'name email');
        
        res.status(200).json({
            success: true,
            message: `Setting ${setting.isActive ? 'activated' : 'deactivated'} successfully`,
            data: populatedSetting
        });
    } catch (error) {
        console.error('Error toggling setting:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Get public settings (for frontend)
// @route   GET /api/settings/public
// @access  Public
export const getPublicSettings = async (req, res) => {
    try {
        const publicSettings = await Settings.find({ 
            isActive: true,
            type: 'page'
        })
        .select('key title content type version createdAt updatedAt')
        .sort({ key: 1 })
        .lean();
        
        // Transform to key-value pairs for easier frontend consumption
        const settingsMap = publicSettings.reduce((acc, setting) => {
            acc[setting.key] = {
                title: setting.title,
                content: setting.content,
                type: setting.type,
                version: setting.version,
                lastUpdated: setting.updatedAt
            };
            return acc;
        }, {});
        
        res.status(200).json({
            success: true,
            data: settingsMap
        });
    } catch (error) {
        console.error('Error fetching public settings:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Initialize default settings
// @route   POST /api/settings/init
// @access  Private/Admin
export const initializeSettings = async (req, res) => {
    try {
        const defaultSettings = [
            {
                key: 'privacy_policy',
                title: 'Privacy Policy',
                content: '<h1>Privacy Policy</h1><p>This is the default privacy policy content. Please update this with your actual privacy policy.</p>',
                type: 'page'
            },
            {
                key: 'terms_of_service',
                title: 'Terms of Service',
                content: '<h1>Terms of Service</h1><p>This is the default terms of service content. Please update this with your actual terms of service.</p>',
                type: 'page'
            },
            {
                key: 'about_us',
                title: 'About Us',
                content: '<h1>About Us</h1><p>This is the default about us content. Please update this with your actual about us information.</p>',
                type: 'page'
            },
            {
                key: 'contact_us',
                title: 'Contact Us',
                content: '<h1>Contact Us</h1><p>Email: support@influenceme.com</p><p>Phone: +1 (555) 123-4567</p><p>Address: 123 Main Street, City, State 12345</p>',
                type: 'page'
            },
            {
                key: 'help_center',
                title: 'Help Center',
                content: '<h1>Help Center</h1><p>This is the default help center content. Please update this with your actual help information.</p>',
                type: 'page'
            }
        ];
        
        const createdSettings = [];
        
        for (const defaultSetting of defaultSettings) {
            const existingSetting = await Settings.findOne({ key: defaultSetting.key });
            
            if (!existingSetting) {
                const setting = await Settings.create({
                    ...defaultSetting,
                    lastUpdatedBy: req.user._id
                });
                createdSettings.push(setting);
            }
        }
        
        res.status(201).json({
            success: true,
            message: `${createdSettings.length} default settings initialized`,
            data: createdSettings
        });
    } catch (error) {
        console.error('Error initializing settings:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};
