import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ============================================================================
 * PROP FIRM TRADING PLATFORM — DATABASE DUMP / EXPORT TOOL
 * ============================================================================
 * Genera un backup portátil de la base de datos PostgreSQL desde el contenedor
 * Docker hacia la carpeta `docker/backups/`.
 * Configurable por variables de entorno (.env).
 * ============================================================================
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUPS_DIR = path.resolve(__dirname, '../docker/backups');

if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

const dbName = process.env.POSTGRES_DB || 'eklipse_funded';
const dbUser = process.env.POSTGRES_USER || 'eklipse_admin';
const containerName = process.env.DB_CONTAINER || 'eklipse_postgres';
const appName = process.env.VITE_APP_NAME || 'Prop Firm Platform';

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const timestampedFile = path.join(BACKUPS_DIR, `backup_${dbName}_${timestamp}.sql`);
const latestFile = path.join(BACKUPS_DIR, 'latest_backup.sql');
const legacyLatestFile = path.join(BACKUPS_DIR, `${dbName}_latest.sql`);

console.log('\n===============================================================');
console.log(`📦 ${appName.toUpperCase()} — EXPORTADOR DE BASE DE DATOS`);
console.log('===============================================================');
console.log(`• Base de datos : ${dbName}`);
console.log(`• Contenedor    : ${containerName}`);
console.log('• Extrayendo esquema relacional, reglas, cuentas y transacciones...');

try {
  const cmd = `docker exec ${containerName} pg_dump -U ${dbUser} -d ${dbName} --clean --if-exists`;
  const dumpSql = execSync(cmd, { maxBuffer: 100 * 1024 * 1024 });

  fs.writeFileSync(timestampedFile, dumpSql);
  fs.writeFileSync(latestFile, dumpSql);
  fs.writeFileSync(legacyLatestFile, dumpSql);

  const stats = fs.statSync(latestFile);
  const sizeKb = (stats.size / 1024).toFixed(2);

  console.log(`\n✔ Backup generado exitosamente:`);
  console.log(`  📁 Copia con Timestamp : ${path.relative(process.cwd(), timestampedFile)}`);
  console.log(`  📁 Copia Master Última : ${path.relative(process.cwd(), latestFile)}`);
  console.log(`  📊 Tamaño del volcado  : ${sizeKb} KB`);
  console.log('===============================================================\n');
  console.log('💡 Listo para migrar al VPS con un solo comando:');
  console.log('   npm run db:restore\n');
} catch (err) {
  console.error('\n❌ ERROR GENERANDO BACKUP:', err.message);
  console.error(`Verifica que el contenedor "${containerName}" esté activo con "docker ps".\n`);
  process.exit(1);
}
