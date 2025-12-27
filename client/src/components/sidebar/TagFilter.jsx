import PropTypes from 'prop-types';

const DEFAULT_TAGS = [
  'React', 'JavaScript', 'Python', 'TypeScript', 'Node.js',
  'Question', 'Tutorial', 'Discussion', 'Bug', 'Feature Request'
];

/**
 * TagFilter - Component for filtering by tags
 * Displays tags as toggleable chips
 */
function TagFilter({ selectedTags, onTagChange, tags = DEFAULT_TAGS }) {
  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagChange([...selectedTags, tag]);
    }
  };

  const clearTags = () => {
    onTagChange([]);
  };

  return (
    <div className="space-y-3">
      {selectedTags.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{selectedTags.length} selected</span>
          <button 
            onClick={clearTags} 
            className="text-xs text-primary hover:text-primary-light transition-colors font-medium"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedTags.includes(tag) 
                ? 'bg-primary text-neutral-900' 
                : 'bg-neutral-700 text-gray-300 border border-neutral-600 hover:border-primary hover:text-white'
            }`}
            onClick={() => handleTagToggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

TagFilter.propTypes = {
  selectedTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onTagChange: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string)
};

export default TagFilter;
