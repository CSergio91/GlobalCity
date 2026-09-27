# 🔍 GLOBAL CITY — ARCHITECTURE & SECURITY AUDIT
> **Documento Oficial de Auditoría Técnica y Diagnóstico de Boundaries.**
> *Regulado bajo las 127 normas de `GLOBAL CITY — ARCHITECT & REFACTOR SKILL`.*

---

## 1. ESTADO ARQUITECTÓNICO ACTUAL (AS-IS)

Actualmente, el proyecto Global City presenta una interfaz visual avanzada y de alto impacto estético (`DemoTerminal.tsx`, `GlobalCityChart.tsx` con KLineChart v10), pero arrastra vicios de arquitectura propios de un prototipo frontend client-heavy:

```
[ BROWSER (Vite / React) ]
   ├── exchangeStorage.ts       ──> Guarda API Keys y API Secrets en LocalStorage plano
   ├── realExchangeApi.ts       ──> Firma HMAC SHA256 directamente en el navegador del usuario
   ├── realKlineData.ts         ──> Peticiones REST directas a api.binance.com/api/v3/klines
   ├── liveMarketFeed.ts        ──> WebSockets directos desde el browser hacia wss://stream.binance.com
   └── positionStorage.ts       ──> Modifica LocalStorage simulando ejecuciones
```

### Diagnóstico de Madurez:
- **UI / Product Prototype:** Avanzado (Canvas KLineChart a 60 FPS, dock de trading, modal de desconexión, 44 logos vectoriales).
- **Control Plane:** Inexistente en backend (gestión de cuentas dispersa en LocalStorage).
- **Trading Plane (Risk/OMS/EMS/SOR):** No implementado en backend; simulado en cliente.
- **Connectivity Plane:** Acoplado a implementaciones directas de Binance en React.
- **Market Data Engine:** Browser client WebSocket sin fan-out ni backend normalizer.
- **Seguridad de Credenciales:** Crítica (vulnerabilidad de exposición en navegador).

---

## 2. ARQUITECTURA OBJETIVO (TO-BE)

Separación estricta en tres planos de ejecución física y un sistema transversal de Market Data:

```
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
│ OMS (Order Management System)                           │
│        ↓                                                │
│ EMS (Execution Management System)                       │
│        ↓                                                │
│ Smart Order Router (SOR)                                │
│        ↓                                                │
│ Portfolio / Treasury / Reconciliation Engine            │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  CONNECTIVITY PLANE                     │
│                                                         │
│ Binance / Bybit / OKX / Kraken / CCXT                   │
│ MT5 / cTrader / FIX / BlackArrow Connectors             │
└─────────────────────────────────────────────────────────┘

[ TRANSVERSAL: MARKET DATA ENGINE ]
Providers Upstream ──> Market Data Ingestor ──> Normalizer ──> Redis 7 ──> WebSocket Gateway ──> N Clientes UI
```

---

## 3. VIOLACIONES ARQUITECTÓNICAS IDENTIFICADAS

1. **Frontend como Trading Engine (Violación Sec. 4):**
   - El navegador ejecuta llamadas de autenticación y cálculo de firmas en `realExchangeApi.ts`.
2. **Dependencia directa de Upstream (Violación Sec. 7 & 97):**
   - El frontend abre WebSockets directos a exchanges (`liveMarketFeed.ts`). Si hay 1,000 usuarios viendo BTC/USDT, se abren 1,000 WebSockets a Binance, violando rate limits de IP institucional.
3. **Acoplamiento al modelo de datos de Binance (Violación Sec. 2 & 8):**
   - Las respuestas de la API de Binance se procesan directamente sin pasar por un modelo normalizado agnóstico (`NormalizedTicker`, `NormalizedCandle`).
4. **Falta de OMS/EMS y Risk Gates (Violación Sec. 5, 20 & 25):**
   - No existe un pipeline formal `ExecutionIntent -> Risk -> OMS -> EMS -> SOR -> Connector`.
5. **Simulación mágica en UI ("Magic Success", Violación Sec. 108 & 109):**
   - Al pulsar comprar/vender, se altera un store local sin confirmación de orden del provider ni estatus `UNKNOWN` / reconciliación.

---

## 4. VIOLACIONES CRÍTICAS DE SEGURIDAD

| Archivo / Componente | Riesgo Identificado | Clasificación | Remediación Requerida |
| :--- | :--- | :--- | :--- |
| `src/services/exchangeStorage.ts` | Almacenamiento de `apiKey` y `apiSecret` en `window.localStorage` en texto plano. XSS o extensiones maliciosas pueden exfiltrar fondos. | **CRÍTICO** | Migrar a `CredentialService` en backend (cifrado AES-256-GCM / Supabase Vault / Postgres RLS). El browser solo recibe máscara (`••••••••••••`). |
| `src/services/realExchangeApi.ts` | Generación de firma HMAC SHA-256 con Web Crypto API en el frontend. | **CRÍTICO** | Ninguna clave privada o secret debe residir en el runtime del navegador. Toda firma de orden se ejecuta exclusivamente en el backend (`apps/api`). |
| Inexistencia de Auditoría Inmutable | Los comandos de conexión y operaciones no generan `audit_logs` con `organization_id` y `user_id`. | **ALTO** | Registrar cada comando sensible con correlation IDs (`request_id`, `client_order_id`). |

