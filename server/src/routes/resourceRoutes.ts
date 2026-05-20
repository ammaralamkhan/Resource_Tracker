import { Router } from 'express';
import * as resourceController from '../controllers/resourceController';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';

const router = Router();

router.use(authenticate);

// Resources CRUD
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.post('/', authorizeRole('chairman', 'admin'), resourceController.createResource);
router.patch('/:id', authorizeRole('chairman', 'admin'), resourceController.updateResource);
router.delete('/:id', authorizeRole('chairman', 'admin'), resourceController.deleteResource);

// Resource Config CRUD nested under resource
router.get('/:id/config', resourceController.getConfig);
router.put('/:id/config', authorizeRole('chairman', 'admin'), resourceController.upsertConfig);

export default router;
