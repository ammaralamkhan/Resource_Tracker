// ─── Dashboard Model ──────────────────────────────────────────
import pool from '../config/db';

export async function getDashboardStats() {
  const queries = [
    pool.query('SELECT COUNT(*) FROM resources'),
    pool.query("SELECT COUNT(*) FROM allocations WHERE status IN ('pending', 'approved')"),
    pool.query("SELECT COUNT(*) FROM maintenance_logs WHERE status IN ('reported', 'in_progress')"),
    pool.query('SELECT COUNT(*) FROM users')
  ];

  const results = await Promise.all(queries);

  return {
    totalResources: parseInt(results[0].rows[0].count, 10),
    activeAllocations: parseInt(results[1].rows[0].count, 10),
    openTickets: parseInt(results[2].rows[0].count, 10),
    registeredUsers: parseInt(results[3].rows[0].count, 10)
  };
}

export async function getRecentActivity(limit: number = 5) {
  // We join with the users table to get the actor's name and email
  const query = `
    SELECT al.log_id, al.action, al.entity_type, al.entity_id, al.details, al.timestamp, 
           u.name as actor_name, u.email as actor_email
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.user_id
    ORDER BY al.timestamp DESC
    LIMIT $1
  `;
  const { rows } = await pool.query(query, [limit]);
  return rows;
}

/**
 * Chart data for the dashboard analytics section.
 */
export async function getChartData() {
  const [resourcesByType, allocationsByStatus, resourcesByStatus, monthlyAllocations] = await Promise.all([
    // Resources grouped by type
    pool.query(`
      SELECT type as name, COUNT(*)::int as value 
      FROM resources 
      GROUP BY type 
      ORDER BY value DESC
    `),
    // Allocations grouped by status
    pool.query(`
      SELECT status as name, COUNT(*)::int as value 
      FROM allocations 
      GROUP BY status
    `),
    // Resources by status (available, allocated, maintenance)
    pool.query(`
      SELECT status as name, COUNT(*)::int as value 
      FROM resources 
      GROUP BY status
    `),
    // Monthly allocation requests (last 6 months)
    pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month,
        COUNT(*)::int as requests,
        COUNT(*) FILTER (WHERE status = 'approved')::int as approved,
        COUNT(*) FILTER (WHERE status = 'rejected')::int as rejected
      FROM allocations 
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `)
  ]);

  return {
    resourcesByType: resourcesByType.rows,
    allocationsByStatus: allocationsByStatus.rows,
    resourcesByStatus: resourcesByStatus.rows,
    monthlyAllocations: monthlyAllocations.rows
  };
}
