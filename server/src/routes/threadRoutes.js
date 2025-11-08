const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/threadController');
const { protect, optionalAuth } = require('../middleware/auth');

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

module.exports = router;
