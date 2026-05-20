import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenanceController';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';

const router = Router();

router.use(authenticate);

// Faculty, staff, admins, chairman can view and report.
// Students cannot access this.
router.get('/', authorizeRole('chairman', 'admin', 'faculty', 'staff'), maintenanceController.getAllTickets);
router.post('/', authorizeRole('chairman', 'admin', 'faculty', 'staff'), maintenanceController.createTicket);

// Only admins, chairman, and staff can update the tickets
router.patch('/:id', authorizeRole('chairman', 'admin', 'staff'), maintenanceController.updateTicket);

export default router;
