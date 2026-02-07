/**
 * CSV Upload Component
 */

import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { useAppSelector } from '../../store/hooks';
import { financialService } from '../../services/financial.service';

interface CSVUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CSVUpload: React.FC<CSVUploadProps> = ({ onClose, onSuccess }) => {
  const { accounts } = useAppSelector((state) => state.financial);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !accountId) {
      setError('Please select both a file and an account');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('account_id', accountId);

    try {
      await financialService.importCSV(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to import CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Import Transactions from CSV" size="medium">
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
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
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
            CSV File *
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          {selectedFile && (
            <p style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        <div
          style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>
            CSV Format
          </h4>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
            Your CSV should have the following columns:
          </p>
          <code
            style={{
              display: 'block',
              background: '#fff',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
          >
            date,description,amount,type
          </code>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Button type="submit" loading={loading}>
            Import
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CSVUpload;
