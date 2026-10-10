# 🚀 Eklipse Funded — Guía Maestra de Base de Datos y Migración a VPS

> **ESTADO DE LA INFRAESTRUCTURA:** Base de datos PostgreSQL 16, Redis 7.2, PostgREST 12 y Gateway Nginx sincronizados y validados con paridad 1:1 local y producción.

---

## 1. Arquitectura de Datos y Paridad Local ⟷ VPS

El stack de **Eklipse Funded** está empaquetado en contenedores Docker estándar para garantizar que lo que funciona en local funcione de forma idéntica en cualquier servidor VPS Linux (Ubuntu 22.04 / 24.04 LTS o Debian 12):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EKLIPSE FUNDED ECOSYSTEM                        │
├──────────────────────────┬─────────────────────────────────────────────┤
│ Frontend Web & CRM       │ React 19 + Vite en :3100 (o Nginx en :80)   │
│ Gateway Supabase REST    │ Nginx Gateway en :54321 (CORS Universales)  │
│ PostgREST REST Engine    │ PostgREST 12 sobre PostgreSQL en :3000      │
│ Base de Datos Relacional │ PostgreSQL 16 Alpine en :5432               │
│ Caché & Locks In-Memory  │ Redis 7.2 Alpine con AOF y LRU en :6379     │
│ Trading & Risk Gateway   │ Node.js Server en :8088 / :8080             │
└──────────────────────────┴─────────────────────────────────────────────┘
```

### Tablas Institucionales Activas
1. `public._migrations`: Control determinista de migraciones versionadas.
2. `public.prop_firms`: Firma maestra Eklipse Funded y credenciales webhook.
3. `public.profiles`: Perfiles de usuarios, traders y administradores (UUID).
4. `public.risk_rule_configs`: Reglas dinámicas (Challenge 1 Paso, 2 Pasos, Instant Funding).
5. `public.trading_accounts`: Cuentas de trading fondeadas y de evaluación.
6. `public.account_trades`: Registro de posiciones abiertas y cerradas.
7. `public.equity_snapshots`: Telemetría de curva de equidad y drawdowns.
8. `public.api_credentials`: Claves de acceso B2B y agentes.
9. `public.risk_audit_events`: Auditoría forense de infracciones pre-trade y centinela.
10. `public.payout_requests`: Solicitudes de retiro de beneficios con regla de consistencia del 40%.

---

## 2. Herramientas CLI Incluidas en el Proyecto

En `package.json` dispones de los siguientes comandos directos:

| Comando | Acción |
|---|---|
| `npm run db:dump` | Exporta la base de datos completa de Docker a `docker/backups/eklipse_funded_latest.sql` con esquema y datos. |
| `npm run db:restore` | Restaura el volcado `eklipse_funded_latest.sql` en el contenedor `eklipse_postgres`. |
| `npm run db:migrate` | Aplica cualquier migración SQL nueva ubicada en `docker/migrations/` sin tocar datos existentes. |
| `npm run db:keys` | Genera o sincroniza las claves JWT (`VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). |
| `npm run docker:up` | Levanta todos los contenedores de infraestructura en segundo plano. |
| `npm run docker:down` | Detiene los contenedores preservando los volúmenes persistentes. |

---

## 3. Procedimiento de Migración a VPS en 3 Pasos

### Paso 1: Clonar el Repositorio en el Servidor VPS
Conéctate por SSH a tu VPS (ej. Ubuntu 22.04 / 24.04):
```bash
ssh root@tu-vps-ip
git clone https://github.com/tu-usuario/eklipse-funded.git /var/www/eklipse-funded
cd /var/www/eklipse-funded
```

### Paso 2: Despliegue Automático Desatendido
Ejecuta el script de aprovisionamiento 1-Click:
```bash
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh
```
El script automáticamente:
1. Instala Docker y Docker Compose si no están presentes.
2. Copia `.env.example` a `.env` con contraseñas criptográficas seguras.
3. Levanta PostgreSQL 16, Redis 7.2, PostgREST 12, Nginx Gateway y el Trading Hub.
4. Ejecuta todas las migraciones en `/docker-entrypoint-initdb.d/` (`01_schema.sql`, `02_roles_and_permissions.sql`, `03_seeds.sql`, `04_payouts_and_governance.sql`).

---

### Paso 3: (Opcional) Transferir Datos de Pruebas de Local a VPS
Si has creado cuentas de prueba, traders o configuraciones personalizadas en local y deseas pasarlas íntegras al VPS:

1. **En tu máquina local:**
   ```bash
   npm run db:dump
   ```
   *(Esto genera `docker/backups/eklipse_funded_latest.sql`)*

2. **Copiar el archivo al VPS con SCP:**
   ```bash
   scp docker/backups/eklipse_funded_latest.sql root@tu-vps-ip:/var/www/eklipse-funded/docker/backups/
   ```

3. **En el VPS:**
   ```bash
   npm run db:restore
   ```
   ¡Listo! La base de datos del VPS tendrá exactamente los mismos registros, cuentas y balances que tenías en local.

---

## 4. Conexión de Dominios y Cloudflare (Producción)

Siguiendo el estándar de seguridad `cloudflare-vps-deployment-and-security-hardening`:

1. **DNS en Cloudflare:**
   * `eklipsefunded.com` ➔ `A` ➔ `IP_DE_TU_VPS` (Proxied ☁️)
   * `api.eklipsefunded.com` ➔ `A` ➔ `IP_DE_TU_VPS` (Proxied ☁️)
   * `ws.eklipsefunded.com` ➔ `A` ➔ `IP_DE_TU_VPS` (Proxied ☁️)

2. **SSL / TLS:** Configurar modo **Full (Strict)** en Cloudflare.
3. **WebSockets:** Activar el toggle de WebSockets en la pestaña *Network* de Cloudflare.
4. **Blindaje de Origen con UFW:**
   Permitir únicamente los rangos de IP oficiales de Cloudflare y tu SSH:
   ```bash
   ufw allow 22/tcp
   # Permitir rangos de Cloudflare en puertos 80 y 443
   for ip in $(curl -s https://www.cloudflare.com/ips-v4); do ufw allow proto tcp from $ip to any port 80,443; done
   ufw enable
   ```

---

## 5. Cambio Inmediato a Otra Empresa (Marca Blanca)

Para usar este repositorio con otra marca o nombre comercial **sin tocar código**:

1. Abre tu `.env` (en local o en el VPS) y actualiza la sección de identidad:
   ```env
   VITE_APP_NAME=Mi Prop Firm
   VITE_APP_SHORT_NAME=MiProp
   VITE_SUPPORT_EMAIL=soporte@mipropfirm.com
   POSTGRES_DB=mipropfirm_db
   ```
2. La plataforma y todas las herramientas de base de datos (`npm run db:dump`, `npm run db:restore`, `npm run db:migrate`) adoptarán automáticamente la nueva configuración sin necesidad de refactorizar componentes.

