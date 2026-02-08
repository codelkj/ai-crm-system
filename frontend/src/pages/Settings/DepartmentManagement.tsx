/**
 * Department Management Page
 * CRUD interface for practice areas/departments
 */

import React, { useState, useEffect } from 'react';
import { departmentService, Department } from '../../services/legal-crm.service';
import './DepartmentManagement.css';

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDept) {
        await departmentService.update(editingDept.id, formData);
      } else {
        await departmentService.create(formData);
      }

      setShowForm(false);
      setFormData({ name: '', code: '', description: '' });
      setEditingDept(null);
      loadDepartments();
    } catch (error) {
      console.error('Failed to save department:', error);
      alert('Failed to save department');
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this department?')) {
      return;
    }

    try {
      await departmentService.delete(id);
      loadDepartments();
    } catch (error) {
      console.error('Failed to delete department:', error);
      alert('Failed to delete department');
    }
  };

  if (loading) {
    return <div className="loading">Loading departments...</div>;
  }

  return (
    <div className="department-management">
      <div className="page-header">
        <h1>Department Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingDept(null);
            setFormData({ name: '', code: '', description: '' });
          }}
        >
          + Add Department
        </button>
      </div>

      {showForm && (
        <div className="department-form-modal">
          <div className="modal-content">
            <h2>{editingDept ? 'Edit Department' : 'New Department'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Department Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Litigation"
                />
              </div>

              <div className="form-group">
                <label htmlFor="code">Code *</label>
                <input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  maxLength={20}
                  placeholder="e.g., LIT"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of this practice area"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDept ? 'Update' : 'Create'} Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="departments-list">
        {departments.length === 0 ? (
          <div className="empty-state">
            <p>No departments found. Create your first department to get started.</p>
          </div>
        ) : (
          <table className="departments-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td><span className="dept-code">{dept.code}</span></td>
                  <td><strong>{dept.name}</strong></td>
                  <td>{dept.description || '-'}</td>
                  <td>
                    <span className={`status-badge ${dept.active ? 'status-active' : 'status-inactive'}`}>
                      {dept.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(dept)}
                        title="Edit"
                      >
                        ✎
                      </button>
                      {dept.active && (
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDelete(dept.id)}
                          title="Deactivate"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DepartmentManagement;
