import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import './NewProjectForm.css';

const CATEGORIES = ['Web App', 'Mobile App', 'Desktop App', 'Game', 'AI/ML', 'DevTools', 'Other'];
const STATUSES = ['In Progress', 'Completed', 'Maintained'];

const NewProjectForm = ({ onClose, onSuccess }) => {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (files.length + images.length > 5) {
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

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTechnology = (e) => {
    e.preventDefault();
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
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
    setError('');

    if (!thumbnail) {
      setError('Thumbnail is required');
      return;
    }

    if (formData.technologies.length === 0) {
      setError('Please add at least one technology');
      return;
    }

    setLoading(true);

    try {
      const projectData = {
        ...formData,
        thumbnail,
        images,
      };

      const response = await projectAPI.create(token, projectData);
      
      // Clean up preview URLs
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      
      // Close modal first, then call onSuccess
      onClose();
      
      // Use setTimeout to ensure modal is closed before refreshing
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    } catch (err) {
      console.error('Project upload error:', err);
      setError(err.message || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload New Project</h2>
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
              minLength={3}
              maxLength={100}
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
              minLength={10}
              maxLength={2000}
              rows={5}
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
              minLength={10}
              maxLength={150}
              rows={2}
              required
            />
            <small className="char-count">{formData.briefDescription.length}/150</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="thumbnail">Thumbnail Image *</label>
            <input
              type="file"
              id="thumbnail"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleThumbnailChange}
            />
            {thumbnailPreview && (
              <div className="image-preview">
                <img src={thumbnailPreview} alt="Thumbnail preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="images">Additional Images (Max 5)</label>
            <input
              type="file"
              id="images"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImagesChange}
              disabled={images.length >= 5}
            />
            {imagePreviews.length > 0 && (
              <div className="images-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeImage(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
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
                placeholder="Add technology (e.g., React, Node.js)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTechnology(e);
                  }
                }}
              />
              <button type="button" onClick={handleAddTechnology} className="add-tech-btn">
                Add
              </button>
            </div>
            {formData.technologies.length > 0 && (
              <div className="tech-tags">
                {formData.technologies.map((tech, index) => (
                  <span key={index} className="tech-tag">
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
              {loading ? 'Uploading...' : 'Upload Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectForm;
