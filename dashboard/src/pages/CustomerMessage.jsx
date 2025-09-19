import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import '../css/CustomerMessage.css';

const CustomerMessage = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();

  const conversations = [
    {
      id: 1,
      name: "Maria's Bakery",
      type: "MSME Business",
      lastMessage: "Thank you for your order! Your buko pie will be ready tomorrow.",
      time: "2m ago",
      unread: true,
      avatar: "M"
    },
    {
      id: 2,
      name: "Mountain Brew Coffee",
      type: "MSME Business",
      lastMessage: "We have new arabica beans available!",
      time: "1h ago",
      unread: false,
      avatar: "M"
    },
    {
      id: 3,
      name: "Support Team",
      type: "Support",
      lastMessage: "How can we help you today?",
      time: "1d ago",
      unread: false,
      avatar: "S"
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "Maria's Bakery",
      message: "Hi! Thank you for your interest in our buko pie. How many would you like to order?",
      time: "10:30 AM",
      isOwn: false
    },
    {
      id: 2,
      sender: "You",
      message: "Hi like to order 2 buko pies. When can I pick them up?",
      time: "10:32 AM",
      isOwn: true
    },
    {
      id: 3,
      sender: "Maria's Bakery",
      message: "Perfect! Your order for 2 buko pies is confirmed. They will be ready tomorrow at 2 PM. Total is ₱500.",
      time: "10:33 AM",
      isOwn: false
    },
    {
      id: 4,
      sender: "You",
      message: "Great! I'll pay upon pickup. Thank you!",
      time: "10:35 AM",
      isOwn: true
    },
    {
      id: 5,
      sender: "Maria's Bakery",
      message: "Thank you for your order! Your buko pie will be ready tomorrow.",
      time: "10:37 AM",
      isOwn: false
    }
  ];

  const handleSidebarToggle = (state) => {
    setSidebarState(state);
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'customer-message__content customer-message__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'customer-message__content customer-message__content--sidebar-open' 
      : 'customer-message__content customer-message__content--sidebar-collapsed';
  };

  const handleChatSelect = (conversation) => {
    setSelectedChat(conversation);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message logic here
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleViewStore = (storeId) => {
    navigate(`/customer/store/${storeId}`);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customer-message">
      <CustomerSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="customer-message__header">
          <div className="customer-message__header-content">
            <div className="customer-message__header-text">

            </div>
          </div>
        </div>

        <div className="customer-message__layout">
          {/* Conversations List */}
          <div className="customer-message__conversations-panel">
            <div className="customer-message__conversations-header">
              <h2 className="customer-message__panel-title">Conversations</h2>
              <div className="customer-message__search-box">
                <SearchIcon className="customer-message__search-icon" />
                <input
                  type="text"
                  className="customer-message__search-input"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                />
                {searchTerm && (
                  <button 
                    className="customer-message__clear-search" 
                    onClick={() => setSearchTerm('')}
                    title="Clear search"
                  >
                    <ClearIcon />
                  </button>
                )}
              </div>
            </div>
            <div className="customer-message__conversations-list">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`customer-message__conversation-item ${selectedChat?.id === conversation.id ? 'customer-message__conversation-item--active' : ''} ${conversation.unread ? 'customer-message__conversation-item--unread' : ''}`}
                    onClick={() => handleChatSelect(conversation)}
                  >
                    <div className="customer-message__conversation-avatar">
                      {conversation.avatar}
                    </div>
                    <div className="customer-message__conversation-info">
                      <div className="customer-message__conversation-header">
                        <h4 className="customer-message__conversation-name">{conversation.name}</h4>
                        <span className="customer-message__conversation-time">{conversation.time}</span>
                        {conversation.unread && <div className="customer-message__unread-indicator"></div>}
                      </div>
                      <p className="customer-message__conversation-type">{conversation.type}</p>
                      <p className="customer-message__last-message">{conversation.lastMessage}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="customer-message__no-conversations">
                  <p className="customer-message__no-conversations-text">No conversations found</p>
                  {searchTerm && (
                    <p className="customer-message__search-hint">Try adjusting your search terms</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="customer-message__chat-panel">
            {selectedChat ? (
              <>
                <div className="customer-message__chat-header">
                  <div className="customer-message__chat-info">
                    <div className="customer-message__chat-avatar">
                      {selectedChat.avatar}
                    </div>
                    <div className="customer-message__chat-details">
                      <h3 className="customer-message__chat-name">{selectedChat.name}</h3>
                      <p className="customer-message__chat-type">{selectedChat.type}</p>
                    </div>
                  </div>
                  <div className="customer-message__chat-actions">
                    <button 
                      className="customer-message__action-btn"
                      onClick={() => handleViewStore(selectedChat.id)}
                      title="View Store"
                    >
                      View Store
                    </button>
                    <button className="customer-message__action-btn customer-message__action-btn--icon">
                      <MoreVertIcon />
                    </button>
                  </div>
                </div>
                <div className="customer-message__chat-messages">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`customer-message__message ${message.isOwn ? 'customer-message__message--own' : 'customer-message__message--other'}`}
                    >
                      <div className="customer-message__message-content">
                        {message.message}
                      </div>
                      <div className="customer-message__message-time">
                        {message.time}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="customer-message__chat-input">
                  <button className="customer-message__attach-btn">
                    <AttachFileIcon />
                  </button>
                  <input
                    type="text"
                    className="customer-message__input-field"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    onClick={handleSendMessage} 
                    className="customer-message__send-button"
                    disabled={!newMessage.trim()}
                  >
                    <SendIcon />
                  </button>
                </div>
              </>
            ) : (
              <div className="customer-message__no-chat-selected">
                <h3 className="customer-message__no-chat-title">Select a conversation to start messaging</h3>
                <p className="customer-message__no-chat-text">Choose from your existing conversations or start a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMessage;
