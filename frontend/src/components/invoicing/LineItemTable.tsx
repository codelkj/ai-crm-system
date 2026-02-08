/**
 * Line Item Table Component
 * Manage invoice line items with add, edit, delete
 */

import React, { useState } from 'react';
import { LineItem } from '../../services/invoicing.service';
import './LineItemTable.css';

interface LineItemTableProps {
  invoiceId: string;
  lineItems: LineItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  editable: boolean;
  onAddItem: (item: { description: string; quantity: number; unit_price: number }) => Promise<void>;
  onUpdateItem: (lineItemId: string, item: { description?: string; quantity?: number; unit_price?: number }) => Promise<void>;
  onDeleteItem: (lineItemId: string) => Promise<void>;
}

const LineItemTable: React.FC<LineItemTableProps> = ({
  lineItems,
  subtotal,
  vatRate,
  vatAmount,
  total,
  editable,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    quantity: 1,
    unit_price: 0
  });
  const [saving, setSaving] = useState(false);

  const formatCurrency = (amount: number) => {
    return `R ${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const resetForm = () => {
    setFormData({ description: '', quantity: 1, unit_price: 0 });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!formData.description || formData.quantity <= 0 || formData.unit_price <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }

    try {
      setSaving(true);
      await onAddItem(formData);
      resetForm();
    } catch (error) {
      console.error('Failed to add line item:', error);
      alert('Failed to add line item');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: LineItem) => {
    setEditingId(item.id);
    setFormData({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price
    });
    setShowAddForm(false);
  };

  const handleUpdate = async (lineItemId: string) => {
    if (!formData.description || formData.quantity <= 0 || formData.unit_price <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }

    try {
      setSaving(true);
      await onUpdateItem(lineItemId, formData);
      resetForm();
    } catch (error) {
      console.error('Failed to update line item:', error);
      alert('Failed to update line item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lineItemId: string) => {
    if (!confirm('Are you sure you want to delete this line item?')) {
      return;
    }

    try {
      setSaving(true);
      await onDeleteItem(lineItemId);
    } catch (error) {
      console.error('Failed to delete line item:', error);
      alert('Failed to delete line item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="line-item-table">
      <div className="line-item-table-header">
        <h3>Line Items</h3>
        {editable && !showAddForm && !editingId && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddForm(true)}
          >
            + Add Line Item
          </button>
        )}
      </div>

      <table className="items-table">
        <thead>
          <tr>
            <th className="col-description">Description</th>
            <th className="col-quantity">Qty</th>
            <th className="col-price">Unit Price</th>
            <th className="col-amount">Amount</th>
            {editable && <th className="col-actions">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            editingId === item.id ? (
              <tr key={item.id} className="editing-row">
                <td>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description"
                    disabled={saving}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    disabled={saving}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    disabled={saving}
                  />
                </td>
                <td className="amount-cell">
                  {formatCurrency(formData.quantity * formData.unit_price)}
                </td>
                <td className="actions-cell">
                  <button
                    className="btn-icon btn-icon-success"
                    onClick={() => handleUpdate(item.id)}
                    disabled={saving}
                    title="Save"
                  >
                    ✓
                  </button>
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={resetForm}
                    disabled={saving}
                    title="Cancel"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td className="description-cell">{item.description}</td>
                <td className="quantity-cell">{item.quantity}</td>
                <td className="price-cell">{formatCurrency(item.unit_price)}</td>
                <td className="amount-cell">{formatCurrency(item.amount)}</td>
                {editable && (
                  <td className="actions-cell">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(item)}
                      disabled={saving}
                      title="Edit"
                    >
                      ✏
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDelete(item.id)}
                      disabled={saving}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </td>
                )}
              </tr>
            )
          ))}

          {showAddForm && (
            <tr className="editing-row add-row">
              <td>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description"
                  disabled={saving}
                  autoFocus
                />
              </td>
              <td>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  disabled={saving}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  disabled={saving}
                />
              </td>
              <td className="amount-cell">
                {formatCurrency(formData.quantity * formData.unit_price)}
              </td>
              <td className="actions-cell">
                <button
                  className="btn-icon btn-icon-success"
                  onClick={handleAdd}
                  disabled={saving}
                  title="Add"
                >
                  ✓
                </button>
                <button
                  className="btn-icon btn-icon-danger"
                  onClick={resetForm}
                  disabled={saving}
                  title="Cancel"
                >
                  ✕
                </button>
              </td>
            </tr>
          )}

          {lineItems.length === 0 && !showAddForm && (
            <tr className="empty-row">
              <td colSpan={editable ? 5 : 4} className="empty-cell">
                No line items added yet
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="totals-section">
        <div className="totals-row">
          <span className="totals-label">Subtotal:</span>
          <span className="totals-value">{formatCurrency(subtotal)}</span>
        </div>
        <div className="totals-row">
          <span className="totals-label">VAT ({(vatRate * 100).toFixed(2)}%):</span>
          <span className="totals-value">{formatCurrency(vatAmount)}</span>
        </div>
        <div className="totals-row totals-row-total">
          <span className="totals-label">Total:</span>
          <span className="totals-value">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default LineItemTable;
