import Thread from '../models/Thread.js';
import Comment from '../models/Comment.js';

// @desc    Create new thread
// @route   POST /api/threads
// @access  Private
const createThread = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const thread = await Thread.create({
      title,
      content,
      category,
      tags: tags || [],
      author: req.user._id
    });

    await thread.populate('author', 'username avatar identicon avatarPreference');

    res.status(201).json({
      success: true,
      data: thread
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all threads
// @route   GET /api/threads
// @access  Public
const getThreads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      // Split search query into individual words and remove empty strings
      const searchWords = search.trim().split(/\s+/).filter(word => word.length > 0);
      
      if (searchWords.length > 0) {
        // Create an array of conditions for each word
        // Each word must match in at least one of the fields
        const wordConditions = searchWords.map(word => {
          return {
            $or: [
              { title: { $regex: word, $options: 'i' } },
              { content: { $regex: word, $options: 'i' } },
              { tags: { $regex: word, $options: 'i' } }
            ]
          };
        });
        
        // All words must match (AND logic across words)
        query.$and = wordConditions;
      }
    }

    // Execute query with pagination
    const threads = await Thread.find(query)
      .populate('author', 'username avatar identicon avatarPreference')
      .populate('commentCount')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add vote scores to threads
    const threadsWithVotes = threads.map(thread => ({
      ...thread,
      voteScore: (thread.upvotes?.length || 0) - (thread.downvotes?.length || 0)
    }));

    const count = await Thread.countDocuments(query);

    res.status(200).json({
      success: true,
      data: threadsWithVotes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalThreads: count
      }
    });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single thread by ID
// @route   GET /api/threads/:id
// @access  Public (with optional auth for view tracking)
const getThreadById = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('author', 'username avatar identicon avatarPreference')
      .populate('commentCount');

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Track view if user is authenticated and hasn't viewed before
    if (req.user && !thread.viewedBy.includes(req.user._id)) {
      thread.views += 1;
      thread.viewedBy.push(req.user._id);
      await thread.save();
    } else if (!req.user) {
      // Increment view for unauthenticated users
      thread.views += 1;
      await thread.save();
    }

    // Add vote information
    const voteScore = thread.upvotes.length - thread.downvotes.length;
    const userVote = req.user 
      ? (thread.upvotes.includes(req.user._id) ? 'upvote' 
        : thread.downvotes.includes(req.user._id) ? 'downvote' 
        : null)
      : null;

    const threadData = thread.toObject();
    threadData.voteScore = voteScore;
    threadData.userVote = userVote;

    res.status(200).json({
      success: true,
      data: threadData
    });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update thread
