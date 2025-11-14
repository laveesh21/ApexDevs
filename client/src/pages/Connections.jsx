import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Connections.css';

const Connections = () => {
  const { user: currentUser, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'followers');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConnections();
  }, [currentUser]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'followers' || tab === 'following')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchConnections = async () => {
    const userId = currentUser?._id || currentUser?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [followersResponse, followingResponse] = await Promise.all([
        authAPI.getUserFollowers(userId),
        authAPI.getUserFollowing(userId)
      ]);

      console.log('Followers response:', followersResponse);
      console.log('Following response:', followingResponse);

      if (followersResponse.success) {
        setFollowers(followersResponse.data || []);
      }
      if (followingResponse.success) {
        setFollowing(followingResponse.data || []);
      }
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
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
      // Refresh the connections
      await fetchConnections();
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const isFollowingUser = (userId) => {
    return currentUser?.following?.includes(userId);
  };

  if (loading) {
    return (
      <div className="connections-container">
        <div className="loading">Loading connections...</div>
      </div>
    );
  }

  const currentList = activeTab === 'followers' ? followers : following;

  return (
    <div className="connections-container">
      <div className="connections-header">
        <button className="back-button" onClick={() => navigate('/profile')}>
          ← Back to Profile
        </button>
        <h1>Connections</h1>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => handleTabChange('followers')}
        >
          Followers
          <span className="tab-count">{followers.length}</span>
        </button>
        <button
          className={`tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => handleTabChange('following')}
        >
          Following
          <span className="tab-count">{following.length}</span>
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {currentList.length === 0 ? (
        <div className="no-connections">
          <p>
            {activeTab === 'followers'
              ? 'No followers yet'
              : 'Not following anyone yet'}
          </p>
        </div>
      ) : (
        <div className="connections-grid">
          {currentList.map((user) => {
            const userDisplayId = user._id || user.id;
            const currentUserId = currentUser?._id || currentUser?.id;
            
            return (
              <div key={userDisplayId} className="connection-card">
                <Link to={`/user/${userDisplayId}`} className="connection-info">
                  <div className="connection-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    )}
                  </div>
                  <div className="connection-details">
                    <h3 className="connection-username">{user.username}</h3>
                    {user.bio && <p className="connection-bio">{user.bio}</p>}
                  </div>
                </Link>
                {currentUser && userDisplayId !== currentUserId && (
                  <button
                    className={`action-btn ${
                      activeTab === 'following' 
                        ? 'unfollow' 
                        : isFollowingUser(userDisplayId) 
                          ? 'following' 
                          : 'follow'
                    }`}
                  onClick={() => {
                    if (activeTab === 'following') {
                      handleFollowToggle(userDisplayId, true);
                    } else {
                      handleFollowToggle(userDisplayId, isFollowingUser(userDisplayId));
                    }
                  }}
                >
                  {activeTab === 'following'
                    ? 'Unfollow'
                    : isFollowingUser(userDisplayId)
                      ? 'Following'
                      : 'Follow'}
                </button>
              )}
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
};

export default Connections;
