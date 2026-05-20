// ─── Role-Based Authorization Middleware ─────────────────────
// Enforces the RBAC privilege matrix by checking the user's
// role (from the verified JWT) against the list of allowed roles.
//
// PRIVILEGE HIERARCHY:
//   Chairman > Admin > Faculty > Staff > Student
//
// Usage: authorizeRole('chairman', 'admin')
//   → Only Chairman and Admin can access the route.

import { Request, Response, NextFunction } from 'express';

const ROLE_HIERARCHY: Record<string, number> = {
  chairman: 5,
  admin: 4,
  faculty: 3,
  staff: 2,
  student: 1,
};

/**
 * Middleware factory: restricts route access to specified roles.
 * @param allowedRoles - One or more roles that are permitted
 */
export function authorizeRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required before authorization.',
        statusCode: 401,
      });
      return;
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${userRole}.`,
        statusCode: 403,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware factory: restricts route to users at or above a minimum role level.
 * Uses the ROLE_HIERARCHY for comparison.
 * @param minimumRole - The minimum role required (e.g., 'admin' allows chairman + admin)
 */
export function authorizeMinRole(minimumRole: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required before authorization.',
        statusCode: 401,
      });
      return;
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `Access denied. Minimum role required: ${minimumRole}. Your role: ${req.user.role}.`,
        statusCode: 403,
      });
      return;
    }

    next();
  };
}
