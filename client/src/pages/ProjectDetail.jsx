import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ImageCarousel from '../components/ImageCarousel';
import { projectAPI } from '../services/api';
import './ProjectDetail.css';

function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectAPI.getById(id);
      setProject(response.data);
    } catch (err) {
      console.error('Failed to fetch project:', err);
      setError('Project not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="project-detail-container">
        <div className="project-loading">
          <div className="loading-spinner"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-container">
        <div className="not-found">
          <h2>Project Not Found</h2>
          <p>The project you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="back-link">Back to Home</Link>
        </div>
      </div>
    );
  }

  // Prepare images array for carousel (thumbnail + additional images)
  // Filter out any undefined/null values
  const carouselImages = [
    project.thumbnail,
    ...(project.images || [])
  ].filter(Boolean);

  return (
    <div className="project-detail-container">
      <div className="project-detail-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <span>{project.title}</span>
        </div>

        {/* Main Content Grid */}
        <div className="detail-grid">
          {/* Left Column - Images and Description */}
          <div className="detail-main">
            {/* Image Carousel */}
            <ImageCarousel images={carouselImages} />

            {/* Description Section */}
            <section className="description-section">
              <h2>About This Project</h2>
              <div className="description-text">
                <p>{project.description}</p>
              </div>
            </section>

            {/* Tech Stack Section */}
            <section className="tech-stack-section">
              <h2>Technologies Used</h2>
              <div className="tech-tags">
                {project.technologies?.map((tech, index) => (
                  <span key={index} className="tech-tag">{tech}</span>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="detail-sidebar">
            {/* Project Info Card */}
            <div className="info-card">
              <h3>{project.title}</h3>
              <p className="short-description">{project.description}</p>

              {/* Author Info */}
              <div className="author-section">
                <h4>Created By</h4>
                <div className="author-info">
                  <img 
                    src={project.author?.avatar || 'https://ui-avatars.com/api/?background=00be62&color=fff&name=' + project.author?.username} 
                    alt={project.author?.username}
                    className="author-avatar"
                  />
                  <div className="author-details">
                    <span className="author-name">{project.author?.username || 'Unknown'}</span>
                    {project.author?.bio && (
                      <span className="author-bio">{project.author.bio}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Stats */}
              <div className="stats-section">
                <div className="stat-item">
                  <span className="stat-label">Status</span>
                  <span className={`stat-value status-${project.status?.toLowerCase().replace(' ', '-')}`}>
                    {project.status || 'Completed'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Category</span>
                  <span className="stat-value">{project.category || 'Other'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Likes</span>
                  <span className="stat-value">{project.likes?.length || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Views</span>
                  <span className="stat-value">{project.views || 0}</span>
                </div>
              </div>

              {/* Links Section */}
              <div className="links-section">
                <h4>Project Links</h4>
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="link-button demo">
                    <span className="icon">🌐</span>
                    Live Demo
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="link-button github">
                    <span className="icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </span>
                    Source Code
                  </a>
                )}
              </div>

              {/* Project Meta Info */}
              <div className="meta-info">
                <h4>Project Info</h4>
                <div className="meta-item">
                  <span className="meta-label">Created:</span>
                  <span className="meta-value">
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {project.updatedAt && (
                  <div className="meta-item">
                    <span className="meta-label">Last Updated:</span>
                    <span className="meta-value">
                      {new Date(project.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
