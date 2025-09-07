import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from './Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration: 4000
    });
  }, [addNotification]);

  const showError = useCallback((message, title = 'Error') => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 6000
    });
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Warning') => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 5000
    });
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Info') => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration: 4000
    });
  }, [addNotification]);

  const showConfirm = useCallback((message, title = 'Confirm') => {
    return new Promise((resolve) => {
      const id = addNotification({
        type: 'confirm',
        title,
        message,
        showConfirmButtons: true,
        duration: 0,
        onConfirm: () => {
          removeNotification(id);
          resolve(true);
        },
        onCancel: () => {
          removeNotification(id);
          resolve(false);
        }
      });
    });
  }, [addNotification, removeNotification]);

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="notification-container">
        {notifications.map((notification, index) => (
          <div 
            key={notification.id} 
            className="notification-wrapper"
            style={{ zIndex: 9999 - index, top: `${20 + index * 80}px` }}
          >
            <Notification
              {...notification}
              isVisible={true}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
