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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-neutral-800/95 border border-neutral-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-up shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex justify-between items-center backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-bold text-white">Upload New Project</h2>
            <p className="text-xs text-gray-500 mt-0.5">Share your work with the community</p>
          </div>
          <button className="text-gray-500 hover:text-white transition-colors p-2" onClick={onClose}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Project Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="My Awesome Project"
              minLength={3}
              maxLength={100}
              required
              className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500"
            />
          </div>

          <div>
            <label htmlFor="briefDescription" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Brief Description *</label>
            <textarea
              id="briefDescription"
              name="briefDescription"
              value={formData.briefDescription}
              onChange={handleInputChange}
              placeholder="A short summary that captures the essence of your project"
              minLength={10}
              maxLength={150}
              rows={2}
              required
              className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500 resize-none"
            />
            <span className="text-xs text-gray-500 mt-1 block">{formData.briefDescription.length}/150</span>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your project features, technologies used, challenges overcome, and what makes it special..."
              minLength={10}
              maxLength={2000}
              rows={6}
              required
              className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500 resize-none"
            />
            <span className="text-xs text-gray-500 mt-1 block">{formData.description.length}/2000</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
              >
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="technologies-input" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tech Stack *</label>
              <div className="text-xs text-gray-500 bg-neutral-700/30 border border-neutral-600 rounded-lg px-4 py-2.5 h-[42px] flex items-center">
                {formData.technologies.length} {formData.technologies.length === 1 ? 'technology' : 'technologies'}
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-700/50 pt-5">
            <label htmlFor="thumbnail" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Thumbnail Image *</label>
            <div className="relative">
              <input
                type="file"
                id="thumbnail"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleThumbnailChange}
                className="hidden"
              />
              <label htmlFor="thumbnail" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer hover:border-primary transition-colors bg-neutral-700/30">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-center">
                    <svg className="w-10 h-10 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-400">Click to upload thumbnail</p>
                    <p className="text-xs text-gray-600 mt-1">Max 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="images" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Additional Images (Max 5)</label>
            <input
              type="file"
              id="images"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImagesChange}
              disabled={images.length >= 5}
              className="hidden"
            />
            <label htmlFor="images" className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer hover:border-primary transition-colors bg-neutral-700/30 ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <svg className="w-8 h-8 text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="text-xs text-gray-500">Click to add more images</p>
            </label>
            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border border-neutral-600 aspect-square">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => removeImage(index)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-neutral-700/50 pt-5">
            <label htmlFor="technologies" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Technologies Used *</label>
            {formData.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.technologies.map((tech, index) => (
                  <span key={index} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary rounded-lg text-sm font-medium">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="text-primary hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                id="technologies"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="e.g., React, TypeScript, Node.js"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTechnology(e);
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500"
              />
              <button type="button" onClick={handleAddTechnology} className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="demoUrl" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Live Demo URL</label>
              <input
                type="url"
                id="demoUrl"
                name="demoUrl"
                value={formData.demoUrl}
                onChange={handleInputChange}
                placeholder="https://your-demo.com"
                className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500"
              />
            </div>

            <div>
              <label htmlFor="githubUrl" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">GitHub Repository</label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                placeholder="https://github.com/username/repo"
                className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-700 mt-2">
            <button type="button" className="px-5 py-2.5 bg-neutral-700/50 hover:bg-neutral-700 border border-neutral-600 text-gray-300 text-sm font-medium rounded-lg transition-colors" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary/90 border border-primary text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectForm;
