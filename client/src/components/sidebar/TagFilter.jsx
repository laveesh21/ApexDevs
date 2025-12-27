import PropTypes from 'prop-types';
import { Tag } from '../ui';

// Default tech stack tags (for projects)
const DEFAULT_TECH_STACKS = [
  'Angular', 'Bootstrap', 'CSS', 'Django', 'Docker', 'Express',
  'Firebase', 'Flask', 'GraphQL', 'HTML', 'Java', 'JavaScript',
  'Kotlin', 'MongoDB', 'MySQL', 'Next.js', 'Node.js', 'PHP',
  'PostgreSQL', 'Python', 'React', 'React Native', 'Redux',
  'Ruby', 'Rust', 'Spring Boot', 'SQL', 'Svelte', 'Swift',
  'Tailwind CSS', 'TypeScript', 'Vue.js'
];

// Default discussion tags
const DEFAULT_DISCUSSION_TAGS = [
  'React', 'JavaScript', 'Python', 'TypeScript', 'Node.js',
  'Question', 'Tutorial', 'Discussion', 'Bug', 'Feature Request'
];

/**
 * TagFilter - Component for filtering by tags or tech stack
 * Displays tags as toggleable chips
 * Can be used for both tech stack filtering and discussion tag filtering
 */
function TagFilter({ 
  selectedTags, 
  onTagChange, 
  tags,
  // Backward compatibility with TechStackFilter
  selectedTech,
  onTechChange,
  techStacks
}) {
  // Support both prop names for backward compatibility
  const selected = selectedTech !== undefined ? selectedTech : (selectedTags || []);
  const onChange = onTechChange || onTagChange;
  const tagList = techStacks || tags || DEFAULT_TECH_STACKS;

  const handleTagToggle = (tag) => {
    if (!onChange) return; // Safety check
    
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  const clearTags = () => {
    if (!onChange) return; // Safety check
    onChange([]);
  };

  return (
    <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{selected.length} selected</span>
          {selected.length > 0 && (
          <button 
            onClick={clearTags} 
            className="text-xs text-white bg-red-700/80 px-2 py-1 rounded font-bold hover:text-primary-light transition-colors"
          >
            Clear All
          </button>
      )}
        </div>

      <div className="flex flex-wrap gap-2">
        {tagList.map((tag) => (
          <Tag
            key={tag}
            variant={selected.includes(tag) ? 'primary' : 'secondary'}
            onClick={() => handleTagToggle(tag)}
          >
            {tag}
          </Tag>
        ))}
      </div>
    </div>
  );
}

TagFilter.propTypes = {
  selectedTags: PropTypes.arrayOf(PropTypes.string),
  onTagChange: PropTypes.func,
  tags: PropTypes.arrayOf(PropTypes.string),
  // Backward compatibility props
  selectedTech: PropTypes.arrayOf(PropTypes.string),
  onTechChange: PropTypes.func,
  techStacks: PropTypes.arrayOf(PropTypes.string)
};

// Export default tags for convenience
export { DEFAULT_TECH_STACKS, DEFAULT_DISCUSSION_TAGS };
export default TagFilter;
