---
name: global-city-architect-and-refactor
description: SKILL SUPREMA Y PRIORITARIA DE ARQUITECTURA Y REFACTORIZACIÓN PARA GLOBAL CITY FUNDING (Trading Operating System & Prop Firm Platform). Establece las 127 reglas inviolables de arquitectura, boundaries estrictos (Control Plane, Trading Plane, Connectivity Plane), motor de fondeo y simulación de primera clase, herramientas de copy trading vía API a exchanges, terminal propia y hoja de ruta a APKs oficiales.
version: "3.1.0"
category: "Core Architecture & Engineering Governance"
status: "Authoritative / Supreme Priority"
---

# GLOBAL CITY FUNDING — ARCHITECT & REFACTOR SKILL
### *Trading Operating System + Prop Firm Platform + Multi-Venue Copy Trading Tools*

## 0. PROPÓSITO Y ENFOQUE ESTRATÉGICO

Esta skill define cómo debe trabajar el agente sobre el proyecto **Global City Funding**.

Global City NO es una simple aplicación React ni un bot de trading, ni tampoco un revendedor (white-label) de MT5 o brokers de terceros.

**Global City Funding es una Empresa de Fondeo (Prop Firm) de Próxima Generación con Terminal Propia (Trading OS)**:
1. **Prioridad Estratégica #1:** Construcción y operación de **Global City Funding**, ofreciendo programas de evaluación, challenges y cuentas fondeadas operadas sobre nuestro propio motor de simulación (`SimulationExecutionProvider`) con datos reales de mercado.
2. **Terminal Propietaria (Web & APKs Oficiales):** Plataforma de trading propia (KLineChart v10 Canvas a 60 FPS) sin depender de MT5 ni de cTrader, diseñada primero para Web responsive y con hoja de ruta directa a las **APKs oficiales para Android/Mobile**.
3. **Herramientas de Exchange y Copy Trading como Servicio de Valor Añadido:** Todo el stack de conectividad con APIs de Exchanges (Binance, Bybit, Kraken) y arbitraje se integra como **herramientas internas de Global City Funding**, permitiendo a los usuarios y traders financiados **copiar operaciones en tiempo real desde el entorno de Global City hacia sus exchanges reales**.
4. **Arquitectura sin Cambios Estructurales Destructivos:** La estructura del Trading Core permanece 100% agnóstica; la empresa de fondeo es un módulo de negocio superior y los conectores a exchanges son proveedores de ejecución secundaria.

---

# 1. REGLA MÁS IMPORTANTE

## NO AÑADIR FEATURES SOBRE UNA ARQUITECTURA INCORRECTA

Antes de implementar una funcionalidad nueva, el agente debe comprobar:

* ¿Dónde pertenece esta funcionalidad?
* ¿Frontend?
* ¿Backend?
* ¿Trading Core?
* ¿Market Data Engine?
* ¿Connector?
* ¿Database?
* ¿Redis?
* ¿Worker?
* ¿Security?
* ¿Observability?

Si una funcionalidad rompe los boundaries, NO debe implementarse directamente.

Primero debe corregirse la arquitectura mínima necesaria.

---

# 2. PRINCIPIO FUNDAMENTAL

## "NUESTRO NEGOCIO POR ENCIMA DE LOS ADAPTERS"

Global City nunca debe depender directamente de:

* Binance
* Bybit
* OKX
* Kraken
* KuCoin
* Coinbase
* MT5
* MetaTrader
* cTrader
* FIX
* BlackArrow
* CCXT
* APIs concretas
* SDKs concretos

El Core de Global City debe hablar con interfaces internas.

Ejemplo:

INCORRECTO:
```text
React -> Binance API
```

INCORRECTO:
```text
Strategy -> CCXT
```

CORRECTO:
```text
Strategy -> Risk -> OMS -> EMS -> Smart Order Router -> Connector -> Provider
```

---

# 3. ARQUITECTURA OBJETIVO: TRADING OPERATING SYSTEM + PROP/FUNDING + MULTI-VENUE

