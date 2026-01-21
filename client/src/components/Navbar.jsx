import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSelectedAvatar } from '../utils/avatarHelper';
import logo from '../assets/ApexDevsLogo.png';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <nav className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-12">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="ApexDevs" className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="text-base sm:text-lg font-bold text-gray-100">ApexDevs</span>
          </Link>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-300 hover:text-gray-100 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-1">
            <li>
              <Link 
                to="/" 
                className={`px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-gray-100 hover:bg-neutral-800 transition-all ${
                  isActive('/') ? 'bg-neutral-800 text-gray-100' : ''
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/community" 
                className={`px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-gray-100 hover:bg-neutral-800 transition-all ${
                  isActive('/community') ? 'bg-neutral-800 text-gray-100' : ''
                }`}
              >
                Community
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className={`px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-gray-100 hover:bg-neutral-800 transition-all ${
                  isActive('/about') ? 'bg-neutral-800 text-gray-100' : ''
                }`}
              >
                About
              </Link>
            </li>
            
            {!loading && !isAuthenticated && (
              <>
                <li>
                  <Link 
                    to="/login" 
                    className="px-3 py-1.5 text-sm text-gray-300 hover:text-gray-100 transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/signup" 
                    className="px-3 py-1.5 text-sm bg-primary hover:bg-primary-light border border-primary text-white font-medium rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Desktop Auth Section */}
          {!loading && isAuthenticated && (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/chat" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-gray-100 hover:bg-neutral-800 transition-all" title="Messages">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Chat</span>
              </Link>
              
              <div className="relative">
                <button 
                  className="flex items-center gap-1.5 p-1 hover:bg-neutral-800 rounded-lg transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <img 
                    src={getSelectedAvatar(user)} 
                    alt={user?.username}
                    className="w-7 h-7 rounded-full border-2 border-neutral-600"
                  />
                  <span className="text-sm text-gray-300 font-medium hidden lg:block">{user?.username}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-1 w-44 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl py-1.5 animate-scale-up">
                    <Link to="/profile" className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-300 hover:bg-neutral-800 hover:text-gray-100 transition-colors" onClick={() => setShowDropdown(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="4"/>
                        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                      </svg>
                      Profile
                    </Link>
                    <Link to="/settings" className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-300 hover:bg-neutral-800 hover:text-gray-100 transition-colors" onClick={() => setShowDropdown(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
                      </svg>
                      Settings
                    </Link>
                    <button className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-300 hover:bg-neutral-800 hover:text-red-400 transition-colors w-full text-left" onClick={handleLogout}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden pb-4 space-y-2">
            <Link 
              to="/" 
              className={`block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-gray-100 hover:bg-neutral-800 transition-all ${
                isActive('/') ? 'bg-neutral-800 text-gray-100' : ''
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              Home
            </Link>
            <Link 
              to="/community" 
              className={`block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-gray-100 hover:bg-neutral-800 transition-all ${
                isActive('/community') ? 'bg-neutral-800 text-gray-100' : ''
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              Community
            </Link>
            <Link 
              to="/about" 
              className={`block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-gray-100 hover:bg-neutral-800 transition-all ${
                isActive('/about') ? 'bg-neutral-800 text-gray-100' : ''
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              About
            </Link>
            
            {!loading && isAuthenticated && (
              <>
                <Link 
                  to="/chat" 
                  className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-gray-100 hover:bg-neutral-800 transition-all"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Chat
                </Link>
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-gray-100 hover:bg-neutral-800 transition-all"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-gray-100 hover:bg-neutral-800 transition-all"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Settings
                </Link>
                <button 
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-red-400 hover:bg-neutral-800 transition-all"
                  onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                >
                  Logout
                </button>
              </>
            )}

            {!loading && !isAuthenticated && (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-gray-100 hover:bg-neutral-800 transition-all"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block px-3 py-2 bg-primary hover:bg-primary-light border border-primary text-white font-medium rounded-lg transition-colors text-sm text-center"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
