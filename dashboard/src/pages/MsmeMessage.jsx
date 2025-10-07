import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MsmeSidebar from './MsmeSidebar';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import socketService from '../utils/socketService';
import messageService from '../utils/messageService';
import '../css/MsmeMessage.css';

const MsmeMessage = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const navigate = useNavigate();
  const { user, isAuthenticated, userType } = useAuth(); // Use AuthContext
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Set current user from AuthContext
  useEffect(() => {
    console.log('🔍 Setting up MSME user from AuthContext:', {
      isAuthenticated,
      userType,
      user: !!user
    });
    
    if (isAuthenticated && userType === 'msme' && user) {
      const currentUserData = {
        id: user._id || user.id,
        userType: 'MSME',
        businessName: user.businessName,
        username: user.username
      };
      console.log('✅ Setting current MSME user from AuthContext:', currentUserData);
      setCurrentUser(currentUserData);
    } else {
      console.log('❌ MSME user not authenticated or not an MSME');
      setCurrentUser(null);
    }
  }, [isAuthenticated, userType, user]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (currentUser) {
      const socket = socketService.connect({
        userId: currentUser.id,
        userType: currentUser.userType.toLowerCase()
      });

      // Listen for connection status
      socket.on('connect', () => {
        setIsConnected(true);
        console.log('✅ Connected to messaging server');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('❌ Disconnected from messaging server');
      });

      // Listen for new messages
      socket.on('receive_message', (message) => {
        setMessages(prev => [...prev, message]);
        updateConversationLastMessage(message);
        scrollToBottom();
      });

      // Listen for message confirmations
      socket.on('message_sent', (data) => {
        setSending(false);
        // Update temporary message with real message data
        setMessages(prev => prev.map(msg =>
          msg.tempId === data.tempId ? data.message : msg
        ));
      });

      // Listen for message errors
      socket.on('message_error', (data) => {
        setSending(false);
        console.error('Message error:', data.error);
        // Remove failed message
        setMessages(prev => prev.filter(msg => msg.tempId !== data.tempId));
      });

      // Listen for typing indicators
      socket.on('user_typing', (data) => {
        setTypingUsers(prev => new Set([...prev, data.userId]));
      });

      socket.on('user_stop_typing', (data) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      });

      // Listen for read receipts
      socket.on('messages_read', (data) => {
        if (selectedChat && data.conversationId === selectedChat._id) {
          setMessages(prev => prev.map(msg => ({
            ...msg,
            isRead: msg.receiverId === data.readBy ? true : msg.isRead
          })));
        }
      });

      // Listen for new message notifications
      socket.on('new_message_notification', (data) => {
        // Update unread count in conversations list
        setConversations(prev => prev.map(conv => 
          conv._id === data.conversationId 
            ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
            : conv
        ));
      });

      // Load conversations on mount
      loadConversations();

      return () => {
        socketService.disconnect();
      };
    }
  }, [currentUser, selectedChat]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.msme-messages__dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  const loadConversations = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const convs = await messageService.getUserConversations(
        currentUser.id, 
        currentUser.userType
      );
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const { messages } = await messageService.getConversationMessages(conversationId);
      setMessages(messages);
      
      // Join conversation room for real-time updates
      socketService.joinConversation(conversationId);
      
      // Mark messages as read
      if (messages.some(msg => msg.receiverId === currentUser.id && !msg.isRead)) {
        await messageService.markMessagesAsRead(conversationId, currentUser.id);
        socketService.markMessagesRead({
          conversationId,
          userId: currentUser.id
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update conversation last message in the list
  const updateConversationLastMessage = (message) => {
    setConversations(prev => prev.map(conv => 
      conv._id === message.conversationId 
        ? { 
            ...conv, 
            lastMessage: message,
            lastActivity: message.createdAt,
            unreadCount: message.receiverId === currentUser.id ? (conv.unreadCount || 0) + 1 : 0
          }
        : conv
    ));
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSidebarToggle = (stateOrIsOpen, isMobile = false) => {
    if (typeof stateOrIsOpen === 'object') {
      setSidebarState({ 
        isOpen: stateOrIsOpen.isOpen, 
        isMobile: stateOrIsOpen.isMobile,
        isCollapsed: stateOrIsOpen.isCollapsed || false
      });
    } else {
      setSidebarState({ 
        isOpen: stateOrIsOpen, 
        isMobile,
        isCollapsed: false
      });
    }
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'msme-messages__content msme-messages__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'msme-messages__content msme-messages__content--sidebar-open' 
      : 'msme-messages__content msme-messages__content--sidebar-collapsed';
  };

  const handleChatSelect = (conversation) => {
    setSelectedChat(conversation);
    setMessages([]);
    loadMessages(conversation._id);
    
    // Reset unread count for this conversation
    setConversations(prev => prev.map(conv =>
      conv._id === conversation._id ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const handleDeleteConversation = async () => {
    if (!selectedChat) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.');
    
    if (confirmDelete) {
      try {
        await messageService.deleteConversation(selectedChat._id);
        
        // Remove from conversations list
        setConversations(prev => prev.filter(conv => conv._id !== selectedChat._id));
        
        // Clear selected chat and messages
        setSelectedChat(null);
        setMessages([]);
        setShowDropdown(false);
        
        console.log('✅ Conversation deleted successfully');
      } catch (error) {
        console.error('❌ Error deleting conversation:', error);
        alert('Failed to delete conversation. Please try again.');
      }
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat || sending) return;

    setSending(true);
    const tempId = Date.now().toString();
    
    // Find the other participant (customer)
    const otherParticipant = selectedChat.otherParticipant;
    if (!otherParticipant) {
      console.error('No other participant found');
      setSending(false);
      return;
    }

    const messageData = {
      conversationId: selectedChat._id,
      senderId: currentUser.id,
      senderModel: currentUser.userType,
      receiverId: otherParticipant.id,
      receiverModel: 'Customer',
      message: newMessage.trim(),
      tempId
    };

    // Add temporary message to UI
    const tempMessage = {
      tempId,
      _id: tempId,
      conversationId: selectedChat._id,
      senderId: {
        _id: currentUser.id,
        businessName: currentUser.businessName,
        username: currentUser.username
      },
      receiverId: otherParticipant.id,
      message: newMessage.trim(),
      createdAt: new Date(),
      isRead: false,
      sending: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    scrollToBottom();

    // Send via Socket.IO
    socketService.sendMessage(messageData);
  };

  const handleTyping = () => {
    if (!selectedChat) return;

    // Send typing indicator
    socketService.sendTyping({
      conversationId: selectedChat._id,
      userId: currentUser.id,
      userType: currentUser.userType
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping({
        conversationId: selectedChat._id,
        userId: currentUser.id
      });
    }, 3000);
  };

  const handleViewCustomer = (customerId) => {
    navigate(`/msme/customer/${customerId}`);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCustomerName = (participant) => {
    if (!participant) return 'Unknown Customer';
    if (participant.firstname && participant.lastname) {
      return `${participant.firstname} ${participant.lastname}`;
    }
    return participant.username || 'Unknown Customer';
  };

  const getCustomerAvatar = (participant) => {
    if (!participant) return 'U';
    if (participant.firstname) return participant.firstname.charAt(0).toUpperCase();
    if (participant.username) return participant.username.charAt(0).toUpperCase();
    return 'U';
  };

  const filteredConversations = conversations.filter(conv => {
    if (!conv.otherParticipant) return false;
    
    const customerName = getCustomerName(conv.otherParticipant);
    const lastMessage = conv.lastMessage?.message || '';
    
    return customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="msme-messages">
      <MsmeSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="msme-messages__header">
          <div className="msme-messages__header-content">
            <div className="msme-messages__header-text">

            </div>
          </div>
        </div>

        <div className="msme-messages__layout">
          {/* Conversations List */}
          <div className="msme-messages__conversations-panel">
            <div className="msme-messages__conversations-header">
              <h2 className="msme-messages__panel-title">
                Customer Messages
                {!isConnected && (
                  <span className="msme-messages__connection-status">
                    • Connecting...
                  </span>
                )}
                {isConnected && (
                  <span className="msme-messages__connection-status msme-messages__connection-status--connected">
                    • Online
                  </span>
                )}
              </h2>
              <div className="msme-messages__search-box">
                <SearchIcon className="msme-messages__search-icon" />
                <input
                  type="text"
                  className="msme-messages__search-input"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                />
                {searchTerm && (
                  <button 
                    className="msme-messages__clear-search" 
                    onClick={() => setSearchTerm('')}
                    title="Clear search"
                  >
                    <ClearIcon />
                  </button>
                )}
              </div>
            </div>
            <div className="msme-messages__conversations-list">
              {loading && conversations.length === 0 ? (
                <div className="msme-messages__loading">
                  <p>Loading conversations...</p>
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className={`msme-messages__conversation-item ${selectedChat?._id === conversation._id ? 'msme-messages__conversation-item--active' : ''} ${conversation.unreadCount > 0 ? 'msme-messages__conversation-item--unread' : ''}`}
                    onClick={() => handleChatSelect(conversation)}
                  >
                    <div className="msme-messages__conversation-avatar">
                      {getCustomerAvatar(conversation.otherParticipant)}
                    </div>
                    <div className="msme-messages__conversation-info">
                      <div className="msme-messages__conversation-header">
                        <h4 className="msme-messages__conversation-name">
                          {getCustomerName(conversation.otherParticipant)}
                        </h4>
                        <span className="msme-messages__conversation-time">
                          {formatTime(conversation.lastActivity)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <div className="msme-messages__unread-indicator">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                      <p className="msme-messages__conversation-type">Customer</p>
                      <p className="msme-messages__last-message">
                        {conversation.lastMessage?.message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="msme-messages__no-conversations">
                  <p className="msme-messages__no-conversations-text">
                    {searchTerm ? 'No conversations found' : 'No customer messages yet'}
                  </p>
                  {searchTerm ? (
                    <p className="msme-messages__search-hint">Try adjusting your search terms</p>
                  ) : (
                    <p className="msme-messages__search-hint">
                      When customers contact you, their messages will appear here
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="msme-messages__chat-panel">
            {selectedChat ? (
              <>
                <div className="msme-messages__chat-header">
                  <div className="msme-messages__chat-info">
                    <div className="msme-messages__chat-avatar">
                      {getCustomerAvatar(selectedChat.otherParticipant)}
                    </div>
                    <div className="msme-messages__chat-details">
                      <h3 className="msme-messages__chat-name">
                        {getCustomerName(selectedChat.otherParticipant)}
                      </h3>
                      <p className="msme-messages__chat-type">Customer</p>
                    </div>
                  </div>
                  <div className="msme-messages__chat-actions">
                    <div className="msme-messages__dropdown-container">
                      <button 
                        className="msme-messages__action-btn msme-messages__action-btn--icon"
                        onClick={toggleDropdown}
                      >
                        <MoreVertIcon />
                      </button>
                      {showDropdown && (
                        <div className="msme-messages__dropdown-menu">
                          <button 
                            className="msme-messages__dropdown-item msme-messages__dropdown-item--danger"
                            onClick={handleDeleteConversation}
                          >
                            <DeleteIcon />
                            Delete Conversation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="msme-messages__chat-messages">
                  {loading && messages.length === 0 ? (
                    <div className="msme-messages__loading-messages">
                      <p>Loading messages...</p>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((message) => {
                      const isOwn = message.senderId._id === currentUser.id || message.senderId === currentUser.id;
                      return (
                        <div
                          key={message._id || message.tempId}
                          className={`msme-messages__message ${isOwn ? 'msme-messages__message--own' : 'msme-messages__message--other'}`}
                        >
                          <div className="msme-messages__message-content">
                            {message.message}
                            {message.sending && (
                              <span className="msme-messages__message-sending">Sending...</span>
                            )}
                          </div>
                          <div className="msme-messages__message-time">
                            {formatMessageTime(message.createdAt)}
                            {isOwn && message.isRead && (
                              <span className="msme-messages__message-read">✓✓</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="msme-messages__no-messages">
                      <p>No messages yet</p>
                      <p>Start the conversation with this customer!</p>
                    </div>
                  )}
                  {typingUsers.size > 0 && (
                    <div className="msme-messages__typing-indicator">
                      <span>Customer is typing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="msme-messages__chat-input">
                  <button className="msme-messages__attach-btn" disabled>
                    <AttachFileIcon />
                  </button>
                  <input
                    type="text"
                    className="msme-messages__input-field"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={!isConnected}
                  />
                  <button 
                    onClick={handleSendMessage} 
                    className="msme-messages__send-button"
                    disabled={!newMessage.trim() || sending || !isConnected}
                  >
                    {sending ? '...' : <SendIcon />}
                  </button>
                </div>
              </>
            ) : (
              <div className="msme-messages__no-chat-selected">
                <h3 className="msme-messages__no-chat-title">Select a conversation to start messaging</h3>
                <p className="msme-messages__no-chat-text">Choose from your existing conversations with customers</p>
                {!isConnected && (
                  <p className="msme-messages__connection-warning">
                    ⚠️ Connecting to messaging server...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MsmeMessage;
