---
name: global-city-architecture-and-engineering
description: Fuente de verdad arquitectónica y de ingeniería de Global City (Trading Operating System). Establece el Core agnóstico desacoplado, modelos Cloud y Self-Hosted, uso intensivo de Redis para memoria caliente e idempotencia, fan-out multiplexado para alta concurrencia masiva de usuarios reales desde el día 1, OMS/EMS/SOR, Risk Engine, reconciliación y protocolos de resiliencia.
version: "2.0.0"
category: "Enterprise Fintech & Trading System Architecture"
status: "Authoritative / Baseline"
---

# Global City — Architecture & Engineering Skill
### *Trading Operating System: Principios, Límites, Infraestructura y Criterios Técnicos*

---

## 0. PROPÓSITO DE ESTA SKILL

Esta skill define la arquitectura, principios, límites y criterios técnicos del proyecto **Global City**.
Global City es una plataforma de trading multi-venue diseñada para evolucionar desde un MVP local hasta un producto **Cloud** y **Self-Hosted** de grado institucional, capaz de trabajar con múltiples exchanges, brokers, cuentas y estrategias en simultáneo.

Esta skill debe considerarse una **fuente de verdad arquitectónica**.
Antes de introducir una nueva tecnología, dependencia, broker, exchange, servicio externo o cambio estructural importante, se debe revisar esta skill y respetar rigurosamente sus principios.

---

## 1. VISIÓN DEL PRODUCTO: *Trading Operating System*

Global City **no debe construirse como un simple bot de trading**, script de arbitraje o frontend decorativo.
Debe evolucionar hacia un **Trading Operating System (TOS)** integral.

### Capacidades previstas en el roadmap:
- **Multi-Exchange** (Binance, Bybit, OKX, Bitget, Coinbase, Kraken, Hyperliquid L1, etc.)
- **Multi-Broker** (MetaTrader 4, MetaTrader 5, cTrader, FIX Protocol, BlackArrow, Tradovate, CQG, Rithmic)
- **Multi-Account** (Cuentas personales, subcuentas corporativas, cuentas segregadas de inversores)
- **Multi-Strategy** (Instancias paralelas independientes compartiendo motor de riesgo)
- **Manual Trading** (Ejecución rápida 1-click, ladders L2, tickets avanzados)
- **Algo Trading** (Ejecución cuantitativa basada en modelos estadísticos y feeds tick-by-tick)
- **Arbitrage** (Arbitraje sintético y cross-venue con modelos prefondeados)
- **Market Making** (Provisión de liquidez y gestión de inventario delta-neutral)
- **Copy Trading** (Master-to-Followers multi-broker agnóstico de latencia ultra baja)
- **Portfolio Management & Treasury** (Rebalanceo dinámico, tracking de colateral, cash management)
- **Risk Management** (Pre-Trade Risk Engine síncrono sub-milisegundo con Circuit Breakers)
- **OMS** (Order Management System con tracking integral de estados de orden)
- **EMS** (Execution Management System táctico con Smart Order Routing)
- **Reconciliation Engine** (Auditoría continua frente a la verdad del broker/exchange)
- **Dashboard & Terminal** (Frontend de alto rendimiento con renderizado a 60 FPS)
- **Telegram Integration** (Alertas, control de comando y Telegram Mini Apps)
- **Prop Firm Infrastructure** (Gestión de challenges, drawdown EOD/intradía, reglas de consistencia y provisioning)
- **Dual Deployment** (Global City Cloud y Global City Self-Hosted con el mismo Core)

> **Principio Rector:**
> **"Nuestro negocio y nuestro Core están por encima de los adapters."**
> El Core nunca debe depender directamente de Binance, Bybit, OKX, MT5, cTrader, FIX, BlackArrow u otro proveedor externo.

---

## 2. PRINCIPIOS ARQUITECTÓNICOS FUNDAMENTALES

### 2.1 Provider Agnostic
El Core no debe conocer detalles específicos de ningún proveedor de mercado o ejecución.

- **INCORRECTO:**
  $$\text{Strategy} \longrightarrow \text{Binance API}$$
- **CORRECTO:**
  $$\text{Strategy} \longrightarrow \text{Risk} \longrightarrow \text{OMS} \longrightarrow \text{EMS} \longrightarrow \text{Smart Order Router} \longrightarrow \text{Connector Layer} \longrightarrow \text{Provider Adapter}$$

### 2.2 Todo Debe Poder Sustituirse (Pluggability Total)
Si en el ciclo de vida del producto se reemplaza:
- Binance por Bybit o Hyperliquid
- Redis por KeyDB o Dragonfly compatible
- KLineChart por Lightweight Charts o motor Canvas propio
- Supabase por PostgreSQL nativo gestionado
- El proveedor Cloud o el VPS
- El broker de Forex/Futuros o el gateway institucional

**El Core debe requerir CERO o los mínimos cambios posibles.**
Toda interacción externa se efectúa a través de contratos de interfaz (`Ports`) y adaptadores concretos (`Adapters`).

### 2.3 El Frontend NUNCA Habla Directamente con Exchanges ni Brokers
- **INCORRECTO:**
  $$\text{Browser (Frontend)} \longrightarrow \text{Binance / Bybit REST o WebSocket}$$
- **CORRECTO:**
  $$\text{Browser (Frontend)} \longrightarrow \text{Global City Backend API / Gateway} \longrightarrow \text{Connector} \longrightarrow \text{Exchange / Broker}$$

