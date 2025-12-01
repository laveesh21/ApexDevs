import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSelectedAvatar } from '../utils/avatarHelper';
import { authAPI } from '../services/api';
import './Settings.css';

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
    <div className="settings-page">
      <div className="settings-container">
        <h1 className="settings-title">Settings</h1>

        {message.text && (
          <div className={`settings-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="settings-content">
          {/* Tabs */}
          <div className="settings-tabs">
            <button
              className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
              </svg>
              Profile
            </button>
            
            <button
              className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Password
            </button>

            <button
              className={`settings-tab ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Privacy
            </button>

            <button
              className={`settings-tab ${activeTab === 'blocked' ? 'active' : ''}`}
              onClick={() => setActiveTab('blocked')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              Blocked Users
            </button>
          </div>

          {/* Tab Content */}
          <div className="settings-panel">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="settings-form">
                <h2>Profile Information</h2>
                
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    placeholder="Your username"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>

                <h3>Social Links</h3>

                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="form-group">
                  <label>GitHub</label>
                  <input
                    type="text"
                    value={profileData.github}
                    onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                    placeholder="github.com/username"
                  />
                </div>

                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    type="text"
                    value={profileData.linkedin}
                    onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/username"
                  />
                </div>

                <div className="form-group">
                  <label>Twitter</label>
                  <input
                    type="text"
                    value={profileData.twitter}
                    onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                    placeholder="@username"
                  />
                </div>

                <button type="submit" className="settings-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="settings-form">
                <h2>Change Password</h2>
                
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <button type="submit" className="settings-btn" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <form onSubmit={handlePrivacyUpdate} className="settings-form">
                <h2>Privacy Settings</h2>
                
                <div className="form-group">
                  <label>Profile Visibility</label>
                  <select
                    value={privacySettings.profileVisibility}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="followers">Followers Only</option>
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacySettings.showEmail}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                    />
                    <span>Show email on profile</span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Who Can Message Me</label>
                  <select
                    value={privacySettings.messagePermission}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, messagePermission: e.target.value })}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="followers">People I follow or who follow me</option>
                    <option value="existing">Only existing conversations</option>
                    <option value="none">No one</option>
                  </select>
                  <small className="form-help">
                    Control who can send you messages. Existing conversations will remain accessible.
                  </small>
                </div>

                <button type="submit" className="settings-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            )}

            {/* Blocked Users Tab */}
            {activeTab === 'blocked' && (
              <div className="blocked-users-section">
                <h2>Blocked Users</h2>
                <p className="section-description">
                  Blocked users cannot view your profile or send you messages. You also won't see their content.
                </p>
                
                {blockedUsers.length === 0 ? (
                  <div className="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                    <p>You haven't blocked any users</p>
                  </div>
                ) : (
                  <div className="blocked-users-list">
                    {blockedUsers.map(blockedUser => (
                      <div key={blockedUser._id} className="blocked-user-item">
                        <div className="blocked-user-info">
                          <img 
                            src={getSelectedAvatar(blockedUser)} 
                            alt={blockedUser.username}
                            className="blocked-user-avatar"
                          />
                          <div className="blocked-user-details">
                            <h4>{blockedUser.username}</h4>
                            {blockedUser.bio && <p>{blockedUser.bio}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnblock(blockedUser._id)}
                          className="unblock-btn"
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
  );
}

export default Settings;
