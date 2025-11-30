import express from 'express';
const router = express.Router();
import {
  createThread,
  getThreads,
  getThreadById,
  updateThread,
  deleteThread,
  toggleVote,
  toggleLike,
  addComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike,
  toggleCommentVote,
  getUserThreads
} from '../controllers/threadController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

// Thread routes
router.post('/', protect, createThread);
router.get('/', getThreads);
router.get('/user/:userId', getUserThreads);
router.get('/:id', optionalAuth, getThreadById);
router.put('/:id', protect, updateThread);
router.delete('/:id', protect, deleteThread);
router.put('/:id/vote', protect, toggleVote);
router.put('/:id/like', protect, toggleLike);

// Comment routes
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', optionalAuth, getComments);
router.put('/comments/:commentId', protect, updateComment);
router.delete('/comments/:commentId', protect, deleteComment);
router.put('/comments/:commentId/like', protect, toggleCommentLike);
router.put('/comments/:commentId/vote', protect, toggleCommentVote);

export default router;
