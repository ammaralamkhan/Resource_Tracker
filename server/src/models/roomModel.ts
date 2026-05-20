// ─── Room Model ──────────────────────────────────────────────
import pool from '../config/db';
import { IRoom, IRoomCreate } from '@shared/room';

export async function createRoom(data: IRoomCreate): Promise<IRoom> {
  const { rows } = await pool.query<IRoom>(
    `INSERT INTO rooms (name, building, floor, room_type, capacity)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.name, data.building, data.floor, data.room_type, data.capacity || null]
  );
  return rows[0];
}

export async function getAllRooms(): Promise<IRoom[]> {
  const { rows } = await pool.query<IRoom>('SELECT * FROM rooms ORDER BY building, name');
  return rows;
}
export async function getRoomsWithResources(): Promise<any[]> {
  const query = `
    SELECT 
      rm.*,
      COALESCE(
        json_agg(
          json_build_object(
            'resource_id', res.resource_id,
            'name', res.name,
            'type', res.type,
            'status', res.status,
            'ip_address', dc.ip_address,
            'mac_address', dc.mac_address,
            'cpu', dc.cpu,
            'ram', dc.ram,
            'storage', dc.storage,
            'os', dc.os
          )
        ) FILTER (WHERE res.resource_id IS NOT NULL), 
        '[]'
      ) as resources
    FROM rooms rm
    LEFT JOIN resources res ON rm.room_id = res.room_id
    LEFT JOIN device_configs dc ON res.resource_id = dc.resource_id
    GROUP BY rm.room_id
    ORDER BY rm.floor ASC, rm.name ASC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}
