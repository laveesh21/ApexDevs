import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Conversation from './src/models/Conversation.js';

// Load environment variables
dotenv.config();

const cleanupDuplicateConversations = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // First, drop the unique index if it exists
    try {
      await Conversation.collection.dropIndex('participants_1');
      console.log('Dropped old unique index on participants');
    } catch (err) {
      console.log('No unique index to drop (this is fine)');
    }

    // Find all conversations
    const conversations = await Conversation.find({});
    console.log(`Found ${conversations.length} conversations`);

    const seenPairs = new Map();
    const duplicates = [];

    for (const conv of conversations) {
      const [id1, id2] = conv.participants.map(p => p.toString()).sort();
      const key = `${id1}-${id2}`;

      if (seenPairs.has(key)) {
        duplicates.push(conv._id);
        console.log(`Duplicate found: ${conv._id} for participants ${key}`);
      } else {
        seenPairs.set(key, conv._id);
      }
    }

    if (duplicates.length > 0) {
      console.log(`\nDeleting ${duplicates.length} duplicate conversations...`);
      await Conversation.deleteMany({ _id: { $in: duplicates } });
      console.log('Duplicates deleted successfully');
    } else {
      console.log('\nNo duplicate conversations found');
    }

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanupDuplicateConversations();
