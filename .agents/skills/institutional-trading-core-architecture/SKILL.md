---
name: institutional-trading-core-architecture
description: "Directrices de arquitectura limpia hexagonal (Ports & Adapters) para plataformas de trading institucional multi-exchange y multi-broker con estricto desacoplamiento de dominio."
version: "2.0.0"
category: "Fintech & Algorithmic Trading Architecture"
author: "AI Studio Fintech Systems Architect"
status: "Production Ready / Institutional Standard"
---

# Institutional Trading Core Architecture (Hexagonal / Ports & Adapters)

Esta skill proporciona las directrices imperativas y patrones arquitectónicos para diseñar y construir el núcleo de una plataforma de trading institucional, multi-exchange, multi-broker y multi-cuenta, garantizando desacoplamiento estricto, concurrencia asíncrona de alto rendimiento y resiliencia de datos.

---

## 1. Axioma Rector y Regla Fundamental

> **"El negocio prevalece sobre los adaptadores."**

La lógica del dominio comercial y los casos de uso deben ser **100% agnósticos** respecto a las implementaciones de proveedores externos. Sustituir o añadir un conector (Binance, Bybit, MetaTrader 4, MetaTrader 5, cTrader o un motor FIX institucional) no debe alterar una sola línea del dominio ni requerir modificaciones en el núcleo de la aplicación.

### Reglas de Aislamiento Estricto (Prohibiciones Inquebrantables)
- **PROHIBIDO** importar `ccxt` en cualquier parte del sistema salvo dentro de `infrastructure/connectivity/ccxt/`.
- **PROHIBIDO** importar `MetaTrader5` desde servicios de aplicación, casos de uso o entidades de dominio.
- **PROHIBIDO** importar librerías propietarias como `ctrader_open_api` o `quickfix` en el dominio o la lógica de negocio.
- **PROHIBIDO** acoplar el dominio a drivers de bases de datos (`asyncpg`, `sqlalchemy`, `@supabase/supabase-js`, `redis`).
- Todas las librerías externas de conectividad, almacenamiento y transporte deben residir estrictamente en la capa de `infrastructure/`.

---

## 2. Los Tres Planos de la Plataforma

Toda la infraestructura se particiona en tres planos funcionales con responsabilidades desacopladas:

| Plano | Responsabilidad Principal | Componentes Clave |
| :--- | :--- | :--- |
| **Control Plane** | Gobernanza, seguridad, configuración y metadatos | Gestión de usuarios, autenticación JWT/RBAC, límites de riesgo institucionales, asignación de permisos, auditoría corporativa. |
| **Trading Plane** | Operación y toma de decisiones en tiempo real | Order Management System (OMS), Execution Management System (EMS), Smart Order Router (SOR), Pre-Trade Risk Engine, Reconciliation Engine, Motores de Estrategia cuantitativa. |
| **Connectivity Plane** | Comunicación externa y normalización de protocolos | Adaptadores CCXT, Gateways MT4/MT5, Clientes cTrader Open API Protobuf, QuickFIX Engine, Clientes WebSockets/REST externos. |

---

## 3. Jerarquía Unidireccional de Capas

El flujo de dependencias sigue el estándar de Arquitectura Limpia / Hexagonal:

```
┌────────────────────────────────────────────────────────┐
│                      DOMAIN                            │
│  (Entidades, Value Objects, Enums, Eventos de Dominio) │
│           *Cero dependencias externas*                 │
└──────────────────────────▲─────────────────────────────┘
                           │
┌──────────────────────────┴─────────────────────────────┐
│                    APPLICATION                         │
│  (Casos de Uso, Servicios de Orquestación, Comandos)   │
└──────────────────────────▲─────────────────────────────┘
                           │
┌──────────────────────────┴─────────────────────────────┐
│                 PORTS / INTERFACES                     │
│  (Contratos abstractos: Broker, MarketData, Repos)    │
└──────────────────────────▲─────────────────────────────┘
                           │
┌──────────────────────────┴─────────────────────────────┐
│                   INFRASTRUCTURE                       │
│  (Adaptadores CCXT, MT4, MT5, cTrader, FIX, Redis, DB) │
└──────────────────────────▲─────────────────────────────┘
                           │
┌──────────────────────────┴─────────────────────────────┐
│                 EXTERNAL PROVIDERS                     │
│  (CEXs, DEXs, LPs, Terminales, Pasarelas de Pago)      │
└────────────────────────────────────────────────────────┘
```

