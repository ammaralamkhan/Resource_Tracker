// ─── Config Model ────────────────────────────────────────────
import pool from '../config/db';
import { IDeviceConfig, IDeviceConfigUpsert } from '@shared/config';

export async function getConfigByResourceId(resourceId: string): Promise<IDeviceConfig | null> {
  const { rows } = await pool.query<IDeviceConfig>(
    'SELECT * FROM device_configs WHERE resource_id = $1',
    [resourceId]
  );
  return rows[0] || null;
}

export async function upsertConfig(resourceId: string, data: IDeviceConfigUpsert): Promise<IDeviceConfig> {
  const { rows } = await pool.query<IDeviceConfig>(
    `INSERT INTO device_configs (resource_id, cpu, ram, storage, os, ip_address, mac_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (resource_id) DO UPDATE SET
       cpu = EXCLUDED.cpu,
       ram = EXCLUDED.ram,
       storage = EXCLUDED.storage,
       os = EXCLUDED.os,
       ip_address = EXCLUDED.ip_address,
       mac_address = EXCLUDED.mac_address
     RETURNING *`,
    [resourceId, data.cpu || null, data.ram || null, data.storage || null, data.os || null, data.ip_address || null, data.mac_address || null]
  );
  return rows[0];
}
