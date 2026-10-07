---
name: zyti-prop-firm-api-and-risk-gateway
description: "Arquitectura integral de la pasarela B2B de ZYTI Trade para Empresas de Fondeo: Contratos REST de aprovisionamiento de cuentas, protocolo de Webhooks HMAC-SHA256, modelo relacional PostgreSQL/Supabase multi-inquilino, Motor de Riesgo como Microservicio síncrono, y distribución Fan-Out con Redis y WebSocket Worker para una sola conexión centralizada a Binance/OKX."
version: "1.0.0"
category: "Institutional B2B Gateway & Real-Time Trading Infrastructure"
author: "ZYTI Systems & Fintech Infrastructure Architect"
status: "Authoritative / Production Standard"
---

# ZYTI Trade — Prop Firm Gateway, Real-Time Risk & Fan-Out Infrastructure

Esta skill establece el estándar técnico definitivo para interconectar **ZYTI Trade** con **Empresas de Fondeo (Prop Firms)** mediante un modelo desacoplado, escalable y reproducible en cualquier servidor con Docker.

---

## 1. Topología del Sistema: ZYTI como Plataforma Tecnológica B2B

ZYTI Trade opera como un proveedor tecnológico independiente (*Trading Platform Provider*) que no asume riesgo de capital, sino que suministra:
1. **Trading Terminal OS (Frontend KLineChart v10 GPU Canvas).**
2. **Gateway API REST & Webhooks para Empresas de Fondeo.**
3. **Servicio Central de Ingesta WebSocket Fan-Out (1 sola conexión con exchanges).**
4. **Motor de Riesgo Autónomo en Backend (Sentinela síncrono multi-inquilino).**

```text
       [ EMPRESA DE FONDEO ]
                 │
                 │ 1. POST /api/v1/accounts/provision (API Key B2B)
                 ▼
       [ ZYTI API GATEWAY ] ◄─── Auth, Rate Limit & Key Validator
                 │
                 ├──► [ POSTGRESQL / SUPABASE DB ] (Cuentas, Reglas, Órdenes)
                 │
                 ▼
       [ TRADER ENTRA A ZYTI TERMINAL ] (Vía Token SSO o Credencial)
                 │
                 │ Suscripción WS al flujo de mercado
                 ▼
     [ ZYTI WEBSOCKET GATEWAY ] ◄─── Distribuye a N clientes en memoria
                 ▲
                 │ Pub/Sub & Cache de veles y libros
                 │
       [ REDIS IN-MEMORY BUS ]
                 ▲
                 │ 1 sola conexión persistente WSS por par
                 │
   [ INGESTION WORKER CENTRAL ] ◄─── Binance / Bybit / OKX
                 │
                 ▼
   [ REAL-TIME RISK SERVICE ] (Auditoría continua de DD, PnL y Liquidación forzosa)
                 │
                 │ Evento: account.breached / account.passed
                 ▼
       [ WEBHOOK DESPATCHER ] ───► POST a Webhook URL de la Empresa de Fondeo
```

---

## 2. Modelo Relacional de Base de Datos (PostgreSQL / Supabase)

El esquema soporta múltiples empresas de fondeo de forma aislada (*Multi-Tenant*):

