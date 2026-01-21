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
    <div className="relative bg-neutral-800 border border-neutral-600 rounded-lg sm:rounded-xl overflow-hidden hover:border-primary/50 transition-all group flex flex-col">
      {showEditButton && isAuthor && (
        <button 
          className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 p-1.5 sm:p-2 md:p-2.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 hover:border-neutral-500 rounded-md sm:rounded-lg shadow-lg hover:shadow-xl transition-all" 
          onClick={() => onEdit(project)} 
          title="Edit Project"
        >
          <svg width="12" height="12" className="sm:w-14 sm:h-14 md:w-16 md:h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      )}
      <div className="aspect-[3/2] sm:aspect-[16/10] md:aspect-video overflow-hidden bg-neutral-700">
        <img 
          src={thumbnail} 
          alt={project.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-1.5 sm:p-3 md:p-4 lg:p-5 flex flex-col h-full">
        <div className="flex-1 flex flex-col">
          <h3 className="text-xs sm:text-base md:text-lg lg:text-xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2 line-clamp-1">{project.title}</h3>
          <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-2 md:mb-3 lg:mb-4 line-clamp-2">{project.description}</p>
          <div className="mt-auto">
            <div className="mb-0.5">
              <AuthorAvatar 
                author={{ ...project.author, username: authorName, _id: authorId || project.author?._id, id: authorId || project.author?.id }}
                size="xs"
                clickable={!!authorId}
                className="inline-flex"
              />
            </div>
            <div className="flex flex-wrap gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2">
              {technologies.map((tech, index) => (
                <Tag key={index} variant="primary" size="xxs" className="sm:text-[10px] md:text-xs">
                  {tech}
                </Tag>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-1 sm:mt-2">
          <Button to={`/project/${projectId}`} variant="outline" size="xs" className="py-0.5 sm:py-1 md:py-1.5 text-[10px] sm:text-xs md:text-sm" fullWidth> View Project </Button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
