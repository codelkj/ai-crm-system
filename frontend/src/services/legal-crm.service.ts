/**
 * Legal CRM API Service
 * Departments, Roles, and Audit Logs
 */

import api from './api';

// =====================================================
// FIRM SERVICE
// =====================================================

export const firmService = {
  getCurrent: async () => {
    const response = await api.get('/legal-crm/firms/current');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/legal-crm/firms/stats');
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/legal-crm/firms/${id}`, data);
    return response.data;
  }
};

// =====================================================
// DEPARTMENT SERVICE
// =====================================================

export interface Department {
  id: string;
  firm_id: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const departmentService = {
  getAll: async (): Promise<{ success: boolean; data: Department[] }> => {
    const response = await api.get('/legal-crm/departments');
    return response.data;
  },

  getActive: async (): Promise<{ success: boolean; data: Department[] }> => {
    const response = await api.get('/legal-crm/departments/active');
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Department }> => {
    const response = await api.get(`/legal-crm/departments/${id}`);
    return response.data;
  },

  create: async (data: Partial<Department>): Promise<{ success: boolean; data: Department }> => {
    const response = await api.post('/legal-crm/departments', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Department>): Promise<{ success: boolean; data: Department }> => {
    const response = await api.put(`/legal-crm/departments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/legal-crm/departments/${id}`);
    return response.data;
  },

  getStats: async (id: string) => {
    const response = await api.get(`/legal-crm/departments/${id}/stats`);
    return response.data;
  },

  getDirectors: async (id: string) => {
    const response = await api.get(`/legal-crm/departments/${id}/directors`);
    return response.data;
  },

  assignUser: async (id: string, userId: string, isDirector: boolean) => {
    const response = await api.post(`/legal-crm/departments/${id}/users`, {
      user_id: userId,
      is_director: isDirector
    });
    return response.data;
  },

  removeUser: async (id: string, userId: string) => {
    const response = await api.delete(`/legal-crm/departments/${id}/users/${userId}`);
    return response.data;
  }
};

// =====================================================
// ROLE SERVICE
// =====================================================

export interface Role {
  id: string;
  firm_id: string;
  name: string;
  description?: string;
  level: number;
  permissions: any;
  created_at: string;
  updated_at: string;
}

export const roleService = {
  getAll: async (): Promise<{ success: boolean; data: Role[] }> => {
    const response = await api.get('/legal-crm/roles');
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Role }> => {
    const response = await api.get(`/legal-crm/roles/${id}`);
    return response.data;
  },

  create: async (data: Partial<Role>): Promise<{ success: boolean; data: Role }> => {
    const response = await api.post('/legal-crm/roles', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Role>): Promise<{ success: boolean; data: Role }> => {
    const response = await api.put(`/legal-crm/roles/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/legal-crm/roles/${id}`);
    return response.data;
  },

  getPermissionMatrix: async () => {
    const response = await api.get('/legal-crm/roles/permissions/matrix');
    return response.data;
  },

  checkPermission: async (resource: string, action: string) => {
    const response = await api.get('/legal-crm/roles/permissions/check', {
      params: { resource, action }
    });
    return response.data;
  },

  getUsersWithRole: async (id: string) => {
    const response = await api.get(`/legal-crm/roles/${id}/users`);
    return response.data;
  }
};

// =====================================================
// AUDIT LOG SERVICE
// =====================================================

export interface AuditLog {
  id: string;
  firm_id: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
  reason?: string;
  created_at: string;
}

export const auditLogService = {
  getAll: async (filters?: any): Promise<{ success: boolean; data: AuditLog[]; pagination: any }> => {
    const response = await api.get('/legal-crm/audit-logs', { params: filters });
    return response.data;
  },

  getRecentActivity: async (limit: number = 100) => {
    const response = await api.get('/legal-crm/audit-logs/recent', {
      params: { limit }
    });
    return response.data;
  },

  getEntityHistory: async (entityType: string, entityId: string) => {
    const response = await api.get(`/legal-crm/audit-logs/entities/${entityType}/${entityId}`);
    return response.data;
  },

  getUserActivity: async (userId: string, days: number = 30) => {
    const response = await api.get(`/legal-crm/audit-logs/users/${userId}/activity`, {
      params: { days }
    });
    return response.data;
  },

  getEntityAccessStats: async (entityType: string, days: number = 30) => {
    const response = await api.get(`/legal-crm/audit-logs/entities/${entityType}/stats`, {
      params: { days }
    });
    return response.data;
  }
};
