import { getSelectedAvatar } from '../../utils/avatarHelper';

function ConversationItem({ conversation, isSelected, onSelect, formatTime }) {
  return (
    <div
      className={`mx-2 mb-0.5 px-2 py-1.5 rounded cursor-pointer transition-all ${
        isSelected ? 'bg-neutral-700' : 'hover:bg-neutral-700/50'
      }`}
      onClick={() => onSelect(conversation)}
    >
      <div className="flex gap-3 items-center">
        <div className="relative flex-shrink-0">
          <img 
            src={getSelectedAvatar(conversation.participant)} 
            alt={conversation.participant?.username} 
            className="w-8 h-8 rounded-full object-cover"
          />
          {conversation.participant?.isOnline && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-neutral-800"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center gap-2">
            <span className="text-white font-medium truncate text-sm">
              {conversation.participant?.username}
            </span>
            {conversation.lastMessage && (
              <span className="text-gray-500 text-[10px] flex-shrink-0">
                {formatTime(conversation.lastMessageAt)}
              </span>
            )}
          </div>
          
          {conversation.lastMessage && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-gray-400 text-xs truncate leading-tight">
                {conversation.lastMessage.content}
              </span>
              {conversation.unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] text-center flex-shrink-0">
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConversationItem;
