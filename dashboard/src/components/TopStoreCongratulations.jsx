import React, { useState, useEffect } from 'react';
import './TopStoreCongratulations.css';

const TopStoreCongratulations = ({ 
  isVisible, 
  onClose, 
  storeInfo,
  badgeData 
}) => {
  const [showBalloons, setShowBalloons] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Start animations with delays
      setTimeout(() => setShowBalloons(true), 300);
      setTimeout(() => setShowConfetti(true), 600);
    } else {
      setShowBalloons(false);
      setShowConfetti(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleClose = () => {
    setShowBalloons(false);
    setShowConfetti(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Generate balloon elements
  const balloons = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className={`balloon balloon-${(i % 4) + 1} ${showBalloons ? 'animate' : ''}`}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${3 + Math.random() * 2}s`
      }}
    />
  ));

  // Generate confetti elements
  const confetti = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className={`confetti confetti-${(i % 6) + 1} ${showConfetti ? 'animate' : ''}`}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 3}s`
      }}
    />
  ));

  return (
    <div className="top-store-congratulations-overlay">
      <div className="congratulations-backdrop" onClick={handleClose} />
      
      {/* Balloons Animation */}
      <div className="balloons-container">
        {balloons}
      </div>

      {/* Confetti Animation */}
      <div className="confetti-container">
        {confetti}
      </div>

      {/* Main Congratulations Modal */}
      <div className="congratulations-modal">
        <button className="close-button" onClick={handleClose}>
          ×
        </button>

        <div className="congratulations-content">
          {/* Trophy Icon */}
          <div className="trophy-icon">
            🏆
          </div>

          {/* Main Message */}
          <h1 className="congratulations-title">
            CONGRATULATIONS!
          </h1>
          
          <h2 className="achievement-subtitle">
            🎉 You are one of the TOP STORES! 🎉
          </h2>

          <div className="store-info">
            <h3>{storeInfo?.storeName || 'Your Store'}</h3>
            <p>has achieved Top Store status this week!</p>
          </div>

          {/* Achievement Details */}
          <div className="achievement-details">
            <div className="achievement-item">
              <span className="achievement-icon">⭐</span>
              <span>Excellent Ratings</span>
              <span className="achievement-value">
                {badgeData?.criteria?.storeRating?.current?.toFixed(1) || '4.5+'}
              </span>
            </div>
            
            <div className="achievement-item">
              <span className="achievement-icon">👁️</span>
              <span>High Profile Views</span>
              <span className="achievement-value">
                {badgeData?.criteria?.profileViews?.current || '200+'} this week
              </span>
            </div>
            
            <div className="achievement-item">
              <span className="achievement-icon">📖</span>
              <span>Blog Engagement</span>
              <span className="achievement-value">
                {badgeData?.criteria?.blogViews?.current || '100+'} views
              </span>
            </div>
          </div>

          {/* Badge Display */}
          <div className="badge-showcase">
            <div className="top-store-badge-large">
              <span className="badge-icon">🏆</span>
              <span className="badge-text">TOP STORE</span>
              <div className="badge-shine"></div>
            </div>
          </div>

          {/* Motivation Message */}
          <div className="motivation-message">
            <p>
              Your dedication to quality and customer service has made you stand out! 
              Keep up the excellent work to maintain your Top Store status.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="congratulations-actions">
            <button className="share-button" onClick={() => {
              // Could implement social sharing here
              alert('Share functionality coming soon!');
            }}>
              📱 Share Achievement
            </button>
            
            <button className="continue-button" onClick={handleClose}>
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopStoreCongratulations;