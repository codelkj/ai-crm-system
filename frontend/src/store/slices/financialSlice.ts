/**
 * Financial Redux Slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { financialService, Transaction, BankAccount, Category } from '../../services/financial.service';

interface FinancialState {
  transactions: Transaction[];
  accounts: BankAccount[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: FinancialState = {
  transactions: [],
  accounts: [],
  categories: [],
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'financial/fetchTransactions',
  async (params?: any) => {
    const response = await financialService.getTransactions(params);
    return response;
  }
);

export const fetchAccounts = createAsyncThunk(
  'financial/fetchAccounts',
  async () => {
    const response = await financialService.getAccounts();
    return response;
  }
);

export const fetchCategories = createAsyncThunk(
  'financial/fetchCategories',
  async () => {
    const response = await financialService.getCategories();
    return response;
  }
);

const financialSlice = createSlice({
  name: 'financial',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Transactions
    builder.addCase(fetchTransactions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTransactions.fulfilled, (state, action) => {
      state.loading = false;
      state.transactions = action.payload;
    });
    builder.addCase(fetchTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch transactions';
    });

    // Fetch Accounts
    builder.addCase(fetchAccounts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAccounts.fulfilled, (state, action) => {
      state.loading = false;
      state.accounts = action.payload;
    });
    builder.addCase(fetchAccounts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch accounts';
    });

    // Fetch Categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch categories';
    });
  },
});

export const { clearError } = financialSlice.actions;
export default financialSlice.reducer;
