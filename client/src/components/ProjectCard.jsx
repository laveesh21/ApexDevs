import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProjectCard({ project, showEditButton = false, onEdit }) {
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
    <div className="relative bg-dark-800 border border-dark-600 rounded-xl overflow-hidden hover:border-primary/50 transition-all group">
      {showEditButton && isAuthor && (
        <button 
          className="absolute top-3 right-3 z-10 p-2 bg-dark-900/80 text-primary rounded-lg hover:bg-dark-900 hover:text-primary-light transition-colors" 
          onClick={() => onEdit(project)} 
          title="Edit Project"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      )}
      <div className="aspect-video overflow-hidden bg-dark-700">
        <img 
          src={thumbnail} 
          alt={project.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{project.title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <span>By:</span> 
          {authorId ? (
            <Link 
              to={`/user/${authorId}`} 
              className="text-primary hover:text-primary-light transition-colors font-medium"
            >
              {authorName}
            </Link>
          ) : (
            <span className="font-medium">{authorName}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.map((tech, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded text-xs font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="pt-4 border-t border-dark-600">
          <Link 
            to={`/project/${projectId}`} 
            className="block w-full text-center px-4 py-2 bg-primary text-dark-900 rounded-lg font-medium hover:bg-primary-light transition-colors"
          >
            View Project
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
