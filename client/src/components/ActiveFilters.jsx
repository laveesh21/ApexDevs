import PropTypes from 'prop-types';
import { Tag } from './ui';

/**
 * ActiveFilters - Component to display active filters as removable tags
 * Shows selected filters with ability to remove individual filters
 */
function ActiveFilters({ 
  selectedTags = [], 
  onRemoveTag, 
  label = "Filtered by"
}) {
  if (selectedTags.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 flex items-center gap-2 flex-wrap">
      <span className="text-gray-400 text-sm font-medium">{label}:</span>
      {selectedTags.map((tag, index) => (
        <Tag
          key={index}
          variant="primary"
          size="sm"
          onRemove={() => onRemoveTag(tag)}
        >
          {tag}
        </Tag>
      ))}
    </div>
  );
}

ActiveFilters.propTypes = {
  selectedTags: PropTypes.arrayOf(PropTypes.string),
  onRemoveTag: PropTypes.func.isRequired,
  label: PropTypes.string
};

export default ActiveFilters;
