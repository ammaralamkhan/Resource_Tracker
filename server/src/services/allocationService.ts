// ─── Allocation Service ──────────────────────────────────────
import * as allocationModel from '../models/allocationModel';
import { IAllocationRequest, type AllocationStatus } from '@shared/allocation';
import { createAppError } from '../middleware/errorHandler';
import { io } from '../config/socket';
import { SOCKET_EVENTS } from '@shared/socket-events';
import * as notificationModel from '../models/notificationModel';

export async function requestAllocation(data: IAllocationRequest, userId: string) {
  // Check if dates are valid
  if (new Date(data.end_time) <= new Date(data.start_time)) {
      throw createAppError('End time must be after start time', 400, 'VALIDATION_ERROR');
  }
  const allocation = await allocationModel.createAllocation(data, userId);
  
  // Notify admins
  io?.to('role:admin').to('role:chairman').emit(SOCKET_EVENTS.ALLOCATION_NEW_REQUEST, { allocationId: allocation.allocation_id, resourceId: allocation.resource_id });

  return allocation;
}

export async function getAllocations(userId?: string) {
  return await allocationModel.getAllocations(userId);
}

export async function updateAllocationStatus(id: string, status: AllocationStatus, approvedBy: string) {
   // Validate the status transitions
   const current = await allocationModel.getAllocationById(id);
   if (!current) throw createAppError('Allocation not found', 404, 'NOT_FOUND');

   try {
     const updated = await allocationModel.updateAllocationStatus(id, status, approvedBy);
     
     if (updated) {
         // Notify the original requester
         io?.to(`user:${current.requested_by}`).emit(SOCKET_EVENTS.ALLOCATION_STATUS_CHANGE, {
             allocationId: updated.allocation_id,
             status: updated.status
         });

         // Create a notification for the requester
         const notif = await notificationModel.createNotification(
             current.requested_by,
             'allocation',
             `Your allocation request for ${current.resource_name} has been ${status}.`,
             updated.allocation_id
         );
         io?.to(`user:${current.requested_by}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
             notificationId: notif.notification_id,
             userId: notif.user_id,
             type: notif.type,
             message: notif.message,
             relatedEntityId: notif.related_entity_id,
             timestamp: notif.created_at,
         });

         // Important: Broadcast that the resource has been locked/released
         // A more real app would fetch the full resource to pass its current status
         const simulatedStatus = status === 'approved' ? 'in_use' : 'available';
         io?.emit(SOCKET_EVENTS.RESOURCE_STATUS_UPDATE, {
             resourceId: updated.resource_id,
             newStatus: simulatedStatus,
         });
     }

     return updated;
   } catch (e: any) {
     if (e.message.includes('in use')) {
        throw createAppError('Resource is already in use.', 409, 'CONFLICT');
     }
     throw e;
   }
}
