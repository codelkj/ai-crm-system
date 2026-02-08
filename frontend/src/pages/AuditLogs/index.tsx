/**
 * Audit Logs Page
 * POPIA-compliant audit trail viewer (Partner/Admin only)
 */

import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { auditLogService, AuditLog } from '../../services/legal-crm.service';
import './AuditLogs.css';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    user_id: '',
    start_date: '',
    end_date: '',
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await auditLogService.getAll(filters);
      setLogs(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadgeClass = (action: string) => {
    if (action.includes('create')) return 'badge-create';
    if (action.includes('update')) return 'badge-update';
    if (action.includes('delete')) return 'badge-delete';
    if (action.includes('view') || action.includes('read')) return 'badge-view';
    return 'badge-other';
  };

  const handleViewChanges = (log: AuditLog) => {
    setSelectedLog(log);
  };

  const handleCloseModal = () => {
    setSelectedLog(null);
  };

  const handleExport = async () => {
    try {
      alert('Export functionality will download CSV with current filters');
      // TODO: Implement CSV export
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading && logs.length === 0) {
    return (
      <Layout>
        <div className="audit-logs-loading">
          <div className="spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="audit-logs">
        {/* Header */}
        <div className="audit-logs-header">
          <div>
            <h1>Audit Logs</h1>
            <p className="audit-logs-subtitle">
              POPIA-compliant audit trail of all system activity
            </p>
          </div>
          <button className="btn btn-secondary" onClick={handleExport}>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="audit-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Action:</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="view">View</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Entity Type:</label>
              <select
                value={filters.entity_type}
                onChange={(e) => setFilters({ ...filters, entity_type: e.target.value, page: 1 })}
              >
                <option value="">All Entities</option>
                <option value="matter">Matter</option>
                <option value="company">Company</option>
                <option value="contact">Contact</option>
                <option value="invoice">Invoice</option>
                <option value="time_entry">Time Entry</option>
                <option value="user">User</option>
                <option value="role">Role</option>
                <option value="department">Department</option>
              </select>
            </div>
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
          </div>
        </div>

        {/* Audit Logs Table */}
        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No audit logs found</h3>
            <p>No activity matches your current filters</p>
          </div>
        ) : (
          <>
            <div className="audit-table-container">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>IP Address</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="timestamp-cell">{formatDate(log.created_at)}</td>
                      <td className="user-cell">
                        <div className="user-info">
                          <div className="user-name">{log.user_name || 'System'}</div>
                          {log.user_email && (
                            <div className="user-email">{log.user_email}</div>
                          )}
                        </div>
                      </td>
                      <td className="action-cell">
                        <span className={`badge ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="entity-cell">
                        <div className="entity-info">
                          <div className="entity-type">{log.entity_type}</div>
                          {log.entity_id && (
                            <div className="entity-id">ID: {log.entity_id.substring(0, 8)}...</div>
                          )}
                        </div>
                      </td>
                      <td className="ip-cell">{log.ip_address || '—'}</td>
                      <td className="details-cell">
                        {log.changes ? (
                          <button
                            className="btn-view-changes"
                            onClick={() => handleViewChanges(log)}
                          >
                            View Changes
                          </button>
                        ) : (
                          <span className="no-changes">—</span>
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
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
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

        {/* Changes Modal */}
        {selectedLog && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Audit Log Details</h2>
                <button className="modal-close" onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="log-detail-grid">
                  <div className="log-detail-item">
                    <label>Action:</label>
                    <span className={`badge ${getActionBadgeClass(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </div>
                  <div className="log-detail-item">
                    <label>User:</label>
                    <span>{selectedLog.user_name || 'System'}</span>
                  </div>
                  <div className="log-detail-item">
                    <label>Entity Type:</label>
                    <span>{selectedLog.entity_type}</span>
                  </div>
                  <div className="log-detail-item">
                    <label>Entity ID:</label>
                    <span>{selectedLog.entity_id}</span>
                  </div>
                  <div className="log-detail-item">
                    <label>IP Address:</label>
                    <span>{selectedLog.ip_address || 'N/A'}</span>
                  </div>
                  <div className="log-detail-item">
                    <label>Timestamp:</label>
                    <span>{formatDate(selectedLog.created_at)}</span>
                  </div>
                </div>

                {selectedLog.changes && (
                  <div className="changes-section">
                    <h3>Changes</h3>
                    <pre className="changes-json">
                      {JSON.stringify(selectedLog.changes, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.reason && (
                  <div className="reason-section">
                    <h3>Reason</h3>
                    <p>{selectedLog.reason}</p>
                  </div>
                )}

                {selectedLog.user_agent && (
                  <div className="user-agent-section">
                    <h3>User Agent</h3>
                    <p className="user-agent">{selectedLog.user_agent}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AuditLogs;
