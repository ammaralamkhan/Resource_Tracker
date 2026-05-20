// ─── Device Configuration Types ──────────────────────────────

export interface IDeviceConfig {
  config_id: number;
  resource_id: string;
  cpu: string | null;
  ram: string | null;
  storage: string | null;
  os: string | null;
  ip_address: string | null;
  mac_address: string | null;
}

export interface IDeviceConfigUpsert {
  cpu?: string;
  ram?: string;
  storage?: string;
  os?: string;
  ip_address?: string;
  mac_address?: string;
}
