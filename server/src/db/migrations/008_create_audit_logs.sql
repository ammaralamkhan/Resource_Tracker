-- Migration 008: Create Audit Logs table
-- ═══════════════════════════════════════════════════════════════
-- This table is APPEND-ONLY. The application must NEVER issue
-- UPDATE or DELETE statements against it.

CREATE TABLE audit_logs (
    log_id      BIGSERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id   VARCHAR(255),
    details     JSONB,
    ip_address  VARCHAR(45),
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id     ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp   ON audit_logs(timestamp);
CREATE INDEX idx_audit_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_action      ON audit_logs(action);
