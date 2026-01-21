import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/ApexDevsLogo.png';

function FloatingMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate('/');
  };

  return (
    <>
      {/* Floating Menu Button - Top Right */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="md:hidden fixed top-4 right-4 z-50 bg-neutral-800 hover:bg-neutral-700 text-white p-2.5 rounded-full shadow-lg border border-neutral-600 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {showMenu ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <>
              <line x1="4" y1="6" x2="20" y2="6" strokeWidth="2"/>
              <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2"/>
              <line x1="4" y1="18" x2="20" y2="18" strokeWidth="2"/>
            </>
          )}
        </svg>
      </button>

      {/* Menu Overlay */}
      {showMenu && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div className={`md:hidden fixed top-0 right-0 bottom-0 w-72 bg-neutral-900 border-l border-neutral-700 z-40 transform transition-transform duration-300 ${
        showMenu ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-neutral-800">
            <Link to="/" onClick={() => setShowMenu(false)} className="flex items-center gap-2">
              <img src={logo} alt="ApexDevs" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-100">ApexDevs</span>
            </Link>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              <Link
                to="/"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">Home</span>
              </Link>

              <Link
                to="/community"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <span className="font-medium">Community</span>
              </Link>

              <Link
                to="/about"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">About</span>
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/chat"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-medium">Chat</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">Settings</span>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-800">
            {isAuthenticated ? (
              <div className="space-y-3">
                {user && (
                  <div className="px-4 py-2 bg-neutral-800/50 rounded-lg">
                    <p className="text-sm text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate">{user.username}</p>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setShowMenu(false)}
                  className="block w-full px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-center rounded-lg transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setShowMenu(false)}
                  className="block w-full px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-center rounded-lg transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default FloatingMenu;
