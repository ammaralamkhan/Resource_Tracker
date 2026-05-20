// ─── User Routes ─────────────────────────────────────────────
import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole, authorizeMinRole } from '../middleware/authorizeRole';

const router = Router();

router.use(authenticate);

// Chairman and Admin can view all users
router.get('/', authorizeRole('chairman', 'admin'), userController.getAllUsers);

// Chairman and Admin can view specific users
router.get('/:id', authorizeRole('chairman', 'admin'), userController.getUserById);

// Update user details. The controller enforces that only Chairman can change roles.
// Users can update their own profiles (this might need a separate endpoint like /me, but handled here for admins)
router.patch('/:id', authorizeRole('chairman', 'admin'), userController.updateUser);

// Deactivate user
router.delete('/:id', authorizeRole('chairman', 'admin'), userController.deactivateUser);

// Admin reset password
router.post('/:id/reset-password', authorizeRole('chairman', 'admin'), userController.resetPassword);

export default router;
