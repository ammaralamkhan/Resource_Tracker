// ─── PostgreSQL Connection Pool ──────────────────────────────
import { Pool } from 'pg';
import { env } from './env';

const isProduction = env.NODE_ENV === 'production';

const pool = new Pool(
  env.DATABASE_URL && env.DATABASE_URL !== 'postgresql://postgres:postgres@localhost:5432/resource_tracker'
    ? {
        connectionString: env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
    : {
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        max: 20,                    // Max connections in pool
        idleTimeoutMillis: 30000,   // Close idle connections after 30s
        connectionTimeoutMillis: 5000,
      }
);

// Log connection events in development
pool.on('connect', () => {
  if (env.NODE_ENV === 'development') {
    console.log('📦 New client connected to PostgreSQL');
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err);
  process.exit(-1);
});

export default pool;
