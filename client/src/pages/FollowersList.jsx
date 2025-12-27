import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSelectedAvatar } from '../utils/avatarHelper';
import * as authAPI from '../services/api';

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
      <div className="min-h-screen bg-neutral-900 py-8 px-4 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button 
            className="mb-6 px-4 py-2 bg-neutral-800 border border-neutral-600 text-gray-300 rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-2" 
            onClick={() => navigate('/profile')}
          >
            ← Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Followers</h1>
          <p className="text-gray-400">{followers.length} {followers.length === 1 ? 'follower' : 'followers'}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {followers.length === 0 ? (
          <div className="bg-neutral-800 border border-neutral-600 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">No followers yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followers.map((follower) => (
              <div key={follower._id} className="bg-neutral-800 border border-neutral-600 rounded-xl p-6 hover:border-primary/50 transition-all">
                <Link to={`/users/${follower._id}`} className="block mb-4">
                  <div className="flex items-center gap-4 mb-3">
                    <img 
                      src={getSelectedAvatar(follower)} 
                      alt={follower.username} 
                      className="w-16 h-16 rounded-full border-2 border-neutral-600 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg truncate">{follower.username}</h3>
                    </div>
                  </div>
                  {follower.bio && (
                    <p className="text-gray-400 text-sm line-clamp-2">{follower.bio}</p>
                  )}
                </Link>
                {currentUser && follower._id !== currentUser._id && (
                  <button
                    className={`w-full py-2 rounded-lg font-medium transition-all ${
                      isFollowingUser(follower._id) 
                        ? 'bg-neutral-700 border border-neutral-600 text-gray-300 hover:bg-neutral-600' 
                        : 'bg-primary text-white hover:bg-primary-light'
                    }`}
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
    </div>
  );
};

export default FollowersList;
