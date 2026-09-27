# 🗺️ GLOBAL CITY — PROGRESSIVE MIGRATION PLAN
> **Plan Maestro de Migración Anti-Big-Bang y Consolidación de Infraestructura.**
> *Regulado bajo las 127 normas de `GLOBAL CITY — ARCHITECT & REFACTOR SKILL`.*

---

## ESTRATEGIA: MIGRACIÓN PROGRESIVA SIN BIG-BANG

Bajo la **Regla 46 y 116**:
1. **NO se borra `src/`**.
2. **NO se destruye la UI existente ni los componentes visuales logrados** (`DemoTerminal`, `GlobalCityChart`, KLineChart Canvas, logos vectoriales).
3. Cada paso sigue el patrón de transición:
   $$\text{Nueva Abstracción} \longrightarrow \text{Adaptador Legacy} \longrightarrow \text{Migración del Consumidor} \longrightarrow \text{Tests} \longrightarrow \text{Eliminación de Deuda}$$

---

## FASE 0: FEATURE FREEZE & CONGELACIÓN DE BORDES
- **Goal:** Detener de inmediato la adición de nuevas funcionalidades operativas (arbitraje, copy trading, nuevos exchanges, bots de telegram o ejecución real en browser) sobre la arquitectura actual.
- **Files Involucrados:**
  - `src/services/exchangeStorage.ts` (congelado / marcado `@legacy`)
  - `src/services/realExchangeApi.ts` (congelado / marcado `@legacy`)
  - `src/services/liveMarketFeed.ts` (congelado / marcado `@legacy`)
- **Changes:**
  - Agregar anotaciones explícitas de `@legacy / MIGRATION_REQUIRED / SECURITY_RISK`.
  - Proteger los boundaries en el flujo de desarrollo.
- **Tests:** Verificación de integridad de compilación del frontend (`npm run build`).
- **Exit Criteria:** Cero nuevas dependencias de exchanges en React; equipo y agentes alineados a la skill suprema.

---

## FASE 1: BASE BACKEND (`apps/api`)
- **Goal:** Establecer el servidor backend real de Global City (Node.js/TypeScript con Fastify o Express) como Control Plane y punto de entrada seguro.
- **Files Involucrados:**
  - `apps/api/package.json`
  - `apps/api/src/server.ts`
  - `apps/api/src/routes/health.ts`
  - `docker-compose.yml`
- **Changes:**
  - Crear estructura base para el servicio de API.
  - Endpoints de salud (`/health`), información de sistema y métricas.
  - Configuración de entorno de ejecución en Docker y local.
- **Tests:** Test de respuesta HTTP 200 en endpoint de health y arranque del contenedor.
- **Exit Criteria:** Backend corriendo de forma autónoma respondiendo peticiones sin dependencias de navegador.

---

## FASE 2: PAQUETE DE CONTRATOS CANÓNICOS (`packages/contracts`)
- **Goal:** Definir los contratos, DTOs y tipos de dominio unificados compartidos entre frontend, backend, trading engine y conectores.
- **Files Involucrados:**
  - `packages/contracts/src/marketData.ts` (`NormalizedTicker`, `NormalizedCandle`, `NormalizedOrderBook`)
  - `packages/contracts/src/orders.ts` (`ExecutionIntent`, `OrderState`, `OrderSide`, `OrderType`, `Fill`)
  - `packages/contracts/src/connections.ts` (`ConnectionMetadata`, `ConnectionStatus`, `VenueType`)
  - `packages/contracts/src/risk.ts` (`RiskDecision`, `RiskCheckResult`)
- **Changes:**
  - Crear contratos formales desacoplados de APIs de terceros (sin referencias a payloads crudos de Binance).
- **Tests:** Type-check estricto de TypeScript (`tsc --noEmit`).
- **Exit Criteria:** Todos los módulos pueden importar tipos canónicos sin referenciar SDKs de exchanges.

---

