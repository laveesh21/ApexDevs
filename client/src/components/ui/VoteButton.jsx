import PropTypes from 'prop-types';

/**
 * VoteButton Component - Individual arrow button for voting
 * @param {string} direction - 'up' or 'down'
 * @param {boolean} active - Whether this vote is active
 * @param {function} onClick - Click handler
 * @param {string} size - Size variant: 'sm' | 'md' | 'lg'
 */
function VoteButton({ direction = 'up', active = false, onClick, size = 'lg' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-9 h-9'
  };

  const svgSizes = {
    sm: 20,
    md: 26,
    lg: 32
  };

  const baseClasses = 'transition-all cursor-pointer select-none flex items-center justify-center';
  
  const colorClasses = direction === 'up' 
    ? active 
      ? 'text-green-500' 
      : 'text-gray-500 hover:text-green-500'
    : active
      ? 'text-red-500'
      : 'text-gray-500 hover:text-red-500';

  const svgSize = svgSizes[size];

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${colorClasses} ${sizeClasses[size]}`}
      aria-label={direction === 'up' ? 'Upvote' : 'Downvote'}
    >
      {direction === 'up' ? (
        <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,6 20,18 4,18"/>
        </svg>
      ) : (
        <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,18 4,6 20,6"/>
        </svg>
      )}
    </button>
  );
}

VoteButton.propTypes = {
  direction: PropTypes.oneOf(['up', 'down']).isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default VoteButton;
