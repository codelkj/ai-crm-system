/**
 * CRM Routes
 */

import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller';
import { ContactController } from '../controllers/contact.controller';
import { ActivityController } from '../controllers/activity.controller';
import {
  createCompanyValidator,
  updateCompanyValidator,
  createContactValidator,
  updateContactValidator,
  createActivityValidator,
  updateActivityValidator,
} from '../validators/crm.validators';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

// Apply authentication middleware to all CRM routes
router.use(authenticate);

// Company Routes
router.get('/companies', CompanyController.getAll);
router.get('/companies/:id', CompanyController.getById);
router.post('/companies', createCompanyValidator, CompanyController.create);
router.put('/companies/:id', updateCompanyValidator, CompanyController.update);
router.delete('/companies/:id', CompanyController.delete);

// Contact Routes
router.get('/contacts', ContactController.getAll);
router.get('/contacts/:id', ContactController.getById);
router.post('/contacts', createContactValidator, ContactController.create);
router.put('/contacts/:id', updateContactValidator, ContactController.update);
router.delete('/contacts/:id', ContactController.delete);

// Activity Routes
router.get('/activities', ActivityController.getAll);
router.get('/activities/:id', ActivityController.getById);
router.post('/activities', createActivityValidator, ActivityController.create);
router.put('/activities/:id', updateActivityValidator, ActivityController.update);
router.delete('/activities/:id', ActivityController.delete);
router.post('/activities/:id/complete', ActivityController.markCompleted);

export default router;
