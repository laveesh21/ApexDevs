import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configure Cloudinary storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log('📤 Cloudinary avatarStorage params called');
    console.log('   User ID:', req.user?._id);
    console.log('   File:', file.originalname);
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
  console.log('🔍 File filter called');
  console.log('   File mimetype:', file.mimetype);
  console.log('   File originalname:', file.originalname);
  
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype) {
    console.log('   ✅ File type accepted');
    cb(null, true);
  } else {
    console.log('   ❌ File type rejected');
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

// Wrap with error handling and logging
const uploadAvatar = (req, res, next) => {
  console.log('\n🚀 Avatar upload middleware started');
  console.log('   Content-Type:', req.headers['content-type']);
  console.log('   User authenticated:', !!req.user);
  console.log('   User ID:', req.user?._id);
  
  uploadAvatarMulter(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err.message);
      console.error('   Error code:', err.code);
      console.error('   Full error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed',
        error: err.code
      });
    }
    
    console.log('✅ Multer processing completed');
    console.log('   File uploaded:', !!req.file);
    if (req.file) {
      console.log('   File details:', {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
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
