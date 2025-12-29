import { Link } from 'react-router-dom';

function ChatHeaderMenu({ 
  participant, 
  headerMenuOpen, 
  setHeaderMenuOpen, 
  onBlockToggle, 
  onDeleteConversation,
  blockLoading,
  isBlocked 
}) {
  return (
    <div className="relative">
      <button
        className="p-1.5 text-gray-400 hover:text-white hover:bg-neutral-700/50 rounded transition-all"
        onClick={(e) => { e.stopPropagation(); setHeaderMenuOpen((s) => !s); }}
        aria-label="Open chat menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="5" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="19" cy="12" r="2" fill="currentColor" />
        </svg>
      </button>

      {headerMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setHeaderMenuOpen(false)}
          />
          
          <div className="absolute right-0 top-full mt-2 w-52 bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl z-50 overflow-hidden py-2" onClick={(e) => e.stopPropagation()}>
            <Link
              to={`/user/${participant?._id}`}
              className="flex items-center gap-3 px-2 py-1.5 mx-2 text-gray-300 hover:bg-primary hover:text-white rounded transition-all text-sm"
              onClick={() => setHeaderMenuOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
              </svg>
              View Profile
            </Link>
            
            <button
              className="w-full flex items-center gap-3 px-2 py-1.5 mx-2 text-gray-300 hover:bg-primary hover:text-white rounded transition-all disabled:opacity-50 text-sm"
              onClick={onBlockToggle}
              disabled={blockLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeLinecap="round"/>
              </svg>
              {blockLoading ? 'Loading...' : isBlocked ? 'Unblock User' : 'Block User'}
            </button>
            
            <div className="h-px bg-neutral-700 my-2 mx-2"></div>
            
            <button
              className="w-full flex items-center gap-3 px-2 py-1.5 mx-2 text-red-400 hover:bg-red-500 hover:text-white rounded transition-all text-sm"
              onClick={() => {
                setHeaderMenuOpen(false);
                onDeleteConversation();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11v6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11v6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete Conversation
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatHeaderMenu;
