import React, { useEffect } from 'react';
import '../css/TopFanCongratulations.css';

const TopFanCongratulations = ({ 
  isVisible, 
  onClose, 
  badgeData = {},
  onMarkCelebrationShown 
}) => {
  // Handle escape key and backdrop click
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);

  const handleClose = () => {
    if (onMarkCelebrationShown) {
      onMarkCelebrationShown();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  // Generate balloons for decoration - floating outside modal
  const balloons = [];
  for (let i = 0; i < 20; i++) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8', '#a29bfe', '#fdcb6e', '#e17055'];
    const color = colors[i % colors.length];
    balloons.push(
      <div
        key={i}
        className="top-fan-congratulations__balloon"
        style={{
          '--balloon-color': color,
          left: `${5 + Math.random() * 90}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${6 + Math.random() * 4}s`
        }}
      />
    );
  }

  // Generate confetti
  const confetti = [];
  for (let i = 0; i < 40; i++) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8', '#a29bfe', '#fdcb6e', '#e17055'];
    const color = colors[i % colors.length];
    confetti.push(
      <div
        key={i}
        className="top-fan-congratulations__confetti"
        style={{
          '--confetti-color': color,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 1}s`
        }}
      />
    );
  }

  return (
    <div 
      className="top-fan-congratulations__overlay" 
      onClick={handleBackdropClick}
    >
      {/* Balloons floating outside the modal */}
      <div className="top-fan-congratulations__balloons-container">
        {balloons}
      </div>

      <div className="top-fan-congratulations__modal">
        {/* Confetti inside modal */}
        <div className="top-fan-congratulations__decorations">
          {confetti}
        </div>

        {/* Close Button */}
        <button 
          className="top-fan-congratulations__close-btn"
          onClick={handleClose}
          aria-label="Close congratulations modal"
        >
          ×
        </button>

        {/* Main Content */}
        <div className="top-fan-congratulations__content">
          {/* Trophy and Badge Section */}
          <div className="top-fan-congratulations__badge-section">
            <div className="top-fan-congratulations__trophy">
              🏆
            </div>
            <div className="top-fan-congratulations__crown">
              👑
            </div>
          </div>

          {/* Congratulations Message */}
          <div className="top-fan-congratulations__message">
            <h1 className="top-fan-congratulations__title">
              🎉 Congratulations! 🎉
            </h1>
            <h2 className="top-fan-congratulations__subtitle">
              You are a TOP FAN! 👑
            </h2>
            <p className="top-fan-congratulations__description">
              Your engagement and loyalty to our amazing stores has earned you the prestigious TOP FAN badge!
            </p>
          </div>

          {/* Badge Details */}
          <div className="top-fan-congratulations__details">
            <div className="top-fan-congratulations__badge-info">
              <div className="top-fan-congratulations__badge-icon">
                {badgeData.badgeType === 'suki' ? '💝' : '⭐'}
              </div>
              <div className="top-fan-congratulations__badge-text">
                <h3>{badgeData.badgeType === 'suki' ? 'SUKI Badge' : 'TOP FAN Badge'}</h3>
                <p>
                  {badgeData.badgeType === 'suki' 
                    ? `Loyal to ${badgeData.loyaltyStore?.storeName || 'your favorite store'}!`
                    : 'Active community member!'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Achievement Criteria */}
          <div className="top-fan-congratulations__achievements">
            <h3>Your Achievements This Week:</h3>
            <div className="top-fan-congratulations__achievement-grid">
              <div className="top-fan-congratulations__achievement">
                <span className="top-fan-congratulations__achievement-icon">⭐</span>
                <span className="top-fan-congratulations__achievement-text">
                  {badgeData.criteria?.ratingsGiven?.current || 0} ratings given
                </span>
                <span className="top-fan-congratulations__achievement-status">
                  {badgeData.criteria?.ratingsGiven?.met ? '✅' : '❌'}
                </span>
              </div>
              {badgeData.loyaltyStore && badgeData.loyaltyStore.interactionCount > 0 && (
                <div className="top-fan-congratulations__achievement">
                  <span className="top-fan-congratulations__achievement-icon">💖</span>
                  <span className="top-fan-congratulations__achievement-text">
                    {badgeData.loyaltyStore.interactionCount} interactions with {badgeData.loyaltyStore.storeName}
                  </span>
                  <span className="top-fan-congratulations__achievement-status">✅</span>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="top-fan-congratulations__actions">
            <button 
              className="top-fan-congratulations__continue-btn"
              onClick={handleClose}
            >
              Continue Browsing! 🛍️
            </button>
          </div>

          {/* Badge Valid Period */}
          <div className="top-fan-congratulations__validity">
            <p>
              🗓️ This badge is valid until {badgeData.expiresAt 
                ? new Date(badgeData.expiresAt).toLocaleDateString()
                : 'end of week'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopFanCongratulations;