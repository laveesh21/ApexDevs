import { Link } from 'react-router-dom';
import './ProjectCard.css';

function ProjectCard({ project, showEditButton = false, onEdit }) {
  // Handle both old mock data structure and new API data structure
  const thumbnail = project.thumbnail || project.image;
  const technologies = project.technologies || project.techStack || [];
  const authorName = project.author?.username || project.author || 'Unknown';
  const projectId = project._id || project.id;
  
  return (
    <div className="project-card">
      {showEditButton && (
        <button className="project-edit-btn" onClick={() => onEdit(project)} title="Edit Project">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      )}
      <div className="project-image">
        <img src={thumbnail} alt={project.title} />
      </div>
      <div className="project-content">
        <h3 className="project-title">{project.title}</h3>
        <p className="project-description">{project.description}</p>
        <div className="project-author">
          <span className="author-label">By:</span> {authorName}
        </div>
        <div className="project-tech">
          {technologies.map((tech, index) => (
            <span key={index} className="tech-tag">{tech}</span>
          ))}
        </div>
        <div className="project-footer">
          <Link to={`/project/${projectId}`} className="view-button">View Project</Link>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
