import React, { useState } from 'react';
import { CardWithBadge } from './BadgeWrapper';
import BadgeCelebration from './BadgeCelebration';
import TopStoreBadge from './TopStoreBadge';
import TopFanBadge from './TopFanBadge';
import useBadges from '../hooks/useBadges';

// Enhanced Hot Pick Card with Badge Integration
const HotPickCardWithBadge = ({ product }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const handleBadgeClick = (badge) => {
    console.log('Badge clicked:', badge);
    setShowDetails(true);
  };

  return (
    <CardWithBadge 
      userId={product.msmeId} 
      userType="store" 
      className="hot-pick-card"
      onBadgeClick={handleBadgeClick}
    >
      <img src={product.image || '/api/placeholder/300/220'} alt={product.productName} />
      <div className="hot-pick-label trending">Hot Pick</div>
      
      <div className="hot-pick-content">
        <div className="hot-pick-info">
          <h3>{product.productName}</h3>
          <p>{product.description}</p>
          <div className="hot-pick-rating">
            ⭐ {product.rating ? product.rating.toFixed(1) : 'No rating'} 
            ({product.reviewCount || 0} reviews)
          </div>
          <div className="hot-pick-price">₱{product.price}</div>
        </div>
        
        <div className="hot-pick-button">
          <button className="hero-button hero-button-outline">
            View Product
          </button>
        </div>
      </div>
    </CardWithBadge>
  );
};

// Enhanced Top Store Card with Badge Integration
const TopStoreCardWithBadge = ({ store }) => {
  const [showBadgeDetails, setShowBadgeDetails] = useState(false);
  const { badge, hasBadge } = useBadges(store._id, 'store');

  const handleBadgeClick = () => {
    setShowBadgeDetails(true);
  };

  const closeBadgeDetails = () => {
    setShowBadgeDetails(false);
  };

  return (
    <>
      <CardWithBadge 
        userId={store._id} 
        userType="store" 
        className="top-stores-card"
        onBadgeClick={handleBadgeClick}
      >
        <img src={store.image || '/api/placeholder/300/300'} alt={store.businessName} />
        
        <div className="top-stores-content">
          <div className="top-stores-info">
            <h3>{store.businessName}</h3>
            <p>{store.description}</p>
            <div className="top-stores-rating">
              ⭐ {store.rating ? store.rating.toFixed(1) : 'New'} 
              ({store.totalReviews || 0} reviews)
            </div>
          </div>
          
          <div className="top-stores-button">
            <button className="hero-button hero-button-outline">
              Visit Store
            </button>
          </div>
        </div>
      </CardWithBadge>

      {/* Badge Details Modal */}
      {showBadgeDetails && hasBadge && (
        <div className="badge-details-modal" onClick={closeBadgeDetails}>
          <div className="badge-details-content" onClick={e => e.stopPropagation()}>
            <TopStoreBadge 
              badge={badge} 
              size="large" 
              showDetails={true} 
            />
            <button 
              className="close-badge-details" 
              onClick={closeBadgeDetails}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Recently Joined Store Card with Badge Integration
const RecentlyJoinedCardWithBadge = ({ store }) => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <CardWithBadge 
      userId={store._id} 
      userType="store" 
      className="recently-joined-card"
    >
      <img src={store.image || '/api/placeholder/48/48'} alt={store.businessName} className="store-logo" />
      
      <div className="recently-joined-content">
        <h3>
          {store.businessName}
          <div className="recently-joined-label">New</div>
        </h3>
        <p>{store.description}</p>
        
        <div className="recently-joined-meta">
          <span>📍 {store.location || 'Location not specified'}</span>
          <span>🕐 Joined recently</span>
        </div>
        
        <div className="recently-joined-tags">
          {store.category && (
            <span className="recently-joined-tag">{store.category}</span>
          )}
        </div>
        
        <button 
          className="visit-store-btn"
          onClick={() => setShowProfile(true)}
        >
          Visit Store
        </button>
      </div>
    </CardWithBadge>
  );
};

// Customer Profile Badge Display
const CustomerProfileBadge = ({ customerId }) => {
  const { badge, hasBadge, loading } = useBadges(customerId, 'customer');

  if (loading) {
    return <div className="badge-loading">Loading badge...</div>;
  }

  if (!hasBadge) {
    return null;
  }

  return (
    <div className="profile-badge-container">
      <TopFanBadge badge={badge} size="medium" />
      <div className="profile-badge-info">
        <h4>
          {badge.badgeType === 'suki' ? 'Suki Customer Badge' : 'Top Fan Badge'}
        </h4>
        <p>
          {badge.badgeType === 'suki' 
            ? `You're a loyal customer of ${badge.loyaltyStore?.storeName}!`
            : 'You\'re one of our most engaged customers this week!'
          }
        </p>
      </div>
    </div>
  );
};

// Store Profile Badge Display
const StoreProfileBadge = ({ storeId }) => {
  const { badge, hasBadge, loading } = useBadges(storeId, 'store');

  if (loading) {
    return <div className="badge-loading">Loading badge...</div>;
  }

  if (!hasBadge) {
    return null;
  }

  return (
    <div className="profile-badge-container">
      <TopStoreBadge badge={badge} size="medium" showDetails={false} />
      <div className="profile-badge-info">
        <h4>Weekly Top Store Badge</h4>
        <p>
          This store has met all criteria for excellence this week! 
          High ratings, great customer engagement, and quality service.
        </p>
      </div>
    </div>
  );
};

// Badge Management Component for Admin/Store Owner
const BadgeManagement = ({ userId, userType }) => {
  const { badge, calculateBadge, loading } = useBadges(userId, userType);

  const handleRecalculate = () => {
    calculateBadge();
  };

  return (
    <div className="badge-management">
      <h3>Badge Status</h3>
      
      <div className="badge-actions">
        <button 
          onClick={handleRecalculate} 
          disabled={loading}
          className="calculate-badge-btn"
        >
          {loading ? 'Calculating...' : 'Recalculate Badge'}
        </button>
      </div>

      {badge && (
        <div className="current-badge-status">
          {userType === 'store' ? (
            <TopStoreBadge badge={badge} showDetails={true} />
          ) : (
            <TopFanBadge badge={badge} showDetails={true} />
          )}
        </div>
      )}
    </div>
  );
};

export {
  HotPickCardWithBadge,
  TopStoreCardWithBadge,
  RecentlyJoinedCardWithBadge,
  CustomerProfileBadge,
  StoreProfileBadge,
  BadgeManagement
};