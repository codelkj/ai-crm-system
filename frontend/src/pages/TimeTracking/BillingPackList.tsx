/**
 * Billing Pack List Page
 * Lists all billing packs with filters and actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingPackService, BillingPack } from '../../services/time-tracking.service';
import './BillingPackList.css';

const BillingPackList: React.FC = () => {
  const navigate = useNavigate();
  const [packs, setPacks] = useState<BillingPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });

  useEffect(() => {
    loadPacks();
  }, [filters]);

  const loadPacks = async () => {
    try {
      setLoading(true);
      const response = await billingPackService.getAll(filters);
      setPacks(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load billing packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `R ${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA');
  };

  const handleView = (id: string) => {
    navigate(`/time-tracking/billing-packs/${id}`);
  };

  const handleGenerate = () => {
    navigate('/time-tracking/billing-packs/generate');
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      draft: { label: 'Draft', className: 'status-draft' },
      generated: { label: 'Generated', className: 'status-generated' },
      sent: { label: 'Sent', className: 'status-sent' },
      approved: { label: 'Approved', className: 'status-approved' }
    };

    const badge = badges[status] || { label: status, className: '' };

    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
  };

  if (loading && packs.length === 0) {
    return (
      <div className="billing-pack-loading">
        <div className="spinner"></div>
        <p>Loading billing packs...</p>
      </div>
    );
  }

  return (
    <div className="billing-pack-list">
      <div className="billing-pack-header">
        <div>
          <h1>Billing Packs</h1>
          <p className="billing-pack-subtitle">
            Monthly billing summaries for client review
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate}>
          + Generate Billing Pack
        </button>
      </div>

      {/* Filters */}
      <div className="billing-pack-filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filters.status === '' ? 'active' : ''}`}
            onClick={() => setFilters({ ...filters, status: '', page: 1 })}
          >
            All
          </button>
          <button
            className={`filter-tab ${filters.status === 'draft' ? 'active' : ''}`}
            onClick={() => setFilters({ ...filters, status: 'draft', page: 1 })}
          >
            Draft
          </button>
          <button
            className={`filter-tab ${filters.status === 'generated' ? 'active' : ''}`}
            onClick={() => setFilters({ ...filters, status: 'generated', page: 1 })}
          >
            Generated
          </button>
          <button
            className={`filter-tab ${filters.status === 'sent' ? 'active' : ''}`}
            onClick={() => setFilters({ ...filters, status: 'sent', page: 1 })}
          >
            Sent
          </button>
          <button
            className={`filter-tab ${filters.status === 'approved' ? 'active' : ''}`}
            onClick={() => setFilters({ ...filters, status: 'approved', page: 1 })}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Billing Pack Table */}
      {packs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No billing packs found</h3>
          <p>Generate your first billing pack to get started</p>
          <button className="btn btn-primary" onClick={handleGenerate}>
            Generate Billing Pack
          </button>
        </div>
      ) : (
        <>
          <div className="billing-pack-table-container">
            <table className="billing-pack-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Period</th>
                  <th>Entries</th>
                  <th>Hours</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Generated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packs.map((pack) => (
                  <tr
                    key={pack.id}
                    className="billing-pack-row"
                    onClick={() => handleView(pack.id)}
                  >
                    <td>
                      <span className="client-name">
                        {pack.client_name || 'No Client'}
                      </span>
                    </td>
                    <td>
                      {formatDate(pack.period_start)} - {formatDate(pack.period_end)}
                    </td>
                    <td className="entries-cell">{pack.total_time_entries}</td>
                    <td className="hours-cell">{pack.total_hours.toFixed(2)}h</td>
                    <td className="amount-cell">{formatCurrency(pack.total_amount)}</td>
                    <td>{getStatusBadge(pack.status)}</td>
                    <td className="generated-cell">
                      {pack.generated_at ? formatDate(pack.generated_at) : '—'}
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(pack.id);
                        }}
                        title="View Billing Pack"
                      >
                        👁
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={filters.page === pagination.pages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BillingPackList;
