/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import crmReducer from './slices/crmSlice';
import salesReducer from './slices/salesSlice';
import legalReducer from './slices/legalSlice';
import financialReducer from './slices/financialSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    crm: crmReducer,
    sales: salesReducer,
    legal: legalReducer,
    financial: financialReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
