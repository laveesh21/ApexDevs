import PropTypes from 'prop-types';
import { Button } from '../ui';

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
        <Button
          key={option.value}
          onClick={() => onSortChange(option.value)}
          variant={sortBy === option.value ? 'success' : 'zinc_secondary'}
          size="sm"
          fullWidth
          className="flex justify-start px-4 py-2"
        >
          {option.label}
        </Button>
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
