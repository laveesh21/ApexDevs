const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  toggleLike
} = require('../controllers/projectController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadProjectImages } = require('../middleware/upload');

// Public routes
router.get('/', getProjects);
router.get('/:id', optionalAuth, getProjectById); // Use optional auth to track logged-in users

// Protected routes
router.post(
  '/',
  protect,
  uploadProjectImages.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]),
  createProject
);

router.put(
  '/:id',
  protect,
  uploadProjectImages.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]),
  updateProject
);

router.delete('/:id', protect, deleteProject);
router.put('/:id/like', protect, toggleLike);

module.exports = router;
