import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tag, Button, AuthorAvatar } from './ui';

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
    <div className="relative bg-neutral-800 border border-neutral-600 rounded-xl overflow-hidden hover:border-primary/50 transition-all group">
      {showEditButton && isAuthor && (
        <button 
          className="absolute top-3 right-3 z-10 p-2.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 hover:border-neutral-500 rounded-lg shadow-lg hover:shadow-xl transition-all" 
          onClick={() => onEdit(project)} 
          title="Edit Project"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      )}
      <div className="aspect-video overflow-hidden bg-neutral-700">
        <img 
          src={thumbnail} 
          alt={project.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-1">{project.title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[5rem]">{project.description}</p>
        <div className="mb-4">
          <AuthorAvatar 
            author={{ ...project.author, username: authorName, _id: authorId || project.author?._id, id: authorId || project.author?.id }}
            size="sm"
            clickable={!!authorId}
            className="inline-flex"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.map((tech, index) => (
            <Tag key={index} variant="primary" size="xs">
              {tech}
            </Tag>
          ))}
        </div>
        <div className="pt-1">
          <Button to={`/project/${projectId}`} variant="outline" size="md" fullWidth> View Project </Button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
