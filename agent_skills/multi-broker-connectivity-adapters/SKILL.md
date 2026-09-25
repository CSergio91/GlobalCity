---
name: multi-broker-connectivity-adapters
description: "Ingeniería de adaptadores de conectividad multiactivo para CCXT, MetaTrader 4, MetaTrader 5, cTrader (Protobuf) y QuickFIX Engine con streaming en tiempo real y normalización de símbolos."
version: "2.0.0"
category: "Fintech Connectivity & Market Ingestion"
author: "AI Studio Fintech Systems Architect"
status: "Production Ready / Institutional Standard"
---

# Multi-Broker Connectivity Adapters (CCXT, MT4, MT5, cTrader & QuickFIX)

Esta skill proporciona los estándares de ingeniería y patrones de implementación para conectar de forma concurrente y desacoplada una plataforma de trading con múltiples proveedores heterogéneos de liquidez y ejecución: exchanges de criptomonedas (vía CCXT), terminales MetaTrader 4 y 5, cTrader Open API y pasarelas institucionales FIX.

---

## 1. Topología del Connectivity Plane

```
                          ┌───────────────────────────┐
                          │       TRADING CORE        │
                          │     (BrokerPort / VAL)    │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
 ┌─────────▼─────────┐        ┌─────────▼─────────┐        ┌─────────▼─────────┐
 │   CCXT Adapter    │        │   cTrader Client  │        │  QuickFIX Engine  │
 │  (Async REST/WS)  │        │  (Protobuf / TCP) │        │ (FIX 4.4 / 5.0)   │
 └─────────┬─────────┘        └─────────┬─────────┘        └─────────┬─────────┘
           │                            │                            │
 ┌─────────▼─────────┐        ┌─────────▼─────────┐        ┌─────────▼─────────┐
 │ Crypto Exchanges  │        │ cTrader Platform  │        │ Prime Brokers/LPs │
 │  (Binance/Bybit)  │        │  (Spotware Cloud) │        │   (Institutional) │
 └───────────────────┘        └───────────────────┘        └───────────────────┘

           │                            │
 ┌─────────▼─────────┐        ┌─────────▼─────────┐
 │    MT5 Gateway    │        │    MT4 Bridge     │
 │ (ZeroMQ / HTTP)   │        │ (EA Socket TCP)   │
 └─────────┬─────────┘        └─────────┬─────────┘
           │                            │
 ┌─────────▼─────────┐        ┌─────────▼─────────┐
 │   MT5 Terminal    │        │   MT4 Terminal    │
 │ (Windows Host)    │        │ (Wine / Windows)  │
 └───────────────────┘        └───────────────────┘
```

---

## 2. Regla Fundamental de Canales: Streaming vs. REST

| Canal | Responsabilidad | Regla de Diseño |
| :--- | :--- | :--- |
| **STREAMING (WebSockets / TCP)** | Tickers, libros de órdenes Nivel 2, trades públicos, actualizaciones de órdenes y fills, eventos de cuenta en tiempo real. | **NUNCA diseñar la arquitectura alrededor de polling continuo.** Si el broker soporta WebSockets o TCP streaming, la escucha reactiva es obligatoria. |
| **REST API** | Obtención de balances al inicio, catálogos de instrumentos, históricos estáticos y rondas periódicas de reconciliación. | Peticiones puntuales no bloqueantes ejecutadas en hilos de background o mediante clientes asíncronos (`aiohttp`, `httpx`). |

---

## 3. Normalizador Bidireccional de Símbolos (`SymbolMapper`)

Cada broker o exchange impone una nomenclatura arbitraria. El sistema debe convertir bidireccionalmente entre el símbolo canónico del dominio y el formato del venue:

