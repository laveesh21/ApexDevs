import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tag, AuthorAvatar } from './ui';
import OptionsMenu from './OptionsMenu';

function ProjectCard({ project, showEditButton = false, onEdit, onDelete }) {
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
    <Link to={`/project/${projectId}`} className="relative bg-neutral-800 border-2 border-neutral-700 rounded-xl overflow-hidden hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all group block">
      <div className="flex gap-4 p-4">
        {/* Left: Image */}
        <div className="flex-shrink-0 w-64 h-40 overflow-hidden bg-neutral-700 rounded-lg">
          <img 
            src={thumbnail} 
            alt={project.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Right: Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-primary transition-colors flex-1 min-w-0">
              {project.title}
            </h3>
            
            {showEditButton && isAuthor && onEdit && onDelete && (
              <div onClick={(e) => e.preventDefault()}>
                <OptionsMenu
                  options={[
                    {
                      label: 'Edit',
                      onClick: (e) => {
                        e?.preventDefault();
                        onEdit(project);
                      },
                      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                    },
                    {
                      label: 'Delete',
                      onClick: (e) => {
                        e?.preventDefault();
                        onDelete(project._id || project.id);
                      },
                      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
                      danger: true
                    }
                  ]}
                />
              </div>
            )}
          </div>

          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {project.description}
          </p>

          <div className="flex items-center gap-3 mb-3" onClick={(e) => e.preventDefault()}>
            <AuthorAvatar 
              author={{ ...project.author, username: authorName, _id: authorId || project.author?._id, id: authorId || project.author?.id }}
              size="sm"
              clickable={!!authorId}
            />
          </div>

          <div className="flex flex-wrap gap-1.5 mt-auto">
            {technologies.map((tech, index) => (
              <Tag key={index} variant="primary" size="xs">
                {tech}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProjectCard;