---

## 4. Modelos de Dominio y Value Objects Canónicos (Python/Pydantic/Dataclasses)

El dominio opera únicamente con tipos puros e inmutables:

```python
from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime
from enum import Enum
from typing import Optional

@dataclass(frozen=True)
class Symbol:
    base: str
    quote: str

    @property
    def value(self) -> str:
        return f"{self.base.upper()}/{self.quote.upper()}"

    def __str__(self) -> str:
        return self.value

class OrderSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class OrderType(str, Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"
    STOP = "STOP"
    STOP_LIMIT = "STOP_LIMIT"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    OPEN = "OPEN"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    FILLED = "FILLED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    UNKNOWN = "UNKNOWN"

@dataclass
class Order:
    id: str
    client_order_id: Optional[str]
    exchange: str
    account_id: str
    symbol: Symbol
    side: OrderSide
    type: OrderType
    amount: Decimal
    price: Optional[Decimal]
    filled: Decimal
    remaining: Decimal
    status: OrderStatus
    timestamp: datetime

@dataclass
class Position:
    account_id: str
    symbol: Symbol
    quantity: Decimal
    entry_price: Decimal
    mark_price: Decimal
    unrealized_pnl: Decimal
    realized_pnl: Decimal

@dataclass
class Balance:
    account_id: str
    asset: str
    free: Decimal
    locked: Decimal
    total: Decimal
```

---

## 5. Contratos de Puertos (Ports / Interfaces Universales)

### Separación Estricta: Market Data vs. Trading
Para evitar acoplamiento indebido, los puertos separan la lectura de mercado de la ejecución transaccional:

```python
from abc import ABC, abstractmethod
from typing import List, Optional
from decimal import Decimal

class MarketDataProvider(ABC):
    @abstractmethod
    async def get_ticker(self, symbol: Symbol) -> dict:
        """Obtiene el último precio, bid y ask."""
        pass

    @abstractmethod
    async def get_orderbook(self, symbol: Symbol, depth: int = 20) -> dict:
        """Obtiene profundidad de mercado Nivel 2."""
        pass

    @abstractmethod
    async def subscribe_orderbook_stream(self, symbol: Symbol, callback) -> None:
        """Suscripción reactiva a WebSocket de cotizaciones en tiempo real."""
        pass

class TradingProvider(ABC):
    @abstractmethod
    async def get_balance(self) -> List[Balance]:
        pass

    @abstractmethod
    async def get_positions(self) -> List[Position]:
        pass

    @abstractmethod
    async def place_order(self, order_request: dict) -> Order:
        pass

    @abstractmethod
    async def cancel_order(self, order_id: str, symbol: Symbol) -> bool:
        pass

    @abstractmethod
    async def modify_order(self, order_id: str, symbol: Symbol, new_price: Decimal, new_amount: Decimal) -> Order:
        pass
```

### Puerto Universal de Broker (`Broker Port`)
```python
class BrokerPort(TradingProvider, MarketDataProvider, ABC):
    @property
    @abstractmethod
    def broker_id(self) -> str:
        """Identificador único del broker/exchange (ej. bybit_perps, mt5_broker_a)."""
        pass

    @abstractmethod
    async def connect(self) -> None:
        pass

    @abstractmethod
    async def disconnect(self) -> None:
        pass

    @abstractmethod
    async def check_health(self) -> dict:
        """Devuelve latencia, estado de sockets y estado de autenticación."""
        pass
```

---

## 6. Arquitectura de Estado y Persistencia Políglota

El sistema combina tres tecnologías de almacenamiento según la criticidad de latencia y durabilidad:

