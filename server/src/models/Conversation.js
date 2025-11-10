const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true
});

// Ensure exactly 2 participants (one-to-one chat)
conversationSchema.path('participants').validate(function(value) {
  return value.length === 2;
}, 'A conversation must have exactly 2 participants');

// Prevent duplicate conversations between same users
conversationSchema.index({ participants: 1 }, { unique: true });

// Index for faster queries
conversationSchema.index({ lastMessageAt: -1 });

// Method to check if user is participant
conversationSchema.methods.hasParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

// Method to get other participant
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(p => p.toString() !== userId.toString());
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