```sql
-- Extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. EMPRESAS DE FONDEO REGISTRADAS (CLIENTES B2B DE ZYTI)
-- ============================================================================
CREATE TABLE IF NOT EXISTS prop_firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  api_key_hash VARCHAR(255) NOT NULL UNIQUE,      -- Clave API con la que la empresa consume ZYTI
  webhook_url TEXT NOT NULL,                      -- Endpoint donde ZYTI reportará eventos en vivo
  webhook_secret VARCHAR(100) NOT NULL,           -- Clave secreta para firmar webhooks HMAC-SHA256
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. CUENTAS DE TRADING EMITIDAS A TRADERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS trading_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES prop_firms(id) ON DELETE CASCADE,
  account_number VARCHAR(50) NOT NULL UNIQUE,     -- Ej: ZYTI-50K-8492
  trader_email VARCHAR(150) NOT NULL,
  
  -- Saldos y métricas de balance
  initial_balance NUMERIC(15, 2) NOT NULL,        -- Saldo inicial del challenge (ej. 50000.00)
  current_balance NUMERIC(15, 2) NOT NULL,        -- Saldo en caja cerrado
  equity NUMERIC(15, 2) NOT NULL,                 -- Balance + PnL no realizado en vivo
  peak_equity NUMERIC(15, 2) NOT NULL,           -- High-water mark para drawdown absoluto
  daily_start_equity NUMERIC(15, 2) NOT NULL,    -- Equidad registrada a las 00:00:00 UTC
  daily_start_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Estado de la evaluación
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',   -- 'ACTIVE', 'PASSED', 'BREACHED', 'FROZEN'
  breach_reason TEXT,
  trading_days_count INT DEFAULT 0,
  last_trade_date DATE,

  -- REGLAS DINÁMICAS INYECTADAS POR LA FIRMA PARA ESTA CUENTA
  rules_config JSONB NOT NULL,
  /* Estructura de rules_config:
     {
       "maxDailyDrawdownPct": 5.0,
       "maxTotalDrawdownPct": 10.0,
       "profitTargetPct": 8.0,
       "drawdownType": "EOD" | "TRAILING_EQUITY",
       "mandatoryStopLoss": true,
       "minTradingDays": 5,
       "allowedExchanges": ["binance", "bybit"],
       "maxLeverage": 20
     }
  */

  access_token VARCHAR(255) NOT NULL UNIQUE,      -- Token SSO para login directo en el terminal
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trading_accounts_token ON trading_accounts(access_token);
CREATE INDEX idx_trading_accounts_firm ON trading_accounts(firm_id);

-- ============================================================================
-- 3. HISTÓRICO DE TRADES Y AUDITORÍA DE ÓRDENES
-- ============================================================================
CREATE TABLE IF NOT EXISTS account_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
  exchange VARCHAR(30) NOT NULL,
  symbol VARCHAR(30) NOT NULL,
  side VARCHAR(10) NOT NULL,                      -- 'LONG' | 'SHORT'
  size NUMERIC(15, 4) NOT NULL,
  leverage INT NOT NULL DEFAULT 1,
  entry_price NUMERIC(15, 2) NOT NULL,
  exit_price NUMERIC(15, 2),
  sl_price NUMERIC(15, 2),
  tp_price NUMERIC(15, 2),
  realized_pnl NUMERIC(15, 2),
  commission NUMERIC(15, 2) DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',     -- 'OPEN', 'CLOSED'
  close_reason VARCHAR(30),                       -- 'TP', 'SL', 'MANUAL', 'LIQUIDATION_BREACH'
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_account_trades_account ON account_trades(account_id);

-- ============================================================================
-- 4. CONFIGURACIÓN DINÁMICA DE REGLAS DE RIESGO (Cero valores hardcodeados)
-- ============================================================================
CREATE TABLE IF NOT EXISTS risk_rule_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID REFERENCES prop_firms(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- ej: 'Challenge Estándar 10K', 'Aggressive 50K'
  max_daily_loss_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
  max_total_drawdown_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  max_trailing_drawdown_percent NUMERIC(5, 2) DEFAULT NULL,
  drawdown_type VARCHAR(30) NOT NULL DEFAULT 'EOD', -- 'EOD' | 'TRAILING_EQUITY'
  max_leverage INT NOT NULL DEFAULT 100,
  mandatory_stop_loss BOOLEAN NOT NULL DEFAULT false,
  weekend_holding_allowed BOOLEAN NOT NULL DEFAULT true,
  consistency_rule_percent NUMERIC(5, 2) DEFAULT 40.00,
  min_trading_days INT DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risk_rule_configs_firm ON risk_rule_configs(firm_id);

-- ============================================================================
-- 5. CREDENCIALES API (EMPRESAS DE FONDEO Y AGENTES DE INTELIGENCIA ARTIFICIAL)
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  key_type VARCHAR(30) NOT NULL CHECK (key_type IN ('prop_firm', 'ai_agent', 'webhook')),
  api_key_public VARCHAR(64) UNIQUE NOT NULL, -- 'zyti_live_...' / 'zyti_agent_...'
  key_hash VARCHAR(128) NOT NULL,             -- SHA-256 del secret
  scopes TEXT[] NOT NULL DEFAULT '{}',        -- ['trade:execute', 'firm:provision']
  ip_whitelist TEXT[] DEFAULT '{}',           -- Restricción por IP para agentes de IA
  rate_limit_rpm INT DEFAULT 120,             -- Rate limit por minuto
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_credentials_public ON api_credentials(api_key_public);
```