```python
class SymbolMapper:
    def __init__(self, mapping_rules: dict):
        # mapping_rules = {"EUR/USD": "EURUSD.pro", "BTC/USDT": "BTCUSDT.P"}
        self._canonical_to_native = mapping_rules
        self._native_to_canonical = {v: k for k, v in mapping_rules.items()}

    def to_native(self, canonical_symbol: str) -> str:
        """Convierte 'EUR/USD' a 'EURUSD.pro' o 'BTC/USDT' a 'BTCUSDT'."""
        if canonical_symbol in self._canonical_to_native:
            return self._canonical_to_native[canonical_symbol]
        # Regla por defecto de eliminación de barra
        return canonical_symbol.replace("/", "")

    def to_canonical(self, native_symbol: str) -> str:
        """Convierte 'BTCUSDT' o 'EURUSD.pro' al canónico de dominio."""
        return self._native_to_canonical.get(native_symbol, native_symbol)
```

---

## 4. Adaptador Crypto: CCXT (`infrastructure/connectivity/ccxt/`)

### Características Obligatorias
- Emplear exclusivamente la versión asíncrona de CCXT (`ccxt.pro` para WebSockets y `ccxt.async_support` para REST).
- Normalización obligatoria de tipos de orden (`market`, `limit`) y estados de orden a los enums canónicos de la plataforma.
- Implementación de control determinista de *Rate Limits* y reintentos con *Backoff Exponencial*.

```python
import ccxt.pro as ccxtpro
import asyncio
from typing import Dict, Any

class CcxtExchangeAdapter:
    def __init__(self, exchange_id: str, api_key: str, api_secret: str):
        exchange_class = getattr(ccxtpro, exchange_id)
        self.exchange = exchange_class({
            'apiKey': api_key,
            'secret': api_secret,
            'enableRateLimit': True,
            'options': {'defaultType': 'swap'} # Perpetuos por defecto
        })
        self.is_running = False

    async def watch_order_book(self, canonical_symbol: str, callback):
        native_symbol = canonical_symbol # Mapeado previo
        while self.is_running:
            try:
                orderbook = await self.exchange.watch_order_book(native_symbol)
                await callback(orderbook)
            except Exception as e:
                # Mapear a TradingError y reintentar con backoff
                await asyncio.sleep(2)
```

---

## 5. Adaptadores MetaTrader: MT5 y MT4

### MetaTrader 5 (MT5 Bridge & Terminal)
La terminal oficial de MetaTrader 5 opera nativamente en sistemas Windows y no proporciona una API REST estándar.

#### Proyectos Open Source de Referencia
1. **`monki103/pyMt5Bridge`:** Servidor HTTP REST (Flask/FastAPI) que corre junto a la terminal en Windows y expone endpoints limpios para el backend Linux.
2. **`PTHAICAP/mt5-python-bridge`:** Puente de alta velocidad basado en ZeroMQ/WebSockets.
3. **`elitekaycy/mt5-gateway`:** Gateway estructurado para exponer órdenes y streaming transaccional.

#### Desafíos Críticos de Implementación en MT5
- **Netting vs. Hedging:** El conector debe detectar el tipo de cuenta. En cuentas *Netting*, múltiples órdenes sobre el mismo símbolo consolidan en una sola posición; en *Hedging*, coexisten posiciones independientes con tickets únicos.
- **Sufijos de Broker:** Normalizar símbolos con sufijos personalizados (ej. `EURUSD.pro`, `EURUSDm`, `GBPUSD_i`).
- **Filling Modes:** Validar compatibilidad de ejecución según el broker:
  - `ORDER_FILLING_FOK` (Fill or Kill)
  - `ORDER_FILLING_IOC` (Immediate or Cancel)
  - `ORDER_FILLING_RETURN` (Permite fills parciales)

### MetaTrader 4 (MT4 Bridge)
MT4 carece de API nativa en Python. La arquitectura debe usar un **Expert Advisor (EA)** en MQL4 que escuche en un socket TCP local o ZeroMQ:
```
Trading Core (Linux) ──► TCP Socket / ZeroMQ ──► MT4 EA (MQL4 en Windows/Wine) ──► MT4 Server
```
- Control de **Requotes y Slippage:** El adaptador debe registrar y rechazar deslizamientos fuera de tolerancia configurada.

