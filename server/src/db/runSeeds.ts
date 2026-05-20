// ─── Seed Runner ─────────────────────────────────────────────
// Executes all seed .sql files from the seed/ directory.

import fs from 'fs';
import path from 'path';
import pool from '../config/db';

const SEED_DIR = path.resolve(__dirname, 'seed');

async function runSeeds(): Promise<void> {
  const client = await pool.connect();

  try {
    const files = fs.readdirSync(SEED_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No seed files found.');
      return;
    }

    for (const file of files) {
      const filePath = path.join(SEED_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`🌱 Seeding: ${file}`);
      await client.query(sql);
      console.log(`✅ Seeded: ${file}`);
    }

    console.log('\n🎉 All seeds applied successfully.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runSeeds().catch((err) => {
  console.error('💀 Seed runner failed:', err);
  process.exit(1);
});
