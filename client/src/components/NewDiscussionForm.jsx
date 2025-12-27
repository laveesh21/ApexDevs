import { useState } from 'react';

function NewDiscussionForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-neutral-800 border border-neutral-600 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-neutral-800 border-b border-neutral-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-100">Start a New Discussion</h2>
          <button className="text-gray-400 hover:text-gray-100 text-3xl leading-none transition-colors" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Selection */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-3">Discussion Type *</label>
            <div className="flex flex-wrap gap-2">
              {discussionTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    formData.type === type
                      ? 'bg-primary text-white'
                      : 'bg-neutral-700 border border-neutral-600 text-gray-300 hover:bg-neutral-600 hover:border-primary/50'
                  }`}
                  onClick={() => setFormData({ ...formData, type })}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
            <textarea
              id="content"
              name="content"
              className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Provide details about your discussion. You can use Markdown for formatting."
              value={formData.content}
              onChange={handleChange}
              required
              rows="10"
            />
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className="text-gray-500">💡 Tip: Include code examples and context</span>
              <span className="text-gray-500">{formData.content.length} characters</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags (Max 5)</label>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary/30 text-primary rounded-md text-sm">
                    {tag}
                    <button
                      type="button"
                      className="text-primary hover:text-red-400 font-bold transition-colors"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2">Popular Tags:</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      formData.tags.includes(tag)
                        ? 'bg-primary/30 border border-primary text-primary'
                        : 'bg-neutral-700 border border-neutral-600 text-gray-400 hover:bg-neutral-600 hover:border-primary/50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={() => handleAddTag(tag)}
                    disabled={formData.tags.includes(tag) || formData.tags.length >= 5}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 bg-neutral-700 border border-neutral-600 text-gray-100 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
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
              <button
                type="button"
                className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                onClick={handleAddCustomTag}
                disabled={!tagInput.trim() || formData.tags.length >= 5}
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-600">
            <button type="button" className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 text-gray-300 font-medium rounded-lg transition-colors" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-primary hover:bg-primary-light text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              disabled={!formData.title.trim() || !formData.content.trim()}
            >
              Post Discussion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewDiscussionForm;
