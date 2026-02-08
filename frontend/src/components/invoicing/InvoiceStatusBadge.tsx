/**
 * Invoice Status Badge Component
 * Color-coded status indicator for invoices
 */

import React from 'react';
import './InvoiceStatusBadge.css';

interface InvoiceStatusBadgeProps {
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  size?: 'small' | 'medium' | 'large';
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({
  status,
  size = 'medium'
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'paid':
        return { label: 'Paid', className: 'status-paid', icon: '✓' };
      case 'overdue':
        return { label: 'Overdue', className: 'status-overdue', icon: '⚠' };
      case 'sent':
        return { label: 'Sent', className: 'status-sent', icon: '✉' };
      case 'viewed':
        return { label: 'Viewed', className: 'status-viewed', icon: '👁' };
      case 'cancelled':
        return { label: 'Cancelled', className: 'status-cancelled', icon: '✕' };
      case 'draft':
      default:
        return { label: 'Draft', className: 'status-draft', icon: '○' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`invoice-status-badge invoice-status-badge--${size} ${config.className}`}>
      <span className="invoice-status-badge__icon">{config.icon}</span>
      <span className="invoice-status-badge__label">{config.label}</span>
    </span>
  );
};

export default InvoiceStatusBadge;
