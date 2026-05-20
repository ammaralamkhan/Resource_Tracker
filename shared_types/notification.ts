// ─── Notification Types ────────────────────────────────────────

export type NotificationType = 'system' | 'allocation' | 'maintenance';

export interface INotification {
  notification_id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  related_entity_id: string | null;
  created_at: string;
}
