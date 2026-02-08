/**
 * Matter Create/Edit Form Page
 * Create new matters or edit existing ones
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { matterService, Matter, CreateMatterDTO } from '../../services/matter.service';
import { departmentService, Department } from '../../services/legal-crm.service';
import './MatterForm.css';

interface Company {
  id: string;
  name: string;
}

const MatterForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [formData, setFormData] = useState<CreateMatterDTO>({
    company_id: '',
    title: '',
    matter_type: '',
    department_id: '',
    lead_director_id: '',
    budget_hours: undefined,
    budget_amount: undefined,
    value: undefined,
    description: '',
    opened_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadFormData();
    if (isEditing && id) {
      loadMatter();
    }
  }, [id]);

  const loadFormData = async () => {
    try {
      // Load clients (companies with matters)
      const mattersResponse = await matterService.getAll({ limit: 1000 });
      const matters = mattersResponse.data;
      const uniqueClients = Array.from(
        new Map(
          matters
            .filter((m: any) => m.client_name)
            .map((m: any) => [m.company_id, { id: m.company_id, name: m.client_name }])
        ).values()
      );
      setClients(uniqueClients);

      // Load departments
      const deptResponse = await departmentService.getActive();
      setDepartments(deptResponse.data);

      // TODO: Load users from user service
      setUsers([]);
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  };

  const loadMatter = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await matterService.getById(id);
      const matter = response.data;

      setFormData({
        company_id: matter.company_id,
        title: matter.title,
        matter_type: matter.matter_type || '',
        department_id: matter.department_id || '',
        lead_director_id: matter.lead_director_id || '',
        budget_hours: matter.budget_hours,
        budget_amount: matter.budget_amount,
        value: matter.value,
        description: matter.description || '',
        opened_date: matter.opened_date ? matter.opened_date.split('T')[0] : ''
      });
    } catch (error) {
      console.error('Failed to load matter:', error);
      alert('Failed to load matter');
      navigate('/matters');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditing && id) {
        await matterService.update(id, formData);
        alert('Matter updated successfully');
        navigate(`/matters/${id}`);
      } else {
        const response = await matterService.create(formData);
        alert('Matter created successfully');
        navigate(`/matters/${response.data.id}`);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} matter`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/matters/${id}`);
    } else {
      navigate('/matters');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="matter-form-loading">
          <div className="spinner"></div>
          <p>Loading matter...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="matter-form">
        {/* Header */}
        <div className="matter-form-header">
          <button className="btn-back" onClick={handleCancel}>
            ← Back
          </button>
          <h1>{isEditing ? 'Edit Matter' : 'Create New Matter'}</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-card">
            <h2>Matter Details</h2>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Matter Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Employment Contract Review"
                />
              </div>

              <div className="form-group">
                <label>Client *</label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  required
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Matter Type</label>
                <select
                  value={formData.matter_type}
                  onChange={(e) => setFormData({ ...formData, matter_type: e.target.value })}
                >
                  <option value="">Select type...</option>
                  <option value="litigation">Litigation</option>
                  <option value="corporate">Corporate</option>
                  <option value="employment">Employment</option>
                  <option value="property">Property</option>
                  <option value="commercial">Commercial</option>
                  <option value="family">Family</option>
                  <option value="criminal">Criminal</option>
                  <option value="estate">Estate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                >
                  <option value="">Select department...</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Lead Director</label>
                <select
                  value={formData.lead_director_id}
                  onChange={(e) => setFormData({ ...formData, lead_director_id: e.target.value })}
                >
                  <option value="">Select director...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <small>Note: User list will be populated when user service is connected</small>
              </div>

              <div className="form-group">
                <label>Opened Date</label>
                <input
                  type="date"
                  value={formData.opened_date}
                  onChange={(e) => setFormData({ ...formData, opened_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-card">
            <h2>Budget & Value</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>Budget Amount (R)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.budget_amount || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    budget_amount: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Budget Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.budget_hours || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    budget_hours: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Matter Value (R)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    value: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  placeholder="0.00"
                />
                <small>Estimated value of the matter</small>
              </div>
            </div>
          </div>

          <div className="form-card">
            <h2>Description</h2>

            <div className="form-group">
              <label>Matter Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                placeholder="Enter detailed description of the matter, including scope, objectives, and any special considerations..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update Matter' : 'Create Matter'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default MatterForm;
