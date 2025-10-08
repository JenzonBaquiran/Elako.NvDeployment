import React, { useState, useEffect, useRef } from 'react';
import { MessageRounded, Send, Close, QuestionAnswer, Phone, Email } from '@mui/icons-material';
import './FloatingMessageIcon.css';

const FloatingMessageIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('welcome'); // 'welcome', 'faq', 'contact'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const faqData = {
    general: {
      title: "General FAQs",
      questions: [
        {
          question: "What is ELako?",
          answer: "Our platform helps businesses and individuals promote their products or services online through digital marketing tools such as social media management, ads, analytics, and more."
        },
        {
          question: "How do I create an account?",
          answer: "You can sign up using your email address or social media account on our registration page."
        },
        {
          question: "How do I reset my password?",
          answer: "Click on 'Forgot Password' on the login page and follow the instructions sent to your email."
        },
        {
          question: "Can I promote my business on multiple platforms?",
          answer: "Yes! You can connect Facebook, Instagram, Google, and other platforms for cross-channel promotion."
        },
        {
          question: "How can I track my campaign performance?",
          answer: "You can view detailed analytics in your dashboard, including reach, engagement, and conversion data."
        }
      ]
    },
    support: {
      title: "Support & Assistance",
      questions: [
        {
          question: "How can I contact customer support?",
          answer: "You can reach us through this chat support, email, or by submitting a help request through your dashboard."
        },
        {
          question: "How long does it take for support to respond?",
          answer: "Our team usually responds within 24 hours during business days."
        },
        {
          question: "Do you offer training or tutorials?",
          answer: "Yes, we offer video guides, webinars, and documentation to help you maximize your marketing efforts."
        }
      ]
    },
    privacy: {
      title: "Privacy & Security",
      questions: [
        {
          question: "Is my data safe on this platform?",
          answer: "Absolutely. We use encrypted servers and follow strict data protection policies."
        },
        {
          question: "Do you share my information with third parties?",
          answer: "No, your information is only used to improve your experience on our platform and is never sold or shared without consent."
        }
      ]
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setCurrentView('welcome');
      setChatMessages([{
        type: 'bot',
        message: 'Hello! Welcome to ELako Support. How can I help you today?',
        timestamp: new Date()
      }]);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentView('faq');
    setChatMessages(prev => [...prev, {
      type: 'bot',
      message: `Here are the frequently asked questions for ${faqData[category].title}:`,
      timestamp: new Date()
    }]);
  };

  const handleQuestionSelect = (question, answer) => {
    setChatMessages(prev => [
      ...prev,
      {
        type: 'user',
        message: question,
        timestamp: new Date()
      },
      {
        type: 'bot',
        message: answer,
        timestamp: new Date()
      }
    ]);
  };

  const handleUserMessage = () => {
    if (userInput.trim()) {
      setChatMessages(prev => [
        ...prev,
        {
          type: 'user',
          message: userInput,
          timestamp: new Date()
        },
        {
          type: 'bot',
          message: "Thank you for your question! For personalized assistance, please contact our support team directly:",
          timestamp: new Date()
        }
      ]);
      setUserInput('');
      setCurrentView('contact');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserMessage();
    }
  };

  const goBack = () => {
    if (currentView === 'faq') {
      setCurrentView('welcome');
      setSelectedCategory('');
    } else if (currentView === 'contact') {
      setCurrentView('welcome');
    }
  };

  const renderWelcomeView = () => (
    <div className="faq-welcome-layout">
      <div className="faq-sidebar">
        <h4>Categories</h4>
        <button 
          className="faq-category-btn"
          onClick={() => handleCategorySelect('general')}
        >
          <QuestionAnswer className="category-icon" />
          <span>General FAQs</span>
        </button>
        <button 
          className="faq-category-btn"
          onClick={() => handleCategorySelect('support')}
        >
          <QuestionAnswer className="category-icon" />
          <span>Support & Assistance</span>
        </button>
        <button 
          className="faq-category-btn"
          onClick={() => handleCategorySelect('privacy')}
        >
          <QuestionAnswer className="category-icon" />
          <span>Privacy & Security</span>
        </button>
        <div className="faq-divider">
          <span>or ask directly</span>
        </div>
      </div>
      <div className="conversation-area">
        <div className="chat-messages">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}-message`}>
              <p>{msg.message}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="custom-question">
          <p>Have a different question?</p>
          <p className="custom-question-sub">Type your question below and we'll connect you with our support team.</p>
        </div>
      </div>
    </div>
  );

  const renderFAQView = () => (
    <div className="faq-questions">
      <div className="faq-header">
        <button className="back-btn" onClick={goBack}>← Back</button>
        <h4>{faqData[selectedCategory].title}</h4>
      </div>
      <div className="questions-list">
        {faqData[selectedCategory].questions.map((item, index) => (
          <button
            key={index}
            className="question-btn"
            onClick={() => handleQuestionSelect(item.question, item.answer)}
          >
            {item.question}
          </button>
        ))}
      </div>
    </div>
  );

  const renderContactView = () => (
    <div className="contact-info">
      <div className="faq-header">
        <button className="back-btn" onClick={goBack}>← Back</button>
        <h4>Contact Support</h4>
      </div>
      <div className="contact-details">
        <div className="contact-item">
          <Phone className="contact-icon" />
          <div>
            <strong>Phone Support</strong>
            <p>+63 123 456 7890</p>
          </div>
        </div>
        <div className="contact-item">
          <Email className="contact-icon" />
          <div>
            <strong>Email Support</strong>
            <p>support@elako.com</p>
          </div>
        </div>
        <div className="contact-note">
          <p>Our support team is available Monday to Friday, 9:00 AM to 6:00 PM (PST).</p>
        </div>
      </div>
    </div>
  );

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
            <h4>ELako Support</h4>
            <p>Frequently Asked Questions</p>
          </div>
          
          <div className="chat-body">
            {/* FAQ Content */}
            <div className="faq-content">
              {currentView === 'welcome' && renderWelcomeView()}
              {currentView === 'faq' && renderFAQView()}
              {currentView === 'contact' && renderContactView()}
            </div>
          </div>
          
          {(currentView === 'welcome' || currentView === 'contact') && (
            <div className="chat-footer">
              <div className="message-input-container">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question here..."
                  className="message-input"
                  rows="1"
                />
                <button 
                  onClick={handleUserMessage}
                  className="send-button"
                  disabled={!userInput.trim()}
                >
                  <Send className="send-icon" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingMessageIcon;