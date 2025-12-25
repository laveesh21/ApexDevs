import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSelectedAvatar } from '../utils/avatarHelper';
import { chatAPI, authAPI } from '../services/api';
import './Chat.css';

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
      <div className="chat-container">
        <div className="chat-loading">
          <div className="loading-spinner"></div>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Conversations List */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
        </div>
        
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div className="no-conversations">
              <p>No conversations yet</p>
              <p className="hint">Visit a user's profile to start chatting!</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`conversation-item ${selectedConversation?._id === conversation._id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  <img src={getSelectedAvatar(conversation.participant)} alt={conversation.participant?.username} />
                </div>
                
                <div className="conversation-info">
                  <div className="conversation-header">
                    <span className="conversation-name">{conversation.participant?.username}</span>
                    <span className="conversation-time">{formatTime(conversation.lastMessageAt)}</span>
                  </div>
                  
                  {conversation.lastMessage && (
                    <div className="conversation-preview">
                      <span className="preview-text">
                        {conversation.lastMessage.content}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="unread-badge">{conversation.unreadCount}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="chat-main">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-user">
                <div className="chat-header-avatar">
                  <img src={getSelectedAvatar(selectedConversation.participant)} alt={selectedConversation.participant?.username} />
                </div>
                <Link 
                  to={`/user/${selectedConversation.participant?._id}`}
                  className="chat-header-name"
                >
                  {selectedConversation.participant?.username}
                </Link>
              </div>

              <div className="chat-header-actions">
                <button
                  className="chat-header-menu"
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
                      className="menu-backdrop" 
                      onClick={() => setHeaderMenuOpen(false)}
                    />
                    
                    <div className="header-dropdown" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/user/${selectedConversation.participant?._id}`}
                        className="dropdown-item"
                        onClick={() => setHeaderMenuOpen(false)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="8" r="4"/>
                          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                        </svg>
                        View Profile
                      </Link>
                      
                      <button
                        className="dropdown-item"
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
                        className="dropdown-item delete-item"
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
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`message ${
                      (message.sender._id || message.sender.id || message.sender).toString() === (user._id || user.id).toString()
                        ? 'message-sent' 
                        : 'message-received'
                    }`}
                  >
                    <div className="message-bubble">
                      <p className="message-content">{message.content}</p>
                      <span className="message-time">{formatTime(message.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <textarea
                rows="1"
                className="chat-input"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                maxLength={2000}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={sending || !newMessage.trim()}
              >
                {sending ? '...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the list to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
