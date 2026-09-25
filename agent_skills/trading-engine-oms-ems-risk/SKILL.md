---
name: trading-engine-oms-ems-risk
description: "Orquestación del ciclo de vida de órdenes en tiempo real: OMS, EMS táctico, Smart Order Router (SOR), Pre-Trade Risk Engine síncrono, reconciliación continua e idempotencia."
version: "2.0.0"
category: "Fintech Core Engine & Risk Management"
author: "AI Studio Fintech Systems Architect"
status: "Production Ready / Institutional Standard"
---

# Trading Engine: OMS, EMS, SOR, Pre-Trade Risk & Reconciliation

Esta skill gobierna la máquina de estados transaccional y los motores de decisión en tiempo real de una plataforma de trading institucional. Define con rigor matemático y arquitectónico cómo se valida el riesgo, cómo se orquestan las órdenes y cómo se garantiza la consistencia del balance.

---

## 1. El Flujo de Decisión Unidireccional

```
[ Petición Comercial / Estrategia ]
                 │
                 ▼
     ┌──────────────────────┐
     │   OMS (Intención)    │ ──► Genera client_order_id único (UUIDv7 / Nanoid)
     └──────────┬───────────┘
                 │
                 ▼
     ┌──────────────────────┐
     │  Risk Engine (Sínc.) │ ──► [DENY] ──► Rechazo Inmediato + Log de Auditoría
     └──────────┬───────────┘
                │ [APPROVE]
                ▼
     ┌──────────────────────┐
     │   SOR (Optimización) │ ──► Evalúa Profundidad L2, Slippage, Comisiones y Latencia
     └──────────┬───────────┘
                 │
                 ▼
     ┌──────────────────────┐
     │   EMS (Táctica)      │ ──► Fragmenta en Legs (TWAP, VWAP, IOC, FOK)
     └──────────┬───────────┘
                 │
                 ▼
     ┌──────────────────────┐
     │  Broker Adapters     │ ──► Disparo concurrente a Exchanges / Liquidity Providers
     └──────────────────────┘
```

---

## 2. OMS vs. EMS: Separación Conceptual Estricta

| Sistema | Pregunta Rectora | Responsabilidades |
| :--- | :--- | :--- |
| **OMS** (*Order Management System*) | **«¿Qué quiere hacer el usuario o la estrategia?»** | • Registra la intención comercial padre (ej. `BUY 10 BTC` o `BUY 10 Lotes EURUSD`).<br>• Asigna `client_order_id` inmutable.<br>• Consulta síncrona al Risk Engine.<br>• Persiste el estado inicial en base de datos (`PENDING`).<br>• Rastreará las piernas (*Order Legs*) subordinadas. |
| **EMS** (*Execution Management System*) | **«¿Cómo y dónde se ejecuta tácticamente?»** | • Divide la orden padre para minimizar impacto de mercado (*Market Impact*).<br>• Cripto: Exchange A $\to$ 4 BTC \| Exchange B $\to$ 3 BTC \| Exchange C $\to$ 3 BTC.<br>• Forex/CFD: MT5 $\to$ 3 Lotes \| cTrader $\to$ 3 Lotes \| FIX LP $\to$ 4 Lotes.<br>• Selecciona tipos de ejecución: `IOC` (Immediate or Cancel), `FOK` (Fill or Kill), `TWAP` o `VWAP`. |

---

## 3. Pre-Trade Risk Engine (Motor de Riesgo Síncrono en Memoria)

El Risk Engine actúa como la **última línea de defensa** inexpugnable. Se ejecuta de forma síncrona en memoria (<1 milisegundo) antes de que cualquier byte de la orden abandone el servidor hacia internet:

### Parámetros de Validación Obligatoria (Pre-Flight Checks)
1. **Límite de Pérdida Diaria (Daily Drawdown):**
   $$\text{Pérdida Hoy} = \text{Balance Inicial Día} - \text{Equidad Actual}$$
   Si $\text{Pérdida Hoy} \ge \text{Límite Diario Permitido} \implies \text{\textbf{RECHAZO INMEDIATO}}$ y activación de soft-lock.
2. **Exposición Máxima de Cartera:**
   - Exposición agregada total de la cuenta.
   - Exposición máxima por símbolo (ej. no más del 30% del capital en `SOL/USDT`).
   - Exposición máxima por venue/broker individual.
3. **Límite de Apalancamiento Máximo:**
   $$\text{Apalancamiento Efectivo} = \frac{\sum |\text{Posición Nocional}|}{\text{Equidad Libre}} \le \text{Apalancamiento Máximo}$$
4. **Límite de Frecuencia de Órdenes (Throttling / Circuit Breakers):**
   - Máximo de órdenes por segundo (ej. max 5 órdenes/segundo por cuenta) para evitar bucles infinitos de algoritmos erróneos.
5. **Deduplicación Estricta:** Detección de órdenes gemelas en ventanas de tiempo inferiores a 100ms.
6. **Kill Switch Global:** Bandera booleana en memoria capaz de suspender toda emisión de órdenes de emergencia con un solo comando administrativo.

---

