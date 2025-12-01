import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSelectedAvatar } from '../utils/avatarHelper';
import ImageCarousel from '../components/ImageCarousel';
import EditProjectForm from '../components/EditProjectForm';
import { projectAPI } from '../services/api';
import './ProjectDetail.css';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ total: 0, likes: 0, dislikes: 0 });
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({ rating: '', comment: '' });
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const hasFetched = useRef(false); // Track if we've already fetched
  const reviewsFetched = useRef(false);

  useEffect(() => {
    // Prevent double-fetch in React StrictMode
    if (hasFetched.current) return;
    
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await projectAPI.getById(id, token);
        setProject(response.data);
        // Initialize like state
        setIsLiked(response.data.isLiked || false);
        setLikeCount(response.data.likes?.length || 0);
        hasFetched.current = true; // Mark as fetched
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setError('Project not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    
    // Cleanup function to reset on unmount
    return () => {
      hasFetched.current = false;
    };
  }, [id, token]);

  // Fetch reviews
  useEffect(() => {
    if (reviewsFetched.current) return;

    const fetchReviews = async () => {
      try {
        const response = await projectAPI.getReviews(id, token);
        setReviews(response.data);
        setReviewStats(response.stats);
        setUserReview(response.userReview);
        reviewsFetched.current = true;
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };

    if (id) {
      fetchReviews();
    }

    return () => {
      reviewsFetched.current = false;
    };
  }, [id, token]);

  // Separate refetch function for edit success (doesn't increment views again)
  const refetchProject = async () => {
    try {
      const response = await projectAPI.getById(id, token);
      setProject(response.data);
      // Update like state
      setIsLiked(response.data.isLiked || false);
      setLikeCount(response.data.likes?.length || 0);
    } catch (err) {
      console.error('Failed to refetch project:', err);
    }
  };

  // Handle project delete
  const handleDelete = async () => {
    if (!token) {
      alert('Please login to delete');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await projectAPI.delete(token, id);
      alert('Project deleted successfully!');
      navigate('/');
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project. Please try again.');
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (rating) => {
    if (!token) {
      alert('Please login to review');
      return;
    }

    try {
      const reviewData = {
        rating,
        comment: reviewFormData.comment
      };

      await projectAPI.addReview(token, id, reviewData);
      
      // Refresh reviews
      reviewsFetched.current = false;
      const response = await projectAPI.getReviews(id, token);
      setReviews(response.data);
      setReviewStats(response.stats);
      setUserReview(response.userReview);
      reviewsFetched.current = true;

      setShowReviewForm(false);
      setReviewFormData({ rating: '', comment: '' });
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleQuickReview = async (rating) => {
    if (!token) {
      alert('Please login to review');
      return;
    }

    try {
      await projectAPI.addReview(token, id, { rating, comment: '' });
      
      // Refresh reviews
      reviewsFetched.current = false;
      const response = await projectAPI.getReviews(id, token);
      setReviews(response.data);
      setReviewStats(response.stats);
      setUserReview(response.userReview);
      reviewsFetched.current = true;
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleDeleteReview = async () => {
    if (!token) return;

    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      await projectAPI.deleteReview(token, id);
      
      // Refresh reviews
      reviewsFetched.current = false;
      const response = await projectAPI.getReviews(id, token);
      setReviews(response.data);
      setReviewStats(response.stats);
      setUserReview(null);
      reviewsFetched.current = true;

      alert('Review deleted successfully!');
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert('Failed to delete review. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="project-detail-container">
        <div className="project-loading">
          <div className="loading-spinner"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-container">
        <div className="not-found">
          <h2>Project Not Found</h2>
          <p>The project you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="back-link">Back to Home</Link>
        </div>
      </div>
    );
  }

  // Prepare images array for carousel (thumbnail + additional images)
  // Filter out any undefined/null values
  const carouselImages = [
    project.thumbnail,
    ...(project.images || [])
  ].filter(Boolean);

  // Check if current user is the owner
  const userId = user?._id || user?.id;
  const authorId = project.author?._id || project.author?.id || project.author;
  const isOwner = user && project.author && userId === authorId;

  return (
    <div className="project-detail-container">
      <div className="project-detail-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <span>{project.title}</span>
          {isOwner && (
            <div className="project-owner-actions">
              <button className="detail-edit-btn" onClick={() => setShowEditForm(true)} title="Edit Project">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              <button className="detail-delete-btn" onClick={handleDelete} title="Delete Project">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="detail-grid">
          {/* Left Column - Images and Description */}
          <div className="detail-main">
            {/* Image Carousel */}
            <ImageCarousel images={carouselImages} />

            {/* Description Section */}
            <section className="description-section">
              <h2>About This Project</h2>
              <div className="description-text">
                <p>{project.description}</p>
              </div>
            </section>

            {/* Tech Stack Section */}
            <section className="tech-stack-section">
              <h2>Technologies Used</h2>
              <div className="tech-tags">
                {project.technologies?.map((tech, index) => (
                  <span key={index} className="tech-tag">{tech}</span>
                ))}
              </div>
            </section>

            {/* Review Section */}
            <section className="review-section">
              <div className="review-header">
                <h2>Reviews</h2>
                <div className="review-stats-summary">
                  <span className="stat-likes">👍 {reviewStats.likes}</span>
                  <span className="stat-dislikes">👎 {reviewStats.dislikes}</span>
                </div>
              </div>

              {/* Review Actions */}
              {!isOwner && (
                <div className="review-actions">
                  {userReview ? (
                    <div className="user-review-status">
                      <p>Your review: <strong>{userReview.rating === 'like' ? '👍 Like' : '👎 Dislike'}</strong></p>
                      {userReview.comment && <p className="user-comment">"{userReview.comment}"</p>}
                      <div className="review-action-btns">
                        <button className="btn-change-review" onClick={() => setShowReviewForm(true)}>
                          Edit Review
                        </button>
                        <button className="btn-delete-review" onClick={handleDeleteReview}>
                          Delete Review
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="add-review">
                      <p>What do you think about this project?</p>
                      <div className="quick-review-btns">
                        <button className="btn-like" onClick={() => handleQuickReview('like')}>
                          👍 Like
                        </button>
                        <button className="btn-dislike" onClick={() => handleQuickReview('dislike')}>
                          👎 Dislike
                        </button>
                        <button className="btn-review-with-comment" onClick={() => setShowReviewForm(true)}>
                          ✍️ Write Review
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Review Form */}
              {showReviewForm && (
                <div className="review-form">
                  <h3>Write a Review</h3>
                  <div className="rating-select">
                    <button
                      className={`rating-btn like ${reviewFormData.rating === 'like' ? 'active' : ''}`}
                      onClick={() => setReviewFormData({ ...reviewFormData, rating: 'like' })}
                    >
                      👍 Like
                    </button>
                    <button
                      className={`rating-btn dislike ${reviewFormData.rating === 'dislike' ? 'active' : ''}`}
                      onClick={() => setReviewFormData({ ...reviewFormData, rating: 'dislike' })}
                    >
                      👎 Dislike
                    </button>
                  </div>
                  <textarea
                    className="review-textarea"
                    placeholder="Share your thoughts about this project (optional)..."
                    value={reviewFormData.comment}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                    rows="4"
                    maxLength={500}
                  />
                  <div className="review-form-actions">
                    <button className="btn-cancel" onClick={() => {
                      setShowReviewForm(false);
                      setReviewFormData({ rating: '', comment: '' });
                    }}>
                      Cancel
                    </button>
                    <button
                      className="btn-submit"
                      onClick={() => handleReviewSubmit(reviewFormData.rating)}
                      disabled={!reviewFormData.rating}
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length > 0 && (
                <div className="reviews-list">
                  <h3>User Reviews ({reviews.length})</h3>
                  {reviews.map((review) => (
                    <div key={review._id} className="review-item">
                      <div className="review-user">
                        <div className="review-avatar">
                          <img src={getSelectedAvatar(review.user)} alt={review.user?.username} />
                        </div>
                        <div className="review-user-info">
                          {review.user?._id ? (
                            <Link to={`/user/${review.user._id}`} className="review-username">
                              {review.user.username}
                            </Link>
                          ) : (
                            <span className="review-username">{review.user?.username || 'Anonymous'}</span>
                          )}
                          <span className="review-rating">{review.rating === 'like' ? '👍' : '👎'}</span>
                        </div>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="review-comment">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {reviews.length === 0 && !isOwner && !userReview && (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              )}
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="detail-sidebar">
            {/* Project Info Card */}
            <div className="info-card">
              <h3>{project.title}</h3>
              <p className="short-description">{project.briefDescription}</p>

              {/* Author Info */}
              <div className="author-section">
                <h4>Created By</h4>
                <div className="author-info">
                  <img 
                    src={getSelectedAvatar(project.author)} 
                    alt={project.author?.username}
                    className="author-avatar"
                  />
                  <div className="author-details">
                    <Link to={`/user/${project.author?._id || project.author?.id}`} className="author-name">
                      {project.author?.username || 'Unknown'}
                    </Link>
                    <span className="author-role">{project.author?.role || 'Developer'}</span>
                  </div>
                </div>
              </div>

              {/* Project Stats */}
              <div className="stats-section">
                <div className="stat-item">
                  <span className="stat-label">Status</span>
                  <span className={`stat-value status-${project.status?.toLowerCase().replace(' ', '-')}`}>
                    {project.status || 'Completed'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Category</span>
                  <span className="stat-value">{project.category || 'Other'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Likes</span>
                  <span className="stat-value">{reviewStats.likes || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Dislikes</span>
                  <span className="stat-value">{reviewStats.dislikes || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Views</span>
                  <span className="stat-value">{project.views || 0}</span>
                </div>
              </div>

              {/* Links Section */}
              <div className="links-section">
                <h4>Project Links</h4>
                {!project.demoUrl && !project.githubUrl ? (
                  <p className="no-links">No links available</p>
                ) : (
                  <>
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="link-button demo">
                        <span className="icon">🌐</span>
                        Live Demo
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="link-button github">
                        <span className="icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </span>
                        Source Code
                      </a>
                    )}
                  </>
                )}
              </div>

              {/* Like Button */}
              {!isOwner && (
                <div className="like-action">
                  <button
                    className={`like-btn ${isLiked ? 'liked' : ''}`}
                    onClick={async () => {
                      if (!token) {
                        alert('Please login to like this project');
                        return;
                      }

                      try {
                        const res = await projectAPI.toggleLike(token, id);
                        // Use server-returned count and isLiked flag to avoid stale UI
                        if (res && res.data) {
                          setLikeCount(res.data.likes || 0);
                          setIsLiked(!!res.data.isLiked);
                        } else {
                          // fallback: toggle local state
                          setIsLiked(prev => !prev);
                          setLikeCount(prev => prev + (isLiked ? -1 : 1));
                        }
                      } catch (err) {
                        console.error('Failed to toggle like:', err);
                        alert('Failed to update like. Please try again.');
                      }
                    }}
                  >
                    {isLiked ? 'Unlike' : 'Like'} • {likeCount || 0}
                  </button>
                </div>
              )}

              {/* Project Meta Info */}
              <div className="meta-info">
                <h4>Project Info</h4>
                <div className="meta-item">
                  <span className="meta-label">Created:</span>
                  <span className="meta-value">
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {project.updatedAt && (
                  <div className="meta-item">
                    <span className="meta-label">Last Updated:</span>
                    <span className="meta-value">
                      {new Date(project.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditForm && (
        <EditProjectForm
          project={project}
          onClose={() => setShowEditForm(false)}
          onSuccess={refetchProject}
        />
      )}
    </div>
  );
}

export default ProjectDetail;
