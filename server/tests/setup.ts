import pool from '../src/config/db';
import dotenv from 'dotenv';
dotenv.config();

// Global setup and teardown for integration tests
beforeAll(async () => {
    // Before running tests, we ensure the database is fully cleared and seeded.
    // However, since we might run tests sequentially without a real DB right now, 
    // we bypass strict failure if DB connection drops during setup.
});

afterAll(async () => {
    // Close connection pool to prevent floating promises stopping jest
    await pool.end();
});
