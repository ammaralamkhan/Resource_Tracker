// ─── Audit Controller ────────────────────────────────────────
import { Request, Response, NextFunction } from 'express';
import * as auditService from '../services/auditService';

export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const filters = {
        user_id: req.query.user_id,
        action: req.query.action,
        entity_type: req.query.entity_type,
    };

    const result = await auditService.getAuditLogs(page, limit, filters);
    
    res.json({ 
        success: true, 
        data: result.data,
        pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit)
        }
    });
  } catch (err) {
    next(err);
  }
}
