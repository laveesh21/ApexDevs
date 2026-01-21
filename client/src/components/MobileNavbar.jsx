import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/ApexDevsLogo.png';

function MobileNavbar() {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  // Show filter button only on homepage and community pages
  const showFilter = location.pathname === '/' || location.pathname === '/community';

  const handleFilterClick = () => {
    setShowFilterMenu(!showFilterMenu);
    // Dispatch event for filter menu toggle
    window.dispatchEvent(new CustomEvent('toggleMobileFilters'));
  };

  return (
    <>
      {/* Slim Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center justify-between px-3 py-2.5">
          {/* Left: Hamburger (Filter) - Only on Home/Community */}
          <div className="w-8 flex items-center justify-start">
            {showFilter && (
              <button
                onClick={handleFilterClick}
                className="text-gray-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            )}
          </div>

          {/* Center: Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="ApexDevs" className="h-6 w-6" />
            <span className="text-base font-bold text-gray-100">ApexDevs</span>
          </Link>

          {/* Right: User Icon & Name */}
          <div className="w-auto">
            {isAuthenticated && user ? (
              <Link 
                to="/profile"
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-medium max-w-[60px] truncate">{user.username}</span>
              </Link>
            ) : (
              <Link 
                to="/login"
                className="text-xs font-medium text-gray-300 hover:text-white px-2 py-1 rounded transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="md:hidden h-[50px]"></div>
    </>
  );
}

export default MobileNavbar;
