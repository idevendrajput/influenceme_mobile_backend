import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';

dotenv.config();

// Migration script to convert old social media fields to new object structure
const migrateSocialMediaData = async () => {
    try {
        // Connect to database
        await connectDB();
        
        console.log('Starting social media data migration...');
        
        // Get all influencers
        const influencers = await mongoose.connection.db.collection('influencers').find({}).toArray();
        
        console.log(`Found ${influencers.length} influencers to migrate`);
        
        let migratedCount = 0;
        
        for (const influencer of influencers) {
            const updates = {};
            
            // Migrate Instagram data
            if (influencer.instagram || influencer.instagramFollowers) {
                updates.instagram = {
                    url: influencer.instagram || '',
                    followers: {
                        actual: influencer.instagramFollowers || 0,
                        bought: 0
                    },
                    engagement: {
                        averagePerPost: 0,
                        topEngagementPerPost: 0,
                        maximumLikesPerPost: 0
                    }
                };
            }
            
            // Migrate Facebook data
            if (influencer.facebook || influencer.facebookFollowers) {
                updates.facebook = {
                    url: influencer.facebook || '',
                    followers: {
                        actual: influencer.facebookFollowers || 0,
                        bought: 0
                    }
                };
            }
            
            // Migrate LinkedIn data
            if (influencer.linkedin || influencer.linkedInFollowers) {
                updates.linkedin = {
                    url: influencer.linkedin || '',
                    followers: {
                        actual: influencer.linkedInFollowers || 0,
                        bought: 0
                    }
                };
            }
            
            // Migrate YouTube data
            if (influencer.youtube || influencer.youTubeSubscribers) {
                updates.youtube = {
                    url: influencer.youtube || '',
                    followers: influencer.youTubeSubscribers || 0,
                    videosPosted: 0,
                    maximumLikesPerVideo: 0
                };
            }
            
            // Update the document if we have any changes
            if (Object.keys(updates).length > 0) {
                await mongoose.connection.db.collection('influencers').updateOne(
                    { _id: influencer._id },
                    { $set: updates }
                );
                migratedCount++;
            }
        }
        
        console.log(`Successfully migrated ${migratedCount} influencers`);
        
        // Optionally, you can remove the old fields after migration
        // Uncomment the following code if you want to remove old fields
        /*
        console.log('Removing old social media fields...');
        await mongoose.connection.db.collection('influencers').updateMany(
            {},
            {
                $unset: {
                    instagramFollowers: 1,
                    facebookFollowers: 1,
                    twitterFollowers: 1,
                    linkedInFollowers: 1,
                    youTubeSubscribers: 1
                }
            }
        );
        console.log('Old fields removed successfully');
        */
        
        console.log('Migration completed successfully!');
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
    }
};

// Run the migration
migrateSocialMediaData();
