import { Tag, AuthorAvatar, StatCard } from './ui';

function ProjectSidebar({ project, reviewStats }) {
  return (
    <div className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-6 sticky top-24">
      {/* Project Title & Description */}
      <div className="mb-6 pb-6 border-b border-neutral-700">
        <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{project.briefDescription}</p>
      </div>

      {/* Project Links */}
      <div className="space-y-4 mb-6">
        {project.demoUrl && (
          <a 
            href={project.demoUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Live Demo
          </a>
        )}
        {project.githubUrl && (
          <a 
            href={project.githubUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 text-gray-300 font-semibold rounded-xl transition-all group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Source Code
          </a>
        )}
        {!project.demoUrl && !project.githubUrl && (
          <div className="text-center py-8 bg-neutral-800 border border-neutral-700 rounded-xl">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="text-gray-500 font-medium">No External Links</p>
            <p className="text-gray-600 text-sm mt-1">Links may be added later</p>
          </div>
        )}
      </div>

      {/* Project Metadata */}
      <div className="mt-6 pt-6 border-t border-neutral-700">
        <div className="space-y-5">
          {/* Built With Section */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Built With</h4>
            <div className="flex flex-wrap gap-2">
              {project.technologies?.map((tech, index) => (
                <Tag key={index} variant="primary">{tech}</Tag>
              ))}
            </div>
          </div>

          {/* Author Section */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Created By</h4>
            {project.author ? (
              <AuthorAvatar
                author={project.author}
                size="lg"
                subtitle={project.author?.role || 'Developer'}
              />
            ) : (
              <div className="text-gray-400">Unknown Author</div>
            )}
          </div>

          {/* Project Stats Grid */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Project Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                label="Status"
                value={project.status || 'Completed'}
                valueColor={
                  project.status?.toLowerCase() === 'completed' ? 'text-green-400' :
                  project.status?.toLowerCase() === 'in progress' ? 'text-yellow-400' :
                  'text-blue-400'
                }
              />
              <StatCard
                icon={
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
                label="Category"
                value={project.category || 'Other'}
                valueColor="text-gray-200"
              />
              <StatCard
                icon={
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                }
                label="Views"
                value={project.views || 0}
              />
              <StatCard
                icon={
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                }
                label="Helpful"
                value={reviewStats.likes || 0}
              />
            </div>
          </div>

          {/* Date Info */}
          <div className="pt-4 border-t border-neutral-700">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-300 font-medium">
                  {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {project.updatedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-gray-500">Updated:</span>
                  <span className="text-gray-300 font-medium">
                    {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectSidebar;
