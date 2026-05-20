// ─── JWT Token Generation Utility ────────────────────────────
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  user_id: string;
  email: string;
  role: string;
  role_id: number;
  profile_picture?: string;
}

/**
 * Generate a short-lived access token (default: 1h).
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

/**
 * Generate a long-lived refresh token (default: 7d).
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
}

/**
 * Verify and decode an access token.
 * @throws JsonWebTokenError if token is invalid or expired
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

/**
 * Verify and decode a refresh token.
 * @throws JsonWebTokenError if token is invalid or expired
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}
