import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, projectAPI, threadAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import DiscussionCard from '../components/DiscussionCard';
import NewProjectForm from '../components/NewProjectForm';
import EditProjectForm from '../components/EditProjectForm';
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

  const fetchUserProjects = useCallback(async () => {
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
  }, [user?._id, user?.id]);

  const fetchUserThreads = useCallback(async () => {
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
  }, [user?._id, user?.id]);

  const fetchFreshUserData = useCallback(async () => {
    const userId = user?._id || user?.id;
    if (!userId || !token) return;
    
    try {
      const response = await authAPI.getUserProfile(userId, token);
      setFreshUserData(response.data);
    } catch (err) {
      console.error('Failed to fetch fresh user data:', err);
    }
  }, [user?._id, user?.id, token]);

  useEffect(() => {
    // Wait for auth to finish loading before redirecting
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

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
      
      // Fetch user's projects and threads
      fetchUserProjects();
      fetchUserThreads();
      fetchFreshUserData();
    }
  }, [user, isAuthenticated, navigate, authLoading, fetchUserProjects, fetchUserThreads, fetchFreshUserData]);

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
    <div className="min-h-screen bg-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Profile Header */}
        <div className="bg-neutral-800 border border-neutral-600 rounded-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-neutral-600 overflow-hidden bg-neutral-700 flex items-center justify-center">
                  {selectedAvatar ? (
                    <img src={selectedAvatar} alt={userInfo.username} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
              <label htmlFor="avatar-upload" className="mt-3 flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 hover:border-primary/50 text-gray-300 rounded-lg cursor-pointer transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span className="text-sm font-medium">Change Avatar</span>
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
                disabled={uploadingAvatar}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-100 mb-1">{userInfo.username}</h1>
              <p className="text-gray-400 text-sm mb-3">{userInfo.email}</p>
              {userInfo.briefBio && (
                <p className="text-gray-300 mb-4 max-w-2xl">{userInfo.briefBio}</p>
              )}
              <div className="flex gap-6 mt-4">
                <Link to="/profile/connections?tab=followers" className="flex flex-col items-center hover:text-primary transition-colors group">
                  <span className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">{freshUserData?.followersCount || user?.followers?.length || 0}</span>
                  <span className="text-sm text-gray-400 group-hover:text-primary">Followers</span>
                </Link>
                <Link to="/profile/connections?tab=following" className="flex flex-col items-center hover:text-primary transition-colors group">
                  <span className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">{freshUserData?.followingCount || user?.following?.length || 0}</span>
                  <span className="text-sm text-gray-400 group-hover:text-primary">Following</span>
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link to="/profile/edit" className="px-6 py-2 bg-primary hover:bg-primary-light text-neutral-900 font-medium rounded-lg transition-colors text-center">
                Edit Profile
              </Link>
              {(user?.id || user?._id) && (
                <Link to={`/user/${user.id || user._id}?preview=true`} className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 hover:border-primary/50 text-gray-300 font-medium rounded-lg transition-all text-center">
                  View Public Profile
                </Link>
              )}
            </div>
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-800 border border-neutral-600 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-100 mb-4">About</h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={editForm.username}
                      onChange={handleChange}
                      minLength={3}
                      maxLength={30}
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleChange}
                      rows="4"
                      maxLength={1500}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <small className="text-xs text-gray-500">{editForm.bio.length}/1500</small>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Brief Bio</label>
                    <textarea
                      name="briefBio"
                      value={editForm.briefBio}
                      onChange={handleChange}
                      rows="2"
                      maxLength={150}
                      placeholder="A short summary (max 150 characters)"
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <small className="text-xs text-gray-500">{editForm.briefBio.length}/150</small>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleChange}
                      maxLength={150}
                      placeholder="e.g., San Francisco, CA"
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={editForm.website}
                      onChange={handleChange}
                      maxLength={200}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">GitHub Username</label>
                    <input
                      type="text"
                      name="github"
                      value={editForm.github}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="yourusername"
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Twitter Username</label>
                    <input
                      type="text"
                      name="twitter"
                      value={editForm.twitter}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="yourusername"
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn Username</label>
                    <input
                      type="text"
                      name="linkedin"
                      value={editForm.linkedin}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="yourusername"
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      className="px-6 py-2 bg-primary hover:bg-primary-light text-neutral-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 text-gray-300 font-medium rounded-lg transition-colors disabled:opacity-50"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {!userInfo.bio && !userInfo.location && !userInfo.website && !userInfo.github && !userInfo.twitter && !userInfo.linkedin ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">👤</div>
                      <p className="text-gray-300 font-medium mb-2">Your profile looks a bit empty!</p>
                      <p className="text-gray-500 text-sm">Click "Edit Profile" to add your bio, location, and social links.</p>
                    </div>
                  ) : (
                    <>
                      {userInfo.bio && (
                        <div className="mb-6">
                          <p className="text-gray-300 leading-relaxed">{userInfo.bio}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userInfo.location && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <img src={locationIcon} alt="location" className="w-5 h-5 opacity-70" />
                            <span className="text-gray-300">{userInfo.location}</span>
                          </div>
                        )}
                        {userInfo.website && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <img src={websiteIcon} alt="website" className="w-5 h-5 opacity-70" />
                            <a href={userInfo.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors truncate">
                              {userInfo.website}
                            </a>
                          </div>
                        )}
                        {userInfo.github && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <span className="text-gray-400">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                            </span>
                            <a href={`https://github.com/${userInfo.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                              GitHub
                            </a>
                          </div>
                        )}
                        {userInfo.twitter && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <span className="text-gray-400 text-xl">𝕏</span>
                            <a href={`https://twitter.com/${userInfo.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                              Twitter
                            </a>
                          </div>
                        )}
                        {userInfo.linkedin && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <img src={linkedinIcon} alt="LinkedIn" className="w-5 h-5 opacity-70" />
                            <a href={`https://linkedin.com/in/${userInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                              LinkedIn
                            </a>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats */}
          <div>
            <div className="bg-neutral-800 border border-neutral-600 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-100 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-neutral-600">
                  <span className="text-gray-400">Projects</span>
                  <span className="text-lg font-bold text-primary">{userProjects.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-600">
                  <span className="text-gray-400">Threads</span>
                  <span className="text-lg font-bold text-primary">{userThreads.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-600">
                  <span className="text-gray-400">Reputation</span>
                  <span className="text-lg font-bold text-primary">{user?.reputation || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-sm font-medium text-gray-300">
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

        {/* Projects Section */}
        <div className="bg-neutral-800 border border-neutral-600 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex gap-2">
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'projects' 
                    ? 'bg-primary text-neutral-900' 
                    : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600 hover:text-gray-100'
                }`}
                onClick={() => setActiveTab('projects')}
              >
                <span className="mr-2">📁</span>
                <span>Projects</span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-900/30 text-gray-300">{userProjects.length}</span>
              </button>
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'threads' 
                    ? 'bg-primary text-neutral-900' 
                    : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600 hover:text-gray-100'
                }`}
                onClick={() => setActiveTab('threads')}
              >
                <span className="mr-2">💬</span>
                <span>Threads</span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-900/30 text-gray-300">{userThreads.length}</span>
              </button>
            </div>
            {activeTab === 'projects' && (
              <button className="px-4 py-2 bg-primary hover:bg-primary-light text-neutral-900 font-medium rounded-lg transition-colors" onClick={() => setShowProjectForm(true)}>
                + Upload Project
              </button>
            )}
          </div>

          {activeTab === 'projects' ? (
            projectsLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 mt-4">Loading projects...</p>
              </div>
            ) : userProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">No projects yet</h3>
                <p className="text-gray-400 mb-6">Upload your first project to showcase your work!</p>
                <button className="px-6 py-3 bg-primary hover:bg-primary-light text-neutral-900 font-medium rounded-lg transition-colors" onClick={() => setShowProjectForm(true)}>
                  Upload Your First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 mt-4">Loading threads...</p>
              </div>
            ) : userThreads.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">No threads yet</h3>
                <p className="text-gray-400 mb-6">Start a discussion in the community to see your threads here!</p>
                <Link to="/community" className="inline-block px-6 py-3 bg-primary hover:bg-primary-light text-neutral-900 font-medium rounded-lg transition-colors">
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
