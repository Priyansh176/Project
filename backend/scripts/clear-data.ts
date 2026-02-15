/**
 * Clear all data from the database (keeps schema).
 * Tables truncated in FK-safe order.
 * Usage: cd backend && npx tsx scripts/clear-data.ts
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createConnection } from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const conn = await createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'course_allotment',
  });

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  await conn.query('TRUNCATE TABLE ENROLLMENT');
  await conn.query('TRUNCATE TABLE PREFERENCE');
  await conn.query('TRUNCATE TABLE ADM_IN_ACCESS');
  await conn.query('TRUNCATE TABLE COURSE');
  await conn.query('TRUNCATE TABLE STUDENT');
  await conn.query('TRUNCATE TABLE ADMIN');
  await conn.query('TRUNCATE TABLE DEPARTMENT');
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log('All data cleared (schema unchanged).');
  await conn.end();
}

main().catch((e) => {
  console.error('Clear data failed:', e.message);
  process.exit(1);
});
