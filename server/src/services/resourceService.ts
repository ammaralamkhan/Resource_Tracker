import * as resourceModel from '../models/resourceModel';
import * as configModel from '../models/configModel';
import { IResourceCreate, IResourceUpdate, IResource } from '@shared/resource';
import { IDeviceConfigUpsert } from '@shared/config';
import { createAppError } from '../middleware/errorHandler';
import { io } from '../config/socket';
import { SOCKET_EVENTS } from '@shared/socket-events';

export async function createResource(data: IResourceCreate, addedBy: string): Promise<IResource> {
  const resource = await resourceModel.createResource(data, addedBy);
  io?.emit(SOCKET_EVENTS.RESOURCE_STATUS_UPDATE, { resourceId: resource.resource_id, newStatus: resource.status });
  return resource;
}

export async function getAllResources(filters?: Partial<IResource>): Promise<IResource[]> {
  return await resourceModel.getAllResources(filters);
}

export async function getResourceById(id: string): Promise<IResource> {
  const resource = await resourceModel.getResourceById(id);
  if (!resource) {
    throw createAppError('Resource not found', 404, 'NOT_FOUND');
  }
  return resource;
}

export async function updateResource(id: string, data: IResourceUpdate): Promise<IResource> {
  const resource = await resourceModel.updateResource(id, data);
  if (!resource) {
    throw createAppError('Resource not found or nothing to update', 404, 'NOT_FOUND');
  }
  io?.emit(SOCKET_EVENTS.RESOURCE_STATUS_UPDATE, { resourceId: resource.resource_id, newStatus: resource.status });
  return resource;
}

export async function deleteResource(id: string): Promise<{ success: true }> {
  const success = await resourceModel.deleteResource(id);
  if (!success) {
    throw createAppError('Resource not found', 404, 'NOT_FOUND');
  }
  // Clients could listen to this as a delete or a generalized update
  io?.emit(SOCKET_EVENTS.RESOURCE_DELETED, { resourceId: id, newStatus: 'deleted' });
  return { success: true };
}

// Config service functions incorporated here since config is 1:1 with resource
export async function getConfig(resourceId: string) {
  const resource = await resourceModel.getResourceById(resourceId);
  if (!resource) {
    throw createAppError('Resource not found', 404, 'NOT_FOUND');
  }
  return await configModel.getConfigByResourceId(resourceId);
}

export async function upsertConfig(resourceId: string, data: IDeviceConfigUpsert) {
  const resource = await resourceModel.getResourceById(resourceId);
  if (!resource) {
    throw createAppError('Resource not found', 404, 'NOT_FOUND');
  }
  return await configModel.upsertConfig(resourceId, data);
}
