/**
 * Deal Create/Edit Form
 */

import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAppSelector } from '../../store/hooks';
import { salesService, Deal } from '../../services/sales.service';

interface DealFormProps {
  deal: Deal | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DealForm: React.FC<DealFormProps> = ({ deal, onClose, onSuccess }) => {
  const { stages } = useAppSelector((state) => state.sales);
  const { companies, contacts } = useAppSelector((state) => state.crm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company_id: '',
    contact_id: '',
    stage_id: '',
    title: '',
    description: '',
    value: '',
    probability: '',
    expected_close_date: '',
  });

  useEffect(() => {
    if (deal) {
      setFormData({
        company_id: deal.company_id || '',
        contact_id: deal.contact_id || '',
        stage_id: deal.stage_id || '',
        title: deal.title || '',
        description: deal.description || '',
        value: deal.value?.toString() || '',
        probability: deal.probability?.toString() || '',
        expected_close_date: deal.expected_close_date?.split('T')[0] || '',
      });
    } else if (stages.length > 0) {
      setFormData((prev) => ({
        ...prev,
        stage_id: stages[0].id,
      }));
    }
  }, [deal, stages]);

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
        value: parseFloat(formData.value),
        probability: formData.probability ? parseInt(formData.probability) : undefined,
        contact_id: formData.contact_id || undefined,
      };

      if (deal) {
        await salesService.updateDeal(deal.id, data);
      } else {
        await salesService.createDeal(data);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save deal');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = formData.company_id
    ? contacts.filter((c) => c.company_id === formData.company_id)
    : [];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={deal ? 'Edit Deal' : 'Create Deal'}
      size="medium"
    >
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

        <Input
          label="Deal Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

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
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input"
            rows={3}
            placeholder="Deal description..."
          />
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
            Company *
          </label>
          <select
            name="company_id"
            value={formData.company_id}
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
            <option value="">Select a company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
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
            Contact
          </label>
          <select
            name="contact_id"
            value={formData.contact_id}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            disabled={!formData.company_id}
          >
            <option value="">Select a contact</option>
            {filteredContacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.first_name} {contact.last_name}
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
            Stage *
          </label>
          <select
            name="stage_id"
            value={formData.stage_id}
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
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Value *"
            name="value"
            type="number"
            step="0.01"
            value={formData.value}
            onChange={handleChange}
            required
            placeholder="0.00"
          />

          <Input
            label="Probability (%)"
            name="probability"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={handleChange}
            placeholder="50"
          />
        </div>

        <Input
          label="Expected Close Date"
          name="expected_close_date"
          type="date"
          value={formData.expected_close_date}
          onChange={handleChange}
        />

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Button type="submit" loading={loading}>
            {deal ? 'Update' : 'Create'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DealForm;
