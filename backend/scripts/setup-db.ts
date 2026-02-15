/**
 * Run this script to create the database and tables.
 * Uses .env from backend root: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 *
 * Usage: cd backend && npx tsx scripts/setup-db.ts
 *
 * Ensure MySQL is running and credentials in .env are correct.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';

const config = {
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  multipleStatements: true,
};

async function main() {
  console.log('Connecting to MySQL...');
  const conn = await createConnection(config);

  const sqlPath = path.join(__dirname, 'init-db.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  console.log('Running init-db.sql...');
  await conn.query(sql);
  console.log('Database and tables created successfully.');

  await conn.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Database setup failed:', err.message);
  process.exit(1);
});
