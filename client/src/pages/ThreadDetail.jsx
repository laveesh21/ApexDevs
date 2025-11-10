import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { threadAPI } from '../services/api';
import './ThreadDetail.css';

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
  const hasFetched = useRef(false);
  const voteTimeout = useRef(null);
  const pendingVote = useRef(null);
  const commentVoteTimeouts = useRef({}); // Store timeouts for each comment

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
      alert('Please login to vote');
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
      alert('Please login to vote');
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
      alert('Failed to vote. Please try again.');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!token) {
      alert('Please login to comment');
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
      alert('Failed to add comment. Please try again.');
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
      alert('Please login to edit');
      return;
    }

    try {
      const response = await threadAPI.update(token, id, editFormData);
      setThread(response.data);
      setIsEditing(false);
      alert('Thread updated successfully!');
    } catch (err) {
      console.error('Failed to update thread:', err);
      alert('Failed to update thread. Please try again.');
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

  // Handle thread delete
  const handleDelete = async () => {
    if (!token) {
      alert('Please login to delete');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      return;
    }

    try {
      await threadAPI.delete(token, id);
      alert('Thread deleted successfully!');
      navigate('/community');
    } catch (err) {
      console.error('Failed to delete thread:', err);
      alert('Failed to delete thread. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="thread-detail-container">
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading thread...</p>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="thread-not-found">
        <h2>{error || 'Thread not found'}</h2>
        <Link to="/community" className="back-link">← Back to Community</Link>
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
    <div className="thread-detail-container">
      <div className="thread-detail-content">
        <Link to="/community" className="back-link">← Back to Community</Link>

        {/* Main Question/Thread - Combined Header and Content */}
        <div className="thread-main">
          <div className="thread-voting">
            <button 
              className={`vote-btn upvote ${voteStatus === 'upvote' ? 'active' : ''}`}
              onClick={() => handleVote('upvote')}
            >
              ▲
            </button>
            <span className="vote-count">{voteScore}</span>
            <button 
              className={`vote-btn downvote ${voteStatus === 'downvote' ? 'active' : ''}`}
              onClick={() => handleVote('downvote')}
            >
              ▼
            </button>
          </div>

          <div className="thread-body">
            {/* Header inside main body */}
            <div className="thread-header-inline">
              <div className="thread-title-row">
                <span 
                  className="thread-type-badge" 
                  style={{ backgroundColor: getTypeColor(thread.category) }}
                >
                  {thread.category}
                </span>
                {user && thread.author._id === user._id && !isEditing && (
                  <div className="thread-actions">
                    <button className="action-btn edit-btn" onClick={handleEditClick}>
                      ✏️ Edit
                    </button>
                    <button className="action-btn delete-btn" onClick={handleDelete}>
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
              <h1 className="thread-title">{thread.title}</h1>
            </div>

            {isEditing ? (
              <form className="thread-edit-form" onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-input"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    required
                    maxLength={200}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">Content</label>
                  <textarea
                    id="content"
                    name="content"
                    className="form-textarea"
                    value={editFormData.content}
                    onChange={handleEditChange}
                    required
                    rows="10"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    className="form-select"
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

                <div className="form-group">
                  <label htmlFor="tags">Tags (comma-separated)</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    className="form-input"
                    value={editFormData.tags.join(', ')}
                    onChange={handleTagsChange}
                    placeholder="JavaScript, React, Node.js"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="thread-content">
                  {thread.content.split('\n').map((paragraph, index) => {
                    // Handle code blocks
                    if (paragraph.startsWith('```')) {
                      return null; // We'll handle this with a separate code block parser
                    }
                    // Handle bold text
                    const formattedParagraph = paragraph
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/- (.*?)$/gm, '<li>$1</li>');
                    
                    if (formattedParagraph.includes('<li>')) {
                      return (
                        <ul key={index} dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                      );
                    }
                    
                    return paragraph.trim() && (
                      <p key={index} dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                    );
                  })}
                </div>

                <div className="thread-tags">
                  {thread.tags.map((tag, index) => (
                    <span key={index} className="thread-tag">{tag}</span>
                  ))}
                </div>
              </>
            )}

            {/* Compact Author Info */}
            <div className="thread-author-compact">
              <div className="author-avatar-tiny">
                {thread.author?.avatar ? (
                  <img src={thread.author.avatar} alt={thread.author.username} />
                ) : (
                  thread.author?.username?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              {thread.author?._id ? (
                <Link to={`/user/${thread.author._id}`} className="author-username">
                  {thread.author.username}
                </Link>
              ) : (
                <span className="author-username">{thread.author?.username || 'Anonymous'}</span>
              )}
              <span className="author-time">• {formatTimeAgo(thread.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="answers-section">
          <h2 className="answers-header">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h2>

          {comments.map(comment => {
            const commentVote = commentVotes[comment._id] || { voteStatus: null, voteScore: 0 };
            
            return (
              <div key={comment._id} className="answer-card">
                {/* Comment Voting */}
                <div className="comment-voting">
                  <button 
                    className={`vote-btn-small upvote ${commentVote.voteStatus === 'upvote' ? 'active' : ''}`}
                    onClick={() => handleCommentVote(comment._id, 'upvote')}
                  >
                    ▲
                  </button>
                  <span className="vote-count-small">{commentVote.voteScore}</span>
                  <button 
                    className={`vote-btn-small downvote ${commentVote.voteStatus === 'downvote' ? 'active' : ''}`}
                    onClick={() => handleCommentVote(comment._id, 'downvote')}
                  >
                    ▼
                  </button>
                </div>

                <div className="answer-body">
                  {/* Compact Comment Author */}
                  <div className="comment-author-compact">
                    <div className="author-avatar-tiny">
                      {comment.author?.avatar ? (
                        <img src={comment.author.avatar} alt={comment.author.username} />
                      ) : (
                        comment.author?.username?.charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                    {comment.author?._id ? (
                      <Link to={`/user/${comment.author._id}`} className="author-username">
                        {comment.author.username}
                      </Link>
                    ) : (
                      <span className="author-username">{comment.author?.username || 'Anonymous'}</span>
                    )}
                    <span className="author-time">• {formatTimeAgo(comment.createdAt)}</span>
                  </div>

                  <div className="answer-content">
                    {comment.content.split('\n').map((paragraph, index) => {
                      const formattedParagraph = paragraph
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/- (.*?)$/gm, '<li>$1</li>');
                      
                      if (formattedParagraph.includes('<li>')) {
                        return (
                          <ul key={index} dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                        );
                      }
                      
                      return paragraph.trim() && (
                        <p key={index} dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Comment Section */}
        <div className="add-answer-section">
          <h3>Your Comment</h3>
          <form onSubmit={handleSubmitComment}>
            <textarea 
              className="answer-textarea" 
              placeholder="Write your comment here..."
              rows="6"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!token}
            ></textarea>
            <button 
              type="submit" 
              className="submit-answer-btn"
              disabled={!token || !newComment.trim()}
            >
              {token ? 'Post Comment' : 'Login to Comment'}
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="thread-sidebar">
        <div className="sidebar-card">
          <h3>Thread Stats</h3>
          <div className="stat-item">
            <span className="stat-label">Asked</span>
            <span className="stat-value">{formatTimeAgo(thread.createdAt)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Views</span>
            <span className="stat-value">{thread.views}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Comments</span>
            <span className="stat-value">{comments.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Vote Score</span>
            <span className="stat-value">{voteScore}</span>
          </div>
        </div>

        <div className="sidebar-card">
          <h3>Related Tags</h3>
          <div className="related-tags">
            {thread.tags.map((tag, index) => (
              <Link key={index} to="/community" className="related-tag">
                {tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="sidebar-card">
          <h3>Community Guidelines</h3>
          <ul className="guidelines-list">
            <li>Be respectful and constructive</li>
            <li>Stay on topic</li>
            <li>Provide code examples when relevant</li>
            <li>Mark helpful comments as accepted</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default ThreadDetail;
