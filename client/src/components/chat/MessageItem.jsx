import UserAvatar from './UserAvatar';

function MessageItem({ message, isOwnMessage, showAvatar, currentUser, participant, formatTime }) {
  return (
    <div
      className={`group flex align-center gap-3 px-4 py-0.5 hover:bg-neutral-800/50 -mx-4 ${showAvatar ? 'mt-4' : 'mt-0'}`}
    >
      <div className="w-10 flex-shrink-0">
        {showAvatar && (
          <UserAvatar 
            user={isOwnMessage ? currentUser : participant} 
            size="md"
          />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`font-medium text-sm ${
              isOwnMessage ? 'text-blue-500' : 'text-purple-400'
            }`}>
              {isOwnMessage ? 'You' : participant?.username}
            </span>
            <span className="text-gray-500 text-[11px]">
              {formatTime(message.createdAt)}
            </span>
          </div>
        )}
        <p className="text-gray-200 text-[15px] break-words whitespace-pre-wrap leading-snug">
          {message.content}
        </p>
      </div>
      
      <span className="opacity-0 group-hover:opacity-100 text-gray-500 text-[10px] transition-opacity flex-shrink-0">
        {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </span>
    </div>
  );
}

export default MessageItem;
