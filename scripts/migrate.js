/**
 * ============================================================================
 * EKLIPSE FUNDED — DATABASE MIGRATION RUNNER
 * ============================================================================
 * Ejecuta migraciones incrementales en PostgreSQL de forma determinista y segura.
 * Funciona idénticamente en desarrollo local (Docker en Windows/Mac) y en producción (VPS Linux).
 * 
 * Uso:
 *   node scripts/migrate.js
 *   npm run db:migrate
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.resolve(__dirname, '../docker/migrations');

// Configuración de conexión flexible (Soporta Docker, VPS, Supabase o Local)
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.POSTGRES_USER || 'eklipse_admin'}:${process.env.POSTGRES_PASSWORD || 'eklipse_secret_pass_local'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'eklipse_funded'}`;

const appName = process.env.VITE_APP_NAME || 'Prop Firm Platform';

console.log('\n===============================================================');
console.log(`⚡ ${appName.toUpperCase()} — MIGRATION RUNNER INSTITUCIONAL`);
console.log('===============================================================');
console.log(`• Conexión: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
console.log(`• Directorio: ${MIGRATIONS_DIR}`);

const pool = new pg.Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    // 1. Asegurar tabla de control de migraciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS public._migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Obtener migraciones ya aplicadas
    const { rows: appliedRows } = await client.query(`SELECT name FROM public._migrations ORDER BY id ASC;`);
    const appliedSet = new Set(appliedRows.map(r => r.name));

    // 3. Leer archivos en docker/migrations/ ordenados alfabéticamente
    const allFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    console.log(`• Total migraciones encontradas: ${allFiles.length}`);

    let appliedCount = 0;
    for (const file of allFiles) {
      if (appliedSet.has(file)) {
        console.log(`  \x1b[32m✔ [APLICADA]\x1b[0m ${file}`);
        continue;
      }

      console.log(`  \x1b[33m⏳ [APLICANDO]\x1b[0m ${file}...`);
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');

      // Ejecutar en bloque transaccional
      await client.query('BEGIN');
      try {
        await client.query(sqlContent);
        await client.query(
          `INSERT INTO public._migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
          [file]
        );
        await client.query('COMMIT');
        console.log(`  \x1b[32m✔ [EXITO]\x1b[0m ${file} migrada correctamente.`);
        appliedCount++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  \x1b[31m✖ [FALLO]\x1b[0m Error en migración ${file}:`, err.message);
        throw err;
      }
    }

    console.log(`\n===============================================================`);
    if (appliedCount === 0) {
      console.log(`✅ Base de datos al día. Cero migraciones pendientes.`);
    } else {
      console.log(`✅ Se aplicaron ${appliedCount} nuevas migraciones exitosamente.`);
    }
    console.log(`===============================================================\n`);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('\n❌ ERROR FATAL EN MIGRACIÓN:', err.message);
  process.exit(1);
});
