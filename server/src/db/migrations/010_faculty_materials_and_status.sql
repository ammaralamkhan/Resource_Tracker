-- Migration 010: Faculty Materials & Location Status
-- ═══════════════════════════════════════════════════════════════

-- Faculty can upload study materials (notes, slides, PDFs, etc.)
CREATE TABLE faculty_materials (
    material_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by   UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title         VARCHAR(255) NOT NULL,
    subject       VARCHAR(150),
    description   TEXT,
    file_name     VARCHAR(255) NOT NULL,
    file_path     VARCHAR(500) NOT NULL,
    file_size     BIGINT,
    mime_type     VARCHAR(100),
    uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_materials_uploaded_by ON faculty_materials(uploaded_by);
CREATE INDEX idx_materials_uploaded_at ON faculty_materials(uploaded_at DESC);

-- Faculty location / presence status (one row per faculty member)
CREATE TABLE faculty_location_status (
    user_id     UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    status      VARCHAR(50) NOT NULL DEFAULT 'outside'
                  CHECK (status IN ('in_department', 'in_classroom', 'outside')),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
