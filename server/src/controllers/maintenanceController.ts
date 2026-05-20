// ─── Maintenance Controller ──────────────────────────────────
import { Request, Response, NextFunction } from 'express';
import * as maintenanceService from '../services/maintenanceService';

export async function createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body;
    const reportedBy = req.user!.user_id;
    const ticket = await maintenanceService.createTicket(data, reportedBy);
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function getAllTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tickets = await maintenanceService.getAllTickets();
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
}

export async function updateTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await maintenanceService.updateTicket(req.params.id as string, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
