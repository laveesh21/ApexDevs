const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile,
  changePassword,
  uploadAvatar,
  getUserProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar: upload } = require('../middleware/upload');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/users/:userId', getUserProfile);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