> **REGLA DE SEGURIDAD ABSOLUTA:** Las credenciales privadas (API keys, API secrets, passphrases, tokens OAuth, private keys de Web3) **NUNCA se exponen al navegador**. Quedan custodiadas en el backend o en almacén cifrado seguro.

---

## 3. MODELO DE DESPLIEGUE DUAL: Cloud & Self-Hosted

Global City debe soportar dos grandes modalidades bajo un mismo diseño canónico:

```
                  ┌────────────────────────────────┐
                  │        GLOBAL CITY CORE        │
                  │ (Lógica de Trading Compartida) │
                  └───────────────┬────────────────┘
                          ┌───────┴───────┐
                          ▼               ▼
                 ┌────────────────┐ ┌────────────────┐
                 │   CLOUD MODE   │ │  SELF-HOSTED   │
                 └────────────────┘ └────────────────┘
```

### 3.1 Global City Cloud
- Global City aloja y orquesta la infraestructura completa.
- Flujo: `User -> Global City Cloud -> Backend (Redis + PostgreSQL + Trading Core + Market Data + OMS + EMS + Connectors)`.
- El usuario final o trader minorista no administra ni necesita conocer Redis, PostgreSQL, Linux o Docker.

### 3.2 Global City Self-Hosted
- El usuario avanzado, fondo cuantitativo o prop firm ejecuta Global City en su propia infraestructura local o VPS dedicado.
- Flujo: `Server -> Docker Compose (Global City + PostgreSQL + Redis + Workers + Market Data)`.
- Utiliza esencialmente el mismo Core compilado o paquetizado que la versión Cloud.

### 3.3 Regla Crítica de Coherencia
**No crear dos aplicaciones ni bases de código bifurcadas.** La diferencia radica exclusivamente en la orquestación de infraestructura y configuración de entorno (`env`), jamás en la lógica fundamental de trading y riesgo.

---

## 4. ESTRATEGIA OPEN SOURCE Y LICENCIAMIENTO

Global City contempla ser Open Source, pero la estrategia de licencia es una decisión estratégica de producto y legal:
- **Candidatas a evaluación formal:** AGPLv3, GPLv3, Apache 2.0, MIT, esquema Open Core y Dual Licensing (Comercial / Enterprise).
- **Tratamiento de AGPL:** Es el estándar de protección para software de servidor que previene la privatización no autorizada por terceros mediante SaaS, pero debe analizarse si se adapta al modelo de monetización previsto.
- **Antes de abrir el repositorio público:**
  1. Delimitar qué código pertenece al Core Open Source y qué módulos son servicios Cloud propietarios (ej. gateways FIX corporativos, módulos CRM de Prop Firm).
  2. Revisar licencias de dependencias externas.
  3. Formalizar acuerdos de contribución (CLA) y derechos de autor.
  4. Redactar el archivo `LICENSE` únicamente tras concluir la revisión legal.
- **Modelo de Negocio:**
  $$\text{Open Source Core} + \text{Global City Cloud Hosted} + \text{Managed Infrastructure} + \text{Support SLA} + \text{Enterprise B2B}$$

---

## 5. ARQUITECTURA GENERAL Y TRES PLANES

```
                        ┌────────────────────────────────────────────────────────┐
                        │                      GLOBAL CITY                       │
                        └───────────────────────────┬────────────────────────────┘
                                    ┌───────────────┼───────────────┐
                                    ▼               ▼               ▼
                            ┌──────────────┐┌──────────────┐┌──────────────┐
                            │ CONTROL PLANE││TRADING PLANE ││ CONNECTIVITY │
                            └───────┬──────┘└───────┬──────┘└───────┬──────┘
                                    │               │               │
                                    ▼               ▼               ▼
                              [Core API]      [Trading Core]  [Connectors]
                                              ┌─────┼─────┐   ┌─────┼─────┐
                                              ▼     ▼     ▼   ▼     ▼     ▼
                                             Risk  OMS   EMS Binance MT5 cTrader
```

### 6.1 Control Plane
- **Responsabilidades:** Usuarios, organizaciones, autenticación (JWT/OAuth), autorización (RBAC), registro de conexiones, configuración de estrategias, gestión de permisos mínimos, suscripciones, facturación, metadatos y dashboard de administración.

### 6.2 Trading Plane
- **Responsabilidades:** Motores de market data en caliente, despacho de estrategias, generación de señales, detección de arbitraje, Pre-Trade Risk Engine, Order Management System (OMS), Execution Management System (EMS), Smart Order Routing (SOR), gestión de portafolio, cálculo de balances y PnL, reconciliación periódica y motor de Copy Trading.

### 6.3 Connectivity Plane
- **Responsabilidades:** Adaptadores CCXT y CCXT Pro, clientes REST y WebSocket nativos de exchanges, cTrader Open API (Protobuf), MetaTrader 5 Gateway, QuickFIX 4.4/5.0, integraciones B2B (BlackArrow), gateways de futuros regulados y normalizadores DTO.

---

## 7. EL BACKEND COMO FUENTE DE VERDAD OPERATIVA

Global City requiere backend persistente y reactivo.
Aunque el prototipo inicial de frontend use almacenamiento local para agilidad visual, el producto real **NUNCA debe depender de LocalStorage** para:
- Autenticación o tokens de sesión no auditados
- Cuentas de trading y balances reales
- Credenciales y claves API
- Registro de órdenes y ejecuciones
- Posiciones abiertas y cálculo de PnL
- Límites de riesgo y estado de salud transaccional

$$\text{Frontend / UI} \longleftrightarrow \text{Backend API (REST + WebSocket Gateway)} \longleftrightarrow \text{Trading Core}$$

