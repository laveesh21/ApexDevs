import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// @desc    Get all conversations for logged-in user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'username avatar identicon avatarPreference isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt'
      })
      .sort({ lastMessageAt: -1 });

    // Format response with other participant info and unread count
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );
      
      const unreadCount = conv.unreadCount.get(req.user._id.toString()) || 0;

      return {
        _id: conv._id,
        participant: otherParticipant,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      };
    });

    res.json({
      success: true,
      data: formattedConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get or create a conversation with a user
// @route   GET /api/chat/conversation/:userId
// @access  Private
const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists and check message permissions
    const otherUser = await User.findById(userId).select('username avatar messagePermission allowMessages followers following blockedUsers');
   
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Can't chat with yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    // Check if either user has blocked the other
    const currentUser = await User.findById(req.user._id).select('blockedUsers');

    if (otherUser.blockedUsers && otherUser.blockedUsers.length > 0 && otherUser.blockedUsers.some(id => id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are blocked by this user'
      });
    }
    
    if (currentUser.blockedUsers && currentUser.blockedUsers.length > 0 && currentUser.blockedUsers.some(id => id.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'You have blocked this user'
      });
    }

    // Convert userId to ObjectId for queries
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if conversation already exists (check BEFORE permission checks to allow existing conversations)
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userObjectId] }
    })
      .populate('participants', 'username avatar identicon avatarPreference isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt'
      });

    // Check message permissions only if conversation doesn't exist
    if (!conversation) {
      const messagePermission = otherUser.messagePermission || 'everyone';
      const allowMessages = otherUser.allowMessages !== false;
      const currentUserId = req.user._id.toString();
      // Check for new conversation permissions - only block if explicitly disabled
      if (messagePermission === 'none' || allowMessages === false) {
        return res.status(403).json({
          success: false,
          message: 'This user has disabled messages'
        });
      }
      
      if (messagePermission === 'existing') {
        return res.status(403).json({
          success: false,
          message: 'This user only accepts messages from existing conversations'
        });
      }
      
      if (messagePermission === 'followers') {
        const isFollower = otherUser.followers && otherUser.followers.length > 0 && otherUser.followers.some(f => f.toString() === currentUserId);
        const isFollowing = otherUser.following && otherUser.following.length > 0 && otherUser.following.some(f => f.toString() === currentUserId);
        
        if (!isFollower && !isFollowing) {
          return res.status(403).json({
            success: false,
            message: 'This user only accepts messages from people they follow or who follow them'
          });
        }
      }
      
      // If messagePermission is 'everyone' (or undefined/default), allow the conversation
    }

    // Create new conversation if doesn't exist
    if (!conversation) {
      try {
        // Convert to ObjectIds and sort to ensure consistent order
        const participantIds = [req.user._id, userObjectId].sort((a, b) => 
          a.toString().localeCompare(b.toString())
        );

        conversation = await Conversation.create({
          participants: participantIds,
          unreadCount: new Map([
            [req.user._id.toString(), 0],
            [userId, 0]
          ])
        });

        await conversation.populate('participants', 'username avatar identicon avatarPreference isOnline lastSeen');
      } catch (createError) {
        // Handle race condition: another request created the conversation
        if (createError.code === 11000) {
          // Try to find it one more time
          conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, userObjectId] }
          })
            .populate('participants', 'username avatar identicon avatarPreference isOnline lastSeen')
            .populate({
              path: 'lastMessage',
              select: 'content sender createdAt'
            });
          
          if (!conversation) {
            throw new Error('Failed to create or find conversation');
          }
        } else {
          throw createError;
        }
      }
    }

    const unreadCount = conversation.unreadCount.get(req.user._id.toString()) || 0;

    res.json({
      success: true,
      data: {
        _id: conversation._id,
        participant: otherUser,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error('Get/create conversation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while creating conversation',
      error: error.message
    });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/chat/conversation/:conversationId/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.hasParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    // Get messages
    const messages = await Message.find({
      conversation: conversationId,
      deleted: false
    })
      .populate('sender', 'username avatar identicon avatarPreference')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Message.countDocuments({
      conversation: conversationId,
      deleted: false
    });

    res.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send a message
// @route   POST /api/chat/conversation/:conversationId/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Verify conversation and user is participant
    const conversation = await Conversation.findById(conversationId).populate('participants', '_id messagePermission allowMessages');
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant (handle populated participants)
    const isParticipant = conversation.participants.some(p => {
      const participantId = p._id || p;
      return participantId.toString() === req.user._id.toString();
    });
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    // Check if the recipient still allows messages
    const otherParticipantDoc = conversation.participants.find(
      p => p._id.toString() !== req.user._id.toString()
    );
    
    if (otherParticipantDoc) {
      // Get full user data to check blocked status
      const otherUser = await User.findById(otherParticipantDoc._id);
      const currentUser = await User.findById(req.user._id);
      
      // Check if either user has blocked the other (safely handle undefined arrays)
      if (otherUser.blockedUsers && otherUser.blockedUsers.length > 0 && otherUser.blockedUsers.some(id => id.toString() === req.user._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'You are blocked by this user'
        });
      }
      
      if (currentUser.blockedUsers && currentUser.blockedUsers.length > 0 && currentUser.blockedUsers.some(id => id.toString() === otherParticipantDoc._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'You have blocked this user'
        });
      }
      
      const messagePermission = otherParticipantDoc.messagePermission || 'everyone';
      
      // 'none' blocks all messages including existing conversations
      if (messagePermission === 'none') {
        return res.status(403).json({
          success: false,
          message: 'The recipient has disabled messages'
        });
      }
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content: content.trim(),
      readBy: [{
        user: req.user._id,
        readAt: new Date()
      }]
    });

    await message.populate('sender', 'username avatar identicon avatarPreference');

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;

    // Increment unread count for other participant
    const otherParticipant = conversation.getOtherParticipant(req.user._id);
    const otherParticipantId = otherParticipant.toString();
    const currentUnread = conversation.unreadCount.get(otherParticipantId) || 0;
    conversation.unreadCount.set(otherParticipantId, currentUnread + 1);

    await conversation.save();

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/conversation/:conversationId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify conversation and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.hasParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    // Reset unread count for this user
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a conversation
// @route   DELETE /api/chat/conversation/:conversationId
// @access  Private
const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.hasParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversation: conversationId });

    // Delete conversation
    await conversation.deleteOne();

    res.json({
      success: true,
      message: 'Conversation deleted'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user's online status
// @route   PUT /api/chat/status
// @access  Private
const updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    await User.findByIdAndUpdate(req.user._id, {
      isOnline,
      lastSeen: new Date()
    });

    res.json({
      success: true,
      message: 'Status updated'
    });
  } catch (error) {
    console.error('Update online status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteConversation,
  updateOnlineStatus
};
