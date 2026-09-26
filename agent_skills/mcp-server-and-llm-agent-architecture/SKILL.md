---
name: mcp-server-and-llm-agent-architecture
description: "Estándar de arquitectura para el servidor Model Context Protocol (MCP) y agentes LLM conversacionales (Grok/ChatGPT style) en GlobalCity para orquestar trading, cuentas y auditoría."
version: "1.0.0"
category: "AI & Autonomous Agent Orchestration"
author: "AI Studio Fintech Systems Architect"
status: "Active Specification"
---

# GlobalCity MCP Server & LLM Agent Architecture

Esta skill define la especificación para habilitar capacidades de agente autónomo sobre el trading core de GlobalCity utilizando el estándar **Model Context Protocol (MCP)** creado por Anthropic y adoptado globalmente por LLMs (ChatGPT, Claude, Grok, Cursor, Antigravity).

---

## 1. Visión y Topología

El LLM actúa como copiloto cuantitativo de trading, operando sobre un dock inferior flotante ("Chat IA"), capaz de:
1. Inspeccionar el estado de las conexiones y balances consolidados de los 28+ venues CCXT/DMA.
2. Calcular splits óptimos de Smart Order Routing.
3. Detectar anomalías de latencia, slippage o llamadas de margen.
4. Ejecutar órdenes o aplanar posiciones ante emergencias mediante llamadas a herramientas (Tool Calls).

```
┌────────────────────────────────────────────────────────┐
│         LLM Chat Dock (Grok / ChatGPT Style)           │
│    [Conversación Natural] ──► [System Prompt + Context]│
└───────────────────────────┬────────────────────────────┘
                            │ (JSON-RPC 2.0 / MCP Protocol)
┌───────────────────────────▼────────────────────────────┐
│              GLOBALCITY MCP SERVER GATEWAY              │
├────────────────────────────────────────────────────────┤
│  RESOURCES:                                            │
│  - globalcity://venues/catalog                         │
│  - globalcity://accounts/consolidated                  │
│  - globalcity://market/stream                          │
├────────────────────────────────────────────────────────┤
│  TOOLS:                                                │
│  - list_connected_venues()                             │
│  - get_consolidated_equity()                           │
│  - route_order_split(symbol, side, amount)             │
│  - execute_emergency_flatten(venue_id?)                │
│  - get_market_spread(symbol, venue_a, venue_b)         │
├────────────────────────────────────────────────────────┤
│  PROMPTS:                                              │
│  - audit_portfolio_risk                                │
│  - optimize_order_execution                            │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│      TRADING CORE / LOCALSTORAGE / BROKER ADAPTERS     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Definición Canónica de Herramientas MCP (Tools Schema)

### 2.1 `globalcity_list_venues`
Obtiene los exchanges y brokers configurados en el workspace local.
```json
{
  "name": "globalcity_list_venues",
  "description": "Lista todas las conexiones activas a exchanges (CCXT) y brokers institucionales (MT5/cTrader).",
  "inputSchema": {
    "type": "object",
    "properties": {
      "status_filter": {
        "type": "string",
        "enum": ["ALL", "CONNECTED", "STANDBY", "ERROR"],
        "default": "CONNECTED"
      }
    }
  }
}
```

### 2.2 `globalcity_get_consolidated_equity`
Calcula el balance y margen libre total disponible agrupado por divisa base (USD/USDT).
```json
{
  "name": "globalcity_get_consolidated_equity",
  "description": "Retorna la equidad consolidada y el desglose de margen libre entre todas las cuentas conectadas.",
  "inputSchema": {
    "type": "object",
    "properties": {}
  }
}
```

### 2.3 `globalcity_route_order_split`
Calcula y prepara la fragmentación de una orden padre para despacho concurrente sin saturar libros de órdenes.
```json
{
  "name": "globalcity_route_order_split",
  "description": "Divide una orden padre entre múltiples venues según el balance libre y la liquidez disponible.",
  "inputSchema": {
    "type": "object",
    "required": ["symbol", "side", "amount"],
    "properties": {
      "symbol": { "type": "string", "description": "Par o instrumento (ej. BTC/USDT, EUR/USD)" },
      "side": { "type": "string", "enum": ["BUY", "SELL"] },
      "amount": { "type": "number", "description": "Cantidad total a ejecutar" },
      "strategy": { "type": "string", "enum": ["EQUITY_WEIGHTED", "EQUAL_SPLIT", "BEST_PRICE"] }
    }
  }
}
```

---

## 3. Comportamiento de la UI (Dock de Chat IA)
- **Modo Minimizado / Standby:** Barra fina en el pie de página con un resumen de estado (`GlobalCity Quant Copilot · MCP Ready`), chips de acción rápida ("Auditar liquidez", "Verificar latencia") y botón de expansión.
- **Modo Expandido:** Se despliega al hacer hover o clic, mostrando el historial de mensajes, la insignia del modelo y el campo de prompt con atajos de teclado (`Cmd+K` / `Ctrl+K`).
- **Estado Inicial (Zero-DB / Client-Side):** El chat opera en modo standby guiado hasta la integración completa con backend persistente o proveedores de inferencia locales/remotos.
