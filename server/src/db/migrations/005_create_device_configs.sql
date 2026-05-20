-- Migration 005: Create Device Configurations table
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE device_configs (
    config_id   SERIAL PRIMARY KEY,
    resource_id UUID NOT NULL UNIQUE REFERENCES resources(resource_id) ON DELETE CASCADE,
    cpu         VARCHAR(255),
    ram         VARCHAR(100),
    storage     VARCHAR(255),
    os          VARCHAR(255),
    ip_address  VARCHAR(45),   -- Supports IPv6
    mac_address VARCHAR(17)    -- XX:XX:XX:XX:XX:XX format
);

CREATE INDEX idx_device_configs_ip_address  ON device_configs(ip_address);
CREATE INDEX idx_device_configs_mac_address ON device_configs(mac_address);