---

## 8. ENTORNO DE DESARROLLO LOCAL (Workstation Setup)

Para la estación de trabajo principal (~28 hilos CPU, 32 GB RAM, 1 TB SSD en Windows):
- **NO formatear ni convertir el equipo a Linux nativo.**
- **Topología establecida:**
  $$\text{Windows Host} \longrightarrow \text{WSL2 (Ubuntu)} \longrightarrow \text{Docker Engine} \longrightarrow \text{Servicios}$$
- Windows se mantiene como sistema operativo anfitrión para herramientas de interfaz, diseño y productividad.
- WSL2 + Docker proporciona el entorno POSIX idéntico a los servidores de producción Cloud.

---

## 9. ORQUESTACIÓN CON DOCKER & DOCKER-COMPOSE

Docker garantiza paridad absoluta entre el desarrollo local y el despliegue en VPS o Kubernetes:

```yaml
# Topología base conceptual
services:
  frontend:       # Vite / React Dashboard (Nginx)
  api-gateway:    # FastAPI / Node.js API pública y WebSocket Server
  trading-core:   # OMS, EMS, SOR y Risk Engine
  market-data:    # Conectores WebSocket externos y normalizador
  worker-pool:    # Tareas asíncronas, reconciliación y sync de balances
  redis:          # Redis 7 (Hot state, stream bus, locks e idempotencia)
  postgres:       # PostgreSQL 16 (Fuente persistente y durable)
  # Opcionales para observabilidad:
  prometheus:
  grafana:
  loki:
```
*Regla de sobriedad:* No arrancar todos los contenedores el día uno. Comenzar con lo mínimo imprescindible (`api`, `postgres`, `redis`, `market-data`, `frontend`) y escalar gradualmente.

---

## 10. SUPABASE / POSTGRESQL: FUENTE PERSISTENTE DE VERDAD

PostgreSQL es el repositorio inmutable y durable de la plataforma:
- **Modelo mental:** PostgreSQL es la **memoria permanente** que sobrevive a caídas de energía, reinicios de contenedores y despliegues.
- **Responsabilidades exclusivas:** Usuarios, organizaciones, subcuentas, conexiones y metadatos, órdenes históricas, fills y comisiones, balances consolidados al cierre, snapshots de posiciones, reglas de riesgo, eventos de auditoría y registros de reconciliación.
- **Row Level Security (RLS):** Si se utiliza Supabase o PostgreSQL nativo, RLS debe garantizar aislamiento criptográfico entre tenants/organizaciones.

---

## 11. REDIS EN PROFUNDIDAD: MEMORIA CALIENTE Y VELOCIDAD DE TRADING

> **Axioma de Memoria:**
> **PostgreSQL = Memoria Permanente (Durable)**
> **Redis = Memoria Rápida (Hot State, < 1ms)**

Redis **NUNCA sustituye a PostgreSQL**, ni es la fuente de verdad del saldo consolidado de un usuario. Es el acelerador transaccional del sistema.

### Usos Técnicos Obligatorios de Redis 7:
1. **Ticker & Order Book Hot State:** Almacenamiento en hashes (`HSET`) de los mejores Bids/Asks y VWAP L2 calculados en memoria viva.
2. **Idempotencia Transaccional con `SET NX EX`:**
   ```bash
   SET idempotency:order:{client_order_id} "PROCESSING" NX EX 86400
   ```
   Evita que reintentos de red o clics repetidos generen órdenes duplicadas en exchanges externos.
3. **Bloqueos Distribuidos (Distributed Locks):**
   Uso de Redlock o cerrojos atómicos para evitar condiciones de carrera cuando dos procesos intentan modificar el margen o la posición de una misma subcuenta concurrentemente.
4. **Event Bus Interno (Redis Streams & Pub/Sub):**
   Desacoplamiento entre el motor de Market Data, el motor de Arbitraje y el API Gateway mediante canales de eventos (`XADD`, `XREADGROUP`).
5. **Sliding-Window Rate Limiting:**
   Uso de Sorted Sets (`ZADD`, `ZREMRANGEBYSCORE`) para proteger a los conectores de superar los límites de llamadas de cada exchange.

### 12. Redis en Cloud vs. Self-Hosted
- **Cloud:** Gestionado automáticamente con replicación y backups sin intervención del usuario.
- **Self-Hosted:** Desplegado mediante contenedor Docker oficial en la misma red interna.
- El Core se conecta mediante cadena de conexión estándar `REDIS_URL` en ambos casos.

### 13. Abstracción Estricta de Redis (Ports & Adapters)
**Prohibido llenar el código de la lógica de negocio con llamadas directas:**
`redis.get()`, `redis.set()`, `redis.hdel()`.
Se deben inyectar interfaces de dominio:
- `ICacheService`
- `IStateStore`
- `ILockService`
- `IEventBus`
detrás de las cuales opera el adaptador de Redis. Si mañana se migra a KeyDB o a memoria local en pruebas unitarias, el Core no cambia.

### 14. Protocolo de Resiliencia ante Caídas de Redis
Redis puede fallar o reiniciarse. El sistema debe responder de forma predecible:
$$\text{Redis Failure Detectado} \longrightarrow \text{Modo Degradado} \longrightarrow \text{Pausa de Nuevas Órdenes} \longrightarrow \text{Restauración} \longrightarrow \text{Resync desde PostgreSQL y Exchanges} \longrightarrow \text{Reconciliation} \longrightarrow \text{READY}$$

