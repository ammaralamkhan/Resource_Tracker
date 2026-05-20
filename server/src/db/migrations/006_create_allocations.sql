-- Migration 006: Create Allocations table
-- ═══════════════════════════════════════════════════════════════
-- NOTE: Application code MUST use SELECT ... FOR UPDATE on the
-- resources row before approving an allocation to prevent double-booking.

CREATE TABLE allocations (
    allocation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id   UUID NOT NULL REFERENCES resources(resource_id) ON DELETE CASCADE,
    requested_by  UUID NOT NULL REFERENCES users(user_id) ON DELETE SET NULL,
    approved_by   UUID REFERENCES users(user_id) ON DELETE SET NULL,
    start_time    TIMESTAMPTZ NOT NULL,
    end_time      TIMESTAMPTZ NOT NULL,
    status        allocation_status NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Sanity: end must be after start
    CONSTRAINT chk_allocation_times CHECK (end_time > start_time)
);

CREATE INDEX idx_allocations_status       ON allocations(status);
CREATE INDEX idx_allocations_resource_id  ON allocations(resource_id);
CREATE INDEX idx_allocations_requested_by ON allocations(requested_by);
CREATE INDEX idx_allocations_time_range   ON allocations(start_time, end_time);