```
[ Ingesta WebSocket / Ticks ] ──► [ RAM (In-Memory Buffer) ] (Ultra-baja latencia <1ms)
                                           │
                                  Snapshot periódico
                                           ▼
[ Redis 7 (Hot State) ] ◄──► [ Colas de Eventos, Idempotency Keys (NX), Distributed Locks (Redlock) ]
         │
    Persistencia Auditada
         ▼
[ PostgreSQL 16 / Supabase ] (Fuente de Verdad Definitiva: Cuentas, Órdenes, Fills, Auditoría, RLS)
```

1. **RAM (En Memoria):** Almacenamiento de microsegundos para libros de órdenes L2 y cálculo de VWAP en tiempo real.
2. **Redis:**
   - Caché de estado compartido entre workers de microservicios.
   - Bloqueos distribuidos (*Redlock*) para operaciones concurrentes sobre la misma cuenta.
   - Control de idempotencia transaccional con expiración TTL (`SET client_order_id NX EX 86400`).
3. **PostgreSQL / Supabase:**
   - Repositorio central de la "Verdad Única".
   - Almacena histórico de operaciones, auditoría financiera, perfiles, reglas de riesgo y snapshots de cartera.
   - Políticas de seguridad por fila (*Row Level Security - RLS*) activas en todas las tablas transaccionales.

---

## 7. Esquema de Base de Datos Relacional (PostgreSQL)

```sql
-- Tablas del Core Institucional
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'trader',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_type VARCHAR(50) NOT NULL, -- 'personal_saas', 'challenge_eval', 'funded_real'
    currency VARCHAR(10) NOT NULL DEFAULT 'USDT',
    balance NUMERIC(28, 8) NOT NULL DEFAULT 0,
    equity NUMERIC(28, 8) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE broker_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    venue_type VARCHAR(50) NOT NULL, -- 'bybit', 'okx', 'mt5', 'ctrader', 'quickfix'
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    passphrase_encrypted TEXT,
    subaccount_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    client_order_id VARCHAR(100) UNIQUE NOT NULL,
    venue VARCHAR(50) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    side VARCHAR(10) NOT NULL,
    order_type VARCHAR(20) NOT NULL,
    amount NUMERIC(28, 8) NOT NULL,
    price NUMERIC(28, 8),
    filled_amount NUMERIC(28, 8) DEFAULT 0,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    external_fill_id VARCHAR(100) NOT NULL,
    price NUMERIC(28, 8) NOT NULL,
    amount NUMERIC(28, 8) NOT NULL,
    fee NUMERIC(28, 8) NOT NULL,
    fee_currency VARCHAR(10) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE risk_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id),
    rule_breached VARCHAR(100) NOT NULL,
    action_taken VARCHAR(100) NOT NULL,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Jerarquía Canónica de Excepciones

Todos los errores procedentes de adaptadores externos (CCXT, MT5, MT4, cTrader, QuickFIX) **deben traducirse obligatoriamente** a la jerarquía de excepciones canónicas del dominio:

```python
class TradingError(Exception):
    """Excepción raíz para cualquier anomalía en el motor de trading."""
    def __init__(self, message: str, raw_error: Optional[Exception] = None):
        super().__init__(message)
        self.raw_error = raw_error

class ConnectionError(TradingError):
    """Pérdida de conectividad con el exchange, socket desconectado o timeout de red."""
    pass

class OrderRejectedError(TradingError):
    """Rechazo explícito del venue (fondos insuficientes, fuera de bandas de precio)."""
    pass

class RateLimitError(TradingError):
    """Excedido el límite de peticiones por segundo en la API externa."""
    pass

class InsufficientBalanceError(TradingError):
    """Balance colateral libre insuficiente para cubrir el margen exigido."""
    pass

class ReconciliationError(TradingError):
    """Discrepancia insalvable entre el estado reportado por el venue y el estado local."""
    pass
