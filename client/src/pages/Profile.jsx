import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, projectAPI, threadAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import DiscussionCard from '../components/DiscussionCard';
import NewProjectForm from '../components/NewProjectForm';
import EditProjectForm from '../components/EditProjectForm';
import Button from '../components/ui/Button';
import { getSelectedAvatar } from '../utils/avatarHelper';
import websiteIcon from '../assets/website.svg';
import linkedinIcon from '../assets/linkedin.svg';
import locationIcon from '../assets/location_icon.svg';

function Profile() {
  const { user, token, isAuthenticated, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true); // Start as true to prevent flash
  const [editingProject, setEditingProject] = useState(null);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'threads'
  const [userThreads, setUserThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [freshUserData, setFreshUserData] = useState(null); // Fresh data with follow counts
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    bio: '',
    briefBio: '',
    location: '',
    website: '',
    github: '',
    twitter: '',
    linkedin: ''
  });

  const [editForm, setEditForm] = useState(userInfo);

  const fetchUserProjects = async () => {
    const userId = user?._id || user?.id;
    if (!userId) {
      setProjectsLoading(false);
      return;
    }
    
    setProjectsLoading(true);
    try {
      const response = await projectAPI.getUserProjects(userId);
      setUserProjects(response.data || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      // Set empty array on error to prevent undefined issues
      setUserProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchUserThreads = async () => {
    const userId = user?._id || user?.id;
    if (!userId) {
      setThreadsLoading(false);
      return;
    }
    
    setThreadsLoading(true);
    try {
      const response = await threadAPI.getUserThreads(userId);
      setUserThreads(response.data || []);
    } catch (err) {
      console.error('Failed to fetch threads:', err);
      setUserThreads([]);
    } finally {
      setThreadsLoading(false);
    }
  };

  const fetchFreshUserData = async () => {
    const userId = user?._id || user?.id;
    if (!userId || !token) return;
    
    try {
      const response = await authAPI.getUserProfile(userId, token);
      setFreshUserData(response.data);
    } catch (err) {
      console.error('Failed to fetch fresh user data:', err);
    }
  };

  // Initialize user info when user data is available
  useEffect(() => {
    if (user) {
      const userData = {
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        briefBio: user.briefBio || '',
        location: user.location || '',
        website: user.website || '',
        github: user.github || '',
        twitter: user.twitter || '',
        linkedin: user.linkedin || ''
      };
      setUserInfo(userData);
      setEditForm(userData);
    }
  }, [user]);

  // Handle authentication redirect
  useEffect(() => {
    // Wait for auth to finish loading before redirecting
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, authLoading]);

  // Fetch data once when user is available
  useEffect(() => {
    if (user && token) {
      fetchUserProjects();
      fetchUserThreads();
      fetchFreshUserData();
    }
  }, [user?._id, user?.id, token]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(userInfo);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(userInfo);
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.updateProfile(token, editForm);
      
      // Update local state
      setUserInfo(editForm);
      
      // Update auth context
      updateUser({ ...user, ...editForm });
      
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only image files are allowed (JPEG, PNG, GIF, WebP)');
      return;
    }

    setUploadingAvatar(true);
    setError('');

    try {
      const response = await authAPI.uploadAvatar(token, file);
      
      // Update user avatar in context - Cloudinary returns full URL
      const updatedUser = { 
        ...user, 
        avatar: response.data.avatar
      };
      updateUser(updatedUser);
      
    } catch (err) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
  };

  const handleCloseEditForm = () => {
    setEditingProject(null);
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4">Loading profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const selectedAvatar = getSelectedAvatar(user);

  return (
    <div className="min-h-screen bg-neutral-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Profile Header - Compact Design */}
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl overflow-hidden mb-6">
          {/* Cover Banner - Cool geometric pattern */}
          <div className="h-32 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"></div>
            {/* Geometric shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl"></div>
            {/* Grid pattern */}
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,107,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>
          
          <div className="px-6 pb-6">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-start gap-4 -mt-16 mb-4">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full border-4 border-neutral-800 overflow-hidden bg-neutral-700 flex items-center justify-center shadow-xl">
                  {selectedAvatar ? (
                    <img src={selectedAvatar} alt={userInfo.username} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full cursor-pointer transition-opacity">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </label>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </div>

              <div className="flex-1 mt-14 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h1 className="text-2xl font-bold text-white">{userInfo.username}</h1>
                    <p className="text-sm text-gray-500">{userInfo.email}</p>
                  </div>
                </div>
                
                {userInfo.briefBio && (
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">{userInfo.briefBio}</p>
                )}

                {/* Stats Row */}
                <div className="flex flex-wrap gap-3 mt-6 items-center justify-between">
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      to="/profile/connections?tab=followers" 
                      className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-700/50 bg-neutral-800/30 hover:bg-neutral-700/50 hover:border-neutral-600 transition-all"
                    >
                    <span className="text-lg font-bold text-white group-hover:text-gray-100 transition-colors">{freshUserData?.followersCount || user?.followers?.length || 0}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider group-hover:text-gray-100 transition-colors flex items-center gap-1">
                        Followers
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                    <Link 
                      to="/profile/connections?tab=following" 
                      className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-700/50 bg-neutral-800/30 hover:bg-neutral-700/50 hover:border-neutral-600 transition-all"
                    >
                    <span className="text-lg font-bold text-white group-hover:text-gray-100 transition-colors">{freshUserData?.followingCount || user?.following?.length || 0}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider group-hover:text-gray-100 transition-colors flex items-center gap-1">
                        Following
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <span className="text-lg font-bold text-white">{userProjects.length}</span>
                      <span className="text-xs text-gray-400 uppercase tracking-wider">Projects</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <span className="text-lg font-bold text-white">{userThreads.length}</span>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Threads</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Right Side */}
                  <div className="flex flex-wrap gap-2">
                    <Link to="/profile/edit" className="px-4 py-2 bg-primary hover:bg-primary/90 border border-primary text-white text-sm font-medium rounded-lg transition-colors">
                      Edit Profile
                    </Link>
                    {(user?.id || user?._id) && (
                      <Link to={`/user/${user.id || user._id}?preview=true`} className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-700 border border-neutral-600 text-gray-300 text-sm font-medium rounded-lg transition-all">
                        View Public
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Left Column - About Section */}
          <div className="lg:col-span-3">
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">About</h2>
              </div>
              {isEditing ? (
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={editForm.username}
                        onChange={handleChange}
                        minLength={3}
                        maxLength={30}
                        className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={editForm.location}
                        onChange={handleChange}
                        maxLength={150}
                        placeholder="San Francisco, CA"
                        className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Brief Bio</label>
                    <textarea
                      name="briefBio"
                      value={editForm.briefBio}
                      onChange={handleChange}
                      rows="2"
                      maxLength={150}
                      placeholder="A short summary (max 150 characters)"
                      className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500 resize-none"
                    />
                    <span className="text-xs text-gray-500 mt-1 block">{editForm.briefBio.length}/150</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleChange}
                      rows="5"
                      maxLength={1500}
                      placeholder="Tell us about yourself, your experience, interests..."
                      className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500 resize-none"
                    />
                    <span className="text-xs text-gray-500 mt-1 block">{editForm.bio.length}/1500</span>
                  </div>

                  <div className="border-t border-neutral-700 pt-4 mt-6">
                    <h3 className="text-sm font-bold text-white mb-4">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Website</label>
                        <input
                          type="url"
                          name="website"
                          value={editForm.website}
                          onChange={handleChange}
                          maxLength={200}
                          placeholder="https://yoursite.com"
                          className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">GitHub</label>
                        <input
                          type="text"
                          name="github"
                          value={editForm.github}
                          onChange={handleChange}
                          maxLength={100}
                          placeholder="username"
                          className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Twitter</label>
                        <input
                          type="text"
                          name="twitter"
                          value={editForm.twitter}
                          onChange={handleChange}
                          maxLength={100}
                          placeholder="username"
                          className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">LinkedIn</label>
                        <input
                          type="text"
                          name="linkedin"
                          value={editForm.linkedin}
                          onChange={handleChange}
                          maxLength={100}
                          placeholder="username"
                          className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-neutral-700 mt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleSave}
                      disabled={loading}
                      loading={loading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  {!userInfo.bio && !userInfo.location && !userInfo.website && !userInfo.github && !userInfo.twitter && !userInfo.linkedin ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-neutral-700/50 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm font-medium mb-1">Complete your profile</p>
                      <p className="text-gray-600 text-xs">Add your bio, location, and social links</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {userInfo.bio && (
                        <div>
                          <p className="text-gray-400 text-sm leading-relaxed">{userInfo.bio}</p>
                        </div>
                      )}
                      
                      {/* Location & Website */}
                      {(userInfo.location || userInfo.website) && (
                        <div className="flex flex-wrap gap-4 pt-4 border-t border-neutral-700/50">
                          {userInfo.location && (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{userInfo.location}</span>
                            </div>
                          )}
                          {userInfo.website && (
                            <a href={userInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-gray-100 text-sm transition-colors">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              <span className="truncate">{userInfo.website.replace(/^https?:\/\//, '')}</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Social Links */}
                      {(userInfo.github || userInfo.twitter || userInfo.linkedin) && (
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-700/50">
                          {userInfo.github && (
                            <a href={`https://github.com/${userInfo.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-neutral-700/30 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-gray-400 hover:text-white text-sm transition-all">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                              GitHub
                            </a>
                          )}
                          {userInfo.twitter && (
                            <a href={`https://twitter.com/${userInfo.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-neutral-700/30 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-gray-400 hover:text-white text-sm transition-all">
                              <span className="text-base">𝕏</span>
                              Twitter
                            </a>
                          )}
                          {userInfo.linkedin && (
                            <a href={`https://linkedin.com/in/${userInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-neutral-700/30 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-gray-400 hover:text-white text-sm transition-all">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                              LinkedIn
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats Card */}
          <div>
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-5 sticky top-20">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-400">Projects</span>
                  <span className="text-lg font-bold text-gray-400">{userProjects.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-neutral-700/50">
                  <span className="text-sm text-gray-400">Threads</span>
                  <span className="text-lg font-bold text-gray-400">{userThreads.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-neutral-700/50">
                  <span className="text-sm text-gray-400">Reputation</span>
                  <span className="text-lg font-bold text-gray-400">{user?.reputation || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-neutral-700/50">
                  <span className="text-sm text-gray-400">Joined</span>
                  <span className="text-sm font-medium text-gray-400">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects & Threads Section */}
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl overflow-hidden">
          {/* Tab Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-700">
            <div className="flex gap-1">
              <Button
                variant={activeTab === 'projects' ? 'zinc_secondary_no_border' : 'ghost'}
                size="md"
                onClick={() => setActiveTab('projects')}
              >
                Projects
                <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-bold bg-black/20">{userProjects.length}</span>
              </Button>
              <Button
                variant={activeTab === 'threads' ? 'zinc_secondary_no_border' : 'ghost'}
                size="md"
                onClick={() => setActiveTab('threads')}
              >
                Threads
                <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-bold bg-black/20">{userThreads.length}</span>
              </Button>
            </div>
            {activeTab === 'projects' ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowProjectForm(true)}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                New Project
              </Button>
            ) : (
              <Button
                to="/community"
                variant="primary"
                size="md"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                New Thread
              </Button>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'projects' ? (
              projectsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 mt-4 text-sm">Loading projects...</p>
                </div>
              ) : userProjects.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-neutral-700/50 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No projects yet</h3>
                  <p className="text-gray-500 text-sm mb-6">Showcase your work by uploading your first project</p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowProjectForm(true)}
                  >
                    Upload Project
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {userProjects.map((project) => (
                    <ProjectCard 
                      key={project._id} 
                      project={project} 
                      showEditButton={true}
                      onEdit={handleEditProject}
                    />
                  ))}
                </div>
              )
            ) : (
              threadsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 mt-4 text-sm">Loading threads...</p>
                </div>
              ) : userThreads.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-neutral-700/50 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No threads yet</h3>
                  <p className="text-gray-500 text-sm mb-6">Start a discussion in the community</p>
                  <Link to="/community" className="inline-block px-5 py-2.5 bg-primary hover:bg-primary/90 border border-primary text-white text-sm font-medium rounded-lg transition-colors">
                    Go to Community
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {userThreads.map((thread) => (
                    <DiscussionCard key={thread._id} discussion={thread} />
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {showProjectForm && (
          <NewProjectForm
            onClose={() => setShowProjectForm(false)}
            onSuccess={fetchUserProjects}
          />
        )}

        {editingProject && (
          <EditProjectForm
            project={editingProject}
            onClose={handleCloseEditForm}
            onSuccess={fetchUserProjects}
          />
        )}
      </div>
    </div>
  );
}

export default Profile;
