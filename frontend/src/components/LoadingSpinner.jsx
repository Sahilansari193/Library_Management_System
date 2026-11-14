import React from 'react';

const LoadingSpinner = ({ text = 'Loading records...' }) => {
  return (
    <div className="spinner-container fade-in">
      <div className="spinner" />
      {text && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