---

## 5. RESPONSABILIDADES POR CAPA (BOUNDARIES)

### 5.1. Frontend (`apps/web` / `src/`)
- **PERMITIDO:**
  - Renderizado visual a 60 FPS con KLineChart y UI components.
  - Solicitar datos agregados a través de `GlobalCityApiClient`.
  - Recibir eventos reactivos vía WebSocket Gateway local de Global City.
  - Enviar intenciones/comandos de usuario (`createConnection`, `submitOrderIntent`).
  - Mostrar estados explícitos: `PAPER`, `DEMO`, `LIVE`.
- **PROHIBIDO:**
  - Firmar órdenes o almacenar secretos.
  - Conectarse directamente a Binance/Bybit/MT5/cTrader.
  - Ser fuente de verdad de saldos, posiciones o riesgo.

### 5.2. Backend & Control Plane (`apps/api`)
- Gestión de identidades, roles, permisos y organizaciones (`organization_id`).
- Custodia y rotación de credenciales cifradas (`CredentialService`).
- Endpoint REST para comandos y consultas de portafolio.
- Verificación segura de conexiones contra exchanges.

### 5.3. Trading Plane (`core/`)
- **Risk Engine:** Validación pre-trade síncrona (límites de apalancamiento, tamaño de orden, drawdown diario, circuit breakers).
- **OMS:** Máquina de estados de la orden (`CREATED` -> `PENDING` -> `SUBMITTED` -> `ACKNOWLEDGED` -> `PARTIALLY_FILLED` -> `FILLED` / `REJECTED` / `UNKNOWN`). Manejo mandatorio de `client_order_id` para idempotencia.
- **EMS & Smart Order Router:** Determinación de ejecución óptima basada en coste efectivo.
- **Reconciliation Engine:** Comparación continua de `Internal State vs Provider Truth`.

### 5.4. Connectivity Plane (`connectors/`)
- Implementación de contratos unificados (`TradingConnector`).
- Aislamiento completo de SDKs y APIs externas (CCXT, Binance native, MT5 gateway, cTrader Open API).
- El Core desconoce totalmente qué conector se está invocando.

### 5.5. Market Data Engine (`market-data/`)
- Mantiene 1 única conexión upstream por exchange/activo.
- Ingestor en memoria RAM + normalización al formato canónico (`NormalizedTicker`, `NormalizedOrderBook`, `NormalizedCandle`).
- Publicación en Redis 7 (Pub/Sub y Stream caliente) y fan-out hacia frontend.

---

## 6. CLASIFICACIÓN DE ARCHIVOS PARA MIGRACIÓN

### 6.1. Archivos a Mantener (KEEP)
- `src/components/DemoTerminal.tsx`: Excelente base visual; se despoja de lógica financiera y se reconecta a hooks.
- `src/components/GlobalCityChart.tsx`: Implementación impecable en Canvas KLineChart v10 con diccionarios y toolbars; solo se reconecta la fuente de datos.
- `src/components/PlatformLogo.tsx` / `MarketIcons.tsx`: SVGs limpios de 44 plataformas institucionales.
- `src/components/ConfirmModal.tsx`: Diálogo modal de confirmación para acciones críticas.

### 6.2. Archivos a Migrar / Adaptar (MIGRATE VIA ADAPTER)
- `src/services/realKlineData.ts`: Marcar `@legacy / MIGRATION_REQUIRED`. Reemplazar progresivamente por llamada a `/api/market-data/klines`.
- `src/services/liveMarketFeed.ts`: Marcar `@legacy / MIGRATION_REQUIRED`. Reemplazar por suscripción al WebSocket Gateway de Global City.
- `src/services/positionStorage.ts`: Marcar como `DEMO_PAPER_STORAGE`. Reemplazar por `PortfolioService` en backend.

### 6.3. Archivos a Deprecar / Eliminar en Fase Segura (DEPRECATE)
- `src/services/exchangeStorage.ts`: **SECURITY RISK**. Se sustituye por `ConnectionService` en backend.
- `src/services/realExchangeApi.ts`: **SECURITY RISK**. Se extrae su lógica hacia `connectors/binance/` en backend.

### 6.4. Nuevas Entidades y Paquetes a Crear (CREATE)
- `packages/contracts/`: Tipos compartidos (`Connection`, `NormalizedTicker`, `ExecutionIntent`, `OrderState`, `RiskDecision`).
- `core/oms/`: Lifecycle de órdenes y máquina de estados.
- `core/risk/`: Motor de riesgo pre-trade.
- `core/reconciliation/`: Motor de reconciliación de órdenes y saldos.
- `connectors/base/`: Interfaz canónica `TradingConnector`.
- `connectors/binance/`: Adaptador de Binance aislado.
- `connectors/paper/`: `PaperExecutionConnector` para pruebas seguras sin fondos reales.
- `apps/api/`: Servidor backend Node.js/TypeScript.
