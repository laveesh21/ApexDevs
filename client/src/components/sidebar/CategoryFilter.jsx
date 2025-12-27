import PropTypes from 'prop-types';
import { Button } from '../ui';

const DEFAULT_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'general', label: 'General Discussion' },
  { value: 'help', label: 'Help & Support' },
  { value: 'showcase', label: 'Project Showcase' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'announcements', label: 'Announcements' }
];

/**
 * CategoryFilter - Component for filtering by category
 * Displays categories as radio button options
 */
function CategoryFilter({ selectedCategory, onCategoryChange, categories = DEFAULT_CATEGORIES }) {
  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <Button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          variant={selectedCategory === category.value ? 'success' : 'zinc_secondary'}
          size="sm"
          fullWidth
          className="px-4"
        >
          <div className="flex items-center justify-between w-full">
            <span>{category.label}</span>
            {category.count !== undefined && (
              <span className="text-xs opacity-75">({category.count})</span>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
}

CategoryFilter.propTypes = {
  selectedCategory: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      count: PropTypes.number
    })
  )
};

export default CategoryFilter;
