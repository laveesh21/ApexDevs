import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tag, AuthorAvatar } from './ui';

function ProjectCardMobile({ project, showEditButton = false, onEdit }) {
  const { user: currentUser } = useAuth();
  
  // Handle both old mock data structure and new API data structure
  const thumbnail = project.thumbnail || project.image;
  const technologies = project.technologies || project.techStack || [];
  const authorName = project.author?.username || project.author || 'Unknown';
  const authorId = project.author?._id || project.author?.id;
  const projectId = project._id || project.id;
  
  // Check if current user is the author
  const isAuthor = currentUser && authorId && (
    currentUser._id === authorId || 
    currentUser.id === authorId ||
    currentUser._id === project.author?.id ||
    currentUser.id === project.author?._id
  );
  
  return (
    <div className="relative bg-neutral-800 border border-neutral-600 rounded-lg overflow-hidden hover:border-primary/50 transition-all group flex flex-col">
      {showEditButton && isAuthor && (
        <button 
          className="absolute top-2 right-2 z-10 p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 hover:border-neutral-500 rounded-md shadow-lg hover:shadow-xl transition-all" 
          onClick={() => onEdit(project)} 
          title="Edit Project"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      )}
      <Link to={`/project/${projectId}`} className="h-30 overflow-hidden bg-neutral-700 block">
        <img 
          src={thumbnail} 
          alt={project.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          <Link to={`/project/${projectId}`}>
            <h3 className="text-xs font-bold text-white mb-0.5 line-clamp-1 hover:text-primary transition-colors">{project.title}</h3>
          </Link>
          <p className="text-gray-400 text-[10px] mb-1 line-clamp-3 h-10 overflow-hidden">{project.description}</p>
          <div className="mt-auto">
            <div className="mb-1 flex items-center gap-2">
              <AuthorAvatar 
                author={{ ...project.author, username: authorName, _id: authorId || project.author?._id, id: authorId || project.author?.id }}
                size="xs"
                clickable={!!authorId}
                className="inline-flex"
              />
            </div>
            <div className="flex flex-wrap gap-0.5">
              {technologies.map((tech, index) => (
                <Tag key={index} variant="primary" size="xxs">
                  {tech}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectCardMobile;
