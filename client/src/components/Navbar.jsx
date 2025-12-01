import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSelectedAvatar } from '../utils/avatarHelper';
import logo from '../assets/ApexDevsLogo.png';
import './Navbar.css';

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
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="ApexDevs" className="navbar-logo-img" />
          <span>ApexDevs</span>
        </Link>
        
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/community" className={`navbar-link ${isActive('/community') ? 'active' : ''}`}>
              Community
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/about" className={`navbar-link ${isActive('/about') ? 'active' : ''}`}>
              About
            </Link>
          </li>
          
          {!loading && !isAuthenticated && (
            <>
              <li className="navbar-item">
                <Link to="/login" className={`navbar-link navbar-link-btn ${isActive('/login') ? 'active' : ''}`}>
                  Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/signup" className={`navbar-link navbar-link-signup ${isActive('/signup') ? 'active' : ''}`}>
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>

        {!loading && isAuthenticated && (
          <div className="navbar-actions">
            <Link to="/chat" className="chat-icon-link" title="Messages">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </Link>
            
            <div className="user-menu">
            <button 
              className="user-menu-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >


              {console.log("USER IN NAVBAR", user)}
              <img 
                src={getSelectedAvatar(user)} 
                alt={user?.username}
                className="user-avatar"
              />
              <span className="user-name">{user?.username}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            
            {showDropdown && (
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                  </svg>
                  Profile
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
                  </svg>
                  Settings
                </Link>
                <button className="dropdown-item" onClick={handleLogout}>
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
    </nav>
  );
}

export default Navbar;
