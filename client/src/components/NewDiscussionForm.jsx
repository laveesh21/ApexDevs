import { useState } from 'react';
import './NewDiscussionForm.css';

function NewDiscussionForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    type: 'Question',
    title: '',
    content: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  const discussionTypes = [
    'Question',
    'Discussion',
    'Tutorial',
    'Show & Tell',
    'Help Wanted',
    'Bug Report'
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Start a New Discussion</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="discussion-form">
          {/* Type Selection */}
          <div className="form-group">
            <label htmlFor="type">Discussion Type *</label>
            <div className="type-selector">
              {discussionTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  className={`type-option ${formData.type === type ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, type })}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              placeholder="What's your question or topic?"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={200}
            />
            <span className="char-count">{formData.title.length}/200</span>
          </div>

          {/* Content */}
          <div className="form-group">
            <label htmlFor="content">Description *</label>
            <textarea
              id="content"
              name="content"
              className="form-textarea"
              placeholder="Provide details about your discussion. You can use Markdown for formatting."
              value={formData.content}
              onChange={handleChange}
              required
              rows="10"
            />
            <div className="textarea-footer">
              <span className="help-text">💡 Tip: Include code examples and context</span>
              <span className="char-count">{formData.content.length} characters</span>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags (Max 5)</label>
            
            {formData.tags.length > 0 && (
              <div className="selected-tags">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="selected-tag">
                    {tag}
                    <button
                      type="button"
                      className="remove-tag-btn"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="popular-tags-section">
              <p className="tags-label">Popular Tags:</p>
              <div className="popular-tags-grid">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-option ${formData.tags.includes(tag) ? 'active' : ''}`}
                    onClick={() => handleAddTag(tag)}
                    disabled={formData.tags.includes(tag) || formData.tags.length >= 5}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-tag-input">
              <input
                type="text"
                className="form-input"
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
                className="add-tag-btn"
                onClick={handleAddCustomTag}
                disabled={!tagInput.trim() || formData.tags.length >= 5}
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
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
