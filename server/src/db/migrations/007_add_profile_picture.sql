-- Migration 007: Add profile picture column
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
