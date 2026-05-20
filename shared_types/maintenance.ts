// ─── Maintenance Types ────────────────────────────────────────

export type MaintenanceStatus = 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

export interface IMaintenance {
  maintenance_id: string;
  resource_id: string;
  resource_name?: string;
  reported_by: string;
  assigned_to: string | null;
  assigned_to_name?: string;
  issue: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  resolved_at: string | null;
  created_at: string;
}

export interface IMaintenanceReport {
  resource_id: string;
  issue: string;
  priority: MaintenancePriority;
}

export interface IMaintenanceUpdate {
  status?: MaintenanceStatus;
  assigned_to?: string;
  priority?: MaintenancePriority;
}
