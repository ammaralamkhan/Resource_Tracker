// ─── Audit Service ───────────────────────────────────────────
import * as auditModel from '../models/auditModel';

export async function getAuditLogs(page: number = 1, limit: number = 50, filters?: any) {
    return await auditModel.getAuditLogs(page, limit, filters);
}
