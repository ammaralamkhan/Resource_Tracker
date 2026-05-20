-- Migration 001: Create custom ENUM types and Roles table
-- ═══════════════════════════════════════════════════════════════

-- Custom ENUM types
CREATE TYPE user_role AS ENUM ('chairman', 'admin', 'faculty', 'staff', 'student');
CREATE TYPE resource_status AS ENUM ('available', 'in_use', 'under_maintenance', 'not_working', 'decommissioned');
CREATE TYPE resource_type AS ENUM ('computer', 'ups', 'cctv', 'switch', 'projector', 'printer', 'lab_equipment', 'furniture', 'other');
CREATE TYPE allocation_status AS ENUM ('pending', 'approved', 'rejected', 'active', 'released', 'expired');
CREATE TYPE maintenance_status AS ENUM ('reported', 'assigned', 'in_progress', 'resolved', 'closed');
CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE room_type AS ENUM ('lab', 'classroom', 'office', 'server_room', 'seminar_hall', 'other');
CREATE TYPE staff_status AS ENUM ('available', 'on_leave', 'busy', 'unavailable');

-- Roles lookup table
CREATE TABLE roles (
    role_id   SERIAL PRIMARY KEY,
    role_name user_role NOT NULL UNIQUE
);

-- Pre-populate the five canonical roles
INSERT INTO roles (role_name) VALUES
    ('chairman'),
    ('admin'),
    ('faculty'),
    ('staff'),
    ('student');
