// ─── Room Types ───────────────────────────────────────────────

export type RoomType = 'lab' | 'classroom' | 'office' | 'server_room' | 'seminar_hall' | 'other';

export interface IRoom {
  room_id: number;
  name: string;
  building: string;
  floor: number;
  room_type: RoomType;
  capacity: number | null;
}

export interface IRoomCreate {
  name: string;
  building: string;
  floor: number;
  room_type: RoomType;
  capacity?: number;
}