## FASE 3: MARKET DATA ENGINE & FAN-OUT CENTRALIZADO
- **Goal:** Mover la ingesta y streaming de mercado fuera del navegador. Centralizar en el backend 1 única conexión upstream persistente y distribuir a N usuarios mediante WebSocket Gateway local.
- **Files Involucrados:**
  - `market-data/src/engine/MarketDataEngine.ts`
  - `market-data/src/normalizers/binanceNormalizer.ts`
  - `apps/api/src/gateway/marketDataGateway.ts`
  - `src/services/liveMarketFeed.ts` (reemplazo por cliente WS interno)
- **Changes:**
  - Ingestor en Node.js que mantiene WebSocket upstream con Binance.
  - Normalizador hacia `NormalizedTicker` y `NormalizedCandle`.
  - Gateway WebSocket en backend que emite a clientes React suscritos al símbolo.
- **Tests:** Test de latencia de normalización (< 5ms) y prueba de conexión multi-cliente sin abrir conexiones upstream adicionales.
- **Exit Criteria:** 1,000 usuarios en el frontend consumen cotizaciones en tiempo real a través de 1 única conexión a Binance.

---

## FASE 4: BACKEND CONNECTION SERVICE & SEGURIDAD DE CREDENCIALES
- **Goal:** Eliminar el almacenamiento de API keys y secrets de `localStorage`. Crear el servicio seguro de gestión de conexiones y cifrado.
- **Files Involucrados:**
  - `apps/api/src/services/credentialService.ts`
  - `apps/api/src/routes/connections.ts`
  - `src/services/exchangeStorage.ts` (sustituido por API client)
  - `supabase/migrations/00001_initial_schema.sql` (tablas `connections` y `credentials`)
- **Changes:**
  - Implementar cifrado AES-256-GCM para secrets en reposo.
  - El frontend solo envía credenciales al crear la conexión; al consultar la lista de conexiones, el backend responde exclusivamente con metadatos y máscaras (`••••••••••••`).
  - Deprecar `localStorage` para datos sensibles.
- **Tests:** Test unitario de cifrado/descifrado, test de inyección y verificación de que ningún secret sale en respuestas HTTP GET.
- **Exit Criteria:** Cero credenciales sensibles residiendo en el almacenamiento local del navegador.

---

## FASE 5: CONNECTOR LAYER & BINANCE CONNECTOR AISLADO
- **Goal:** Crear la abstracción universal `TradingConnector` e implementar el primer conector real (`BinanceConnector`) en backend con tests rigurosos.
- **Files Involucrados:**
  - `connectors/src/base/TradingConnector.ts`
  - `connectors/src/binance/BinanceConnector.ts`
  - `connectors/src/binance/binanceSigner.ts`
- **Changes:**
  - Interfaz unificada: `getMarkets`, `getTicker`, `getOrderBook`, `getBalance`, `getPositions`, `createOrder`, `cancelOrder`, `getOrder`.
  - Mover la lógica de firma HMAC SHA-256 de `realExchangeApi.ts` a `binanceSigner.ts` en backend.
- **Tests:** Contract tests automatizados simulando llamadas con mocks y endpoints de testnet.
- **Exit Criteria:** El backend puede interactuar con Binance a través de la interfaz genérica sin acoplar el Core.

---

## FASE 6: PAPER EXECUTION CONNECTOR
- **Goal:** Proporcionar un motor de simulación de ejecución en backend (`PaperExecutionConnector`) para probar todo el pipeline de órdenes sin arriesgar capital real.
- **Files Involucrados:**
  - `connectors/src/paper/PaperExecutionConnector.ts`
- **Changes:**
  - Simulación realista de fills, latencia de red, rechazos aleatorios y comisiones.
  - Clara diferenciación visual en UI (`PAPER MODE` con badges distintivos).
- **Tests:** Test de ciclo de vida completo de orden en paper execution.
- **Exit Criteria:** Posibilidad de abrir y cerrar operaciones completas en el frontend ejecutadas por el backend en modo Paper.

---

## FASE 7: RISK ENGINE (PRE-TRADE RISK VALIDATOR)
- **Goal:** Garantizar que ninguna orden pueda llegar a un exchange sin ser validada por el motor de riesgo.
- **Files Involucrados:**
  - `core/risk/RiskEngine.ts`
  - `core/risk/rules/` (`maxOrderSize`, `maxPosition`, `maxDailyLoss`, `circuitBreakers`)
