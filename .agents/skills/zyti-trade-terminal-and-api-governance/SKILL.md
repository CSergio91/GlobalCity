---
name: zyti-trade-terminal-and-api-governance
description: Especificación arquitectónica, contratos de API, protocolo de webhooks, heartbeat/ping-pong de alta disponibilidad y gobernanza de despliegue On-Premise para ZYTI Trade.
version: 2.0.0
category: Trading Terminal OS & Infrastructure
status: Active
---

# ZYTI TRADE — TERMINAL OS, WEBSOCKET EVENT BUS & DEPLOYMENT GOVERNANCE

## 1. VISIÓN DEL PRODUCTO & REPLICABILIDAD ON-PREMISE
**ZYTI Trade** es un Sistema Operativo de Trading Institucional diseñado para ser:
1. **100% Desacoplado:** Ninguna dependencia forzada de una empresa de fondeo, broker o exchange particular.
2. **Replicable On-Premise / Bare-Metal:** Todo el stack debe poder desplegarse con un solo comando (`docker compose up -d`) en servidores de clientes, VPS privados o clusters en la nube sin configuraciones manuales complejas.
3. **Distribución en Memoria de Ultra Baja Latencia:** Patrón Fan-Out con Redis en caliente + Nginx Reverse Proxy + Gateway WebSocket integrado (`server/tradingHub.js`).
4. **Sincronización Multi-Dispositivo Total:** Cualquier acción de trading (abrir, cerrar, SL/TP, Break-Even, órdenes límite o balance) se refleja en sub-2ms en todas las pantallas vivas del usuario (Desktop, Laptop, Tablet, Móvil).

---

## 2. CONTRATO MAESTRO DE EVENTOS WEBSOCKET DE TRADING (`TradingWebSocketClient`)

El bus de eventos conecta la terminal React con el microservicio `server/tradingHub.js` a través del SDK institucional (`@zyti/trading-sdk`):

### A. Tipos de Eventos Gobernados (`TradingEvent`)
```typescript
export interface TradingEvent {
  id?: string;
  type: 
    | 'TRADE_OPENED'
    | 'TRADE_CLOSED'
    | 'SL_TP_UPDATED'
    | 'LIMIT_ORDER_PLACED'
    | 'LIMIT_ORDER_CANCELLED'
    | 'LIMIT_ORDER_UPDATED'
    | 'ALL_LIMIT_ORDERS_CANCELLED'
    | 'BALANCE_UPDATED'
    | 'ACCOUNT_RESET'
    | 'DRAWDOWN_BREACH';
  payload: any;
  timestamp?: number;
}
```

### B. Especificación de Flujos Críticos
1. **Modificación de Stop Loss & Take Profit (`SL_TP_UPDATED`):**
   - Se dispara al arrastrar las líneas de SL/TP en el canvas del gráfico o editarlas en la tabla.
   - **Difusión:** Se publica a la pasarela WebSocket (`type: 'SL_TP_UPDATED'`).
   - **Persistencia en Base de Datos:** Ejecuta `TradePersistenceService.updateTradeSLTP(id, slPrice, tpPrice)` actualizando `public.account_trades` en Supabase (Write-Behind).
   - **Caché Local:** Actualiza `localStorage.setItem('zyti_open_positions')`.
   - **Garantía:** Al recargar la página (`F5`), la orden mantiene permanentemente el SL y TP guardado.

2. **Gobernanza del Botón Break-Even (`BE`):**
   - **Validación de Riesgo:** Solo es aplicable si la operación no está en pérdida respecto a la entrada (`currentPrice >= entry` en LONG o `currentPrice <= entry` en SHORT).
   - **Ejecución Centralizada:** Delega estrictamente en `handleUpdatePositionSLTP(pos.id, pos.entry, pos.tpPrice)`:
     1. Dispara el evento WebSocket `SL_TP_UPDATED` hacia todos los dispositivos conectados.
     2. Asienta el nuevo `sl_price` en Supabase `account_trades`.
     3. Notifica con toast sonoro e informativo.

3. **Órdenes Límites Multi-Dispositivo (`LIMIT_ORDER_PLACED` / `CANCELLED` / `UPDATED`):**
   - Al crear una orden `Buy Limit` o `Sell Limit` desde la botonera lateral o el gráfico, se difunde `LIMIT_ORDER_PLACED`.
   - Todos los dispositivos sincronizados insertan la orden en su lista de `limitOrders`, actualizan el margen comprometido en el balance y reproducen el sonido institucional de orden colocada.
   - Cancelar una orden o arrastrarla en el gráfico sincroniza la acción en todas las terminales concurrentes.

