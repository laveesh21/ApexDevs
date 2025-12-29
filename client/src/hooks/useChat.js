import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI, authAPI } from '../services/api';

export function useChat(userId, token, user) {
  const navigate = useNavigate();
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
  const shouldScrollRef = useRef(true);

  // Update online status on mount and before unmount
  useEffect(() => {
    const updateStatus = async (isOnline) => {
      try {
        await chatAPI.updateOnlineStatus(token, isOnline);
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    };

    updateStatus(true);
    return () => updateStatus(false);
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
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

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

  // Update selected conversation when conversations list changes
  useEffect(() => {
    if (selectedConversation && conversations.length > 0) {
      const updatedConversation = conversations.find(c => c._id === selectedConversation._id);
      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
      }
    }
  }, [conversations]);

  // Scroll to bottom only on initial load or when sending a message
  useEffect(() => {
    if (shouldScrollRef.current) {
      scrollToBottom();
      shouldScrollRef.current = false;
    }
  }, [messages]);

  // Close header menu when conversation changes
  useEffect(() => {
    setHeaderMenuOpen(false);
  }, [selectedConversation?._id]);

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
      shouldScrollRef.current = true;
      fetchMessages(response.data._id);
      
      await checkBlockedStatus(targetUserId);
      await chatAPI.markAsRead(token, response.data._id);
      fetchConversations();
    } catch (error) {
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
      if (!silent) setLoading(true);
      const response = await chatAPI.getMessages(token, conversationId);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    shouldScrollRef.current = true;
    fetchMessages(conversation._id);
    
    await checkBlockedStatus(conversation.participant._id);
    await chatAPI.markAsRead(token, conversation._id);
    await fetchConversations();
    
    try {
      const response = await chatAPI.getOrCreateConversation(token, conversation.participant._id);
      setSelectedConversation(response.data);
    } catch (error) {
      console.error('Error refreshing conversation:', error);
    }
    
    navigate(`/chat/${conversation.participant._id}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      shouldScrollRef.current = true;
      await chatAPI.sendMessage(token, selectedConversation._id, newMessage.trim());
      setNewMessage('');
      
      await fetchMessages(selectedConversation._id, true);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
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

  return {
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
  };
}
