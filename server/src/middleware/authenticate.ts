// ─── Authentication Middleware ───────────────────────────────
// Verifies JWT from the Authorization header and attaches
// the decoded user payload to req.user.
// The role is NEVER trusted from the client — it comes from
// the cryptographically verified token.

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/generateToken';

// Extend Express Request to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Access token is missing or malformed. Expected: Bearer <token>',
      statusCode: 401,
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Decode and verify — role is extracted from the signed token, NOT the client
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err: unknown) {
    const message = err instanceof Error && err.name === 'TokenExpiredError'
      ? 'Access token has expired. Please refresh your token.'
      : 'Invalid access token.';

    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message,
      statusCode: 401,
    });
  }
}