- **Changes:**
  - Validación síncrona obligatoria: `ExecutionIntent -> RiskEngine.validate(intent) -> RiskDecision`.
- **Tests:** Tests unitarios de rechazo de órdenes por exceso de apalancamiento, saldo insuficiente o superación del límite diario de pérdidas.
- **Exit Criteria:** Bloqueo automático de intenciones de orden que violen las reglas de riesgo institucionales.

---

## FASE 8: OMS (ORDER MANAGEMENT SYSTEM) & RECONCILIACIÓN
- **Goal:** Implementar el gestor del ciclo de vida de órdenes con estados estrictos, asignación de `client_order_id` idempotente y manejo mandatorio de estado `UNKNOWN`.
- **Files Involucrados:**
  - `core/oms/OrderManager.ts`
  - `core/oms/orderStateTransitions.ts`
  - `core/reconciliation/ReconciliationEngine.ts`
- **Changes:**
  - Máquina de estados inmutable (`CREATED` -> `PENDING` -> `SUBMITTED` -> `ACKNOWLEDGED` -> `FILLED`).
  - Tratamiento de timeouts de red como `UNKNOWN`, disparando auditoría inmediata frente a la verdad del provider (`ReconciliationEngine`).
- **Tests:** Test de recuperación ante timeouts de red y test de idempotencia con reenvío de orden con mismo `client_order_id`.
- **Exit Criteria:** Cero duplicidad de órdenes por reintentos de red; reconciliación periódica activa.

---

## FASE 9: EMS (EXECUTION MANAGEMENT SYSTEM) & SMART ORDER ROUTER
- **Goal:** Determinar la táctica de ejecución y enrutamiento óptimo calculando el coste efectivo integral (precio + comisiones + slippage + liquidez).
- **Files Involucrados:**
  - `core/ems/ExecutionManager.ts`
  - `core/ems/SmartOrderRouter.ts`
- **Changes:**
  - Descomposición de intenciones en órdenes ejecutables por venue.
- **Tests:** Pruebas de enrutamiento basado en liquidez del order book.
- **Exit Criteria:** Enrutamiento desacoplado listo para admitir múltiples venues en paralelo.

---

## FASE 10: FRONTEND REWIRE DEFINITIVO
- **Goal:** Conectar la interfaz de usuario existente exclusivamente a la API y WebSocket Gateway de Global City, retirando todo código legacy sin alterar el diseño visual.
- **Files Involucrados:**
  - `src/services/api/GlobalCityApiClient.ts`
  - `src/hooks/useConnections.ts`
  - `src/hooks/useMarketData.ts`
  - `src/hooks/usePortfolio.ts`
  - `src/components/DemoTerminal.tsx`
  - `src/components/GlobalCityChart.tsx`
- **Changes:**
  - Sustituir llamadas a `exchangeStorage.ts` y `realExchangeApi.ts` por hooks limpios que consultan `GlobalCityApiClient`.
  - Reasignar el feed de velas de KLineChart al WebSocket Gateway de Global City.
  - Eliminar archivos marcados como `@legacy`.
- **Tests:** Suite de tests E2E y verificación en navegador de flujo fluido a 60 FPS.
- **Exit Criteria:** Cero peticiones salientes a dominios externos desde el navegador.

---

## FASE 11: VALIDACIÓN LIVE TRADING & SEGUNDO VENUE (BYBIT / MT5)
- **Goal:** Activar ejecución real bajo feature flag estricto (`LIVE_TRADING_ENABLED=true`) e incorporar un segundo venue demostrando que el Core no sufre ninguna modificación.
- **Files Involucrados:**
  - `connectors/src/bybit/BybitConnector.ts`
  - `connectors/src/mt5/MT5Connector.ts`
- **Changes:**
  - Implementar `BybitConnector` bajo la interfaz canónica `TradingConnector`.
- **Tests:** Demostración de que el OMS, Risk Engine y UI ejecutan sobre Bybit sin tocar 1 sola línea del Core.
- **Exit Criteria:** Multi-venue probado en producción cumpliendo la Regla 60: *"Si añadir un segundo provider requiere modificar Risk/OMS/Strategy: ARQUITECTURA INCORRECTA"*.
