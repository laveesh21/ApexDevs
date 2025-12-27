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
    <div className="min-h-screen bg-neutral-900">
      <div className="h-screen flex">
        {/* Conversations List */}
        <div className="w-80 bg-neutral-800 border-r border-neutral-600 flex flex-col">
          <div className="p-6 border-b border-neutral-600">
            <h2 className="text-2xl font-bold text-white">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-400 mb-2">No conversations yet</p>
                <p className="text-gray-500 text-sm">Visit a user's profile to start chatting!</p>
              </div>
            ) : (
              <div>
                {conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className={`p-4 border-b border-neutral-600 cursor-pointer hover:bg-neutral-700 transition-colors ${
                      selectedConversation?._id === conversation._id ? 'bg-neutral-700' : ''
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex gap-3">
                      <img 
                        src={getSelectedAvatar(conversation.participant)} 
                        alt={conversation.participant?.username} 
                        className="w-12 h-12 rounded-full border-2 border-neutral-600 object-cover"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-white font-medium truncate">{conversation.participant?.username}</span>
                          <span className="text-gray-500 text-xs">{formatTime(conversation.lastMessageAt)}</span>
                        </div>
                        
                        {conversation.lastMessage && (
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-gray-400 text-sm truncate">
                              {conversation.lastMessage.content}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-primary text-neutral-900 text-xs font-bold rounded-full">
                                {conversation.unreadCount}
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

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-neutral-900">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-neutral-800 border-b border-neutral-600 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img 
                  src={getSelectedAvatar(selectedConversation.participant)} 
                  alt={selectedConversation.participant?.username} 
                  className="w-10 h-10 rounded-full border-2 border-neutral-600 object-cover"
                />
                <Link 
                  to={`/user/${selectedConversation.participant?._id}`}
                  className="text-white font-medium hover:text-primary transition-colors"
                >
                  {selectedConversation.participant?.username}
                </Link>
              </div>

              <div className="relative">
                <button
                  className="p-2 text-gray-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
                  onClick={(e) => { e.stopPropagation(); setHeaderMenuOpen((s) => !s); }}
                  aria-label="Open chat menu"
                >
                  {/* three dots icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="5" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="19" cy="12" r="2" fill="currentColor" />
                  </svg>
                </button>

                {headerMenuOpen && (
                  <>
                    {/* Backdrop to block interaction and close on click */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setHeaderMenuOpen(false)}
                    />
                    
                    <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-800 border border-neutral-600 rounded-xl shadow-xl z-50" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/user/${selectedConversation.participant?._id}`}
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-neutral-700 hover:text-white transition-colors rounded-t-xl"
                        onClick={() => setHeaderMenuOpen(false)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="8" r="4"/>
                          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                        </svg>
                        View Profile
                      </Link>
                      
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-50"
                        onClick={handleBlockToggle}
                        disabled={blockLoading}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeLinecap="round"/>
                        </svg>
                        {blockLoading ? 'Loading...' : isBlocked ? 'Unblock User' : 'Block User'}
                      </button>
                      
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors rounded-b-xl"
                        onClick={() => {
                          setHeaderMenuOpen(false);
                          handleDeleteConversation(selectedConversation._id);
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      (message.sender._id || message.sender.id || message.sender).toString() === (user._id || user.id).toString()
                        ? 'justify-end' 
                        : 'justify-start'
                    }`}
                  >
                    <div className={`max-w-md rounded-xl px-4 py-2 ${
                      (message.sender._id || message.sender.id || message.sender).toString() === (user._id || user.id).toString()
                        ? 'bg-primary text-neutral-900'
                        : 'bg-neutral-800 border border-neutral-600 text-white'
                    }`}>
                      <p className="break-words text-inherit">{message.content}</p>
                      <span className={`block text-xs mt-1 ${
                        (message.sender._id || message.sender.id || message.sender).toString() === (user._id || user.id).toString()
                          ? 'text-neutral-900/70'
                          : 'text-gray-500'
                      }`}>{formatTime(message.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form className="p-4 bg-neutral-800 border-t border-neutral-600 flex gap-3" onSubmit={handleSendMessage}>
              <textarea
                rows="1"
                className="flex-1 px-4 py-2 bg-neutral-700 border border-neutral-600 text-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                maxLength={2000}
              />
              <button
                type="submit"
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  sending || !newMessage.trim()
                    ? 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-neutral-900 hover:bg-primary-light'
                }`}
                disabled={sending || !newMessage.trim()}
              >
                {sending ? '...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="text-gray-600 mb-4" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
            <p className="text-gray-400">Choose a conversation from the list to start chatting</p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}

export default Chat;
