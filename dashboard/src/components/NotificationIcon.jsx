import React, { useState, useEffect, useRef } from 'react';
import { 
  IconButton, 
  Badge,
  Menu, 
  MenuItem, 
  Typography, 
  Divider, 
  Box,
  Button,
  Avatar
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
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

  console.log('MSME NotificationIcon - unreadCount:', unreadCount);

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
        return <PersonIcon className="msme-notification-icon__type-icon" />;
      case 'product_favorite':
        return <FavoriteIcon className="msme-notification-icon__type-icon" />;
      default:
        return <NotificationsIcon className="msme-notification-icon__type-icon" />;
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        className="msme-notification-icon__menu"
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          className: 'msme-notification-icon__menu-paper'
        }}
      >
        <div className="msme-notification-icon__header">
          <Typography variant="h6" className="msme-notification-icon__title">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={markAllAsRead}
              className="msme-notification-icon__mark-all-btn"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Divider />

        {loading ? (
          <MenuItem disabled>
            <Typography variant="body2">Loading...</Typography>
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem disabled className="msme-notification-icon__empty">
            <Box textAlign="center" py={2}>
              <NotificationsNoneIcon className="msme-notification-icon__empty-icon" />
              <Typography variant="body2" color="textSecondary">
                No notifications yet
              </Typography>
              <Typography variant="caption" color="textSecondary">
                You'll be notified when customers follow your store or favorite your products
              </Typography>
            </Box>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => {
                if (!notification.isRead) {
                  markAsRead(notification._id);
                }
                handleClose();
              }}
              className={`msme-notification-icon__item ${
                !notification.isRead ? 'msme-notification-icon__item--unread' : ''
              }`}
            >
              <div className="msme-notification-icon__item-content">
                <div className="msme-notification-icon__item-header">
                  <div className="msme-notification-icon__item-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="msme-notification-icon__item-info">
                    <Typography variant="subtitle2" className="msme-notification-icon__item-title">
                      {notification.type === 'store_follow' ? 'New Follower!' : 'Product Favorited!'}
                    </Typography>
                    <Typography variant="body2" className="msme-notification-icon__item-message">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" className="msme-notification-icon__item-time">
                      {formatTime(notification.createdAt)}
                    </Typography>
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="msme-notification-icon__unread-dot"></div>
                )}
              </div>
            </MenuItem>
          ))
        )}

        {notifications.length > 0 && [
          <Divider key="divider" />,
          <MenuItem key="view-all" className="msme-notification-icon__view-all">
            <Typography variant="body2" color="primary" align="center" width="100%">
              View All Notifications
            </Typography>
          </MenuItem>
        ]}
      </Menu>
    </div>
  );
};

export default NotificationIcon;