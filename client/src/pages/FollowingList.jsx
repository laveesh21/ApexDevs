import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSelectedAvatar } from '../utils/avatarHelper';
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
                  <img src={getSelectedAvatar(user)} alt={user.username} />
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
