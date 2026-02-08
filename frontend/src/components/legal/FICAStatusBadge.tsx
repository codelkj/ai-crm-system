/**
 * FICA Status Badge Component
 * Color-coded display for FICA compliance status
 */

import React from 'react';
import './FICAStatusBadge.css';

interface FICAStatusBadgeProps {
  status: 'not_started' | 'in_progress' | 'complete' | 'exception';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const FICAStatusBadge: React.FC<FICAStatusBadgeProps> = ({
  status,
  size = 'medium',
  showIcon = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'complete':
        return {
          label: 'FICA Complete',
          className: 'fica-status-complete',
          icon: '✓'
        };
      case 'in_progress':
        return {
          label: 'FICA In Progress',
          className: 'fica-status-in-progress',
          icon: '⟳'
        };
      case 'exception':
        return {
          label: 'FICA Exception',
          className: 'fica-status-exception',
          icon: '⚠'
        };
      case 'not_started':
      default:
        return {
          label: 'FICA Not Started',
          className: 'fica-status-not-started',
          icon: '○'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`fica-status-badge fica-status-badge--${size} ${config.className}`}>
      {showIcon && <span className="fica-status-badge__icon">{config.icon}</span>}
      <span className="fica-status-badge__label">{config.label}</span>
    </span>
  );
};

export default FICAStatusBadge;