---

## 15. ALTA CONCURRENCIA Y CONEXIÓN DE MÚLTIPLES USUARIOS REALES DESDE EL DÍA 1 (Fan-Out Architecture)

### 15.1 El Gran Peligro: Conexiones Directas por Usuario
Si 5.000 usuarios abren la plataforma y cada uno intenta abrir un WebSocket directo a Binance, Bybit u OKX:
- Se agotarían los sockets del servidor o las IPs serían inmediatamente bloqueadas por los CEX por rate limiting y DDoS.
- La latencia se dispararía y el sistema colapsaría.

### 15.2 Arquitectura Canónica de Fan-Out y Multiplexación

```
  [Exchange / Broker WS]
            │ (1 sola conexión por par / venue)
            ▼
   ┌───────────────────┐
   │Market Data Ingest │  <- Normalización y parseo binario/JSON
   └────────┬──────────┘
            ▼
   ┌───────────────────┐
   │ RAM Buffer + Redis│  <- Hot cache L2 con TTL ultra bajo
   └────────┬──────────┘
            │
            ├───────────────────────────────────────────────┐
            ▼                                               ▼
   ┌───────────────────┐                           ┌───────────────────┐
   │ WebSocket Cluster │                           │ Trading Engine /  │
   │ Gateway (Node/Go) │                           │ Risk / Arbitrage  │
   └────────┬──────────┘                           └───────────────────┘
            │
            ├──────────────┬──────────────┬──────────────┐ (Rooms por Símbolo)
            ▼              ▼              ▼              ▼
       [Usuario #1]   [Usuario #2]   [Usuario #3] ... [Usuario #5.000+]
```

### 15.3 Criterios Técnicos para Soportar Miles de Usuarios Concurrentes:
1. **Single Upstream Connection (Conexión Única Aguas Arriba):**
   - 1 único WebSocket por par entre Global City y el Exchange.
   - Da igual si hay 1 usuario o 10.000 usuarios mirando `BTC/USDT`; el tráfico hacia Binance es exactamente el mismo (1 socket).
2. **Channel / Room Multiplexing:**
   - El cliente web se conecta al WebSocket Gateway de Global City y se suscribe al topic `quotes:binance:BTCUSDT`.
   - El Gateway agrupa a los usuarios en salas en memoria y redistribuye los paquetes de cotización en un bucle no bloqueante.
3. **Delta Updates y Throttling de Render:**
   - No enviar el order book completo en cada frame. Enviar deltas (cambios en niveles de precio) o emitir snapshots con debounce a 50–100ms.
   - En el frontend, la interfaz procesa datos mediante Web Workers y actualiza la vista a 60 FPS sin saturar el hilo principal de JavaScript.
4. **Compresión y Protocolos Ligeros:**
   - Soporte para streaming binario ligero (MessagePack o JSON optimizado sin campos redundantes) para reducir el consumo de ancho de banda a escala masiva.
5. **Session Pooling y Stateless Authentication:**
   - Autenticación por token JWT verificado en el handshake inicial del WebSocket. Las reconexiones validan el token sin consultar continuamente la base de datos de disco.

---

## 16. MODELO NORMALIZADO DE MARKET DATA

El Core solo procesa estructuras internas canónicas:

```typescript
export interface MarketDataTick {
  venue: string;         // 'binance' | 'bybit' | 'okx' | 'ctrader' | 'mt5'
  symbol: string;        // 'BTC/USDT' normalizado
  timestamp: number;     // Milisegundos UTC
  bid: number;
  ask: number;
  last: number;
  volume24h: number;
  high24h?: number;
  low24h?: number;
}

export interface NormalizedOrderBookL2 {
  venue: string;
  symbol: string;
  timestamp: number;
  bids: [price: number, size: number][];
  asks: [price: number, size: number][];
}
```

---

## 17. MÁQUINA DE ESTADOS Y PROTOCOLO DE RECONEXIÓN

Todos los conectores de mercado y ejecución deben operar bajo un ciclo de vida resiliente:

$$\text{CONNECTED} \longrightarrow \text{DISCONNECTED} \longrightarrow \text{EXPONENTIAL BACKOFF} \longrightarrow \text{RECONNECT} \longrightarrow \text{RESUBSCRIBE} \longrightarrow \text{RESYNC} \longrightarrow \text{RECONCILIATION} \longrightarrow \text{READY}$$

- **Estados de salud reportados:** `HEALTHY`, `DEGRADED`, `UNAVAILABLE`.

---

## 18–20. MOTOR DE GRÁFICOS E INDEPENDENCIA VISUAL

- **Arquitectura desacoplada:**
  $$\text{Market Data Backend} \longrightarrow \text{Chart Adapter} \longrightarrow \text{KLineChart / Canvas}$$
- El componente de gráficos **NUNCA** se conecta a APIs de terceros por su cuenta.
- **KLineChart:** Excelente opción bajo licencia Apache 2.0, rápido, soporte nativo de Canvas y dibujo de indicadores técnicos.
- **Consumo:** Paquete npm/pnpm instalado en el bundle local; nunca depender de CDNs públicos no auditados en producción.
- **Separación de datos:**
  - *Datos históricos:* Consultados vía REST API paginada desde backend.
  - *Streaming en vivo:* Inyectado vía WebSocket multiplexado de Global City.

---

## 21–26. ARQUITECTURA DE CONECTORES EXTERNOS

Toda comunicación con brokers o exchanges implementa contratos unificados:

