import { useState } from 'react';
import Button from './ui/Button';

function NewDiscussionForm({ onClose, onSubmit, initialData = null, isEditing = false }) {
  const [formData, setFormData] = useState(initialData || {
    type: 'Questions',
    title: '',
    content: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  const discussionTypes = [
    'General',
    'Questions',
    'Showcase',
    'Resources',
    'Collaboration',
    'Feedback',
    'Other'
  ];

  const popularTags = [
    'JavaScript',
    'React',
    'Python',
    'Node.js',
    'CSS',
    'MongoDB',
    'TypeScript',
    'Next.js',
    'Vue.js',
    'Django',
    'HTML',
    'Express',
    'PostgreSQL',
    'Docker',
    'API'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddTag = (tag) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddCustomTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
      setTagInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-neutral-800/95 border border-neutral-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scale-up shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex justify-between items-center backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEditing ? 'Edit Discussion' : 'Start a New Discussion'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing ? 'Update your discussion details' : 'Ask questions, share knowledge, or showcase your work'}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-white p-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Type Selection */}
          <div>
            <label htmlFor="type" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Discussion Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {discussionTypes.map(type => (
                <Button
                  key={type}
                  type="button"
                  variant={formData.type === type ? 'select' : 'secondary'}
                  size="md"
                  onClick={() => setFormData({ ...formData, type })}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500"
              placeholder="What's your question or topic?"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={200}
            />
            <span className="text-xs text-gray-500 mt-1 block">{formData.title.length}/200</span>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description *</label>
            <textarea
              id="content"
              name="content"
              className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500 resize-none"
              placeholder="Provide details about your discussion. Include code examples, context, or any relevant information..."
              value={formData.content}
              onChange={handleChange}
              required
              rows="12"
            />
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                You can use Markdown for formatting
              </span>
              <span className="text-gray-500">{formData.content.length} characters</span>
            </div>
          </div>

          {/* Tags */}
          <div className="border-t border-neutral-700/50 pt-5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tags (Max 5)</label>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/30 text-green-500 rounded text-sm font-medium">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-green-500 hover:text-red-400 transition-colors ml-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Popular Tags:</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 10).map(tag => (
                  <Button
                    key={tag}
                    type="button"
                    variant={formData.tags.includes(tag) ? 'select' : 'secondary'}
                    size="xs"
                    onClick={() => handleAddTag(tag)}
                    disabled={formData.tags.includes(tag) || formData.tags.length >= 5}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2.5 bg-neutral-700/50 border border-neutral-600 text-white text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder-gray-500 disabled:opacity-50"
                placeholder="Or add a custom tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                disabled={formData.tags.length >= 5}
              />
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleAddCustomTag}
                disabled={!tagInput.trim() || formData.tags.length >= 5}
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

          {/* Form Actions */}
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
              disabled={!formData.title.trim() || !formData.content.trim()}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
            >
              {isEditing ? 'Save Changes' : 'Post Discussion'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewDiscussionForm;
