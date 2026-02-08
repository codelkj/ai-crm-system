/**
 * Timesheet Page
 * Main time tracking interface for viewing and managing time entries
 */

import React, { useState, useEffect } from 'react';
import { timeEntryService, TimeEntry } from '../../services/time-tracking.service';
import TimeEntryModal from '../../components/time-tracking/TimeEntryModal';
import './Timesheet.css';

const Timesheet: React.FC = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [filters, setFilters] = useState({
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    approved: undefined as boolean | undefined,
    billable: undefined as boolean | undefined,
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });

  useEffect(() => {
    loadEntries();
  }, [filters]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await timeEntryService.getAll(filters);
      setEntries(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEntry(null);
    setShowModal(true);
  };

  const handleEdit = (entry: TimeEntry) => {
    if (entry.approved_by) {
      alert('Cannot edit approved time entry');
      return;
    }
    setEditingEntry(entry);
    setShowModal(true);
  };

  const handleDelete = async (entry: TimeEntry) => {
    if (entry.approved_by) {
      alert('Cannot delete approved time entry');
      return;
    }

    if (!confirm(`Delete time entry: ${entry.description}?`)) {
      return;
    }

    try {
      await timeEntryService.delete(entry.id);
      alert('Time entry deleted');
      loadEntries();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete time entry');
    }
  };

  const handleApprove = async (entry: TimeEntry) => {
    try {
      await timeEntryService.approve(entry.id);
      alert('Time entry approved');
      loadEntries();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to approve time entry');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingEntry(null);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingEntry(null);
    loadEntries();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatCurrency = (amount: number) => {
    return `R ${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalHours = () => {
    return entries.reduce((sum, e) => sum + e.duration_minutes, 0) / 60;
  };

  const getTotalAmount = () => {
    return entries.reduce((sum, e) => sum + e.amount, 0);
  };

  if (loading && entries.length === 0) {
    return (
      <div className="timesheet-loading">
        <div className="spinner"></div>
        <p>Loading timesheet...</p>
      </div>
    );
  }

  return (
    <div className="timesheet">
      {/* Header */}
      <div className="timesheet-header">
        <div>
          <h1>Timesheet</h1>
          <p className="timesheet-subtitle">Track and manage your billable hours</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          + New Time Entry
        </button>
      </div>

      {/* Filters */}
      <div className="timesheet-filters">
        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value, page: 1 })}
          />
        </div>
        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value, page: 1 })}
          />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.approved === undefined ? 'all' : filters.approved ? 'approved' : 'pending'}
            onChange={(e) => {
              const val = e.target.value === 'all' ? undefined : e.target.value === 'approved';
              setFilters({ ...filters, approved: val, page: 1 });
            }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Type:</label>
          <select
            value={filters.billable === undefined ? 'all' : filters.billable ? 'billable' : 'non-billable'}
            onChange={(e) => {
              const val = e.target.value === 'all' ? undefined : e.target.value === 'billable';
              setFilters({ ...filters, billable: val, page: 1 });
            }}
          >
            <option value="all">All</option>
            <option value="billable">Billable</option>
            <option value="non-billable">Non-Billable</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="timesheet-summary">
        <div className="summary-card">
          <div className="summary-label">Total Hours</div>
          <div className="summary-value">{getTotalHours().toFixed(2)}h</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Amount</div>
          <div className="summary-value">{formatCurrency(getTotalAmount())}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Entries</div>
          <div className="summary-value">{entries.length}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Approved</div>
          <div className="summary-value">{entries.filter(e => e.approved_by).length}</div>
        </div>
      </div>

      {/* Time Entries Table */}
      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏱</div>
          <h3>No time entries found</h3>
          <p>Log your first time entry to get started</p>
          <button className="btn btn-primary" onClick={handleCreate}>
            Log Time
          </button>
        </div>
      ) : (
        <>
          <div className="timesheet-table-container">
            <table className="timesheet-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Matter</th>
                  <th>Description</th>
                  <th>Duration</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className={entry.approved_by ? 'approved' : 'pending'}>
                    <td className="date-cell">{formatDate(entry.entry_date)}</td>
                    <td className="matter-cell">{entry.matter_name || '—'}</td>
                    <td className="description-cell">{entry.description}</td>
                    <td className="duration-cell">{formatDuration(entry.duration_minutes)}</td>
                    <td className="rate-cell">{formatCurrency(entry.hourly_rate)}</td>
                    <td className="amount-cell">{formatCurrency(entry.amount)}</td>
                    <td className="status-cell">
                      {entry.billed && <span className="badge badge-billed">Billed</span>}
                      {!entry.billed && entry.approved_by && (
                        <span className="badge badge-approved">Approved</span>
                      )}
                      {!entry.approved_by && (
                        <span className="badge badge-pending">Pending</span>
                      )}
                      {!entry.billable && <span className="badge badge-non-billable">Non-billable</span>}
                    </td>
                    <td className="actions-cell">
                      {!entry.approved_by && (
                        <>
                          <button
                            className="btn-icon"
                            onClick={() => handleEdit(entry)}
                            title="Edit"
                          >
                            ✏
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleApprove(entry)}
                            title="Approve"
                          >
                            ✓
                          </button>
                          <button
                            className="btn-icon btn-icon-danger"
                            onClick={() => handleDelete(entry)}
                            title="Delete"
                          >
                            🗑
                          </button>
                        </>
                      )}
                      {entry.approved_by && (
                        <span className="approved-by">
                          by {entry.approved_by_name}
                        </span>
                      )}
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

      {/* Time Entry Modal */}
      {showModal && (
        <TimeEntryModal
          entry={editingEntry}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default Timesheet;