Global City NO debe diseñarse como:
```text
Prop Firm -> MT5 -> Broker
```
ni como:
```text
Trading Terminal -> Binance
```

Debe diseñarse como un **TRADING OPERATING SYSTEM**:
```text
                           GLOBAL CITY
                                │
                    ┌───────────┴───────────┐
                    │                       │
                 TERMINAL                 API
                    │                       │
                    └───────────┬───────────┘
                                │
                         GLOBAL CITY CORE
                                │
        ┌───────────────┬───────┼────────┬──────────────┐
        ▼               ▼       ▼        ▼              ▼
   MARKET DATA        STRATEGY  RISK     OMS          FUNDING
        │                       │        │              │
        ▼                       └────────┼──────────────┘
      REDIS                            EMS
        │                               │
        ▼                               ▼
 REALTIME GATEWAY                EXECUTION PROVIDER
        │                               │
        ▼                 ┌─────────────┼──────────────┐
    FRONTEND              ▼             ▼              ▼
                      SIMULATED       EXCHANGE       BROKER
                          │              │              │
                          ▼              ▼              ▼
                    PROP ACCOUNTS    API ACCOUNTS   MT5/cTrader
                          │
                          ▼
                       PAYOUTS

                        SUPABASE
                           │
                           ▼
                    DURABLE SYSTEM STATE
```

La empresa de fondeo es un módulo de negocio construido sobre el mismo Trading Core. Las conexiones a exchanges/brokers son infraestructura reutilizable.

---

# 3.1. PRINCIPIO DEFINITIVO DE SEPARACIÓN DE CONCEPTOS

```text
Market Data Provider ≠ Execution Provider ≠ Trading Account ≠ Funding Account ≠ Broker ≠ Exchange ≠ Global City
```

- Global City se encuentra por encima de todos ellos.
- El negocio y el Core pertenecen a Global City.
- Los proveedores son intercambiables.
- La arquitectura no debe asumir Binance, MT5, cTrader ni ningún exchange específico como dependencia central.

---

# 3.2. MARKET DATA MULTI-VENUE INDEPENDIENTE

Binance NO es la fuente de datos exclusiva de Global City; es únicamente uno de los proveedores posibles.

```text
                    MARKET DATA
                         │
        ┌────────────────┼──────────────────┐
        │                │                  │
        ▼                ▼                  ▼
 Crypto Providers    FX Providers     Futures Providers
   (Binance/Bybit/     (Provider A/       (Provider A/
    Kraken/Coinbase)    Provider B)        Provider B)
                         │
                         ▼
                  Market Data Adapters
                         │
                         ▼
                    Normalizer
                         │
                         ▼
                Global Market Model
                         │
                         ▼
                Market Data Engine
                         │
                 ┌───────┴───────┐
                 ▼               ▼
               Redis       Candle Engine
                 │
                 ▼
         Realtime Gateway (WebSocket)
                 │
                 ▼
          Frontend / KLineChart
```

El Core nunca debe preguntar "¿Esto viene de Binance?". Recibe `MarketTick`, `MarketTrade`, `OrderBookUpdate`, `Candle`, `FundingRate`, `OpenInterest` con `venue` e `instrument` normalizados.

### Abstracción de Proveedores:
- `MarketDataProvider` (Interface base)
- `BinanceMarketDataProvider`, `BybitMarketDataProvider`, `KrakenMarketDataProvider`, `CoinbaseMarketDataProvider`
- `FXMarketDataProvider`, `FuturesMarketDataProvider`, `EquitiesMarketDataProvider`, `CFDMarketDataProvider`
- `AggregatedMarketDataProvider` (Combinación y arbitraje de fuentes)

El gráfico, AI, estrategias y Risk nunca conocen el proveedor concreto.

---

# 3.3. DUALIDAD DE ALMACENAMIENTO: REDIS (NOW) + SUPABASE POSTGRESQL (TRUTH)

