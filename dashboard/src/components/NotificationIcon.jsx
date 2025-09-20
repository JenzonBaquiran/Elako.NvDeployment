import React, { useState, useEffect, useRef } from 'react';
import { NotificationsNone, NotificationsActive } from '@mui/icons-material';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, Divider } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import './NotificationIcon.css';

const NotificationIcon = ({ storeId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'store_follow':
        return '👤';
      case 'product_favorite':
        return '❤️';
      default:
        return '📢';
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
        <NotificationsNone />
      </IconButton>
    );
  }

  return (
    <>
      <IconButton 
        onClick={handleClick}
        sx={{ 
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {unreadCount > 0 ? <NotificationsActive /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        className="notification-menu"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            maxHeight: 450,
            width: 380,
          },
        }}
      >
        <Box className="notification-header">
          <Typography variant="h6" className="notification-title">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Typography 
              variant="caption" 
              className="mark-all-read"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Typography>
          )}
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="textSecondary">
              No notifications yet
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem 
              key={notification._id}
              onClick={() => {
                if (!notification.isRead) {
                  markAsRead(notification._id);
                }
              }}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
            >
              <Box className="notification-content">
                <Box className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </Box>
                <Box className="notification-text">
                  <Typography variant="body2" className="notification-message">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatTime(notification.createdAt)}
                  </Typography>
                </Box>
                {!notification.isRead && (
                  <Box className="unread-indicator" />
                )}
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationIcon;