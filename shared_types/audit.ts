// ─── Audit Log Types ──────────────────────────────────────────

export type AuditAction =
  | 'login' | 'logout' | 'register'
  | 'resource_create' | 'resource_update' | 'resource_delete'
  | 'allocation_request' | 'allocation_approve' | 'allocation_reject' | 'allocation_release'
  | 'maintenance_report' | 'maintenance_assign' | 'maintenance_update' | 'maintenance_resolve'
  | 'user_create' | 'user_update' | 'user_delete' | 'role_change';

export type EntityType = 'user' | 'resource' | 'allocation' | 'maintenance' | 'room';

export interface IAuditLog {
  log_id: number;
  user_id: string;
  action: AuditAction;
  entity_type: EntityType;
  entity_id: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  timestamp: string;
}
