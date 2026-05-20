import { io } from 'socket.io-client';
import { generateAccessToken } from '../src/utils/generateToken';
import { env } from '../src/config/env';

// 1. Generate a mock JWT token for a Chairman
const token = generateAccessToken({
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'chairman@cs.amu.ac.in',
  role: 'chairman',
  role_id: 1,
});

console.log('Generated mock JWT token for testing.');

// 2. Connect with invalid token
const invalidSocket = io('http://localhost:5000', {
  auth: { token: 'invalid.token.here' }
});

invalidSocket.on('connect_error', (err) => {
  console.log(`✅ Invalid Token Rejected: ${err.message}`);
  invalidSocket.disconnect();
});

// 3. Connect with valid token
const validSocket = io('http://localhost:5000', {
  auth: { token }
});

validSocket.on('connect', () => {
  console.log(`✅ Valid Token Accepted. Socket ID: ${validSocket.id}`);
  
  // Test listening to an event
  validSocket.on('RESOURCE_UPDATED', (payload) => {
      console.log(`✅ Received RESOURCE_UPDATED event:`, payload);
  });
  
  // Keep alive for 2 seconds then exit to prevent hangs
  setTimeout(() => {
     console.log('✅ Socket tests complete. Disconnecting...');
     validSocket.disconnect();
     process.exit(0);
  }, 2000);
});

validSocket.on('connect_error', (err) => {
  console.error(`❌ Valid Token Rejected! Error: ${err.message}`);
  process.exit(1);
});
