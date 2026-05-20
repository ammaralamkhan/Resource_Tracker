-- Migration 007: Create Maintenance Logs table
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE maintenance_logs (
    maintenance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id    UUID NOT NULL REFERENCES resources(resource_id) ON DELETE CASCADE,
    reported_by    UUID NOT NULL REFERENCES users(user_id) ON DELETE SET NULL,
    assigned_to    UUID REFERENCES users(user_id) ON DELETE SET NULL,
    issue          TEXT NOT NULL,
    priority       maintenance_priority NOT NULL DEFAULT 'medium',
    status         maintenance_status NOT NULL DEFAULT 'reported',
    resolved_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maintenance_status      ON maintenance_logs(status);
CREATE INDEX idx_maintenance_resource_id ON maintenance_logs(resource_id);
CREATE INDEX idx_maintenance_priority    ON maintenance_logs(priority);
