import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { threadAPI } from '../services/api';
import Modal from '../components/Modal';
import { Tag, Button, AuthorAvatar, VoteCounter } from '../components/ui';

function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [voteStatus, setVoteStatus] = useState(null); // null, 'upvote', or 'downvote'
  const [voteScore, setVoteScore] = useState(0);
  const [commentVotes, setCommentVotes] = useState({}); // Store vote info for each comment
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: []
  });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [showFullContent, setShowFullContent] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: '',
    cancelText: ''
  });
  const hasFetched = useRef(false);
  const voteTimeout = useRef(null);
  const pendingVote = useRef(null);
  const commentVoteTimeouts = useRef({}); // Store timeouts for each comment

  // Helper function to check if current user is the author
  const isThreadAuthor = (author) => {
    if (!user || !author) return false;
    const userId = user._id || user.id;
    const authorId = author._id || author.id;
    return userId === authorId;
  };

  const isCommentAuthor = (author) => {
    if (!user || !author) return false;
    const userId = user._id || user.id;
    const authorId = author._id || author.id;
    return userId === authorId;
  };

  useEffect(() => {
    // Prevent double-fetch in React StrictMode
    if (hasFetched.current) return;

    const fetchThread = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await threadAPI.getById(id, token);
        setThread(response.data);
        // Set vote status and score from backend
        setVoteStatus(response.data.userVote);
        setVoteScore(response.data.voteScore || 0);
        
        // Fetch comments with token to get user vote status
        const commentsResponse = await threadAPI.getComments(id, token);
        setComments(commentsResponse.data);
        
        // Initialize comment votes state
        const votesState = {};
        commentsResponse.data.forEach(comment => {
          votesState[comment._id] = {
            voteStatus: comment.userVote,
            voteScore: comment.voteScore || 0
          };
        });
        setCommentVotes(votesState);
        
        hasFetched.current = true;
      } catch (err) {
        console.error('Failed to fetch thread:', err);
        setError('Thread not found');
      } finally {
        setLoading(false);
      }
    };

    fetchThread();

    return () => {
      hasFetched.current = false;
      if (voteTimeout.current) {
        clearTimeout(voteTimeout.current);
      }
      // Clear all comment vote timeouts
      Object.values(commentVoteTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [id, token, user]);

  // Debounced API call for voting
  const sendVoteToAPI = useCallback(async (voteType) => {
    if (!token || !voteType) return;
    
    try {
      const response = await threadAPI.vote(token, id, voteType);
      // Update with server response to ensure sync
      setVoteScore(response.data.voteScore);
      setVoteStatus(response.data.userVote);
    } catch (err) {
      console.error('Failed to vote:', err);
      // Revert on error
      const response = await threadAPI.getById(id, token);
      setVoteScore(response.data.voteScore || 0);
      setVoteStatus(response.data.userVote);
    }
  }, [token, id]);

  const handleVote = (type) => {
    if (!token) {
      setModalState({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to vote on threads.',
        type: 'info'
      });
      return;
    }

    // Optimistic UI update
    let newVoteScore = voteScore;
    let newVoteStatus = voteStatus;

    if (voteStatus === type) {
      // Clicking same vote - remove it
      newVoteStatus = null;
      newVoteScore = type === 'upvote' ? voteScore - 1 : voteScore + 1;
    } else if (voteStatus === null) {
      // No previous vote
      newVoteStatus = type;
      newVoteScore = type === 'upvote' ? voteScore + 1 : voteScore - 1;
    } else {
      // Switching vote type
      newVoteStatus = type;
      newVoteScore = type === 'upvote' ? voteScore + 2 : voteScore - 2;
    }

    // Update UI immediately
    setVoteStatus(newVoteStatus);
    setVoteScore(newVoteScore);
    
    // Store pending vote
    pendingVote.current = type;

    // Clear existing timeout
    if (voteTimeout.current) {
      clearTimeout(voteTimeout.current);
    }

    // Debounce API call - wait 500ms after last click
    voteTimeout.current = setTimeout(() => {
      sendVoteToAPI(pendingVote.current);
      pendingVote.current = null;
    }, 500);
  };

  // Comment voting handler
  const handleCommentVote = async (commentId, type) => {
    if (!token) {
      setModalState({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to vote on comments.',
        type: 'info'
      });
      return;
    }

    // Clear existing timeout for this comment
    if (commentVoteTimeouts.current[commentId]) {
      clearTimeout(commentVoteTimeouts.current[commentId]);
    }

    // Send API call immediately without optimistic update
    // Let backend handle all the logic and update UI with response
    try {
      const response = await threadAPI.voteComment(token, commentId, type);
      // Update with server response
      setCommentVotes(prev => ({
        ...prev,
        [commentId]: {
          voteStatus: response.data.userVote,
          voteScore: response.data.voteScore
        }
      }));
    } catch (err) {
      console.error('Failed to vote on comment:', err);
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to vote. Please try again.',
        type: 'error'
      });
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setModalState({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to comment on threads.',
        type: 'info'
      });
      return;
    }

    if (!newComment.trim()) return;

    try {
      const response = await threadAPI.addComment(token, id, { content: newComment });
      const newCommentData = response.data;
      setComments([...comments, newCommentData]);
      
      // Initialize vote state for new comment
      setCommentVotes(prev => ({
        ...prev,
        [newCommentData._id]: {
          voteStatus: null,
          voteScore: 0
        }
      }));
      
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to add comment. Please try again.',
        type: 'error'
      });
    }
  };

  // Handle thread edit
  const handleEditClick = () => {
    setEditFormData({
      title: thread.title,
      content: thread.content,
      category: thread.category,
      tags: thread.tags
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e) => {
    const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setEditFormData(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setModalState({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to edit threads.',
        type: 'info'
      });
      return;
    }

    try {
      const response = await threadAPI.update(token, id, editFormData);
      setThread(response.data);
      setIsEditing(false);
      setModalState({
        isOpen: true,
        title: 'Success',
        message: 'Thread updated successfully!',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to update thread:', err);
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update thread. Please try again.',
        type: 'error'
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      title: '',
      content: '',
      category: '',
      tags: []
    });
  };

  // Handle comment edit
  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentContent(comment.content);
  };

  const handleUpdateComment = async (commentId) => {
    if (!token) {
      setModalState({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to edit comments.',
        type: 'info'
      });
      return;
    }

    if (!editCommentContent.trim()) {
      setModalState({
        isOpen: true,
        title: 'Validation Error',
        message: 'Comment content cannot be empty.',
        type: 'warning'
      });
      return;
    }

    try {
      const response = await threadAPI.updateComment(token, commentId, { content: editCommentContent });
      // Update the comment in the list
      setComments(comments.map(c => 
        c._id === commentId ? response.data : c
      ));
      setEditingCommentId(null);
      setEditCommentContent('');
    } catch (err) {
      console.error('Failed to update comment:', err);
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update comment. Please try again.',
        type: 'error'
      });
    }
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) {
      setModalState({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to delete comments.',
        type: 'info'
      });
      return;
    }

    setModalState({
      isOpen: true,
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment?',
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await threadAPI.deleteComment(token, id, commentId);
          setComments(comments.filter(c => c._id !== commentId));
          const newCommentVotes = { ...commentVotes };
          delete newCommentVotes[commentId];
          setCommentVotes(newCommentVotes);
        } catch (err) {
          console.error('Failed to delete comment:', err);
          setModalState({
            isOpen: true,
            title: 'Error',
            message: 'Failed to delete comment. Please try again.',
            type: 'error'
          });
        }
      }
    });
  };

  // Handle thread delete
  const handleDelete = async () => {
    if (!token) {
      setModalState({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to delete threads.',
        type: 'info'
      });
      return;
    }

    setModalState({
      isOpen: true,
      title: 'Delete Thread',
      message: 'Are you sure you want to delete this thread? This action cannot be undone.',
      type: 'error',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await threadAPI.delete(token, id);
          setModalState({
            isOpen: true,
            title: 'Success',
            message: 'Thread deleted successfully!',
            type: 'success',
            onConfirm: () => navigate('/community')
          });
        } catch (err) {
          console.error('Failed to delete thread:', err);
          setModalState({
            isOpen: true,
            title: 'Error',
            message: 'Failed to delete thread. Please try again.',
            type: 'error'
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 py-8 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-neutral-900 py-8 px-4 flex flex-col items-center justify-center">
        <div className="bg-neutral-800 border border-neutral-600 rounded-xl p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">{error || 'Thread not found'}</h2>
          <Link to="/community" className="text-primary hover:text-primary-light inline-flex items-center gap-2">
            ← Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const getTypeColor = (category) => {
    const colors = {
      'General': '#1f6feb',
      'Questions': '#00be62',
      'Showcase': '#f97316',
      'Resources': '#d73a49',
      'Collaboration': '#a371f7',
      'Feedback': '#e85d04',
      'Other': '#6c757d'
    };
    return colors[category] || '#00be62';
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const createdAt = new Date(date);
    const diffInMs = now - createdAt;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    return createdAt.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-neutral-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Link to="/community" className="inline-flex items-center gap-2 text-gray-200 hover:text-green-500 mb-6">
              ← Back to Community
            </Link>

            {/* Main Question/Thread - Combined Header and Content */}
            <div className="bg-neutral-800/50 border border-neutral-600 rounded-xl overflow-hidden">
              <div className="flex gap-4 p-4">
                {/* Voting Column */}
                <VoteCounter
                  score={voteScore}
                  userVote={voteStatus}
                  onUpvote={() => handleVote('upvote')}
                  onDownvote={() => handleVote('downvote')}
                  orientation="vertical"
                  size="lg"
                />

                {/* Thread Body */}
                <div className="flex-1 min-w-0">
                  {/* Header inside main body */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span 
                        className="px-3 py-1 rounded-lg text-sm font-medium text-white"
                        style={{ backgroundColor: getTypeColor(thread.category) }}
                      >
                        {thread.category}
                      </span>
                      {isThreadAuthor(thread.author) && !isEditing && (
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleEditClick}
                            className="!px-6 !py-1"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={handleDelete}
                            className="!px-6 !py-1"
                          >
                           Delete
                          </Button>
                        </div>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-white">{thread.title}</h1>
                  </div>

            {isEditing ? (
              <form className="space-y-4" onSubmit={handleEditSubmit}>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    required
                    maxLength={200}
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                  <textarea
                    id="content"
                    name="content"
                    className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                    value={editFormData.content}
                    onChange={handleEditChange}
                    required
                    rows="10"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    id="category"
                    name="category"
                    className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={editFormData.category}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="General">General</option>
                    <option value="Questions">Questions</option>
                    <option value="Showcase">Showcase</option>
                    <option value="Resources">Resources</option>
                    <option value="Collaboration">Collaboration</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={editFormData.tags.join(', ')}
                    onChange={handleTagsChange}
                    placeholder="JavaScript, React, Node.js"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="prose prose-invert max-w-none">
                  {(() => {
                    const raw = thread.content || '';
                    const isLong = raw.length > 1500;
                    const contentToUse = showFullContent || !isLong ? raw : raw.slice(0, 1500);

                    return contentToUse.split('\n').map((paragraph, index) => {
                      // Handle code blocks
                      if (paragraph.startsWith('```')) {
                        return null; // leave advanced parsing for later
                      }

                      const formattedParagraph = paragraph
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/- (.*?)$/gm, '<li>$1</li>');

                      if (formattedParagraph.includes('<li>')) {
                        return (
                          <ul key={index} className="list-disc pl-5 mb-3 text-gray-300" dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                        );
                      }

                      return paragraph.trim() && (
                        <p key={index} className="mb-3 text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                      );
                    });
                  })()}

                  {/* See more / See less */}
                  {(thread.content || '').length > 1500 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullContent(s => !s)}
                    >
                      {showFullContent ? 'See less' : 'See more'}
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {thread.tags.map((tag, index) => (
                    <Tag key={index} variant="primary" size="xs">
                      {tag}
                    </Tag>
                  ))}
                </div>
              </>
            )}

            {/* Compact Author Info */}
            <div className="flex items-center gap-2 mt-4 border-t border-neutral-600 pt-4">
              <AuthorAvatar
                author={thread.author}
                size="xs"
                clickable={!!thread.author?._id}
              />
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 text-sm">{formatTimeAgo(thread.createdAt)}</span>
              {thread.updatedAt && new Date(thread.updatedAt).getTime() !== new Date(thread.createdAt).getTime() && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500 text-sm">edited {formatTimeAgo(thread.updatedAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Comments Section */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h2>

          <div className="space-y-4">
            {comments.map(comment => {
              const commentVote = commentVotes[comment._id] || { voteStatus: null, voteScore: 0 };
              
              return (
                <div key={comment._id} className="bg-neutral-800/50 border border-neutral-600 rounded-xl overflow-hidden">
                  <div className="flex gap-4 p-6">
                    {/* Comment Voting */}
                    <VoteCounter
                      score={commentVote.voteScore}
                      userVote={commentVote.voteStatus}
                      onUpvote={() => handleCommentVote(comment._id, 'upvote')}
                      onDownvote={() => handleCommentVote(comment._id, 'downvote')}
                      orientation="vertical"
                      size="md"
                    />

                    <div className="flex-1 min-w-0">
                      {/* Compact Comment Author */}
                      <div className="flex items-center gap-2 mb-3">
                        <AuthorAvatar
                          author={comment.author}
                          size="xs"
                          clickable={!!comment.author?._id}
                        />
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400 text-sm">{formatTimeAgo(comment.createdAt)}</span>
                        {comment.updatedAt && new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime() && (
                          <>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-500 text-sm">edited {formatTimeAgo(comment.updatedAt)}</span>
                          </>
                        )}
                        {isCommentAuthor(comment.author) && editingCommentId !== comment._id && (
                          <div className="ml-auto flex gap-2">
                            <button 
                              className="p-1 text-gray-400 hover:text-primary transition-colors" 
                              onClick={() => handleEditComment(comment)}
                              title="Edit comment"
                            >
                            </button>
                                <button 
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors" 
                              onClick={() => handleDeleteComment(comment._id)}
                              title="Delete comment"
                            >
                            </button>
                          </div>
                        )}
                      </div>

                      {editingCommentId === comment._id ? (
                        <div className="space-y-3">
                          <textarea
                            className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                            value={editCommentContent}
                            onChange={(e) => setEditCommentContent(e.target.value)}
                            rows="4"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleCancelCommentEdit}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleUpdateComment(comment._id)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="prose prose-invert max-w-none">
                          {comment.content.split('\n').map((paragraph, index) => {
                            const formattedParagraph = paragraph
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/- (.*?)$/gm, '<li>$1</li>');
                            
                            if (formattedParagraph.includes('<li>')) {
                              return (
                                <ul key={index} className="list-disc pl-5 mb-2 text-gray-300" dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                              );
                            }
                            
                            return paragraph.trim() && (
                              <p key={index} className="mb-2 text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Comment Section */}
        <div className="mt-6 bg-neutral-800/50 border border-neutral-600 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Your Comment</h3>
          <form onSubmit={handleSubmitComment}>
            <textarea 
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none" 
              placeholder="Write your comment here..."
              rows="6"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!token}
            ></textarea>
            <Button
              type="submit"
              variant={token && newComment.trim() ? 'primary' : 'secondary'}
              size="lg"
              disabled={!token || !newComment.trim()}
              className="mt-3"
            >
              {token ? 'Post Comment' : 'Login to Comment'}
            </Button>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="lg:col-span-1">
        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="bg-neutral-800/50 border border-neutral-600 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Thread Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Asked</span>
                <span className="text-white font-medium">{formatTimeAgo(thread.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Views</span>
                <span className="text-white font-medium">{thread.views}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Comments</span>
                <span className="text-white font-medium">{comments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Vote Score</span>
                <span className="text-primary font-bold">{voteScore}</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 border border-neutral-600 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Related Tags</h3>
            <div className="flex flex-wrap gap-2">
              {thread.tags.map((tag, index) => (
                <Tag key={index} variant="primary" size="xs">
                  <Link to="/community" className="hover:opacity-80">
                    {tag}
                  </Link>
                </Tag>
              ))}
            </div>
          </div>

          <div className="bg-neutral-800/50 border border-neutral-600 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Community Guidelines</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Be respectful and constructive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Stay on topic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Provide code examples when relevant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Mark helpful comments as accepted</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
    </div>
  );
}

export default ThreadDetail;
