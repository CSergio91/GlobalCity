# AGENTS.md — Eklipse Funded Operating System & Agent Context

> **MANUAL DE OPERACIONES Y GOBERNANZA PARA AGENTES DE IA (ANTIGRAVITY / CLAUDE / CURSOR)**
> Este documento establece la identidad, arquitectura, estado actual del desarrollo y reglas de ingeniería obligatorias para el proyecto **Eklipse Funded**. Cualquier agente que inicie sesión en este repositorio DEBE leer y respetar estas directrices.

---

## 1. Identidad del Proyecto
* **Nombre Oficial:** Eklipse Funded
* **Branding:** Eklipse Sol & Luna Architectural Eclipse (`EKLIPSE FUNDED`), paleta Dark Obsidian (`#06070B`, `#090A10`), acentos ámbar/dorado (`#F59E0B`, `#FBBF24`), y estética editorial glassmorphism.
* **Modelo de Negocio:** Empresa de Fondeo Cripto y Multiactivo (Prop Firm) con terminal institucional propia, respaldada por ejecución real en exchanges (Binance, Bybit, OKX, Hyperliquid L1) y conectividad API-to-API con el ecosistema ZYTI Trade.

---

## 2. Estado Actual de la Arquitectura (Recién Sincronizado desde ZYTI Trade)

El proyecto cuenta con todos los componentes esenciales sincronizados directamente desde el núcleo de trading de producción:

### A. Motor de Trading y Pipeline Pre-Trade (`src/core/trading/`)
* **`TradingEngine.ts`:** Orquesta apertura y cierre de posiciones, órdenes limit y SL/TP. Soporta inyección dinámica de `customPipeline: RiskPipeline`.
* **`RiskEngine.ts`:** Expone `RiskEngine.createPipelineForFirm(rules)` que compila las 13 reglas pre-trade dinámicas en milisegundos (<1ms).
* **15 Reglas Modulares de Riesgo en `src/core/trading/rules/`:**
  1. `DailyLossLimitRule` (Pérdida máxima diaria)
  2. `MaxLossLimitRule` (Pérdida máxima total)
  3. `MandatoryStopLossRule` (SL obligatorio antes del despacho)
  4. `MaxPositionsPerSymbolRule` (Límite de posiciones simultáneas por par)
  5. `AntiHedgingRule` (Prohibición de posiciones opuestas Long/Short en el mismo activo)
  6. `WeekendHoldingRule` (Restricción de operaciones en fin de semana)
  7. `MicroscalpingRule` (Duración mínima del trade, ej. 30s / 60s)
  8. `ConsistencyRule` (Regla de consistencia del 40% de ganancias)
  9. `InactivityPeriodRule` (Días máximos de inactividad)
  10. `RiskPerTradeRule` (Riesgo máximo en % por operación)
  11. `AvailableMarginRule` (Validación de margen disponible y apalancamiento)
  12. `RestrictedSymbolsRule` (Activos prohibidos o restringidos)
  13. `OrderFrequencyRule` (Protección contra HFT / spam de órdenes)
  14. `MaxDrawdownRule` (Evaluación de Trailing Equity y EOD Drawdown)
  15. `MarginCallRule` (Garantías críticas)

### B. Demonio de Servidor y Cron de Fin de Semana (`server/`)
* **`server/riskDaemon.js`:** Centinela en RAM con evaluación síncrona pre-trade y **cron automatizado de fin de semana**:
  * Ejecuta un intervalo cada 30 segundos.
  * Si la regla `weekendHoldingAllowed: false` está activa, los viernes a las 20:55 UTC liquida y cierra automáticamente las posiciones abiertas bajo el código `WEEKEND_HOLDING_AUTO_CLOSE`.
* **`server/tradingHub.js`:** Gateway WebSocket multiplexado de baja latencia.

### C. CRM Nexus Institucional (`src/modules/crm/`)
* **`InstitutionalCrmApp.tsx`:** Dashboard ERP institucional completo con soporte multi-idioma (ES/EN).
* **`components/ChallengesManagementView.tsx`:** Gestor interactivo de modelos de challenge (1 Paso, 2 Pasos, Instant Funding), profit splits ajustables (80/20, 90/10, etc.), drawdowns y reglas pre-trade.
* **`components/CockpitControlCenter.tsx`:** Telemetría en tiempo real de capital, riesgo y traders activos.
* **`components/TradersClientsTable.tsx` & `RiskForensicAuditConsole.tsx`:** Auditoría forense de infracciones y tabla de clientes.
* **`api/crmService.ts`:** Servicios conectados a PostgreSQL / Supabase y telemetría de trading.