---

## 3. Contratos de API REST de ZYTI (Para las Empresas de Fondeo)

Todas las peticiones enviadas por la empresa de fondeo a ZYTI requieren la cabecera:
```http
X-ZYTI-API-KEY: zyti_live_key_a89fbc4910294...
Content-Type: application/json
```

### A. Crear Cuenta de Trader (`POST /api/v1/accounts/provision`)
Llamado por la empresa inmediatamente después de que el trader adquiere un challenge:

**Request Payload:**
```json
{
  "traderEmail": "trader@ejemplo.com",
  "challengeId": "CHALLENGE-50K-9921",
  "initialBalance": 50000.00,
  "rules": {
    "maxDailyDrawdownPct": 5.0,
    "maxTotalDrawdownPct": 10.0,
    "profitTargetPct": 8.0,
    "drawdownType": "EOD",
    "mandatoryStopLoss": true,
    "minTradingDays": 5,
    "maxLeverage": 20
  }
}
```

**Response Payload (201 Created):**
```json
{
  "success": true,
  "accountId": "7b8c2e11-9a3d-4c5b-bc6e-34751f89dc20",
  "accountNumber": "ZYTI-50K-9921",
  "traderEmail": "trader@ejemplo.com",
  "initialBalance": 50000.00,
  "accessToken": "zyti_token_eyJhbGciOi...",
  "terminalAccessUrl": "https://trade.zyti.com/?token=zyti_token_eyJhbGciOi..."
}
```

### B. Consultar Métricas y Auditoría del Trader (`GET /api/v1/accounts/:id/metrics`)

**Response Payload (200 OK):**
```json
{
  "accountId": "7b8c2e11-9a3d-4c5b-bc6e-34751f89dc20",
  "accountNumber": "ZYTI-50K-9921",
  "status": "ACTIVE",
  "balance": 52450.00,
  "equity": 53120.00,
  "totalPnL": 2450.00,
  "totalPnLPct": 4.90,
  "dailyStartEquity": 51800.00,
  "currentDailyDrawdownPct": 0.0,
  "currentTotalDrawdownPct": 0.0,
  "tradingDaysCompleted": 3,
  "profitTargetPct": 8.0,
  "openPositionsCount": 1,
  "totalClosedTrades": 14,
  "winRatePct": 64.28
}
```

---

## 4. Protocolo de Webhooks (ZYTI ──► Empresa de Fondeo)

Cada vez que ocurre un evento de trading o de riesgo en ZYTI, el despachador de webhooks envía un `POST` con la firma HMAC-SHA256 en la cabecera `X-ZYTI-Signature`:

```typescript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', firmWebhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');
// Cabecera enviada: X-ZYTI-Signature: sha256=4f9b8c...
```

### Evento 1: Infracción de Reglas / Descalificación (`account.breached`)
Disparado instantáneamente en el sub-milisegundo en que el trader toca el límite de drawdown:

```json
{
  "event": "account.breached",
  "timestamp": "2026-10-01T18:30:00.120Z",
  "accountId": "7b8c2e11-9a3d-4c5b-bc6e-34751f89dc20",
  "accountNumber": "ZYTI-50K-9921",
  "traderEmail": "trader@ejemplo.com",
  "reason": "Vulneración de Drawdown Diario Máximo (Límite: 5.0%, Alcanzado: 5.14%)",
  "equityAtBreach": 47430.00,
  "dailyStartEquity": 50000.00,
  "openPositionsLiquidated": 2
}
```

### Evento 2: Objetivo Cumplido / Fase Superada (`account.passed`)

```json
{
  "event": "account.passed",
  "timestamp": "2026-10-01T18:30:00.120Z",
  "accountId": "7b8c2e11-9a3d-4c5b-bc6e-34751f89dc20",
  "accountNumber": "ZYTI-50K-9921",
  "traderEmail": "trader@ejemplo.com",
  "profitTargetReached": 8.12,
  "tradingDaysCompleted": 5,
  "finalEquity": 54060.00
}
```

---

## 5. Arquitectura Fan-Out con Redis: 1 Sola Conexión Centralizada a Binance

Para erradicar la saturación de IP y que **no exista 1 WebSocket abierto a Binance por cada usuario**, se implementa el patrón **Fan-Out In-Memory**:

