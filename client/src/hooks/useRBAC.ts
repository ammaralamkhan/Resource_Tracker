// ================================================================
// RBAC Hook — conditional rendering based on user role
// ================================================================
import { useAuth } from '../contexts/AuthContext';

const ROLE_HIERARCHY: Record<string, number> = {
  chairman: 5,
  admin: 4,
  faculty: 3,
  staff: 2,
  student: 1,
};

export function useRBAC() {
  const { user } = useAuth();
  const currentRole = user?.role || '';
  const currentLevel = ROLE_HIERARCHY[currentRole] || 0;

  return {
    role: currentRole,

    /** Check if the user has one of the specified roles */
    hasRole: (...roles: string[]) => roles.includes(currentRole),

    /** Check if the user's role is at or above the minimum level */
    hasMinRole: (minRole: string) => currentLevel >= (ROLE_HIERARCHY[minRole] || 0),

    /** Chairman only */
    isChairman: currentRole === 'chairman',

    /** Chairman or Admin */
    isAdmin: currentLevel >= 4,

    /** Faculty or above */
    isFaculty: currentLevel >= 3,

    /** Staff or above */
    isStaff: currentLevel >= 2,
  };
}
