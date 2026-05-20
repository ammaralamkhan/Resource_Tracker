// ─── Allocation Model ────────────────────────────────────────
import pool from '../config/db';
import { IAllocation, IAllocationRequest, type AllocationStatus } from '@shared/allocation';

export async function getAllocations(userId?: string): Promise<any[]> {
  let query = `SELECT a.*, r.name as resource_name, u.name as requester_name
     FROM allocations a
     LEFT JOIN resources r ON a.resource_id = r.resource_id
     LEFT JOIN users u ON a.requested_by = u.user_id`;
  const values: any[] = [];
  if (userId) {
    query += ' WHERE a.requested_by = $1';
    values.push(userId);
  }
  query += ' ORDER BY a.created_at DESC';
  const { rows } = await pool.query(query, values);
  return rows;
}

export async function getAllocationById(id: string): Promise<IAllocation | null> {
    const { rows } = await pool.query<IAllocation>(
      `SELECT a.*, r.name as resource_name, u.name as requester_name
       FROM allocations a
       LEFT JOIN resources r ON a.resource_id = r.resource_id
       LEFT JOIN users u ON a.requested_by = u.user_id
       WHERE a.allocation_id = $1`,
      [id]
    );
    return rows[0] || null;
}

export async function createAllocation(data: IAllocationRequest, requestedBy: string): Promise<IAllocation> {
  const { rows } = await pool.query<IAllocation>(
    `INSERT INTO allocations (resource_id, requested_by, start_time, end_time, status)
     VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
    [data.resource_id, requestedBy, data.start_time, data.end_time]
  );
  return rows[0];
}

// Transaction block for approving an allocation safely
export async function updateAllocationStatus(
    allocationId: string, 
    status: AllocationStatus, 
    approvedBy: string | null
): Promise<IAllocation | null> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Lock the allocation
        const { rows: allocRows } = await client.query<IAllocation>(
            'SELECT * FROM allocations WHERE allocation_id = $1 FOR UPDATE',
            [allocationId]
        );
        if (allocRows.length === 0) {
            await client.query('ROLLBACK');
            return null;
        }
        const allocation = allocRows[0];

        // If approving, lock the resource to prevent double-booking
        if (status === 'approved') {
            const { rows: resourceRows } = await client.query(
                'SELECT status FROM resources WHERE resource_id = $1 FOR UPDATE',
                [allocation.resource_id]
            );
            if (resourceRows.length > 0 && resourceRows[0].status === 'in_use') {
                // Cannot approve if already in use. Need application logic rejection.
                await client.query('ROLLBACK');
                throw new Error('Resource is currently in use and cannot be allocated.');
            }
            
            // Update resource status to in_use, if starting immediately. 
            // Simplified: approving means it will eventually be in use.
            await client.query(
                'UPDATE resources SET status = $1 WHERE resource_id = $2',
                ['in_use', allocation.resource_id]
            );
        } else if (status === 'released') {
             // If releasing, update resource back to available
             await client.query(
                'UPDATE resources SET status = $1 WHERE resource_id = $2',
                ['available', allocation.resource_id]
            );
        }

        const { rows: updatedRows } = await client.query<IAllocation>(
            `UPDATE allocations 
             SET status = $1, approved_by = $2
             WHERE allocation_id = $3 RETURNING *`,
            [status, approvedBy, allocationId]
        );

        await client.query('COMMIT');
        return updatedRows[0];
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}
