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
    <div className="min-h-screen bg-neutral-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account preferences and privacy</p>
        </div>

        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-lg flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/50 text-green-400' 
              : 'bg-red-500/10 border border-red-500/50 text-red-400'
          }`}>
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              {message.type === 'success' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-2 space-y-1 sticky top-4">
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'profile' 
                    ? 'bg-primary text-white font-medium shadow-lg shadow-primary/20' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-neutral-700/50'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                </svg>
                <span className="text-sm">Profile</span>
              </button>
              
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'password' 
                    ? 'bg-primary text-white font-medium shadow-lg shadow-primary/20' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-neutral-700/50'
                }`}
                onClick={() => setActiveTab('password')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span className="text-sm">Password</span>
              </button>

              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'privacy' 
                    ? 'bg-primary text-white font-medium shadow-lg shadow-primary/20' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-neutral-700/50'
                }`}
                onClick={() => setActiveTab('privacy')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span className="text-sm">Privacy</span>
              </button>

              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'blocked' 
                    ? 'bg-primary text-white font-medium shadow-lg shadow-primary/20' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-neutral-700/50'
                }`}
                onClick={() => setActiveTab('blocked')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
                <span className="text-sm">Blocked Users</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                  <p className="text-sm text-gray-400 mt-1">Update your personal details</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      placeholder="Your username"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bio</label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-700">
                  <h3 className="text-lg font-bold text-white mb-4">Social Links</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Website</label>
                      <input
                        type="url"
                        className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">GitHub</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        value={profileData.github}
                        onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                        placeholder="github.com/username"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">LinkedIn</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                        placeholder="linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Twitter</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        value={profileData.twitter}
                        onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                        placeholder="@username"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    loading 
                      ? 'bg-neutral-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Change Password</h2>
                  <p className="text-sm text-gray-400 mt-1">Update your account password</p>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    loading 
                      ? 'bg-neutral-700 border border-neutral-600 text-gray-500 cursor-not-allowed' 
                      : 'bg-primary border border-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Changing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Change Password
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <form onSubmit={handlePrivacyUpdate} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Privacy Settings</h2>
                  <p className="text-sm text-gray-400 mt-1">Control who can see your content</p>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Profile Visibility</label>
                  <select
                    className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={privacySettings.profileVisibility}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                  >
                    <option value="public">Public - Anyone can view</option>
                    <option value="private">Private - Only you</option>
                    <option value="followers">Followers Only</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">Control who can view your profile and content</p>
                </div>

                <div className="flex items-start gap-3 p-4 bg-neutral-700/30 rounded-lg border border-neutral-600">
                  <input
                    type="checkbox"
                    id="showEmail"
                    className="w-4 h-4 mt-1 bg-neutral-700 border-neutral-600 rounded focus:ring-primary text-primary cursor-pointer"
                    checked={privacySettings.showEmail}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                  />
                  <label htmlFor="showEmail" className="flex-1 cursor-pointer">
                    <span className="text-white font-medium block">Show email on profile</span>
                    <span className="text-xs text-gray-400">Allow others to see your email address</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Who Can Message Me</label>
                  <select
                    className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={privacySettings.messagePermission}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, messagePermission: e.target.value })}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="followers">People I follow or who follow me</option>
                    <option value="existing">Only existing conversations</option>
                    <option value="none">No one</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Control who can send you messages. Existing conversations will remain accessible.
                  </p>
                </div>

                <button 
                  type="submit" 
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    loading 
                      ? 'bg-neutral-700 border border-neutral-600 text-gray-500 cursor-not-allowed' 
                      : 'bg-primary border border-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Save Settings
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Blocked Users Tab */}
            {activeTab === 'blocked' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Blocked Users</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Blocked users cannot view your profile or send you messages. You also won't see their content.
                  </p>
                </div>
                
                {blockedUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-neutral-700/50 rounded-full flex items-center justify-center mb-4">
                      <svg className="text-gray-500" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>
                    </div>
                    <p className="text-gray-400 text-lg font-medium">No blocked users</p>
                    <p className="text-gray-500 text-sm mt-1">Users you block will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blockedUsers.map(blockedUser => (
                      <div key={blockedUser._id} className="flex items-center justify-between p-4 bg-neutral-700/30 border border-neutral-600 rounded-lg hover:bg-neutral-700/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <img 
                            src={getSelectedAvatar(blockedUser)} 
                            alt={blockedUser.username}
                            className="w-12 h-12 rounded-full border-2 border-neutral-600 object-cover"
                          />
                          <div>
                            <h4 className="text-white font-medium">{blockedUser.username}</h4>
                            {blockedUser.bio && <p className="text-gray-400 text-sm line-clamp-1 max-w-md">{blockedUser.bio}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnblock(blockedUser._id)}
                          className="px-4 py-2 bg-primary/90 hover:bg-primary border border-primary text-white text-sm rounded-lg transition-colors font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
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
