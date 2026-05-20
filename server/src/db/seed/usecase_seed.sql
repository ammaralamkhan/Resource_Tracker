-- Usecase Seed Script: CS Department Setup
-- Clear existing rooms and resources
TRUNCATE TABLE rooms CASCADE;
TRUNCATE TABLE resources CASCADE;

-- Create an Admin user to assign added_by
DO $$
DECLARE
    admin_id UUID;
    lt1_id INT; res_lab1_id INT; cyber_lab_id INT; chairman_id INT;
    ltu1_id INT; ltu2_id INT; ltu3_id INT; ug_lab_id INT; pg_lab_id INT; conf_hall_id INT; res_lab2_id INT;
    i INT;
    res_id UUID;
BEGIN
    -- Ensure we have an admin user
    SELECT u.user_id INTO admin_id 
    FROM users u 
    JOIN roles r ON u.role_id = r.role_id 
    WHERE r.role_name = 'admin' LIMIT 1;

    IF admin_id IS NULL THEN
        -- Insert a dummy admin if it doesn't exist
        INSERT INTO users (name, email, password_hash, role_id) 
        VALUES ('System Admin', 'admin@cs.dept', 'dummyhash', (SELECT role_id FROM roles WHERE role_name = 'admin')) RETURNING user_id INTO admin_id;
    END IF;

    -- =========================================================
    -- GROUND FLOOR (Floor 0)
    -- =========================================================
    INSERT INTO rooms (name, building, floor, room_type, capacity) VALUES ('LT-1', 'Main CS Block', 0, 'classroom', 80) RETURNING room_id INTO lt1_id;
    INSERT INTO rooms (name, building, floor, room_type, capacity) VALUES ('Research Lab', 'Main CS Block', 0, 'lab', 20) RETURNING room_id INTO res_lab1_id;
    INSERT INTO rooms (name, building, floor, room_type, capacity) VALUES ('Cyber Security Lab', 'Main CS Block', 0, 'lab', 30) RETURNING room_id INTO cyber_lab_id;
    INSERT INTO rooms (name, building, floor, room_type, capacity) VALUES ('Chairman Office', 'Main CS Block', 0, 'office', 5) RETURNING room_id INTO chairman_id;

    -- =========================================================
    -- FIRST FLOOR (Floor 1)
    -- =========================================================
    INSERT INTO rooms (name, building, floor, room_type, capacity) VALUES ('LTU-1', 'Main CS Block', 1, 'classroom', 60) RETURNING room_id INTO ltu1_id;
    INSERT INTO rooms (name, building, floor, room_type, capacity) VALUES ('LTU-2', 'Main CS Block', 1, 'classroom', 60) RETURNING room_id INTO ltu2_id;
    INSERT INTO rooms (name, building, floor, room_type, capacity) VALUES ('LTU-3', 'Main CS Block', 1, 'classroom', 60) RETURNING room_id INTO ltu3_id;
    INSERT INTO rooms (name, building, floor, room_type, capacity) VALUES ('UG LAB', 'Main CS Block', 1, 'lab', 30) RETURNING room_id INTO ug_lab_id;
    INSERT INTO rooms (name, building, floor, room_type, capacity) VALUES ('PG LAB', 'Main CS Block', 1, 'lab', 25) RETURNING room_id INTO pg_lab_id;
    INSERT INTO rooms (name, building, floor, room_type, capacity) VALUES ('Conference Hall', 'Main CS Block', 1, 'seminar_hall', 50) RETURNING room_id INTO conf_hall_id;
    INSERT INTO rooms (name, building, floor, room_type, capacity) VALUES ('Research Lab 2', 'Main CS Block', 1, 'lab', 15) RETURNING room_id INTO res_lab2_id;

    -- =========================================================
    -- SEED RESOURCES
    -- =========================================================

    -- LT-1 Projector & Podium
    INSERT INTO resources (name, type, location, status, room_id, added_by) VALUES ('LT-1 Main Projector', 'projector', 'Ceiling Mount', 'available', lt1_id, admin_id);
    INSERT INTO resources (name, type, location, status, room_id, added_by) VALUES ('LT-1 Smart Podium', 'furniture', 'Front Stage', 'available', lt1_id, admin_id);

    -- Chairman Office
    INSERT INTO resources (name, type, location, status, room_id, added_by) VALUES ('Chairman Availability Indicator', 'other', 'Door', 'available', chairman_id, admin_id);

    -- UG LAB (30 Computers)
    FOR i IN 1..30 LOOP
        INSERT INTO resources (name, type, location, status, room_id, added_by) 
        VALUES ('UG-PC-' || lpad(i::text, 2, '0'), 'computer', 'Desk ' || i, 'available', ug_lab_id, admin_id)
        RETURNING resource_id INTO res_id;

        INSERT INTO device_configs (resource_id, ip_address, mac_address, cpu, ram, storage, os)
        VALUES (res_id, '192.168.10.' || (100 + i), '00:1A:2B:3C:4D:' || lpad(i::text, 2, '0'), 'Intel Core i5-12400', '16GB DDR4', '512GB NVMe SSD', 'Windows 11 Pro');
    END LOOP;

    -- PG LAB (25 Computers)
    FOR i IN 1..25 LOOP
        INSERT INTO resources (name, type, location, status, room_id, added_by) 
        VALUES ('PG-PC-' || lpad(i::text, 2, '0'), 'computer', 'Desk ' || i, CASE WHEN i%5=0 THEN 'in_use' ELSE 'available' END::resource_status, pg_lab_id, admin_id)
        RETURNING resource_id INTO res_id;

        INSERT INTO device_configs (resource_id, ip_address, mac_address, cpu, ram, storage, os)
        VALUES (res_id, '192.168.11.' || (100 + i), '00:1B:2C:3D:4E:' || lpad(i::text, 2, '0'), 'Intel Core i7-13700', '32GB DDR5', '1TB NVMe SSD', 'Ubuntu 22.04 LTS');
    END LOOP;

    -- Cyber Security Lab (10 High-end Workstations)
    FOR i IN 1..10 LOOP
        INSERT INTO resources (name, type, location, status, room_id, added_by) 
        VALUES ('CYBER-WS-' || lpad(i::text, 2, '0'), 'computer', 'Station ' || i, 'available', cyber_lab_id, admin_id)
        RETURNING resource_id INTO res_id;

        INSERT INTO device_configs (resource_id, ip_address, mac_address, cpu, ram, storage, os)
        VALUES (res_id, '10.0.0.' || (10 + i), 'AA:BB:CC:DD:EE:' || lpad(i::text, 2, '0'), 'AMD Ryzen 9 7900X', '64GB DDR5', '2TB Gen4 SSD', 'Kali Linux');
    END LOOP;

    -- Conference Hall (Projector + Audio System)
    INSERT INTO resources (name, type, location, status, room_id, added_by) VALUES ('4K Projector', 'projector', 'Ceiling', 'available', conf_hall_id, admin_id);
    INSERT INTO resources (name, type, location, status, room_id, added_by) VALUES ('Bose Audio System', 'other', 'Rack', 'available', conf_hall_id, admin_id);

    -- LTs (Projectors)
    INSERT INTO resources (name, type, location, status, room_id, added_by) VALUES ('LTU-1 Projector', 'projector', 'Ceiling', 'available', ltu1_id, admin_id);
    INSERT INTO resources (name, type, location, status, room_id, added_by) VALUES ('LTU-2 Projector', 'projector', 'Ceiling', 'available', ltu2_id, admin_id);
    INSERT INTO resources (name, type, location, status, room_id, added_by) VALUES ('LTU-3 Projector', 'projector', 'Ceiling', 'not_working', ltu3_id, admin_id);

END $$;
