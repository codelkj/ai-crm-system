/**
 * Company Create/Edit Form
 */

import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { crmService, Company } from '../../services/crm.service';

interface CompanyFormProps {
  company: Company | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        website: company.website || '',
        phone: company.phone || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        country: company.country || '',
      });
    }
  }, [company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (company) {
        await crmService.updateCompany(company.id, formData);
      } else {
        await crmService.createCompany(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={company ? 'Edit Company' : 'Create Company'}
      size="medium"
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message" style={{ marginBottom: '16px', padding: '12px', background: '#fee', color: '#c33', borderRadius: '4px' }}>{error}</div>}

        <Input
          label="Company Name *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Input
          label="Industry"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
        />

        <Input
          label="Website"
          name="website"
          type="url"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://example.com"
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
        />

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />

          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleChange}
        />

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Button type="submit" loading={loading}>
            {company ? 'Update' : 'Create'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CompanyForm;
