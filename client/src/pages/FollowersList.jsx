import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authAPI from '../services/api';
import './FollowersList.css';

const FollowersList = () => {
  const { user: currentUser, token } = useAuth();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFollowers();
  }, [currentUser]);

  const fetchFollowers = async () => {
    if (!currentUser?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.getUserFollowers(currentUser._id);
      if (response.success) {
        setFollowers(response.data);
      }
    } catch (err) {
      console.error('Error fetching followers:', err);
      setError('Failed to load followers');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId, isCurrentlyFollowing) => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (isCurrentlyFollowing) {
        await authAPI.unfollowUser(token, userId);
      } else {
        await authAPI.followUser(token, userId);
      }
      // Refresh the list
      await fetchFollowers();
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const isFollowingUser = (userId) => {
    return currentUser?.following?.includes(userId);
  };

  if (loading) {
    return (
      <div className="followers-list-container">
        <div className="loading">Loading followers...</div>
      </div>
    );
  }

  return (
    <div className="followers-list-container">
      <div className="followers-list-header">
        <button className="back-button" onClick={() => navigate('/profile')}>
          ← Back to Profile
        </button>
        <h1>Followers</h1>
        <p className="followers-count">{followers.length} {followers.length === 1 ? 'follower' : 'followers'}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {followers.length === 0 ? (
        <div className="no-followers">
          <p>No followers yet</p>
        </div>
      ) : (
        <div className="followers-grid">
          {followers.map((follower) => (
            <div key={follower._id} className="follower-card">
              <Link to={`/users/${follower._id}`} className="follower-info">
                <div className="follower-avatar">
                  {follower.avatar ? (
                    <img src={follower.avatar} alt={follower.username} />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  )}
                </div>
                <div className="follower-details">
                  <h3 className="follower-username">{follower.username}</h3>
                  {follower.bio && <p className="follower-bio">{follower.bio}</p>}
                </div>
              </Link>
              {currentUser && follower._id !== currentUser._id && (
                <button
                  className={`follow-btn ${isFollowingUser(follower._id) ? 'following' : ''}`}
                  onClick={() => handleFollowToggle(follower._id, isFollowingUser(follower._id))}
                >
                  {isFollowingUser(follower._id) ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowersList;
