// ================================================================
// RoleGate — conditionally renders children based on user role
// ================================================================
import type { ReactNode } from 'react';
import { useRBAC } from '../../hooks/useRBAC';

interface RoleGateProps {
  /** Only render if user has one of these roles */
  allowedRoles?: string[];
  /** Only render if user has at least this role level */
  minRole?: string;
  /** Fallback content when access denied */
  fallback?: ReactNode;
  children: ReactNode;
}

export default function RoleGate({ allowedRoles, minRole, fallback = null, children }: RoleGateProps) {
  const { hasRole, hasMinRole } = useRBAC();

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return <>{fallback}</>;
  }

  if (minRole && !hasMinRole(minRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
