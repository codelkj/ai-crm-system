/**
 * CRM API Service
 */

import api from './api';

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  created_at: string;
}

export interface Contact {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  is_primary: boolean;
  created_at: string;
}

export const crmService = {
  // Companies
  getCompanies: async (params?: any) => {
    const response = await api.get('/crm/companies', { params });
    return response.data.data;
  },

  getCompany: async (id: string) => {
    const response = await api.get(`/crm/companies/${id}`);
    return response.data.data;
  },

  createCompany: async (data: Partial<Company>) => {
    const response = await api.post('/crm/companies', data);
    return response.data.data;
  },

  updateCompany: async (id: string, data: Partial<Company>) => {
    const response = await api.put(`/crm/companies/${id}`, data);
    return response.data.data;
  },

  deleteCompany: async (id: string) => {
    const response = await api.delete(`/crm/companies/${id}`);
    return response.data.data;
  },

  // Contacts
  getContacts: async (params?: any) => {
    const response = await api.get('/crm/contacts', { params });
    return response.data.data;
  },

  getContact: async (id: string) => {
    const response = await api.get(`/crm/contacts/${id}`);
    return response.data.data;
  },

  createContact: async (data: Partial<Contact>) => {
    const response = await api.post('/crm/contacts', data);
    return response.data.data;
  },

  updateContact: async (id: string, data: Partial<Contact>) => {
    const response = await api.put(`/crm/contacts/${id}`, data);
    return response.data.data;
  },

  deleteContact: async (id: string) => {
    const response = await api.delete(`/crm/contacts/${id}`);
    return response.data.data;
  },
};
