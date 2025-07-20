import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    const collection = db.collection('influencers');
    
    // Drop old indexes
    try {
      await collection.dropIndex('phone_1');
      console.log('✅ Dropped phone_1 index');
    } catch(e) { 
      console.log('⚠️ phone_1 index not found'); 
    }
    
    try {
      await collection.dropIndex('email_1');
      console.log('✅ Dropped email_1 index');
    } catch(e) { 
      console.log('⚠️ email_1 index not found'); 
    }
    
    // Remove duplicate nulls
    const nullPhones = await collection.find({phone: null}).toArray();
    if (nullPhones.length > 1) {
      const toDelete = nullPhones.slice(1).map(d => d._id);
      await collection.deleteMany({_id: {$in: toDelete}});
      console.log('✅ Removed ' + (nullPhones.length - 1) + ' duplicate null phone records');
    }
    
    // Create sparse indexes
    await collection.createIndex({phone: 1}, {unique: true, sparse: true});
    console.log('✅ Created sparse phone index');
    
    await collection.createIndex({email: 1}, {unique: true, sparse: true});
    console.log('✅ Created sparse email index');
    
    console.log('🎉 Database fixed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
