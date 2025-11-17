import React from 'react';
import { validation } from '../utils/validation';
import './PasswordStrengthIndicator.css';

const PasswordStrengthIndicator = ({ password, showDetails = true }) => {
  const strengthResult = validation.passwordStrength(password);
  
  if (!password) return null;

  const { strength, percentage, color, feedback, checks } = strengthResult;

  const getStrengthLabel = () => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
  };

  const getStrengthIcon = () => {
    switch (strength) {
      case 'weak': return '🔓';
      case 'medium': return '🔐';
      case 'strong': return '🔒';
      default: return '';
    }
  };

  return (
    <div className="password-strength-indicator">
      {/* Strength Bar */}
      <div className="strength-bar-container">
        <div className="strength-bar-label">
          <span className="strength-icon">{getStrengthIcon()}</span>
          <span className="strength-text" style={{ color }}>
            Password Strength: <strong>{getStrengthLabel()}</strong>
          </span>
          <span className="strength-percentage">({percentage}%)</span>
        </div>
        
        <div className="strength-bar">
          <div 
            className={`strength-bar-fill strength-bar-fill--${strength}`}
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color,
              transition: 'all 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Password Requirements */}
      {showDetails && (
        <div className="password-requirements">
          <div className="requirements-title">Password Requirements:</div>
          <div className="requirements-list">
            <div className={`requirement ${checks.length ? 'met' : 'unmet'}`}>
              <span className="requirement-icon">
                {checks.length ? '✅' : '❌'}
              </span>
              <span className="requirement-text">At least 8 characters</span>
            </div>
            
            <div className={`requirement ${checks.lowercase ? 'met' : 'unmet'}`}>
              <span className="requirement-icon">
                {checks.lowercase ? '✅' : '❌'}
              </span>
              <span className="requirement-text">Lowercase letter (a-z)</span>
            </div>
            
            <div className={`requirement ${checks.uppercase ? 'met' : 'unmet'}`}>
              <span className="requirement-icon">
                {checks.uppercase ? '✅' : '❌'}
              </span>
              <span className="requirement-text">Uppercase letter (A-Z)</span>
            </div>
            
            <div className={`requirement ${checks.numbers ? 'met' : 'unmet'}`}>
              <span className="requirement-icon">
                {checks.numbers ? '✅' : '❌'}
              </span>
              <span className="requirement-text">Number (0-9)</span>
            </div>
            
            <div className={`requirement ${checks.symbols ? 'met' : 'unmet'}`}>
              <span className="requirement-icon">
                {checks.symbols ? '✅' : '❌'}
              </span>
              <span className="requirement-text">Special character (!@#$%^&*)</span>
            </div>
            
            <div className={`requirement ${checks.noCommonPatterns ? 'met' : 'unmet'}`}>
              <span className="requirement-icon">
                {checks.noCommonPatterns ? '✅' : '❌'}
              </span>
              <span className="requirement-text">Not a common password</span>
            </div>
          </div>

          {/* Feedback */}
          {feedback.length > 0 && strength !== 'strong' && (
            <div className="password-feedback">
              <div className="feedback-title">💡 Suggestions to improve:</div>
              <ul className="feedback-list">
                {feedback.map((item, index) => (
                  <li key={index} className="feedback-item">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {strength === 'strong' && (
            <div className="password-success">
              <span className="success-icon">🎉</span>
              <span className="success-text">Excellent! Your password is strong and secure.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Compact version for inline display
export const PasswordStrengthBadge = ({ password }) => {
  const strengthResult = validation.passwordStrength(password);
  
  if (!password) return null;

  const { strength, color } = strengthResult;

  const getStrengthLabel = () => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
  };

  return (
    <span 
      className={`password-strength-badge password-strength-badge--${strength}`}
      style={{ color, borderColor: color }}
    >
      {getStrengthLabel()}
    </span>
  );
};

export default PasswordStrengthIndicator;