## 4. Smart Order Router (SOR): Cálculo del Coste Real de Ejecución

El router inteligente **no elige simplemente el precio más bajo visible en el mejor bid/ask**. Calcula el coste efectivo integral:

$$\text{Coste Efectivo} = \text{Precio en el Libro} + \text{Comisiones Maker/Taker} + \text{Slippage Proyectado} + \text{Coste de Latencia}$$

### Algoritmo de Evaluación de Profundidad L2 (VWAP Slippage)
Para una orden de compra de volumen $V$:
$$P_{\text{VWAP}} = \frac{\sum_{i=1}^{k} P_i \times Q_i}{V}$$
Donde se consumen los niveles $1 \dots k$ del libro de órdenes ask hasta que $\sum_{i=1}^k Q_i = V$.

Variables de ponderación adicionales en el SOR:
- **Latencia estimada de red hacia el conector** (medida en ms).
- **Probabilidad de Fill:** Frecuencia histórica de rechazo del broker en condiciones de alta volatilidad.
- **Balance Colateral Disponible:** Distribución de margen libre en cada cuenta conectada.

---

## 5. Idempotencia Transaccional con Redis NX

Para garantizar que un reintento de red, reconexión de worker o caída transitoria jamás envíe dos veces la misma orden al mercado:

```python
import redis.asyncio as redis

async def acquire_order_idempotency_lock(redis_client: redis.Redis, client_order_id: str) -> bool:
    """
    Intenta fijar la clave en Redis de manera atómica (NX = Not eXists)
    con un tiempo de vida (TTL) de 24 horas (86400 segundos).
    """
    key = f"idempotency:order:{client_order_id}"
    is_new = await redis_client.set(key, "PROCESSING", nx=True, ex=86400)
    return bool(is_new)
```

- **Si la clave ya existe:** El sistema aborta la llamada a la red externa y devuelve la representación del estado actual de la orden existente.
- **Si la clave es nueva:** Procede a la ejecución y actualiza el valor con el estado final una vez confirmado.

---

## 6. Reconciliation Service (Principio de Verdad Absoluta)

> **"El estado reportado por el broker o exchange externo es siempre la fuente final incuestionable de verdad."**

La reconciliación continua neutraliza desincronizaciones provocadas por caídas de red, fills parciales no notificados por WebSocket, o liquidaciones forzosas en el exchange:

```
[ Estado Local en DB / Memoria ] ◄──► [ Consulta REST / FIX al Venue ]
                                                │
                                         ¿Hay Discrepancia?
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                                  [ NO ]                  [ SÍ ]
                                    │                       │
                                Continuar           Actualizar Base de Datos Local
                                                  Emitir Evento 'PositionCorrected'
                                                  Registrar Log Forense de Auditoría
```

### Rutinas de Reconciliación
1. **Reconciliación en Frío (Cold Sync):** Se ejecuta al iniciar el servicio para rehidratar el estado de órdenes abiertas, balances y posiciones.
2. **Reconciliación en Caliente (Continuous Heartbeat Sync):** Worker en segundo plano que consulta cada 30-60 segundos el estado real de todas las cuentas activas para cotejarlo con el snapshot local.
3. **Reconciliación Post-Error:** Disparo inmediato tras recibir una excepción de timeout de red en una orden enviada.

---

## 7. Event Bus Asíncrono y Eventos de Dominio

El ciclo de órdenes propaga eventos a través de un bus pub/sub (Redis Streams / In-Memory Bus):

```
       ┌─────────────┐
       │ OrderFilled │
       └──────┬──────┘
              │
  ┌───────────┼───────────────┬────────────────┬──────────────┐
  ▼           ▼               ▼                ▼              ▼
Portfolio   PnL Service   Risk Engine    Reconciliation   Supabase DB
Service     (Calcula      (Actualiza     Service          (Persistencia)
(Inventario) Ganancia)    Márgenes)                       & Realtime UI
```

### Eventos Canónicos del Dominio
- `OrderCreated`: Orden registrada en el OMS.
- `OrderAccepted`: Confirmada por el exchange.
- `OrderPartiallyFilled`: Ejecución parcial reportada.
- `OrderFilled`: Ejecución completa.
- `OrderCancelled`: Cancelación verificada.
- `OrderRejected`: Rechazo con motivo codificado.
- `RiskLimitTriggered`: Violación de parámetro de riesgo detectada.
- `PositionUpdated`: Cambio en exposición o precio medio.

---

## 8. Checklist de Verificación para Agentes de IA

- [ ] ¿El Risk Engine se ejecuta de forma **síncrona en memoria** antes de invocar los adaptadores externos?
- [ ] ¿El SOR calcula el coste real considerando la profundidad L2 del orderbook y las comisiones de maker/taker?
- [ ] ¿Cada orden cuenta con un cerrojo de idempotencia en Redis con `client_order_id` antes del envío?
- [ ] ¿El servicio de reconciliación tiene prioridad para sobreescribir el estado local ante discrepancias con el exchange?
- [ ] ¿Se disparan eventos asíncronos limpios hacia el bus de eventos en cada transición de estado de orden?
