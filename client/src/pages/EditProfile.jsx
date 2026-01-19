import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Modal from '../components/Modal';
import Button from '../components/ui/Button';

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
    <div className="min-h-screen bg-neutral-900">
      {/* Compact Header */}
      <div className="bg-neutral-800/50 border-b border-neutral-700/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-700/50 hover:bg-neutral-700 border border-neutral-600 text-gray-300 rounded-lg transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
              <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleCancel}
                variant="secondary"
                size="md"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                loading={loading}
                variant="primary"
                size="md"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Alerts */}
        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-2.5 bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Avatar & Skills */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar Section */}
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Profile Picture</h3>
              <div className="flex flex-col items-center">
                <div className="relative group mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-700 border-2 border-neutral-600 group-hover:border-primary/50 transition-all">
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
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <label htmlFor="avatar-upload" className="w-full px-4 py-2 bg-primary hover:bg-primary/90 border border-primary text-white text-center rounded-lg cursor-pointer transition-all text-sm font-medium flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {user?.avatar ? 'Change' : 'Upload'}
                  </label>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  {user?.avatar && (
                    <button 
                      type="button"
                      onClick={handleDeleteAvatar} 
                      className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg transition-all text-sm font-medium"
                      disabled={deletingAvatar}
                    >
                      {deletingAvatar ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              
              {/* Avatar Preference */}
              {user?.identicon && (
                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <p className="text-xs text-gray-500 mb-3">Display Preference</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={`p-2 border rounded-lg transition-all ${
                        user.avatarPreference === 'identicon' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-neutral-600 hover:border-neutral-500'
                      }`}
                      onClick={async () => {
                        try {
                          await authAPI.updateProfile(token, { avatarPreference: 'identicon' });
                          await updateUser({ ...user, avatarPreference: 'identicon' });
                          setSuccess('Updated');
                          setTimeout(() => setSuccess(''), 2000);
                        } catch (err) {
                          setError('Failed to update');
                        }
                      }}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-700 mx-auto mb-1">
                        <img src={user.identicon} alt="Identicon" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs text-gray-400">Identicon</p>
                    </button>
                    {user?.avatar && (
                      <button
                        type="button"
                        className={`p-2 border rounded-lg transition-all ${
                          user.avatarPreference === 'custom' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-neutral-600 hover:border-neutral-500'
                        }`}
                        onClick={async () => {
                          try {
                            await authAPI.updateProfile(token, { avatarPreference: 'custom' });
                            await updateUser({ ...user, avatarPreference: 'custom' });
                            setSuccess('Updated');
                            setTimeout(() => setSuccess(''), 2000);
                          } catch (err) {
                            setError('Failed to update');
                          }
                        }}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-700 mx-auto mb-1">
                          <img src={user.avatar} alt="Custom" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs text-gray-400">Custom</p>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Information */}
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="username" className="block text-xs font-medium text-gray-400 mb-1.5">Username*</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full bg-neutral-700/50 border border-neutral-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="briefBio" className="block text-xs font-medium text-gray-400 mb-1.5">Brief Bio ({formData.briefBio.length}/150)</label>
                  <textarea
                    id="briefBio"
                    name="briefBio"
                    value={formData.briefBio}
                    onChange={handleChange}
                    rows="2"
                    maxLength={150}
                    placeholder="A short summary"
                    className="w-full bg-neutral-700/50 border border-neutral-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-xs font-medium text-gray-400 mb-1.5">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="w-full bg-neutral-700/50 border border-neutral-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-xs font-medium text-gray-400 mb-1.5">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full bg-neutral-700/50 border border-neutral-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-xs font-medium text-gray-400 mb-1.5">Full Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="8"
                    placeholder="Tell us about yourself..."
                    className="w-full bg-neutral-700/50 border border-neutral-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="github" className="block text-xs font-medium text-gray-400 mb-1.5">GitHub</label>
                  <input
                    type="text"
                    id="github"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="username"
                    className="w-full bg-neutral-700/50 border border-neutral-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="twitter" className="block text-xs font-medium text-gray-400 mb-1.5">Twitter</label>
                  <input
                    type="text"
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="username"
                    className="w-full bg-neutral-700/50 border border-neutral-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="linkedin" className="block text-xs font-medium text-gray-400 mb-1.5">LinkedIn</label>
                  <input
                    type="text"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="username"
                    className="w-full bg-neutral-700/50 border border-neutral-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
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
