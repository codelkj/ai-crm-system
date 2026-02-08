/**
 * Billing Pack View Page
 * View billing pack details and time entries
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { billingPackService, BillingPack, TimeEntry } from '../../services/time-tracking.service';
import './BillingPackView.css';

const BillingPackView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pack, setPack] = useState<BillingPack | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBillingPack();
      loadTimeEntries();
    }
  }, [id]);

  const loadBillingPack = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await billingPackService.getById(id);
      setPack(response.data);
    } catch (error) {
      console.error('Failed to load billing pack:', error);
      alert('Failed to load billing pack');
      navigate('/time-tracking/billing-packs');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeEntries = async () => {
    if (!id) return;

    try {
      const response = await billingPackService.getTimeEntries(id);
      setEntries(response.data);
    } catch (error) {
      console.error('Failed to load time entries:', error);
    }
  };

  const handleSend = async () => {
    if (!id || !pack) return;

    if (!confirm('Send this billing pack to the client?')) {
      return;
    }

    try {
      await billingPackService.send(id);
      alert('Billing pack sent successfully');
      loadBillingPack();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send billing pack');
    }
  };

  const handleApprove = async () => {
    if (!id || !pack) return;

    const createInvoice = confirm(
      'Approve this billing pack?\n\nClick OK to also create an invoice, or Cancel to approve without invoice.'
    );

    try {
      await billingPackService.approve(id, createInvoice);
      alert(`Billing pack approved${createInvoice ? ' and invoice created' : ''}`);
      loadBillingPack();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to approve billing pack');
    }
  };

  const handleExportPDF = () => {
    alert('PDF export functionality will be implemented');
    // TODO: Implement PDF export
  };

  const handleExportExcel = () => {
    alert('Excel export functionality will be implemented');
    // TODO: Implement Excel export
  };

  const formatCurrency = (amount: number) => {
    return `R ${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft': return 'badge-draft';
      case 'generated': return 'badge-generated';
      case 'sent': return 'badge-sent';
      case 'approved': return 'badge-approved';
      default: return 'badge-draft';
    }
  };

  if (loading || !pack) {
    return (
      <Layout>
        <div className="billing-pack-loading">
          <div className="spinner"></div>
          <p>Loading billing pack...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="billing-pack-view">
        {/* Header */}
        <div className="billing-pack-header">
          <div>
            <button className="btn-back" onClick={() => navigate('/time-tracking/billing-packs')}>
              ← Back to Billing Packs
            </button>
            <h1>Billing Pack #{pack.id.substring(0, 8).toUpperCase()}</h1>
            <div className="billing-pack-meta">
              <span className={`status-badge ${getStatusBadgeClass(pack.status)}`}>
                {pack.status}
              </span>
              <span className="meta-item">
                {formatDate(pack.period_start)} - {formatDate(pack.period_end)}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handleExportPDF}>
              Export PDF
            </button>
            <button className="btn btn-secondary" onClick={handleExportExcel}>
              Export Excel
            </button>
            {pack.status === 'generated' && (
              <button className="btn btn-primary" onClick={handleSend}>
                Send to Client
              </button>
            )}
            {pack.status === 'sent' && (
              <button className="btn btn-success" onClick={handleApprove}>
                Approve
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">Client</div>
            <div className="summary-value">{pack.client_name || 'Unknown'}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Hours</div>
            <div className="summary-value">{pack.total_hours.toFixed(2)}h</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Entries</div>
            <div className="summary-value">{pack.total_time_entries}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Amount</div>
            <div className="summary-value highlight">{formatCurrency(pack.total_amount)}</div>
          </div>
        </div>

        {/* Additional Info */}
        {(pack.generated_by_name || pack.sent_at || pack.notes) && (
          <div className="info-section">
            {pack.generated_by_name && (
              <div className="info-item">
                <span className="info-label">Generated By:</span>
                <span className="info-value">{pack.generated_by_name}</span>
                {pack.generated_at && (
                  <span className="info-date">on {formatDate(pack.generated_at)}</span>
                )}
              </div>
            )}
            {pack.sent_at && (
              <div className="info-item">
                <span className="info-label">Sent:</span>
                <span className="info-value">{formatDate(pack.sent_at)}</span>
              </div>
            )}
            {pack.notes && (
              <div className="info-item">
                <span className="info-label">Notes:</span>
                <p className="info-notes">{pack.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Time Entries Table */}
        <div className="entries-section">
          <h2>Time Entries ({entries.length})</h2>
          {entries.length === 0 ? (
            <div className="empty-state">
              <p>No time entries in this billing pack</p>
            </div>
          ) : (
            <div className="entries-table-container">
              <table className="entries-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Matter</th>
                    <th>User</th>
                    <th>Description</th>
                    <th>Duration</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="date-cell">{formatDate(entry.entry_date)}</td>
                      <td className="matter-cell">{entry.matter_name || '—'}</td>
                      <td className="user-cell">{entry.user_name || '—'}</td>
                      <td className="description-cell">{entry.description}</td>
                      <td className="duration-cell">{formatDuration(entry.duration_minutes)}</td>
                      <td className="rate-cell">{formatCurrency(entry.hourly_rate)}</td>
                      <td className="amount-cell">{formatCurrency(entry.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan={4} className="total-label">Total</td>
                    <td className="total-duration">
                      {formatDuration(entries.reduce((sum, e) => sum + e.duration_minutes, 0))}
                    </td>
                    <td></td>
                    <td className="total-amount">
                      {formatCurrency(entries.reduce((sum, e) => sum + e.amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BillingPackView;
