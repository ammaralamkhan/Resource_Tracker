import fs from 'fs';
import path from 'path';
import pool from '../config/db';

async function runSeed() {
  console.log('🌱 Starting Use Case Database Seeding...');
  const seedFile = path.join(__dirname, 'seed', 'usecase_seed.sql');
  const sql = fs.readFileSync(seedFile, 'utf8');

  try {
    await pool.query(sql);
    console.log('✅ Use Case Data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding use case data:', error);
  } finally {
    await pool.end();
  }
}

runSeed();
