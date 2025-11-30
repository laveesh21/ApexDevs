import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: userExists.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          token: generateToken(user._id)
        }
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password'
      });
    }

    // Find user by email or username and explicitly select password field
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('projects', 'title thumbnail')
      .populate('discussions', 'title type createdAt');

      console.log('GetMe user:', user);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {

    console.log('UpdateProfile req.body:', req.body);

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields (include flat social fields too)
    const allowedUpdates = ['username', 'email', 'avatar', 'bio', 'briefBio', 'location', 'website', 'github', 'twitter', 'linkedin', 'socialLinks', 'skills'];
    const updates = Object.keys(req.body);
    
    updates.forEach(update => {
      if (allowedUpdates.includes(update)) {
        if (update === 'socialLinks') {
          // support nested socialLinks object: map to flat fields if model uses them
          const links = req.body.socialLinks || {};
          if (links.github !== undefined) user.github = links.github;
          if (links.twitter !== undefined) user.twitter = links.twitter;
          if (links.linkedin !== undefined) user.linkedin = links.linkedin;
          if (links.website !== undefined) user.website = links.website;
          // also keep a socialLinks object if schema ever includes it
          try {
            user.socialLinks = { ...(user.socialLinks || {}), ...links };
          } catch (e) {
            // ignore if user.socialLinks is not defined in schema
          }
        } else {
          user[update] = req.body[update];
        }
      }
    });

    await user.save();

    res.json({
      success: true,
      data: user.toPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    // Fetch user with password field explicitly selected
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload avatar
// @route   POST /api/auth/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar from Cloudinary if it exists
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      // Extract public_id from Cloudinary URL
      const urlParts = user.avatar.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = `apexdevs/avatars/${publicIdWithExtension.split('.')[0]}`;
      
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log('Error deleting old avatar:', err.message);
      }
    }

    // Update user avatar with Cloudinary URL
    user.avatar = req.file.path; // Cloudinary provides the full URL in req.file.path
    await user.save();

    res.json({
      success: true,
      data: {
        avatar: user.avatar,
        message: 'Avatar uploaded successfully'
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete avatar
// @route   DELETE /api/auth/avatar
// @access  Private
const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete avatar from Cloudinary if it exists
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      // Extract public_id from Cloudinary URL
      const urlParts = user.avatar.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = `apexdevs/avatars/${publicIdWithExtension.split('.')[0]}`;
      
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log('Error deleting avatar from Cloudinary:', err.message);
      }
    }

    // Remove avatar from user
    user.avatar = null;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Follow a user
// @route   POST /api/auth/users/:userId/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Can't follow yourself
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if either user has blocked the other
    if (userToFollow.blockedUsers && userToFollow.blockedUsers.some(id => id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You cannot follow this user'
      });
    }

    if (currentUser.blockedUsers && currentUser.blockedUsers.some(id => id.toString() === req.params.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot follow this user'
      });
    }

    // Check if already following
    if (currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Add to following and followers
    currentUser.following.push(req.params.userId);
    userToFollow.followers.push(req.user._id);

    await currentUser.save();
    await userToFollow.save();

    res.json({
      success: true,
      message: 'User followed successfully',
      data: {
        followersCount: userToFollow.followers.length,
        followingCount: currentUser.following.length
      }
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/auth/users/:userId/follow
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if not following
    if (!currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    // Remove from following and followers
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== req.params.userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({
      success: true,
      message: 'User unfollowed successfully',
      data: {
        followersCount: userToUnfollow.followers.length,
        followingCount: currentUser.following.length
      }
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get public user profile
// @route   GET /api/auth/users/:userId
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current user is blocked by this user or has blocked this user
    if (req.user && req.user._id) {
      const currentUser = await User.findById(req.user._id);
      
      // Check if viewer is blocked by profile owner
      if (user.blockedUsers && user.blockedUsers.some(id => id.toString() === req.user._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'You are blocked by this user'
        });
      }
      
      // Check if viewer has blocked the profile owner
      if (currentUser.blockedUsers && currentUser.blockedUsers.some(id => id.toString() === req.params.userId)) {
        return res.status(403).json({
          success: false,
          message: 'You have blocked this user'
        });
      }
    }

    // Check if current user is following this user (if authenticated)
    let isFollowing = false;
    if (req.user && req.user._id) {
      const currentUser = await User.findById(req.user._id);
      isFollowing = currentUser ? currentUser.following.includes(user._id) : false;
    }

    // Return public profile data
    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        briefBio: user.briefBio,
        location: user.location,
        website: user.website,
        github: user.github,
        linkedin: user.linkedin,
        twitter: user.twitter,
        skills: user.skills,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        isFollowing: isFollowing,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's followers
// @route   GET /api/auth/users/:userId/followers
// @access  Public
const getUserFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'username avatar bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.followers
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's following
// @route   GET /api/auth/users/:userId/following
// @access  Public
const getUserFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'username avatar bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.following
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update privacy settings
// @route   PUT /api/auth/privacy
// @access  Private
const updatePrivacySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { profileVisibility, showEmail, messagePermission, allowMessages } = req.body;

    // Update privacy settings
    if (profileVisibility !== undefined) {
      user.profileVisibility = profileVisibility;
    }
    if (showEmail !== undefined) {
      user.showEmail = showEmail;
    }
    if (messagePermission !== undefined) {
      user.messagePermission = messagePermission;
    }
    if (allowMessages !== undefined) {
      user.allowMessages = allowMessages;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: {
        profileVisibility: user.profileVisibility,
        showEmail: user.showEmail,
        messagePermission: user.messagePermission,
        allowMessages: user.allowMessages
      }
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Block a user
// @route   POST /api/auth/users/:userId/block
// @access  Private
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block yourself'
      });
    }

    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = await User.findById(req.user._id);

    // Check if already blocked
    if (user.blockedUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already blocked'
      });
    }

    // Add to blocked list
    user.blockedUsers.push(userId);

    // Remove from followers/following if exists
    user.followers = user.followers.filter(id => id.toString() !== userId);
    user.following = user.following.filter(id => id.toString() !== userId);
    userToBlock.followers = userToBlock.followers.filter(id => id.toString() !== req.user._id.toString());
    userToBlock.following = userToBlock.following.filter(id => id.toString() !== req.user._id.toString());

    await user.save();
    await userToBlock.save();

    res.json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Unblock a user
// @route   DELETE /api/auth/users/:userId/block
// @access  Private
const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(req.user._id);

    // Check if user is blocked
    if (!user.blockedUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not blocked'
      });
    }

    // Remove from blocked list
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== userId);
    await user.save();

    res.json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get blocked users
// @route   GET /api/auth/blocked
// @access  Private
const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('blockedUsers', 'username avatar bio');

    res.json({
      success: true,
      data: user.blockedUsers
    });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export {
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
  getUserFollowing,
  updatePrivacySettings,
  blockUser,
  unblockUser,
  getBlockedUsers
};