---

## 6. Adaptador cTrader: Spotware Open API (`spotware/OpenApiPy`)

### Características de Conexión
- Protocolo binario de alto rendimiento basado en **Google Protocol Buffers (Protobuf)** sobre TCP con encriptación TLS.
- Autenticación mediante tokens OAuth2 corporativos de Spotware Connect.

### Manejo de Concurrencia (Twisted vs. Asyncio)
La librería de referencia `OpenApiPy` de Spotware se basa históricamente en el framework `Twisted`. En un backend basado en Python 3.12 y `asyncio`:
- **Regla Estricta:** No ejecutar el reactor de Twisted en el bucle principal de asyncio.
- **Solución:** Correr el cliente de cTrader en un proceso worker desacoplado o utilizar el wrapper `twisted.internet.asyncioreactor` instalado antes de iniciar el event loop.

---

## 7. Adaptador Institucional: QuickFIX Engine (`quickfix/quickfix`)

Para conexiones directas con Prime Brokers y Liquidity Providers (LPs) bajo especificaciones FIX 4.2, 4.4, 5.0 y FIXT 1.1:

```
Trading Core ──► QuickFIX Adapter ──► QuickFIX Session (TLS) ──► Liquidity Provider
```

### Máquina de Estados de Mensajería FIX Requerida
- `35=A` (Logon): Negociación de credenciales institucionales y reseteo de secuencia.
- `35=0` (Heartbeat): Monitoreo de latencia y estado de sesión cada $N$ segundos.
- `35=2` (Resend Request): Petición automática de mensajes perdidos tras una interrupción de red.
- `35=D` (New Order Single): Envío de instrucciones tácticas.
- `35=8` (Execution Report): Procesamiento de confirmaciones de fills, rechazos y cancelaciones.
- `35=F` (Order Cancel Request): Cancelaciones de emergencia.

### Aislamiento de QuickFIX
- Ningún puntero, objeto o clase nativa de C++ de QuickFIX debe propagarse fuera de `infrastructure/connectivity/fix/`.
- Todos los mensajes entrantes se deserializan a eventos de dominio de Python (`OrderFilled`, `OrderRejected`).

---

## 8. Dashboard de Salud y Latencia de Conectores (`Broker Health`)

Todo adaptador debe emitir métricas periódicas cada 5 segundos al bus de observabilidad:

```json
{
  "timestamp": "2026-09-25T07:12:00Z",
  "venues": {
    "bybit_perps": {"status": "ONLINE", "latency_ms": 18, "ws_connected": true},
    "okx_dma": {"status": "ONLINE", "latency_ms": 22, "ws_connected": true},
    "mt5_broker_a": {"status": "ONLINE", "latency_ms": 14, "bridge_heartbeat": true},
    "ctrader_live": {"status": "ONLINE", "latency_ms": 25, "protobuf_queue_size": 0},
    "quickfix_lp1": {"status": "ONLINE", "latency_ms": 4, "seq_in": 14205, "seq_out": 14205}
  }
}
```

---

## 9. Checklist de Verificación para Agentes de IA

- [ ] ¿El adaptador reconecta automáticamente tras una pérdida de socket con reintentos exponenciales?
- [ ] ¿El `SymbolMapper` está configurado para traducir símbolos canónicos antes de tocar la API del exchange?
- [ ] ¿Los streams de WebSockets alimentan buffers en memoria sin bloquear el bucle de eventos asíncrono?
- [ ] ¿Las claves de API y secretos se reciben descifrados en memoria y nunca se registran en los logs de consola?
- [ ] ¿Los mensajes FIX mantienen la persistencia de número de secuencia para evitar desincronizaciones transaccionales?
