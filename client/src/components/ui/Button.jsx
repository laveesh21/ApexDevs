import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Button Component - Reusable button component with multiple variants and sizes
 * @param {string} children - Button content
 * @param {string} variant - Style variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
 * @param {string} size - Size variant: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} fullWidth - Whether button should take full width
 * @param {boolean} disabled - Disabled state
 * @param {boolean} loading - Loading state
 * @param {string} type - Button type: 'button' | 'submit' | 'reset'
 * @param {string} to - If provided, renders as Link (React Router)
 * @param {string} href - If provided, renders as anchor tag
 * @param {function} onClick - Click handler
 * @param {string} className - Additional custom classes
 * @param {object} icon - Optional icon element to display before text
 * @param {object} iconRight - Optional icon element to display after text
 */
function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  to,
  href,
  onClick,
  className = '',
  icon,
  iconRight,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'text-green-500/90 border border-green-500/90 hover:from-purple-500 hover:via-pink-600 hover:to-red-600',
    secondary: 'bg-neutral-700 hover:bg-neutral-600 text-gray-300 border border-neutral-600 hover:border-primary/50',
    outline: 'bg-transparent hover:bg-neutral-700 text-gray-300 border border-neutral-600 hover:border-primary hover:text-primary',
    ghost: 'bg-transparent hover:bg-neutral-700 text-gray-300 hover:text-primary',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md'
  };
  
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-2.5 text-base',
    xl: 'px-8 py-3 text-lg'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;
  
  const content = (
    <>
      {loading ? (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
          {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
        </>
      )}
    </>
  );
  
  // Render as Link if 'to' prop is provided
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  
  // Render as anchor if 'href' prop is provided
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  
  // Render as button
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {content}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  to: PropTypes.string,
  href: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  icon: PropTypes.node,
  iconRight: PropTypes.node
};

export default Button;
