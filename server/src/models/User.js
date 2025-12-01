import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default in queries
  },
  avatar: {
    type: String
  },
  identicon: {
    type: String
  },
  bio: {
    type: String,
    maxlength: [1500, 'Bio cannot exceed 1500 characters'],
    default: ''
  },
  briefBio: {
    type: String,
    maxlength: [100, 'Brief bio cannot exceed 100 characters'],
    default: ''
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot exceed 100 characters'],
    default: ''
  },
  website: {
    type: String,
    maxlength: [200, 'Website URL cannot exceed 200 characters'],
    default: ''
  },
  github: {
    type: String,
    maxlength: [100, 'GitHub username cannot exceed 100 characters'],
    default: ''
  },
  twitter: {
    type: String,
    maxlength: [100, 'Twitter username cannot exceed 100 characters'],
    default: ''
  },
  linkedin: {
    type: String,
    maxlength: [100, 'LinkedIn username cannot exceed 100 characters'],
    default: ''
  },
  reputation: {
    type: Number,
    default: 0
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  discussions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profileVisibility: {
    type: String,
    enum: ['public', 'private', 'followers'],
    default: 'public'
  },
  showEmail: {
    type: Boolean,
    default: false
  },
  messagePermission: {
    type: String,
    enum: ['everyone', 'followers', 'existing', 'none'],
    default: 'everyone'
  },
  allowMessages: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Avatar preference: which avatar to show by default
userSchema.add({
  avatarPreference: {
    type: String,
    enum: ['identicon', 'custom'],
    default: 'identicon'
  }
});

// Set default identicon if not provided and ensure avatarPreference default
userSchema.pre('save', function(next) {
  if (!this.identicon) {
    // Using dicebear with consistent dark gray background
    this.identicon = `https://api.dicebear.com/7.x/identicon/svg?seed=${this.username || this._id}&backgroundColor=374151`;
  }
  if (!this.avatarPreference) {
    this.avatarPreference = 'identicon';
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.toPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    identicon: this.identicon,
    avatarPreference: this.avatarPreference,
    bio: this.bio,
    briefBio: this.briefBio,
    location: this.location,
    website: this.website,
    github: this.github,
    twitter: this.twitter,
    linkedin: this.linkedin,
    reputation: this.reputation,
    isVerified: this.isVerified,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

export default User;