// @route   PUT /api/threads/:id
// @access  Private (author only)
const updateThread = async (req, res) => {
  try {
    let thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Check if user is the author
    if (thread.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this thread'
      });
    }

    const { title, content, category, tags } = req.body;

    thread = await Thread.findByIdAndUpdate(
      req.params.id,
      { title, content, category, tags },
      { new: true, runValidators: true }
    ).populate('author', 'username avatar identicon avatarPreference');

    res.status(200).json({
      success: true,
      data: thread
    });
  } catch (error) {
    console.error('Update thread error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete thread
// @route   DELETE /api/threads/:id
// @access  Private (author only)
const deleteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Check if user is the author
    if (thread.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this thread'
      });
    }

    // Delete all comments associated with this thread
    await Comment.deleteMany({ thread: req.params.id });

    await thread.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Thread deleted successfully'
    });
  } catch (error) {
    console.error('Delete thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Vote on thread (upvote or downvote)
// @route   PUT /api/threads/:id/vote
// @access  Private
const toggleVote = async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    
    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type. Use "upvote" or "downvote"'
      });
    }

    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    const upvoteIndex = thread.upvotes.indexOf(req.user._id);
    const downvoteIndex = thread.downvotes.indexOf(req.user._id);

    if (voteType === 'upvote') {
      // Remove from downvotes if exists
      if (downvoteIndex > -1) {
        thread.downvotes.splice(downvoteIndex, 1);
      }
      
      // Toggle upvote
      if (upvoteIndex > -1) {
        thread.upvotes.splice(upvoteIndex, 1);
      } else {
        thread.upvotes.push(req.user._id);
      }
    } else if (voteType === 'downvote') {
      // Remove from upvotes if exists
      if (upvoteIndex > -1) {
        thread.upvotes.splice(upvoteIndex, 1);
      }
      
      // Toggle downvote
      if (downvoteIndex > -1) {
        thread.downvotes.splice(downvoteIndex, 1);
      } else {
        thread.downvotes.push(req.user._id);
      }
    }

    await thread.save();

    const voteScore = thread.upvotes.length - thread.downvotes.length;
    const userVote = thread.upvotes.includes(req.user._id) ? 'upvote' 
                    : thread.downvotes.includes(req.user._id) ? 'downvote' 
                    : null;

    res.status(200).json({
      success: true,
      data: {
        voteScore,
        upvotes: thread.upvotes.length,
        downvotes: thread.downvotes.length,
        userVote
      }
    });
  } catch (error) {
    console.error('Toggle vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Toggle like on thread (legacy - kept for compatibility)
// @route   PUT /api/threads/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    const userIndex = thread.likes.indexOf(req.user._id);

    if (userIndex > -1) {
      // Unlike
      thread.likes.splice(userIndex, 1);
    } else {
      // Like
      thread.likes.push(req.user._id);
    }

    await thread.save();

    res.status(200).json({
      success: true,
      data: {
        likes: thread.likes.length,
        isLiked: userIndex === -1
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add comment to thread
// @route   POST /api/threads/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;

    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    const comment = await Comment.create({
      content,
      author: req.user._id,
      thread: req.params.id,
      parentComment: parentComment || null
    });

    await comment.populate('author', 'username avatar identicon avatarPreference');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get comments for a thread
// @route   GET /api/threads/:id/comments
// @access  Public
const getComments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const comments = await Comment.find({
      thread: req.params.id,
      parentComment: null // Only get top-level comments
    })
      .populate('author', 'username avatar identicon avatarPreference')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'username avatar identicon avatarPreference' }
      })
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add vote information to comments
    const commentsWithVotes = comments.map(comment => {
      const voteScore = (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0);
      const userVote = req.user 
        ? (comment.upvotes?.some(id => id.toString() === req.user._id.toString()) ? 'upvote' 
          : comment.downvotes?.some(id => id.toString() === req.user._id.toString()) ? 'downvote' 
          : null)
        : null;

      // Add vote info to replies too
      const repliesWithVotes = comment.replies?.map(reply => {
        const replyVoteScore = (reply.upvotes?.length || 0) - (reply.downvotes?.length || 0);
        const replyUserVote = req.user 
          ? (reply.upvotes?.some(id => id.toString() === req.user._id.toString()) ? 'upvote' 
            : reply.downvotes?.some(id => id.toString() === req.user._id.toString()) ? 'downvote' 
            : null)
          : null;

        return {
          ...reply,
          voteScore: replyVoteScore,
          userVote: replyUserVote
        };
      });

      return {
        ...comment,
        voteScore,
        userVote,
        replies: repliesWithVotes
      };
    });

    const count = await Comment.countDocuments({
      thread: req.params.id,
      parentComment: null
    });

    res.status(200).json({
      success: true,
      data: commentsWithVotes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalComments: count
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update comment
// @route   PUT /api/threads/:threadId/comments/:commentId
// @access  Private (author only)
const updateComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    await comment.save();

    await comment.populate('author', 'username avatar identicon avatarPreference');

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/threads/:threadId/comments/:commentId
// @access  Private (author only)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: req.params.commentId });

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Toggle like on comment
// @route   PUT /api/threads/:threadId/comments/:commentId/like
// @access  Private
const toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const userIndex = comment.likes.indexOf(req.user._id);

    if (userIndex > -1) {
      // Unlike
      comment.likes.splice(userIndex, 1);
    } else {
      // Like
      comment.likes.push(req.user._id);
    }

    await comment.save();

    res.status(200).json({
      success: true,
      data: {
        likes: comment.likes.length,
        isLiked: userIndex === -1
      }
    });
  } catch (error) {
    console.error('Toggle comment like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Vote on comment (upvote or downvote)
// @route   PUT /api/threads/comments/:commentId/vote
// @access  Private
const toggleCommentVote = async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    
    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type. Use "upvote" or "downvote"'
      });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const upvoteIndex = comment.upvotes.indexOf(req.user._id);
    const downvoteIndex = comment.downvotes.indexOf(req.user._id);

    if (voteType === 'upvote') {
      // Remove from downvotes if exists
      if (downvoteIndex > -1) {
        comment.downvotes.splice(downvoteIndex, 1);
      }
      
      // Toggle upvote
      if (upvoteIndex > -1) {
        comment.upvotes.splice(upvoteIndex, 1);
      } else {
        comment.upvotes.push(req.user._id);
      }
    } else if (voteType === 'downvote') {
      // Remove from upvotes if exists
      if (upvoteIndex > -1) {
        comment.upvotes.splice(upvoteIndex, 1);
      }
      
      // Toggle downvote
      if (downvoteIndex > -1) {
        comment.downvotes.splice(downvoteIndex, 1);
      } else {
        comment.downvotes.push(req.user._id);
      }
    }

    await comment.save();

    const voteScore = comment.upvotes.length - comment.downvotes.length;
    const userVote = comment.upvotes.includes(req.user._id) ? 'upvote' 
                    : comment.downvotes.includes(req.user._id) ? 'downvote' 
                    : null;

    res.status(200).json({
      success: true,
      data: {
        voteScore,
        upvotes: comment.upvotes.length,
        downvotes: comment.downvotes.length,
        userVote
      }
    });
  } catch (error) {
    console.error('Toggle comment vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get threads by user ID
// @route   GET /api/threads/user/:userId
// @access  Public
const getUserThreads = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const threads = await Thread.find({ author: req.params.userId })
      .populate('author', 'username avatar identicon avatarPreference')
      .populate('commentCount')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add vote scores to threads
    const threadsWithVotes = threads.map(thread => ({
      ...thread,
      voteScore: (thread.upvotes?.length || 0) - (thread.downvotes?.length || 0)
    }));

    const count = await Thread.countDocuments({ author: req.params.userId });

    res.status(200).json({
      success: true,
      data: threadsWithVotes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalThreads: count
      }
    });
  } catch (error) {
    console.error('Get user threads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export {
  createThread,
  getThreads,
  getThreadById,
  updateThread,
  deleteThread,
  toggleVote,
  toggleLike,
  addComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike,
  toggleCommentVote,
  getUserThreads
};
