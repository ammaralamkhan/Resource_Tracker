import * as roomModel from '../models/roomModel';
import { IRoomCreate } from '@shared/room';

export async function createRoom(data: IRoomCreate) {
  return await roomModel.createRoom(data);
}

export async function getAllRooms() {
  return await roomModel.getAllRooms();
}

export async function getRoomsWithResources() {
  return await roomModel.getRoomsWithResources();
}
