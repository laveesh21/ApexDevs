import PropTypes from 'prop-types';

/**
 * Tag Component - Reusable tag/badge component for displaying technologies, categories, or labels
 * @param {string} children - The tag text content
 * @param {string} variant - Style variant: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger'
 * @param {string} size - Size variant: 'xs' | 'sm' | 'md' | 'lg'
 * @param {function} onRemove - Optional callback for removable tags (shows X button)
 * @param {function} onClick - Optional click handler for interactive tags
 * @param {string} className - Additional custom classes
 */
function Tag({ 
  children, 
  variant = 'primary', 
  size = 'sm', 
  onRemove,
  onClick,
  className = '' 
}) {
  const baseClasses = 'inline-flex items-center gap-1.5 font-medium rounded transition-colors';
  const clickableClass = onClick ? 'cursor-pointer' : '';
  
  const variantClasses = {
    primary: 'bg-transparent text-green-500 border border-green-500/80 hover:bg-green-500/10 hover:cursor-default',
    secondary: 'bg-zinc-800 text-gray-300 border border-neutral-700 hover:bg-zinc-700',
    outline: 'bg-transparent text-gray-300 border border-neutral-700 hover:border-primary hover:text-gray-200',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
  };
  
  const sizeClasses = {
    xxs: 'px-2 py-0 text-[10px]',
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-base'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${clickableClass} ${className}`;
  
  const TagElement = onClick ? 'button' : 'span';
  
  return (
    <TagElement 
      className={classes}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
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
    </TagElement>
  );
}

Tag.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'success', 'warning', 'danger']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  onRemove: PropTypes.func,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default Tag;
