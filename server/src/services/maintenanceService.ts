// ─── Maintenance Service ─────────────────────────────────────
import * as maintenanceModel from '../models/maintenanceModel';
import { IMaintenanceReport, IMaintenanceUpdate } from '@shared/maintenance';
import { createAppError } from '../middleware/errorHandler';
import { io } from '../config/socket';
import { SOCKET_EVENTS } from '@shared/socket-events';
import * as notificationModel from '../models/notificationModel';

export async function createTicket(data: IMaintenanceReport, reportedBy: string) {
    const ticket = await maintenanceModel.createTicket(data, reportedBy);
    
    // Broadcast to admins and staff that a new ticket was reported
    io?.to('role:admin').to('role:chairman').to('role:staff').emit(SOCKET_EVENTS.MAINTENANCE_NEW_TICKET, {
        maintenanceId: ticket.maintenance_id,
        resourceId: ticket.resource_id,
        priority: ticket.priority
    });
    
    return ticket;
}

export async function getAllTickets() {
    return await maintenanceModel.getAllTickets();
}

export async function updateTicket(id: string, data: IMaintenanceUpdate) {
    const updated = await maintenanceModel.updateTicket(id, data);
    if (!updated) {
        throw createAppError('Maintenance ticket not found', 404, 'NOT_FOUND');
    }
    
    // Alert the staff if it was assigned to them, and alert admins globally
    const room = updated.assigned_to ? `user:${updated.assigned_to}` : 'role:staff';
    io?.to('role:admin').to('role:chairman').to(room).emit(SOCKET_EVENTS.MAINTENANCE_STATUS_CHANGE, {
        maintenanceId: updated.maintenance_id,
        status: updated.status
    });

    if (updated.assigned_to && data.assigned_to) {
         const notif = await notificationModel.createNotification(
             updated.assigned_to,
             'maintenance',
             `You have been assigned a maintenance ticket for ${updated.resource_name || 'a resource'}.`,
             updated.maintenance_id
         );
         io?.to(`user:${updated.assigned_to}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
             notificationId: notif.notification_id,
             userId: notif.user_id,
             type: notif.type,
             message: notif.message,
             relatedEntityId: notif.related_entity_id,
             timestamp: notif.created_at,
         });
    }

    return updated;
}
