/**
 * Invoice View Page
 * View invoice details, manage line items, record payments
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invoiceService, paymentService, Invoice, LineItem, Payment } from '../../services/invoicing.service';
import InvoiceStatusBadge from '../../components/invoicing/InvoiceStatusBadge';
import LineItemTable from '../../components/invoicing/LineItemTable';
import './InvoiceView.css';

const InvoiceView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadInvoice(id);
      loadPayments(id);
    }
  }, [id]);

  const loadInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      const response = await invoiceService.getById(invoiceId);
      setInvoice(response.data);
      setLineItems(response.data.line_items || []);
    } catch (error) {
      console.error('Failed to load invoice:', error);
      alert('Failed to load invoice');
      navigate('/invoicing/invoices');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async (invoiceId: string) => {
    try {
      const response = await paymentService.getByInvoice(invoiceId);
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  };

  const handleAddLineItem = async (item: { description: string; quantity: number; unit_price: number }) => {
    if (!id) return;
    await invoiceService.addLineItem(id, item);
    await loadInvoice(id);
  };

  const handleUpdateLineItem = async (
    lineItemId: string,
    item: { description?: string; quantity?: number; unit_price?: number }
  ) => {
    if (!id) return;
    await invoiceService.updateLineItem(id, lineItemId, item);
    await loadInvoice(id);
  };

  const handleDeleteLineItem = async (lineItemId: string) => {
    if (!id) return;
    await invoiceService.deleteLineItem(id, lineItemId);
    await loadInvoice(id);
  };

  const handleSendInvoice = async () => {
    if (!id || !invoice) return;

    if (!confirm('Are you sure you want to send this invoice to the client?')) {
      return;
    }

    try {
      await invoiceService.send(id);
      alert('Invoice sent successfully');
      await loadInvoice(id);
    } catch (error) {
      console.error('Failed to send invoice:', error);
      alert('Failed to send invoice');
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;

    try {
      const blob = await invoiceService.getPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice?.invoice_number || 'invoice'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const handleDeleteInvoice = async () => {
    if (!id || !invoice) return;

    if (!confirm('Are you sure you want to cancel this invoice? This action cannot be undone.')) {
      return;
    }

    try {
      await invoiceService.delete(id);
      alert('Invoice cancelled successfully');
      navigate('/invoicing/invoices');
    } catch (error) {
      console.error('Failed to cancel invoice:', error);
      alert('Failed to cancel invoice');
    }
  };

  const formatCurrency = (amount: number) => {
    return `R ${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA');
  };

  const isEditable = invoice?.status === 'draft';
  const canSend = invoice?.status === 'draft' && lineItems.length > 0;
  const canRecordPayment = invoice && ['sent', 'viewed', 'overdue'].includes(invoice.status) && invoice.balance_due > 0;

  if (loading) {
    return (
      <div className="invoice-view-loading">
        <div className="spinner"></div>
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return <div className="invoice-view-error">Invoice not found</div>;
  }

  return (
    <div className="invoice-view">
      {/* Header */}
      <div className="invoice-view-header">
        <div>
          <div className="invoice-header-top">
            <h1>{invoice.invoice_number}</h1>
            <InvoiceStatusBadge status={invoice.status} size="large" />
          </div>
          <p className="invoice-view-subtitle">
            {invoice.client_name ? `Client: ${invoice.client_name}` : 'No client assigned'}
          </p>
        </div>
        <div className="invoice-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/invoicing/invoices')}>
            ← Back to List
          </button>
          {isEditable && (
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/invoicing/invoices/${id}/edit`)}
            >
              Edit Details
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleDownloadPDF}>
            📄 Download PDF
          </button>
          {canSend && (
            <button className="btn btn-primary" onClick={handleSendInvoice}>
              ✉ Send Invoice
            </button>
          )}
          {canRecordPayment && (
            <button className="btn btn-success" onClick={() => setShowPaymentModal(true)}>
              💰 Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="invoice-details-grid">
        <div className="invoice-details-card">
          <h3>Invoice Information</h3>
          <div className="details-row">
            <span className="details-label">Issue Date:</span>
            <span className="details-value">{formatDate(invoice.issue_date)}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Due Date:</span>
            <span className="details-value">{formatDate(invoice.due_date)}</span>
          </div>
          <div className="details-row">
            <span className="details-label">VAT Rate:</span>
            <span className="details-value">{(invoice.vat_rate * 100).toFixed(2)}%</span>
          </div>
          {invoice.sent_date && (
            <div className="details-row">
              <span className="details-label">Sent Date:</span>
              <span className="details-value">{formatDate(invoice.sent_date)}</span>
            </div>
          )}
          {invoice.paid_date && (
            <div className="details-row">
              <span className="details-label">Paid Date:</span>
              <span className="details-value">{formatDate(invoice.paid_date)}</span>
            </div>
          )}
        </div>

        <div className="invoice-details-card">
          <h3>Financial Summary</h3>
          <div className="details-row">
            <span className="details-label">Subtotal:</span>
            <span className="details-value">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="details-row">
            <span className="details-label">VAT Amount:</span>
            <span className="details-value">{formatCurrency(invoice.vat_amount)}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Total:</span>
            <span className="details-value strong">{formatCurrency(invoice.total)}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Amount Paid:</span>
            <span className="details-value">{formatCurrency(invoice.amount_paid)}</span>
          </div>
          <div className="details-row highlight">
            <span className="details-label">Balance Due:</span>
            <span className="details-value strong">{formatCurrency(invoice.balance_due)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {(invoice.notes || invoice.terms) && (
        <div className="invoice-notes-section">
          {invoice.notes && (
            <div className="notes-card">
              <h4>Notes</h4>
              <p>{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div className="notes-card">
              <h4>Payment Terms</h4>
              <p>{invoice.terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Line Items */}
      <LineItemTable
        invoiceId={id!}
        lineItems={lineItems}
        subtotal={invoice.subtotal}
        vatRate={invoice.vat_rate}
        vatAmount={invoice.vat_amount}
        total={invoice.total}
        editable={isEditable}
        onAddItem={handleAddLineItem}
        onUpdateItem={handleUpdateLineItem}
        onDeleteItem={handleDeleteLineItem}
      />

      {/* Payments */}
      {payments.length > 0 && (
        <div className="payments-section">
          <h3>Payment History</h3>
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.payment_date)}</td>
                  <td className="amount-cell">{formatCurrency(payment.amount)}</td>
                  <td>{payment.payment_method || '—'}</td>
                  <td>{payment.reference || '—'}</td>
                  <td>{payment.recorded_by_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Danger Zone */}
      {invoice.status === 'draft' && (
        <div className="danger-zone">
          <h4>Danger Zone</h4>
          <p>Cancelling this invoice will mark it as cancelled and it cannot be recovered.</p>
          <button className="btn btn-danger" onClick={handleDeleteInvoice}>
            Cancel Invoice
          </button>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          invoiceId={id!}
          invoiceNumber={invoice.invoice_number}
          balanceDue={invoice.balance_due}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            loadInvoice(id!);
            loadPayments(id!);
          }}
        />
      )}
    </div>
  );
};

// Payment Modal Component
interface PaymentModalProps {
  invoiceId: string;
  invoiceNumber: string;
  balanceDue: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  invoiceId,
  invoiceNumber,
  balanceDue,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    amount: balanceDue,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    reference: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.amount <= 0 || formData.amount > balanceDue) {
      alert(`Payment amount must be between R0.01 and ${balanceDue.toFixed(2)}`);
      return;
    }

    try {
      setSaving(true);
      await paymentService.create({
        invoice_id: invoiceId,
        ...formData
      });
      alert('Payment recorded successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Failed to record payment:', error);
      alert(error.response?.data?.error || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Record Payment</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="payment-info">
              Invoice: <strong>{invoiceNumber}</strong> |
              Balance Due: <strong>R {balanceDue.toFixed(2)}</strong>
            </p>

            <div className="form-group">
              <label htmlFor="amount">Amount *</label>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                step="0.01"
                min="0.01"
                max={balanceDue}
                required
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="payment_date">Payment Date *</label>
              <input
                type="date"
                id="payment_date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                required
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="payment_method">Payment Method</label>
              <select
                id="payment_method"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                disabled={saving}
              >
                <option value="">Select method...</option>
                <option value="eft">EFT</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reference">Reference</label>
              <input
                type="text"
                id="reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Transaction reference"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Additional notes..."
                disabled={saving}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={saving}>
              {saving ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceView;
