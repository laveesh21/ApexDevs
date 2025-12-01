import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const updateIdenticons = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);

    let updated = 0;
    for (const user of users) {
      // Update identicon with consistent dark gray background
      user.identicon = `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username || user._id}&backgroundColor=374151`;
      await user.save();
      updated++;
      if (updated % 10 === 0) {
        console.log(`Updated ${updated} users...`);
      }
    }

    console.log(`✅ Successfully updated ${updated} user identicons`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating identicons:', error);
    process.exit(1);
  }
};

updateIdenticons();
