// ─── Allocation Routes ───────────────────────────────────────
import { Router } from 'express';
import * as allocationController from '../controllers/allocationController';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';

const router = Router();

router.use(authenticate);

// All authenticated users can request allocations
router.post('/', allocationController.requestAllocation);

// All users can view. The controller handles filtering out lists based on role.
router.get('/', allocationController.getAllocations);

// Only Chairman and Admin can approve/reject/release allocations
router.patch('/:id', authorizeRole('chairman', 'admin'), allocationController.updateAllocation);

export default router;
