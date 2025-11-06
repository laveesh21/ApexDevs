const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  thumbnail: {
    type: String,
    required: [true, 'Project thumbnail is required']
  },
  images: [{
    type: String
  }],
  demoUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'Demo URL cannot exceed 500 characters']
  },
  githubUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'GitHub URL cannot exceed 500 characters']
  },
  technologies: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['Web App', 'Mobile App', 'Desktop App', 'Game', 'AI/ML', 'DevTools', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Maintained'],
    default: 'Completed'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for searching
projectSchema.index({ title: 'text', description: 'text', technologies: 'text' });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
