/**
 * Sales API Service
 */

import api from './api';

export interface Deal {
  id: string;
  company_id: string;
  contact_id?: string;
  stage_id: string;
  title: string;
  description?: string;
  value: number;
  probability?: number;
  expected_close_date?: string;
  created_at: string;
  updated_at: string;
  company?: any;
  contact?: any;
  stage?: PipelineStage;
}

export interface PipelineStage {
  id: string;
  name: string;
  order_index: number;
  color?: string;
  created_at: string;
  deals?: Deal[];
}

export interface KanbanBoard {
  stages: PipelineStage[];
  totalValue: number;
  dealCount: number;
}

export const salesService = {
  // Kanban Board
  getKanbanBoard: async () => {
    const response = await api.get('/sales/kanban');
    return response.data.data;
  },

  // Deals
  getDeals: async (params?: any) => {
    const response = await api.get('/sales/deals', { params });
    return response.data.data;
  },

  getDeal: async (id: string) => {
    const response = await api.get(`/sales/deals/${id}`);
    return response.data.data;
  },

  createDeal: async (data: Partial<Deal>) => {
    const response = await api.post('/sales/deals', data);
    return response.data.data;
  },

  updateDeal: async (id: string, data: Partial<Deal>) => {
    const response = await api.put(`/sales/deals/${id}`, data);
    return response.data.data;
  },

  deleteDeal: async (id: string) => {
    const response = await api.delete(`/sales/deals/${id}`);
    return response.data.data;
  },

  moveToStage: async (id: string, stage_id: string) => {
    const response = await api.put(`/sales/deals/${id}/stage`, { stage_id });
    return response.data.data;
  },

  // Pipeline Stages
  getStages: async () => {
    const response = await api.get('/sales/stages');
    return response.data.data;
  },

  getStage: async (id: string) => {
    const response = await api.get(`/sales/stages/${id}`);
    return response.data.data;
  },

  createStage: async (data: Partial<PipelineStage>) => {
    const response = await api.post('/sales/stages', data);
    return response.data.data;
  },

  updateStage: async (id: string, data: Partial<PipelineStage>) => {
    const response = await api.put(`/sales/stages/${id}`, data);
    return response.data.data;
  },

  deleteStage: async (id: string) => {
    const response = await api.delete(`/sales/stages/${id}`);
    return response.data.data;
  },

  reorderStages: async (stages: { id: string; order_index: number }[]) => {
    const response = await api.put('/sales/stages/reorder', { stages });
    return response.data.data;
  },
};
