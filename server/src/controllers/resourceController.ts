import { Request, Response, NextFunction } from 'express';
import * as resourceService from '../services/resourceService';

export async function createResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body;
    const addedBy = req.user!.user_id;
    const resource = await resourceService.createResource(data, addedBy);
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
}

export async function getAllResources(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Basic query filters
    const filters = {
      type: req.query.type as any,
      status: req.query.status as any,
    };
    const resources = await resourceService.getAllResources(filters);
    res.json({ success: true, data: resources });
  } catch (err) {
    next(err);
  }
}

export async function getResourceById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resource = await resourceService.getResourceById(req.params.id as string);
    res.json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
}

export async function updateResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resource = await resourceService.updateResource(req.params.id as string, req.body);
    res.json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
}

export async function deleteResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await resourceService.deleteResource(req.params.id as string);
    res.json({ success: true, message: 'Resource deleted' });
  } catch (err) {
    next(err);
  }
}

// Config controllers
export async function getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const config = await resourceService.getConfig(req.params.id as string);
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
}

export async function upsertConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const config = await resourceService.upsertConfig(req.params.id as string, req.body);
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
}
