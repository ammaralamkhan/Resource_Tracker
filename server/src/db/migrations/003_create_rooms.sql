-- Migration 003: Create Rooms table
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE rooms (
    room_id    SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    building   VARCHAR(255) NOT NULL,
    floor      INTEGER NOT NULL DEFAULT 0,
    room_type  room_type NOT NULL DEFAULT 'other',
    capacity   INTEGER
);

CREATE INDEX idx_rooms_building  ON rooms(building);
CREATE INDEX idx_rooms_room_type ON rooms(room_type);
