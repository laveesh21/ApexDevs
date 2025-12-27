import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSelectedAvatar } from '../utils/avatarHelper';
import { authAPI } from '../services/api';

function Settings() {
  const { user, token, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [blockedUsers, setBlockedUsers] = useState([]);

  // Profile settings
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: ''
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    messagePermission: 'everyone' // everyone, followers, existing, none
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || ''
      });
      
      // Load privacy settings from user data
      setPrivacySettings({
        profileVisibility: user.profileVisibility || 'public',
        showEmail: user.showEmail || false,
        messagePermission: user.messagePermission || 'everyone'
      });
      
      // Load blocked users
      loadBlockedUsers();
    }
  }, [user]);

  const loadBlockedUsers = async () => {
    try {
      const response = await authAPI.getBlockedUsers(token);
      setBlockedUsers(response.data);
    } catch (error) {
      console.error('Failed to load blocked users:', error);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await authAPI.unblockUser(token, userId);
      showMessage('success', 'User unblocked successfully');
      loadBlockedUsers(); // Reload the list
    } catch (error) {
      showMessage('error', error.message || 'Failed to unblock user');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(token, profileData);
      updateUser(response.data);
      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword(token, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showMessage('success', 'Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updatePrivacySettings(token, privacySettings);
      // Update user context with new privacy settings
      updateUser({
        ...user,
        profileVisibility: privacySettings.profileVisibility,
        showEmail: privacySettings.showEmail,
        messagePermission: privacySettings.messagePermission
      });
      showMessage('success', 'Privacy settings updated!');
    } catch (error) {
      showMessage('error', 'Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-primary/10 border border-primary/50 text-primary' 
              : 'bg-red-500/10 border border-red-500/50 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-2 space-y-1">
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-primary text-dark-900 font-medium' 
                    : 'text-gray-300 hover:bg-dark-700'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                </svg>
                Profile
              </button>
              
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'password' 
                    ? 'bg-primary text-dark-900 font-medium' 
                    : 'text-gray-300 hover:bg-dark-700'
                }`}
                onClick={() => setActiveTab('password')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Password
              </button>

              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'privacy' 
                    ? 'bg-primary text-dark-900 font-medium' 
                    : 'text-gray-300 hover:bg-dark-700'
                }`}
                onClick={() => setActiveTab('privacy')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Privacy
              </button>

              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'blocked' 
                    ? 'bg-primary text-dark-900 font-medium' 
                    : 'text-gray-300 hover:bg-dark-700'
                }`}
                onClick={() => setActiveTab('blocked')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
                Blocked Users
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Profile Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    placeholder="Your username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>

                <h3 className="text-lg font-bold text-white pt-4">Social Links</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                  <input
                    type="url"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={profileData.github}
                    onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                    placeholder="github.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={profileData.linkedin}
                    onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Twitter</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={profileData.twitter}
                    onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                    placeholder="@username"
                  />
                </div>

                <button 
                  type="submit" 
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                    loading 
                      ? 'bg-dark-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-primary text-dark-900 hover:bg-primary-light'
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Change Password</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                    loading 
                      ? 'bg-dark-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-primary text-dark-900 hover:bg-primary-light'
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <form onSubmit={handlePrivacyUpdate} className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Privacy Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Profile Visibility</label>
                  <select
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={privacySettings.profileVisibility}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="followers">Followers Only</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showEmail"
                    className="w-4 h-4 bg-dark-700 border-dark-600 rounded focus:ring-primary text-primary"
                    checked={privacySettings.showEmail}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                  />
                  <label htmlFor="showEmail" className="text-gray-300 cursor-pointer">
                    Show email on profile
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Who Can Message Me</label>
                  <select
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={privacySettings.messagePermission}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, messagePermission: e.target.value })}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="followers">People I follow or who follow me</option>
                    <option value="existing">Only existing conversations</option>
                    <option value="none">No one</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-400">
                    Control who can send you messages. Existing conversations will remain accessible.
                  </p>
                </div>

                <button 
                  type="submit" 
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                    loading 
                      ? 'bg-dark-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-primary text-dark-900 hover:bg-primary-light'
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            )}

            {/* Blocked Users Tab */}
            {activeTab === 'blocked' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Blocked Users</h2>
                <p className="text-gray-400">
                  Blocked users cannot view your profile or send you messages. You also won't see their content.
                </p>
                
                {blockedUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <svg className="text-gray-600 mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                    <p className="text-gray-400">You haven't blocked any users</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blockedUsers.map(blockedUser => (
                      <div key={blockedUser._id} className="flex items-center justify-between p-4 bg-dark-700 border border-dark-600 rounded-lg">
                        <div className="flex items-center gap-4">
                          <img 
                            src={getSelectedAvatar(blockedUser)} 
                            alt={blockedUser.username}
                            className="w-12 h-12 rounded-full border-2 border-dark-600 object-cover"
                          />
                          <div>
                            <h4 className="text-white font-medium">{blockedUser.username}</h4>
                            {blockedUser.bio && <p className="text-gray-400 text-sm line-clamp-1">{blockedUser.bio}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnblock(blockedUser._id)}
                          className="px-4 py-2 bg-primary text-dark-900 rounded-lg hover:bg-primary-light transition-colors font-medium"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
