// ─── Migration Runner ────────────────────────────────────────
// Reads all .sql files from the migrations/ directory in order
// and executes them within a transaction.

import fs from 'fs';
import path from 'path';
import pool from '../config/db';

const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations');

async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    // Create a migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Get list of already-executed migrations
    const { rows: executed } = await client.query('SELECT filename FROM _migrations ORDER BY id');
    const executedSet = new Set(executed.map((r: { filename: string }) => r.filename));

    // Read migration files in sorted order
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No migration files found.');
      return;
    }

    let applied = 0;

    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`⏭️  Skipping (already applied): ${file}`);
        continue;
      }

      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`🔄 Running migration: ${file}`);

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`✅ Applied: ${file}`);
        applied++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Failed to apply ${file}:`, err);
        throw err;
      }
    }

    console.log(`\n🎉 Migrations complete. ${applied} new migration(s) applied.`);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('💀 Migration runner failed:', err);
  process.exit(1);
});
