/**
 * Risk Rating Badge Component
 * Color-coded display for client risk assessment
 */

import React from 'react';
import './RiskRatingBadge.css';

interface RiskRatingBadgeProps {
  rating: 'low' | 'medium' | 'high';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const RiskRatingBadge: React.FC<RiskRatingBadgeProps> = ({
  rating,
  size = 'medium',
  showIcon = true
}) => {
  const getRatingConfig = () => {
    switch (rating) {
      case 'high':
        return {
          label: 'High Risk',
          className: 'risk-rating-high',
          icon: '⚠'
        };
      case 'medium':
        return {
          label: 'Medium Risk',
          className: 'risk-rating-medium',
          icon: '⚡'
        };
      case 'low':
      default:
        return {
          label: 'Low Risk',
          className: 'risk-rating-low',
          icon: '✓'
        };
    }
  };

  const config = getRatingConfig();

  return (
    <span className={`risk-rating-badge risk-rating-badge--${size} ${config.className}`}>
      {showIcon && <span className="risk-rating-badge__icon">{config.icon}</span>}
      <span className="risk-rating-badge__label">{config.label}</span>
    </span>
  );
};

export default RiskRatingBadge;
