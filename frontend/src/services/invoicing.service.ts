/**
 * Invoicing API Service
 * Handles all invoice and payment API calls
 */

import api from './api';

// =====================================================
// TYPES
// =====================================================

export interface Invoice {
  id: string;
  firm_id: string;
  invoice_number: string;
  client_id?: string;
  client_name?: string;
  matter_id?: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  notes?: string;
  terms?: string;
  created_by?: string;
  created_by_name?: string;
  sent_date?: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
  line_items?: LineItem[];
  line_items_count?: number;
}

export interface LineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  line_order: number;
  billable_type?: string;
  reference_id?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  invoice_number?: string;
  client_name?: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  reference?: string;
  notes?: string;
  recorded_by?: string;
  recorded_by_name?: string;
  created_at: string;
}

export interface CreateInvoiceDTO {
  client_id?: string;
  matter_id?: string;
  issue_date: string;
  due_date: string;
  notes?: string;
  terms?: string;
  vat_rate?: number;
}

export interface CreatePaymentDTO {
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  reference?: string;
  notes?: string;
}

// =====================================================
// INVOICE SERVICE
// =====================================================

export const invoiceService = {
  /**
   * Get all invoices with filters
   */
  getAll: async (filters?: {
    status?: string;
    client_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/invoicing/invoices', { params: filters });
    return response.data;
  },

  /**
   * Get invoice by ID
   */
  getById: async (id: string) => {
    const response = await api.get(`/invoicing/invoices/${id}`);
    return response.data;
  },

  /**
   * Create invoice
   */
  create: async (data: CreateInvoiceDTO) => {
    const response = await api.post('/invoicing/invoices', data);
    return response.data;
  },

  /**
   * Update invoice
   */
  update: async (id: string, data: Partial<CreateInvoiceDTO>) => {
    const response = await api.put(`/invoicing/invoices/${id}`, data);
    return response.data;
  },

  /**
   * Delete invoice (cancel)
   */
  delete: async (id: string) => {
    const response = await api.delete(`/invoicing/invoices/${id}`);
    return response.data;
  },

  /**
   * Send invoice to client
   */
  send: async (id: string) => {
    const response = await api.post(`/invoicing/invoices/${id}/send`);
    return response.data;
  },

  /**
   * Get invoice PDF
   */
  getPDF: async (id: string) => {
    const response = await api.get(`/invoicing/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get overdue invoices
   */
  getOverdue: async (clientId?: string) => {
    const response = await api.get('/invoicing/invoices/overdue', {
      params: { client_id: clientId }
    });
    return response.data;
  },

  /**
   * Get invoice statistics
   */
  getStats: async () => {
    const response = await api.get('/invoicing/invoices/stats');
    return response.data;
  },

  /**
   * Add line item to invoice
   */
  addLineItem: async (invoiceId: string, data: {
    description: string;
    quantity: number;
    unit_price: number;
  }) => {
    const response = await api.post(`/invoicing/invoices/${invoiceId}/line-items`, data);
    return response.data;
  },

  /**
   * Update line item
   */
  updateLineItem: async (invoiceId: string, lineItemId: string, data: {
    description?: string;
    quantity?: number;
    unit_price?: number;
  }) => {
    const response = await api.put(`/invoicing/invoices/${invoiceId}/line-items/${lineItemId}`, data);
    return response.data;
  },

  /**
   * Delete line item
   */
  deleteLineItem: async (invoiceId: string, lineItemId: string) => {
    const response = await api.delete(`/invoicing/invoices/${invoiceId}/line-items/${lineItemId}`);
    return response.data;
  }
};

// =====================================================
// PAYMENT SERVICE
// =====================================================

export const paymentService = {
  /**
   * Get payments for an invoice
   */
  getByInvoice: async (invoiceId: string) => {
    const response = await api.get(`/invoicing/invoices/${invoiceId}/payments`);
    return response.data;
  },

  /**
   * Get payment by ID
   */
  getById: async (id: string) => {
    const response = await api.get(`/invoicing/payments/${id}`);
    return response.data;
  },

  /**
   * Record payment
   */
  create: async (data: CreatePaymentDTO) => {
    const response = await api.post('/invoicing/payments', data);
    return response.data;
  },

  /**
   * Update payment
   */
  update: async (id: string, data: Partial<CreatePaymentDTO>) => {
    const response = await api.put(`/invoicing/payments/${id}`, data);
    return response.data;
  },

  /**
   * Delete payment (refund)
   */
  delete: async (id: string) => {
    const response = await api.delete(`/invoicing/payments/${id}`);
    return response.data;
  },

  /**
   * Get payment statistics
   */
  getStats: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/invoicing/payments/stats', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  /**
   * Get recent payments
   */
  getRecent: async (limit: number = 10) => {
    const response = await api.get('/invoicing/payments/recent', {
      params: { limit }
    });
    return response.data;
  }
};
