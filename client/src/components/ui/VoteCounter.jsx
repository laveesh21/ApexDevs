import PropTypes from 'prop-types';
import VoteButton from './VoteButton';

/**
 * VoteCounter Component - Complete voting system with up/down buttons and score
 * @param {number} score - Current vote score
 * @param {string} userVote - User's current vote: 'up', 'down', or null
 * @param {function} onUpvote - Upvote click handler
 * @param {function} onDownvote - Downvote click handler
 * @param {string} orientation - Layout: 'vertical' | 'horizontal'
 * @param {string} size - Size variant: 'sm' | 'md' | 'lg'
 */
function VoteCounter({ 
  score = 0, 
  userVote = null, 
  onUpvote, 
  onDownvote, 
  orientation = 'vertical',
  size = 'md'
}) {
  const scoreSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  const gapClasses = orientation === 'vertical' ? 'gap-2' : 'gap-3';
  const flexDirection = orientation === 'vertical' ? 'flex-col' : 'flex-row';

  // Normalize userVote to handle both 'upvote'/'downvote' and 'up'/'down'
  const normalizedVote = userVote === 'upvote' ? 'up' : userVote === 'downvote' ? 'down' : userVote;

  return (
    <div className={`flex ${flexDirection} items-center ${gapClasses}`}>
      <VoteButton 
        direction="up" 
        active={normalizedVote === 'up'} 
        onClick={onUpvote}
        size={size}
      />
      <span className={`${scoreSizeClasses[size]} font-semibold text-white`}>
        {score}
      </span>
      <VoteButton 
        direction="down" 
        active={normalizedVote === 'down'} 
        onClick={onDownvote}
        size={size}
      />
    </div>
  );
}

VoteCounter.propTypes = {
  score: PropTypes.number,
  userVote: PropTypes.oneOf(['up', 'down', null]),
  onUpvote: PropTypes.func.isRequired,
  onDownvote: PropTypes.func.isRequired,
  orientation: PropTypes.oneOf(['vertical', 'horizontal']),
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default VoteCounter;