4. **Sincronización del Balance General (`BALANCE_UPDATED`):**
   - Cada cierre de operación (manual, TP o SL) emite `BALANCE_UPDATED` con el nuevo saldo consolidado `nextB`.
   - **Cold Sync (Arranque en Frío):** Al iniciar o recargar, `TradingTerminal.tsx` reconcilia el saldo consultando `fetchTraderAccounts(identifier)` en Supabase, garantizando que el saldo en pantalla refleje la tabla `trading_accounts` del servidor.

---

## 3. PROTOCOLO DE TELEMETRÍA STREAMING Y HEARTBEAT DE INFRAESTRUCTURA

El microservicio `server/tradingHub.js` provee monitoreo continuo para el ERP CRM y administradores:

### A. Streaming Continuo por WebSocket (`SUBSCRIBE_TELEMETRY`)
- El cliente (como `useZytiEngineTelemetry.ts`) se conecta a `ws://localhost:8080` (o `wss://.../ws-gateway`) y envía:
  ```json
  { "type": "SUBSCRIBE_TELEMETRY" }
  ```
- El Gateway transmite frames periódicos cada 1.2 segundos con métricas en tiempo real:
  ```json
  {
    "type": "TELEMETRY_UPDATE",
    "uptimeSeconds": 1420,
    "connectedSockets": 3,
    "mode": "REDIS_CLUSTER" | "LOCAL_IN_MEMORY",
    "memoryHeapMb": 38,
    "memoryRssMb": 75
  }
  ```

### B. Medición Precisa de RTT (Ping/Pong WebSocket)
- El cliente envía periódicamente:
  ```json
  { "type": "PING", "timestamp": 1790991000 }
  ```
- El servidor responde con `PONG` devolviendo el timestamp del cliente y la hora del servidor, permitiendo calcular el **Round-Trip Time real de red en sub-milisegundos**.

### C. Detección de Conexiones Zombi (Half-Open TCP Detection)
- El Gateway ejecuta un ciclo de heartbeat cada **25 segundos**:
  ```javascript
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        return ws.terminate(); // Libera sockets muertos y descriptores de archivo
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 25000);
  ```

---

## 4. GOBERNANZA DE PERSISTENCIA DEL ESPACIO DE TRABAJO (LOCAL-FIRST)

Para garantizar una experiencia sin fricción al recargar o cambiar de navegador:
1. **Temporalidad Seleccionada:** Persistida en `zyti_selected_timeframe` (`1m`, `5m`, `15m`, `1h`, `4h`, `1d`). El gráfico carga directamente en la temporalidad guardada sin volver al valor por defecto.
2. **Indicadores Activos:** Persistidos en `zyti_active_indicators` (`['MA', 'VOL', 'RSI', 'OHLC']`). Al montar el canvas KLineChart, se recrean automáticamente todos los indicadores técnicos activos con sus correspondientes paneles.
3. **Caché de Posiciones y Órdenes Límites:** Almacenados en `zyti_open_positions` y `zyti_limit_orders` para pintura en 0ms antes de que concluya la reconciliación con Supabase.

---

## 5. PIPELINE DE DATOS FAN-OUT & DISTRIBUCIÓN EN MEMORIA

```text
                  [ EXCHANGES: BINANCE / OKX / BYBIT ]
                                │ (1 sola conexión WSS por par)
                                ▼
                 [ MARKET DATA INGESTION WORKER ]
                                │
                ┌───────────────┴───────────────┐
                │ Pub/Sub: 'stream:{symbol}'    │ Cache: ZSET klines
                ▼                               ▼
                      [ REDIS IN-MEMORY BUS ]
                                │ (Modo REDIS_CLUSTER o RAM Fallback)
                                ▼
                      [ ZYTI WSS GATEWAY ]
                                │ (Streaming Telemetría + Eventos Trading)
                                ▼
                    [ NGINX REVERSE PROXY ]
                                │ (TLS + WSS Upgrade /ws-gateway)
                ┌───────────────┴───────────────┐
                ▼                               ▼
        [ TERMINAL WEB ]              [ ANDROID MOBILE APK ]
```

---

## 6. ESTÁNDAR DE DESPLIEGUE REPLICABLE (CLIENT-READY)

Todo despliegue para clientes o servidores propios se compone de 4 contenedores dockerizados orquestados:
1. `zyti-frontend`: Nginx sirviendo la SPA de React con compresión gzip/brotli y proxying a WS.
2. `zyti-gateway`: Servidor Node.js / TypeScript WebSocket y REST API (`tradingHub.js`).
3. `zyti-worker`: Ingestion Worker que mantiene el enlace con Binance/OKX y escribe en Redis.
4. `zyti-redis`: Redis Alpine con políticas de desalojo LRU y snapshotting para estado caliente.

Variables obligatorias en `.env` (sin secretos en el repo):
- `PORT_HTTP`, `PORT_WSS`, `REDIS_URL`, `EXCHANGE_PAIRS_DEFAULT`, `ZYTI_AUTH_SECRET`.
