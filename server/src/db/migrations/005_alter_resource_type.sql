-- Migration 005: Add router and software to resource_type
-- ═══════════════════════════════════════════════════════════════

ALTER TYPE resource_type ADD VALUE IF NOT EXISTS 'router';
ALTER TYPE resource_type ADD VALUE IF NOT EXISTS 'software';
