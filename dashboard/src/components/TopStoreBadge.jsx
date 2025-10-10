import React from 'react';
import './TopStoreBadge.css';

const TopStoreBadge = ({ 
  badge, 
  size = 'medium', 
  showDetails = false, 
  className = '' 
}) => {
  if (!badge || !badge.isActive) {
    return null;
  }

  const getBadgeIcon = () => {
    return <span className="badge-icon">🏆</span>;
  };

  const getBadgeText = () => {
    return 'TOP STORE';
  };

  const formatProgress = (current, required) => {
    return `${current}/${required}`;
  };

  const getProgressPercentage = (current, required) => {
    return Math.min((current / required) * 100, 100);
  };

  return (
    <div className={`top-store-badge ${size} ${className}`}>
      <div className="badge-container">
        <div className="badge-shine"></div>
        <div className="badge-content">
          {getBadgeIcon()}
          <span className="badge-text">{getBadgeText()}</span>
        </div>
        
        {showDetails && (
          <div className="badge-details">
            <h4>Weekly Top Store Badge</h4>
            <div className="criteria-list">
              <div className="criteria-item">
                <div className="criteria-header">
                  <span>Store Rating</span>
                  <span className={badge.criteria.storeRating.met ? 'met' : 'not-met'}>
                    {badge.criteria.storeRating.current.toFixed(1)}/4.5 ⭐
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${getProgressPercentage(badge.criteria.storeRating.current, 4.5)}%`,
                      backgroundColor: badge.criteria.storeRating.met ? '#7ed957' : '#ffb300'
                    }}
                  ></div>
                </div>
              </div>

              <div className="criteria-item">
                <div className="criteria-header">
                  <span>Product Ratings</span>
                  <span className={badge.criteria.productRatings.met ? 'met' : 'not-met'}>
                    {badge.criteria.productRatings.current.toFixed(1)}/4.5 ⭐
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${getProgressPercentage(badge.criteria.productRatings.current, 4.5)}%`,
                      backgroundColor: badge.criteria.productRatings.met ? '#7ed957' : '#ffb300'
                    }}
                  ></div>
                </div>
              </div>

              <div className="criteria-item">
                <div className="criteria-header">
                  <span>Profile Views</span>
                  <span className={badge.criteria.profileViews.met ? 'met' : 'not-met'}>
                    {formatProgress(badge.criteria.profileViews.current, badge.criteria.profileViews.required)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${getProgressPercentage(badge.criteria.profileViews.current, badge.criteria.profileViews.required)}%`,
                      backgroundColor: badge.criteria.profileViews.met ? '#7ed957' : '#ffb300'
                    }}
                  ></div>
                </div>
              </div>

              <div className="criteria-item">
                <div className="criteria-header">
                  <span>Blog Views</span>
                  <span className={badge.criteria.blogViews.met ? 'met' : 'not-met'}>
                    {formatProgress(badge.criteria.blogViews.current, badge.criteria.blogViews.required)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${getProgressPercentage(badge.criteria.blogViews.current, badge.criteria.blogViews.required)}%`,
                      backgroundColor: badge.criteria.blogViews.met ? '#7ed957' : '#ffb300'
                    }}
                  ></div>
                </div>
              </div>
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

export default TopStoreBadge;