// ─── User Controller ─────────────────────────────────────────
import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import * as authService from '../services/authService';

// GET /api/users
export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id
export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.id as string;
    // Users can view their own profile, but only Chairman/Admin can view any profile (handled by routes)
    const user = await userService.getUserById(userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/:id
export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.id as string;
    const { name, email, is_active, role } = req.body;
    
    // Only Chairman can change roles. This will be guarded in the authorization layers if possible,
    // but we can also enforce it here.
    if (role && req.user?.role !== 'chairman') {
        res.status(403).json({
            success: false,
            error: 'FORBIDDEN',
            message: 'Only the Chairman can change user roles.',
            statusCode: 403,
        });
        return;
    }

    const updatedUser = await userService.updateUser(userId, { name, email, is_active, role_name: role });
    res.json({ success: true, data: updatedUser });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/:id
export async function deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.id as string;
    
    const userToDeactivate = await userService.getUserById(userId);
    if (userToDeactivate && userToDeactivate.role_name === 'chairman') {
        res.status(403).json({ success: false, message: 'The chairman account cannot be deleted.' });
        return;
    }

    await userService.deactivateUser(userId);
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/:id/reset-password
export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetUserId = req.params.id as string;
    
    // Only Chairman or Admin can do this (protected by routes)
    const tempPassword = await authService.resetUserPassword(targetUserId);
    
    res.json({ 
      success: true, 
      message: "User's password has been reset.", 
      tempPassword 
    });
  } catch (err) {
    next(err);
  }
}
