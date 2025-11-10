const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
  followUser,
  unfollowUser,
  getUserProfile,
  getUserFollowers,
  getUserFollowing
} = require('../controllers/authController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadAvatar: upload } = require('../middleware/upload');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/users/:userId', optionalAuth, getUserProfile);
router.get('/users/:userId/followers', getUserFollowers);
router.get('/users/:userId/following', getUserFollowing);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', protect, deleteAvatar);
router.post('/users/:userId/follow', protect, followUser);
router.delete('/users/:userId/follow', protect, unfollowUser);

module.exports = router;
