import { Link } from 'react-router-dom';
import { getSelectedAvatar } from '../utils/avatarHelper';
import Button from './ui/Button';
import DiscussionCard from './DiscussionCard';
import ProjectCardMobile from './ProjectCardMobile';
import locationIcon from '../assets/location_icon.svg';
import websiteIcon from '../assets/website.svg';
import linkedinIcon from '../assets/linkedin.svg';

function ProfileMobile({ 
  user, 
  freshUserData, 
  userInfo,
  activeTab,
  setActiveTab,
  projectsLoading,
  threadsLoading,
  userProjects,
  userThreads,
  handleEditProject,
  setShowProjectForm,
  navigate,
  handleAvatarChange,
  uploadingAvatar
}) {
  const avatarSrc = user?.avatar 
    ? (user.avatar.startsWith('http') ? user.avatar : getSelectedAvatar(user.avatar))
    : getSelectedAvatar('avatar1');

  const followerCount = freshUserData?.followers?.length || user?.followers?.length || 0;
  const followingCount = freshUserData?.following?.length || user?.following?.length || 0;

  // Get the displayed avatar based on preference
  const displayedAvatar = user?.identicon || user?.avatar 
    ? (user.avatarPreference === 'custom' && user.avatar ? user.avatar : user.identicon)
    : avatarSrc;

  return (
    <div className="md:hidden bg-neutral-900 min-h-screen">
      {/* Profile Header - Banner Style */}
      <div className="bg-neutral-800/50 border-b border-neutral-700 rounded-b-xl overflow-hidden">
        {/* Cover Banner - Geometric pattern like desktop */}
        <div className="h-24 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"></div>
          {/* Geometric shapes */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
          {/* Grid pattern */}
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,107,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </div>
        
        <div className="px-4 pb-4">
          {/* Avatar & Basic Info */}
          <div className="flex items-start gap-3 -mt-12 mb-3">
            {/* Avatar - Overlapping banner with upload */}
            <div className="relative group flex-shrink-0">
              <div className="w-20 h-20 rounded-full border-4 border-neutral-800 overflow-hidden bg-neutral-700 flex items-center justify-center shadow-xl">
                {displayedAvatar ? (
                  <img src={displayedAvatar} alt={user?.username || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <label htmlFor="avatar-upload-mobile" className="absolute inset-0 bg-black/60 opacity-0 active:opacity-100 flex items-center justify-center rounded-full cursor-pointer transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </label>
              <input
                type="file"
                id="avatar-upload-mobile"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </div>

            {/* Username & Email */}
            <div className="flex-1 mt-10">
              <h1 className="text-lg font-bold text-white">{user?.username || 'User'}</h1>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Brief Bio */}
          {userInfo.briefBio && (
            <p className="text-gray-400 text-xs mb-3 leading-relaxed">{userInfo.briefBio}</p>
          )}

          {/* Stats Row */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Link 
              to="/profile/connections?tab=followers" 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-700/50 bg-neutral-800/30"
            >
              <span className="text-base font-bold text-white">{followerCount}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wide">Followers</span>
            </Link>
            <Link 
              to="/profile/connections?tab=following" 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-700/50 bg-neutral-800/30"
            >
              <span className="text-base font-bold text-white">{followingCount}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wide">Following</span>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/profile/edit')}
              className="flex-1"
            >
              Edit Profile
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/user/${user._id || user.id}?preview=true`)}
              className="flex-1"
            >
              View Public
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - About & Stats Full Width */}
      <div className="p-4 space-y-4">
        {/* About Section - Full Width */}
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
              <h2 className="text-sm font-bold text-white mb-3">About</h2>
              
              {!userInfo.briefBio && !userInfo.bio && !userInfo.location && !userInfo.website && !userInfo.linkedin ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-neutral-700/50 flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400 font-medium">Complete your profile</p>
                  <p className="text-xs text-gray-500 mt-1">Add your bio, location and social links</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userInfo.bio && (
                    <p className="text-sm text-gray-400 leading-relaxed">{userInfo.bio}</p>
                  )}

                  {/* Location & Website */}
                  {(userInfo.location || userInfo.website) && (
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-neutral-700/50">
                      {userInfo.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{userInfo.location}</span>
                        </div>
                      )}
                      
                      {userInfo.website && (
                        <a 
                          href={userInfo.website.startsWith('http') ? userInfo.website : `https://${userInfo.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100 transition-colors"
                        >
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
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-700/50">
                      {userInfo.github && (
                        <a 
                          href={`https://github.com/${userInfo.github}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-700/30 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-gray-400 hover:text-white text-xs transition-all"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          GitHub
                        </a>
                      )}
                      {userInfo.twitter && (
                        <a 
                          href={`https://twitter.com/${userInfo.twitter}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-700/30 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-gray-400 hover:text-white text-xs transition-all"
                        >
                          <span className="text-sm">𝕏</span>
                          Twitter
                        </a>
                      )}
                      {userInfo.linkedin && (
                        <a 
                          href={`https://linkedin.com/in/${userInfo.linkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-700/30 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-gray-400 hover:text-white text-xs transition-all"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
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

        {/* Stats Section - Full Width */}
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-gray-400">Projects</span>
                  <span className="text-base font-bold text-gray-400">{userProjects.length}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-t border-neutral-700/50">
                  <span className="text-sm text-gray-400">Threads</span>
                  <span className="text-base font-bold text-gray-400">{userThreads.length}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-t border-neutral-700/50">
                  <span className="text-sm text-gray-400">Reputation</span>
                  <span className="text-base font-bold text-gray-400">{user?.reputation || 0}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-t border-neutral-700/50">
                  <span className="text-sm text-gray-400">Joined</span>
                  <span className="text-sm font-medium text-gray-400">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>
        </div>
      </div>

      {/* Projects & Threads Section */}
      <div className="bg-neutral-800/50 border-t border-neutral-700">
        {/* Tab Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'projects'
                  ? 'bg-neutral-700/50 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Projects
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-bold bg-black/20">{userProjects.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('threads')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'threads'
                  ? 'bg-neutral-700/50 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Threads
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-bold bg-black/20">{userThreads.length}</span>
            </button>
          </div>
          {activeTab === 'projects' ? (
            <Button
              variant="primary"
              size="xs"
              onClick={() => setShowProjectForm(true)}
              icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
            >
              New
            </Button>
          ) : (
            <Button
              variant="primary"
              size="xs"
              onClick={() => navigate('/community')}
              icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
            >
              New
            </Button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-4">{activeTab === 'projects' ? (
          projectsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-3 text-sm">Loading projects...</p>
            </div>
          ) : userProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-neutral-700/50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white mb-2">No projects yet</h3>
              <p className="text-gray-500 text-sm mb-5">Showcase your work by uploading your first project</p>
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowProjectForm(true)}
              >
                Upload Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {userProjects.map((project) => (
                <ProjectCardMobile 
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
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-3 text-sm">Loading threads...</p>
            </div>
          ) : userThreads.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-neutral-700/50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white mb-2">No threads yet</h3>
              <p className="text-gray-500 text-sm mb-5">Start a discussion in the community</p>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/community')}
              >
                Go to Community
              </Button>
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
    </div>
  );
}

export default ProfileMobile;
