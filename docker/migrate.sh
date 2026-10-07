#!/bin/bash
# ============================================================================
# EKLIPSE FUNDED — VPS & LINUX MIGRATION RUNNER
# ============================================================================
# Aplica todas las migraciones SQL pendientes en la base de datos PostgreSQL.
# Compatible con Ubuntu, Debian, Alpine y contenedores Docker.
# ============================================================================

set -e

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-eklipse_funded}"
DB_USER="${POSTGRES_USER:-eklipse_admin}"
DB_PASS="${POSTGRES_PASSWORD:-eklipse_secret_pass_local}"

MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/migrations" && pwd)"

echo "==============================================================="
echo "⚡ EKLIPSE FUNDED — VPS MIGRATIONS RUNNER"
echo "==============================================================="
echo "• Base de datos : ${DB_NAME} en ${DB_HOST}:${DB_PORT}"
echo "• Directorio    : ${MIGRATIONS_DIR}"

export PGPASSWORD="${DB_PASS}"

# Crear tabla de control si no existe
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 <<-EOSQL
  CREATE TABLE IF NOT EXISTS public._migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW()
  );
EOSQL

# Iterar sobre archivos .sql ordenados alfabéticamente
for file in $(ls "${MIGRATIONS_DIR}"/*.sql | sort); do
  filename=$(basename "$file")
  
  # Verificar si ya fue aplicada
  already_applied=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -A -c "SELECT count(*) FROM public._migrations WHERE name = '${filename}';")
  
  if [ "$already_applied" -ge 1 ]; then
    echo "  ✔ [APLICADA] ${filename}"
  else
    echo "  ⏳ [APLICANDO] ${filename}..."
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 -f "$file"
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 -c "INSERT INTO public._migrations (name) VALUES ('${filename}') ON CONFLICT (name) DO NOTHING;"
    echo "  ✔ [EXITO] ${filename} aplicada correctamente."
  fi
done

echo "==============================================================="
echo "✅ Migraciones completadas con éxito."
echo "==============================================================="
