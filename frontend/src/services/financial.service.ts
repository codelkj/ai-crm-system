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
  transaction_date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  balance_after?: number;
  reference_number?: string;
  metadata?: any;
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
    const response = await api.get('/financial/accounts');
    return response.data;
  },

  getAccount: async (id: string) => {
    const response = await api.get(`/financial/accounts/${id}`);
    return response.data;
  },

  createAccount: async (data: Partial<BankAccount>) => {
    const response = await api.post('/financial/accounts', data);
    return response.data;
  },

  updateAccount: async (id: string, data: Partial<BankAccount>) => {
    const response = await api.put(`/financial/accounts/${id}`, data);
    return response.data;
  },

  deleteAccount: async (id: string) => {
    const response = await api.delete(`/financial/accounts/${id}`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/financial/categories');
    return response.data;
  },

  getCategory: async (id: string) => {
    const response = await api.get(`/financial/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: Partial<Category>) => {
    const response = await api.post('/financial/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<Category>) => {
    const response = await api.put(`/financial/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/financial/categories/${id}`);
    return response.data;
  },

  // Transactions
  getTransactions: async (params?: any) => {
    const response = await api.get('/financial/transactions', { params });
    return response.data;
  },

  getTransaction: async (id: string) => {
    const response = await api.get(`/financial/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (data: Partial<Transaction>) => {
    const response = await api.post('/financial/transactions', data);
    return response.data;
  },

  updateTransaction: async (id: string, data: Partial<Transaction>) => {
    const response = await api.put(`/financial/transactions/${id}`, data);
    return response.data;
  },

  deleteTransaction: async (id: string) => {
    const response = await api.delete(`/financial/transactions/${id}`);
    return response.data;
  },

  categorizeTransaction: async (id: string) => {
    const response = await api.post(`/financial/transactions/${id}/categorize`);
    return response.data;
  },

  importCSV: async (formData: FormData) => {
    const response = await api.post('/financial/transactions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getSampleCSV: async () => {
    const response = await api.get('/financial/transactions/sample-csv');
    return response.data;
  },

  // Projections
  generateProjection: async (params: {
    months: number;
    start_date?: string;
    account_id?: string;
  }) => {
    const response = await api.post('/financial/projections/generate', params);
    return response.data;
  },

  getProjections: async () => {
    const response = await api.get('/financial/projections');
    return response.data;
  },
};
