import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getSelectedAvatar } from '../../utils/avatarHelper';

/**
 * AuthorAvatar Component - Reusable component for displaying author/user avatar with name
 * @param {object} author - Author object with _id/id, username, and optional avatar
 * @param {string} size - Size variant: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} showName - Whether to display the author's name
 * @param {boolean} clickable - Whether the author is clickable (links to profile)
 * @param {string} subtitle - Optional subtitle text (e.g., role, date)
 * @param {string} className - Additional custom classes for the container
 * @param {function} onClick - Optional click handler (called in addition to navigation)
 */
function AuthorAvatar({ 
  author, 
  size = 'md', 
  showName = true, 
  clickable = true,
  subtitle,
  className = '',
  onClick
}) {
  if (!author) {
    return null;
  }

  const authorId = author._id || author.id;
  const authorName = author.username || 'Anonymous';
  const avatarSrc = getSelectedAvatar(author);
  
  const sizeClasses = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };
  
  const borderSizes = {
    xs: 'border',
    sm: 'border',
    md: 'border-2',
    lg: 'border-2',
    xl: 'border-2'
  };
  
  const avatarClasses = `${sizeClasses[size]} rounded-full ${borderSizes[size]} border-neutral-600 object-cover flex-shrink-0`;
  
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };
  
  const AvatarImage = () => (
    <img 
      src={avatarSrc} 
      alt={authorName}
      className={avatarClasses}
    />
  );
  
  const AuthorName = () => {
    if (!showName) return null;
    
    const nameContent = (
      <span className={`font-medium ${textSizes[size]} ${
        clickable && authorId 
          ? 'text-primary hover:text-primary-light transition-colors' 
          : 'text-gray-300'
      }`}>
        {authorName}
      </span>
    );
    
    if (subtitle) {
      return (
        <div className="flex flex-col min-w-0">
          {nameContent}
          <span className={`${textSizes[size]} text-gray-500 truncate`}>
            {subtitle}
          </span>
        </div>
      );
    }
    
    return nameContent;
  };
  
  const containerClasses = `flex items-center gap-2 ${className}`;
  
  // If clickable and has authorId, wrap in Link
  if (clickable && authorId) {
    return (
      <Link 
        to={`/user/${authorId}`}
        className={containerClasses}
        onClick={handleClick}
      >
        <AvatarImage />
        <AuthorName />
      </Link>
    );
  }
  
  // Otherwise, render as div
  return (
    <div className={containerClasses} onClick={handleClick}>
      <AvatarImage />
      <AuthorName />
    </div>
  );
}

AuthorAvatar.propTypes = {
  author: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    username: PropTypes.string,
    avatar: PropTypes.string,
    selectedAvatar: PropTypes.string,
    role: PropTypes.string
  }),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  showName: PropTypes.bool,
  clickable: PropTypes.bool,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default AuthorAvatar;
