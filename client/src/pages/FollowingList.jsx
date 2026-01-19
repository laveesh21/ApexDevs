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
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading following...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-b border-neutral-700">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button 
            className="mb-4 px-3 py-1.5 bg-black/20 backdrop-blur-sm border border-neutral-600 text-gray-300 rounded-lg hover:bg-black/40 hover:border-primary/50 transition-all flex items-center gap-2 text-sm font-medium" 
            onClick={() => navigate('/profile')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                Following
                <span className="px-3 py-1 bg-primary/20 border border-primary/30 text-gray-200 text-lg font-semibold rounded-full">
                  {following.length}
                </span>
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                People you're following
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {following.length === 0 ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-neutral-800/80 backdrop-blur-xl border border-neutral-700 rounded-2xl p-20 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Not following anyone yet</h3>
              <p className="text-gray-400 text-base max-w-md mx-auto">Discover and follow amazing developers to see their content</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {following.map((user) => (
              <div 
                key={user._id} 
                className="group relative bg-neutral-800/60 backdrop-blur-sm border border-neutral-700 rounded-xl p-6 hover:bg-neutral-800 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-purple-500/0 group-hover:from-primary/5 group-hover:to-purple-500/5 rounded-xl transition-all duration-300"></div>
                
                <Link to={`/users/${user._id}`} className="relative block">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <img 
                        src={getSelectedAvatar(user)} 
                        alt={user.username} 
                        className="w-16 h-16 rounded-full border-2 border-neutral-600 object-cover group-hover:border-primary/60 group-hover:scale-105 transition-all duration-300"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-neutral-800 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg truncate group-hover:text-gray-200 transition-colors">
                        {user.username}
                      </h3>
                      {user.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{user.location}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  {user.bio ? (
                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
                      {user.bio}
                    </p>
                  ) : (
                    <p className="text-gray-600 text-sm italic mb-4 min-h-[2.5rem]">No bio yet</p>
                  )}
                </Link>
                
                <button
                  className="relative w-full py-2.5 bg-neutral-700/80 border border-neutral-600 text-gray-300 rounded-lg hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2"
                  onClick={() => handleUnfollow(user._id)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                  </svg>
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
