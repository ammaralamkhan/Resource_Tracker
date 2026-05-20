// ─── User Service ────────────────────────────────────────────
import * as userModel from '../models/userModel';
import { createAppError } from '../middleware/errorHandler';

export async function getAllUsers() {
  return await userModel.findAll();
}

export async function getUserById(userId: string) {
  const user = await userModel.findById(userId);
  if (!user) {
    throw createAppError('User not found', 404, 'NOT_FOUND');
  }
  const { password_hash, ...publicUser } = user;
  return publicUser;
}

export async function updateUser(
  userId: string,
  fields: { name?: string; email?: string; is_active?: boolean; role_name?: string }
) {
  const updatedUser = await userModel.updateUser(userId, fields);
  if (!updatedUser) {
    throw createAppError('User not found or nothing to update', 404, 'NOT_FOUND');
  }
  return updatedUser;
}

export async function deactivateUser(userId: string) {
  const success = await userModel.deactivateUser(userId);
  if (!success) {
    throw createAppError('User not found', 404, 'NOT_FOUND');
  }
  return { success: true };
}
