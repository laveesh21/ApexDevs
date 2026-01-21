import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-800 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/') && location.pathname === '/'
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Community */}
        <Link
          to="/community"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/community') || isActive('/thread')
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          <span className="text-[10px] font-medium">Community</span>
        </Link>

        {/* Chat */}
        {isAuthenticated && (
          <Link
            to="/chat"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/chat')
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[10px] font-medium">Chat</span>
          </Link>
        )}

        {/* Profile or Login */}
        {isAuthenticated ? (
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/profile') || isActive('/user')
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/login')
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="text-[10px] font-medium">Login</span>
          </Link>
        )}

        {/* More/Settings */}
        {isAuthenticated && (
          <Link
            to="/settings"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/settings') || isActive('/about')
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-[10px] font-medium">More</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default BottomNav;
