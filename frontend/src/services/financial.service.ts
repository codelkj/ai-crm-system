/**
 * Financial API Service
 */

import api from './api';

export interface BankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  account_type: string;
  currency: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  parent_id?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  category_id?: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  balance_after?: number;
  notes?: string;
  ai_confidence?: number;
  category_name?: string;
  created_at: string;
  account?: BankAccount;
  category?: Category;
}

export interface CashFlowProjection {
  id: string;
  start_date: string;
  end_date: string;
  projection_data: any;
  metadata?: any;
  created_at: string;
}

export const financialService = {
  // Bank Accounts
  getAccounts: async () => {
    const response = await api.get('/financial/bank-accounts');
    return response.data.data;
  },

  getAccount: async (id: string) => {
    const response = await api.get(`/financial/accounts/${id}`);
    return response.data.data;
  },

  createAccount: async (data: Partial<BankAccount>) => {
    const response = await api.post('/financial/bank-accounts', data);
    return response.data.data;
  },

  updateAccount: async (id: string, data: Partial<BankAccount>) => {
    const response = await api.put(`/financial/accounts/${id}`, data);
    return response.data.data;
  },

  deleteAccount: async (id: string) => {
    const response = await api.delete(`/financial/accounts/${id}`);
    return response.data.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/financial/categories');
    return response.data.data;
  },

  getCategory: async (id: string) => {
    const response = await api.get(`/financial/categories/${id}`);
    return response.data.data;
  },

  createCategory: async (data: Partial<Category>) => {
    const response = await api.post('/financial/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: string, data: Partial<Category>) => {
    const response = await api.put(`/financial/categories/${id}`, data);
    return response.data.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/financial/categories/${id}`);
    return response.data.data;
  },

  // Transactions
  getTransactions: async (params?: any) => {
    const response = await api.get('/financial/transactions', { params });
    return response.data.data;
  },

  getTransaction: async (id: string) => {
    const response = await api.get(`/financial/transactions/${id}`);
    return response.data.data;
  },

  createTransaction: async (data: Partial<Transaction>) => {
    const response = await api.post('/financial/transactions', data);
    return response.data.data;
  },

  updateTransaction: async (id: string, data: Partial<Transaction>) => {
    const response = await api.put(`/financial/transactions/${id}`, data);
    return response.data.data;
  },

  deleteTransaction: async (id: string) => {
    const response = await api.delete(`/financial/transactions/${id}`);
    return response.data.data;
  },

  categorizeTransaction: async (id: string) => {
    const response = await api.post(`/financial/transactions/${id}/categorize`);
    return response.data.data;
  },

  importCSV: async (formData: FormData) => {
    const response = await api.post('/financial/transactions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  getSampleCSV: async () => {
    const response = await api.get('/financial/transactions/sample-csv');
    return response.data.data;
  },

  // Projections
  generateProjection: async (params: {
    months: number;
    start_date?: string;
    account_id?: string;
  }) => {
    const response = await api.post('/financial/projections/generate', params);
    return response.data.data;
  },

  getProjections: async () => {
    const response = await api.get('/financial/projections');
    return response.data.data;
  },
};
