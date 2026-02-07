/**
 * Transaction Create Form
 */

import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAppSelector } from '../../store/hooks';
import { financialService } from '../../services/financial.service';

interface TransactionFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSuccess }) => {
  const { accounts, categories } = useAppSelector((state) => state.financial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    account_id: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'debit' as 'debit' | 'credit',
    reference_number: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || undefined,
        reference_number: formData.reference_number || undefined,
      };

      await financialService.createTransaction(data);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) => c.type === (formData.type === 'credit' ? 'income' : 'expense')
  );

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Transaction" size="medium">
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            className="error-message"
            style={{
              marginBottom: '16px',
              padding: '12px',
              background: '#fee',
              color: '#c33',
              borderRadius: '4px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 500,
              fontSize: '14px',
              color: '#333',
            }}
          >
            Account *
          </label>
          <select
            name="account_id"
            value={formData.account_id}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.account_name} - {account.bank_name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 500,
              fontSize: '14px',
              color: '#333',
            }}
          >
            Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="debit">Expense (Debit)</option>
            <option value="credit">Income (Credit)</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 500,
              fontSize: '14px',
              color: '#333',
            }}
          >
            Category
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="">Select a category</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Date *"
          name="transaction_date"
          type="date"
          value={formData.transaction_date}
          onChange={handleChange}
          required
        />

        <Input
          label="Description *"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Enter description"
        />

        <Input
          label="Amount *"
          name="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={handleChange}
          required
          placeholder="0.00"
        />

        <Input
          label="Reference Number"
          name="reference_number"
          value={formData.reference_number}
          onChange={handleChange}
          placeholder="Optional reference number"
        />

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Button type="submit" loading={loading}>
            Create
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionForm;
