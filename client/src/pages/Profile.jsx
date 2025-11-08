import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, projectAPI, threadAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import DiscussionCard from '../components/DiscussionCard';
import NewProjectForm from '../components/NewProjectForm';
import EditProjectForm from '../components/EditProjectForm';
import './Profile.css';

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
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    github: '',
    twitter: '',
    linkedin: ''
  });

  const [editForm, setEditForm] = useState(userInfo);

  const fetchUserProjects = useCallback(async () => {
    if (!user?._id) return;
    
    setProjectsLoading(true);
    try {
      const response = await projectAPI.getUserProjects(user._id);
      setUserProjects(response.data || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      // Set empty array on error to prevent undefined issues
      setUserProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, [user?._id]);

  const fetchUserThreads = useCallback(async () => {
    if (!user?._id) return;
    
    setThreadsLoading(true);
    try {
      const response = await threadAPI.getUserThreads(user._id);
      setUserThreads(response.data || []);
    } catch (err) {
      console.error('Failed to fetch threads:', err);
      setUserThreads([]);
    } finally {
      setThreadsLoading(false);
    }
  }, [user?._id]);

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
    }
  }, [user, isAuthenticated, authLoading, navigate, fetchUserProjects, fetchUserThreads]);

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
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <img 
                src={user?.avatar || 'https://ui-avatars.com/api/?background=00be62&color=fff&name=' + userInfo.username} 
                alt={userInfo.username}
              />
              {uploadingAvatar && (
                <div className="avatar-uploading-overlay">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
            <label htmlFor="avatar-upload" className="avatar-upload-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Change Avatar
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
          <div className="profile-header-info">
            <h1>{userInfo.username}</h1>
            <p className="profile-email">{userInfo.email}</p>
          </div>
          {!isEditing && (
            <button className="edit-profile-btn" onClick={handleEdit}>
              Edit Profile
            </button>
          )}
        </div>

        {error && <div className="profile-error">{error}</div>}

        <div className="profile-grid">
          {/* Left Column - Profile Info */}
          <div className="profile-main">
            <div className="profile-section">
              <h2>About</h2>
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={editForm.username}
                      onChange={handleChange}
                      minLength={3}
                      maxLength={30}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleChange}
                      rows="4"
                      maxLength={500}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={editForm.website}
                      onChange={handleChange}
                      maxLength={200}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>GitHub Username</label>
                    <input
                      type="text"
                      name="github"
                      value={editForm.github}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="yourusername"
                    />
                  </div>
                  <div className="form-group">
                    <label>Twitter Username</label>
                    <input
                      type="text"
                      name="twitter"
                      value={editForm.twitter}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="yourusername"
                    />
                  </div>
                  <div className="form-group">
                    <label>LinkedIn Username</label>
                    <input
                      type="text"
                      name="linkedin"
                      value={editForm.linkedin}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="yourusername"
                    />
                  </div>
                  <div className="edit-actions">
                    <button 
                      className="save-btn" 
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      className="cancel-btn" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-info">
                  {!userInfo.bio && !userInfo.location && !userInfo.website && !userInfo.github && !userInfo.twitter && !userInfo.linkedin ? (
                    <div className="empty-profile-state">
                      <div className="empty-icon">👤</div>
                      <p className="empty-message">Your profile looks a bit empty!</p>
                      <p className="empty-hint">Click "Edit Profile" to add your bio, location, and social links.</p>
                    </div>
                  ) : (
                    <>
                      <p className="bio">{userInfo.bio || 'No bio added yet.'}</p>
                      {userInfo.location && (
                        <div className="info-item">
                          <span className="info-icon">📍</span>
                          <span>{userInfo.location}</span>
                        </div>
                      )}
                      {userInfo.website && (
                        <div className="info-item">
                          <span className="info-icon">🌐</span>
                          <a href={userInfo.website} target="_blank" rel="noopener noreferrer">
                            {userInfo.website}
                          </a>
                        </div>
                      )}
                      {userInfo.github && (
                        <div className="info-item">
                          <span className="info-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                          </span>
                          <a href={`https://github.com/${userInfo.github}`} target="_blank" rel="noopener noreferrer">
                            GitHub Profile
                          </a>
                        </div>
                      )}
                      {userInfo.twitter && (
                        <div className="info-item">
                          <span className="info-icon">𝕏</span>
                          <a href={`https://twitter.com/${userInfo.twitter}`} target="_blank" rel="noopener noreferrer">
                            Twitter Profile
                          </a>
                        </div>
                      )}
                      {userInfo.linkedin && (
                        <div className="info-item">
                          <span className="info-icon">💼</span>
                          <a href={`https://linkedin.com/in/${userInfo.linkedin}`} target="_blank" rel="noopener noreferrer">
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="profile-sidebar">
            <div className="stats-card">
              <h3>Statistics</h3>
              <div className="stat-row">
                <span className="stat-label">Projects</span>
                <span className="stat-value">{userProjects.length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Threads</span>
                <span className="stat-value">{userThreads.length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Reputation</span>
                <span className="stat-value">{user?.reputation || 0}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="profile-section">
          <div className="tabs-header">
            <div className="tabs-navigation">
              <button 
                className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                <span>📁 Projects</span>
                <span className="tab-count">{userProjects.length}</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'threads' ? 'active' : ''}`}
                onClick={() => setActiveTab('threads')}
              >
                <span>💬 Threads</span>
                <span className="tab-count">{userThreads.length}</span>
              </button>
            </div>
            {activeTab === 'projects' && (
              <button className="upload-project-btn" onClick={() => setShowProjectForm(true)}>
                + Upload Project
              </button>
            )}
          </div>

          {activeTab === 'projects' ? (
            projectsLoading ? (
              <div className="content-loading">
                <div className="loading-spinner"></div>
                <p>Loading projects...</p>
              </div>
            ) : userProjects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h3>No projects yet</h3>
                <p>Upload your first project to showcase your work!</p>
                <button className="primary-btn" onClick={() => setShowProjectForm(true)}>
                  Upload Your First Project
                </button>
              </div>
            ) : (
              <div className="projects-grid">
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
              <div className="content-loading">
                <div className="loading-spinner"></div>
                <p>Loading threads...</p>
              </div>
            ) : userThreads.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>No threads yet</h3>
                <p>Start a discussion in the community to see your threads here!</p>
                <Link to="/community" className="primary-btn">
                  Go to Community
                </Link>
              </div>
            ) : (
              <div className="threads-list">
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
