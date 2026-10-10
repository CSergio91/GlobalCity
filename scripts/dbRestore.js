import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ============================================================================
 * PROP FIRM TRADING PLATFORM — DATABASE RESTORE TOOL
 * ============================================================================
 * Restaura un backup SQL completo directamente en el contenedor PostgreSQL
 * de Docker (funciona idénticamente en local y en VPS).
 * Configurable por variables de entorno (.env).
 * ============================================================================
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbName = process.env.POSTGRES_DB || 'eklipse_funded';
const dbUser = process.env.POSTGRES_USER || 'eklipse_admin';
const containerName = process.env.DB_CONTAINER || 'eklipse_postgres';
const appName = process.env.VITE_APP_NAME || 'Prop Firm Platform';

const BACKUPS_DIR = path.resolve(__dirname, '../docker/backups');
let candidateFile = path.join(BACKUPS_DIR, 'latest_backup.sql');
if (!fs.existsSync(candidateFile)) {
  candidateFile = path.join(BACKUPS_DIR, `${dbName}_latest.sql`);
}

const targetFile = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : candidateFile;

console.log('\n===============================================================');
console.log(`📥 ${appName.toUpperCase()} — RESTAURADOR DE BASE DE DATOS`);
console.log('===============================================================');
console.log(`• Base de datos : ${dbName}`);
console.log(`• Contenedor    : ${containerName}`);
console.log(`• Archivo origen: ${path.relative(process.cwd(), targetFile)}`);

if (!fs.existsSync(targetFile)) {
  console.error(`\n❌ Error: El archivo de backup no existe: ${targetFile}`);
  console.error('Genera uno primero con: npm run db:dump\n');
  process.exit(1);
}

const fileStream = fs.createReadStream(targetFile);

const psqlProcess = spawn('docker', [
  'exec',
  '-i',
  containerName,
  'psql',
  '-U',
  dbUser,
  '-d',
  dbName
], { stdio: ['pipe', 'pipe', 'pipe'] });

fileStream.pipe(psqlProcess.stdin);

let stderrData = '';
psqlProcess.stderr.on('data', (chunk) => {
  stderrData += chunk.toString();
});

psqlProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✔ Base de datos restaurada y sincronizada exitosamente.');
    console.log('• Todas las tablas, secuencias, retos y datos semillas han sido actualizados.');
    console.log('===============================================================\n');
  } else {
    console.warn(`\n⚠️ Proceso psql finalizó con código ${code}:`);
    console.warn(stderrData || 'Sin detalles adicionales.');
    console.log('===============================================================\n');
  }
});
