# 🌘 Eklipse Funded — Institutional Crypto & Multi-Asset Prop Trading OS

[![Status](https://img.shields.io/badge/Status-Production%20Ready-00F59B?style=for-the-badge)](https://github.com/CSergio91/GlobalCity)
[![Docker](https://img.shields.io/badge/Docker-Postgres%2016%20%7C%20Redis%207%20%7C%20PostgREST-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Trading Engine](https://img.shields.io/badge/Trading%20Engine-Pre--Trade%20Risk%20%3C1ms-F59E0B?style=for-the-badge)](./src/core/trading/)
[![Engine](https://img.shields.io/badge/Charts-KLineCharts%20v10%20Canvas%20GPU-blueviolet?style=for-the-badge)](https://klinecharts.com/)

> **Eklipse Funded** es una plataforma de operaciones institucional para Empresas de Fondeo (*Prop Trading Firms*) Cripto y Multiactivo con terminal propia acelerada por GPU a 60 FPS, modelos de evaluación (*1 Paso, 2 Pasos e Instant Funding*), gestión de ratios de reparto (*35/50/80/90%*), motor de riesgo pre-trade síncrono en sub-1ms y conectividad API directa con libros de órdenes reales (Binance, Bybit Broker v5, OKX DMA e Hyperliquid L1).

---

## 📑 Tabla de Contenidos
1. [Arquitectura del Sistema](#1-arquitectura-del-sistema)
2. [Topología de Contenedores Docker](#2-topología-de-contenedores-docker)
3. [Requisitos Previos del Entorno](#3-requisitos-previos-del-entorno)
4. [Instalación de Dependencias](#4-instalación-de-dependencias)
5. [Infraestructura Docker y Supabase Local](#5-infraestructura-docker-y-supabase-local)
   - [Mapeo de Puertos y Servicios](#51-mapeo-de-puertos-y-servicios)
   - [Arranque de la Pila de Contenedores](#52-arranque-de-la-pila-de-contenedores)
   - [Verificación de Servicios y Healthchecks](#53-verificación-de-servicios-y-healthchecks)
6. [Sistema Automatizado de Migraciones SQL](#6-sistema-automatizado-de-migraciones-sql)
   - [Catálogo de Migraciones Versionadas (`docker/migrations/`)](#61-catálogo-de-migraciones-versionadas)
   - [Cómo Funcionan en el Primer Arranque](#62-cómo-funcionan-en-el-primer-arranque)
   - [Migraciones Incrementales en Caliente (`npm run db:migrate`)](#63-migraciones-incrementales-en-caliente)
   - [Replicabilidad Idéntica en VPS de Producción](#64-replicabilidad-idéntica-en-vps-de-producción)
7. [Despliegue 1-Click en VPS (Ubuntu / Debian)](#7-despliegue-1-click-en-vps-ubuntu--debian)
8. [Alternativa: Base de Datos en la Nube (Supabase Cloud)](#8-alternativa-base-de-datos-en-la-nube-supabase-cloud)
9. [Arranque de Servidores en Desarrollo Local](#9-arranque-de-servidores-en-desarrollo-local)
10. [Motor de Riesgo y Reglas Pre-Trade](#10-motor-de-riesgo-y-reglas-pre-trade)
11. [Catálogo de Skills para Agentes de IA](#11-catálogo-de-skills-para-agentes-de-ia)

---

## 1. Arquitectura del Sistema

El ecosistema está estructurado bajo el estándar de arquitectura limpia hexagonal:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EKLIPSE FUNDED TERMINAL & CRM                         │
│   (Vite + React 19 + Tailwind v4 + KLineCharts v10 GPU Canvas + Motion)     │
└──────────────┬──────────────────────────────┬───────────────────────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────────────────────┐
│      NEXUS CRM / ERP         │ │    PRE-TRADE RISK PIPELINE (<1ms en RAM)   │
│  Gestión de Desafíos, Cuentas│ │  Daily Loss, Drawdown, SL Obligatorio,     │
│  Auditoría Forense y Splits  │ │  Microscalping, Anti-Hedging, Payouts      │
└──────────────┬───────────────┘ └────────────────────┬───────────────────────┘
               │                                      │
               ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 INFRAESTRUCTURA DE CONTENEDORES DOCKER                      │
│                                                                             │
│  • eklipse_supabase_gateway (54321) : API Gateway Nginx (Paridad Supabase) │
│  • eklipse_trading_server   (8088)  : WebSocket Gateway + Risk Daemon en RAM│
│  • eklipse_postgrest        (3000)  : Motor REST relacional sobre Postgres │
│  • eklipse_redis            (6379)  : In-Memory Bus + Hot State + AOF       │
│  • eklipse_postgres         (5432)  : PostgreSQL 16 con Esquema DDL y Seeds │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Topología de Contenedores Docker

La plataforma corre sobre una red privada aislada (`eklipse_net`) con 5 servicios complementarios:

```text
                                [ CLIENTES / FRONTEND ]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  │                                               │
      Peticiones REST a BD                            Peticiones WebSocket / Ticks
                  │                                               │
                  ▼ (Puerto 54321)                                ▼ (Puerto 8088 / 8080)
      ┌────────────────────────┐                      ┌────────────────────────┐
      │ eklipse_supabase_gate  │                      │ eklipse_trading_server │
      │     (Nginx Proxy)      │                      │ (WS Hub & Risk Daemon) │
      └───────────┬────────────┘                      └───────────┬────────────┘
                  │                                               │
                  │ Reenvía /rest/v1/*                            │
                  ▼                                               ▼
      ┌────────────────────────┐                      ┌────────────────────────┐
      │   eklipse_postgrest    │                      │     eklipse_redis      │
      │  (PostgREST REST API)  │                      │  (Redis 7.2 In-Memory) │
      └───────────┬────────────┘                      └────────────────────────┘
                  │                                               ▲
                  │ Pool SQL                                      │ Sincroniza estado
                  ▼                                               │ caliente y reglas
      ┌───────────────────────────────────────────────────────────┴────────────┐
      │                        eklipse_postgres                                │
      │             (PostgreSQL 16 Alpine + Migraciones DDL)                   │
      └────────────────────────────────────────────────────────────────────────┘
```

### ¿Por qué existe `eklipse_supabase_gateway`?
El SDK oficial `@supabase/supabase-js` envía sus peticiones HTTP al prefijo `/rest/v1/<tabla>`. PostgREST por defecto escucha en la raíz `/<tabla>`.
El proxy `eklipse-gateway` (Nginx):
1. **Reescribe transparentemente** las peticiones `/rest/v1/*` hacia PostgREST en tiempo cero.
2. Inyecta **cabeceras CORS universales** para evitar bloqueos en el navegador del trader.
3. Permite que la aplicación funcione en local **con paridad 1:1 idéntica a Supabase Cloud**, sin pagar servidores externos y sin modificar una sola línea de código frontend.

---

## 3. Requisitos Previos del Entorno

* **Node.js:** Versión 20.x, 22.x o 24.x LTS.
* **npm** o **pnpm**.
* **Docker Desktop** (en Windows requiere **WSL 2** habilitado).
* **Git**.

### 3.1. Actualización de WSL 2 en Windows (Si aplica)
Si al abrir **Docker Desktop** recibes el aviso *"WSL needs updating: Your version of Windows Subsystem for Linux (WSL) is too old"*, ejecuta en una terminal de PowerShell como administrador:

```powershell
wsl --update
```
Una vez actualizado, pulsa **"Try Again"** en Docker Desktop.

---

## 4. Instalación de Dependencias

```bash
git clone https://github.com/CSergio91/GlobalCity.git
cd "Eklipse Funded"
npm install
```

---

## 5. Infraestructura Docker y Supabase Local

### 5.1. Mapeo de Puertos y Servicios

| Servicio Docker | Contenedor | Puerto Host | Puerto Interno | Función |
| :--- | :--- | :--- | :--- | :--- |
| **eklipse-db** | `eklipse_postgres` | `5432` | `5432` | Base de datos relacional PostgreSQL 16 con 8+ tablas institucionales. |
| **eklipse-redis** | `eklipse_redis` | `6379` | `6379` | Bus en memoria para locks de idempotencia, pub/sub y caché de ticks. |
| **eklipse-api** | `eklipse_postgrest` | *Interno* | `3000` | Motor REST de PostgREST sobre PostgreSQL. |
| **eklipse-gateway** | `eklipse_supabase_gateway` | **`54321`** | `54321` | Gateway Nginx compatible con `@supabase/supabase-js` (`/rest/v1`). |
| **eklipse-server** | `eklipse_trading_server` | **`8088`** | `8080` | Servidor WebSocket de órdenes, telemetría y Risk Daemon en RAM. |
| **eklipse-web** | `eklipse_web_frontend` | `3180` | `80` | Frontend web en producción con Nginx y caché inmutable (perfil `production`). |

> **Nota sobre puertos:** El servidor Node corre en el host en el puerto **`8088`** (`8088:8080`) para evitar colisiones si tienes ZYTI Trade corriendo en el puerto 8080. En el VPS, configurando `PORT_SERVER=8080` en el archivo `.env`, se enlaza directamente a 8080.

---

### 5.2. Arranque de la Pila de Contenedores

Levanta el stack central (Postgres, Redis, PostgREST, Supabase Gateway y Servidor de Trading):

```bash
npm run docker:up
# o directamente:
docker compose up -d
```

Para detener los servicios:
```bash
npm run docker:down
```

Para consultar los logs en vivo:
```bash
npm run docker:logs
```

---

### 5.3. Verificación de Servicios y Healthchecks

Comprueba que todos los contenedores están en estado **healthy**:

```bash
docker compose ps
```

Salida esperada:
```text
NAME                       IMAGE                          STATUS                  PORTS
eklipse_postgres           postgres:16-alpine             Up (healthy)            0.0.0.0:5432->5432/tcp
eklipse_redis              redis:7.2-alpine               Up (healthy)            0.0.0.0:6379->6379/tcp
eklipse_postgrest          postgrest/postgrest:v12.2.0    Up                      3000/tcp
eklipse_supabase_gateway   nginx:alpine                   Up (healthy)            0.0.0.0:54321->54321/tcp
eklipse_trading_server     eklipsefunded-eklipse-server   Up (healthy)            0.0.0.0:8088->8080/tcp
```

Prueba los endpoints HTTP con `curl` o desde el navegador:

```bash
# 1. Healthcheck del Servidor de Trading y Risk Engine
curl http://localhost:8088/health

# 2. Healthcheck del Gateway Supabase Local
curl http://localhost:54321/health

# 3. Consulta de Empresas de Fondeo vía Supabase REST
curl http://localhost:54321/rest/v1/prop_firms

# 4. Consulta de Cuentas de Trading Demo y Evaluaciones
curl http://localhost:54321/rest/v1/trading_accounts
```

---

## 6. Sistema Automatizado de Migraciones SQL

### 6.1. Catálogo de Migraciones Versionadas

Todas las migraciones residen en el directorio [`docker/migrations/`](./docker/migrations/):

| Archivo | Contenido y Función |
| :--- | :--- |
| **`01_schema.sql`** | Crea la extensión `pgcrypto` y las 8 tablas relacionales centrales (`prop_firms`, `profiles`, `risk_rule_configs`, `trading_accounts`, `account_trades`, `equity_snapshots`, `api_credentials`, `risk_audit_events`), índices B-Tree y RLS. |
| **`02_roles_and_permissions.sql`** | Crea los roles nativos de Supabase (`anon`, `authenticated`, `service_role`) y otorga los privilegios necesarios a PostgREST. |
| **`03_seeds.sql`** | Inserta de forma idempotente (`ON CONFLICT DO UPDATE`) la firma matriz *Eklipse Funded*, los 3 modelos de reto (1 Paso 100K, 2 Pasos 100K e Instant Funding 50K) y la cuenta demo oficial `EKL-100K-DEMO`. |
| **`04_payouts_and_governance.sql`** | Crea la tabla de control `public._migrations` y la tabla institucional `public.payout_requests` para auditoría de retiros, regla de consistencia del 40% y hash de transacciones en blockchain. |

---

### 6.2. Cómo Funcionan en el Primer Arranque

En [`docker-compose.yml`](./docker-compose.yml), el directorio `./docker/migrations` está montado como volumen de solo lectura en `/docker-entrypoint-initdb.d`:

```yaml
volumes:
  - eklipse_pg_data:/var/lib/postgresql/data
  - ./docker/migrations:/docker-entrypoint-initdb.d:ro
```

Cuando PostgreSQL arranca por primera vez sobre un volumen vacío, el motor interno de Docker ejecuta automáticamente todos los archivos `.sql` en **orden alfabético estricto**.

---

### 6.3. Migraciones Incrementales en Caliente (`npm run db:migrate`)

> ⚠️ **Principio de Continuidad de Datos:** Cuando un contenedor de PostgreSQL ya tiene un volumen con datos creados (tanto en tu máquina como en el VPS), Docker **NO** vuelve a ejecutar los archivos de `/docker-entrypoint-initdb.d`.

Para aplicar nuevas migraciones en bases de datos que ya tienen datos sin borrar nada ni perder cuentas de usuarios, el proyecto cuenta con el ejecutor inteligente [`scripts/migrate.js`](./scripts/migrate.js):

```bash
npm run db:migrate
```

**Mecánica de Ejecución:**
1. Lee la tabla `public._migrations`.
2. Detecta qué archivos de `docker/migrations/` aún no han sido aplicados.
3. Ejecuta cada nueva migración dentro de una **transacción SQL atómica** (`BEGIN ... COMMIT`). Si falla, hace `ROLLBACK` y protege la base de datos.
4. Registra el nombre de la migración para que nunca se repita.

Salida del comando:
```text
===============================================================
⚡ EKLIPSE FUNDED — MIGRATION RUNNER INSTITUCIONAL
===============================================================
• Total migraciones encontradas: 4
  ✔ [APLICADA] 01_schema.sql
  ✔ [APLICADA] 02_roles_and_permissions.sql
  ✔ [APLICADA] 03_seeds.sql
  ✔ [APLICADA] 04_payouts_and_governance.sql

===============================================================
✅ Base de datos al día. Cero migraciones pendientes.
===============================================================
```

---

### 6.4. Replicabilidad Idéntica en VPS de Producción

Para servidores Linux donde prefieras ejecutar sin Node.js en el host, se incluye el script Bash [`docker/migrate.sh`](./docker/migrate.sh):

```bash
chmod +x docker/migrate.sh
./docker/migrate.sh
```

---

## 7. Despliegue 1-Click en VPS (Ubuntu / Debian)

El repositorio incluye el script de auto-aprovisionamiento [`scripts/deploy-vps.sh`](./scripts/deploy-vps.sh):

```bash
# 1. En el VPS remoto (Ubuntu 22.04 / 24.04 o Debian 12):
git clone https://github.com/CSergio91/GlobalCity.git
cd "Eklipse Funded"

# 2. Ejecutar el asistente de despliegue:
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh
```

**Qué hace automáticamente el script:**
1. Instala Docker Engine y el plugin Docker Compose oficial si no existen.
2. Genera un archivo `.env` con contraseñas criptográficas seguras y secretos JWT de 32 bytes únicos para el VPS.
3. Descarga las imágenes y levanta todos los contenedores en segundo plano.
4. Aplica todas las migraciones SQL en PostgreSQL.
5. Muestra en pantalla las URLs públicas listas para usar con SSL o reverse proxy.

---

## 8. Alternativa: Base de Datos en la Nube (Supabase Cloud)

Si deseas conectar el sistema con Supabase Cloud en lugar del Docker local:

1. Ingresa a tu panel en [Supabase Console](https://supabase.com/dashboard).
2. Abre la sección **SQL Editor**.
3. Copia el contenido íntegro del archivo [`supabase/prop_firm_complete_schema_init.sql`](./supabase/prop_firm_complete_schema_init.sql) y pulsa **Run**.
4. Edita tu archivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_publica
   ```

---

## 9. Arranque de Servidores en Desarrollo Local

### 🌐 Frontend (Terminal Propia & Nexus CRM)
El frontend corre en el puerto **`3100`** para coexistir pacíficamente con ZYTI Trade:

```bash
npm run dev
```
Accede desde tu navegador en:
👉 **`http://localhost:3100/`**

### ⚡ Backend Transaccional & Centinela de Riesgo en RAM
Para arrancar el servidor fuera de Docker directamente en Node:

```bash
npm run server
```
* **Puerto:** `8080` (o `8088` si corre en Docker).
* **Cron de Fin de Semana:** Se ejecuta cada 30 segundos. Si `weekendHoldingAllowed: false`, los viernes a las 20:55 UTC liquida y cierra automáticamente las posiciones abiertas bajo el código `WEEKEND_HOLDING_AUTO_CLOSE`.

### 🛡️ Verificación y Compilación
```bash
# Comprobación de tipos TypeScript estricta
npm run lint

# Compilación optimizada para producción
npm run build
```

---

## 10. Motor de Riesgo y Reglas Pre-Trade

El motor evalúa **15 reglas modulares** en sub-1ms antes de despachar cualquier orden al OMS:

| Regla | Archivo | Descripción |
| :--- | :--- | :--- |
| **Daily Loss Limit** | [`DailyLossLimitRule.ts`](./src/core/trading/rules/DailyLossLimitRule.ts) | Bloquea órdenes si las pérdidas del día superan el umbral límite (5%). |
| **Max Loss / Drawdown** | [`MaxLossLimitRule.ts`](./src/core/trading/rules/MaxLossLimitRule.ts) | Evalúa Trailing Equity y EOD Drawdown total permitido (10%). |
| **Stop Loss Obligatorio** | [`MandatoryStopLossRule.ts`](./src/core/trading/rules/MandatoryStopLossRule.ts) | Rechaza la orden si no define un nivel de SL válido. |
| **Anti-Hedging** | [`AntiHedgingRule.ts`](./src/core/trading/rules/AntiHedgingRule.ts) | Prohíbe posiciones simultáneas contrarias (Long/Short) en el mismo par. |
| **Weekend Holding** | [`WeekendHoldingRule.ts`](./src/core/trading/rules/WeekendHoldingRule.ts) | Impide mantener posiciones abiertas durante el cierre de fin de semana. |
| **Microscalping** | [`MicroscalpingRule.ts`](./src/core/trading/rules/MicroscalpingRule.ts) | Exige duración mínima de cada operación (ej. 15s). |
| **Consistency Rule** | [`ConsistencyRule.ts`](./src/core/trading/rules/ConsistencyRule.ts) | Exige que ningún día concentre más del 40% del profit total del reto. |
| **Max Positions/Symbol** | [`MaxPositionsPerSymbolRule.ts`](./src/core/trading/rules/MaxPositionsPerSymbolRule.ts) | Limita la sobreexposición en un mismo activo. |
| **Available Margin** | [`AvailableMarginRule.ts`](./src/core/trading/rules/AvailableMarginRule.ts) | Comprueba margen disponible y apalancamiento permitido. |
| **Order Frequency** | [`OrderFrequencyRule.ts`](./src/core/trading/rules/OrderFrequencyRule.ts) | Protección contra spam HFT y ataques de concurrencia. |

---

## 11. Catálogo de Skills para Agentes de IA

Ubicadas en el directorio [`.agents/skills/`](./.agents/skills/):

* **`zyti-prop-firm-api-and-risk-gateway`**: Arquitectura integral de la pasarela B2B de ZYTI Trade para Empresas de Fondeo.
* **`global-city-architecture-and-engineering`**: Fuente de verdad arquitectónica del Core desacoplado.
* **`crypto-prop-firm-operations-and-venues`**: Conectividad Bybit Broker v5, OKX DMA e Hyperliquid L1.
* **`prop-firm-risk-and-financial-governance`**: Modelado de unit economics, reservas y solvencia $\ge 2.0$.
* **`trading-engine-oms-ems-risk`**: Orquestación OMS/EMS, idempotencia con Redis NX y Smart Order Router.
* **`klinechart-financial-engine-and-backtesting`**: Ciclo de vida Canvas KLineCharts v10 a 60 FPS sin polling.
* **`trading-and-prop-firm-payment-gateways-architecture`**: Pasarelas cripto, MIDs de alto riesgo y 0% contracargos.
* **`prop-firm-legal-regulatory-and-payments`**: Marco MiCA, contratos B2B W-8BEN y cumplimiento legal.

---

## ⚖️ Licencia y Propiedad Intelectual
Plataforma privada y propietaria desarrollada para **Eklipse Funded**. Todos los derechos reservados.
