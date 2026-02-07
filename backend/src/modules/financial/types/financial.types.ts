/**
 * Financial Module Types
 */

export type TransactionType = 'income' | 'expense';
export type CategoryType = 'income' | 'expense';

export interface BankAccount {
  id: string;
  account_name: string;
  account_number?: string;
  bank_name: string;
  account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'other';
  currency: string;
  created_at: Date;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  parent_id?: string;
  created_at: Date;
}

export interface Transaction {
  id: string;
  account_id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category_id?: string;
  category_name?: string;
  ai_confidence?: number;
  notes?: string;
  created_at: Date;
}

export interface CategorizationResult {
  category_id: string;
  category_name: string;
  confidence: number;
  reasoning: string;
}

export interface TransactionProcessingResult {
  total_processed: number;
  successful: number;
  failed: number;
  duplicates: number;
  transactions: Transaction[];
  errors?: Array<{ row: number; error: string }>;
}

// DTOs
export interface CreateBankAccountDTO {
  account_name: string;
  account_number?: string;
  bank_name: string;
  account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'other';
  currency?: string;
}

export interface UpdateTransactionCategoryDTO {
  category_id: string;
  notes?: string;
}

export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  raw_data?: any;
}

export interface CreateTransactionDTO {
  account_id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category_id?: string;
  ai_confidence?: number;
  notes?: string;
}

export interface TransactionFilters {
  account_id?: string;
  type?: 'debit' | 'credit';
  category_id?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// CSV format types
export type CSVFormat = 'standard' | 'chase' | 'bank_of_america' | 'custom';

export interface CSVColumnMapping {
  date: string;
  description: string;
  amount: string;
  type?: string;
  balance?: string;
}

export interface CSVParseOptions {
  format?: CSVFormat;
  customMapping?: CSVColumnMapping;
  skipFirstRow?: boolean;
}
