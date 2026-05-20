// ─── Maintenance Model ───────────────────────────────────────
import pool from '../config/db';
import { IMaintenance, IMaintenanceReport, IMaintenanceUpdate } from '@shared/maintenance';

export async function createTicket(data: IMaintenanceReport, reportedBy: string): Promise<IMaintenance> {
  const { rows } = await pool.query<IMaintenance>(
    `INSERT INTO maintenance_logs (resource_id, issue, priority, reported_by, status)
     VALUES ($1, $2, $3, $4, 'reported') RETURNING *`,
    [data.resource_id, data.issue, data.priority, reportedBy]
  );
  return rows[0];
}

export async function getAllTickets(): Promise<any[]> {
  const { rows } = await pool.query(
    `SELECT m.*, r.name as resource_name, 
            u1.name as reporter_name, 
            u2.name as assigned_to_name
     FROM maintenance_logs m
     LEFT JOIN resources r ON m.resource_id = r.resource_id
     LEFT JOIN users u1 ON m.reported_by = u1.user_id
     LEFT JOIN users u2 ON m.assigned_to = u2.user_id
     ORDER BY m.created_at DESC`
  );
  return rows;
}

export async function updateTicket(id: string, data: IMaintenanceUpdate): Promise<IMaintenance | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;
  
    if (data.status !== undefined) { 
        setClauses.push(`status = $${paramIdx++}`); 
        values.push(data.status); 
        if (data.status === 'resolved' || data.status === 'closed') {
            setClauses.push(`resolved_at = NOW()`);
        }
    }
    if (data.assigned_to !== undefined) { 
        setClauses.push(`assigned_to = $${paramIdx++}`); 
        values.push(data.assigned_to); 
    }
    if (data.priority !== undefined) { 
        setClauses.push(`priority = $${paramIdx++}`); 
        values.push(data.priority); 
    }
  
    if (setClauses.length === 0) return null;
  
    values.push(id);
    const { rows } = await pool.query<IMaintenance>(
      `UPDATE maintenance_logs SET ${setClauses.join(', ')} WHERE maintenance_id = $${paramIdx} RETURNING *`,
      values
    );
    return rows[0] || null;
}