```text
      Binance / Bybit / OKX
                │
                │ 1 conexión WSS por par
                ▼
┌──────────────────────────┐
│ CENTRAL INGESTION WORKER │
│         Node / Bun       │
└────────────┬─────────────┘
             │
             ▼
        ┌─────────┐
        │  REDIS  │
        │         │
        │  ZSET   │ ← Velas recientes
        │ Pub/Sub │ ← Ticks en vivo
        └────┬────┘
             │
     ┌───────┴───────────────┐
     ▼                       ▼
[ WS GATEWAY ]         [ RISK ENGINE ]
(Native WebSocket)     (Equity / Drawdown
     │                  en RAM)
     │                       │
     │                 Infracción / Liquidación
     │                       │
     │                     REDIS
     │                       │
     ├───────────────────────┴──────────────────────┐
     ▼                                              ▼
Trader Desktop         Trader Mobile          CRM Admin (Nexus)
```

**Ventajas Operativas:**
- Consumo constante de 1 sola conexión hacia el CEX sin importar cuántos miles de traders operen simultáneamente.
- Cero riesgo de *API ban* o baneo por exceso de sockets abiertos en Binance.
- Latencia sub-milisegundo interna gracias a Redis Pub/Sub en memoria.
- Circuito de riesgo cerrado en RAM: Liquidación y corte forzoso transmitido simultáneamente a Terminales y CRM en microsegundos.

### 5.1 Diagrama Canónico de Ejecución en Ráfaga (HFT Hot-Path)

```text
      Binance / Bybit / OKX
                │
                ▼
        CENTRAL INGESTION
                │
                ▼
              REDIS
                │
         ┌──────┴──────┐
         ▼             ▼
   MARKET EVENTS  RISK ENGINE
                       │
               ┌───────┴───────┐
               ▼               ▼
           Account A       Account B
           positions       positions
           equity          equity
           drawdown        drawdown
               │               │
               └───────┬───────┘
                       ▼
                 ORDER ENGINE
                       │
               ┌───────┴───────┐
               ▼               ▼
            Broker 1        Broker 2
```

### 5.2 Estándares Institucionales de Ejecución y Riesgo
1. **Cuenta Demo Estandarizada a 100K ($100,000 USD):**
   - Se erradica cualquier selector arbitrario de saldo en el frontend.
   - Todo nuevo trader recibe una cuenta demo oficial:
     - `initial_balance`: `$100,000.00 USD`
     - `max_daily_loss`: `5.00%` (`$5,000.00 USD`)
     - `max_total_drawdown`: `10.00%` (`$10,000.00 USD`)
     - `max_leverage`: `100x`
2. **Persistencia por Filas Individuales (Write-Behind Queue):**
   - Prohibido acumular trades dentro de un JSON monolítico. Cada trade es una fila atómica en `public.account_trades` para soportar índices B-Tree, cierres parciales y SL/TP independientes.
   - Las ráfagas (ej. 20 trades a la vez) se ejecutan en 0ms en RAM y se persisten en bloque (*Bulk Insert*) hacia Supabase sin saturar el pool de conexiones.
3. **Modelo de Apalancamiento Cripto (Cero Lotes de Forex):**
   - Tamaño = $\text{Margen USDT} \times \text{Apalancamiento} = \text{Nocional USD}$.
   - Unidades = $\text{Nocional USD} / \text{Precio de Entrada}$.

### 5.3 Gobernanza de Implementación: 1 Archivo por Regla (`src/core/trading/rules/`)

El Risk Engine (tanto en frontend como en el daemon backend) opera bajo una **arquitectura desacoplada basada en plugins (Chain of Responsibility)**:

> **PRINCIPIO ARQUITECTÓNICO FUNDAMENTAL:**
> Cada regla institucional (Pre-Trade o In-Flight) **debe residir obligatoriamente en su propio archivo independiente** dentro de `src/core/trading/rules/<RuleName>Rule.ts` implementando la interfaz `IRiskRule`.
> Queda estrictamente prohibido acumular reglas de validación en bloques switch/case gigantes o embebidas dentro de daemons o vistas.

