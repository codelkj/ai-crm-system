/**
 * Pipeline Stage Service
 */

import { v4 as uuidv4 } from 'uuid';
import { PipelineStage, CreatePipelineStageDTO, UpdatePipelineStageDTO } from '../types/sales.types';
import { AppError } from '../../../shared/middleware/error-handler';

// Mock pipeline stages database
const mockStages: PipelineStage[] = [
  {
    id: uuidv4(),
    name: 'Lead',
    color: '#6B7280',
    order: 1,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: uuidv4(),
    name: 'Qualified',
    color: '#3B82F6',
    order: 2,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: uuidv4(),
    name: 'Proposal',
    color: '#F59E0B',
    order: 3,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: uuidv4(),
    name: 'Negotiation',
    color: '#8B5CF6',
    order: 4,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: uuidv4(),
    name: 'Won',
    color: '#10B981',
    order: 5,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: uuidv4(),
    name: 'Lost',
    color: '#EF4444',
    order: 6,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
];

export class PipelineStageService {
  /**
   * Get all pipeline stages
   */
  static async getAll(): Promise<PipelineStage[]> {
    return [...mockStages].sort((a, b) => a.order - b.order);
  }

  /**
   * Get pipeline stage by ID
   */
  static async getById(id: string): Promise<PipelineStage> {
    const stage = mockStages.find((s) => s.id === id);
    if (!stage) {
      throw new AppError(404, 'Pipeline stage not found', 'STAGE_NOT_FOUND');
    }
    return stage;
  }

  /**
   * Create new pipeline stage
   */
  static async create(data: CreatePipelineStageDTO): Promise<PipelineStage> {
    // Check if stage name already exists
    const existingStage = mockStages.find(
      (s) => s.name.toLowerCase() === data.name.toLowerCase()
    );
    if (existingStage) {
      throw new AppError(400, 'Stage with this name already exists', 'STAGE_EXISTS');
    }

    // Determine order
    const order = data.order || mockStages.length + 1;

    const newStage: PipelineStage = {
      id: uuidv4(),
      name: data.name,
      color: data.color,
      order,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockStages.push(newStage);
    return newStage;
  }

  /**
   * Update pipeline stage
   */
  static async update(id: string, data: UpdatePipelineStageDTO): Promise<PipelineStage> {
    const index = mockStages.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new AppError(404, 'Pipeline stage not found', 'STAGE_NOT_FOUND');
    }

    // Check if new name already exists (excluding current stage)
    if (data.name) {
      const existingStage = mockStages.find(
        (s) => s.name.toLowerCase() === data.name!.toLowerCase() && s.id !== id
      );
      if (existingStage) {
        throw new AppError(400, 'Stage with this name already exists', 'STAGE_EXISTS');
      }
    }

    mockStages[index] = {
      ...mockStages[index],
      ...data,
      updated_at: new Date(),
    };

    return mockStages[index];
  }

  /**
   * Delete pipeline stage
   */
  static async delete(id: string): Promise<void> {
    const index = mockStages.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new AppError(404, 'Pipeline stage not found', 'STAGE_NOT_FOUND');
    }

    mockStages.splice(index, 1);
  }

  /**
   * Reorder pipeline stages
   */
  static async reorder(stageOrders: { id: string; order: number }[]): Promise<PipelineStage[]> {
    // Validate all stage IDs exist
    for (const { id } of stageOrders) {
      const stage = mockStages.find((s) => s.id === id);
      if (!stage) {
        throw new AppError(404, `Pipeline stage with ID ${id} not found`, 'STAGE_NOT_FOUND');
      }
    }

    // Update orders
    for (const { id, order } of stageOrders) {
      const stage = mockStages.find((s) => s.id === id);
      if (stage) {
        stage.order = order;
        stage.updated_at = new Date();
      }
    }

    return this.getAll();
  }
}
