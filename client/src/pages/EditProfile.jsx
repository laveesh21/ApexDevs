import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Modal from '../components/Modal';

function EditProfile() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    briefBio: '',
    location: '',
    website: '',
    github: '',
    twitter: '',
    linkedin: '',
    skills: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Initialize form with user data
    setFormData({
      username: user.username || '',
      bio: user.bio || '',
      briefBio: user.briefBio || '',
      location: user.location || '',
      website: user.website || '',
      github: user.github || '',
      twitter: user.twitter || '',
      linkedin: user.linkedin || '',
      skills: user.skills || []
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleAvatarChange = async (e) => {
    
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError('');
    setUploadingAvatar(true);

    try {
      const response = await authAPI.uploadAvatar(token, file);
      
      // Update user with new avatar data including identicon and preference
      await updateUser({
        ...user,
        avatar: response.data.avatar,
        identicon: response.data.identicon,
        avatarPreference: response.data.avatarPreference
      });

      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user?.avatar) return;

    const confirmed = window.confirm('Are you sure you want to delete your profile picture?');
    if (!confirmed) return;

    setDeletingAvatar(true);
    setError('');

    try {
      const response = await authAPI.deleteAvatar(token);
      
      // Update user in context with identicon preference
      await updateUser({
        ...user,
        avatar: response.data.avatar,
        identicon: response.data.identicon,
        avatarPreference: response.data.avatarPreference
      });

      setSuccess('Profile picture deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete avatar');
    } finally {
      setDeletingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateProfile(token, formData);
      
      // Update user in context
      await updateUser(response.data);
      
      // Show success modal
      setModalState({
        isOpen: true,
        title: 'Success',
        message: 'Profile updated successfully!',
        type: 'success',
        onConfirm: () => navigate('/profile'),
        confirmText: 'OK',
        cancelText: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-100">Edit Profile</h1>
          <Link to="/profile" className="text-primary hover:text-primary-light transition-colors flex items-center gap-1">
            ← Back to Profile
          </Link>
        </div>

        {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">{error}</div>}
        {success && <div className="mb-4 p-4 bg-primary/10 border border-primary/50 rounded-lg text-primary">{success}</div>}

        {/* Avatar Section */}
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Profile Picture</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-dark-700 border-2 border-dark-600">
                {user?.identicon || user?.avatar ? (
                  <img 
                    src={
                      user.avatarPreference === 'custom' && user.avatar 
                        ? user.avatar 
                        : user.identicon
                    } 
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg width="128" height="128" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
                {(uploadingAvatar || deletingAvatar) && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-3 mb-4">
                <label htmlFor="avatar-upload" className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg cursor-pointer transition-colors">
                  {user?.avatar ? 'Change Picture' : 'Upload Picture'}
                </label>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                {user?.avatar && (
                  <button 
                    onClick={handleDeleteAvatar} 
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg transition-colors disabled:opacity-50"
                    disabled={deletingAvatar}
                  >
                    {deletingAvatar ? 'Deleting...' : 'Delete Picture'}
                  </button>
                )}
              </div>
              
              {/* Avatar Preference Selector */}
              {user?.identicon && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Display Preference</h3>
                  <div className="flex gap-4">
                    <div 
                      className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        user.avatarPreference === 'identicon' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-dark-600 hover:border-dark-500'
                      }`}
                      onClick={async () => {
                        try {
                          const response = await authAPI.updateProfile(token, { avatarPreference: 'identicon' });
                          await updateUser({
                            ...user,
                            avatarPreference: 'identicon'
                          });
                          setSuccess('Avatar preference updated!');
                          setTimeout(() => setSuccess(''), 2000);
                        } catch (err) {
                          setError('Failed to update preference');
                        }
                      }}
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-dark-700 mx-auto mb-2">
                        <img src={user.identicon} alt="Identicon" className="w-full h-full object-cover" />
                      </div>
                      <label className="flex items-center justify-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          name="avatarPreference"
                          value="identicon"
                          checked={user.avatarPreference === 'identicon'}
                          readOnly
                          className="text-primary"
                        />
                        Identicon
                      </label>
                    </div>
                    
                    {user?.avatar && (
                      <div 
                        className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          user.avatarPreference === 'custom' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-dark-600 hover:border-dark-500'
                        }`}
                        onClick={async () => {
                          try {
                            const response = await authAPI.updateProfile(token, { avatarPreference: 'custom' });
                            await updateUser({
                              ...user,
                              avatarPreference: 'custom'
                            });
                            setSuccess('Avatar preference updated!');
                            setTimeout(() => setSuccess(''), 2000);
                          } catch (err) {
                            setError('Failed to update preference');
                          }
                        }}
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-dark-700 mx-auto mb-2">
                          <img src={user.avatar} alt="Custom Avatar" className="w-full h-full object-cover" />
                        </div>
                        <label className="flex items-center justify-center gap-2 text-sm text-gray-300 cursor-pointer">
                          <input
                            type="radio"
                            name="avatarPreference"
                            value="custom"
                            checked={user.avatarPreference === 'custom'}
                            readOnly
                            className="text-primary"
                          />
                          Custom Picture
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full bg-dark-700 border border-dark-600 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="20"
                  placeholder="Tell us about yourself..."
                  className="w-full bg-dark-700 border border-dark-600 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y"
                />
              </div>

              <div>
                <label htmlFor="briefBio" className="block text-sm font-medium text-gray-300 mb-1.5">Brief Bio</label>
                <textarea
                  id="briefBio"
                  name="briefBio"
                  value={formData.briefBio}
                  onChange={handleChange}
                  rows="2"
                  maxLength={150}
                  placeholder="A short summary (max 150 characters)"
                  className="w-full bg-dark-700 border border-dark-600 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y"
                />
                <small className="text-xs text-gray-500 mt-1 block">{formData.briefBio.length}/150</small>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="w-full bg-dark-700 border border-dark-600 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1.5">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-dark-700 border border-dark-600 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Social Links</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="github" className="block text-sm font-medium text-gray-300 mb-1.5">GitHub</label>
                <input
                  type="text"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="username"
                  className="w-full bg-dark-700 border border-dark-600 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-300 mb-1.5">Twitter</label>
                <input
                  type="text"
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="username"
                  className="w-full bg-dark-700 border border-dark-600 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-300 mb-1.5">LinkedIn</label>
                <input
                  type="text"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="username"
                  className="w-full bg-dark-700 border border-dark-600 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Skills</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSkill(e);
                  }
                }}
                className="flex-1 bg-dark-700 border border-dark-600 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <button type="button" onClick={handleAddSkill} className="px-4 py-2 bg-primary hover:bg-primary-light text-dark-900 font-medium rounded-lg transition-colors">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span key={index} className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 text-gray-300 rounded-md border border-dark-600">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={handleCancel} className="px-6 py-2.5 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary hover:bg-primary-light text-dark-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
    </div>
  );
}

export default EditProfile;