- **Redis Cloud = NOW (Estado Caliente y Distribución Realtime):**
  `market state`, `tickers`, `candles`, `orderbooks`, `trades`, `venue health`, `subscriptions`, `pub/sub`, `streams`, `locks (Redlock)`, `rate limits`, `idempotency`, `temporary state`.
- **Supabase PostgreSQL = TRUTH / HISTORY (Fuente Durable ACID):**
  `organizations`, `users`, `accounts`, `instruments`, `market history`, `candles`, `trades`, `orders`, `fills`, `positions`, `balances`, `strategies`, `funding programs`, `challenges`, `evaluations`, `payouts`, `audit logs`.

> **REGLA:** Redis = NOW. PostgreSQL = HISTORY / TRUTH.
> Jamás usar Supabase Realtime como canal para cada tick de mercado (saturaría la conexión). Supabase Realtime se reserva para eventos de aplicación de baja frecuencia (`order status`, `position updates`, `funding events`).

---

# 3.4. SIMULATION ENGINE COMO CIUDADANO DE PRIMERA CLASE (PROP & PAPER)

El modelo Prop/Funding y Paper utiliza:
```text
Real Market Data -> Simulation Engine -> Virtual Account
```
No se envía la orden al mercado real.
El **Simulation Engine** debe soportar con fidelidad institucional:
- Market, Limit, Stop, Stop Loss, Take Profit
- Partial fills, Spread dinámico, Comisión configurable, Slippage realista, Latencia simulada, Gaps de sesión
- Liquidity model, Reglas de sesión horaria, Apalancamiento y Margen, Swap / Funding rates nocturnos

**Eventos Internos Idénticos:**
Genera exactamente los mismos eventos que una ejecución real:
`OrderCreated`, `OrderSubmitted`, `OrderFilled`, `PositionOpened`, `PositionUpdated`, `PositionClosed`, `PnLUpdated`.
Esto permite que la misma arquitectura sirva idénticamente para:
`PAPER` | `PROP` | `BACKTEST` | `REPLAY` | `LIVE`.

---

# 3.5. TAXONOMÍA UNIFICADA DE CUENTAS (`TradingAccount`)

Abstracción independiente de MT5/cTrader/Binance:
- `PAPER_ACCOUNT`
- `PROP_CHALLENGE`
- `PROP_VERIFICATION`
- `PROP_FUNDED`
- `EXCHANGE_ACCOUNT`
- `BROKER_ACCOUNT`
- `LIVE_ACCOUNT`

Cada cuenta gestiona: `balance`, `equity`, `margin`, `free_margin`, `positions`, `orders`, `realized_pnl`, `unrealized_pnl`, `fees`, `funding`, `drawdown`, `daily_loss`, `leverage`, `risk_limits`, `status`.

---

# 3.6. FUNDING & PROP ENGINE + FUNDING RULE ENGINE

El negocio de fondeo es un dominio de negocio sobre el Trading Core:
```text
Funding Program -> Challenge -> Evaluation -> Funded Account -> Performance -> Payout
```

Entidades Core:
`FundingProgram`, `Challenge`, `Evaluation`, `FundingAccount`, `FundingRule`, `RiskRule`, `Payout`, `TraderPerformance`, `AccountState`.

### FundingRuleEngine (Evaluación 100% en Backend):
Evalúa de forma determinista y sin interferencia del frontend:
- Profit target
- Max drawdown (Trailing / Balance / Equity based)
- Daily loss limit (calculado a medianoche UTC o hora de reset de broker)
- Max position size & Max leverage
- Minimum trading days
- Consistency rule (ningún día puede representar > X% de la ganancia total)
- News restrictions, Overnight restrictions, Weekend restrictions, Symbol restrictions

**Resultados del Engine:** `PASS` | `WARNING` | `BREACH`.

### Ciclo de Vida del Trader:
```text
CREATED -> ACTIVE -> CHALLENGE -> PASSED -> VERIFICATION -> FUNDED -> PAYOUT_ELIGIBLE -> PAYOUT -> SCALING
(Estados terminales o de excepción: FAILED | BREACHED | SUSPENDED | CLOSED)
```

