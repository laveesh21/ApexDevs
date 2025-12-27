import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, projectAPI, threadAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import DiscussionCard from '../components/DiscussionCard';
import { getSelectedAvatar } from '../utils/avatarHelper';
import linkedinIcon from '../assets/linkedin.svg';
import websiteIcon from '../assets/website.svg';
import locationIcon from '../assets/location_icon.svg';

function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser, token } = useAuth();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('projects');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Only redirect to personal profile if not in preview mode
    const isPreview = searchParams.get('preview') === 'true';
    if (currentUser && currentUser._id === userId && !isPreview) {
      navigate('/profile');
      return;
    }

    if (hasFetched.current) return;

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user profile with token to get follow status
        const userResponse = await authAPI.getUserProfile(userId, token);
        setUser(userResponse.data);
        setIsFollowing(userResponse.data.isFollowing || false);

        // Check if current user has blocked this user
        if (token && currentUser) {
          const blockedResponse = await authAPI.getBlockedUsers(token);
          const blockedUserIds = blockedResponse.data.map(u => u._id);
          setIsBlocked(blockedUserIds.includes(userId));
        }

        // Fetch user's projects
        const projectsResponse = await projectAPI.getUserProjects(userId);
        setProjects(projectsResponse.data);

        // Fetch user's threads
        const threadsResponse = await threadAPI.getUserThreads(userId);
        setThreads(threadsResponse.data);

        hasFetched.current = true;
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('User not found');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      hasFetched.current = false;
    };
  }, [userId, currentUser, navigate, token]);

  const handleFollowToggle = async () => {
    if (!token) {
      alert('Please login to follow users');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await authAPI.unfollowUser(token, userId);
        setIsFollowing(false);
        setUser(prev => ({
          ...prev,
          followersCount: (prev.followersCount || 0) - 1
        }));
      } else {
        await authAPI.followUser(token, userId);
        setIsFollowing(true);
        setUser(prev => ({
          ...prev,
          followersCount: (prev.followersCount || 0) + 1
        }));
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      alert(err.message || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlockToggle = async () => {
    if (!token) {
      alert('Please login to block users');
      return;
    }

    const confirmMessage = isBlocked 
      ? 'Are you sure you want to unblock this user?' 
      : 'Are you sure you want to block this user? They won\'t be able to view your profile or message you.';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setBlockLoading(true);
    try {
      if (isBlocked) {
        await authAPI.unblockUser(token, userId);
        setIsBlocked(false);
        alert('User unblocked successfully');
      } else {
        await authAPI.blockUser(token, userId);
        setIsBlocked(true);
        // If user was followed, update the follow status
        setIsFollowing(false);
        alert('User blocked successfully');
      }
    } catch (err) {
      console.error('Failed to toggle block:', err);
      alert(err.message || 'Failed to update block status');
    } finally {
      setBlockLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 py-8 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-neutral-900 py-8 px-4 flex flex-col items-center justify-center">
        <div className="bg-neutral-800 border border-neutral-600 rounded-xl p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">User Not Found</h2>
          <p className="text-gray-400 mb-6">The profile you're looking for doesn't exist.</p>
          <Link to="/" className="text-primary hover:text-primary-light inline-flex items-center gap-2">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-neutral-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Preview Mode Banner */}
        {currentUser && currentUser._id === userId && searchParams.get('preview') === 'true' && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/50 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-primary font-medium">👁️ Preview Mode - This is how your profile appears to others</span>
            <Link to="/profile" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-medium">
              Back to My Profile
            </Link>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-neutral-800 border border-neutral-600 rounded-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-shrink-0">
              {getSelectedAvatar(user) ? (
                <img 
                  src={getSelectedAvatar(user)} 
                  alt={user.username} 
                  className="w-32 h-32 rounded-full border-4 border-neutral-600 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-neutral-600 bg-neutral-700 flex items-center justify-center">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
              {user.briefBio && <p className="text-gray-300 text-lg mb-2">{user.briefBio}</p>}
              {user.bio && <p className="text-gray-400 mb-4">{user.bio}</p>}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-3">
                  <div className="text-2xl mb-1">👥</div>
                  <div className="text-2xl font-bold text-white">{user.followersCount || 0}</div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-3">
                  <div className="text-2xl mb-1">🔗</div>
                  <div className="text-2xl font-bold text-white">{user.followingCount || 0}</div>
                  <div className="text-sm text-gray-400">Following</div>
                </div>
                <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-3">
                  <div className="text-2xl mb-1">📦</div>
                  <div className="text-2xl font-bold text-white">{projects.length}</div>
                  <div className="text-sm text-gray-400">Projects</div>
                </div>
                <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-3">
                  <div className="text-2xl mb-1">💬</div>
                  <div className="text-2xl font-bold text-white">{threads.length}</div>
                  <div className="text-sm text-gray-400">Discussions</div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Joined {formatDate(user.createdAt)}</span>
                </span>
              </div>
              
              {/* Follow and Message Buttons - Don't show on own profile or in preview mode */}
              {currentUser && currentUser._id !== userId && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button 
                    onClick={handleFollowToggle}
                    disabled={followLoading || isBlocked}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isFollowing 
                        ? 'bg-neutral-700 text-white border border-neutral-600 hover:bg-neutral-600' 
                        : 'bg-primary text-white hover:bg-primary-light'
                    }`}
                  >
                    {followLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                  <Link 
                    to={`/chat/${userId}`} 
                    className="px-6 py-2 rounded-lg font-medium bg-neutral-700 text-white border border-neutral-600 hover:bg-neutral-600 transition-colors flex items-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Message
                  </Link>
                  <button
                    onClick={handleBlockToggle}
                    disabled={blockLoading}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isBlocked 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                        : 'bg-neutral-700 text-red-400 border border-neutral-600 hover:bg-neutral-600'
                    }`}
                  >
                    {blockLoading ? 'Loading...' : isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          {(user.location || user.website || user.skills?.length > 0) && (
            <div className="mt-6 space-y-3">
              {user.location && (
                <div className="flex items-center gap-2 text-gray-300">
                  <img src={locationIcon} alt="location" className="w-5 h-5 opacity-60" />
                  <span className="text-gray-300">{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-2 text-gray-300">
                  <img src={websiteIcon} alt="website" className="w-5 h-5 opacity-60" />
                  <a 
                    href={user.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-light transition-colors"
                  >
                    {user.website}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {(user.github || user.linkedin || user.twitter) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {user.github && (
                <a 
                  href={user.github} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white hover:bg-neutral-600 hover:border-primary transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              )}
              {user.linkedin && (
                <a 
                  href={user.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white hover:bg-neutral-600 hover:border-primary transition-colors"
                >
                  <img src={linkedinIcon} alt="LinkedIn" className="w-5 h-5" />
                  LinkedIn
                </a>
              )}
              {user.twitter && (
                <a 
                  href={user.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white hover:bg-neutral-600 hover:border-primary transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                  Twitter
                </a>
              )}
            </div>
          )}

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <div className="flex gap-2 mb-6 border-b border-neutral-600">
          <button
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'projects' 
                ? 'text-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('projects')}
          >
            Projects ({projects.length})
            {activeTab === 'projects' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            )}
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'discussions' 
                ? 'text-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('discussions')}
          >
            Discussions ({threads.length})
            {activeTab === 'discussions' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div>
          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.length > 0 ? (
                projects.map(project => (
                  <ProjectCard key={project._id} project={project} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400 text-lg">No projects yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'discussions' && (
            <div className="space-y-4">
              {threads.length > 0 ? (
                threads.map(thread => (
                  <DiscussionCard key={thread._id} discussion={thread} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No discussions yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;
