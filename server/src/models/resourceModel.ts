// ─── Resource Model ──────────────────────────────────────────
import pool from '../config/db';
import { IResource, IResourceCreate, IResourceUpdate } from '@shared/resource';

export async function createResource(data: IResourceCreate, addedBy: string): Promise<IResource> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query<IResource>(
      `INSERT INTO resources (name, type, location, status, room_id, added_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.name, data.type, data.location || '', data.status || 'available', (data.room_id as any) === '' ? null : data.room_id || null, addedBy]
    );
    const newResource = rows[0];

    // Insert into device configs if any config field is present
    if (data.ip_address || data.mac_address || data.cpu || data.ram || data.storage || data.os || data.specs) {
       await client.query(
         `INSERT INTO device_configs (resource_id, ip_address, mac_address, cpu, ram, storage, os, specs)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
         [newResource.resource_id, data.ip_address || null, data.mac_address || null, data.cpu || null, data.ram || null, data.storage || null, data.os || null, data.specs ? JSON.stringify(data.specs) : '{}']
       );
    }
    await client.query('COMMIT');
    
    // Fetch the joined result
    return (await getResourceById(newResource.resource_id)) as IResource;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function getAllResources(filters?: Partial<IResource>): Promise<any[]> {
  let query = `SELECT res.*, rm.name as room_name,
               dc.ip_address, dc.mac_address, dc.cpu, dc.ram, dc.storage, dc.os, dc.specs
     FROM resources res
     LEFT JOIN rooms rm ON res.room_id = rm.room_id
     LEFT JOIN device_configs dc ON res.resource_id = dc.resource_id
     WHERE 1=1`;
  const values: any[] = [];
  let paramIdx = 1;

  // Extremely basic dynamic filtering for now
  if (filters?.type) {
    query += ` AND res.type = $${paramIdx++}`;
    values.push(filters.type);
  }
  if (filters?.status) {
      query += ` AND res.status = $${paramIdx++}`;
      values.push(filters.status);
  }
  
  query += ' ORDER BY res.created_at DESC';

  const { rows } = await pool.query(query, values);
  return rows;
}

export async function getResourceById(id: string): Promise<IResource | null> {
  const { rows } = await pool.query<IResource>(`
    SELECT res.*, dc.ip_address, dc.mac_address, dc.cpu, dc.ram, dc.storage, dc.os, dc.specs
    FROM resources res
    LEFT JOIN device_configs dc ON res.resource_id = dc.resource_id
    WHERE res.resource_id = $1`, [id]);
  return rows[0] || null;
}

export async function updateResource(id: string, data: IResourceUpdate): Promise<IResource | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Update resources table
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (data.name !== undefined) { setClauses.push(`name = $${paramIdx++}`); values.push(data.name); }
    if (data.type !== undefined) { setClauses.push(`type = $${paramIdx++}`); values.push(data.type); }
    if (data.location !== undefined) { setClauses.push(`location = $${paramIdx++}`); values.push(data.location); }
    if (data.status !== undefined) { setClauses.push(`status = $${paramIdx++}`); values.push(data.status); }
    if (data.room_id !== undefined) { setClauses.push(`room_id = $${paramIdx++}`); values.push((data.room_id as any) === '' ? null : data.room_id); }

    if (setClauses.length > 0) {
      values.push(id);
      await client.query(
        `UPDATE resources SET ${setClauses.join(', ')} WHERE resource_id = $${paramIdx}`,
        values
      );
    }
    
    // 2. Update device_configs table
    const configKeys = ['ip_address', 'mac_address', 'cpu', 'ram', 'storage', 'os', 'specs'];
    const hasConfigUpdate = configKeys.some(k => (data as any)[k] !== undefined);
    
    if (hasConfigUpdate) {
       const { rows: configRows } = await client.query(`SELECT 1 FROM device_configs WHERE resource_id = $1`, [id]);
       if (configRows.length === 0) {
          // Insert new config
          await client.query(
            `INSERT INTO device_configs (resource_id, ip_address, mac_address, cpu, ram, storage, os, specs)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [id, data.ip_address || null, data.mac_address || null, data.cpu || null, data.ram || null, data.storage || null, data.os || null, data.specs ? JSON.stringify(data.specs) : '{}']
          );
       } else {
          // Update existing config
          const configSet: string[] = [];
          const configValues: any[] = [];
          let cIdx = 1;
          for (const k of configKeys) {
             if ((data as any)[k] !== undefined) {
                configSet.push(`${k} = $${cIdx++}`);
                let val = (data as any)[k];
                if (k === 'specs' && val !== undefined) {
                   configValues.push(val ? JSON.stringify(val) : '{}');
                } else {
                   configValues.push(val === "" ? null : val);
                }
             }
          }
          if (configSet.length > 0) {
             configValues.push(id);
             await client.query(
               `UPDATE device_configs SET ${configSet.join(', ')} WHERE resource_id = $${cIdx}`,
               configValues
             );
          }
       }
    }

    await client.query('COMMIT');
    return getResourceById(id);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function deleteResource(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM resources WHERE resource_id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
