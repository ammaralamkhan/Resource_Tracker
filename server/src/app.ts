import express from 'express';
import path from 'path';
import cors from 'cors';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { auditLogger } from './middleware/auditLogger';

// Route imports
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import resourceRoutes from './routes/resourceRoutes';
import allocationRoutes from './routes/allocationRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import auditRoutes from './routes/auditRoutes';
import roomRoutes from './routes/roomRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import facultyRoutes from './routes/facultyRoutes';
import notificationRoutes from './routes/notificationRoutes';

const app = express();

// ─── Core Middleware ──────────────────────────────────────────
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded faculty materials as static files
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.use(apiLimiter);

// ─── Audit Logger (logs all mutating requests) ──────────────
app.use(auditLogger);

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Error Handler (must be last) ────────────────────────────
app.use(errorHandler);

export default app;
