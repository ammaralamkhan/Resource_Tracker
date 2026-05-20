import { Request, Response } from 'express';
import * as notificationModel from '../models/notificationModel';

export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user!.user_id;
    const notifications = await notificationModel.getUserNotifications(userId);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const userId = req.user!.user_id;
    const id = req.params.id as string;
    const notification = await notificationModel.markAsRead(id, userId);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = req.user!.user_id;
    await notificationModel.markAllAsRead(userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
}
