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
import './PublicProfile.css';

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
      <div className="public-profile-container">
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="public-profile-container">
        <div className="error-state">
          <h2>User Not Found</h2>
          <p>The profile you're looking for doesn't exist.</p>
          <Link to="/" className="back-link">← Back to Home</Link>
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
    <div className="public-profile-container">
      <div className="public-profile-content">
        {/* Preview Mode Banner */}
        {currentUser && currentUser._id === userId && searchParams.get('preview') === 'true' && (
          <div className="preview-banner">
            <span>👁️ Preview Mode - This is how your profile appears to others</span>
            <Link to="/profile" className="back-to-profile-btn">
              Back to My Profile
            </Link>
          </div>
        )}

        {/* Profile Header */}
        <div className="profile-header-public">
          <div className="profile-header-top">
            <div className="profile-avatar-large">
              {getSelectedAvatar(user) ? (
                <img src={getSelectedAvatar(user)} alt={user.username} />
              ) : (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              )}
            </div>
            <div className="profile-header-info">
              <h1 className="profile-username">{user.username}</h1>
              {user.briefBio && <p className="profile-brief-bio-public">{user.briefBio}</p>}
              {user.bio && <p className="profile-bio">{user.bio}</p>}
              
              <div className="profile-stats-public">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <div className="stat-number">{user.followersCount || 0}</div>
                    <div className="stat-text">Followers</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔗</div>
                  <div className="stat-content">
                    <div className="stat-number">{user.followingCount || 0}</div>
                    <div className="stat-text">Following</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-content">
                    <div className="stat-number">{projects.length}</div>
                    <div className="stat-text">Projects</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💬</div>
                  <div className="stat-content">
                    <div className="stat-number">{threads.length}</div>
                    <div className="stat-text">Discussions</div>
                  </div>
                </div>
              </div>
              
              <div className="profile-meta">
                <span className="meta-item">
                  � Joined {formatDate(user.createdAt)}
                </span>
              </div>
              
              {/* Follow and Message Buttons - Don't show on own profile or in preview mode */}
              {currentUser && currentUser._id !== userId && (
                <div className="profile-actions">
                  <button 
                    onClick={handleFollowToggle}
                    disabled={followLoading || isBlocked}
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                  >
                    {followLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                  <Link to={`/chat/${userId}`} className="message-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Message
                  </Link>
                  <button
                    onClick={handleBlockToggle}
                    disabled={blockLoading}
                    className={`block-btn ${isBlocked ? 'blocked' : ''}`}
                  >
                    {blockLoading ? 'Loading...' : isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          {(user.location || user.website || user.skills?.length > 0) && (
            <div className="profile-details">
              {user.location && (
                <div className="detail-item">
                  <img src={locationIcon} alt="location" className="detail-icon-img" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="detail-item">
                  <img src={websiteIcon} alt="website" className="detail-icon-img" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer">
                    {user.website}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {(user.github || user.linkedin || user.twitter) && (
            <div className="social-links-public">
              {user.github && (
                <a href={user.github} target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                  <img src={linkedinIcon} alt="LinkedIn" className="social-icon" />
                  LinkedIn
                </a>
              )}
              {user.twitter && (
                <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
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
            <div className="skills-section-public">
              <h3>Skills</h3>
              <div className="skills-list">
                {user.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects ({projects.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'discussions' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussions')}
          >
            Discussions ({threads.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="profile-content-area">
          {activeTab === 'projects' && (
            <div className="projects-grid">
              {projects.length > 0 ? (
                projects.map(project => (
                  <ProjectCard key={project._id} project={project} />
                ))
              ) : (
                <p className="empty-state">No projects yet.</p>
              )}
            </div>
          )}

          {activeTab === 'discussions' && (
            <div className="discussions-list">
              {threads.length > 0 ? (
                threads.map(thread => (
                  <DiscussionCard key={thread._id} discussion={thread} />
                ))
              ) : (
                <p className="empty-state">No discussions yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;
