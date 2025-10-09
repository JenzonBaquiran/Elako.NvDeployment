import React, { useState, useEffect } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from './NotificationProvider';
import './FavoriteButton.css';

const FavoriteButton = ({ 
  productId, 
  productName, 
  className = "", 
  size = "medium", 
  variant = "default",
  onToggle = null
}) => {
  const { user, userType, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userType === 'customer' && user?._id && productId) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, userType, user, productId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:1337/api/customers/${user._id}/favorites/${productId}/check`
      );
      const data = await response.json();
      
      if (data.success) {
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (!isAuthenticated) {
      showError('Please log in to add favorites', 'Login Required');
      return;
    }

    if (userType !== 'customer') {
      showError('Only customers can add favorites', 'Not Allowed');
      return;
    }

    if (!user?._id || !productId) {
      showError('Unable to update favorites', 'Error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:1337/api/customers/${user._id}/favorites/${productId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsFavorite(data.isFavorite);
        showSuccess(data.message, data.action === 'added' ? 'Added to Favorites' : 'Removed from Favorites');
        
        // Call the onToggle callback if provided
        if (onToggle) {
          onToggle(data.isFavorite, data.action);
        }
      } else {
        showError(data.error || 'Failed to update favorites', 'Error');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showError('Failed to update favorites', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const getButtonClass = () => {
    let baseClass = `favorite-button favorite-button--${size} favorite-button--${variant}`;
    
    if (isFavorite) {
      baseClass += ' favorite-button--active';
    }
    
    if (loading) {
      baseClass += ' favorite-button--loading';
    }
    
    return `${baseClass} ${className}`.trim();
  };

  const getIcon = () => {
    if (isFavorite) {
      return <FavoriteIcon className="favorite-button__icon" />;
    }
    return <FavoriteBorderIcon className="favorite-button__icon" />;
  };

  const getTitle = () => {
    if (!isAuthenticated) {
      return 'Login to add to favorites';
    }
    if (userType !== 'customer') {
      return 'Only customers can add favorites';
    }
    return isFavorite ? 'Remove from favorites' : 'Add to favorites';
  };

  return (
    <button
      className={getButtonClass()}
      onClick={handleToggleFavorite}
      disabled={loading || !isAuthenticated || userType !== 'customer'}
      title={getTitle()}
      aria-label={getTitle()}
    >
      {getIcon()}
    </button>
  );
};

export default FavoriteButton;