### D. Base de Datos PostgreSQL / Supabase (`supabase/`)
* **`supabase/prop_firm_complete_schema_init.sql`:** Script DDL autosuficiente con 8 tablas relacionales:
  1. `prop_firms`
  2. `profiles`
  3. `risk_rule_configs`
  4. `trading_accounts`
  5. `account_trades`
  6. `equity_snapshots`
  7. `api_credentials`
  8. `risk_audit_events`
  Incluye RLS (Row Level Security), índices B-Tree de alta velocidad, triggers y semillas por defecto.

---

## 3. Guía de Ejecución Local y Docker (Simulación Pre-VPS)

Para probar la plataforma en local antes de desplegar en el VPS:

### 1. Requisito WSL 2 en Windows
Si Docker Desktop muestra *"WSL needs updating"*:
```powershell
wsl --update
```
Una vez actualizado, reiniciar Docker Desktop o pulsar *"Try Again"*.

### 2. Levantar Servicios de Infraestructura con Docker
```bash
docker compose up -d eklipse-db eklipse-redis
```
* **PostgreSQL 16 (`eklipse_postgres`)** en `localhost:5432`: Ejecuta automáticamente el script DDL institucional de `docker/init.sql` (`/docker-entrypoint-initdb.d/01_init.sql`), aprovisionando las 8 tablas relacionales (`prop_firms`, `profiles`, `risk_rule_configs`, `trading_accounts`, `account_trades`, `equity_snapshots`, `api_credentials`, `risk_audit_events`), índices y semillas de reto.
* **Redis 7 (`eklipse_redis`)** en `localhost:6379`: Con política LRU y AOF para cerrojos de idempotencia de órdenes (`SET NX`), cachés y locks distribuidos.
* **Comprobación de tablas:**
  ```bash
  docker exec eklipse_postgres psql -U eklipse_admin -d eklipse_funded -c "\dt"
  ```

### 3. Base de Datos en la Nube (Alternativa Supabase Cloud)
* Si no se usa Docker, ejecutar el script `supabase/prop_firm_complete_schema_init.sql` en el SQL Editor del panel de Supabase.

### 4. Levantar Servidores en Paralelo
```bash
# Terminal 1: Backend / Motor de Riesgo WebSocket & Cron
npm run server
# o directamente: node server/tradingHub.js (Escuchando en http://localhost:8080)

# Terminal 2: Frontend Web (Terminal & CRM Nexus)
npm run dev
# Escuchando en http://localhost:3100 (para coexistir con ZYTI Trade en 3000)
```

---

## 4. Biblioteca de Habilidades Especializadas (`.agents/skills/`)
El directorio `.agents/skills/` contiene 22 especificaciones maestras de ingeniería:
- `biphasic-saas-to-propfirm-strategy`: Hoja de ruta estratégica y fases de lanzamiento.
- `crypto-prop-firm-operations-and-venues`: Conectividad con Bybit Broker API v5, OKX DMA e Hyperliquid L1.
- `prop-firm-risk-and-financial-governance`: Modelado financiero, reservas de tesorería y consistencia del 40%.
- `trading-engine-oms-ems-risk`: OMS, EMS táctico, Smart Order Router e idempotencia.
- `klinechart-financial-engine-and-backtesting`: Canvas GPU KLineCharts v10 a 60 FPS.
- `trading-and-prop-firm-payment-gateways-architecture`: Pasarelas de pago, High-Risk MIDs y on-ramps crypto.
- `prop-firm-legal-regulatory-and-payments`: Marco legal MiCA, contratos B2B W-8BEN y prevención de contracargos.

---

## 5. Directrices de Código y Gobernanza
1. **TypeScript Estricto:** Siempre verificar con `pnpm lint` (`tsc --noEmit`) antes de finalizar cualquier tarea.
2. **Zero Mock Data:** Todas las cuentas, reglas y órdenes deben persistir en Supabase o en el motor de estado reactivo.
3. **Mobile-First Institucional:** Todas las vistas deben tener ergonomía compacta y responsiva para dispositivos móviles.
