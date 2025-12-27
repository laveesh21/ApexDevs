import PropTypes from 'prop-types';

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
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === category.value
              ? 'bg-primary text-neutral-900'
              : 'bg-neutral-700 text-gray-300 border border-neutral-600 hover:border-primary hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{category.label}</span>
            {category.count !== undefined && (
              <span className="text-xs opacity-75">({category.count})</span>
            )}
          </div>
        </button>
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
