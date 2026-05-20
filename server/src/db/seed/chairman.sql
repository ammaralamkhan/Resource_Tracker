-- Seed: Default Chairman account
-- ═══════════════════════════════════════════════════════════════
-- Password: Chairman@123 (bcrypt hash with cost 12)
-- IMPORTANT: Change this password immediately after first login!

INSERT INTO users (name, email, password_hash, role_id, is_active)
VALUES (
    'Department Chairman',
    'chairman@cs.amu.ac.in',
    -- This hash corresponds to 'Chairman@123' — generated with bcrypt cost 12
    '$2a$12$j4iHa9kLFdLK9BVND6N52eHQqaYGQ1uzP4.xm2TSahBRHwhj77F5a',
    (SELECT role_id FROM roles WHERE role_name = 'chairman'),
    true
)
ON CONFLICT (email) DO NOTHING;
