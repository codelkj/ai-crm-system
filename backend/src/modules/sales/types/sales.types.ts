/**
 * Sales Types
 */

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  created_at: Date;
  updated_at: Date;
}

export interface Deal {
  id: string;
  title: string;
  company_id: string;
  contact_id: string;
  stage_id: string;
  value: number;
  currency: string;
  probability: number;
  expected_close_date?: Date;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDealDTO {
  title: string;
  company_id: string;
  contact_id: string;
  stage_id: string;
  value: number;
  currency?: string;
  probability?: number;
  expected_close_date?: string;
  description?: string;
}

export interface UpdateDealDTO {
  title?: string;
  company_id?: string;
  contact_id?: string;
  stage_id?: string;
  value?: number;
  currency?: string;
  probability?: number;
  expected_close_date?: string;
  description?: string;
}

export interface CreatePipelineStageDTO {
  name: string;
  color: string;
  order?: number;
}

export interface UpdatePipelineStageDTO {
  name?: string;
  color?: string;
  order?: number;
}

export interface KanbanColumn {
  stage: PipelineStage;
  deals: Deal[];
  totalValue: number;
}

export interface KanbanBoardResponse {
  columns: KanbanColumn[];
  totalDeals: number;
  totalValue: number;
}
