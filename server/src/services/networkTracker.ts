import { exec } from 'child_process';
import os from 'os';
import util from 'util';
import pool from '../config/db';
import type { ResourceStatus } from '@shared/resource';
import { SOCKET_EVENTS, ResourceStatusUpdatePayload } from '@shared/socket-events';
import { io } from '../config/socket';

const execAsync = util.promisify(exec);

// Ping an IP address to check if it's alive
async function isAlive(ipAddress: string): Promise<boolean> {
  const isWindows = os.platform() === 'win32';
  const command = isWindows ? `ping -n 1 -w 2000 ${ipAddress}` : `ping -c 1 -W 2 ${ipAddress}`;
  
  try {
    const { stdout } = await execAsync(command);
    if (isWindows) {
      return stdout.includes('TTL=') || stdout.includes('ttl=');
    } else {
      return stdout.includes('1 packets received') || stdout.includes('1 received');
    }
  } catch (error) {
    return false;
  }
}

// Background tracker service
export class NetworkTracker {
  private timer: NodeJS.Timeout | null = null;
  private intervalMs: number = 60000; // Check every 60 seconds

  start() {
    if (this.timer) return;
    console.log('🌐 Network Tracker started.');
    this.timer = setInterval(() => this.checkNetworkStatus(), this.intervalMs);
    // Initial check
    this.checkNetworkStatus();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async checkNetworkStatus() {
    try {
      // 1. Get all resources that have an IP address and are expected to be available or not working
      const { rows } = await pool.query(`
        SELECT r.resource_id, r.name, r.status, dc.ip_address
        FROM resources r
        JOIN device_configs dc ON r.resource_id = dc.resource_id
        WHERE dc.ip_address IS NOT NULL AND dc.ip_address != ''
          AND r.status IN ('available', 'not_working', 'in_use')
      `);

      for (const device of rows) {
        if (!device.ip_address) continue;

        const isOnline = await isAlive(device.ip_address);
        
        let newStatus: ResourceStatus | null = null;

        if (isOnline && device.status === 'not_working') {
           newStatus = 'available';
        } else if (!isOnline && (device.status === 'available' || device.status === 'in_use')) {
           newStatus = 'not_working';
        }

        if (newStatus) {
           // Update database
           await pool.query('UPDATE resources SET status = $1, updated_at = NOW() WHERE resource_id = $2', [newStatus, device.resource_id]);
           
           console.log(`[NetworkTracker] Device ${device.name} (${device.ip_address}) status changed to: ${newStatus}`);

           // Emit websocket event
           if (io) {
             const payload: ResourceStatusUpdatePayload = {
               resourceId: device.resource_id,
               newStatus,
               updatedBy: 'system',
               timestamp: new Date().toISOString()
             };
             io.emit(SOCKET_EVENTS.RESOURCE_STATUS_UPDATE, payload);
           }
        }
      }
    } catch (error) {
      console.error('[NetworkTracker] Error checking network status:', error);
    }
  }
}

export const networkTracker = new NetworkTracker();