```typescript
export interface IExchangeConnector {
  getMarkets(): Promise<MarketInfo[]>;
  getTicker(symbol: string): Promise<MarketDataTick>;
  getOrderBook(symbol: string, depth?: number): Promise<NormalizedOrderBookL2>;
  getBalance(): Promise<AccountBalance>;
  getPositions(): Promise<Position[]>;
  createOrder(intent: OrderIntent): Promise<ExecutionReport>;
  cancelOrder(orderId: string, symbol: string): Promise<boolean>;
  getOrder(orderId: string, symbol: string): Promise<Order>;
  getOpenOrders(symbol?: string): Promise<Order[]>;
  subscribeMarketData(symbol: string, callback: (tick: MarketDataTick) => void): Promise<void>;
}
```

### Particularidades de Conectores Clave:
- **CCXT / CCXT Pro (Sección 23):** Empleado como adapter interno en la capa de conectividad. Prohibido acoplar estrategias a CCXT.
- **cTrader Open API (Sección 24):** Conexión Protobuf/TCP de alto rendimiento, autenticación OAuth 2.0, rate limits de 50 req/s no-históricas y 5 req/s históricas, heartbeats obligatorios.
- **MetaTrader 5 (Sección 25):** Requiere terminal o gateway de servidor (Windows/Wine o Broker Manager API para escalabilidad institucional masiva).
- **BlackArrow / FIX (Sección 26):** Integraciones B2B con especificación FIX 4.4/5.0 o APIs REST/WebSocket institucionales.

---

## 27–29. MODELO DE CONEXIÓN, CREDENCIALES Y PERMISOS

- **Modelo Conceptual:**
  `Connection: { id, orgId, provider, type, name, permissions, status, health, lastSync }`.
- **Cero Secretos Expuestos:** Prohibido guardar credenciales en LocalStorage, logs, métricas o código fuente. Las claves privadas y secrets se almacenan cifrados con AES-256-GCM en el backend.
- **Mínimo Privilegio Obligatorio:** Solicitar siempre permisos exclusivamente de lectura y trading (`READ + TRADE`). **Rechazar terminantemente permisos de retiro de fondos (`WITHDRAW`)** en operaciones estándar.

---

## 30. MULTI-TENANCY Y AISLAMIENTO DE DATOS

- Diseño multi-empresa y multi-usuario desde el primer día:
  $$\text{Organization} \longrightarrow \text{Users} \longrightarrow \text{Connections} \longrightarrow \text{Accounts} \longrightarrow \text{Strategies} \longrightarrow \text{Orders}$$
- El aislamiento no depende de filtros visuales en React; se impone en consultas SQL mediante `organization_id` y políticas RLS.

---

## 31–34. OMS, EMS, ORDER LEGS Y SMART ORDER ROUTING

```
┌──────────────────────────────────┐
│      ORDER INTENT (Estrategia)   │
└────────────────┬─────────────────┘
                 ▼
┌──────────────────────────────────┐
│      PRE-TRADE RISK ENGINE       │ <- Verificación síncrona en < 1ms
└────────────────┬─────────────────┘
                 ▼
┌──────────────────────────────────┐
│  OMS (Order Management System)   │ <- Control del ciclo de vida de la orden
└────────────────┬─────────────────┘
                 ▼
┌──────────────────────────────────┐
│  EMS (Execution Management Sys)  │ <- Táctica de fragmentación de orden
└────────────────┬─────────────────┘
                 ▼
┌──────────────────────────────────┐
│    SMART ORDER ROUTER (SOR)      │ <- Selección óptima de venue
└────────────────┬─────────────────┘
                 ▼
┌──────────────────────────────────┐
│       CONNECTOR LAYER            │
└──────────────────────────────────┘
```

- **Estados canónicos del OMS:**
  `CREATED` $\rightarrow$ `PENDING` $\rightarrow$ `SUBMITTED` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `PARTIALLY_FILLED` $\rightarrow$ `FILLED` (o `REJECTED`, `CANCEL_REQUESTED`, `CANCELLED`, `EXPIRED`, `UNKNOWN`).
- **Order Legs:** Capacidad de modelar órdenes complejas de múltiples patas (ej. arbitraje simultáneo de 2 patas o spreads sintéticos).
- **EMS vs. OMS:** El OMS custodia el *qué* y el *estado legal* de la orden; el EMS decide el *cómo*, optimizando liquidez, slippage, comisiones y latencia.
- **Smart Order Router (SOR):** Evalúa el precio efectivo neto ($VWAP - Fees - Slippage$) en lugar del precio nominal superficial.

---

## 35. PRE-TRADE RISK ENGINE: BARRERA INFRANQUEABLE

**Ninguna orden generada por una estrategia, trader manual o bot puede saltarse el motor de riesgo.**
- **Controles en sub-milisegundo:** Tamaño máximo por orden, exposición máxima nocional, pérdida máxima diaria (Daily Loss Limit), límite de drawdown dinámico, apalancamiento permitido y circuit breakers globales ante anomalías de volatilidad.

---

## 36–37. ARBITRAJE CÓNCLAVE Y GESTIÓN DE FALLOS

- **Ecuación de Oportunidad Neta:**
  $$\text{Net Spread} = \text{Gross Spread} - \text{Taker Fees} - \text{Slippage Est.} - \text{Latency Cost} - \text{Hedging Cost}$$
- **Fallo Asimétrico (Leg 1 llena, Leg 2 timeout):**
  Jamás duplicar la orden a ciegas. Pasar la operación a estado `UNKNOWN`, consultar inmediatamente al exchange vía REST, determinar el estado real y ejecutar cobertura de emergencia o cierre de posición de rescate.

