// ─── Auth Routes ─────────────────────────────────────────────
import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes (rate-limited)
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/forgot-password', authLimiter, authController.forgotPassword);

// Protected routes
router.post(
  '/register',
  authenticate,
  authorizeRole('chairman', 'admin'),
  authController.register
);

router.get('/me', authenticate, authController.me);

router.patch('/profile', authenticate, authController.updateProfile);
router.patch('/password', authenticate, authController.changePassword);

// Admin: view pending reset requests
router.get('/reset-requests', authenticate, authorizeRole('chairman', 'admin'), authController.getResetRequests);
router.patch('/reset-requests/:id', authenticate, authorizeRole('chairman', 'admin'), authController.resolveResetRequest);

export default router;
