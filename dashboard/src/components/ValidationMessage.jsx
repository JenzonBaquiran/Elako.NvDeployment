import React from 'react';
import './ValidationMessage.css';

const ValidationMessage = ({ error, touched = true, type = 'error' }) => {
  if (!error || !touched) return null;
  
  return (
    <div className={`validation-message validation-message--${type}`}>
      <span className="validation-message__icon">
        {type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}
      </span>
      <span className="validation-message__text">{error}</span>
    </div>
  );
};

// Validation summary component
export const ValidationSummary = ({ errors, title = 'Please fix the following errors:' }) => {
  const errorArray = Object.values(errors).filter(Boolean);
  
  if (errorArray.length === 0) return null;
  
  return (
    <div className="validation-summary">
      <div className="validation-summary__title">{title}</div>
      <ul className="validation-summary__list">
        {errorArray.map((error, index) => (
          <li key={index} className="validation-summary__item">{error}</li>
        ))}
      </ul>
    </div>
  );
};

// Form field wrapper with validation
export const ValidatedField = ({ 
  children, 
  error, 
  touched, 
  label, 
  required = false,
  className = '' 
}) => {
  const hasError = error && touched;
  
  return (
    <div className={`validated-field ${className} ${hasError ? 'has-error' : ''}`}>
      {label && (
        <label className="validated-field__label">
          {label}
          {required && <span className="validated-field__required">*</span>}
        </label>
      )}
      <div className="validated-field__input">
        {children}
      </div>
      <ValidationMessage error={error} touched={touched} />
    </div>
  );
};

export default ValidationMessage;