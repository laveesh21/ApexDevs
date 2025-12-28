import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageCarousel from '../components/ImageCarousel';
import EditProjectForm from '../components/EditProjectForm';
import ProjectSidebar from '../components/ProjectSidebar';
import ReviewSection from '../components/ReviewSection';
import { projectAPI } from '../services/api';
import { AuthorAvatar } from '../components/ui';

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Hero Section */}
            {/* <div className="space-y-4"> */}
              {/* <h1 className="text-3xl font-bold text-white leading-tight">{project.title}</h1>
              <p className="text-lg text-gray-400">{project.briefDescription}</p> */}
              
              {/* Author & Meta */}
              {/* <div className="flex items-center justify-between py-4 border-y border-neutral-700">
                <div className="flex items-center gap-4">
                  {project.author && (
                    <AuthorAvatar
                      author={project.author}
                      size="md"
                      subtitle={new Date(project.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                      clickable={!!project.author?._id}
                    />
                  )}
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{project.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span>{reviewStats.likes || 0}</span>
                  </div>
                </div>
              </div> */}
            {/* </div> */}

            {/* Image Carousel */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-2xl overflow-hidden">
              <ImageCarousel images={carouselImages} />
            </div>

            {/* Description */}
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-4">About</h2>
              <p className="text-gray-300 leading-relaxed">{project.description}</p>
            </div>

            {/* Reviews Section */}
            <ReviewSection
              reviews={reviews}
              reviewStats={reviewStats}
              userReview={userReview}
              isOwner={isOwner}
              token={token}
              onQuickReview={handleQuickReview}
              onReviewSubmit={handleReviewSubmit}
              onDeleteReview={handleDeleteReview}
              showReviewForm={showReviewForm}
              setShowReviewForm={setShowReviewForm}
              reviewFormData={reviewFormData}
              setReviewFormData={setReviewFormData}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <ProjectSidebar project={project} reviewStats={reviewStats} />
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
