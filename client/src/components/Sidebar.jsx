import Sort from './Sort';
import Filter from './Filter';

function Sidebar({ selectedTech, onTechChange, sortBy, onSortChange, isCollapsed, onToggleCollapse }) {
  return (
    <aside className={`fixed left-0 top-0 bottom-0 transition-all duration-300 z-40 ${
      isCollapsed ? 'w-16' : 'w-72'
    } bg-neutral-800 border-r border-neutral-600`}>
      {isCollapsed ? (
        <div className="h-full flex items-start justify-center pt-4">
          <button 
            className="p-2 text-primary hover:text-primary-light transition-colors" 
            onClick={onToggleCollapse} 
            title="Show Sidebar"
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
          <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-700">
            <h2 className="text-xl font-bold text-white">Filters & Sort</h2>
            <button 
              className="text-gray-400 hover:text-white transition-colors text-2xl" 
              onClick={onToggleCollapse}
              title="Collapse Sidebar"
            >
              ‹
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <Sort sortBy={sortBy} onSortChange={onSortChange} />
            
            <div className="border-t border-neutral-700 pt-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Tech Stack</h3>
              <div className="flex-1">
                <Filter 
                  selectedTech={selectedTech} 
                  onTechChange={onTechChange}
                  isCollapsed={false}
                  onToggleCollapse={onToggleCollapse}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