---

# 3.7. TERMINAL PROPIA (KLINECHART v10 + REACT TRADING ENGINE)

Global City funciona con su **Terminal Propia**, sin depender de MT5 ni de cTrader como interfaz.
- La terminal es una vista institucional sobre Global City Core.
- El gráfico consume `MarketDataSource` (Live, Historical, Replay, Paper) a través del Realtime Gateway.
- Soporta `LIVE`, `PAPER`, `PROP`, `BACKTEST`, `REPLAY` sin alterar el componente visual ni un solo pixel.

---

# 3.8. CONECTIVIDAD MULTI-VENUE, COPY TRADING & CUENTAS EXTERNAS

Coexisten dos mundos armónicamente sobre el mismo Trading OS:
```text
                    GLOBAL CITY
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
   GLOBAL CITY ACCOUNTS          EXTERNAL ACCOUNTS
   (Simulated / Prop)            (Real API / Broker)
          │                             │
          ▼                             ▼
  Funding / Prop Platform        Trading / Copy / Arbitrage / Treasury
```

### Abstracción `ExecutionProvider`:
```text
ExecutionProvider
├── SimulationExecutionProvider (Paper / Prop / Backtest)
├── BinanceExecutionProvider
├── BybitExecutionProvider
├── cTraderExecutionProvider
├── MT5ExecutionProvider
└── FIXExecutionProvider
```

### Copy Trading Unificado:
No depende de MT5. Utiliza el pipeline `Master -> Copy Engine -> ExecutionIntent -> Risk -> OMS -> EMS -> Connector`.
Puede copiar:
- Global City (Prop/Simulated) → Global City
- Global City → Exchange API (Binance, Bybit)
- Global City → MT5 / cTrader
- Master Externo → Cuentas Global City

---

# 3.9. HOJA DE RUTA DE CONSTRUCCIÓN EN 7 FASES (ANTI-BIG-BANG)

1. **PHASE 1:** Global City Core + Market Data Abstraction + Redis + Supabase + Realtime Gateway + Own Web Terminal.
2. **PHASE 2:** Simulation Engine + Virtual Accounts + Risk Engine + OMS + PnL + Execution Simulation.
3. **PHASE 3:** Funding Engine + Challenges + Evaluations + Funding Rules + Payouts + Trader Lifecycle.
4. **PHASE 4:** External Connections + Exchange APIs (Binance/Bybit/Kraken) + cTrader + MT5 + FIX.
5. **PHASE 5:** Copy Trading + Portfolio Aggregation + Arbitrage + Rebalancing + Treasury.
6. **PHASE 6:** AI Strategy Engine + Features Extraction + Automation + Advanced Quant Analytics.
7. **PHASE 7:** Institutional Prime Brokerage & Live Infrastructure.

> **REGLA DE CONSTRUCCIÓN:** Ninguna fase debe obligar a reescribir el Core. Cada fase amplía las implementaciones de los contratos existentes (`MarketDataProvider`, `ExecutionProvider`, `TradingAccount`).

---

# 4. FRONTEND NO ES EL TRADING ENGINE

El frontend debe ser una interfaz.

NO debe:
* firmar órdenes;
* firmar HMAC;
* almacenar API secrets;
* conectarse directamente a Binance;
* conectarse directamente a Bybit;
* conectarse directamente a MT5;
* conectarse directamente a cTrader;
* ser la fuente de verdad de posiciones;
* ser la fuente de verdad de balances;
* ejecutar órdenes reales;
* calcular la autoridad final de riesgo.

El frontend puede:
* mostrar datos, pedir datos, enviar comandos, mostrar estados, posiciones, órdenes, fills, PnL, gráficos, configurar estrategias, crear conexiones, mostrar errores, health y eventos.

---

# 5. FLUJO CORRECTO DE UNA ORDEN

Toda orden real debe seguir:

