// ─── Password Hashing Utility ────────────────────────────────
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Cost factor ≥ 12 per security requirements

/**
 * Hash a plaintext password using bcrypt.
 * @param password - The plaintext password to hash
 * @returns The bcrypt hash string
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 * @param password - The plaintext password to check
 * @param hash - The stored bcrypt hash
 * @returns true if the password matches the hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