---

## 38. MOTOR DE RECONCILIACIÓN CONTINUA (Reconciliation Engine)

> **Principio de Verdad Absoluta:**
> La verdad final del estado de una cuenta y sus ejecuciones reside en el **Exchange / Broker**, no en la base de datos interna.

- **Frecuencia de Reconciliación:**
  - Periódicamente (cada $X$ minutos en segundo plano).
  - Tras reconexión de WebSockets o reinicio de servicios.
  - Al detectar órdenes en estado `UNKNOWN` o timeouts de red.
- **Acciones:**
  Comparar IDs, volúmenes ejecutados, precios medios, comisiones, balances y margen libre. En caso de discrepancia, emitir evento crítico `ReconciliationDiscrepancy` y auto-corregir el estado en PostgreSQL.

---

## 39–40. PORTFOLIO, PNL Y COPY TRADING

- **Desglose Transparente de PnL:**
  $$\text{Net PnL} = \text{Realized PnL} + \text{Unrealized PnL} - \text{Trading Fees} - \text{Funding Rates} - \text{Borrowing Costs}$$
- **Copy Trading Multi-Provider:**
  El Master emite eventos de ejecución en el Event Bus; el motor de copia replica en paralelo hacia las cuentas seguidores (MT5, cTrader, Bybit) aplicando multiplicadores de volumen personalizados, límites de riesgo individuales y mapeo de símbolos específico por broker.

---

## 41–44. UNIFICACIÓN DE CANALES, TELEGRAM Y AUDIT LOG

- **Un Solo Core de Ejecución:**
  Las órdenes emitidas desde la Web, Telegram Bot, Telegram Mini Apps o API externa pasan **exactamente por el mismo pipeline**:
  $$\text{Canal (Web / Telegram / API)} \longrightarrow \text{Command Service} \longrightarrow \text{Risk} \longrightarrow \text{OMS} \longrightarrow \text{EMS} \longrightarrow \text{Connector}$$
- **Telegram Mini App:** Utilizada como superficie de visualización y control enriquecido. Validación criptográfica obligatoria de `initData` en backend antes de aceptar comandos.
- **Acciones Destructivas:** Cerrar posiciones o cancelar órdenes masivas requiere validación de sesión, confirmación explícita y registro inmutable en el `Audit Log`.
- **Audit Log:** Registra usuario, organización, canal, timestamp, cuenta, acción, parámetros y resultado. **Jamás registra contraseñas o API secrets.**

---

## 45–48. MODELO DE DATOS Y SERVICIOS FRONTEND

### Tablas Principales de Base de Datos:
`users`, `organizations`, `organization_members`, `accounts`, `connections`, `credentials`, `strategies`, `strategy_configurations`, `orders`, `order_legs`, `fills`, `positions`, `balances`, `fees`, `pnl`, `risk_limits`, `events`, `audit_logs`, `reconciliation_records`.

### Servicios Desacoplados en Frontend:
Incluso en modo prototipo, la interfaz no accede a `localStorage` indiscriminadamente en componentes React. Se crean clases de servicio:
`AuthService`, `AccountService`, `TradeService`, `PortfolioService`, `ConnectionService`, `MarketDataService`.

---

## 49–51. OBSERVABILIDAD, LOGGING Y TESTING

- **Métricas Clave (Prometheus / Grafana):**
  Órdenes/segundo, fills/segundo, mensajes market data/segundo, latencia p50/p95/p99, tasa de rechazo, discrepancias de reconciliación, salud de Redis y saturación de pool de PostgreSQL.
- **Políticas de Logging Estructurado (Loki / JSON):**
  Identificar siempre correlación: `order_id`, `client_order_id`, `venue`, `account_id`. Cero credenciales o claves privadas en logs.
- **Pirámide de Pruebas:**
  Tests unitarios de lógica pura $\rightarrow$ Tests de integración de adaptadores $\rightarrow$ Tests de simulación de fallos (Chaos / Desconexión) $\rightarrow$ Reconciliación bajo concurrencia.

---

## 52–56. ENTORNOS DE EJECUCIÓN Y SEGURIDAD

- **Polimorfismo de Entornos:**
  El Core debe ejecutarse indistintamente en modalidades: `Paper Trading`, `Sandbox / Testnet`, `Demo` y `Live Real Trading` sin alterar la lógica de cálculo.
- **Recuperación tras Reinicio:**
  $$\text{STARTING} \longrightarrow \text{CONNECTING} \longrightarrow \text{SYNCING} \longrightarrow \text{RECONCILING} \longrightarrow \text{READY}$$
  Nunca emitir órdenes automáticas antes de completar la reconciliación del estado anterior.

---

## 57–58. ESCALABILIDAD PRÁCTICA (Low-Latency Realista vs. HFT Prematuro)

- **Objetivo Inicial de Latencia:**
  Sistemas reactivos en sub-10 milisegundos con Python/Node.js + WebSockets + Redis 7 + Docker.
- **Evitar Optimización Prematura:**
  No intentar construir un motor HFT en microsegundos (C++ / Rust / kernel bypass) antes de contar con un producto funcional validado por el mercado.
- La escalabilidad se logra en la capa de **fan-out y caché en memoria**, no reinventando protocolos de hardware.

---

## 59–61. EVALUACIÓN SISTEMÁTICA DE NUEVAS TECNOLOGÍAS

Antes de incorporar un nuevo conector, base de datos o servicio externo, se debe completar la **Matriz de Viabilidad**:

