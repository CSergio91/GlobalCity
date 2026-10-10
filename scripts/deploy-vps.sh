#!/bin/bash
# ============================================================================
# EKLIPSE FUNDED — VPS 1-CLICK DEPLOYMENT SCRIPT
# ============================================================================
# Despliega la infraestructura completa de Eklipse Funded en un servidor VPS
# (Ubuntu 22.04 / 24.04 LTS o Debian 12) con Docker Compose y migraciones automáticas.
#
# Uso en VPS:
#   chmod +x scripts/deploy-vps.sh
#   ./scripts/deploy-vps.sh
# ============================================================================

set -e

echo "==============================================================="
echo "🌘 EKLIPSE FUNDED — DESPLIEGUE EN VPS INSTITUCIONAL"
echo "==============================================================="

# 1. Comprobar Docker
if ! command -v docker &> /dev/null; then
    echo "⚙️ Docker no detectado. Instalando Docker Engine oficial..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm -f get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo "✔ Docker instalado con éxito."
fi

# 2. Comprobar Docker Compose
if ! docker compose version &> /dev/null; then
    echo "⚙️ Instalando plugin docker-compose..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

# 3. Configurar entorno (.env)
if [ ! -f .env ]; then
    echo "⚙️ Creando archivo .env a partir de .env.example..."
    cp .env.example .env
    # Generar contraseñas seguras aleatorias
    DB_PASS=$(openssl rand -hex 16)
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i "s/eklipse_secret_pass_local/${DB_PASS}/g" .env
    sed -i "s/PORT_SERVER=8088/PORT_SERVER=8080/g" .env
    sed -i "s/PORT_WEB=3180/PORT_WEB=80/g" .env
    if command -v node &> /dev/null; then
        node scripts/generateKeys.js "${JWT_SECRET}" --write-env
    fi
    echo "✔ Claves criptográficas generadas para el VPS."
fi

# 4. Levantar Servicios
echo "🚀 Levantando servicios institucionales con Docker Compose..."
docker compose pull eklipse-db eklipse-redis eklipse-api eklipse-auth eklipse-gateway || true
docker compose build
docker compose up -d

# 5. Esperar a que la base de datos esté lista
echo "⏳ Esperando disponibilidad de PostgreSQL..."
until docker compose exec -T eklipse-db pg_isready -U eklipse_admin -d eklipse_funded &> /dev/null; do
    sleep 2
done

# 6. Ejecutar Migraciones SQL
echo "⚡ Ejecutando migraciones de base de datos..."
docker compose exec -T eklipse-db sh -c "export PGPASSWORD=eklipse_secret_pass_local; for f in /docker-entrypoint-initdb.d/*.sql; do psql -U eklipse_admin -d eklipse_funded -f \"\$f\" || true; done"

echo ""
echo "==============================================================="
echo "✅ DESPLIEGUE COMPLETADO CON ÉXITO EN EL VPS"
echo "==============================================================="
echo "• Web Terminal & CRM  : http://$(curl -s ifconfig.me):80"
echo "• WebSocket & Server  : http://$(curl -s ifconfig.me):8080"
echo "• Supabase Auth (GoTrue): http://$(curl -s ifconfig.me):54321/auth/v1"
echo "• Supabase REST API   : http://$(curl -s ifconfig.me):54321/rest/v1"
echo "• PostgreSQL          : puerto 5432"
echo "• Redis Clúster       : puerto 6379"
echo "==============================================================="
