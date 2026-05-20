import pool from '../config/db';
import { type INotification, type NotificationType } from '@shared/notification';

export async function getUserNotifications(userId: string): Promise<INotification[]> {
  const { rows } = await pool.query<INotification>(
    `SELECT * FROM notifications 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT 50`,
    [userId]
  );
  return rows;
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  relatedEntityId: string | null = null
): Promise<INotification> {
  const { rows } = await pool.query<INotification>(
    `INSERT INTO notifications (user_id, type, message, related_entity_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, type, message, relatedEntityId]
  );
  return rows[0];
}

export async function markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
  const { rows } = await pool.query<INotification>(
    `UPDATE notifications 
     SET is_read = TRUE 
     WHERE notification_id = $1 AND user_id = $2
     RETURNING *`,
    [notificationId, userId]
  );
  return rows[0] || null;
}

export async function markAllAsRead(userId: string): Promise<void> {
  await pool.query(
    `UPDATE notifications 
     SET is_read = TRUE 
     WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
}
