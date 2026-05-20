// ─── Audit Logger Middleware ─────────────────────────────────
// Automatically logs all mutating HTTP requests (POST, PUT,
// PATCH, DELETE) to the audit_logs table. Attached after
// the authenticate middleware so req.user is available.

import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { logger } from '../utils/logger';

/**
 * Extracts the entity type and action from the request path and method.
 * E.g., PATCH /api/resources/123 → entity_type='resource', entity_id='123'
 */
function parseRouteInfo(method: string, path: string) {
  const segments = path.replace(/^\/api\//, '').split('/').filter(Boolean);
  // e.g., ['resources', 'abc-123', 'config']
  const entityType = segments[0]?.replace(/s$/, '') || 'unknown'; // resources → resource
  const entityId = segments[1] || null;

  const actionMap: Record<string, string> = {
    POST: `${entityType}_create`,
    PUT: `${entityType}_update`,
    PATCH: `${entityType}_update`,
    DELETE: `${entityType}_delete`,
  };

  return {
    action: actionMap[method] || `${entityType}_${method.toLowerCase()}`,
    entityType,
    entityId,
  };
}

export function auditLogger(req: Request, res: Response, next: NextFunction): void {
  // Only log mutating requests
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    next();
    return;
  }

  // Capture the original end to log after response is sent
  const originalEnd = res.end;
  const startTime = Date.now();

  // Override res.end to capture the response
  res.end = function (this: Response, ...args: any[]): any {
    // Only log if the request was successful (2xx) and user is authenticated
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      const { action, entityType, entityId } = parseRouteInfo(req.method, req.path);

      const logEntry = {
        user_id: req.user.user_id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: {
          method: req.method,
          path: req.path,
          duration_ms: Date.now() - startTime,
          status_code: res.statusCode,
        },
        ip_address: req.ip || req.socket.remoteAddress || null,
      };

      // Fire-and-forget: don't block the response
      pool.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          logEntry.user_id,
          logEntry.action,
          logEntry.entity_type,
          logEntry.entity_id,
          JSON.stringify(logEntry.details),
          logEntry.ip_address,
        ]
      ).catch((err) => {
        logger.error('Failed to write audit log:', err);
      });
    }

    return originalEnd.apply(this, args as any);
  };

  next();
}
