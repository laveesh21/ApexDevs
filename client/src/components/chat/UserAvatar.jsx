import { getSelectedAvatar } from '../../utils/avatarHelper';

function UserAvatar({ user, size = 'md', showOnlineStatus = false }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  const avatarUrl = getSelectedAvatar(user);

  return (
    <>
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={user?.username}
          className={`${sizeClasses[size]} rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div 
        className={`${sizeClasses[size]} rounded-full bg-primary/20 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
        style={{ display: avatarUrl ? 'none' : 'flex' }}
      >
        <svg className={`${iconSizeClasses[size]} text-gray-200`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      </div>
      {showOnlineStatus && (
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-neutral-800"></div>
      )}
    </>
  );
}

export default UserAvatar;
