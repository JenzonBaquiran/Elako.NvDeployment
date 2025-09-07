import React, { useState, useEffect } from 'react';
import './Notification.css';

const Notification = ({ 
  type = 'info', 
  title = '', 
  message = '', 
  isVisible = false, 
  onClose = () => {}, 
  duration = 4000,
  showConfirmButtons = false,
  onConfirm = () => {},
  onCancel = () => {}
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Auto close for non-confirmation notifications
      if (!showConfirmButtons && duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration, showConfirmButtons]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  const handleCancel = () => {
    onCancel();
    handleClose();
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'confirm':
        return '?';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`notification-overlay ${isAnimating ? 'show' : ''}`}>
      <div className={`notification notification--${type} ${isAnimating ? 'slide-in' : 'slide-out'}`}>
        <div className="notification__header">
          <div className="notification__icon">
            {getIcon()}
          </div>
          <div className="notification__content">
            {title && <h4 className="notification__title">{title}</h4>}
            <p className="notification__message">{message}</p>
          </div>
          {!showConfirmButtons && (
            <button className="notification__close" onClick={handleClose}>
              ×
            </button>
          )}
        </div>
        
        {showConfirmButtons && (
          <div className="notification__actions">
            <button className="notification__btn notification__btn--cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button className="notification__btn notification__btn--confirm" onClick={handleConfirm}>
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
