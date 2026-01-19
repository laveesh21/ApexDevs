import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessagesList from '../components/chat/MessagesList';
import MessageInput from '../components/chat/MessageInput';
import EmptyChatState from '../components/chat/EmptyChatState';

function Chat() {
  const { userId } = useParams();
  const { user, token } = useAuth();
  
  const {
    conversations,
    selectedConversation,
    messages,
    newMessage,
    setNewMessage,
    loading,
    sending,
    headerMenuOpen,
    setHeaderMenuOpen,
    blockLoading,
    isBlocked,
    messagesEndRef,
    handleSelectConversation,
    handleSendMessage,
    handleKeyDown,
    handleDeleteConversation,
    handleBlockToggle,
    formatTime
  } = useChat(userId, token, user);

  // Close header menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!headerMenuOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') setHeaderMenuOpen(false);
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [headerMenuOpen]);

  if (loading && !selectedConversation) {
    return (
      <div className="min-h-screen bg-neutral-900 py-8 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 flex overflow-hidden" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Conversations Sidebar */}
      <ChatSidebar
        user={user}
        token={token}
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        formatTime={formatTime}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-neutral-900 relative">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              participant={selectedConversation.participant}
              headerMenuOpen={headerMenuOpen}
              setHeaderMenuOpen={setHeaderMenuOpen}
              onBlockToggle={handleBlockToggle}
              onDeleteConversation={() => handleDeleteConversation(selectedConversation._id)}
              blockLoading={blockLoading}
              isBlocked={isBlocked}
            />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent flex flex-col-reverse">
              <MessagesList
                messages={messages}
                currentUser={user}
                selectedConversation={selectedConversation}
                formatTime={formatTime}
                messagesEndRef={messagesEndRef}
              />
            </div>

            {/* Message Input */}
            <MessageInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              onKeyDown={handleKeyDown}
              sending={sending}
              participantUsername={selectedConversation.participant?.username}
            />
          </>
        ) : (
          <EmptyChatState />
        )}
      </div>
    </div>
  );
}

export default Chat;
