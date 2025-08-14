import mongoose from 'mongoose';
import User from '../models/influencer.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const sampleInfluencers = [
    {
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "9876543210",
        phoneCode: "+91",
        about: "Travel blogger and adventure enthusiast from the beautiful landscapes of Goa",
        dateOfBirth: new Date("1995-06-15"),
        spokenLanguages: ["English", "Hindi", "Marathi"],
        country: "India",
        addresses: {
            streetAddress: "Beach Road, Calangute",
            state: "Goa",
            country: "India",
            pinCode: "403516",
            latitude: "15.5545",
            longitude: "73.7547"
        },
        maritalStatus: "single",
        children: 0,
        pets: 1,
        influencerType: "micro",
        socialMedia: [
            {
                platform: "instagram",
                handle: "@rahul_goa_wanderer",
                url: "https://instagram.com/rahul_goa_wanderer",
                followers: { actual: 45000, bought: 0 },
                engagement: { 
                    averagePerPost: 3600,
                    topEngagementPerPost: 8200,
                    maximumLikes: 12000
                },
                metrics: { postsCount: 245, averageViews: 5200 },
                isVerified: false,
                isActive: true
            },
            {
                platform: "youtube",
                handle: "Rahul's Adventures",
                url: "https://youtube.com/@rahulsadventures",
                followers: { actual: 15000, bought: 0 },
                engagement: {
                    averagePerPost: 1200,
                    topEngagementPerPost: 4500,
                    maximumLikes: 6800
                },
                metrics: { 
                    videosPosted: 85,
                    subscribers: 15000,
                    averageViews: 8500
                },
                isVerified: false,
                isActive: true
            }
        ],
        website: "https://rahulwanderlust.com",
        workType: "freelance",
        influencerSince: 2020,
        isActive: true
    },
    {
        name: "Priya Talwar",
        email: "priya.talwar@example.com",
        phone: "9123456789",
        phoneCode: "+91",
        about: "Lifestyle and fashion influencer based in Mumbai. Passionate about sustainable fashion and beauty.",
        dateOfBirth: new Date("1991-03-22"),
        spokenLanguages: ["English", "Hindi", "Marathi"],
        country: "India",
        addresses: {
            streetAddress: "Linking Road, Bandra West",
            state: "Maharashtra",
            country: "India",
            pinCode: "400050",
            latitude: "19.0597",
            longitude: "72.8295"
        },
        maritalStatus: "married",
        children: 1,
        pets: 0,
        influencerType: "macro",
        socialMedia: [
            {
                platform: "instagram",
                handle: "@priya_lifestyle_mumbai",
                url: "https://instagram.com/priya_lifestyle_mumbai",
                followers: { actual: 125000, bought: 5000 },
                engagement: {
                    averagePerPost: 11875,
                    topEngagementPerPost: 28000,
                    maximumLikes: 45000
                },
                metrics: { postsCount: 520, averageViews: 18000 },
                isVerified: true,
                isActive: true
            },
            {
                platform: "tiktok",
                handle: "@priya_style",
                url: "https://tiktok.com/@priya_style",
                followers: { actual: 85000, bought: 0 },
                engagement: {
                    averagePerPost: 6800,
                    topEngagementPerPost: 15000,
                    maximumLikes: 25000
                },
                metrics: {
                    videosPosted: 180,
                    averageViews: 35000
                },
                isVerified: false,
                isActive: true
            }
        ],
        website: "https://priyastyleblog.com",
        workType: "full-time",
        influencerSince: 2018,
        isActive: true
    },
    {
        name: "Amit Kumar",
        email: "amit.kumar@example.com",
        phone: "9876512340",
        phoneCode: "+91",
        about: "Fashion photographer and style influencer from Delhi. Men's fashion and street style expert.",
        dateOfBirth: new Date("1994-08-10"),
        spokenLanguages: ["English", "Hindi", "Punjabi"],
        country: "India",
        addresses: {
            streetAddress: "Connaught Place",
            state: "Delhi",
            country: "India",
            pinCode: "110001",
            latitude: "28.6315",
            longitude: "77.2167"
        },
        maritalStatus: "single",
        children: 0,
        pets: 1,
        influencerType: "macro",
        socialMedia: [
            {
                platform: "instagram",
                handle: "@amit_mensfashion_delhi",
                url: "https://instagram.com/amit_mensfashion_delhi",
                followers: { actual: 210000, bought: 10000 },
                engagement: {
                    averagePerPost: 14070,
                    topEngagementPerPost: 35000,
                    maximumLikes: 58000
                },
                metrics: { postsCount: 380, averageViews: 25000 },
                isVerified: true,
                isActive: true
            },
            {
                platform: "youtube",
                handle: "Amit's Fashion Hub",
                url: "https://youtube.com/@amitsfashionhub",
                followers: { actual: 75000, bought: 0 },
                engagement: {
                    averagePerPost: 3750,
                    topEngagementPerPost: 12000,
                    maximumLikes: 18500
                },
                metrics: {
                    videosPosted: 120,
                    subscribers: 75000,
                    averageViews: 28000
                },
                isVerified: true,
                isActive: true
            }
        ],
        website: "https://amitstyleguru.com",
        workType: "freelance",
        influencerSince: 2019,
        isActive: true
    },
    {
        name: "Sneha Desai",
        email: "sneha.desai@example.com",
        phone: "9998887776",
        phoneCode: "+91",
        about: "Food blogger and culinary enthusiast. Specializing in Indian regional cuisines and healthy recipes.",
        dateOfBirth: new Date("1996-12-05"),
        spokenLanguages: ["English", "Hindi", "Gujarati", "Marathi"],
        country: "India",
        addresses: {
            streetAddress: "Carter Road, Bandra",
            state: "Maharashtra",
            country: "India",
            pinCode: "400050",
            latitude: "19.0502",
            longitude: "72.8180"
        },
        maritalStatus: "single",
        children: 0,
        pets: 2,
        influencerType: "micro",
        socialMedia: [
            {
                platform: "instagram",
                handle: "@sneha_food_tales",
                url: "https://instagram.com/sneha_food_tales",
                followers: { actual: 65000, bought: 0 },
                engagement: {
                    averagePerPost: 7280,
                    topEngagementPerPost: 18000,
                    maximumLikes: 28000
                },
                metrics: { postsCount: 290, averageViews: 12000 },
                isVerified: false,
                isActive: true
            },
            {
                platform: "youtube",
                handle: "Sneha's Kitchen Stories",
                url: "https://youtube.com/@snehaskitchenstories",
                followers: { actual: 28000, bought: 0 },
                engagement: {
                    averagePerPost: 2240,
                    topEngagementPerPost: 8500,
                    maximumLikes: 12000
                },
                metrics: {
                    videosPosted: 95,
                    subscribers: 28000,
                    averageViews: 15000
                },
                isVerified: false,
                isActive: true
            }
        ],
        website: "https://snehafoodtales.com",
        workType: "part-time",
        influencerSince: 2021,
        isActive: true
    },
    {
        name: "Arjun Patel",
        email: "arjun.patel@example.com",
        phone: "9123456780",
        phoneCode: "+91",
        about: "Tech reviewer and gadget enthusiast from Bangalore. Covering latest smartphones, laptops, and tech trends.",
        dateOfBirth: new Date("1992-01-18"),
        spokenLanguages: ["English", "Hindi", "Kannada"],
        country: "India",
        addresses: {
            streetAddress: "MG Road, Bangalore",
            state: "Karnataka", 
            country: "India",
            pinCode: "560001",
            latitude: "12.9716",
            longitude: "77.5946"
        },
        maritalStatus: "married",
        children: 0,
        pets: 0,
        influencerType: "macro",
        socialMedia: [
            {
                platform: "youtube",
                handle: "Arjun Tech Reviews",
                url: "https://youtube.com/@arjuntechreviews",
                followers: { actual: 185000, bought: 0 },
                engagement: {
                    averagePerPost: 11100,
                    topEngagementPerPost: 28000,
                    maximumLikes: 42000
                },
                metrics: {
                    videosPosted: 210,
                    subscribers: 185000,
                    averageViews: 45000
                },
                isVerified: true,
                isActive: true
            },
            {
                platform: "instagram",
                handle: "@arjun_tech_bangalore",
                url: "https://instagram.com/arjun_tech_bangalore",
                followers: { actual: 95000, bought: 0 },
                engagement: {
                    averagePerPost: 7125,
                    topEngagementPerPost: 18000,
                    maximumLikes: 25000
                },
                metrics: { postsCount: 180, averageViews: 15000 },
                isVerified: false,
                isActive: true
            }
        ],
        website: "https://arjuntechworld.com",
        workType: "full-time",
        influencerSince: 2017,
        isActive: true
    },
    {
        name: "Maya Singh",
        email: "maya.singh@example.com",
        phone: "9876543221",
        phoneCode: "+91",
        about: "Fitness coach and wellness influencer from Punjab. Yoga, nutrition and healthy lifestyle advocate.",
        dateOfBirth: new Date("1989-09-30"),
        spokenLanguages: ["English", "Hindi", "Punjabi"],
        country: "India",
        addresses: {
            streetAddress: "Model Town, Ludhiana",
            state: "Punjab",
            country: "India",
            pinCode: "141002",
            latitude: "30.9010",
            longitude: "75.8573"
        },
        maritalStatus: "married",
        children: 2,
        pets: 1,
        influencerType: "micro",
        socialMedia: [
            {
                platform: "instagram",
                handle: "@maya_fitness_punjab",
                url: "https://instagram.com/maya_fitness_punjab",
                followers: { actual: 78000, bought: 0 },
                engagement: {
                    averagePerPost: 8580,
                    topEngagementPerPost: 20000,
                    maximumLikes: 32000
                },
                metrics: { postsCount: 340, averageViews: 14000 },
                isVerified: false,
                isActive: true
            },
            {
                platform: "youtube",
                handle: "Maya's Wellness Journey",
                url: "https://youtube.com/@mayaswellnessjourney",
                followers: { actual: 42000, bought: 0 },
                engagement: {
                    averagePerPost: 3360,
                    topEngagementPerPost: 12000,
                    maximumLikes: 18500
                },
                metrics: {
                    videosPosted: 160,
                    subscribers: 42000,
                    averageViews: 22000
                },
                isVerified: false,
                isActive: true
            }
        ],
        website: "https://mayafitnesshub.com",
        workType: "freelance",
        influencerSince: 2019,
        isActive: true
    }
];

const populateDatabase = async () => {
    try {
        await connectDB();
        
        // Clear existing users (optional - uncomment if needed)
        // await User.deleteMany({});
        // console.log('Existing users cleared');
        
        // Insert sample influencers
        const result = await User.insertMany(sampleInfluencers);
        console.log(`✅ Successfully inserted ${result.length} sample influencers`);
        
        // Display inserted influencers
        result.forEach((influencer, index) => {
            console.log(`${index + 1}. ${influencer.name} - ${influencer.influencerType} - ${influencer.addresses.state}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error populating database:', error);
        process.exit(1);
    }
};

// Run the script
populateDatabase();
