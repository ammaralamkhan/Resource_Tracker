// ─── WebSocket Event Type Contracts ──────────────────────────

/**
 * All WebSocket event names used between server and clients.
 * Shared to ensure type-safe event handling on both sides.
 */
export const SOCKET_EVENTS = {
  // Resource events
  RESOURCE_STATUS_UPDATE: 'resource:status_update',
  RESOURCE_CREATED: 'resource:created',
  RESOURCE_DELETED: 'resource:deleted',

  // Allocation events
  ALLOCATION_NEW_REQUEST: 'allocation:new_request',
  ALLOCATION_STATUS_CHANGE: 'allocation:status_change',

  // Maintenance events
  MAINTENANCE_NEW_TICKET: 'maintenance:new_ticket',
  MAINTENANCE_STATUS_CHANGE: 'maintenance:status_change',

  // User presence events
  USER_STATUS_CHANGE: 'user:status_change',

  // System events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Notification events
  NOTIFICATION_NEW: 'notification:new',
} as const;

// ─── Payload Interfaces ──────────────────────────────────────

export interface ResourceStatusUpdatePayload {
  resourceId: string;
  newStatus: string;
  updatedBy: string;
  timestamp: string;
}

export interface ResourceCreatedPayload {
  resourceId: string;
  name: string;
  type: string;
  status: string;
  addedBy: string;
  timestamp: string;
}

export interface AllocationNewRequestPayload {
  allocationId: string;
  resourceId: string;
  resourceName: string;
  requestedBy: string;
  requestedByName: string;
  startTime: string;
  endTime: string;
}

export interface AllocationStatusChangePayload {
  allocationId: string;
  newStatus: string;
  approvedBy: string | null;
  resourceId: string;
  timestamp: string;
}

export interface MaintenanceNewTicketPayload {
  maintenanceId: string;
  resourceId: string;
  resourceName: string;
  issue: string;
  priority: string;
  reportedBy: string;
  reportedByName: string;
}

export interface MaintenanceStatusChangePayload {
  maintenanceId: string;
  newStatus: string;
  assignedTo: string | null;
  resourceId: string;
  timestamp: string;
}

export interface UserStatusChangePayload {
  userId: string;
  isOnline: boolean;
}

export interface NotificationNewPayload {
  notificationId: string;
  userId: string;
  type: string;
  message: string;
  relatedEntityId: string | null;
  timestamp: string;
}
