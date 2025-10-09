import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  IconButton, 
  Badge,
  Menu, 
  MenuItem, 
  Typography, 
  Divider, 
  Box,
  Button,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Checkbox,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MessageIcon from '@mui/icons-material/Message';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { formatDistanceToNow } from 'date-fns';
import './NotificationIcon.css';
import Notification from './Notification';

const NotificationIcon = ({ storeId }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipeDistance, setSwipeDistance] = useState({});
  const [isActiveSwipe, setIsActiveSwipe] = useState({});
  const [showDeleteAllNotification, setShowDeleteAllNotification] = useState(false);
  const intervalRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications for store:', storeId);
      const response = await fetch(`http://localhost:1337/api/notifications/${storeId}?limit=10`);
      const data = await response.json();
      
      console.log('Notification response:', data);
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      intervalRef.current = setInterval(fetchNotifications, 30000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [storeId]);

  console.log('MSME NotificationIcon - unreadCount:', unreadCount);

  const handleClick = (event) => {
    // Open the All Notifications drawer directly
    setIsDrawerOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedNotifications([]);
    setIsSelectionMode(false);
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedNotifications([]);
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      await fetch('http://localhost:1337/api/notifications/delete-multiple', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          notificationIds: selectedNotifications,
          storeId: storeId 
        }),
      });

      // Remove deleted notifications from local state
      setNotifications(prev => 
        prev.filter(n => !selectedNotifications.includes(n._id))
      );
      
      // Update unread count
      const deletedUnreadCount = notifications.filter(n => 
        selectedNotifications.includes(n._id) && !n.isRead
      ).length;
      setUnreadCount(prev => Math.max(0, prev - deletedUnreadCount));
      
      setSelectedNotifications([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
    }
  };

  const handleDeleteAll = () => {
    setShowDeleteAllNotification(true);
  };

  const handleConfirmDeleteAll = async () => {
    try {
      await fetch(`http://localhost:1337/api/notifications/${storeId}/delete-all`, {
        method: 'DELETE',
      });

      setNotifications([]);
      setUnreadCount(0);
      setSelectedNotifications([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };



  const handleDeleteSingleNotification = async (notificationId) => {
    try {
      await fetch(`http://localhost:1337/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      // Remove from local state
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:1337/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`http://localhost:1337/api/notifications/${storeId}/read-all`, {
        method: 'PUT'
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Swipe handling functions
  const handleTouchStart = (e, notificationId) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsActiveSwipe(prev => ({ ...prev, [notificationId]: true }));
  };

  const handleTouchMove = (e, notificationId) => {
    if (touchStart) {
      setTouchEnd(e.targetTouches[0].clientX);
      const distance = touchStart - e.targetTouches[0].clientX;
      const clampedDistance = Math.max(0, Math.min(100, distance));
      setSwipeDistance(prev => ({ ...prev, [notificationId]: clampedDistance }));
    }
  };

  const handleTouchEnd = (e, notificationId) => {
    if (!touchStart || !touchEnd) {
      // Reset states even if we don't have proper touch data
      setIsActiveSwipe(prev => ({ ...prev, [notificationId]: false }));
      setSwipeDistance(prev => ({ ...prev, [notificationId]: 0 }));
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;

    // Reset states
    setIsActiveSwipe(prev => ({ ...prev, [notificationId]: false }));
    setSwipeDistance(prev => ({ ...prev, [notificationId]: 0 }));

    if (isLeftSwipe) {
      // Swipe left - automatically delete notification
      handleDeleteSingleNotification(notificationId);
    }
  };

  // Mouse drag support for desktop
  const handleMouseDown = (e, notificationId) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
    setIsActiveSwipe(prev => ({ ...prev, [notificationId]: true }));
  };

  const handleMouseMove = (e, notificationId) => {
    if (touchStart) {
      setTouchEnd(e.clientX);
      const distance = touchStart - e.clientX;
      const clampedDistance = Math.max(0, Math.min(100, distance));
      setSwipeDistance(prev => ({ ...prev, [notificationId]: clampedDistance }));
    }
  };

  const handleMouseUp = (e, notificationId) => {
    if (!touchStart || !touchEnd) {
      setIsActiveSwipe(prev => ({ ...prev, [notificationId]: false }));
      setSwipeDistance(prev => ({ ...prev, [notificationId]: 0 }));
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;

    setIsActiveSwipe(prev => ({ ...prev, [notificationId]: false }));
    setSwipeDistance(prev => ({ ...prev, [notificationId]: 0 }));

    if (isLeftSwipe) {
      handleDeleteSingleNotification(notificationId);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'store_follow':
        return <PersonIcon className="msme-notification-icon__type-icon" />;
      case 'product_favorite':
        return <FavoriteIcon className="msme-notification-icon__type-icon" />;
      case 'new_message':
        return <MessageIcon className="msme-notification-icon__type-icon" />;
      default:
        return <NotificationsIcon className="msme-notification-icon__type-icon" />;
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log('🔔 MSME Notification clicked:', notification);
    
    try {
      // Mark as read if not already read
      if (!notification.isRead) {
        await markAsRead(notification._id);
      }

      // Handle navigation based on notification type
      if (notification.type === 'new_message' && notification.conversationId) {
        console.log('📨 Navigating to message conversation:', notification.conversationId);
        
        // Close the drawer first
        handleCloseDrawer();
        
        // Navigate to messages page with conversation ID as state
        navigate('/msme-messages', {
          state: { 
            openConversationId: notification.conversationId,
            fromNotification: true 
          }
        });
      } else if (notification.type === 'product_favorite' && notification.productId) {
        // Navigate to product management or analytics
        navigate('/msme-products');
      } else if (notification.type === 'store_follow') {
        // Navigate to dashboard or analytics
        navigate('/msme-dashboard');
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Just now';
    }
  };

  if (loading) {
    return (
      <IconButton 
        sx={{ 
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <NotificationsNoneIcon />
      </IconButton>
    );
  }

  return (
    <div className="msme-notification-icon">
      <IconButton
        className="msme-notification-icon__button"
        onClick={handleClick}
        size="medium"
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge 
          badgeContent={unreadCount > 0 ? unreadCount : null}
          color="error" 
          max={99}
          invisible={unreadCount === 0}
        >
          <NotificationsNoneIcon className="msme-notification-icon__bell" />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        className="msme-notification-icon__drawer"
        PaperProps={{
          className: 'msme-notification-icon__drawer-paper'
        }}
      >
        <div className="msme-notification-icon__drawer-container">
          <div className="msme-notification-icon__drawer-header">
            <Typography variant="h6" className="msme-notification-icon__drawer-title">
              All Notifications
            </Typography>
            <div>
              <IconButton onClick={handleCloseDrawer} size="small">
                <CloseIcon />
              </IconButton>
            </div>
          </div>

          <div className="msme-notification-icon__drawer-actions">
            {isSelectionMode ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSelectAll}
                  className="msme-notification-icon__drawer-action-btn"
                  startIcon={<CheckBoxIcon />}
                >
                  {selectedNotifications.length === notifications.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={handleDeleteSelected}
                  className="msme-notification-icon__drawer-delete-btn"
                  startIcon={<DeleteIcon />}
                  disabled={selectedNotifications.length === 0}
                >
                  Delete Selected ({selectedNotifications.length})
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleToggleSelectionMode}
                  className="msme-notification-icon__drawer-cancel-btn"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {unreadCount > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={markAllAsRead}
                    className="msme-notification-icon__drawer-mark-all-btn"
                  >
                    Mark All Read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={handleDeleteAll}
                    className="msme-notification-icon__drawer-delete-all-btn"
                    startIcon={<DeleteIcon />}
                  >
                    Delete All
                  </Button>
                )}
              </div>
            )}
            {!isSelectionMode && notifications.length > 0 && (
              <Typography variant="caption" color="textSecondary" style={{ marginTop: '8px', display: 'block' }}>
                Swipe left to delete instantly
              </Typography>
            )}
          </div>

          <div className="msme-notification-icon__drawer-content">
            {loading ? (
              <div className="msme-notification-icon__drawer-loading">
                <Typography variant="body2">Loading notifications...</Typography>
              </div>
            ) : notifications.length === 0 ? (
              <div className="msme-notification-icon__drawer-empty">
                <NotificationsNoneIcon className="msme-notification-icon__drawer-empty-icon" />
                <Typography variant="body2" color="textSecondary">
                  No notifications yet
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  You'll be notified when customers follow your store or favorite your products
                </Typography>
              </div>
            ) : (
              <List className="msme-notification-icon__drawer-list">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    data-notification-id={notification._id}
                    className="msme-notification-icon__drawer-item-wrapper"
                    style={{
                      transform: `translateX(-${swipeDistance[notification._id] || 0}px)`,
                      transition: isActiveSwipe[notification._id] ? 'none' : 'transform 0.3s ease'
                    }}
                  >
                    <ListItem
                      className={`msme-notification-icon__drawer-item ${
                        !notification.isRead ? 'msme-notification-icon__drawer-item--unread' : ''
                      } ${isSelectionMode ? 'msme-notification-icon__drawer-item--selection-mode' : ''}`}
                      onClick={() => {
                        if (isSelectionMode) {
                          handleSelectNotification(notification._id);
                          return;
                        }
                        handleNotificationClick(notification);
                      }}
                      onTouchStart={(e) => handleTouchStart(e, notification._id)}
                      onTouchMove={(e) => handleTouchMove(e, notification._id)}
                      onTouchEnd={(e) => handleTouchEnd(e, notification._id)}
                      onMouseDown={(e) => handleMouseDown(e, notification._id)}
                      onMouseMove={(e) => handleMouseMove(e, notification._id)}
                      onMouseUp={(e) => handleMouseUp(e, notification._id)}
                      onMouseLeave={(e) => handleMouseUp(e, notification._id)}
                    >
                    {isSelectionMode && (
                      <ListItemAvatar>
                        <Checkbox
                          checked={selectedNotifications.includes(notification._id)}
                          onChange={() => handleSelectNotification(notification._id)}
                          className="msme-notification-icon__drawer-checkbox"
                        />
                      </ListItemAvatar>
                    )}
                    {!isSelectionMode && (
                      <ListItemAvatar>
                        <Avatar className="msme-notification-icon__drawer-avatar">
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                    )}
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" className="msme-notification-icon__drawer-item-title">
                            {notification.type === 'store_follow' ? 'New Follower!' : 'Product Favorited!'}
                            {!notification.isRead && !isSelectionMode && (
                              <div className="msme-notification-icon__drawer-unread-dot"></div>
                            )}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" className="msme-notification-icon__drawer-item-message">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" className="msme-notification-icon__drawer-item-time">
                              {formatTime(notification.createdAt)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  </div>
                ))}
              </List>
            )}
          </div>
        </div>
      </Drawer>

      {showDeleteAllNotification && createPortal(
        <div className="notification-container">
          <div className="notification-wrapper">
            <Notification
              type="confirm"
              title="Delete All Notifications?"
              message={`Are you sure you want to delete all ${notifications.length} notifications? This action cannot be undone.`}
              isVisible={showDeleteAllNotification}
              showConfirmButtons={true}
              onConfirm={handleConfirmDeleteAll}
              onCancel={() => setShowDeleteAllNotification(false)}
              onClose={() => setShowDeleteAllNotification(false)}
            />
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default NotificationIcon;