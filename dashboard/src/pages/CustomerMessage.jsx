import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CustomerSidebar from './CustomerSidebar';
import Notification from '../components/Notification';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StoreIcon from '@mui/icons-material/Store';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import socketService from '../utils/socketService';
import messageService from '../utils/messageService';
import '../css/CustomerMessage.css';

const CustomerMessage = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'info',
    title: '',
    message: '',
    showConfirmButtons: false,
    onConfirm: () => {},
    onCancel: () => {}
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, userType } = useAuth(); // Use AuthContext
  const { storeId } = useParams(); // For direct message to a store
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get query parameters for direct store messaging
  const queryParams = new URLSearchParams(location.search);
  const queryStoreId = queryParams.get('storeId');
  const queryStoreName = queryParams.get('storeName');
  
  console.log('🔍 URL Debug - CustomerMessage:', { 
    pathname: location.pathname, 
    search: location.search, 
    storeId: storeId,
    queryStoreId: queryStoreId,
    actualStoreId: storeId || queryStoreId,
    fullLocation: location,
    routeMatches: location.pathname.includes('/customer-message/')
  });

  // Set current user from AuthContext
  useEffect(() => {
    console.log('🔍 Setting up user from AuthContext:', {
      isAuthenticated,
      userType,
      user: !!user
    });
    
    if (isAuthenticated && userType === 'customer' && user) {
      const currentUserData = {
        id: user._id || user.id,
        userType: 'Customer',
        firstName: user.firstname,
        lastName: user.lastname,
        username: user.username
      };
      console.log('✅ Setting current user from AuthContext:', currentUserData);
      setCurrentUser(currentUserData);
    } else {
      console.log('❌ User not authenticated or not a customer');
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
        setMessages(prev => prev.map(msg =>
          msg.tempId === data.tempId ? data.message : msg
        ));
      });

      // Listen for message errors
      socket.on('message_error', (data) => {
        setSending(false);
        console.error('Message error:', data.error);
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
        
        // Update conversation unread count when messages are read
        if (data.readBy === currentUser.id) {
          setConversations(prev => prev.map(conv =>
            conv._id === data.conversationId ? { ...conv, unreadCount: 0 } : conv
          ));
        }
      });

      // Listen for new message notifications
      socket.on('new_message_notification', (data) => {
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
      if (showDropdown && !event.target.closest('.customer-messages__dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Handle store conversation creation when currentUser is available and storeId is provided
  useEffect(() => {
    console.log('StoreId useEffect triggered:', { 
      currentUser: !!currentUser, 
      storeId, 
      queryStoreId,
      customerType: currentUser?.userType 
    });
    
    if (currentUser && (storeId || queryStoreId)) {
      const targetStoreId = storeId || queryStoreId;
      console.log('🏪 Auto-creating conversation with MSME store ID:', targetStoreId);
      console.log('👤 Customer details:', {
        id: currentUser.id,
        type: currentUser.userType,
        name: `${currentUser.firstName} ${currentUser.lastName}`
      });
      
      createConversationWithStore(targetStoreId);
    }
  }, [currentUser, storeId, queryStoreId]);

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

  // Create conversation with a specific store
  const createConversationWithStore = async (storeId) => {
    if (!currentUser) {
      console.log('Cannot create conversation - currentUser is null');
      return;
    }

    console.log('Creating conversation with store:', storeId, 'user:', currentUser.id);
    try {
      setLoading(true);
      
      const conversation = await messageService.createOrGetConversation(
        currentUser.id,
        currentUser.userType,
        storeId,
        'MSME'
      );
      
      console.log('✅ Conversation created/found:', conversation);
      
      // Add to conversations if not already there
      setConversations(prev => {
        const exists = prev.find(conv => conv._id === conversation._id);
        return exists ? prev : [conversation, ...prev];
      });
      
      // Select this conversation
      setSelectedChat(conversation);
      loadMessages(conversation._id);
      
      // Show success feedback
      const storeName = conversation.otherParticipant?.businessName || 
                       conversation.otherParticipant?.username || 
                       'store';
      console.log(`✅ Ready to chat with ${storeName}!`);
      
    } catch (error) {
      console.error('❌ Error creating conversation with store:', error);
      // You could add a toast notification here if you have one available
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
      
      // Mark messages as read and update unread count
      const unreadMessages = messages.filter(msg => msg.receiverId === currentUser.id && !msg.isRead);
      if (unreadMessages.length > 0) {
        try {
          await messageService.markMessagesAsRead(conversationId, currentUser.id);
          socketService.markMessagesRead({
            conversationId,
            userId: currentUser.id
          });
          
          // Update the conversation's unread count in the local state after successful API call
          setConversations(prev => prev.map(conv =>
            conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
          ));
          
          console.log(`✅ Marked ${unreadMessages.length} messages as read`);
        } catch (error) {
          console.error('❌ Error marking messages as read:', error);
        }
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

  const handleChatSelect = (conversation) => {
    setSelectedChat(conversation);
    setMessages([]);
    loadMessages(conversation._id);
    // Note: unread count will be reset in loadMessages after messages are actually marked as read
  };

  const handleDeleteConversation = () => {
    if (!selectedChat) return;
    
    // Show confirmation notification
    setNotification({
      isVisible: true,
      type: 'confirm',
      title: 'Delete Conversation',
      message: 'Are you sure you want to delete this conversation? This action cannot be undone.',
      showConfirmButtons: true,
      onConfirm: performDeleteConversation,
      onCancel: () => setNotification(prev => ({ ...prev, isVisible: false }))
    });
  };

  const performDeleteConversation = async () => {
    if (!selectedChat) return;
    
    try {
      await messageService.deleteConversation(selectedChat._id);
      
      // Remove from conversations list
      setConversations(prev => prev.filter(conv => conv._id !== selectedChat._id));
      
      // Clear selected chat and messages
      setSelectedChat(null);
      setMessages([]);
      setShowDropdown(false);
      
      // Show success notification
      setNotification({
        isVisible: true,
        type: 'success',
        title: 'Success',
        message: 'Conversation deleted successfully',
        showConfirmButtons: false,
        onConfirm: () => {},
        onCancel: () => {}
      });
      
      console.log('✅ Conversation deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      
      // Show error notification  
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to delete conversation. Please try again.',
        showConfirmButtons: false,
        onConfirm: () => {},
        onCancel: () => {}
      });
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat || sending) return;

    setSending(true);
    const tempId = Date.now().toString();
    
    // Find the other participant (store)
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
      receiverModel: 'MSME',
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
        firstname: currentUser.firstName,
        lastname: currentUser.lastName,
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

    socketService.sendTyping({
      conversationId: selectedChat._id,
      userId: currentUser.id,
      userType: currentUser.userType
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping({
        conversationId: selectedChat._id,
        userId: currentUser.id
      });
    }, 3000);
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

  const getStoreName = (participant) => {
    if (!participant) return 'Unknown Store';
    return participant.businessName || participant.username || 'Unknown Store';
  };

  const getStoreAvatar = (participant) => {
    if (!participant) return 'S';
    if (participant.businessName) return participant.businessName.charAt(0).toUpperCase();
    if (participant.username) return participant.username.charAt(0).toUpperCase();
    return 'S';
  };

  const filteredConversations = conversations.filter(conv => {
    if (!conv.otherParticipant) return false;
    
    const storeName = getStoreName(conv.otherParticipant);
    const lastMessage = conv.lastMessage?.message || '';
    
    return storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
      return 'customer-messages__content customer-messages__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'customer-messages__content customer-messages__content--sidebar-open' 
      : 'customer-messages__content customer-messages__content--sidebar-collapsed';
  };

  return (
    <div className="customer-messages">
      <CustomerSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="customer-messages__header">
          <div className="customer-messages__header-content">
            <div className="customer-messages__header-text">
              {/* Empty header to maintain spacing */}
            </div>
          </div>
        </div>

        <div className="customer-messages__layout">
        {/* Conversations List */}
        <div className="customer-messages__conversations-panel">
          <div className="customer-messages__conversations-header">
            <h2 className="customer-messages__panel-title">
              Store Messages
              {!isConnected && (
                <span className="customer-messages__connection-status">
                  • Connecting...
                </span>
              )}
              {isConnected && (
                <span className="customer-messages__connection-status customer-messages__connection-status--connected">
                  • Online
                </span>
              )}
            </h2>
            <div className="customer-messages__search-box">
              <SearchIcon className="customer-messages__search-icon" />
              <input
                type="text"
                className="customer-messages__search-input"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="customer-messages__clear-search" 
                  onClick={() => setSearchTerm('')}
                >
                  <ClearIcon />
                </button>
              )}
            </div>
          </div>
          <div className="customer-messages__conversations-list">
            {loading && conversations.length === 0 ? (
              <div className="customer-messages__loading">
                <p>Loading conversations...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`customer-messages__conversation-item ${selectedChat?._id === conversation._id ? 'customer-messages__conversation-item--active' : ''} ${conversation.unreadCount > 0 ? 'customer-messages__conversation-item--unread' : ''}`}
                  onClick={() => handleChatSelect(conversation)}
                >
                  <div className="customer-messages__conversation-avatar">
                    <StoreIcon />
                  </div>
                  <div className="customer-messages__conversation-info">
                    <div className="customer-messages__conversation-header">
                      <h4 className="customer-messages__conversation-name">
                        {getStoreName(conversation.otherParticipant)}
                      </h4>
                      <span className="customer-messages__conversation-time">
                        {formatTime(conversation.lastActivity)}
                      </span>
                      {conversation.unreadCount > 0 && selectedChat?._id !== conversation._id && (
                        <div className="customer-messages__unread-indicator">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <p className="customer-messages__conversation-type">Store</p>
                    <p className="customer-messages__last-message">
                      {conversation.lastMessage?.message || 'No messages yet'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="customer-messages__no-conversations">
                <p className="customer-messages__no-conversations-text">
                  {searchTerm ? 'No conversations found' : 'No store messages yet'}
                </p>
                <p className="customer-messages__search-hint">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Contact stores to start conversations'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="customer-messages__chat-panel">
          {selectedChat ? (
            <>
              <div className="customer-messages__chat-header">
                <div className="customer-messages__chat-info">
                  <div className="customer-messages__chat-avatar">
                    <StoreIcon />
                  </div>
                  <div className="customer-messages__chat-details">
                    <h3 className="customer-messages__chat-name">
                      {getStoreName(selectedChat.otherParticipant)}
                    </h3>
                    <p className="customer-messages__chat-type">Store</p>
                  </div>
                </div>
                <div className="customer-messages__chat-actions">
                  <div className="customer-messages__dropdown-container">
                    <button 
                      className="customer-messages__action-btn customer-messages__action-btn--icon"
                      onClick={toggleDropdown}
                    >
                      <MoreVertIcon />
                    </button>
                    {showDropdown && (
                      <div className="customer-messages__dropdown-menu">
                        <button 
                          className="customer-messages__dropdown-item customer-messages__dropdown-item--danger"
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
              <div className="customer-messages__chat-messages">
                {loading && messages.length === 0 ? (
                  <div className="customer-messages__loading-messages">
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => {
                    const isOwn = message.senderId._id === currentUser.id || message.senderId === currentUser.id;
                    return (
                      <div
                        key={message._id || message.tempId}
                        className={`customer-messages__message ${isOwn ? 'customer-messages__message--own' : 'customer-messages__message--other'}`}
                      >
                        <div className="customer-messages__message-content">
                          {message.message}
                          {message.sending && (
                            <span className="customer-messages__message-sending">Sending...</span>
                          )}
                        </div>
                        <div className="customer-messages__message-time">
                          {formatMessageTime(message.createdAt)}
                          {isOwn && message.isRead && (
                            <span className="customer-messages__message-read">✓✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="customer-messages__no-messages">
                    <p>No messages yet</p>
                    <p>Start the conversation with this store!</p>
                  </div>
                )}
                {typingUsers.size > 0 && (
                  <div className="customer-messages__typing-indicator">
                    <span>Store is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="customer-messages__chat-input">
                <button className="customer-messages__attach-btn">
                  <AttachFileIcon />
                </button>
                <input
                  type="text"
                  className="customer-messages__input-field"
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
                  className="customer-messages__send-button"
                  disabled={!newMessage.trim() || sending || !isConnected}
                >
                  {sending ? '...' : <SendIcon />}
                </button>
              </div>
            </>
          ) : (
            <div className="customer-messages__no-chat-selected">
              <h3 className="customer-messages__no-chat-title">Select a conversation to start messaging</h3>
              <p className="customer-messages__no-chat-text">Choose from your existing conversations with stores</p>
              {!isConnected && (
                <p className="customer-messages__connection-warning">
                  ⚠️ Connecting to messaging server...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
      
      {/* Notification Component */}
      <Notification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        showConfirmButtons={notification.showConfirmButtons}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        onConfirm={notification.onConfirm}
        onCancel={notification.onCancel}
        duration={4000}
      />
    </div>
  );
};

export default CustomerMessage;
