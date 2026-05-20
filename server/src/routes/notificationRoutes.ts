import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import * as notificationController from '../controllers/notificationController';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
