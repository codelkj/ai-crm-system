/**
 * Role Management Page
 * RBAC configuration interface (Partner/Admin only)
 */

import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { roleService, Role } from '../../services/legal-crm.service';
import './RoleManagement.css';

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [permissionMatrix, setPermissionMatrix] = useState<any>(null);

  useEffect(() => {
    loadRoles();
    loadPermissionMatrix();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getAll();
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissionMatrix = async () => {
    try {
      const response = await roleService.getPermissionMatrix();
      setPermissionMatrix(response.data);
    } catch (error) {
      console.error('Failed to load permission matrix:', error);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setShowModal(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowModal(true);
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Delete role "${role.name}"? Users with this role will need to be reassigned.`)) {
      return;
    }

    try {
      await roleService.delete(role.id);
      alert('Role deleted successfully');
      loadRoles();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete role');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingRole(null);
  };

  const getRoleLevelBadge = (level: number) => {
    if (level >= 100) return { text: 'Partner', class: 'badge-partner' };
    if (level >= 80) return { text: 'Director', class: 'badge-director' };
    if (level >= 60) return { text: 'Senior', class: 'badge-senior' };
    if (level >= 40) return { text: 'Associate', class: 'badge-associate' };
    return { text: 'Staff', class: 'badge-staff' };
  };

  if (loading) {
    return (
      <Layout>
        <div className="role-management-loading">
          <div className="spinner"></div>
          <p>Loading roles...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="role-management">
        {/* Header */}
        <div className="role-management-header">
          <div>
            <h1>Role Management</h1>
            <p className="role-management-subtitle">
              Configure roles and permissions for your law firm
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleCreate}>
            + Create Role
          </button>
        </div>

        {/* Roles Grid */}
        <div className="roles-grid">
          {roles.map((role) => {
            const levelBadge = getRoleLevelBadge(role.level);
            const permissionCount = role.permissions ? Object.keys(role.permissions).length : 0;

            return (
              <div key={role.id} className="role-card">
                <div className="role-card-header">
                  <div className="role-title">
                    <h3>{role.name}</h3>
                    <span className={`level-badge ${levelBadge.class}`}>
                      {levelBadge.text}
                    </span>
                  </div>
                  <div className="role-level">Level {role.level}</div>
                </div>

                {role.description && (
                  <p className="role-description">{role.description}</p>
                )}

                <div className="role-stats">
                  <div className="stat-item">
                    <span className="stat-label">Permissions:</span>
                    <span className="stat-value">{permissionCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Created:</span>
                    <span className="stat-value">
                      {new Date(role.created_at).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                </div>

                <div className="role-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEdit(role)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(role)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Role Modal */}
        {showModal && (
          <RoleModal
            role={editingRole}
            permissionMatrix={permissionMatrix}
            onClose={handleModalClose}
            onSuccess={() => {
              handleModalClose();
              loadRoles();
            }}
          />
        )}
      </div>
    </Layout>
  );
};

// Role Modal Component
interface RoleModalProps {
  role: Role | null;
  permissionMatrix: any;
  onClose: () => void;
  onSuccess: () => void;
}

const RoleModal: React.FC<RoleModalProps> = ({ role, permissionMatrix, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    level: role?.level || 50,
    permissions: role?.permissions || {}
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (role) {
        await roleService.update(role.id, formData);
      } else {
        await roleService.create(formData);
      }
      alert(`Role ${role ? 'updated' : 'created'} successfully`);
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionToggle = (resource: string, action: string) => {
    const newPermissions = { ...formData.permissions };

    if (!newPermissions[resource]) {
      newPermissions[resource] = {};
    }

    newPermissions[resource][action] = !newPermissions[resource][action];
    setFormData({ ...formData, permissions: newPermissions });
  };

  const resources = ['matter', 'company', 'contact', 'invoice', 'time_entry', 'user', 'role', 'department'];
  const actions = ['create', 'read', 'update', 'delete'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{role ? 'Edit Role' : 'Create Role'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Senior Associate"
                />
              </div>

              <div className="form-group">
                <label>Level (0-100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  required
                />
                <small>Higher levels have more authority</small>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Brief description of this role..."
              />
            </div>

            <div className="permissions-section">
              <h3>Permissions Matrix</h3>
              <div className="permission-matrix">
                <table className="permission-table">
                  <thead>
                    <tr>
                      <th>Resource</th>
                      {actions.map(action => (
                        <th key={action}>{action}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map(resource => (
                      <tr key={resource}>
                        <td className="resource-name">{resource}</td>
                        {actions.map(action => (
                          <td key={action} className="permission-cell">
                            <input
                              type="checkbox"
                              checked={formData.permissions[resource]?.[action] || false}
                              onChange={() => handlePermissionToggle(resource, action)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleManagement;
