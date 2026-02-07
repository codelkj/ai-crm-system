/**
 * Sales Routes
 */

import { Router } from 'express';
import { DealController } from '../controllers/deal.controller';
import { PipelineStageController } from '../controllers/stage.controller';
import {
  createDealValidator,
  updateDealValidator,
  moveToStageValidator,
  createStageValidator,
  updateStageValidator,
  reorderStagesValidator,
} from '../validators/sales.validators';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

// Apply authentication middleware to all sales routes
router.use(authenticate);

// Kanban Board Routes
router.get('/kanban', DealController.getKanbanView);

// Deal Routes
router.get('/deals', DealController.getAll);
router.get('/deals/:id', DealController.getById);
router.post('/deals', createDealValidator, DealController.create);
router.put('/deals/:id', updateDealValidator, DealController.update);
router.delete('/deals/:id', DealController.delete);

// Special route for moving deals between stages (Kanban drag-and-drop)
router.put('/deals/:id/stage', moveToStageValidator, DealController.moveToStage);

// Pipeline Stage Routes
router.get('/stages', PipelineStageController.getAll);
router.get('/stages/:id', PipelineStageController.getById);
router.post('/stages', createStageValidator, PipelineStageController.create);
router.put('/stages/:id', updateStageValidator, PipelineStageController.update);
router.delete('/stages/:id', PipelineStageController.delete);

// Special route for reordering stages
router.put('/stages/reorder', reorderStagesValidator, PipelineStageController.reorder);

export default router;
