/**
 * Loading Spinner Component
 */

import React from 'react';
import './Loading.css';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 'medium', message }) => {
  return (
    <div className="loading-container">
      <div className={`loading-spinner loading-${size}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default Loading;