```

---

## 9. Estructura de Directorios Recomendada para el Repositorio

```
trading-platform/
├── app/
│   ├── domain/
│   │   ├── entities/          # Order, Position, Balance, Account
│   │   ├── value_objects/     # Symbol, Price, Quantity
│   │   ├── enums/             # OrderSide, OrderType, OrderStatus
│   │   └── events/            # OrderCreated, OrderFilled, RiskBreached
│   ├── application/
│   │   ├── services/          # PortfolioService, PnLService, ReconciliationService
│   │   └── use_cases/         # PlaceOrderUseCase, CancelOrderUseCase, SyncAccountsUseCase
│   ├── ports/
│   │   ├── broker_port.py
│   │   ├── market_data_port.py
│   │   ├── execution_port.py
│   │   ├── repository_port.py
│   │   └── event_bus_port.py
│   ├── infrastructure/
│   │   ├── connectivity/      # Adaptadores CCXT, MT4, MT5, cTrader, FIX
│   │   ├── persistence/       # Adaptadores Supabase / PostgreSQL
│   │   ├── cache/             # Redis Cache y Distributed Locks
│   │   └── messaging/         # Event Bus Redis Streams / RabbitMQ
│   ├── api/
│   │   ├── routes/            # Endpoints FastAPI
│   │   └── dependencies.py    # Inyección de dependencias
│   └── main.py
├── tests/
│   ├── unit/                  # Tests unitarios del dominio (sin mocks externos)
│   ├── integration/           # Tests de adaptadores contra sandboxes
│   └── architecture/          # Linter de imports prohibidos
├── pyproject.toml
└── README.md
```

---

## 10. Puerto Canónico de Telemetría y Notificaciones Telegram (`ITelemetryNotificationPort`)

Siguiendo el principio de **Arquitectura Hexagonal**, el sistema de notificaciones y telemetría de Telegram se modela como un **Puerto de Salida (Outbound Port)** en `domain/ports/telemetry_notification_port.py`, totalmente desacoplado de la API externa de Telegram:

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class ITelemetryNotificationPort(ABC):
    @abstractmethod
    async def send_private_alert(self, telegram_id: int, title: str, message: str, level: str) -> bool:
        """Emite una alerta privada 1 a 1 (Take Profit, Stop Loss, Margin Call, Fills)."""
        pass

    @abstractmethod
    async def broadcast_team_signal(self, group_chat_id: int, signal_payload: Dict[str, Any]) -> bool:
        """Publica una tesis o evento colaborativo en el grupo de equipo sin exponer saldos privados."""
        pass

    @abstractmethod
    async def notify_system_incident(self, group_chat_id: int, error_code: str, details: str) -> bool:
        """Alerta de latencia alta, fallo de reconciliación o reconexión de WebSockets."""
        pass
```

### Reglas de Dominio para Telegram
1. **El Dominio nunca importa librerías de Telegram:** Todo residirá en `infrastructure/messaging/telegram_adapter.py`.
2. **Aislamiento Multi-Tenant Estricto:** Toda notificación transaccional se enruta por el `telegram_id` del usuario autenticado; los canales y grupos de equipo nunca reciben datos de balance, claves API o posiciones individuales en dólares.

---

## 11. Checklist de Verificación para Agentes de IA

Antes de marcar cualquier tarea de este núcleo como completa, el agente debe verificar:
- [ ] ¿Hay algún `import ccxt` o `import MetaTrader5` fuera de `infrastructure/`? Si es así, **refactorizar inmediatamente**.
- [ ] ¿Todos los precios, balances y cantidades usan `Decimal` en lugar de floats de punto flotante?
- [ ] ¿Cada orden despachada incluye un `client_order_id` persistido antes de invocar la red externa?
- [ ] ¿Todas las excepciones de conectores externos están capturadas y mapeadas a `TradingError`?
- [ ] ¿Se garantiza la idempotencia en la capa de mensajería y APIs?
- [ ] ¿El adaptador de Telegram implementa `ITelemetryNotificationPort` sin acoplar el dominio a APIs externas?
- [ ] ¿Se garantiza que los mensajes grupales nunca expongan saldo en dinero real ni datos privados?

