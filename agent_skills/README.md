# 🧠 Institutional AI Agent Skills Repository: Trading & Prop Firm Infrastructure

Este repositorio contiene la suite completa de **Skills Estandarizadas para Agentes de IA** (compatibles con Claude Code, Cursor, Windsurf, OpenAI Swarm, AutoGen, CrewAI y GitHub Copilot).

Cada skill define con máxima rigurosidad técnica, matemática, regulatoria y de código las especificaciones para diseñar, implementar y desplegar una plataforma de trading institucional multi-exchange y una empresa de fondeo (*Prop Trading Firm*) con ejecución real.

---

## 📚 Catálogo Completo de Skills

| Skill | Directorio | Ámbito Técnico y Funcional |
| :--- | :--- | :--- |
| **1. Arquitectura Hexagonal del Core** | [`institutional-trading-core-architecture`](./institutional-trading-core-architecture/SKILL.md) | Principio de desacoplamiento *"el negocio prevalece sobre los adaptadores"*, puertos y adaptadores, modelos de dominio puros, base de datos relacional y jerarquía de excepciones canónicas. |
| **2. Conectividad y Adaptadores** | [`multi-broker-connectivity-adapters`](./multi-broker-connectivity-adapters/SKILL.md) | Adaptadores de baja latencia para CCXT, MetaTrader 4, MetaTrader 5 (Windows Gateways), cTrader (Protobuf) y QuickFIX Engine (FIX 4.4/5.0) con normalización de símbolos. |
| **3. Ciclo de Vida Transaccional** | [`trading-engine-oms-ems-risk`](./trading-engine-oms-ems-risk/SKILL.md) | Orquestación OMS vs EMS táctico, Smart Order Router (SOR) con VWAP L2, Pre-Trade Risk Engine síncrono en memoria (<1ms), reconciliación y cerrojos de idempotencia en Redis. |
| **4. Operaciones de Prop Firm Cripto** | [`crypto-prop-firm-operations-and-venues`](./crypto-prop-firm-operations-and-venues/SKILL.md) | Modelo híbrido de ejecución real auditable en libros de órdenes, programas de corretaje CEX (Bybit API v5, OKX DMA), alternativa on-chain en Hyperliquid L1 (Agent Wallets + Builder Codes). |
| **5. Riesgo y Gobernanza Financiera** | [`prop-firm-risk-and-financial-governance`](./prop-firm-risk-and-financial-governance/SKILL.md) | Modelado de unit economics (1.000 retos / 34,8% margen neto), punto de equilibrio (~370 retos/mes), regla de solvencia de ratio $\ge 2,0$, End-of-Day drawdown y consistencia del 40%. |
| **6. Marco Legal, Fiscal y Pasarelas** | [`prop-firm-legal-regulatory-and-payments`](./prop-firm-legal-regulatory-and-payments/SKILL.md) | Dicotomía legal educación vs intermediación, estructura societaria dual, análisis forense CFTC vs MFF, contratos B2B con W-8BEN/W-9 y mitigación de contracargos Visa VAMP / Mastercard ECP. |
| **7. Arbitraje Cripto Sintético** | [`crypto-synthetic-arbitrage-engine`](./crypto-synthetic-arbitrage-engine/SKILL.md) | Arbitraje simultáneo en sub-100ms con cuentas prefondeadas, cálculo de profundidad VWAP L2, despacho concurrente asíncrono, rollback automático y modelo Gas Tank. |
| **8. Estrategia de Producto Bifásico** | [`biphasic-saas-to-propfirm-strategy`](./biphasic-saas-to-propfirm-strategy/SKILL.md) | Lanzamiento en Fase 1 mediante Terminal SaaS B2C no custodial para monetizar desde el día 1, construyendo el 85% del stack tecnológico antes de abrir el módulo Prop Firm. |
| **9. Sistema de Diseño & Landing Page** | [`global-city-design-system-and-landing-spec`](./global-city-design-system-and-landing-spec/SKILL.md) | Dirección estética oscura premium, acentos rose-mauve/copper, tipografía Plus Jakarta Sans / JetBrains Mono, iconografía Bootstrap/Lucide, copywriting no genérico y arquitectura bento-grid. |
| **10. Optimización y Rendimiento Web** | [`web-performance-asset-caching-and-resource-optimization`](./web-performance-asset-caching-and-resource-optimization/SKILL.md) | Políticas de caché inmutable a 1 año (max-age 31536000s), Service Worker, decodificación asíncrona, SVGs vectoriales inline y aceleración de animación por GPU. |
| **11. Servidor MCP & Agente IA** | [`mcp-server-and-llm-agent-architecture`](./mcp-server-and-llm-agent-architecture/SKILL.md) | Arquitectura Model Context Protocol (MCP), dock de chat conversacional minimalista (Grok/ChatGPT style), schemas de tools JSON-RPC y recursos unificados. |