```text
UI / Strategy / Telegram / API
             ↓
       Command Handler
             ↓
        Risk Engine
             ↓
            OMS
             ↓
            EMS
             ↓
    Smart Order Router
             ↓
          Connector
             ↓
       Exchange/Broker
```

Nunca:
`React -> Exchange` o `React -> CCXT` o `Strategy -> Binance SDK`.

---

# 6. EXECUTION INTENT

Strategy nunca ejecuta directamente. Produce una intención: `ExecutionIntent`.
```typescript
{
  accountId,
  symbol,
  side: "BUY",
  quantity,
  orderType: "MARKET",
  strategyId,
  reason,
  timestamp
}
```
Esto permite que Web, Telegram, API, Strategy, Copy Trading, Arbitrage y AI utilicen exactamente el mismo pipeline.

---

# 7. MARKET DATA: CERO POLLING Y FAN-OUT CENTRALIZADO

El navegador NO debe ser responsable de conectar con los exchanges para market data en producción.
```text
Binance -> Global City Market Data Engine -> Redis -> Global City WebSocket Gateway -> 1,000 usuarios
```
El Market Data Engine gestiona suscripciones, reconexión, normalización, latencia y resync.

---

# 8. MARKET DATA NORMALIZADO

El Core nunca depende del formato de un exchange. Modela:
- `NormalizedTicker`
- `NormalizedOrderBook`
- `NormalizedTrade`
- `NormalizedCandle`
- `NormalizedFundingRate`
- `NormalizedMarkPrice`

---

# 9. KLINECHART

KLineChart es una capa de visualización acelerada en Canvas HTML5. NO es Market Data ni Trading Engine ni Execution Engine.

---

# 10. HISTORICAL DATA

No solicitar klines directas desde React a endpoints REST de exchanges.
React -> Global City API -> Market Data Service -> Database / Provider.

---

# 11. CREDENCIALES: REGLA CRÍTICA DE SEGURIDAD

NUNCA almacenar API keys, API secrets, private keys, contraseñas de brokers ni credenciales de MT5 en:
- `localStorage`
- `sessionStorage`
- frontend state
- URLs
- logs
- Git
- IndexedDB inseguro

`StoredExchangeAccount` guardando secretos en `localStorage` es una deuda crítica que debe migrarse hacia `CredentialService` en backend.

---

# 12. CONNECTION MODEL & 13. CONNECTOR INTERFACE

Abstracción genérica de `Connection` separando metadatos de `credentials`.
Interfaz unificada `TradingConnector` (getMarkets, getTicker, getOrderBook, getBalance, getPositions, createOrder, cancelOrder, getOrder, subscribeMarketData).

---

# 14-19. CONECTORES (Binance, CCXT, MT5, cTrader, BlackArrow)

- CCXT e implementaciones nativas viven dentro del connector layer, nunca en el Core ni en React.
- MT5 y cTrader se integran a través de sus respectivos gateways/open APIs encapsulados.
- BlackArrow se maneja como integración B2B institucional: nunca inventar endpoints ni payloads sin documentación oficial (`TODO: provider contract required`).

---

# 20-25. OMS, UNKNOWN, CLIENT ORDER ID, EMS, SOR, RISK ENGINE

- **OMS**: Lifecycle estricto (`CREATED`, `PENDING`, `SUBMITTED`, `ACKNOWLEDGED`, `PARTIALLY_FILLED`, `FILLED`, `REJECTED`, `CANCEL_REQUESTED`, `CANCELLED`, `EXPIRED`, `UNKNOWN`).
- **UNKNOWN es obligatorio**: Timeouts de red nunca equivalen a fallo; se debe consultar y reconciliar, jamás duplicar órdenes.
- **IDs**: Toda orden debe poseer `internal_order_id`, `client_order_id` (idempotencia) y `provider_order_id`.
- **EMS & Smart Order Router**: Enrutamiento inteligente calculando coste efectivo (precio + comisiones + slippage + liquidez + latencia).
- **Risk Engine**: Validador pre-trade mandatario síncrono.

