/**
 * Category configuration for discussions
 * Centralized source for category colors and variants
 */

export const CATEGORY_CONFIG = {
  'General': {
    variant: 'outline',
    color: '#1f6feb'
  },
  'Questions': {
    variant: 'success',
    color: '#00be62'
  },
  'Help': {
    variant: 'warning',
    color: '#f59e0b'
  },
  'Showcase': {
    variant: 'warning',
    color: '#f97316'
  },
  'Resources': {
    variant: 'danger',
    color: '#d73a49'
  },
  'Collaboration': {
    variant: 'outline',
    color: '#a371f7'
  },
  'Feedback': {
    variant: 'warning',
    color: '#e85d04'
  },
  'Announcements': {
    variant: 'primary',
    color: '#00C896'
  },
  'Other': {
    variant: 'secondary',
    color: '#6c757d'
  }
};

/**
 * Get the Tag variant for a category
 * @param {string} category - Category name
 * @returns {string} - Tag variant (primary, secondary, success, warning, danger, outline)
 */
export const getCategoryVariant = (category) => {
  return CATEGORY_CONFIG[category]?.variant || 'secondary';
};

/**
 * Get the color for a category (fallback for custom styling)
 * @param {string} category - Category name
 * @returns {string} - Hex color code
 */
export const getCategoryColor = (category) => {
  return CATEGORY_CONFIG[category]?.color || '#6c757d';
};

/**
 * List of all available categories
 */
export const CATEGORIES = Object.keys(CATEGORY_CONFIG);
