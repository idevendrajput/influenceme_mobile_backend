import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for migration');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Import the influencer model
import Influencer from '../models/influencer.js';

const migrateSocialMediaData = async () => {
    try {
        console.log('🚀 Starting social media data migration...\n');

        // Find all influencers with old social media structure
        const influencers = await Influencer.find({
            $or: [
                { instagram: { $exists: true } },
                { facebook: { $exists: true } },
                { linkedin: { $exists: true } },
                { youtube: { $exists: true } }
            ]
        });

        console.log(`📊 Found ${influencers.length} influencers to migrate\n`);

        let migratedCount = 0;
        let errorCount = 0;

        for (const influencer of influencers) {
            try {
                console.log(`Processing: ${influencer.name} (${influencer._id})`);
                
                const socialMediaArray = [];

                // Migrate Instagram
                if (influencer.instagram) {
                    const instagramData = {
                        platform: 'instagram',
                        url: influencer.instagram.url || '',
                        followers: {
                            actual: influencer.instagram.followers?.actual || 0,
                            bought: influencer.instagram.followers?.bought || 0
                        },
                        engagement: {
                            averagePerPost: influencer.instagram.engagement?.averagePerPost || 0,
                            topEngagementPerPost: influencer.instagram.engagement?.topEngagementPerPost || 0,
                            maximumLikes: influencer.instagram.engagement?.maximumLikesPerPost || 0
                        },
                        metrics: {},
                        isVerified: false,
                        isActive: true,
                        addedAt: new Date()
                    };
                    socialMediaArray.push(instagramData);
                    console.log('  ✅ Instagram migrated');
                }

                // Migrate Facebook
                if (influencer.facebook) {
                    const facebookData = {
                        platform: 'facebook',
                        url: influencer.facebook.url || '',
                        followers: {
                            actual: influencer.facebook.followers?.actual || 0,
                            bought: influencer.facebook.followers?.bought || 0
                        },
                        engagement: {
                            averagePerPost: 0,
                            topEngagementPerPost: 0,
                            maximumLikes: 0
                        },
                        metrics: {},
                        isVerified: false,
                        isActive: true,
                        addedAt: new Date()
                    };
                    socialMediaArray.push(facebookData);
                    console.log('  ✅ Facebook migrated');
                }

                // Migrate LinkedIn
                if (influencer.linkedin) {
                    const linkedinData = {
                        platform: 'linkedin',
                        url: influencer.linkedin.url || '',
                        followers: {
                            actual: influencer.linkedin.followers?.actual || 0,
                            bought: influencer.linkedin.followers?.bought || 0
                        },
                        engagement: {
                            averagePerPost: 0,
                            topEngagementPerPost: 0,
                            maximumLikes: 0
                        },
                        metrics: {},
                        isVerified: false,
                        isActive: true,
                        addedAt: new Date()
                    };
                    socialMediaArray.push(linkedinData);
                    console.log('  ✅ LinkedIn migrated');
                }

                // Migrate YouTube
                if (influencer.youtube) {
                    const youtubeData = {
                        platform: 'youtube',
                        url: influencer.youtube.url || '',
                        followers: {
                            actual: influencer.youtube.followers || 0,
                            bought: 0
                        },
                        engagement: {
                            averagePerPost: 0,
                            topEngagementPerPost: 0,
                            maximumLikes: influencer.youtube.maximumLikesPerVideo || 0
                        },
                        metrics: {
                            videosPosted: influencer.youtube.videosPosted || 0,
                            subscribers: influencer.youtube.followers || 0
                        },
                        isVerified: false,
                        isActive: true,
                        addedAt: new Date()
                    };
                    socialMediaArray.push(youtubeData);
                    console.log('  ✅ YouTube migrated');
                }

                // Update the influencer with new socialMedia array
                if (socialMediaArray.length > 0) {
                    await Influencer.findByIdAndUpdate(
                        influencer._id,
                        {
                            $set: { socialMedia: socialMediaArray },
                            $unset: {
                                instagram: "",
                                facebook: "",
                                linkedin: "",
                                youtube: ""
                            }
                        },
                        { new: true }
                    );
                    
                    migratedCount++;
                    console.log(`  🎉 Successfully migrated ${socialMediaArray.length} platforms\n`);
                } else {
                    console.log('  ⚠️  No social media data to migrate\n');
                }

            } catch (error) {
                errorCount++;
                console.error(`  ❌ Error migrating ${influencer.name}:`, error.message);
                console.log('');
            }
        }

        console.log('📈 Migration Summary:');
        console.log(`✅ Successfully migrated: ${migratedCount} influencers`);
        console.log(`❌ Errors: ${errorCount} influencers`);
        console.log(`📊 Total processed: ${influencers.length} influencers\n`);

        if (migratedCount > 0) {
            console.log('🎉 Migration completed successfully!');
            console.log('💡 You can now use the new dynamic socialMedia array structure.');
        } else {
            console.log('ℹ️  No data was migrated. This could mean:');
            console.log('   - All influencers already use the new structure');
            console.log('   - No influencers have social media data to migrate');
        }

    } catch (error) {
        console.error('💥 Migration failed:', error);
    }
};

const runMigration = async () => {
    console.log('🔄 Dynamic Social Media Migration Script');
    console.log('========================================\n');
    
    await connectDB();
    
    // Confirmation prompt
    console.log('⚠️  WARNING: This will modify your database!');
    console.log('This script will:');
    console.log('1. Convert old individual social media fields (instagram, facebook, etc.) to socialMedia array');
    console.log('2. Remove the old fields after successful migration');
    console.log('3. Preserve all existing data in the new structure\n');
    
    // Check if we should proceed
    if (process.argv.includes('--confirm')) {
        await migrateSocialMediaData();
    } else {
        console.log('🛑 Migration not confirmed.');
        console.log('To run the migration, use: npm run migrate:dynamic-social-media -- --confirm');
        console.log('Or: node scripts/migrate-to-dynamic-social-media.js --confirm\n');
    }
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
};

// Handle script errors
process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Promise Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
});

// Run the migration
runMigration();
