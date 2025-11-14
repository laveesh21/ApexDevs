import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import './NewProjectForm.css';

const CATEGORIES = ['Web App', 'Mobile App', 'Desktop App', 'Game', 'AI/ML', 'DevTools', 'Other'];
const STATUSES = ['In Progress', 'Completed', 'Maintained'];

const EditProjectForm = ({ project, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    briefDescription: '',
    category: 'Web App',
    status: 'Completed',
    demoUrl: '',
    githubUrl: '',
    technologies: [],
  });
  const [techInput, setTechInput] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        briefDescription: project.briefDescription || '',
        category: project.category || 'Web App',
        status: project.status || 'Completed',
        demoUrl: project.demoUrl || '',
        githubUrl: project.githubUrl || '',
        technologies: project.technologies || [],
      });
      setThumbnailPreview(project.thumbnail || null);
      setImagePreviews(project.images || []);
    }
  }, [project]);

  // Don't render if project is not provided
  if (!project) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Thumbnail must be less than 10MB');
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const currentImageCount = imagePreviews.filter(img => !removedImages.includes(img)).length;
    
    if (files.length + images.length + currentImageCount > 5) {
      setError('You can upload a maximum of 5 additional images');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError('Each image must be less than 10MB');
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setError('');
  };

  const removeExistingImage = (imageUrl) => {
    setRemovedImages(prev => [...prev, imageUrl]);
    setImagePreviews(prev => prev.filter(img => img !== imageUrl));
  };

  const removeNewImage = (index) => {
    const adjustedIndex = index - (project?.images?.length || 0) + removedImages.length;
    setImages(prev => prev.filter((_, i) => i !== adjustedIndex));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addTechnology = () => {
    const tech = techInput.trim();
    if (tech && !formData.technologies.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech]
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formData.briefDescription.trim()) {
      setError('Brief description is required');
      return;
    }

    if (formData.technologies.length === 0) {
      setError('At least one technology is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('briefDescription', formData.briefDescription);
      submitData.append('category', formData.category);
      submitData.append('status', formData.status);
      submitData.append('demoUrl', formData.demoUrl);
      submitData.append('githubUrl', formData.githubUrl);
      submitData.append('technologies', JSON.stringify(formData.technologies));

      if (thumbnail) {
        submitData.append('thumbnail', thumbnail);
      }

      images.forEach(image => {
        submitData.append('images', image);
      });

      if (removedImages.length > 0) {
        submitData.append('removedImages', JSON.stringify(removedImages));
      }

      // Pass token, project ID, and submitData
      await projectAPI.update(token, project._id, submitData);

      if (onSuccess) {
        await onSuccess();
      }
      
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Project</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Project Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your project in detail..."
              rows="5"
              minLength={10}
              maxLength={2000}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="briefDescription">Brief Description *</label>
            <textarea
              id="briefDescription"
              name="briefDescription"
              value={formData.briefDescription}
              onChange={handleInputChange}
              placeholder="A short summary (max 150 characters)"
              rows="2"
              minLength={10}
              maxLength={150}
              required
            />
            <small className="char-count">{formData.briefDescription.length}/150</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                {STATUSES.map(stat => (
                  <option key={stat} value={stat}>{stat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="thumbnail">Project Thumbnail {thumbnail || thumbnailPreview ? '' : '*'}</label>
            <input
              type="file"
              id="thumbnail"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
            {thumbnailPreview && (
              <div className="image-preview">
                <img src={thumbnailPreview} alt="Thumbnail preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="images">Additional Images (Max 5 total)</label>
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
            />
            {imagePreviews.length > 0 && (
              <div className="images-preview-grid">
                {imagePreviews.map((preview, index) => {
                  const isExisting = project?.images?.includes(preview) && !removedImages.includes(preview);
                  return (
                    <div key={index} className="image-preview-item">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => isExisting ? removeExistingImage(preview) : removeNewImage(index)}
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="technologies">Technologies *</label>
            <div className="tech-input-container">
              <input
                type="text"
                id="technologies"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                placeholder="Add a technology (e.g., React, Node.js)"
              />
              <button type="button" onClick={addTechnology} className="add-tech-btn">
                Add
              </button>
            </div>
            {formData.technologies.length > 0 && (
              <div className="tech-tags">
                {formData.technologies.map(tech => (
                  <span key={tech} className="tech-tag">
                    {tech}
                    <button 
                      type="button" 
                      onClick={() => removeTechnology(tech)}
                      className="remove-tech-btn"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="demoUrl">Demo URL</label>
            <input
              type="url"
              id="demoUrl"
              name="demoUrl"
              value={formData.demoUrl}
              onChange={handleInputChange}
              placeholder="https://your-demo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="githubUrl">GitHub URL</label>
            <input
              type="url"
              id="githubUrl"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/username/repo"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectForm;
