import MessageItem from './MessageItem';

function MessagesList({ messages, currentUser, selectedConversation, formatTime, messagesEndRef }) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
          </div>
          <p className="text-gray-400 font-semibold text-sm">No messages yet</p>
          <p className="text-gray-500 text-xs mt-1">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div ref={messagesEndRef} />
      {messages.map((message, index) => {
        const isOwnMessage = (message.sender._id || message.sender.id || message.sender).toString() === 
                            (currentUser._id || currentUser.id).toString();
        const prevMessage = messages[index - 1];
        const isSameAuthor = prevMessage && 
          (prevMessage.sender._id || prevMessage.sender.id || prevMessage.sender).toString() === 
          (message.sender._id || message.sender.id || message.sender).toString();
        const showAvatar = !isSameAuthor;
        
        return (
          <MessageItem
            key={message._id}
            message={message}
            isOwnMessage={isOwnMessage}
            showAvatar={showAvatar}
            currentUser={currentUser}
            participant={selectedConversation.participant}
            formatTime={formatTime}
          />
        );
      })}
    </div>
  );
}

export default MessagesList;
