/**
 * Sales Redux Slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { salesService, Deal, PipelineStage, KanbanBoard } from '../../services/sales.service';

interface SalesState {
  deals: Deal[];
  stages: PipelineStage[];
  kanbanBoard: KanbanBoard | null;
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  deals: [],
  stages: [],
  kanbanBoard: null,
  loading: false,
  error: null,
};

export const fetchKanbanBoard = createAsyncThunk(
  'sales/fetchKanbanBoard',
  async () => {
    return await salesService.getKanbanBoard();
  }
);

export const fetchDeals = createAsyncThunk(
  'sales/fetchDeals',
  async (params?: any) => {
    return await salesService.getDeals(params);
  }
);

export const fetchStages = createAsyncThunk(
  'sales/fetchStages',
  async () => {
    return await salesService.getStages();
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Kanban Board
    builder.addCase(fetchKanbanBoard.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchKanbanBoard.fulfilled, (state, action) => {
      state.loading = false;
      state.kanbanBoard = action.payload;
      state.stages = action.payload.stages;
    });
    builder.addCase(fetchKanbanBoard.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch kanban board';
    });

    // Fetch Deals
    builder.addCase(fetchDeals.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDeals.fulfilled, (state, action) => {
      state.loading = false;
      state.deals = action.payload;
    });
    builder.addCase(fetchDeals.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch deals';
    });

    // Fetch Stages
    builder.addCase(fetchStages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStages.fulfilled, (state, action) => {
      state.loading = false;
      state.stages = action.payload;
    });
    builder.addCase(fetchStages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch stages';
    });
  },
});

export const { clearError } = salesSlice.actions;
export default salesSlice.reducer;
