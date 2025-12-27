import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';

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

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.briefDescription.trim()) {
      setError('Brief description is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-neutral-800 border border-neutral-600 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-neutral-800 border-b border-neutral-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-100">Upload New Project</h2>
          <button className="text-gray-400 hover:text-gray-100 text-3xl leading-none transition-colors" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">{error}</div>}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Project Title *</label>
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
              className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
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
              className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="briefDescription" className="block text-sm font-medium text-gray-300 mb-2">Brief Description *</label>
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
              className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <small className="text-xs text-gray-500">{formData.briefDescription.length}/150</small>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-300 mb-2">Thumbnail Image *</label>
            <input
              type="file"
              id="thumbnail"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleThumbnailChange}
              className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-neutral-900 file:font-medium hover:file:bg-primary-light file:cursor-pointer"
            />
            {thumbnailPreview && (
              <div className="mt-3 rounded-lg overflow-hidden border border-neutral-600">
                <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-300 mb-2">Additional Images (Max 5)</label>
            <input
              type="file"
              id="images"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImagesChange}
              disabled={images.length >= 5}
              className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-neutral-900 file:font-medium hover:file:bg-primary-light file:cursor-pointer disabled:opacity-50"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border border-neutral-600">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-lg leading-none transition-colors"
                      onClick={() => removeImage(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="technologies" className="block text-sm font-medium text-gray-300 mb-2">Technologies *</label>
            <div className="flex gap-2">
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
                className="flex-1 px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button type="button" onClick={handleAddTechnology} className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-medium rounded-lg transition-colors">
                Add
              </button>
            </div>
            {formData.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.technologies.map((tech, index) => (
                  <span key={index} className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary/30 text-primary rounded-md text-sm">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="text-primary hover:text-red-400 font-bold transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-300 mb-2">Demo URL</label>
            <input
              type="url"
              id="demoUrl"
              name="demoUrl"
              value={formData.demoUrl}
              onChange={handleInputChange}
              placeholder="https://your-demo.com"
              className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
            <input
              type="url"
              id="githubUrl"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/username/repo"
              className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-600">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 text-gray-300 font-medium rounded-lg transition-colors disabled:opacity-50" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary-light text-white font-medium rounded-lg transition-colors disabled:opacity-50" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectForm;
