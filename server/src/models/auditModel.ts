// ─── Audit Model ─────────────────────────────────────────────
import pool from '../config/db';
import { IAuditLog } from '@shared/audit';

export async function getAuditLogs(page: number = 1, limit: number = 50, filters?: any): Promise<{ data: any[], total: number }> {
    let query = `SELECT al.*, u.email as actor_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM audit_logs al WHERE 1=1`;
    const values: any[] = [];
    let paramIdx = 1;

    if (filters?.user_id) {
        query += ` AND al.user_id = $${paramIdx}`;
        countQuery += ` AND al.user_id = $${paramIdx}`;
        values.push(filters.user_id);
        paramIdx++;
    }
    if (filters?.action) {
        query += ` AND al.action = $${paramIdx}`;
        countQuery += ` AND al.action = $${paramIdx}`;
        values.push(filters.action);
        paramIdx++;
    }
    if (filters?.entity_type) {
        query += ` AND al.entity_type = $${paramIdx}`;
        countQuery += ` AND al.entity_type = $${paramIdx}`;
        values.push(filters.entity_type);
        paramIdx++;
    }

    query += ` ORDER BY al.timestamp DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
    values.push(limit, (page - 1) * limit);

    const { rows: data } = await pool.query(query, values);
    
    // get count without limit/offset
    const { rows: countRows } = await pool.query(countQuery, values.slice(0, values.length - 2));

    return {
        data,
        total: parseInt(countRows[0].count, 10)
    };
}
