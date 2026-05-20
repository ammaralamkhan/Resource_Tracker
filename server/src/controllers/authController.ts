// ─── Auth Controller ─────────────────────────────────────────
// Handles HTTP request/response for authentication endpoints.

import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Email and password are required.',
        statusCode: 400,
      });
      return;
    }

    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/register
 * Body: { name, email, password, role }
 * Requires: Chairman or Admin
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Name, email, password, and role are required.',
        statusCode: 400,
      });
      return;
    }

    const validRoles = ['admin', 'faculty', 'staff', 'student'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        statusCode: 400,
      });
      return;
    }

    const callerRole = req.user!.role;
    const result = await authService.register(name, email, password, role, callerRole);

    res.status(201).json({ success: true, data: result, message: 'User registered successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Refresh token is required.',
        statusCode: 400,
      });
      return;
    }

    const result = await authService.refreshAccessToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the current authenticated user's info.
 */
export async function me(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    data: req.user,
  });
}

/**
 * PATCH /api/auth/profile
 * Body: { name, profile_picture }
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, profile_picture } = req.body;
    const userId = req.user!.user_id;

    const user = await authService.updateProfile(userId, { name, profile_picture });
    res.json({ success: true, data: user, message: 'Profile updated successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/auth/password
 * Body: { oldPassword, newPassword }
 */
export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.user_id;

    await authService.changePassword(userId, oldPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Public — no authentication required.
 */
export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Email is required.',
        statusCode: 400,
      });
      return;
    }

    await authService.createForgotPasswordRequest(email);
    // Always return success to avoid revealing if email exists
    res.json({ success: true, message: 'If your email is registered, your request has been sent to the administrator.' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/reset-requests
 * Admin only — lists pending password reset requests.
 */
export async function getResetRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requests = await authService.getPendingResetRequests();
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/auth/reset-requests/:id
 * Admin only — resolves a password reset request.
 */
export async function resolveResetRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requestId = req.params.id as string;
    await authService.resolveResetRequest(requestId);
    res.json({ success: true, message: 'Reset request resolved.' });
  } catch (err) {
    next(err);
  }
}
