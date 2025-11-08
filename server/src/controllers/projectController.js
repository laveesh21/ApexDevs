const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { title, description, demoUrl, githubUrl, technologies, category, status } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and description'
      });
    }

    // Get thumbnail and images from uploaded files
    let thumbnail = '';
    let images = [];

    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        thumbnail = req.files.thumbnail[0].path;
      }
      if (req.files.images) {
        images = req.files.images.map(file => file.path);
      }
    }

    if (!thumbnail) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a thumbnail image'
      });
    }

    // Parse technologies
    let techArray = [];
    if (technologies) {
      try {
        techArray = JSON.parse(technologies);
      } catch (parseError) {
        console.error('Technologies parse error:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Invalid technologies format'
        });
      }
    }

    // Create project
    const project = await Project.create({
      title,
      description,
      thumbnail,
      images,
      demoUrl: demoUrl || '',
      githubUrl: githubUrl || '',
      technologies: techArray,
      category: category || 'Other',
      status: status || 'Completed',
      author: req.user._id
    });

    // Add project to user's projects array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { projects: project._id }
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const { search, category, technology, author } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (search) {
      // Use regex for partial matching (case-insensitive)
      // Search in title, description, and technologies
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { technologies: searchRegex }
      ];
    }

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (technology) {
      query.technologies = { $regex: new RegExp(`^${technology}$`, 'i') };
    }

    if (author) {
      query.author = author;
    }

    const projects = await Project.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('author', 'username avatar email bio location website github twitter linkedin');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Increment views only for unique users
    // Check if user is authenticated
    const userId = req.user?._id;
    
    console.log('=== VIEW TRACKING DEBUG ===');
    console.log('Auth header:', req.headers.authorization ? 'Present' : 'Missing');
    console.log('User ID:', userId ? userId.toString() : 'Anonymous');
    console.log('Current views:', project.views);
    console.log('ViewedBy array:', project.viewedBy.map(id => id.toString()));
    
    if (userId) {
      // For authenticated users: check if they haven't viewed before
      const hasViewed = project.viewedBy.some(id => id.toString() === userId.toString());
      console.log('Has viewed before:', hasViewed);
      
      if (!hasViewed) {
        project.views += 1;
        project.viewedBy.push(userId);
        await project.save();
        console.log('View incremented for authenticated user');
      } else {
        console.log('User already viewed - skipping increment');
      }
    } else {
      // For anonymous users: always increment (or you can implement IP tracking)
      // For now, we'll increment for anonymous to count all views
      project.views += 1;
      await project.save();
      console.log('View incremented for anonymous user');
    }
    console.log('New view count:', project.views);
    console.log('=========================');

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the author
    if (project.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const { title, description, demoUrl, githubUrl, technologies, category, status, removedImages } = req.body;

    // Update fields
    if (title) project.title = title;
    if (description) project.description = description;
    if (demoUrl !== undefined) project.demoUrl = demoUrl;
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (technologies) {
      try {
        project.technologies = JSON.parse(technologies);
      } catch (e) {
        // If it's already an array or single value
        project.technologies = Array.isArray(technologies) ? technologies : [technologies];
      }
    }
    if (category) project.category = category;
    if (status) project.status = status;

    // Handle removed images
    if (removedImages) {
      const cloudinary = require('../config/cloudinary');
      let imagesToRemove = [];
      
      try {
        imagesToRemove = JSON.parse(removedImages);
      } catch (e) {
        imagesToRemove = Array.isArray(removedImages) ? removedImages : [removedImages];
      }

      for (const imageUrl of imagesToRemove) {
        if (imageUrl.includes('cloudinary.com')) {
          const urlParts = imageUrl.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = `apexdevs/projects/${publicIdWithExtension.split('.')[0]}`;
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.log('Error deleting image from Cloudinary:', err.message);
          }
        }
        // Remove from project.images array
        project.images = project.images.filter(img => img !== imageUrl);
      }
    }

    // Update images if uploaded
    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        // Delete old thumbnail from Cloudinary
        const cloudinary = require('../config/cloudinary');
        if (project.thumbnail.includes('cloudinary.com')) {
          const urlParts = project.thumbnail.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = `apexdevs/projects/${publicIdWithExtension.split('.')[0]}`;
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.log('Error deleting old thumbnail:', err.message);
          }
        }
        project.thumbnail = req.files.thumbnail[0].path;
      }

      if (req.files.images) {
        const newImages = req.files.images.map(file => file.path);
        project.images = [...project.images, ...newImages];
      }
    }

    await project.save();

    // Populate author info before sending response
    await project.populate('author', 'username avatar');

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the author
    if (project.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    // Delete images from Cloudinary
    const cloudinary = require('../config/cloudinary');
    const imagesToDelete = [project.thumbnail, ...project.images];

    for (const imageUrl of imagesToDelete) {
      if (imageUrl.includes('cloudinary.com')) {
        const urlParts = imageUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `apexdevs/projects/${publicIdWithExtension.split('.')[0]}`;
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.log('Error deleting image:', err.message);
        }
      }
    }

    // Remove project from user's projects array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { projects: project._id }
    });

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Toggle like on project
// @route   PUT /api/projects/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const likeIndex = project.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike
      project.likes.splice(likeIndex, 1);
    } else {
      // Like
      project.likes.push(req.user._id);
    }

    await project.save();

    res.json({
      success: true,
      data: {
        likes: project.likes.length,
        isLiked: likeIndex === -1
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  toggleLike
};
