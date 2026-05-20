-- Migration 006: Add specs JSONB column to device_configs
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE device_configs ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb;
