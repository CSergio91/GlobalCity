---
name: global-city-architect-and-refactor
description: SKILL SUPREMA Y PRIORITARIA DE ARQUITECTURA Y REFACTORIZACIÓN PARA GLOBAL CITY (Trading Operating System). Establece las 127 reglas inviolables de arquitectura, boundaries estrictos (Control Plane, Trading Plane, Connectivity Plane), separación frontend/backend, eliminación de secretos en browser, diseño por contratos internos y hoja de ruta de migración anti-big-bang.
version: "3.0.0"
category: "Core Architecture & Engineering Governance"
status: "Authoritative / Supreme Priority"
---

# GLOBAL CITY — ARCHITECT & REFACTOR SKILL

## 0. PROPÓSITO

Esta skill define cómo debe trabajar el agente sobre el proyecto **Global City**.

Global City NO debe tratarse como una simple aplicación React de trading.

Global City es un sistema de infraestructura financiera/trading multi-venue.

El objetivo principal de esta skill es:

1. corregir la arquitectura actual sin destruir el trabajo existente;
2. separar frontend, backend, trading core, market data y conectores;
3. eliminar dependencias directas del frontend hacia exchanges/brokers;
4. impedir que las credenciales de trading vivan en el navegador;
5. establecer una arquitectura que pueda evolucionar desde MVP hasta producción;
6. impedir que el agente añada nuevas features encima de una arquitectura incorrecta;
7. hacer que cada cambio respete contratos, boundaries y responsabilidades;
8. permitir Cloud y Self-Hosted usando el mismo Core;
9. preparar Global City para múltiples usuarios, organizaciones, cuentas, estrategias y venues;
10. mantener el producto visual actual cuando sea reutilizable.

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

# 3. ARQUITECTURA OBJETIVO

La arquitectura objetivo es:

```text
                         GLOBAL CITY

┌─────────────────────────────────────────────────────────┐
│                    CONTROL PLANE                        │
│                                                         │
│ Users / Organizations / Accounts / Connections          │
│ Permissions / Strategies / Configuration / Billing      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     TRADING PLANE                       │
│                                                         │
│ Strategy Runtime                                        │
│        ↓                                                │
│ Risk Engine                                             │
│        ↓                                                │
│ OMS                                                     │
│        ↓                                                │
│ EMS                                                     │
│        ↓                                                │
│ Smart Order Router                                      │
│        ↓                                                │
│ Portfolio / Treasury / Reconciliation                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  CONNECTIVITY PLANE                     │
│                                                         │
│ Binance / Bybit / OKX / Kraken / CCXT                   │
│ MT5 / cTrader / FIX / BlackArrow                        │
└─────────────────────────────────────────────────────────┘
```

Market data funciona como un sistema transversal:

```text
Providers -> Market Data Engine -> Normalizer -> Redis / Memory -> Strategy / Arbitrage / UI
```

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
