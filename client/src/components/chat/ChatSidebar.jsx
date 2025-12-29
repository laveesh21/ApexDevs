import ConversationItem from './ConversationItem';
import UserStatusBar from './UserStatusBar';

function ChatSidebar({ user, token, conversations, selectedConversation, onSelectConversation, formatTime }) {
  return (
    <div className="w-full md:w-60 bg-neutral-800 border-r border-neutral-700 flex flex-col">
      {/* Sidebar Header */}
      <div className="px-4 py-3 border-b border-neutral-700">
        <h2 className="text-base font-semibold text-white">
          Direct Messages
        </h2>
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-transparent">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="w-14 h-14 bg-neutral-700/50 rounded-full flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
            <p className="text-gray-400 font-medium text-sm mb-1">No conversations</p>
            <p className="text-gray-500 text-xs">Visit a profile to start chatting</p>
          </div>
        ) : (
          <div className="py-2">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                isSelected={selectedConversation?._id === conversation._id}
                onSelect={onSelectConversation}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </div>

      {/* User Status Bar at Bottom */}
      <UserStatusBar user={user} token={token} />
    </div>
  );
}

export default ChatSidebar;
