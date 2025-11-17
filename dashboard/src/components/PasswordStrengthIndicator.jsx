import React from 'react';
import { validation } from '../utils/validation';
import './PasswordStrengthIndicator.css';

const PasswordStrengthIndicator = ({ password, showDetails = true }) => {
  const strengthResult = validation.passwordStrength(password);
  
  if (!password) return null;

  const { strength, color } = strengthResult;

  const getStrengthLabel = () => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Weak';  // Treat medium as weak
      case 'strong': return 'Strong';
      default: return 'Weak';
    }
  };

  const getDisplayColor = () => {
    const label = getStrengthLabel();
    return label === 'Strong' ? '#4caf50' : '#f44336';
  };

  return (
    <div className="password-strength-indicator">
      <span className="strength-text" style={{ color: getDisplayColor() }}>
        Password Strength: <strong>{getStrengthLabel()}</strong>
      </span>
    </div>
  );
};

// Compact version for inline display
export const PasswordStrengthBadge = ({ password }) => {
  const strengthResult = validation.passwordStrength(password);
  
  if (!password) return null;

  const { strength } = strengthResult;

  const getStrengthLabel = () => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Weak';  // Treat medium as weak
      case 'strong': return 'Strong';
      default: return 'Weak';
    }
  };

  const getDisplayColor = () => {
    const label = getStrengthLabel();
    return label === 'Strong' ? '#4caf50' : '#f44336';
  };

  return (
    <span 
      className={`password-strength-badge password-strength-badge--${getStrengthLabel().toLowerCase()}`}
      style={{ color: getDisplayColor(), borderColor: getDisplayColor() }}
    >
      {getStrengthLabel()}
    </span>
  );
};

export default PasswordStrengthIndicator;