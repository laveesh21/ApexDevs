import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageCarousel from '../components/ImageCarousel';
import EditProjectForm from '../components/EditProjectForm';
import { projectAPI } from '../services/api';
import { Tag, Button, AuthorAvatar } from '../components/ui';

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
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4">Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Project Not Found</h2>
          <p className="text-gray-400 mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Button to="/" variant="primary" size="lg">
            Back to Home
          </Button>
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
    <div className="min-h-screen bg-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-600">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-400 hover:text-primary transition-colors">Home</Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-100 font-medium">{project.title}</span>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 hover:border-primary/50 text-gray-300 rounded-lg transition-all" onClick={() => setShowEditForm(true)} title="Edit Project">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-all" onClick={handleDelete} title="Delete Project">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images and Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            <ImageCarousel images={carouselImages} />

            {/* Description Section */}
            <section className="bg-neutral-800 border border-neutral-600 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">About This Project</h2>
              <div className="text-gray-300 leading-relaxed">
                <p>{project.description}</p>
              </div>
            </section>

            {/* Tech Stack Section */}
            <section className="bg-neutral-800 border border-neutral-600 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Technologies Used</h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies?.map((tech, index) => (
                  <Tag key={index} variant="primary" size="md">
                    {tech}
                  </Tag>
                ))}
              </div>
            </section>

            {/* Review Section */}
            <section className="bg-neutral-800 border border-neutral-600 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-100">Reviews</h2>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-green-400 font-medium">👍 {reviewStats.likes}</span>
                  <span className="flex items-center gap-1 text-red-400 font-medium">👎 {reviewStats.dislikes}</span>
                </div>
              </div>

              {/* Review Actions */}
              {!isOwner && (
                <div className="mb-6">
                  {userReview ? (
                    <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-4">
                      <p className="text-gray-300 mb-2">Your review: <strong className="text-primary">{userReview.rating === 'like' ? '👍 Like' : '👎 Dislike'}</strong></p>
                      {userReview.comment && <p className="text-gray-400 italic mb-3">"{userReview.comment}"</p>}
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 border border-neutral-500 text-gray-300 rounded-lg transition-colors text-sm" onClick={() => setShowReviewForm(true)}>
                          Edit Review
                        </button>
                        <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors text-sm" onClick={handleDeleteReview}>
                          Delete Review
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-4">
                      <p className="text-gray-300 mb-3">What do you think about this project?</p>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-400 rounded-lg transition-colors" onClick={() => handleQuickReview('like')}>
                          👍 Like
                        </button>
                        <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-lg transition-colors" onClick={() => handleQuickReview('dislike')}>
                          👎 Dislike
                        </button>
                        <button className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary rounded-lg transition-colors" onClick={() => setShowReviewForm(true)}>
                          ✍️ Write Review
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Review Form */}
              {showReviewForm && (
                <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-100 mb-4">Write a Review</h3>
                  <div className="flex gap-2 mb-4">
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        reviewFormData.rating === 'like'
                          ? 'bg-green-500/30 border-2 border-green-500 text-green-400'
                          : 'bg-neutral-600 border border-neutral-500 text-gray-400 hover:border-green-500/50'
                      }`}
                      onClick={() => setReviewFormData({ ...reviewFormData, rating: 'like' })}
                    >
                      👍 Like
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        reviewFormData.rating === 'dislike'
                          ? 'bg-red-500/30 border-2 border-red-500 text-red-400'
                          : 'bg-neutral-600 border border-neutral-500 text-gray-400 hover:border-red-500/50'
                      }`}
                      onClick={() => setReviewFormData({ ...reviewFormData, rating: 'dislike' })}
                    >
                      👎 Dislike
                    </button>
                  </div>
                  <textarea
                    className="w-full px-4 py-2 bg-neutral-600 border border-neutral-500 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-4"
                    placeholder="Share your thoughts about this project (optional)..."
                    value={reviewFormData.comment}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                    rows="4"
                    maxLength={500}
                  />
                  <div className="flex justify-end gap-2">
                    <button className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 border border-neutral-500 text-gray-300 rounded-lg transition-colors" onClick={() => {
                      setShowReviewForm(false);
                      setReviewFormData({ rating: '', comment: '' });
                    }}>
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-primary hover:bg-primary-light text-neutral-900 font-medium rounded-lg transition-colors disabled:opacity-50"
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
                <div>
                  <h3 className="text-lg font-bold text-gray-100 mb-4">User Reviews ({reviews.length})</h3>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="bg-neutral-700 border border-neutral-600 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-neutral-600">
                              <img src={getSelectedAvatar(review.user)} alt={review.user?.username} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              {review.user?._id ? (
                                <Link to={`/user/${review.user._id}`} className="text-gray-100 font-medium hover:text-primary transition-colors">
                                  {review.user.username}
                                </Link>
                              ) : (
                                <span className="text-gray-100 font-medium">{review.user?.username || 'Anonymous'}</span>
                              )}
                              <span className="ml-2 text-xl">{review.rating === 'like' ? '👍' : '👎'}</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-300 pl-13">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reviews.length === 0 && !isOwner && !userReview && (
                <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>
              )}
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Project Info Card */}
            <div className="bg-neutral-800 border border-neutral-600 rounded-xl p-6 sticky top-8">
              <h3 className="text-2xl font-bold text-gray-100 mb-2">{project.title}</h3>
              <p className="text-gray-400 mb-6">{project.briefDescription}</p>

              {/* Author Info */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Created By</h4>
                {project.author ? (
                  <AuthorAvatar
                    author={project.author}
                    size="lg"
                    subtitle={project.author?.role || 'Developer'}
                  />
                ) : (
                  <div className="text-gray-400">Unknown Author</div>
                )}
              </div>

              {/* Project Stats */}
              <div className="mb-6 pb-6 border-b border-neutral-600">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-700 rounded-lg p-3">
                    <span className="block text-xs text-gray-500 mb-1">Status</span>
                    <span className={`text-sm font-semibold ${
                      project.status?.toLowerCase() === 'completed' ? 'text-green-400' :
                      project.status?.toLowerCase() === 'in progress' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {project.status || 'Completed'}
                    </span>
                  </div>
                  <div className="bg-neutral-700 rounded-lg p-3">
                    <span className="block text-xs text-gray-500 mb-1">Category</span>
                    <span className="text-sm font-semibold text-gray-100">{project.category || 'Other'}</span>
                  </div>
                  <div className="bg-neutral-700 rounded-lg p-3">
                    <span className="block text-xs text-gray-500 mb-1">Likes</span>
                    <span className="text-sm font-semibold text-green-400">{reviewStats.likes || 0}</span>
                  </div>
                  <div className="bg-neutral-700 rounded-lg p-3">
                    <span className="block text-xs text-gray-500 mb-1">Dislikes</span>
                    <span className="text-sm font-semibold text-red-400">{reviewStats.dislikes || 0}</span>
                  </div>
                  <div className="bg-neutral-700 rounded-lg p-3 col-span-2">
                    <span className="block text-xs text-gray-500 mb-1">Views</span>
                    <span className="text-sm font-semibold text-primary">{project.views || 0}</span>
                  </div>
                </div>
              </div>

              {/* Links Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Project Links</h4>
                {!project.demoUrl && !project.githubUrl ? (
                  <p className="text-gray-500 text-sm">No links available</p>
                ) : (
                  <div className="space-y-2">
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 hover:border-primary/50 rounded-lg transition-all group">
                        <span className="text-2xl">🌐</span>
                        <span className="text-gray-300 group-hover:text-primary font-medium">Live Demo</span>
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 hover:border-primary/50 rounded-lg transition-all group">
                        <span className="text-gray-400 group-hover:text-primary">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </span>
                        <span className="text-gray-300 group-hover:text-primary font-medium">Source Code</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Like Button */}
              {!isOwner && (
                <div className="mb-6">
                  <button
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      isLiked
                        ? 'bg-primary text-neutral-900 hover:bg-primary-light'
                        : 'bg-neutral-700 border border-neutral-600 text-gray-300 hover:border-primary/50 hover:bg-neutral-600'
                    }`}
                    onClick={async () => {
                      if (!token) {
                        alert('Please login to like this project');
                        return;
                      }

                      try {
                        const res = await projectAPI.toggleLike(token, id);
                        if (res && res.data) {
                          setLikeCount(res.data.likes || 0);
                          setIsLiked(!!res.data.isLiked);
                        } else {
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
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Project Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-300">
                      {new Date(project.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {project.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="text-gray-300">
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