---

# 26-31. PAPER TRADING, DEMO ≠ REAL, PORTFOLIO & RECONCILIATION

- `PaperExecutionConnector` para pruebas seguras del pipeline completo.
- Distinción visual estricta en UI entre `PAPER`, `DEMO` y `LIVE`.
- Portfolio calcula balances, exposición, PnL realizado/no realizado, comisiones y funding.
- Reconciliación continua y reactiva ante reconexiones o timeouts: `Internal State VS Provider Truth`.

---

# 32-36. DATABASE (PostgreSQL/Supabase), REDIS & MULTI-TENANCY

- PostgreSQL es la fuente de verdad durable (ACID, precisión `NUMERIC(28,8)`).
- Redis es memoria caliente operativa (cache, ticker feeds, Redlock, colas, rate limiting), NO la única fuente de verdad.
- Multi-tenancy obligatorio con `organization_id` y RLS en base de datos.

---

# 37-44. TELEGRAM, COPY TRADING, ARBITRAJE, ESTRATEGIAS, IA & AGENT SKILLS

Todos estos componentes interactúan emitiendo señales o `ExecutionIntent` a través del mismo pipeline (`Risk -> OMS -> EMS -> SOR -> Connector`), sin acceso directo al provider.

---

# 45. ESTRUCTURA OBJETIVO DEL REPOSITORIO

```text
GlobalCity/
├── apps/
│   ├── web/
│   ├── api/
│   └── worker/
├── core/
│   ├── strategy/
│   ├── risk/
│   ├── oms/
│   ├── ems/
│   ├── portfolio/
│   ├── reconciliation/
│   └── execution/
├── market-data/
│   ├── engine/
│   ├── feeds/
│   ├── normalizer/
│   └── aggregation/
├── connectors/
│   ├── ccxt/
│   ├── binance/
│   ├── bybit/
│   ├── okx/
│   ├── mt5/
│   ├── ctrader/
│   └── blackarrow/
├── packages/
│   ├── types/
│   ├── contracts/
│   ├── events/
│   └── config/
├── infrastructure/
│   ├── postgres/
│   ├── redis/
│   └── monitoring/
├── agent_skills/
├── docs/
└── tests/
```

---

# 46-77. PRINCIPIOS DE MIGRACIÓN ANTI-BIG-BANG, AUDITORÍA, TESTS & SEGURIDAD

- No hacer rewrite destructivo. Conservar la UI de React envolviéndola en adaptadores limpios.
- Fases estructuradas: Freeze de features -> Base Backend -> Contratos -> Market Data -> Conexiones/Credenciales -> Conectores -> Paper Execution -> Risk -> OMS -> EMS -> Frontend Rewire -> Live Trading.
- Idempotencia estricta, Correlation IDs en logs (sin credenciales), Redlock distribuido y Architecture Unit Tests.

---

# 127. REGLA DE ORO INVIOLABLE

1. **SI EL CORE NECESITA SABER QUÉ EXCHANGE ESTÁ USANDO, EL BOUNDARY ESTÁ MAL.**
2. **SI EL FRONTEND NECESITA SABER CÓMO SE FIRMA UNA ORDEN, EL BOUNDARY ESTÁ MAL.**
3. **SI UNA ESTRATEGIA NECESITA SABER SI ES BINANCE, MT5 O CTRADER, EL BOUNDARY ESTÁ MAL.**
4. **SI REDIS ES LA ÚNICA FUENTE DE VERDAD, EL BOUNDARY ESTÁ MAL.**
5. **SI UNA ORDEN "SUCCESS" NO TIENE CONFIRMACIÓN DEL PROVIDER, EL SISTEMA ESTÁ MINTIENDO.**
6. **SI AÑADIR UN NUEVO VENUE OBLIGA A CAMBIAR EL CORE, EL DISEÑO ESTÁ MAL.**
7. **NUESTRO NEGOCIO POR ENCIMA DE LOS ADAPTERS.**
