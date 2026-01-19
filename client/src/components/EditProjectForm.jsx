import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import Button from './ui/Button';

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-neutral-800/50 backdrop-blur-md border border-neutral-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-neutral-800/90 backdrop-blur-sm border-b border-neutral-700 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Project</h2>
            <p className="text-sm text-gray-400 mt-1">Update your project details</p>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors p-1" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-88px)]">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Project Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter project title"
              required
              className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-gray-100 text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div>
            <label htmlFor="briefDescription" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Brief Description *</label>
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
              className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-gray-100 text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-500">{formData.briefDescription.length}/150</span>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your project in detail..."
              rows="6"
              minLength={10}
              maxLength={2000}
              required
              className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-gray-100 text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-500">{formData.description.length}/2000</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-gray-100 text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-gray-100 text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                {STATUSES.map(stat => (
                  <option key={stat} value={stat}>{stat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Technologies</label>
              <div className="px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 rounded-lg text-sm text-gray-300">
                {formData.technologies.length} added
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Project Thumbnail {thumbnail || thumbnailPreview ? '' : '*'}</label>
            <div className="relative">
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
              <label htmlFor="thumbnail" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer bg-neutral-700/30 hover:bg-neutral-700/50 transition-colors">
                <svg className="w-10 h-10 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-400">Click to upload thumbnail</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</span>
              </label>
            </div>
            {thumbnailPreview && (
              <div className="mt-3 relative rounded-lg overflow-hidden border border-neutral-600 group">
                <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm">Change thumbnail</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="images" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Additional Images (Max 5 total)</label>
            <div className="relative">
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="hidden"
              />
              <label htmlFor="images" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer bg-neutral-700/30 hover:bg-neutral-700/50 transition-colors">
                <svg className="w-8 h-8 text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-400">Add more images</span>
              </label>
            </div>
            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {imagePreviews.map((preview, index) => {
                  const isExisting = project?.images?.includes(preview) && !removedImages.includes(preview);
                  return (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-neutral-600 aspect-square">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => isExisting ? removeExistingImage(preview) : removeNewImage(index)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Technologies *</label>
            {formData.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.technologies.map(tech => (
                  <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 border border-primary/30 text-green-500 rounded-full text-sm">
                    {tech}
                    <button 
                      type="button" 
                      onClick={() => removeTechnology(tech)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                placeholder="Add a technology (e.g., React, Node.js)"
                className="flex-1 px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-gray-100 text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <Button
                type="button"
                onClick={addTechnology}
                variant="primary"
                size="md"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="demoUrl" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Demo URL</label>
              <div className="relative">
                <input
                  type="url"
                  id="demoUrl"
                  name="demoUrl"
                  value={formData.demoUrl}
                  onChange={handleInputChange}
                  placeholder="https://your-demo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-gray-100 text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                <svg className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="githubUrl" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">GitHub URL</label>
              <div className="relative">
                <input
                  type="url"
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repo"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-gray-100 text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                <svg className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.430.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-700 mt-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              loading={loading}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              Update Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectForm;
