import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authAPI from '../services/api';
import './FollowingList.css';

const FollowingList = () => {
  const { user: currentUser, token } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFollowing();
  }, [currentUser]);

  const fetchFollowing = async () => {
    if (!currentUser?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.getUserFollowing(currentUser._id);
      if (response.success) {
        setFollowing(response.data);
      }
    } catch (err) {
      console.error('Error fetching following:', err);
      setError('Failed to load following');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await authAPI.unfollowUser(token, userId);
      // Refresh the list
      await fetchFollowing();
    } catch (err) {
      console.error('Error unfollowing:', err);
    }
  };

  if (loading) {
    return (
      <div className="following-list-container">
        <div className="loading">Loading following...</div>
      </div>
    );
  }

  return (
    <div className="following-list-container">
      <div className="following-list-header">
        <button className="back-button" onClick={() => navigate('/profile')}>
          ← Back to Profile
        </button>
        <h1>Following</h1>
        <p className="following-count">{following.length} following</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {following.length === 0 ? (
        <div className="no-following">
          <p>Not following anyone yet</p>
        </div>
      ) : (
        <div className="following-grid">
          {following.map((user) => (
            <div key={user._id} className="following-card">
              <Link to={`/users/${user._id}`} className="following-info">
                <div className="following-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  )}
                </div>
                <div className="following-details">
                  <h3 className="following-username">{user.username}</h3>
                  {user.bio && <p className="following-bio">{user.bio}</p>}
                </div>
              </Link>
              <button
                className="unfollow-btn"
                onClick={() => handleUnfollow(user._id)}
              >
                Unfollow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowingList;
