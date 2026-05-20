// ─── Resource Types ───────────────────────────────────────────

export type ResourceStatus = 'available' | 'in_use' | 'under_maintenance' | 'not_working' | 'decommissioned';

export type ResourceType = 'computer' | 'ups' | 'cctv' | 'switch' | 'router' | 'projector' | 'printer' | 'lab_equipment' | 'furniture' | 'software' | 'other';

export interface IResource {
  resource_id: string;
  name: string;
  type: ResourceType;
  location: string;
  status: ResourceStatus;
  room_id: number | null;
  room_name?: string;
  added_by: string;
  created_at: string;
  updated_at: string;
  // Device Configuration fields
  ip_address?: string;
  mac_address?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  os?: string;
  specs?: Record<string, any>;
}

export interface IResourceCreate {
  name: string;
  type: ResourceType;
  location: string;
  status?: ResourceStatus;
  room_id?: number;
  // Device Configuration fields
  ip_address?: string;
  mac_address?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  os?: string;
  specs?: Record<string, any>;
}

export interface IResourceUpdate {
  name?: string;
  type?: ResourceType;
  location?: string;
  status?: ResourceStatus;
  room_id?: number | null;
  // Device Configuration fields
  ip_address?: string;
  mac_address?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  os?: string;
  specs?: Record<string, any>;
}
