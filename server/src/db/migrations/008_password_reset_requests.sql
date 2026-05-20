-- Migration 008: Create password reset requests table
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS password_reset_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
