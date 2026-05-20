import { Request, Response, NextFunction } from 'express';
import * as roomService from '../services/roomService';
import { IRoomCreate } from '@shared/room';

export async function createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data: IRoomCreate = req.body;
    const room = await roomService.createRoom(data);
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
}

export async function getAllRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rooms = await roomService.getAllRooms();
    res.json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
}

export async function getRoomsWithResources(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rooms = await roomService.getRoomsWithResources();
    res.json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
}
