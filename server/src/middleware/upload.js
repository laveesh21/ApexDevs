import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configure Cloudinary storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'apexdevs/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ],
      public_id: `avatar-${req.user._id}-${Date.now()}`
    };
  }
});

// Configure Cloudinary storage for project images
const projectStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'apexdevs/projects',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ],
      public_id: `project-${req.user._id}-${Date.now()}-${Math.round(Math.random() * 1E9)}`
    };
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Avatar upload
const uploadAvatarMulter = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
}).single('avatar');

const uploadAvatar = (req, res, next) => {
  uploadAvatarMulter(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed',
        error: err.code
      });
    }
    next();
  });
};

// Project images upload
const uploadProjectImages = multer({
  storage: projectStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per image
  },
  fileFilter: fileFilter
});

export {
  uploadAvatar,
  uploadProjectImages
};