| Dimensión | Cuestión Crítica |
| :--- | :--- |
| 💰 **Coste** | Coste de setup, mantenimiento mensual, comisiones por volumen de API. |
| 🚦 **Rate Limits** | Límites de peticiones REST/minuto y conexiones concurrentes WebSocket. |
| 🧪 **Límites de MVP** | Complejidad de homologación, existencia de sandbox o entorno demo. |
| 🚀 **Producción** | Escalabilidad B2B, aprovisionamiento de subcuentas y SLAs de soporte. |
| ⚠️ **Riesgos** | Riesgo de bloqueo geográfico, vendor lock-in o cambios unilaterales de API. |
| 📜 **Licencia** | Términos de uso comercial, redistribución de SDKs y restricciones legales. |

---

## 62–63. INFRAESTRUCTURA DE EMPRESAS DE FONDEO (Prop Firms)

- **Capacidades para Fondos y Prop Firms:**
  Gestión automatizada de challenges de evaluación, cálculo de Balance vs. Equity en tiempo real, monitoreo de Drawdown Máximo Absoluto y End-of-Day (EOD), control de reglas de consistencia (máximo 40% de ganancias en un solo día de trading) y aprovisionamiento automático de cuentas.
- **Distinción de Modelos de Negocio:**
  - *Modelo Agregador:* El usuario conecta su propia cuenta preexistente de Binance, Bybit o broker.
  - *Modelo Prop / Funding:* La plataforma emite credenciales y asigna cuentas demo/reales dentro de un programa evaluativo.

---

## 64–65. DISTRIBUCIÓN, PICOS DE TRÁFICO Y PRUEBAS DE CARGA

- **Diseño para Avalanchas de Tráfico:**
  El marketing en comunidades de trading genera picos agresivos de registro y conexión simultánea.
- **Pruebas de Carga Graduales:**
  Simular mediante herramientas de stress (k6, Locust):
  $$10 \text{ usuarios} \longrightarrow 100 \text{ usuarios} \longrightarrow 1.000 \text{ usuarios} \longrightarrow 5.000 \text{ usuarios concurrentes}$$
  Midiendo FPS en navegador, retardo de WebSocket, consumo de CPU/RAM en Redis y tiempo de respuesta p99 de la base de datos.

---

## 66–68. ESTRUCTURA DE REPOSITORIO Y CONFIGURACIÓN

```
GlobalCity/
├── backend/                  # Trading Core, OMS/EMS, conectores y APIs
│   ├── api/                  # Endpoints REST y WebSocket Gateways
│   ├── trading_core/         # Lógica de dominio, Risk, OMS, EMS, SOR
│   ├── market_data/          # Ingestores, buffers en RAM y normalizadores
│   ├── infrastructure/       # Adaptadores de base de datos, Redis y conectores
│   │   ├── postgres/
│   │   ├── redis/
│   │   └── connectors/       # Binance, Bybit, OKX, cTrader, MT5, FIX
│   └── workers/              # Tareas de sincronización y reconciliación
├── frontend/                 # React, Tailwind, KLineChart, Canvas visual
├── agent_skills/             # Base de conocimiento institucional estandarizada
├── infrastructure/           # Docker Compose, configs de Nginx, Redis y Postgres
├── .env.example              # Plantilla estricta de variables de entorno
└── README.md
```

- **Variables de Entorno (.env):** Nunca almacenar secretos de producción en el repositorio de Git. `.env.example` solo documenta nombres y formatos esperados.

---

## 69–71. HOJA DE RUTA ESTRATÉGICA Y REGLAS DE ORO

### Fases de Implementación Recomendadas:
- **Fase 0:** Arquitectura, especificaciones y marco de licencias.
- **Fase 1:** Entorno local reproducible (Windows + WSL2 + Docker + Postgres + Redis).
- **Fase 2:** Backend base (Autenticación, organizaciones, conexiones y subcuentas).
- **Fase 3:** Frontend desacoplado (Terminal, navegación, gráficos y paneles de control).
- **Fase 4:** Ingestión de Market Data con fan-out multiplexado para alta concurrencia.
- **Fase 5:** Primer conector real homologado (Binance / Bybit / OKX).
- **Fase 6:** Trading Core (Risk $\rightarrow$ OMS $\rightarrow$ EMS $\rightarrow$ Conector).
- **Fase 7:** Integración de Forex/Futuros (cTrader Open API / MT5).
- **Fase 8:** Motores de Arbitraje sintético y Copy Trading multi-broker.
- **Fase 9:** Telegram Mini Apps y despliegue Cloud de alta disponibilidad.

### Regla de Oro del MVP:
No implementar clústeres distribuidos complejos de Kubernetes o Redis Cluster cuando un único nodo bien optimizado con Docker, Redis 7 y PostgreSQL resuelve con holgura las primeras decenas de miles de usuarios.

---

## 72–75. IDEMPOTENCIA, ESTADO DESCONOCIDO Y JERARQUÍA DE VERDAD

- **Tokens de Idempotencia:**
  Toda orden despachada lleva un identificador unívoco (`client_order_id`). Si la red se interrumpe y la orden se reenvía, el conector y Redis identifican el token y abortan la duplicación.
- **Tratamiento del Estado `UNKNOWN`:**
  Un timeout de red **NUNCA** significa que la orden no se ejecutó en el broker. Se marca como `UNKNOWN` y se activa el protocolo de reconciliación inmediata.
