import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteConversation
} from '../controllers/chatController.js';

// All chat routes require authentication
router.use(protect);

// Get all conversations for logged-in user
router.get('/conversations', getConversations);

// Get or create conversation with a specific user
router.get('/conversation/:userId', getOrCreateConversation);

// Get messages in a conversation
router.get('/conversation/:conversationId/messages', getMessages);

// Send a message
router.post('/conversation/:conversationId/messages', sendMessage);

// Mark conversation as read
router.put('/conversation/:conversationId/read', markAsRead);

// Delete conversation
router.delete('/conversation/:conversationId', deleteConversation);

export default router;
