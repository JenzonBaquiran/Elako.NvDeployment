import React, { useState, useEffect } from 'react';
import useBadges from '../hooks/useBadges';

const BadgeWrapper = ({ 
  userId, 
  userType, // 'store' or 'customer'
  children, 
  showCelebration = true,
  badgePosition = 'top-right',
  badgeSize = 'small',
  className = '' 
}) => {
  const [badge, setBadge] = useState(null);
  const [loading, setLoading] = useState(false);

  // For now, just return children without badge functionality
  // This will be enhanced once the backend is properly connected
  return (
    <div className={`badge-wrapper ${className}`} style={{ position: 'relative' }}>
      {children}
      
      {/* Future badge display will go here */}
    </div>
  );
};

// Simple badge display component for cards
export const CardBadge = ({ 
  userId, 
  userType, 
  size = 'small',
  onClick 
}) => {
  const { badge, hasBadge } = useBadges(userId, userType);

  if (!hasBadge) return null;

  const handleClick = () => {
    if (onClick) {
      onClick(badge);
    }
  };

  if (userType === 'store') {
    return (
      <div className="card-top-store-badge" onClick={handleClick}>
        TOP STORE
        <div className="badge-tooltip">
          Weekly Top Store Badge - All criteria met!
        </div>
      </div>
    );
  } else {
    return (
      <div 
        className={`card-top-fan-badge ${badge.badgeType}`} 
        onClick={handleClick}
      >
        {badge.badgeType === 'suki' ? 'SUKI' : 'TOP FAN'}
        <div className="badge-tooltip">
          {badge.badgeType === 'suki' 
            ? `Loyal customer of ${badge.loyaltyStore?.storeName || 'this store'}`
            : 'Weekly Top Fan Badge - Great engagement!'
          }
        </div>
      </div>
    );
  }
};

// Enhanced card wrapper with integrated badges
export const CardWithBadge = ({ 
  userId, 
  userType, 
  children, 
  className = '',
  onBadgeClick 
}) => {
  return (
    <div className={`card-with-badge ${className}`} style={{ position: 'relative' }}>
      {children}
      
      <div className="badge-container-overlay">
        <CardBadge 
          userId={userId} 
          userType={userType} 
          onClick={onBadgeClick}
        />
      </div>
    </div>
  );
};

export default BadgeWrapper;