import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import './FollowButton.css';

const FollowButton = ({ storeId, storeName, onFollowChange }) => {
  const { user, userType, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is following this store on component mount
  useEffect(() => {
    if (isAuthenticated && userType === 'customer' && user && storeId) {
      checkFollowStatus();
    }
  }, [isAuthenticated, userType, user, storeId]);

  const checkFollowStatus = async () => {
    try {
      console.log('Checking follow status for store:', storeId, 'customer:', user._id);
      const response = await fetch(
        `http://localhost:1337/api/stores/${storeId}/follow-status/${user._id}`
      );
      const data = await response.json();

      console.log('Follow status response:', data);
      if (data.success) {
        setIsFollowing(data.following);
        console.log('Set isFollowing to:', data.following);
      } else {
        console.error('Error in follow status response:', data.error);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated || userType !== 'customer') {
      alert('Please log in as a customer to follow stores.');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const action = isFollowing ? 'unfollow' : 'follow';
      
      const response = await fetch(
        `http://localhost:1337/api/stores/${storeId}/follow`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: user._id,
            action: action
          }),
        }
      );

      const data = await response.json();

      console.log('Follow toggle response:', data);
      if (data.success) {
        setIsFollowing(data.following);
        console.log('Updated isFollowing to:', data.following);
        
        // Show success message using NotificationProvider
        const message = data.following 
          ? `Now following ${storeName || 'this store'}!` 
          : `Unfollowed ${storeName || 'this store'}`;
        
        showSuccess(message, 'Success');

        // Notify parent component of the change
        if (onFollowChange) {
          onFollowChange(data.following);
        }
      } else {
        throw new Error(data.error || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      showError('Error updating follow status. Please try again.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button if user is not authenticated or not a customer
  if (!isAuthenticated || userType !== 'customer') {
    return null;
  }

  return (
    <button
      className={`follow-button ${isFollowing ? 'following' : 'not-following'} ${isLoading ? 'loading' : ''}`}
      onClick={handleFollowToggle}
      disabled={isLoading}
      title={isFollowing ? `Unfollow ${storeName || 'this store'}` : `Follow ${storeName || 'this store'}`}
    >
      {isLoading ? (
        <span className="loading-spinner"></span>
      ) : (
        <>
          {isFollowing ? (
            <>
              <span className="checkmark">✓</span>
              <span className="button-text">Following</span>
            </>
          ) : (
            <>
              <span className="plus-icon">+</span>
              <span className="button-text">Follow</span>
            </>
          )}
        </>
      )}
    </button>
  );
};

export default FollowButton;
