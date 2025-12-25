import Project from '../models/Project.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { title, description, briefDescription, demoUrl, githubUrl, technologies, category, status } = req.body;

    // Validation
    if (!title || !description || !briefDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and brief description'
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
      briefDescription,
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
      // Split search query into individual words and remove empty strings
      const searchWords = search.trim().split(/\s+/).filter(word => word.length > 0);
      
      if (searchWords.length > 0) {
        // Create an array of conditions for each word
        // Each word must match in at least one of the fields
        const wordConditions = searchWords.map(word => {
          const wordRegex = new RegExp(word, 'i');
          return {
            $or: [
              { title: wordRegex },
              { description: wordRegex },
              { technologies: wordRegex }
            ]
          };
        });
        
        // All words must match (AND logic across words)
        query.$and = wordConditions;
      }
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
      .populate('author', 'username avatar identicon avatarPreference')
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
      .populate('author', 'username avatar identicon avatarPreference email bio location website github twitter linkedin');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Increment views only for unique users
    // Check if user is authenticated
    const userId = req.user?._id;
    
    if (userId) {
      // For authenticated users: check if they haven't viewed before
      const hasViewed = project.viewedBy.some(id => id.toString() === userId.toString());
      
      if (!hasViewed) {
        project.views += 1;
        project.viewedBy.push(userId);
        await project.save();
      }
    } else {
      // For anonymous users: always increment
      project.views += 1;
      await project.save();
    }

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

    console.log('Update project request body:', req.body);

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

    const { title, description, briefDescription, demoUrl, githubUrl, technologies, category, status, removedImages } = req.body;

    // Update fields
    if (title) project.title = title;
    if (description) project.description = description;
    if (briefDescription) project.briefDescription = briefDescription;
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
    await project.populate('author', 'username avatar identicon avatarPreference');

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
    const imagesToDelete = [project.thumbnail, ...project.images];

    for (const imageUrl of imagesToDelete) {
      if (imageUrl.includes('cloudinary.com')) {
        const urlParts = imageUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `apexdevs/projects/${publicIdWithExtension.split('.')[0]}`;
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          // Failed to delete image from Cloudinary
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

// @desc    Add or update review for project
// @route   POST /api/projects/:id/review
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !['like', 'dislike'].includes(rating)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating (like or dislike)'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user already reviewed this project
    let review = await Review.findOne({
      project: req.params.id,
      user: req.user._id
    });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment || '';
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        project: req.params.id,
        user: req.user._id,
        rating,
        comment: comment || ''
      });
    }

    await review.populate('user', 'username avatar identicon avatarPreference');

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get reviews for a project
// @route   GET /api/projects/:id/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Get all reviews
    const reviews = await Review.find({ project: req.params.id })
      .populate('user', 'username avatar identicon avatarPreference')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Only return reviews with comments
    const reviewsWithComments = reviews.filter(review => review.comment && review.comment.trim());

    // Get review counts
    const totalReviews = await Review.countDocuments({ project: req.params.id });
    const likes = await Review.countDocuments({ project: req.params.id, rating: 'like' });
    const dislikes = await Review.countDocuments({ project: req.params.id, rating: 'dislike' });

    // Check if current user has reviewed (if authenticated)
    let userReview = null;
    if (req.user) {
      userReview = await Review.findOne({
        project: req.params.id,
        user: req.user._id
      });
    }

    res.json({
      success: true,
      data: reviewsWithComments,
      stats: {
        total: totalReviews,
        likes,
        dislikes,
        reviewsWithComments: reviewsWithComments.length
      },
      userReview: userReview ? {
        rating: userReview.rating,
        comment: userReview.comment
      } : null,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(reviewsWithComments.length / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/projects/:id/review
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      project: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  toggleLike,
  addReview,
  getReviews,
  deleteReview
};