#### Estructura Canónica de Archivos:
```text
src/core/trading/rules/
├── AllowedExchangesRule.ts          # Restricción de exchanges autorizados
├── AntiHedgingRule.ts               # Bloqueo de posiciones opuestas simultáneas
├── ConsistencyRule.ts               # Regla de consistencia (máx % beneficio en 1 día)
├── InactivityPeriodRule.ts          # Detección de cuentas inactivas
├── MandatoryStopLossRule.ts         # Exigencia obligatoria de Stop Loss al abrir orden
├── MaxDailyDrawdownRule.ts          # Límite de pérdida diaria (EOD o Trailing Equity)
├── MaxLeverageRule.ts               # Apalancamiento máximo permitido
├── MaxPositionsPerSymbolRule.ts     # Límite de exposición / operaciones por par
├── MaxTotalDrawdownRule.ts          # Drawdown total máximo
├── MaxTotalOpenPositionsRule.ts     # Límite global de operaciones abiertas concurrentes
├── MicroscalpingRule.ts             # Prohibición de trades de latencia ultra-corta (< 10s)
├── NewsTradingRule.ts               # Restricción de operaciones en ventanas de noticias de alto impacto
├── ProfitTargetRule.ts              # Detección automática de objetivo cumplido (Passed Challenge)
├── QualifiedMinTradingDaysRule.ts   # Días mínimos con umbral mínimo de ganancia/volumen
├── WeekendHoldingRule.ts            # Bloqueo de tenencia de posiciones en fin de semana
└── index.ts                         # Barrel export unificado de todas las reglas
```

#### Ciclo de Registro:
1. La regla implementa `validate(context: PreTradeContext, config: PropFirmRuleConfig): RiskValidationResult`.
2. Se exporta formalmente en `src/core/trading/rules/index.ts`.
3. `RiskEngine.createPipelineForFirm(firmConfig)` instancia e inyecta la regla en la tubería `RiskPipeline` dinámicamente según la parametrización de la empresa o challenge.
4. El backend `riskDaemon.js` y el simulador interactivo de challenges respetan y validan exactamente los mismos parámetros tipados.

---

## 6. Despliegue Local con Docker Compose (Portable 1-Click a Producción)

Para levantar Supabase/PostgreSQL y Redis en local con Docker sin instalaciones complicadas:

```yaml
version: '3.8'

services:
  # Base de Datos Relacional PostgreSQL (Supabase Compatible)
  zyti-db:
    image: postgres:16-alpine
    container_name: zyti-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: zyti_trade
      POSTGRES_USER: zyti_admin
      POSTGRES_PASSWORD: zyti_secret_pass_local
    ports:
      - "5432:5432"
    volumes:
      - zyti_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zyti_admin -d zyti_trade"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Redis en Memoria para Fan-Out y Cache de Ticks / Velas
  zyti-redis:
    image: redis:7-alpine
    container_name: zyti-redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes", "--maxmemory", "512mb", "--maxmemory-policy", "allkeys-lru"]
    ports:
      - "6379:6379"
    volumes:
      - zyti_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  zyti_pg_data:
  zyti_redis_data:
```

### Ejecución Local:
```bash
docker compose -f docker-compose.infra.yml up -d
```
Para producción en cualquier VPS (Ubuntu, Debian, AWS, Hetzner), se utiliza el mismo archivo cambiando únicamente las contraseñas en un archivo `.env`.

---

## 7. Gobernanza de Modularización y Empaquetado NPM / PNPM Package

Para evitar duplicar código entre **ZYTI Trade** y las plataformas de las Empresas de Fondeo (como **Global City Funding**):

1. **Aislamiento Funcional en Carpetas Independientes:**
   - `src/modules/crm/`: Módulo completo de CRM Institucional (KPIs, API Gateway, Monitor de Riesgo). Totalmente desacoplado del frontend comercial.
   - `src/modules/terminal/` (o `@zyti/terminal`): Núcleo de trading (KLineChart v10 Canvas, OMS, EMS, OrderForm, PositionTable).
2. **Estrategia Monorepo / Paquete Distribuible:**
   - La arquitectura permite empaquetar `@zyti/crm-admin` y `@zyti/terminal` vía `pnpm` o como paquete privado.
   - **En la Empresa de Fondeo (Global City Funding):** Se instala directamente (`pnpm add @zyti/terminal`) importando el componente `<TradingTerminal />` y pasando por props las credenciales del broker y la URL del WS Gateway. Cero necesidad de iframes frágiles ni código copiado a mano.
3. **Reutilización del Motor de Riesgo:**
   - El `TradingEngine` y `RiskEngine` son 100% agnósticos del DOM y pueden ejecutarse idénticamente en React, Web Workers o microservicios Node.js en backend.