- **Jerarquía Canónica de la Verdad:**
  $$\text{1. Ejecución Física del Broker/Exchange} \;\succ\; \text{2. Reconciliador Interno} \;\succ\; \text{3. PostgreSQL} \;\succ\; \text{4. Redis / Caché}$$

---

## 76–79. FLUJOS DE DATOS DE LA PLATAFORMA

### Flujo de Market Data (Alta Concurrencia):
$$\text{Exchange WS} \longrightarrow \text{Ingestor} \longrightarrow \text{Normalizador} \longrightarrow \text{RAM Buffer / Redis} \longrightarrow \text{WS Fan-Out} \longrightarrow \text{Miles de Usuarios / Charts}$$

### Flujo Transaccional de Órdenes:
$$\text{Usuario / Estrategia} \longrightarrow \text{Command API} \longrightarrow \text{Risk Engine} \longrightarrow \text{OMS} \longrightarrow \text{EMS} \longrightarrow \text{SOR} \longrightarrow \text{Conector} \longrightarrow \text{Broker}$$

### Flujo de Retorno y Persistencia:
$$\text{Execution Report} \longrightarrow \text{Conector} \longrightarrow \text{OMS} \longrightarrow \text{Posiciones y Balances} \longrightarrow \text{PostgreSQL} \longrightarrow \text{Pub/Sub UI}$$

---

## 80–83. NORMAS DE DECISIÓN Y LO QUE NUNCA SE DEBE HACER

### Lista de Prohibiciones Inquebrantables ("What NOT to do"):
1. **NUNCA** conectar el frontend directamente a exchanges ni almacenar API keys en el navegador.
2. **NUNCA** guardar secretos privados en LocalStorage, Git, logs o métricas.
3. **NUNCA** utilizar Redis como base de datos persistente principal de operaciones.
4. **NUNCA** permitir que una estrategia conozca detalles concretos de un exchange.
5. **NUNCA** implementar lógica de trading divergente para Telegram; todo pasa por el mismo Core.
6. **NUNCA** abrir una conexión de WebSocket externa por cada usuario individual.
7. **NUNCA** asumir que un timeout de red equivale a una orden no ejecutada.
8. **NUNCA** saltarse el Pre-Trade Risk Engine bajo ninguna circunstancia.

---

## 84–86. OBJETIVO LOCAL Y DEFINICIÓN DE "TERMINADO" (Definition of Done)

Una funcionalidad de trading institucional **NO está terminada** porque simplemente funcione en el escenario feliz (*happy path*).
Para considerarse **DONE**, debe contemplar:
- [x] Flujo de éxito (Happy Path)
- [x] Flujo de fallo y rechazo del broker
- [x] Reintentos exponenciales con jitter
- [x] Manejo de timeouts y estados desconocidos (`UNKNOWN`)
- [x] Idempotencia transaccional verificada
- [x] Control de permisos mínimos
- [x] Registro estructurado en log y tabla de auditoría
- [x] Persistencia durable en PostgreSQL
- [x] Reconciliación automática y manual
- [x] Tests unitarios e integración con mocks

---

## 87. MODELO ARQUITECTÓNICO MAESTRO INTEGRADO

```
                                GLOBAL CITY TRADING OPERATING SYSTEM
               ┌──────────────────────────────────┴──────────────────────────────────┐
               ▼                                                                     ▼
      GLOBAL CITY CLOUD                                                    GLOBAL CITY SELF-HOSTED
      (SaaS Administrado)                                                  (Docker Compose Dedicado)
 ┌───────────────────────────┐                                        ┌───────────────────────────┐
 │ API Gateway + WebSockets  │                                        │ API Gateway + WebSockets  │
 │ Redis 7 (Hot State)       │                                        │ Redis 7 (Hot State)       │
 │ PostgreSQL 16 (Durable)   │                                        │ PostgreSQL 16 (Durable)   │
 └─────────────┬─────────────┘                                        └─────────────┬─────────────┘
               └──────────────────────────────────┬──────────────────────────────────┘
                                                  ▼
                                      TRADING CORE (Hexagonal)
                               ┌──────────────────┼──────────────────┐
                               ▼                  ▼                  ▼
                         PRE-TRADE RISK          OMS                EMS
                               │                  │                  │
                               └──────────────────┼──────────────────┘
                                                  ▼
                                         SMART ORDER ROUTER
                                                  ▼
                                           CONNECTOR LAYER
                    ┌───────────────┬─────────────┼─────────────┬───────────────┐
                    ▼               ▼             ▼             ▼               ▼
                 Binance          Bybit          OKX         cTrader           MT5
```

---

## 88. INSTRUCCIONES FORMALES PARA AGENTES DE DESARROLLO

Cuando actúes como agente de IA o desarrollador en el proyecto **Global City**:
1. **Revisa esta skill** antes de plantear cambios arquitectónicos o agregar conectores.
2. **Preserva la independencia de proveedores:** Ninguna lógica central debe acoplarse a un exchange.
3. **Protege los secretos:** Jamás filtres credenciales al frontend, al almacenamiento local o a los logs.
4. **Respeta la jerarquía transaccional:** `Estrategia -> Risk -> OMS -> EMS -> SOR -> Connector`.
5. **Aplica Redis para lo caliente (< 1ms):** Idempotencia `SET NX EX`, hot cache y distributed locks, dejando la durabilidad a PostgreSQL.
6. **Garantiza alta concurrencia desde el inicio:** 1 única conexión upstream por par hacia el exchange; fan-out multiplexado para miles de usuarios.
7. **La reconciliación es ley:** El estado del broker siempre manda; diseña para la auto-recuperación ante fallos.
