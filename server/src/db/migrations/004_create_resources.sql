-- Migration 004: Create Resources table
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE resources (
    resource_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    type        resource_type NOT NULL DEFAULT 'other',
    location    VARCHAR(255) NOT NULL DEFAULT '',
    status      resource_status NOT NULL DEFAULT 'available',
    room_id     INTEGER REFERENCES rooms(room_id) ON DELETE SET NULL,
    added_by    UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resources_status  ON resources(status);
CREATE INDEX idx_resources_type    ON resources(type);
CREATE INDEX idx_resources_room_id ON resources(room_id);

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
