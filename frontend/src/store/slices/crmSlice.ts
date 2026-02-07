/**
 * CRM Redux Slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { crmService, Company, Contact } from '../../services/crm.service';

interface CrmState {
  companies: Company[];
  contacts: Contact[];
  loading: boolean;
  error: string | null;
}

const initialState: CrmState = {
  companies: [],
  contacts: [],
  loading: false,
  error: null,
};

export const fetchCompanies = createAsyncThunk(
  'crm/fetchCompanies',
  async (params?: any) => {
    const response = await crmService.getCompanies(params);
    return response.data;
  }
);

export const fetchContacts = createAsyncThunk(
  'crm/fetchContacts',
  async (params?: any) => {
    const response = await crmService.getContacts(params);
    return response.data;
  }
);

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Companies
    builder.addCase(fetchCompanies.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCompanies.fulfilled, (state, action) => {
      state.loading = false;
      state.companies = action.payload;
    });
    builder.addCase(fetchCompanies.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch companies';
    });

    // Fetch Contacts
    builder.addCase(fetchContacts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchContacts.fulfilled, (state, action) => {
      state.loading = false;
      state.contacts = action.payload;
    });
    builder.addCase(fetchContacts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch contacts';
    });
  },
});

export const { clearError } = crmSlice.actions;
export default crmSlice.reducer;
