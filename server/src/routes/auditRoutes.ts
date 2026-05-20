// ─── Audit Routes ────────────────────────────────────────────
import { Router } from 'express';
import * as auditController from '../controllers/auditController';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';

const router = Router();

router.use(authenticate);

// Only Chairman and Admin can view audit logs
router.get('/', authorizeRole('chairman', 'admin'), auditController.getAuditLogs);

export default router;
