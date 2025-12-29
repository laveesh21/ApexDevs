import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSelectedAvatar } from '../utils/avatarHelper';
import { chatAPI, authAPI } from '../services/api';

function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Close header menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!headerMenuOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') setHeaderMenuOpen(false);
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [headerMenuOpen]);

  // Update online status on mount and before unmount
  useEffect(() => {
    const updateStatus = async (isOnline) => {
      try {
        await chatAPI.updateOnlineStatus(token, isOnline);
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    };

    // Set user as online
    updateStatus(true);

    // Set user as offline on unmount
    return () => {
      updateStatus(false);
    };
  }, [token]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // If userId in URL, create/open that conversation
  useEffect(() => {
    if (userId && token) {
      openConversationWithUser(userId);
    }
  }, [userId, token]);

  // Poll for new messages every 5 seconds when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Set up new interval
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages(selectedConversation._id, true);
      }, 5000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [selectedConversation]);

  // Scroll to bottom only on initial load or when sending a message
  const shouldScrollRef = useRef(true);
  
  useEffect(() => {
    if (shouldScrollRef.current) {
      scrollToBottom();
      shouldScrollRef.current = false;
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getConversations(token);
      setConversations(response.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openConversationWithUser = async (targetUserId) => {
    try {
      const response = await chatAPI.getOrCreateConversation(token, targetUserId);
      setSelectedConversation(response.data);
      shouldScrollRef.current = true; // Enable scroll for new conversation
      fetchMessages(response.data._id);
      
      // Check if user is blocked
      await checkBlockedStatus(targetUserId);
      
      // Mark as read
      await chatAPI.markAsRead(token, response.data._id);
      
      // Refresh conversations list to update unread count
      fetchConversations();
    } catch (error) {
      // Show user-friendly error message
      const errorMsg = error.message || '';
      if (errorMsg.includes('disabled messages')) {
        alert('This user has disabled all messages.');
      } else if (errorMsg.includes('existing conversations')) {
        alert('This user only accepts messages from existing conversations.');
      } else if (errorMsg.includes('follow')) {
        alert('This user only accepts messages from people they follow or who follow them.');
      } else if (errorMsg.includes('blocked')) {
        alert('Cannot message this user due to blocking.');
      } else if (errorMsg.includes('User not found')) {
        alert('User not found. They may have deleted their account.');
      } else {
        alert(`Unable to start conversation: ${errorMsg || 'Please try again.'}`);
      }
    }
  };

  const checkBlockedStatus = async (targetUserId) => {
    try {
      const response = await authAPI.getBlockedUsers(token);
      const blockedUserIds = response.data.map(u => u._id);
      setIsBlocked(blockedUserIds.includes(targetUserId));
    } catch (error) {
      console.error('Error checking blocked status:', error);
    }
  };

  const fetchMessages = async (conversationId, silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const response = await chatAPI.getMessages(token, conversationId);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    shouldScrollRef.current = true; // Enable scroll for new conversation
    fetchMessages(conversation._id);
    
    // Check if user is blocked
    await checkBlockedStatus(conversation.participant._id);
    
    // Mark as read
    await chatAPI.markAsRead(token, conversation._id);
    
    // Update conversations list
    fetchConversations();
    
    // Update URL
    navigate(`/chat/${conversation.participant._id}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      shouldScrollRef.current = true; // Enable scroll when sending message
      await chatAPI.sendMessage(token, selectedConversation._id, newMessage.trim());
      setNewMessage('');
      
      // Fetch messages to get the new one
      await fetchMessages(selectedConversation._id, true);
      
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      // Show specific error message
      const errorMsg = error.message || '';
      if (errorMsg.includes('disabled messages')) {
        alert('This user has disabled all messages.');
      } else if (errorMsg.includes('existing conversations')) {
        alert('This user only accepts messages from existing conversations.');
      } else if (errorMsg.includes('follow')) {
        alert('This user only accepts messages from people they follow or who follow them.');
      } else {
        alert(error.message || 'Failed to send message');
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
    // If Shift+Enter, allow default behavior (new line)
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await chatAPI.deleteConversation(token, conversationId);
      
      if (selectedConversation?._id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
        navigate('/chat');
      }
      
      fetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation');
    }
  };

  // close header menu when conversation changes
  useEffect(() => {
    setHeaderMenuOpen(false);
  }, [selectedConversation?._id]);

  const handleBlockToggle = async () => {
    if (!selectedConversation?.participant?._id) return;

    const confirmMessage = isBlocked 
      ? 'Are you sure you want to unblock this user?' 
      : 'Are you sure you want to block this user? They won\'t be able to view your profile or message you, and this conversation will be deleted.';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setBlockLoading(true);
    try {
      if (isBlocked) {
        await authAPI.unblockUser(token, selectedConversation.participant._id);
        setIsBlocked(false);
        alert('User unblocked successfully');
      } else {
        await authAPI.blockUser(token, selectedConversation.participant._id);
        setIsBlocked(true);
        alert('User blocked successfully');
        
        // Delete the conversation and navigate back
        await handleDeleteConversation(selectedConversation._id);
        setSelectedConversation(null);
        setMessages([]);
        navigate('/chat');
      }
    } catch (error) {
      console.error('Failed to toggle block:', error);
      alert(error.message || 'Failed to update block status');
    } finally {
      setBlockLoading(false);
      setHeaderMenuOpen(false);
    }
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

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
      <div className="w-full md:w-60 bg-neutral-800 border-r border-neutral-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="px-4 py-3 border-b border-neutral-700 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            Direct Messages
          </h2>
          <div className="relative">
            <img 
              src={getSelectedAvatar(user)} 
              alt={user?.username} 
              className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-neutral-800"></div>
          </div>
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
                <div
                  key={conversation._id}
                  className={`mx-2 mb-0.5 px-2 py-1.5 rounded cursor-pointer transition-all ${
                    selectedConversation?._id === conversation._id 
                      ? 'bg-neutral-700' 
                      : 'hover:bg-neutral-700/50'
                  }`}
                  onClick={() => handleSelectConversation(conversation)}
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
                        <span className="text-white font-medium truncate text-sm">{conversation.participant?.username}</span>
                        {conversation.lastMessage && (
                          <span className="text-gray-500 text-[10px] flex-shrink-0">{formatTime(conversation.lastMessageAt)}</span>
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-neutral-900 relative">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-4 h-12 border-b border-neutral-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <img 
                    src={getSelectedAvatar(selectedConversation.participant)} 
                    alt={selectedConversation.participant?.username} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  {selectedConversation.participant?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-neutral-900"></div>
                  )}
                </div>
                <div>
                  <Link 
                    to={`/user/${selectedConversation.participant?._id}`}
                    className="text-white font-semibold hover:text-primary transition-all text-sm block"
                  >
                    {selectedConversation.participant?.username}
                  </Link>
                  {selectedConversation.participant?.isOnline ? (
                    <span className="text-xs text-green-400">Online</span>
                  ) : (
                    <span className="text-xs text-gray-500">Offline</span>
                  )}
                </div>
              </div>

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
                        to={`/user/${selectedConversation.participant?._id}`}
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
                        onClick={handleBlockToggle}
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
                          handleDeleteConversation(selectedConversation._id);
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
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
              {messages.length === 0 ? (
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
              ) : (
                messages.map((message, index) => {
                  const isOwnMessage = (message.sender._id || message.sender.id || message.sender).toString() === (user._id || user.id).toString();
                  const prevMessage = messages[index - 1];
                  const isSameAuthor = prevMessage && 
                    (prevMessage.sender._id || prevMessage.sender.id || prevMessage.sender).toString() === 
                    (message.sender._id || message.sender.id || message.sender).toString();
                  const showAvatar = !isSameAuthor;
                  
                  return (
                    <div
                      key={message._id}
                      className={`group flex items-start gap-3 px-4 py-0.5 hover:bg-neutral-800/50 -mx-4 ${showAvatar ? 'mt-4' : 'mt-0'}`}
                    >
                      <div className="w-10 flex-shrink-0">
                        {showAvatar && !isOwnMessage && (
                          <img 
                            src={getSelectedAvatar(selectedConversation.participant)} 
                            alt={selectedConversation.participant?.username}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {showAvatar && (
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className={`font-medium text-sm ${
                              isOwnMessage ? 'text-primary' : 'text-white'
                            }`}>
                              {isOwnMessage ? 'You' : selectedConversation.participant?.username}
                            </span>
                            <span className="text-gray-500 text-[11px]">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        )}
                        <p className="text-gray-200 text-[15px] break-words whitespace-pre-wrap leading-snug">{message.content}</p>
                      </div>
                      
                      <span className="opacity-0 group-hover:opacity-100 text-gray-500 text-[10px] transition-opacity flex-shrink-0">
                        {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form className="px-4 pb-6" onSubmit={handleSendMessage}>
              <div className="flex items-center gap-3 bg-neutral-800 rounded-lg px-4 py-2.5 border border-neutral-700 focus-within:border-primary/50 transition-all">
                <textarea
                  rows="1"
                  className="flex-1 bg-transparent text-white text-sm outline-none resize-none max-h-32 placeholder-gray-500"
                  placeholder={`Message @${selectedConversation.participant?.username}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  maxLength={2000}
                />
                <button
                  type="submit"
                  className={`flex-shrink-0 transition-all ${
                    sending || !newMessage.trim()
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-primary hover:text-primary/80'
                  }`}
                  disabled={sending || !newMessage.trim()}
                  aria-label="Send message"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white mb-2">No conversation selected</h3>
            <p className="text-gray-400 text-sm max-w-sm">Choose a conversation from the sidebar to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
