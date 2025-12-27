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
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <nav className="bg-dark-800 border-b border-dark-600 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="ApexDevs" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-100">ApexDevs</span>
          </Link>
          
          <ul className="flex items-center gap-1">
            <li>
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-lg text-gray-300 hover:text-gray-100 hover:bg-dark-700 transition-all ${
                  isActive('/') ? 'bg-dark-700 text-primary' : ''
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/community" 
                className={`px-4 py-2 rounded-lg text-gray-300 hover:text-gray-100 hover:bg-dark-700 transition-all ${
                  isActive('/community') ? 'bg-dark-700 text-primary' : ''
                }`}
              >
                Community
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className={`px-4 py-2 rounded-lg text-gray-300 hover:text-gray-100 hover:bg-dark-700 transition-all ${
                  isActive('/about') ? 'bg-dark-700 text-primary' : ''
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
                    className="px-4 py-2 text-gray-300 hover:text-gray-100 transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/signup" 
                    className="px-4 py-2 bg-primary hover:bg-primary-light text-dark-900 font-medium rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>

          {!loading && isAuthenticated && (
            <div className="flex items-center gap-4">
              <Link to="/chat" className="p-2 text-gray-400 hover:text-primary transition-colors" title="Messages">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </Link>
              
              <div className="relative">
                <button 
                  className="flex items-center gap-2 p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <img 
                    src={getSelectedAvatar(user)} 
                    alt={user?.username}
                    className="w-8 h-8 rounded-full border-2 border-dark-600"
                  />
                  <span className="text-gray-300 font-medium hidden md:block">{user?.username}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl py-2 animate-scale-up">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-primary transition-colors" onClick={() => setShowDropdown(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="4"/>
                        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                      </svg>
                      Profile
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-primary transition-colors" onClick={() => setShowDropdown(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
                      </svg>
                      Settings
                    </Link>
                    <button className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-red-400 transition-colors w-full text-left" onClick={handleLogout}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      </div>
    </nav>
  );
}

export default Navbar;
