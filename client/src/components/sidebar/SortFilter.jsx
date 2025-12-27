import PropTypes from 'prop-types';

const DEFAULT_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'views', label: 'Most Viewed' }
];

/**
 * SortFilter - Component for sorting options
 * Displays a list of sort options as buttons
 */
function SortFilter({ sortBy, onSortChange, options = DEFAULT_SORT_OPTIONS }) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSortChange(option.value)}
          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            sortBy === option.value
              ? 'bg-primary text-neutral-900'
              : 'bg-neutral-700 text-gray-300 border border-neutral-600 hover:border-primary hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

SortFilter.propTypes = {
  sortBy: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  )
};

export default SortFilter;
