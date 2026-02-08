/**
 * Invoice List Page
 * Lists all invoices with filters and actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceService, Invoice } from '../../services/invoicing.service';
import InvoiceStatusBadge from '../../components/invoicing/InvoiceStatusBadge';
import './InvoiceList.css';

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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
    loadInvoices();
  }, [filters]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getAll(filters);
      setInvoices(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load invoices:', error);
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

  const handleViewInvoice = (id: string) => {
    navigate(`/invoicing/invoices/${id}`);
  };

  const handleCreateInvoice = () => {
    navigate('/invoicing/invoices/new');
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status, page: 1 });
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="invoice-list-loading">
        <div className="spinner"></div>
        <p>Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="invoice-list">
      <div className="invoice-list-header">
        <div>
          <h1>Invoices</h1>
          <p className="invoice-list-subtitle">
            Manage client invoices and payments
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateInvoice}>
          + New Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="invoice-filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filters.status === '' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filters.status === 'draft' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('draft')}
          >
            Draft
          </button>
          <button
            className={`filter-tab ${filters.status === 'sent' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('sent')}
          >
            Sent
          </button>
          <button
            className={`filter-tab ${filters.status === 'paid' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('paid')}
          >
            Paid
          </button>
          <button
            className={`filter-tab ${filters.status === 'overdue' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('overdue')}
          >
            Overdue
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      {invoices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <h3>No invoices found</h3>
          <p>Create your first invoice to get started</p>
          <button className="btn btn-primary" onClick={handleCreateInvoice}>
            Create Invoice
          </button>
        </div>
      ) : (
        <>
          <div className="invoice-table-container">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="invoice-row"
                    onClick={() => handleViewInvoice(invoice.id)}
                  >
                    <td>
                      <span className="invoice-number">{invoice.invoice_number}</span>
                    </td>
                    <td>
                      <span className="client-name">
                        {invoice.client_name || 'No Client'}
                      </span>
                    </td>
                    <td>{formatDate(invoice.issue_date)}</td>
                    <td>{formatDate(invoice.due_date)}</td>
                    <td className="amount">{formatCurrency(invoice.total)}</td>
                    <td className="amount">
                      <span className={invoice.balance_due > 0 ? 'balance-due' : ''}>
                        {formatCurrency(invoice.balance_due)}
                      </span>
                    </td>
                    <td>
                      <InvoiceStatusBadge status={invoice.status} size="small" />
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewInvoice(invoice.id);
                        }}
                        title="View Invoice"
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

export default InvoiceList;
