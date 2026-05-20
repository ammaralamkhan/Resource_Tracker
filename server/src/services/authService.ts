// ─── Auth Service ────────────────────────────────────────────
// Business logic for authentication — credential verification,
// token generation, and user registration.

import * as userModel from '../models/userModel';
import { hashPassword, comparePassword } from '../utils/hashPassword';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/generateToken';
import { createAppError } from '../middleware/errorHandler';
import pool from '../config/db';

export interface AuthResult {
  token: string;
  refreshToken: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    role: string;
    profile_picture?: string;
  };
}

/**
 * Authenticate a user with email and password.
 * Returns JWT tokens and user info on success.
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await userModel.findByEmail(email);

  if (!user) {
    throw createAppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.is_active) {
    throw createAppError('Account has been deactivated. Contact an administrator.', 403, 'ACCOUNT_DEACTIVATED');
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw createAppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const tokenPayload: TokenPayload = {
    user_id: user.user_id,
    email: user.email,
    role: user.role_name,
    role_id: user.role_id,
  };

  const token = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    token,
    refreshToken,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role_name,
      profile_picture: user.profile_picture,
    },
  };
}

/**
 * Register a new user. Only Chairman and Admin should call this.
 * The caller's role determines which roles they can create:
 * - Chairman: can create any role including admin
 * - Admin: can create faculty, staff, student
 */
export async function register(
  name: string,
  email: string,
  password: string,
  role: string,
  callerRole: string
): Promise<AuthResult> {
  // Validate role creation permissions
  if (role === 'chairman') {
    throw createAppError('Cannot create another Chairman account.', 403, 'FORBIDDEN');
  }
  if (role === 'admin' && callerRole !== 'chairman') {
    throw createAppError('Only the Chairman can create Admin accounts.', 403, 'FORBIDDEN');
  }

  // Check if email already exists
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw createAppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
  }

  // Validate password strength
  if (password.length < 8) {
    throw createAppError('Password must be at least 8 characters long.', 400, 'WEAK_PASSWORD');
  }

  const passwordHash = await hashPassword(password);
  const user = await userModel.createUser(name, email, passwordHash, role);

  const tokenPayload: TokenPayload = {
    user_id: user.user_id,
    email: user.email,
    role: user.role_name,
    role_id: user.role_id,
    profile_picture: user.profile_picture,
  };

  const token = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    token,
    refreshToken,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role_name,
      profile_picture: user.profile_picture,
    },
  };
}

/**
 * Refresh an access token using a valid refresh token.
 */
export async function refreshAccessToken(token: string): Promise<{ token: string }> {
  try {
    const decoded = verifyRefreshToken(token);

    // Verify user still exists and is active
    const user = await userModel.findById(decoded.user_id);
    if (!user || !user.is_active) {
      throw createAppError('User account is no longer valid.', 401, 'INVALID_USER');
    }

    const newToken = generateAccessToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role_name,
      role_id: user.role_id,
      profile_picture: user.profile_picture,
    });

    return { token: newToken };
  } catch (err) {
    if (err instanceof Error && 'statusCode' in err) throw err;
    throw createAppError('Invalid or expired refresh token.', 401, 'INVALID_REFRESH_TOKEN');
  }
}

/**
 * Update user profile details.
 */
export async function updateProfile(userId: string, fields: { name?: string; profile_picture?: string }): Promise<userModel.UserPublic> {
  const user = await userModel.updateUser(userId, fields);
  if (!user) {
    throw createAppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  return user;
}

/**
 * Change a user's password.
 */
export async function changePassword(userId: string, oldPassword?: string, newPassword?: string): Promise<boolean> {
  if (!oldPassword || !newPassword) {
     throw createAppError('Both old and new passwords are required.', 400, 'VALIDATION_ERROR');
  }

  const user = await userModel.findById(userId);
  if (!user) {
    throw createAppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  const isPasswordValid = await comparePassword(oldPassword, user.password_hash);
  if (!isPasswordValid) {
    throw createAppError('Incorrect current password.', 401, 'INVALID_CREDENTIALS');
  }

  if (newPassword.length < 8) {
    throw createAppError('Password must be at least 8 characters long.', 400, 'WEAK_PASSWORD');
  }

  const passwordHash = await hashPassword(newPassword);
  return await userModel.updatePassword(userId, passwordHash);
}

/**
 * Admin: Reset a user's password to a randomly generated temporary password.
 * Returns the temporary password so the admin can share it securely with the user.
 */
export async function resetUserPassword(targetUserId: string): Promise<string> {
  const user = await userModel.findById(targetUserId);
  if (!user) {
    throw createAppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  // Generate a random 10-character temporary password
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';
  let tempPassword = '';
  for (let i = 0; i < 10; i++) {
    tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const passwordHash = await hashPassword(tempPassword);
  await userModel.updatePassword(targetUserId, passwordHash);
  return tempPassword;
}

/**
 * Public: Create a forgot password request (user doesn't need to be logged in).
 */
export async function createForgotPasswordRequest(email: string): Promise<void> {
  // Find the user by email to attach their name
  const user = await userModel.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not for security
    return;
  }

  // Check if there's already a pending request for this email
  const { rows: existing } = await pool.query(
    `SELECT request_id FROM password_reset_requests WHERE email = $1 AND status = 'pending'`,
    [email]
  );
  if (existing.length > 0) {
    return; // Already has a pending request
  }

  await pool.query(
    `INSERT INTO password_reset_requests (email, user_name, status) VALUES ($1, $2, 'pending')`,
    [email, user.name]
  );
}

/**
 * Admin: Get all pending password reset requests.
 */
export async function getPendingResetRequests(): Promise<any[]> {
  const { rows } = await pool.query(
    `SELECT request_id, email, user_name, status, created_at 
     FROM password_reset_requests 
     WHERE status = 'pending' 
     ORDER BY created_at DESC`
  );
  return rows;
}

/**
 * Admin: Resolve (mark as done) a password reset request.
 */
export async function resolveResetRequest(requestId: string): Promise<void> {
  await pool.query(
    `UPDATE password_reset_requests SET status = 'resolved', resolved_at = NOW() WHERE request_id = $1`,
    [requestId]
  );
}
