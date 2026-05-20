import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Protect all dashboard routes
router.use(authenticate);

router.get('/', dashboardController.getDashboardData);

export default router;
