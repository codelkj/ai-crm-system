/**
 * Invoice Form Page
 * Create and edit invoices
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invoiceService, CreateInvoiceDTO } from '../../services/invoicing.service';
import './InvoiceForm.css';

const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateInvoiceDTO>({
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vat_rate: 0.15,
    notes: '',
    terms: 'Payment is due within 30 days of invoice date.'
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadInvoice(id);
    }
  }, [id, isEditMode]);

  const loadInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      const response = await invoiceService.getById(invoiceId);
      const invoice = response.data;

      setFormData({
        client_id: invoice.client_id,
        matter_id: invoice.matter_id,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        notes: invoice.notes || '',
        terms: invoice.terms || '',
        vat_rate: parseFloat(invoice.vat_rate.toString())
      });
    } catch (error) {
      console.error('Failed to load invoice:', error);
      alert('Failed to load invoice');
      navigate('/invoicing/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'vat_rate' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.issue_date || !formData.due_date) {
      alert('Please provide issue date and due date');
      return;
    }

    if (new Date(formData.due_date) < new Date(formData.issue_date)) {
      alert('Due date must be after issue date');
      return;
    }

    try {
      setSaving(true);
      if (isEditMode && id) {
        await invoiceService.update(id, formData);
        alert('Invoice updated successfully');
      } else {
        const response = await invoiceService.create(formData);
        alert('Invoice created successfully');
        navigate(`/invoicing/invoices/${response.data.id}`);
        return;
      }
      navigate('/invoicing/invoices');
    } catch (error: any) {
      console.error('Failed to save invoice:', error);
      alert(error.response?.data?.error || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/invoicing/invoices');
  };

  if (loading) {
    return (
      <div className="invoice-form-loading">
        <div className="spinner"></div>
        <p>Loading invoice...</p>
      </div>
    );
  }

  return (
    <div className="invoice-form-page">
      <div className="invoice-form-header">
        <div>
          <h1>{isEditMode ? 'Edit Invoice' : 'New Invoice'}</h1>
          <p className="invoice-form-subtitle">
            {isEditMode ? 'Update invoice details' : 'Create a new invoice for your client'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="invoice-form">
        <div className="form-section">
          <h3>Invoice Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="issue_date">Issue Date *</label>
              <input
                type="date"
                id="issue_date"
                name="issue_date"
                value={formData.issue_date}
                onChange={handleChange}
                required
                disabled={isEditMode}
              />
            </div>

            <div className="form-group">
              <label htmlFor="due_date">Due Date *</label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="vat_rate">VAT Rate (%)</label>
              <input
                type="number"
                id="vat_rate"
                name="vat_rate"
                value={(formData.vat_rate || 0) * 100}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    vat_rate: parseFloat(e.target.value) / 100 || 0
                  }));
                }}
                step="0.1"
                min="0"
                max="100"
              />
              <small className="form-hint">South African standard VAT is 15%</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="client_id">Client (Optional)</label>
            <input
              type="text"
              id="client_id"
              name="client_id"
              value={formData.client_id || ''}
              onChange={handleChange}
              placeholder="Client ID (leave blank if not linked)"
            />
            <small className="form-hint">Link this invoice to a client for better tracking</small>
          </div>

          <div className="form-group">
            <label htmlFor="matter_id">Matter (Optional)</label>
            <input
              type="text"
              id="matter_id"
              name="matter_id"
              value={formData.matter_id || ''}
              onChange={handleChange}
              placeholder="Matter ID (leave blank if not linked)"
            />
            <small className="form-hint">Link this invoice to a specific matter</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Terms & Notes</h3>

          <div className="form-group">
            <label htmlFor="terms">Payment Terms</label>
            <textarea
              id="terms"
              name="terms"
              value={formData.terms || ''}
              onChange={handleChange}
              rows={3}
              placeholder="e.g., Payment is due within 30 days of invoice date."
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={4}
              placeholder="Additional notes or instructions for the client..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : (isEditMode ? 'Update Invoice' : 'Create Invoice')}
          </button>
        </div>

        {!isEditMode && (
          <div className="form-note">
            <p>
              <strong>Note:</strong> After creating the invoice, you'll be able to add line items
              on the invoice detail page.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default InvoiceForm;
