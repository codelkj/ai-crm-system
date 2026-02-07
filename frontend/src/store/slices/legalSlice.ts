/**
 * Legal Redux Slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { legalService, LegalDocument } from '../../services/legal.service';

interface LegalState {
  documents: LegalDocument[];
  loading: boolean;
  error: string | null;
}

const initialState: LegalState = {
  documents: [],
  loading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'legal/fetchDocuments',
  async (params?: any) => {
    const response = await legalService.getDocuments(params);
    return response;
  }
);

const legalSlice = createSlice({
  name: 'legal',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Documents
    builder.addCase(fetchDocuments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDocuments.fulfilled, (state, action) => {
      state.loading = false;
      state.documents = action.payload;
    });
    builder.addCase(fetchDocuments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch documents';
    });
  },
});

export const { clearError } = legalSlice.actions;
export default legalSlice.reducer;
