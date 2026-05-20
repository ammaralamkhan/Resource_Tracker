-- Migration 009: Create Room-Resources bridge table
-- ═══════════════════════════════════════════════════════════════
-- Supports many-to-many mapping of resources to rooms over time.

CREATE TABLE room_resources (
    room_id     INTEGER NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(resource_id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (room_id, resource_id)
);
