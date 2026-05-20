// ─── Server Entry Point ──────────────────────────────────────
import http from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const server = http.createServer(app);

// ─── Socket.io Attachment ────────────────────────────────────
import { initializeSocket } from './config/socket';
initializeSocket(server);

import { networkTracker } from './services/networkTracker';

server.listen(env.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
  logger.info(`📡 Environment: ${env.NODE_ENV}`);
  logger.info(`🌐 CORS origin: ${env.CLIENT_URL}`);
  
  // Start the background network tracker
  networkTracker.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  networkTracker.stop();
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});
