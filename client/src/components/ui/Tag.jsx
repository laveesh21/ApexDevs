import PropTypes from 'prop-types';

/**
 * Tag Component - Reusable tag/badge component for displaying technologies, categories, or labels
 * @param {string} children - The tag text content
 * @param {string} variant - Style variant: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger'
 * @param {string} size - Size variant: 'xs' | 'sm' | 'md' | 'lg'
 * @param {function} onRemove - Optional callback for removable tags (shows X button)
 * @param {string} className - Additional custom classes
 */
function Tag({ 
  children, 
  variant = 'primary', 
  size = 'sm', 
  onRemove, 
  className = '' 
}) {
  const baseClasses = 'inline-flex items-center gap-1.5 font-medium rounded transition-colors';
  
  const variantClasses = {
    primary: 'text-green-500/90 border border-green-500/90 hover:from-purple-500 hover:via-pink-600 hover:to-red-600',
    secondary: 'bg-neutral-700 text-gray-300 border border-neutral-600 hover:bg-neutral-600',
    outline: 'bg-transparent text-gray-300 border border-neutral-600 hover:border-primary hover:text-primary',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
  };
  
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-base'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <span className={classes}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:text-red-400 transition-colors text-current opacity-70 hover:opacity-100"
          aria-label="Remove tag"
        >
          ×
        </button>
      )}
    </span>
  );
}

Tag.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'success', 'warning', 'danger']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  onRemove: PropTypes.func,
  className: PropTypes.string
};

export default Tag;
