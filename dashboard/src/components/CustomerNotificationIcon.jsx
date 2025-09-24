import React, { useState, useEffect } from 'react';
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
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import './CustomerNotificationIcon.css';

const CustomerNotificationIcon = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:1337/api/customer-notifications/${user._id}?limit=10`);
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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await fetch(`http://localhost:1337/api/customer-notifications/${notification._id}/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customerId: user._id }),
        });

        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate to product if it exists
      if (notification.productId?._id) {
        navigate(`/product/${notification.productId._id}`);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }

    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`http://localhost:1337/api/customer-notifications/${user._id}/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_product':
        return <ShoppingBagIcon className="customer-notification-icon__type-icon" />;
      default:
        return <ShoppingBagIcon className="customer-notification-icon__type-icon" />;
    }
  };

  const formatNotificationTime = (createdAt) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  console.log('CustomerNotificationIcon - unreadCount:', unreadCount);

  if (!user) return null;

  return (
    <div className="customer-notification-icon">
      <IconButton
        className="customer-notification-icon__button"
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
          <NotificationsNoneIcon className="customer-notification-icon__bell" />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        className="customer-notification-icon__menu"
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          className: 'customer-notification-icon__menu-paper'
        }}
      >
        <div className="customer-notification-icon__header">
          <Typography variant="h6" className="customer-notification-icon__title">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              className="customer-notification-icon__mark-all-btn"
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
          <MenuItem disabled className="customer-notification-icon__empty">
            <Box textAlign="center" py={2}>
              <NotificationsNoneIcon className="customer-notification-icon__empty-icon" />
              <Typography variant="body2" color="textSecondary">
                No notifications yet
              </Typography>
              <Typography variant="caption" color="textSecondary">
                You'll be notified when stores you follow add new products
              </Typography>
            </Box>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`customer-notification-icon__item ${
                !notification.isRead ? 'customer-notification-icon__item--unread' : ''
              }`}
            >
              <div className="customer-notification-icon__item-content">
                <div className="customer-notification-icon__item-header">
                  <div className="customer-notification-icon__item-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="customer-notification-icon__item-info">
                    <Typography variant="subtitle2" className="customer-notification-icon__item-title">
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" className="customer-notification-icon__item-message">
                      {notification.message}
                    </Typography>
                    {notification.productId && (
                      <div className="customer-notification-icon__product-info">
                        {notification.productId.picture && (
                          <Avatar
                            src={`http://localhost:1337/uploads/${notification.productId.picture}`}
                            alt={notification.productId.productName}
                            className="customer-notification-icon__product-image"
                          />
                        )}
                        <div>
                          <Typography variant="caption" className="customer-notification-icon__product-name">
                            {notification.productId.productName}
                          </Typography>
                          {notification.productId.price && (
                            <Typography variant="caption" className="customer-notification-icon__product-price">
                              ₱{notification.productId.price.toFixed(2)}
                            </Typography>
                          )}
                        </div>
                      </div>
                    )}
                    <Typography variant="caption" className="customer-notification-icon__item-time">
                      {formatNotificationTime(notification.createdAt)}
                    </Typography>
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="customer-notification-icon__unread-dot"></div>
                )}
              </div>
            </MenuItem>
          ))
        )}

        {notifications.length > 0 && [
          <Divider key="divider" />,
          <MenuItem key="view-all" className="customer-notification-icon__view-all">
            <Typography variant="body2" color="primary" align="center" width="100%">
              View All Notifications
            </Typography>
          </MenuItem>
        ]}
      </Menu>
    </div>
  );
};

export default CustomerNotificationIcon;