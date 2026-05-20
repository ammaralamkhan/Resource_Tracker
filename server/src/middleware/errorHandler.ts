// ─── Centralized Error Handler ───────────────────────────────
// Catches all unhandled errors and returns a standardized
// JSON response. Must be registered LAST in the middleware chain.

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500                // Don't leak internal errors
    ? 'Internal server error'
    : err.message;

  // Log full error in development, sanitized in production
  logger.error(`[${statusCode}] ${err.message}`, {
    stack: err.stack,
    code: err.code,
  });

  res.status(statusCode).json({
    success: false,
    error: err.code || 'INTERNAL_ERROR',
    message,
    statusCode,
  });
}

/**
 * Helper to create typed application errors.
 */
export function createAppError(message: string, statusCode: number, code?: string): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
