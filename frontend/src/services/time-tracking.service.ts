/**
 * Time Tracking API Service
 * Handles all time entry and billing pack API calls
 */

import api from './api';

// =====================================================
// TYPES
// =====================================================

export interface TimeEntry {
  id: string;
  firm_id: string;
  matter_id?: string;
  user_id?: string;
  entry_date: string;
  duration_minutes: number;
  hourly_rate: number;
  amount: number;
  description: string;
  billable: boolean;
  billed: boolean;
  invoice_line_item_id?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  matter_name?: string;
  user_name?: string;
  approved_by_name?: string;
}

export interface CreateTimeEntryDTO {
  matter_id?: string;
  entry_date: string;
  duration_minutes: number;
  hourly_rate: number;
  description: string;
  billable?: boolean;
}

export interface UpdateTimeEntryDTO {
  matter_id?: string;
  entry_date?: string;
  duration_minutes?: number;
  hourly_rate?: number;
  description?: string;
  billable?: boolean;
}

export interface BillingPack {
  id: string;
  firm_id: string;
  client_id: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'generated' | 'sent' | 'approved';
  total_time_entries: number;
  total_hours: number;
  total_amount: number;
  generated_by?: string;
  generated_at?: string;
  sent_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  client_name?: string;
  generated_by_name?: string;
}

export interface CreateBillingPackDTO {
  client_id: string;
  period_start: string;
  period_end: string;
  notes?: string;
}

// =====================================================
// TIME ENTRY SERVICE
// =====================================================

export const timeEntryService = {
  /**
   * Get all time entries with filters
   */
  getAll: async (filters?: {
    matter_id?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    billable?: boolean;
    billed?: boolean;
    approved?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/time-tracking/entries', { params: filters });
    return response.data;
  },

  /**
   * Get time entry by ID
   */
  getById: async (id: string) => {
    const response = await api.get(`/time-tracking/entries/${id}`);
    return response.data;
  },

  /**
   * Create time entry
   */
  create: async (data: CreateTimeEntryDTO) => {
    const response = await api.post('/time-tracking/entries', data);
    return response.data;
  },

  /**
   * Update time entry
   */
  update: async (id: string, data: UpdateTimeEntryDTO) => {
    const response = await api.put(`/time-tracking/entries/${id}`, data);
    return response.data;
  },

  /**
   * Delete time entry
   */
  delete: async (id: string) => {
    const response = await api.delete(`/time-tracking/entries/${id}`);
    return response.data;
  },

  /**
   * Approve time entry
   */
  approve: async (id: string) => {
    const response = await api.post(`/time-tracking/entries/${id}/approve`);
    return response.data;
  },

  /**
   * Unapprove time entry
   */
  unapprove: async (id: string) => {
    const response = await api.post(`/time-tracking/entries/${id}/unapprove`);
    return response.data;
  },

  /**
   * Bulk approve time entries
   */
  bulkApprove: async (ids: string[]) => {
    const response = await api.post('/time-tracking/entries/bulk-approve', { ids });
    return response.data;
  },

  /**
   * Get unbilled hours by matter
   */
  getUnbilledByMatter: async (matterId?: string) => {
    const response = await api.get('/time-tracking/entries/unbilled/by-matter', {
      params: { matter_id: matterId }
    });
    return response.data;
  },

  /**
   * Get unbilled hours by user
   */
  getUnbilledByUser: async (userId?: string) => {
    const response = await api.get('/time-tracking/entries/unbilled/by-user', {
      params: { user_id: userId }
    });
    return response.data;
  },

  /**
   * Get time entries pending approval
   */
  getPendingApproval: async () => {
    const response = await api.get('/time-tracking/entries/pending-approval');
    return response.data;
  },

  /**
   * Get time entry statistics
   */
  getStats: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/time-tracking/entries/stats', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  }
};

// =====================================================
// BILLING PACK SERVICE
// =====================================================

export const billingPackService = {
  /**
   * Get all billing packs with filters
   */
  getAll: async (filters?: {
    client_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/time-tracking/billing-packs', { params: filters });
    return response.data;
  },

  /**
   * Get billing pack by ID
   */
  getById: async (id: string) => {
    const response = await api.get(`/time-tracking/billing-packs/${id}`);
    return response.data;
  },

  /**
   * Get time entries for a billing pack
   */
  getTimeEntries: async (id: string) => {
    const response = await api.get(`/time-tracking/billing-packs/${id}/entries`);
    return response.data;
  },

  /**
   * Create billing pack
   */
  create: async (data: CreateBillingPackDTO) => {
    const response = await api.post('/time-tracking/billing-packs', data);
    return response.data;
  },

  /**
   * Generate billing pack from approved unbilled time entries
   */
  generate: async (data: CreateBillingPackDTO) => {
    const response = await api.post('/time-tracking/billing-packs/generate', data);
    return response.data;
  },

  /**
   * Update billing pack
   */
  update: async (id: string, data: { notes?: string; status?: string }) => {
    const response = await api.put(`/time-tracking/billing-packs/${id}`, data);
    return response.data;
  },

  /**
   * Delete billing pack
   */
  delete: async (id: string) => {
    const response = await api.delete(`/time-tracking/billing-packs/${id}`);
    return response.data;
  },

  /**
   * Send billing pack to client
   */
  send: async (id: string) => {
    const response = await api.post(`/time-tracking/billing-packs/${id}/send`);
    return response.data;
  },

  /**
   * Approve billing pack and optionally create invoice
   */
  approve: async (id: string, createInvoice: boolean = false) => {
    const response = await api.post(`/time-tracking/billing-packs/${id}/approve`, {
      create_invoice: createInvoice
    });
    return response.data;
  },

  /**
   * Get billing pack statistics
   */
  getStats: async () => {
    const response = await api.get('/time-tracking/billing-packs/stats');
    return response.data;
  }
};
