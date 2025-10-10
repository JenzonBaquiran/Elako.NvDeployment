import React from 'react';
import './TopFanBadge.css';

const TopFanBadge = ({ 
  badge, 
  size = 'medium', 
  showDetails = false, 
  className = '' 
}) => {
  if (!badge || !badge.isActive) {
    return null;
  }

  const getBadgeIcon = () => {
    if (badge.badgeType === 'suki') {
      return <span className="badge-icon suki-icon">🌟</span>;
    }
    return <span className="badge-icon fan-icon">👑</span>;
  };

  const getBadgeText = () => {
    if (badge.badgeType === 'suki') {
      return 'SUKI';
    }
    return 'TOP FAN';
  };

  const getBadgeSubtext = () => {
    if (badge.badgeType === 'suki' && badge.loyaltyStore.storeName) {
      return `of ${badge.loyaltyStore.storeName}`;
    }
    return '';
  };

  const formatProgress = (current, required) => {
    return `${current}/${required}`;
  };

  const getProgressPercentage = (current, required) => {
    return Math.min((current / required) * 100, 100);
  };

  return (
    <div className={`top-fan-badge ${size} ${badge.badgeType} ${className}`}>
      <div className="badge-container">
        <div className="badge-shine"></div>
        <div className="badge-content">
          {getBadgeIcon()}
          <div className="badge-text-container">
            <span className="badge-text">{getBadgeText()}</span>
            {getBadgeSubtext() && (
              <span className="badge-subtext">{getBadgeSubtext()}</span>
            )}
          </div>
        </div>
        
        {showDetails && (
          <div className="badge-details">
            <h4>
              {badge.badgeType === 'suki' ? 'Loyal Customer Badge' : 'Weekly Top Fan Badge'}
            </h4>
            
            <div className="criteria-list">
              <div className="criteria-item">
                <div className="criteria-header">
                  <span>Ratings Given</span>
                  <span className={badge.criteria.ratingsGiven.met ? 'met' : 'not-met'}>
                    {formatProgress(badge.criteria.ratingsGiven.current, badge.criteria.ratingsGiven.required)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${getProgressPercentage(badge.criteria.ratingsGiven.current, badge.criteria.ratingsGiven.required)}%`,
                      backgroundColor: badge.criteria.ratingsGiven.met ? '#7ed957' : '#ffb300'
                    }}
                  ></div>
                </div>
              </div>

              <div className="criteria-item">
                <div className="criteria-header">
                  <span>Blog Posts Viewed</span>
                  <span className={badge.criteria.blogEngagement.met ? 'met' : 'not-met'}>
                    {formatProgress(badge.criteria.blogEngagement.current, badge.criteria.blogEngagement.required)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${getProgressPercentage(badge.criteria.blogEngagement.current, badge.criteria.blogEngagement.required)}%`,
                      backgroundColor: badge.criteria.blogEngagement.met ? '#7ed957' : '#ffb300'
                    }}
                  ></div>
                </div>
              </div>

              {badge.badgeType === 'suki' && badge.loyaltyStore.storeName && (
                <div className="loyalty-info">
                  <div className="loyalty-store">
                    <span className="loyalty-icon">❤️</span>
                    <span>Most loyal to: <strong>{badge.loyaltyStore.storeName}</strong></span>
                  </div>
                  <div className="interaction-count">
                    <span>{badge.loyaltyStore.interactionCount} interactions this week</span>
                  </div>
                </div>
              )}
            </div>
            
            {badge.awardedAt && (
              <div className="badge-awarded">
                <small>Awarded on {new Date(badge.awardedAt).toLocaleDateString()}</small>
              </div>
            )}
            
            {badge.expiresAt && (
              <div className="badge-expires">
                <small>Expires on {new Date(badge.expiresAt).toLocaleDateString()}</small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopFanBadge;