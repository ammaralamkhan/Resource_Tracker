import { Router } from 'express';
import * as roomController from '../controllers/roomController';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';

const router = Router();

router.use(authenticate);

router.get('/portal', roomController.getRoomsWithResources);
router.get('/', roomController.getAllRooms);
router.post('/', authorizeRole('chairman', 'admin'), roomController.createRoom);

export default router;