---

## ⚡ PROTOCOLO MANDATORIO: Auditoría de Skills Previa a la Implementación Pesada (Redis, RAM & Caching)

> **REGLA ABSOLUTA PARA EL AGENTE:** Antes de implementar cualquier lógica transaccional, de cálculo o de backend, **es OBLIGATORIO consultar las skills de optimización**. No se permite codificar de memoria sin verificar los estándares ya definidos:

### 1. Dónde Aplicar Redis 7 (Hot State & Caching)
- **Cerrojos de Idempotencia Transaccional (Redis NX):**
  - *Skill:* [`trading-engine-oms-ems-risk`](./trading-engine-oms-ems-risk/SKILL.md#5-idempotencia-transaccional-con-redis-nx)
  - *Comando:* `SET idempotency:order:{client_order_id} PROCESSING NX EX 86400`.
  - *Propósito:* Garantiza que un reintento de red jamás envíe una orden duplicada a Bybit, OKX o MT5.
- **Distributed Locks (Redlock):**
  - *Skill:* [`institutional-trading-core-architecture`](./institutional-trading-core-architecture/SKILL.md#6-arquitectura-de-estado-y-persistencia-políglota)
  - *Propósito:* Evita condiciones de carrera al calcular margen libre o despachar órdenes concurrentes sobre la misma subcuenta.
- **Event Bus de Dominio (Redis Streams / In-Memory Pub/Sub):**
  - *Skill:* [`trading-engine-oms-ems-risk`](./trading-engine-oms-ems-risk/SKILL.md#7-event-bus-asíncrono-y-eventos-de-dominio)
  - *Propósito:* Propagar eventos `OrderFilled`, `PositionCorrected` y `MarginCallAlert` de forma asíncrona no bloqueante.

### 2. Dónde Aplicar Buffers en Memoria RAM (< 1ms)
- **Libros de Órdenes L2 y Cálculo VWAP:**
  - *Skills:* [`crypto-synthetic-arbitrage-engine`](./crypto-synthetic-arbitrage-engine/SKILL.md) y [`institutional-trading-core-architecture`](./institutional-trading-core-architecture/SKILL.md#6-arquitectura-de-estado-y-persistencia-políglota)
  - *Propósito:* Mantener las cotizaciones y spreads en estructuras en memoria viva para ejecución en sub-10ms antes de emitir snapshots periódicos a Redis o base de datos.

### 3. Dónde Aplicar Cero Redundancia de Red & Caché de Assets
- **1 Única Conexión WebSocket Multiplexada (Singleton Pub/Sub):**
  - *Skill:* [`multi-broker-connectivity-adapters`](./multi-broker-connectivity-adapters/SKILL.md#21-regla-mandatoria-de-eficiencia-conexión-única-multiplexada-singleton-pubsub)
  - *Propósito:* Cero sockets duplicados en la UI de React. Un único multiplexor alimenta a todos los componentes.
- **Caché Inmutable de 1 Año (Assets):**
  - *Skill:* [`web-performance-asset-caching-and-resource-optimization`](./web-performance-asset-caching-and-resource-optimization/SKILL.md#1-principio-fundamental-descargar-una-sola-vez-servir-desde-caché-para-siempre)

---

## 🛠️ Cómo Utilizar Estas Skills con Agentes de IA

1. **En GitHub:** Sube la carpeta `/agent_skills/` como la base de conocimiento para tus agentes o como submódulo de tu repositorio de IA.
2. **En Entornos de Desarrollo con Agentes (Cursor, Windsurf, Claude Code, Antigravity):**
   - Agrega estas instrucciones a las reglas de sistema (`.cursorrules`, `.windsurfrules` o `.claude/skills`).
   - Cuando solicites una tarea específica (por ejemplo: *"implementa el conector de Bybit"* o *"calcula el drawdown EOD de la cuenta"*), el agente consultará automáticamente el `SKILL.md` correspondiente antes de escribir código.
3. **Validación:** Cada `SKILL.md` incluye un **Checklist de Verificación para Agentes de IA** al final del documento para garantizar que no se omitan salvaguardas críticas de seguridad o negocio.

