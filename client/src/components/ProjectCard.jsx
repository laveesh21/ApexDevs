import { Link } from 'react-router-dom';
import './ProjectCard.css';

function ProjectCard({ project }) {
  // Handle both old mock data structure and new API data structure
  const thumbnail = project.thumbnail || project.image;
  const technologies = project.technologies || project.techStack || [];
  const authorName = project.author?.username || project.author || 'Unknown';
  const projectId = project._id || project.id;
  
  return (
    <div className="project-card">
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
