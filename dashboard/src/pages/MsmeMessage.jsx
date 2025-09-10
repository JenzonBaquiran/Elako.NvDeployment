import React, { useState } from 'react';
import MsmeSidebar from './MsmeSidebar';
import '../css/MsmeMessage.css';

const MsmeMessage = () => {
  const [sidebarState, setSidebarState] = useState({ isOpen: true, isMobile: false });

  const handleSidebarToggle = (stateOrIsOpen, isMobile = false) => {
    // Handle both object parameter (from MsmeSidebar) and separate parameters
    if (typeof stateOrIsOpen === 'object') {
      setSidebarState({ 
        isOpen: stateOrIsOpen.isOpen, 
        isMobile: stateOrIsOpen.isMobile 
      });
    } else {
      setSidebarState({ isOpen: stateOrIsOpen, isMobile });
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

  return (
    <div className="msme-messages">
      <MsmeSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="msme-messages__header">
          <div className="msme-messages__header-content">
            <div className="msme-messages__header-text">
              <h1>Messages</h1>
              <p>Manage your customer conversations and inquiries.</p>
            </div>
            <div className="msme-messages__search">
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="msme-messages__search-input" 
              />
            </div>
          </div>
        </div>

        <div className="msme-messages__body">
          <div className="msme-messages__conversation-panel">
            <div className="msme-messages__conversation-header">
              <h3>Conversations</h3>
              <span className="msme-messages__conversation-count">3 active</span>
            </div>
            <div className="msme-messages__conversation-list">
              <div className="msme-messages__conversation msme-messages__conversation--active">
                <div className="msme-messages__conversation-avatar">MB</div>
                <div className="msme-messages__conversation-content">
                  <div className="msme-messages__conversation-header-info">
                    <h4>Maria's Bakery</h4>
                    <span className="msme-messages__conversation-time">2m ago</span>
                  </div>
                  <p>Thank you for your order! Your buko pie will be ready tomorrow.</p>
                </div>
              </div>
              <div className="msme-messages__conversation">
                <div className="msme-messages__conversation-avatar">MC</div>
                <div className="msme-messages__conversation-content">
                  <div className="msme-messages__conversation-header-info">
                    <h4>Mountain Brew Coffee</h4>
                    <span className="msme-messages__conversation-time">1h ago</span>
                  </div>
                  <p>We have new arabica beans available!</p>
                </div>
              </div>
              <div className="msme-messages__conversation">
                <div className="msme-messages__conversation-avatar">ST</div>
                <div className="msme-messages__conversation-content">
                  <div className="msme-messages__conversation-header-info">
                    <h4>Support Team</h4>
                    <span className="msme-messages__conversation-time">1d ago</span>
                  </div>
                  <p>How can we help you today?</p>
                </div>
              </div>
            </div>
          </div>

          <div className="msme-messages__chat-panel">
            <div className="msme-messages__chat-header">
              <div className="msme-messages__chat-user-info">
                <div className="msme-messages__chat-avatar">MB</div>
                <div className="msme-messages__chat-user-details">
                  <h4>Maria's Bakery</h4>
                  <span>Online</span>
                </div>
              </div>
            </div>
            
            <div className="msme-messages__chat-messages">
              <div className="msme-messages__message msme-messages__message--received">
                <div className="msme-messages__message-content">
                  <p>Hi! Thank you for your interest in our buko pie. How many would you like to order?</p>
                  <span className="msme-messages__message-time">10:32 AM</span>
                </div>
              </div>
              <div className="msme-messages__message msme-messages__message--sent">
                <div className="msme-messages__message-content">
                  <p>I'd like to order 2 buko pies. When can I pick them up?</p>
                  <span className="msme-messages__message-time">10:35 AM</span>
                </div>
              </div>
              <div className="msme-messages__message msme-messages__message--received">
                <div className="msme-messages__message-content">
                  <p>Perfect! Your order for 2 buko pies is confirmed. They will be ready tomorrow at 2 PM. Total is ₱500.</p>
                  <span className="msme-messages__message-time">10:37 AM</span>
                </div>
              </div>
              <div className="msme-messages__message msme-messages__message--sent">
                <div className="msme-messages__message-content">
                  <p>Great! I'll pay upon pickup. Thank you!</p>
                  <span className="msme-messages__message-time">10:40 AM</span>
                </div>
              </div>
            </div>
            
            <div className="msme-messages__chat-input">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="msme-messages__input-field"
              />
              <button className="msme-messages__send-btn">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MsmeMessage;
