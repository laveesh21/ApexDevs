import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSelectedAvatar } from '../utils/avatarHelper';
import { authAPI } from '../services/api';

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
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-gray-400">Loading connections...</div>
      </div>
    );
  }

  const currentList = activeTab === 'followers' ? followers : following;

  return (
    <div className="min-h-screen bg-neutral-900 py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-6">
          <button className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-4" onClick={() => navigate('/profile')}>
            ← Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-100">Connections</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'followers'
                ? 'bg-primary text-white'
                : 'bg-neutral-800 border border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:border-primary/50'
            }`}
            onClick={() => handleTabChange('followers')}
          >
            Followers
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-900/30">{followers.length}</span>
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'following'
                ? 'bg-primary text-white'
                : 'bg-neutral-800 border border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:border-primary/50'
            }`}
            onClick={() => handleTabChange('following')}
          >
            Following
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-900/30">{following.length}</span>
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {currentList.length === 0 ? (
          <div className="bg-neutral-800 border border-neutral-600 rounded-xl p-12 text-center">
            <p className="text-gray-400">
              {activeTab === 'followers'
                ? 'No followers yet'
                : 'Not following anyone yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentList.map((user) => {
              const userDisplayId = user._id || user.id;
              const currentUserId = currentUser?._id || currentUser?.id;
              
              return (
                <div key={userDisplayId} className="bg-neutral-800 border border-neutral-600 rounded-xl p-6 hover:border-primary/50 transition-all">
                  <Link to={`/user/${userDisplayId}`} className="block">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-600">
                        <img src={getSelectedAvatar(user)} alt={user.username} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-100 truncate">{user.username}</h3>
                        {user.bio && <p className="text-sm text-gray-400 line-clamp-2">{user.bio}</p>}
                      </div>
                    </div>
                  </Link>
                  {currentUser && userDisplayId !== currentUserId && (
                    <button
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'following' || isFollowingUser(userDisplayId)
                          ? 'bg-neutral-700 border border-neutral-600 text-gray-300 hover:bg-red-500/10 hover:border-red-500 hover:text-red-400'
                          : 'bg-primary hover:bg-primary-light text-white'
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
    </div>
  );
};

export default Connections;
