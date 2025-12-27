import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSelectedAvatar } from '../utils/avatarHelper';
import * as authAPI from '../services/api';

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
          <h1 className="text-3xl font-bold text-white mb-2">Following</h1>
          <p className="text-gray-400">{following.length} following</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {following.length === 0 ? (
          <div className="bg-neutral-800 border border-neutral-600 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">Not following anyone yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {following.map((user) => (
              <div key={user._id} className="bg-neutral-800 border border-neutral-600 rounded-xl p-6 hover:border-primary/50 transition-all">
                <Link to={`/users/${user._id}`} className="block mb-4">
                  <div className="flex items-center gap-4 mb-3">
                    <img 
                      src={getSelectedAvatar(user)} 
                      alt={user.username} 
                      className="w-16 h-16 rounded-full border-2 border-neutral-600 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg truncate">{user.username}</h3>
                    </div>
                  </div>
                  {user.bio && (
                    <p className="text-gray-400 text-sm line-clamp-2">{user.bio}</p>
                  )}
                </Link>
                <button
                  className="w-full py-2 bg-neutral-700 border border-neutral-600 text-gray-300 rounded-lg hover:bg-neutral-600 transition-all font-medium"
                  onClick={() => handleUnfollow(user._id)}
                >
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowingList;
