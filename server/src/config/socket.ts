import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken } from '../utils/generateToken';
import { env } from './env';
import { logger } from '../utils/logger';

export let io: SocketIOServer;

export function initializeSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // JWT Middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = verifyAccessToken(token);
      
      // Store user info on the socket object (custom property)
      (socket as any).user = decoded;
      
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    logger.info(`🔌 Client connected: ${socket.id} (User: ${user.email})`);

    // Join a room based on the user's role to allow role-based broadcasting
    socket.join(`role:${user.role}`);
    
    // Join a room based on their user ID for personal notifications
    socket.join(`user:${user.user_id}`);

    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected: ${socket.id}`);
    });

    // You can also add more event handlers here if clients need to send messages to the server directly via socket
  });

  return io;
}
