import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { 
  IconButton, 
  Badge,
  Drawer,
  Typography, 
  Divider, 
  Box,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CloseIcon from '@mui/icons-material/Close';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import './NavbarNotificationPanel.css';

const NavbarNotificationPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications using exact same logic as CustomerNotificationIcon
  const fetchNotifications = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/customer-notifications/${user._id}?limit=10`);
      const data = await response.json();

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

  // Initial fetch and periodic updates
  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?._id]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?._id || unreadCount === 0) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer-notifications/${user._id}/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        // Refresh notifications to get updated data
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await fetch(`${API_BASE_URL}/api/customer-notifications/${notification._id}/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        // Refresh notifications to get updated counts
        fetchNotifications();
      }

      // Handle navigation based on notification type
      handleNotificationNavigation(notification);
      handleClose();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationNavigation = (notification) => {
    switch (notification.type) {
      case 'price_drop':
      case 'stock_alert':
        if (notification.productId?._id) {
          navigate(`/product/${notification.productId._id}`);
        }
        break;
      case 'promotion':
        if (notification.storeId?._id) {
          navigate(`/store/${notification.storeId._id}`);
        }
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'price_drop':
        return '💰';
      case 'availability_alert':
        return '📦';
      case 'promotion':
        return '🎉';
      case 'order':
        return '🛍️';
      default:
        return '🔔';
    }
  };

  const getNotificationTitle = (notification) => {
    switch (notification.type) {
      case 'price_drop':
        return 'Price Drop Alert!';
      case 'availability_alert':
        return 'Back Available!';
      case 'promotion':
        return 'Special Promotion!';
      case 'order':
        return 'Order Update';
      default:
        return 'Notification';
    }
  };

  if (!user) return null;

  return (
    <>
      <IconButton
        className="navbar-notification-panel__button"
        onClick={handleOpen}
        size="medium"
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge 
          badgeContent={unreadCount > 0 ? unreadCount : null}
          color="error" 
          max={99}
          invisible={unreadCount === 0}
        >
          <NotificationsNoneIcon className="navbar-notification-panel__bell" />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleClose}
        className="navbar-notification-panel__drawer"
        PaperProps={{
          className: 'navbar-notification-panel__drawer-paper'
        }}
      >
        <div className="navbar-notification-panel__container">
          {/* Header */}
          <div className="navbar-notification-panel__header">
            <Typography variant="h6" className="navbar-notification-panel__title">
              All Notifications
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </div>

          {/* Mark All as Read Button */}
          {unreadCount > 0 && (
            <div className="navbar-notification-panel__actions">
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                className="navbar-notification-panel__mark-all-btn"
                startIcon={<MarkAsUnreadIcon />}
              >
                Mark All as Read ({unreadCount})
              </Button>
            </div>
          )}

          <Divider />

          {/* Notifications List */}
          <div className="navbar-notification-panel__content">
            {loading ? (
              <div className="navbar-notification-panel__loading">
                <Typography>Loading notifications...</Typography>
              </div>
            ) : error ? (
              <div className="navbar-notification-panel__error">
                <Typography color="error">{error}</Typography>
              </div>
            ) : notifications.length === 0 ? (
              <div className="navbar-notification-panel__empty">
                <NotificationsNoneIcon className="navbar-notification-panel__empty-icon" />
                <Typography variant="body2" color="textSecondary">
                  No notifications yet
                </Typography>
              </div>
            ) : (
              <List className="navbar-notification-panel__list">
                {notifications.map((notification) => (
                  <ListItem
                    key={notification._id}
                    className={`navbar-notification-panel__item ${
                      !notification.isRead ? 'navbar-notification-panel__item--unread' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                    button
                  >
                    <ListItemAvatar>
                      <Avatar className="navbar-notification-panel__avatar">
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" className="navbar-notification-panel__item-title">
                          {getNotificationTitle(notification)}
                          {!notification.isRead && (
                            <Chip 
                              label="NEW" 
                              size="small" 
                              color="primary" 
                              className="navbar-notification-panel__new-chip"
                            />
                          )}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" className="navbar-notification-panel__item-message">
                            {notification.message}
                          </Typography>
                          {notification.productId && (
                            <Box className="navbar-notification-panel__product-info">
                              {notification.productId.images && notification.productId.images.length > 0 && (
                                <img
                                  src={`${API_BASE_URL}${notification.productId.images[0]}`}
                                  alt={notification.productId.productName}
                                  className="navbar-notification-panel__product-image"
                                />
                              )}
                              <Box>
                                <Typography variant="caption" className="navbar-notification-panel__product-name">
                                  {notification.productId.productName}
                                </Typography>
                                {notification.productId.price && (
                                  <Typography variant="caption" className="navbar-notification-panel__product-price">
                                    ₱{notification.productId.price.toFixed(2)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                          <Typography variant="caption" className="navbar-notification-panel__item-time">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default NavbarNotificationPanel;