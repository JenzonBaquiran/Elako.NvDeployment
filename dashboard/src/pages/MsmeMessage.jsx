import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MsmeSidebar from './MsmeSidebar';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
  const navigate = useNavigate();

  const conversations = [
    {
      id: 1,
      name: "John Santos",
      type: "Customer",
      lastMessage: "Hi! I'm interested in your buko pie. How much does it cost?",
      time: "5m ago",
      unread: true,
      avatar: "J"
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      type: "Customer",
      lastMessage: "Thank you for the quick delivery!",
      time: "2h ago",
      unread: false,
      avatar: "M"
    },
    {
      id: 3,
      name: "Carlos Mendoza",
      type: "Customer",
      lastMessage: "Is the bibingka still available?",
      time: "1d ago",
      unread: true,
      avatar: "C"
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "John Santos",
      message: "Hi! I'm interested in your buko pie. How much does it cost?",
      time: "2:30 PM",
      isOwn: false
    },
    {
      id: 2,
      sender: "You",
      message: "Hello! Our buko pie costs ₱250 each. Would you like to place an order?",
      time: "2:32 PM",
      isOwn: true
    },
    {
      id: 3,
      sender: "John Santos",
      message: "Yes, I'd like to order 2 pieces. When can I pick them up?",
      time: "2:33 PM",
      isOwn: false
    },
    {
      id: 4,
      sender: "You",
      message: "Perfect! Your total is ₱500. They'll be ready tomorrow at 3 PM.",
      time: "2:35 PM",
      isOwn: true
    },
    {
      id: 5,
      sender: "John Santos",
      message: "Great! I'll pick them up tomorrow. Thank you!",
      time: "2:37 PM",
      isOwn: false
    }
  ];

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
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleViewCustomer = (customerId) => {
    navigate(`/msme/customer/${customerId}`);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h2 className="msme-messages__panel-title">Customer Messages</h2>
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
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`msme-messages__conversation-item ${selectedChat?.id === conversation.id ? 'msme-messages__conversation-item--active' : ''} ${conversation.unread ? 'msme-messages__conversation-item--unread' : ''}`}
                    onClick={() => handleChatSelect(conversation)}
                  >
                    <div className="msme-messages__conversation-avatar">
                      {conversation.avatar}
                    </div>
                    <div className="msme-messages__conversation-info">
                      <div className="msme-messages__conversation-header">
                        <h4 className="msme-messages__conversation-name">{conversation.name}</h4>
                        <span className="msme-messages__conversation-time">{conversation.time}</span>
                        {conversation.unread && <div className="msme-messages__unread-indicator"></div>}
                      </div>
                      <p className="msme-messages__conversation-type">{conversation.type}</p>
                      <p className="msme-messages__last-message">{conversation.lastMessage}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="msme-messages__no-conversations">
                  <p className="msme-messages__no-conversations-text">No conversations found</p>
                  {searchTerm && (
                    <p className="msme-messages__search-hint">Try adjusting your search terms</p>
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
                      {selectedChat.avatar}
                    </div>
                    <div className="msme-messages__chat-details">
                      <h3 className="msme-messages__chat-name">{selectedChat.name}</h3>
                      <p className="msme-messages__chat-type">{selectedChat.type}</p>
                    </div>
                  </div>
                  <div className="msme-messages__chat-actions">
                    <button 
                      className="msme-messages__action-btn"
                      onClick={() => handleViewCustomer(selectedChat.id)}
                      title="View Customer"
                    >
                      View Customer
                    </button>
                    <button className="msme-messages__action-btn msme-messages__action-btn--icon">
                      <MoreVertIcon />
                    </button>
                  </div>
                </div>
                <div className="msme-messages__chat-messages">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`msme-messages__message ${message.isOwn ? 'msme-messages__message--own' : 'msme-messages__message--other'}`}
                    >
                      <div className="msme-messages__message-content">
                        {message.message}
                      </div>
                      <div className="msme-messages__message-time">
                        {message.time}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="msme-messages__chat-input">
                  <button className="msme-messages__attach-btn">
                    <AttachFileIcon />
                  </button>
                  <input
                    type="text"
                    className="msme-messages__input-field"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    onClick={handleSendMessage} 
                    className="msme-messages__send-button"
                    disabled={!newMessage.trim()}
                  >
                    <SendIcon />
                  </button>
                </div>
              </>
            ) : (
              <div className="msme-messages__no-chat-selected">
                <h3 className="msme-messages__no-chat-title">Select a conversation to start messaging</h3>
                <p className="msme-messages__no-chat-text">Choose from your existing conversations with customers</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MsmeMessage;
