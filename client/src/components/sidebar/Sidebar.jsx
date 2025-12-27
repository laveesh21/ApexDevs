import PropTypes from 'prop-types';

/**
 * Sidebar - Main container component for sidebar layout
 * Handles collapse/expand functionality and renders child components
 */
function Sidebar({ isCollapsed, onToggleCollapse, title = "Sidebar", children }) {
  return (
    <aside className={`fixed left-0 top-0 bottom-0 transition-all duration-300 z-40 ${
      isCollapsed ? 'w-16' : 'w-72'
    } bg-neutral-900 border-r border-neutral-700`}>
      {isCollapsed ? (
        <div className="h-full flex items-start justify-center pt-4">
          <button 
            className="p-2 text-primary hover:text-primary-light transition-colors" 
            onClick={onToggleCollapse} 
            title="Show Sidebar"
            aria-label="Expand sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="18" x2="20" y2="18"/>
              <circle cx="7" cy="6" r="2" fill="currentColor"/>
              <circle cx="14" cy="12" r="2" fill="currentColor"/>
              <circle cx="10" cy="18" r="2" fill="currentColor"/>
            </svg>
          </button>
        </div>
      ) : (
        <div className="h-full overflow-y-auto flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-800 sticky top-0 bg-neutral-900 z-10">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button 
              className="text-gray-400 hover:text-white transition-colors text-2xl" 
              onClick={onToggleCollapse}
              title="Collapse Sidebar"
              aria-label="Collapse sidebar"
            >
              ‹
            </button>
          </div>
          
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      )}
    </aside>
  );
}

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node
};

export default Sidebar;
