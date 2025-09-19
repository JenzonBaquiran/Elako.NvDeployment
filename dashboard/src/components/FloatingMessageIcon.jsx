import React, { useState } from 'react';
import { MessageRounded, Send, Close } from '@mui/icons-material';
import './FloatingMessageIcon.css';

const FloatingMessageIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you can add your message sending logic
      console.log('Sending message:', message);
      setMessage('');
      // You could also close the chat window after sending
      // setIsOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className={`floating-message-button ${isOpen ? 'open' : ''}`} onClick={handleToggle}>
        {isOpen ? (
          <Close className="floating-message-icon" />
        ) : (
          <MessageRounded className="floating-message-icon" />
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="floating-chat-window">
          <div className="chat-header">
            <h4>Need Help?</h4>
            <p>Send us a message and we'll get back to you!</p>
          </div>
          
          <div className="chat-body">
            <div className="chat-messages">
              <div className="system-message">
                <p>Hello! How can we help you today?</p>
              </div>
            </div>
          </div>
          
          <div className="chat-footer">
            <div className="message-input-container">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="message-input"
                rows="1"
              />
              <button 
                onClick={handleSendMessage}
                className="send-button"
                disabled={!message.trim()}
              >
                <Send className="send-icon" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingMessageIcon;