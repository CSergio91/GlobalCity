# 🌘 Eklipse Funded — Institutional Crypto & Multi-Asset Prop Trading OS

[![Status](https://img.shields.io/badge/Status-Production%20Ready-00F59B?style=for-the-badge)](https://github.com/CSergio91/GlobalCity)
[![Docker](https://img.shields.io/badge/Docker-Postgres%2016%20%26%20Redis%207-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Trading Engine](https://img.shields.io/badge/Trading%20Engine-Pre--Trade%20Risk%20%3C1ms-F59E0B?style=for-the-badge)](./src/core/trading/)
[![Engine](https://img.shields.io/badge/Charts-KLineCharts%20v10%20Canvas%20GPU-blueviolet?style=for-the-badge)](https://klinecharts.com/)

> **Eklipse Funded** es una plataforma de operaciones institucional para Empresas de Fondeo (*Prop Trading Firms*) Cripto y Multiactivo con terminal propia acelerada por GPU a 60 FPS, modelos de evaluación (*1 Paso, 2 Pasos e Instant Funding*), gestión de ratios de reparto (*35/50/80/90%*), motor de riesgo pre-trade síncrono en sub-1ms y conectividad API directa con libros de órdenes reales (Binance, Bybit Broker v5, OKX DMA e Hyperliquid L1).

---

## 📑 Tabla de Contenidos
1. [Arquitectura del Sistema](#1-arquitectura-del-sistema)
2. [Requisitos Previos del Entorno](#2-requisitos-previos-del-entorno)
3. [Instalación de Dependencias](#3-instalación-de-dependencias)
4. [Infraestructura Local con Docker (Base de Datos & Redis)](#4-infraestructura-local-con-docker)
   - [Actualización de WSL 2 en Windows](#41-actualización-de-wsl-2-en-windows-si-aplica)
   - [Arranque de Contenedores](#42-arranque-de-contenedores)
   - [Mecanismo Automatizado de Migraciones SQL](#43-mecanismo-automatizado-de-migraciones-sql)
   - [Verificación de Tablas en PostgreSQL](#44-verificación-de-tablas-en-postgresql)
5. [Alternativa: Base de Datos en la Nube (Supabase Cloud)](#5-alternativa-base-de-datos-en-la-nube-supabase-cloud)
6. [Arranque de Servidores y Desarrollo](#6-arranque-de-servidores-y-desarrollo)
7. [Motor de Riesgo y Reglas Pre-Trade](#7-motor-de-riesgo-y-reglas-pre-trade)
8. [Catálogo de Skills para Agentes de IA](#8-catálogo-de-skills-para-agentes-de-ia)

---

## 1. Arquitectura del Sistema

El ecosistema está desacoplado bajo el estándar de arquitectura limpia hexagonal:

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
│  Auditoría Forense y Splits  │ │  Microscalping, Anti-Hedging, etc.         │
└──────────────┬───────────────┘ └────────────────────┬───────────────────────┘
               │                                      │
               ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 INFRAESTRUCTURA Y SERVIDOR INSTITUCIONAL                    │
│                                                                             │
│  • server/tradingHub.js : Gateway WebSocket multiplexado + Fan-Out          │
│  • server/riskDaemon.js : Centinela 24/7 en RAM + Cron de Cierre Viernes    │
│  • Redis 7.2 (Docker)   : Idempotencia transaccional (NX) + Hot State       │
│  • Postgres 16 (Docker) : 8 Tablas relacionales con persistencia DDL        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requisitos Previos del Entorno

Asegúrate de contar con las siguientes herramientas instaladas:
* **Node.js:** Versión 20.x, 22.x o 24.x LTS.
* **npm** o **pnpm**.
* **Docker Desktop** (en Windows requiere **WSL 2** habilitado).
* **Git**.

---

## 3. Instalación de Dependencias

Clona el repositorio e instala los paquetes necesarios:

```bash
git clone https://github.com/CSergio91/GlobalCity.git
cd "Eklipse Funded"
npm install
```

> **Nota:** Si utilizas `pnpm`:
> ```bash
> pnpm install
> ```

---

## 4. Infraestructura Local con Docker

Para simular con total fidelidad el entorno de producción antes de desplegar en el VPS institucional, el proyecto incluye un entorno Docker orquestado mediante [`docker-compose.yml`](./docker-compose.yml).

### 4.1. Actualización de WSL 2 en Windows (Si aplica)

Si al abrir **Docker Desktop** recibes el aviso *"WSL needs updating: Your version of Windows Subsystem for Linux (WSL) is too old"*, ejecuta en una terminal de PowerShell:

```powershell
wsl --update
```

Una vez completada la instalación (debe indicar `Versión predeterminada: 2`), haz clic en el botón azul **"Try Again"** en Docker Desktop. El icono inferior izquierdo pasará a estado verde.

---

### 4.2. Arranque de Contenedores

Para levantar los servicios de infraestructura de base de datos y memoria caliente:

```bash
docker compose up -d eklipse-db eklipse-redis
```

O para compilar y levantar todo el stack incluyendo el contenedor del servidor Node:

```bash
docker compose up -d
```

Servicios desplegados:
* **`eklipse-db`** (`postgres:16-alpine`): Puerto `5432:5432`.
* **`eklipse-redis`** (`redis:7.2-alpine`): Puerto `6379:6379`.
* **`eklipse-server`** (Node.js Gateway): Puerto `8080:8080` (opcional si se ejecuta en local).

---

### 4.3. Mecanismo Automatizado de Migraciones SQL

**No necesitas ejecutar migraciones manuales.** En [`docker-compose.yml`](./docker-compose.yml), el contenedor de PostgreSQL tiene montado el script DDL institucional en su directorio de auto-inicialización:

```yaml
volumes:
  - eklipse_pg_data:/var/lib/postgresql/data
  - ./docker/init.sql:/docker-entrypoint-initdb.d/01_init.sql:ro
```

En el primer arranque, PostgreSQL ejecuta automáticamente [`docker/init.sql`](./docker/init.sql), creando:
1. **8 Tablas Relacionales:**
   * `public.prop_firms`: Registro de empresas de fondeo, tokens y webhooks.
   * `public.profiles`: Perfiles de operadores (traders), roles y Telegram ID.
   * `public.risk_rule_configs`: Parámetros de las 13 reglas dinámicas pre-trade.
   * `public.trading_accounts`: Cuentas de evaluación, fases y capital asignado.
   * `public.account_trades`: Registro forense inmutable de operaciones y órdenes.
   * `public.equity_snapshots`: Telemetría histórica de equity para cálculo de drawdowns.
   * `public.api_credentials`: Claves API cifradas de brokers/exchanges.
   * `public.risk_audit_events`: Infracciones y auditoría en tiempo real.
2. **Índices B-Tree optimizados** para búsquedas sub-milisegundo.
3. **Triggers automáticos** para actualización de marcas temporales (`updated_at`).
4. **Semillas maestras (Seed Data)** con desafíos predeterminados (1 Fase, 2 Fases, Instant Funding).

---

### 4.4. Verificación de Tablas en PostgreSQL

Puedes comprobar que las tablas se han creado y están activas ejecutando:

```bash
docker exec eklipse_postgres psql -U eklipse_admin -d eklipse_funded -c "\dt"
```

Salida esperada:
```text
                 List of relations
 Schema |       Name        | Type  |     Owner     
--------+-------------------+-------+---------------
 public | account_trades    | table | eklipse_admin
 public | api_credentials   | table | eklipse_admin
 public | equity_snapshots  | table | eklipse_admin
 public | profiles          | table | eklipse_admin
 public | prop_firms        | table | eklipse_admin
 public | risk_audit_events | table | eklipse_admin
 public | risk_rule_configs | table | eklipse_admin
 public | trading_accounts  | table | eklipse_admin
(8 rows)
```

---

## 5. Alternativa: Base de Datos en la Nube (Supabase Cloud)

Si prefieres centralizar la persistencia en Supabase Cloud para acceso desde cualquier red:

1. Ingresa a tu panel en [Supabase Console](https://supabase.com/dashboard).
2. Abre la sección **SQL Editor**.
3. Copia el contenido íntegro del archivo [`supabase/prop_firm_complete_schema_init.sql`](./supabase/prop_firm_complete_schema_init.sql) y pulsa **Run**.
4. Configura tus credenciales en el archivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_publica
   ```

---

## 6. Arranque de Servidores y Desarrollo

### 🌐 Frontend (Terminal Propia & Nexus CRM)
El frontend corre en el puerto **`3100`** para coexistir con otros servicios locales:

```bash
npm run dev
```
Accede desde tu navegador en:
👉 **`http://localhost:3100/`**

### ⚡ Backend Transaccional & Centinela de Riesgo en RAM
Para arrancar el gateway WebSocket y el motor de riesgo fuera de Docker:

```bash
npm run server
```
* **Puerto:** `8080` (WebSocket y endpoints de telemetría `/health`, `/api/crm/positions`).
* **Cron de Fin de Semana:** Ejecuta cada 30s. Si `weekendHoldingAllowed: false`, los viernes a las 20:55 UTC liquida y cierra automáticamente las posiciones abiertas bajo el código `WEEKEND_HOLDING_AUTO_CLOSE`.

### 🛡️ Verificación y Compilación de Producción
```bash
# Comprobación de tipos estricta sin emitir archivos
npm run lint

# Compilación optimizada para producción
npm run build
```

---

## 7. Motor de Riesgo y Reglas Pre-Trade

El motor compila dinámicamente **15 reglas modulares** en sub-1ms antes de despachar cualquier orden al OMS:

| Regla | Archivo | Descripción |
| :--- | :--- | :--- |
| **Daily Loss Limit** | [`DailyLossLimitRule.ts`](./src/core/trading/rules/DailyLossLimitRule.ts) | Bloquea órdenes si las pérdidas del día superan el umbral límite. |
| **Max Loss / Drawdown** | [`MaxLossLimitRule.ts`](./src/core/trading/rules/MaxLossLimitRule.ts) | Evalúa Trailing Equity y EOD Drawdown total permitido. |
| **Stop Loss Obligatorio** | [`MandatoryStopLossRule.ts`](./src/core/trading/rules/MandatoryStopLossRule.ts) | Rechaza la orden si no define un nivel de SL válido. |
| **Anti-Hedging** | [`AntiHedgingRule.ts`](./src/core/trading/rules/AntiHedgingRule.ts) | Prohíbe posiciones simultáneas contrarias (Long/Short) en el mismo par. |
| **Weekend Holding** | [`WeekendHoldingRule.ts`](./src/core/trading/rules/WeekendHoldingRule.ts) | Impide mantener posiciones abiertas durante el cierre de fin de semana. |
| **Microscalping** | [`MicroscalpingRule.ts`](./src/core/trading/rules/MicroscalpingRule.ts) | Exige duración mínima de cada operación (ej. 30s / 60s). |
| **Consistency Rule** | [`ConsistencyRule.ts`](./src/core/trading/rules/ConsistencyRule.ts) | Exige que ningún día concentre más del 40% del profit total del reto. |
| **Max Positions/Symbol** | [`MaxPositionsPerSymbolRule.ts`](./src/core/trading/rules/MaxPositionsPerSymbolRule.ts) | Limita la sobreexposición en un mismo activo. |
| **Available Margin** | [`AvailableMarginRule.ts`](./src/core/trading/rules/AvailableMarginRule.ts) | Comprueba margen disponible y apalancamiento permitido. |
| **Order Frequency** | [`OrderFrequencyRule.ts`](./src/core/trading/rules/OrderFrequencyRule.ts) | Protección contra spam HFT y ataques de concurrencia. |

---

## 8. Catálogo de Skills para Agentes de IA

Ubicadas en el directorio [`.agents/skills/`](./.agents/skills/):

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
