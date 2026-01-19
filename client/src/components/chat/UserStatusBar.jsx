import { useState, useEffect, useRef } from 'react';
import UserAvatar from './UserAvatar';
import { chatAPI } from '../../services/api';

function UserStatusBar({ user, token, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('online');
  const [isAway, setIsAway] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const awayTimeoutRef = useRef(null);

  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Online' },
    away: { color: 'bg-yellow-500', label: 'Away' },
    offline: { color: 'bg-gray-500', label: 'Offline' },
    invisible: { color: 'bg-gray-500', label: 'Invisible' }
  };

  // Track user activity for away status
  useEffect(() => {
    const resetActivity = () => {
      lastActivityRef.current = Date.now();
      if (isAway && currentStatus === 'online') {
        setIsAway(false);
      }
    };

    const checkAway = () => {
      if (currentStatus === 'online') {
        const timeSinceActivity = Date.now() - lastActivityRef.current;
        // Set away after 5 minutes of inactivity
        if (timeSinceActivity > 5 * 60 * 1000) {
          setIsAway(true);
        }
      }
    };

    // Listen for user activity
    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('keydown', resetActivity);
    window.addEventListener('click', resetActivity);
    window.addEventListener('scroll', resetActivity);

    // Check every minute for away status
    awayTimeoutRef.current = setInterval(checkAway, 60 * 1000);

    return () => {
      window.removeEventListener('mousemove', resetActivity);
      window.removeEventListener('keydown', resetActivity);
      window.removeEventListener('click', resetActivity);
      window.removeEventListener('scroll', resetActivity);
      if (awayTimeoutRef.current) {
        clearInterval(awayTimeoutRef.current);
      }
    };
  }, [currentStatus, isAway]);

  const handleStatusChange = async (newStatus) => {
    setCurrentStatus(newStatus);
    setIsAway(false);
    setMenuOpen(false);
    
    // Update online status in backend
    try {
      const isOnline = newStatus === 'online' || newStatus === 'away';
      await chatAPI.updateOnlineStatus(token, isOnline);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest('.status-menu-container')) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const displayStatus = isAway ? 'away' : currentStatus;
  const statusInfo = statusConfig[displayStatus];

  return (
    <div className="px-2 py-2 bg-neutral-900 border-t border-neutral-700 status-menu-container">
      <div
        className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-neutral-700/50 cursor-pointer transition-all"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <div className="relative">
          <UserAvatar user={user} size="sm" />
          <div className={`absolute bottom-0 right-0 w-3 h-3 ${statusInfo.color} rounded-full border-2 border-neutral-900`}></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{user?.username}</p>
          <p className="text-gray-400 text-xs truncate">{statusInfo.label}</p>
        </div>

        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Status Menu */}
      {menuOpen && (
        <div className="absolute bottom-full left-2 right-2 mb-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden">
          <div className="py-2">
            {Object.entries(statusConfig).map(([status, config]) => (
              <button
                key={status}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-neutral-700/50 transition-all ${
                  currentStatus === status ? 'bg-neutral-700' : ''
                }`}
                onClick={() => handleStatusChange(status)}
              >
                <div className={`w-2.5 h-2.5 ${config.color} rounded-full`}></div>
                <span className="text-white text-sm">{config.label}</span>
                {currentStatus === status && (
                  <svg className="w-4 h-4 text-gray-200 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          
          {isAway && currentStatus === 'online' && (
            <div className="px-4 py-2 bg-yellow-500/10 border-t border-neutral-700">
              <p className="text-yellow-500 text-xs">
                <span className="font-medium">Away</span> - You've been inactive
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserStatusBar;
