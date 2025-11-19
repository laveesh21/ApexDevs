const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for logged-in user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'username avatar')
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
   
    console.log("1..OTHER USER FETCH:", otherUser);
   
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
    
    console.log("2..USER :", req.user._id);

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

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] }
    });

    // Check message permissions
    const messagePermission = otherUser.messagePermission || 'everyone';
    const allowMessages = otherUser.allowMessages !== false; // Default to true if undefined
    const currentUserId = req.user._id.toString();
    
    console.log('Message permission check:', {
      targetUserId: userId,
      messagePermission,
      allowMessages,
      existingConversation: !!existingConversation
    });
    
    // If conversation exists, always allow (existing conversations)
    if (!existingConversation) {
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

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] }
    })
      .populate('participants', 'username avatar')
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt'
      });

    // Create new conversation if doesn't exist
    if (!conversation) {
      try {
        // Convert to ObjectIds and sort to ensure consistent order for unique index
        const mongoose = require('mongoose');
        const participantIds = [req.user._id, mongoose.Types.ObjectId(userId)].sort((a, b) => 
          a.toString().localeCompare(b.toString())
        );
        
        console.log('Creating conversation with participants:', {
          currentUser: req.user._id.toString(),
          otherUser: userId,
          sortedIds: participantIds.map(id => id.toString())
        });
        
        conversation = await Conversation.create({
          participants: participantIds,
          unreadCount: new Map([
            [req.user._id.toString(), 0],
            [userId, 0]
          ])
        });

        console.log('Conversation created successfully:', conversation._id);
        await conversation.populate('participants', 'username avatar');
      } catch (createError) {
        // If duplicate key error (race condition), try to find it again
        if (createError.code === 11000) {
          console.log('Duplicate conversation detected, fetching existing one');
          conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, userId] }
          })
            .populate('participants', 'username avatar')
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
      .populate('sender', 'username avatar')
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

    await message.populate('sender', 'username avatar');

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

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteConversation
};
