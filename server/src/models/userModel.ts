// ─── User Model ──────────────────────────────────────────────
// Database queries for the users table.

import pool from '../config/db';

export interface UserRow {
  user_id: string;
  name: string;
  email: string;
  password_hash: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
  profile_picture?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  user_id: string;
  name: string;
  email: string;
  role: string;
  role_id: number;
  is_active: boolean;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Find a user by email (includes password_hash for auth).
 */
export async function findByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT u.*, r.role_name
     FROM users u
     JOIN roles r ON u.role_id = r.role_id
     WHERE u.email = $1`,
    [email]
  );
  return rows[0] || null;
}

/**
 * Find a user by ID (includes password_hash for auth).
 */
export async function findById(userId: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT u.*, r.role_name
     FROM users u
     JOIN roles r ON u.role_id = r.role_id
     WHERE u.user_id = $1`,
    [userId]
  );
  return rows[0] || null;
}

/**
 * Create a new user. Returns the created user row.
 */
export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
  roleName: string
): Promise<UserRow> {
  const { rows } = await pool.query<UserRow>(
    `INSERT INTO users (name, email, password_hash, role_id)
     VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = $4))
     RETURNING *`,
    [name, email, passwordHash, roleName]
  );

  // Fetch with role_name joined
  const user = await findById(rows[0].user_id);
  return user!;
}

/**
 * Get all users (without password_hash) with role info.
 */
export async function findAll(): Promise<UserPublic[]> {
  const { rows } = await pool.query<UserPublic>(
    `SELECT u.user_id, u.name, u.email, r.role_name as role, u.role_id,
            u.is_active, u.profile_picture, u.created_at, u.updated_at
     FROM users u
     JOIN roles r ON u.role_id = r.role_id
     ORDER BY u.created_at DESC`
  );
  return rows;
}

/**
 * Update user fields by ID.
 */
export async function updateUser(
  userId: string,
  fields: { name?: string; email?: string; is_active?: boolean; role_name?: string; profile_picture?: string }
): Promise<UserPublic | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (fields.name !== undefined) {
    setClauses.push(`name = $${paramIdx++}`);
    values.push(fields.name);
  }
  if (fields.email !== undefined) {
    setClauses.push(`email = $${paramIdx++}`);
    values.push(fields.email);
  }
  if (fields.is_active !== undefined) {
    setClauses.push(`is_active = $${paramIdx++}`);
    values.push(fields.is_active);
  }
  if (fields.role_name !== undefined) {
    setClauses.push(`role_id = (SELECT role_id FROM roles WHERE role_name = $${paramIdx++})`);
    values.push(fields.role_name);
  }
  if (fields.profile_picture !== undefined) {
    setClauses.push(`profile_picture = $${paramIdx++}`);
    values.push(fields.profile_picture);
  }

  if (setClauses.length === 0) return null;

  values.push(userId);
  const query = `UPDATE users SET ${setClauses.join(', ')} WHERE user_id = $${paramIdx} RETURNING user_id`;
  const { rows } = await pool.query(query, values);

  if (rows.length === 0) return null;

  // Return full user with role
  const { rows: updated } = await pool.query<UserPublic>(
    `SELECT u.user_id, u.name, u.email, r.role_name as role, u.role_id,
            u.is_active, u.profile_picture, u.created_at, u.updated_at
     FROM users u
     JOIN roles r ON u.role_id = r.role_id
     WHERE u.user_id = $1`,
    [userId]
  );
  return updated[0] || null;
}

/**
 * Soft-delete (deactivate) a user.
 */
export async function deactivateUser(userId: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    `UPDATE users SET is_active = false WHERE user_id = $1`,
    [userId]
  );
  return (rowCount ?? 0) > 0;
}

/**
 * Update a user's password.
 */
export async function updatePassword(userId: string, passwordHash: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    `UPDATE users SET password_hash = $1 WHERE user_id = $2`,
    [passwordHash, userId]
  );
  return (rowCount ?? 0) > 0;
}
