// ─── Allocation Controller ───────────────────────────────────
import { Request, Response, NextFunction } from 'express';
import * as allocationService from '../services/allocationService';

export async function requestAllocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body;
    const requestedBy = req.user!.user_id;
    const allocation = await allocationService.requestAllocation(data, requestedBy);
    res.status(201).json({ success: true, data: allocation });
  } catch (err) {
    next(err);
  }
}

export async function getAllocations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // If student, they only see their own requests. Admins see all.
    // Handling this logically based on role.
    const userRole = req.user!.role;
    const filterUserId = (userRole === 'student' || userRole === 'staff' || userRole === 'faculty') && !req.query.all ? req.user!.user_id : undefined;
    
    // Explicit requested format via query e.g. ?all=true is filtered above. We will just use the secure default.
    // Actually, staff/faculty could be allowed if designed so, but let's default to only returning own items unless admin.
    const adminMode = ['chairman', 'admin'].includes(userRole);
    let uid = undefined;
    if (!adminMode) uid = req.user!.user_id;

    const allocations = await allocationService.getAllocations(uid);
    res.json({ success: true, data: allocations });
  } catch (err) {
    next(err);
  }
}

export async function updateAllocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.body.status;
    const approvedBy = req.user!.user_id;
    const updated = await allocationService.updateAllocationStatus(req.params.id as string, status, approvedBy);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
