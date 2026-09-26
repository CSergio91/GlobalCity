# 🏛️ Global City — Roadmap Arquitectónico, Infraestructura y Checklist Maestro
> **Documento Oficial de Consulta Permanente para Agentes y Desarrolladores.**
> *Regla de Oro:* Ningún desarrollo nuevo se inicia sin verificar y marcar su fase en este checklist. Cero parches temporales sin consultar las skills asociadas.

---

## 🧭 1. DECISIÓN DE STACK: ¿Supabase o Firebase?

### ✅ Elección Canónica: **Supabase (PostgreSQL 16) + Redis 7**
Para un sistema financiero de trading multi-venue (*Trading Operating System*), **Supabase es infinitamente superior a Firebase**.

| Criterio | Supabase (PostgreSQL) | Firebase (Firestore / RTDB) |
| :--- | :--- | :--- |
| **Integridad Financiera** | **ACID estricto**, claves foráneas, tipos `NUMERIC(28,8)` para precisión de saldos y cripto sin errores de redondeo float. | NoSQL no relacional, consistencia eventual, riesgo de balances inconsistentes. |
| **Migraciones en Local y Cloud** | **Migraciones SQL secuenciales (`supabase/migrations/`)**. Se ejecutan en local con Docker y se envían a Cloud con `npx supabase db push`. | No existen migraciones SQL; los esquemas quedan dispersos en el código cliente. |
| **Aislamiento Multi-Tenant** | **Row Level Security (RLS)** nativo de PostgreSQL auditado a nivel de base de datos (`WHERE organization_id = ...`). | Reglas de seguridad propietarias complejas de depurar en arquitecturas grandes. |
| **Despliegue Dual** | **100% Open Source y Self-Hosted**. Se puede correr en tu ordenador (Docker/WSL2) y en Cloud con exactamente el mismo código. | Severo Vendor Lock-in a la infraestructura propietaria de Google Cloud. |

---

## 🎨 2. DIRECCIÓN DE DISEÑO OPERATIVO: "Lienzo Limpio" (*Empty Canvas*)

El área de operaciones (`/operations` o `/terminal`) debe transmitir calma, precisión y enfoque profesional:
1. **Lienzo Vacío cuando no hay conexiones:** Si el usuario no ha conectado cuentas, **no abrumar con paneles saturados de datos simulados**. Mostrar únicamente la barra de navegación compacta, las pestañas de navegación (`Exchanges | Brokers | Futuros`) y el espacio de trabajo limpio listo para conectar.
2. **Cero Ruido Visual:**
   - Tipografía limpia y compacta (densidad pro-trader).
   - Eliminar etiquetas largas, tags publicitarios y descripciones innecesarias.
   - Números exactos, métricas pequeñas y de alta legibilidad.
3. **Logos Oficiales Nítidos:**
   - Utilizar los logos vectoriales SVG/Canvas de cada exchange (Binance, Bybit, OKX, KuCoin, MT5, cTrader) idénticos a la landing page.
4. **Gráfico KLineChart Nativo (Apache 2.0):**
   - Eliminar el iframe externo de TradingView.
   - Usar el motor Canvas de KLineChart integrado en el DOM local.

---

## 📋 3. CHECKLIST MAESTRO POR FASES

---

### 🟢 FASE 1: Rediseño del Espacio Operativo a "Lienzo Limpio" & KLineChart
> **Objetivo:** Dejar la interfaz de operaciones con cero ruido, logos nítidos y motor de gráficos nativo Canvas.

- [x] **1.1. Rediseño del Layout Operativo (Lienzo Limpio):**
  - [x] Ocultar paneles densos si no hay cuentas conectadas; mostrar vista minimalista enfocada en la gestión de conexiones (`DemoTerminal.tsx`).
  - [x] Navbar compacta con selector de modo visual `DEMO` vs `REAL` y estado de conexión limpio.
  - [x] Eliminada barra lateral intrusiva (`aside`), eliminados videos de fondo y brillos pesados para obtener un lienzo sobrio `#06070B`.
- [x] **1.2. Logos Oficiales en el Directorio de Exchanges:**
  - [x] Creados vectores SVG oficiales para los 44 exchanges, DEXs y brokers institucionales en `MarketIcons.tsx` (`PlatformLogo`), eliminando avatares con iniciales de texto.
- [x] **1.3. Reemplazo de TradingView por KLineChart Nativo:**
  - [x] Instalado paquete `klinecharts@10.0.3` en el proyecto.
  - [x] Creado el componente `GlobalCityChart.tsx` acelerado por hardware en `<canvas>` HTML5 con tema pro dark institucional.
  - [x] Conectada actualización de velas en vivo tick-a-tick sin polling y toolbar con selectores de temporalidad (1m, 5m, 15m, 1h, 4h, 1D) e indicadores técnicos (MA, EMA, BOLL, RSI).
  - [x] Iframe externo de TradingView eliminado y reemplazado en `VenueChartViewer.tsx`.

---

### 🟡 FASE 2: Configuración de Base de Datos con Supabase CLI (Local + Cloud)
> **Objetivo:** Tener el esquema relacional persistente listo para ejecutarse en tu PC o en Cloud mediante migraciones SQL versionadas.

- [ ] **2.1. Inicialización de Supabase CLI en el Repositorio:**
  - [ ] Configurar estructura `supabase/` con `config.toml`.
  - [ ] Documentar scripts en `package.json` (`supabase:start`, `supabase:stop`, `supabase:db:push`).
- [ ] **2.2. Migración Inicial de Esquema SQL (`00001_initial_schema.sql`):**
  - [ ] Tabla `organizations` y `users` con aislamiento multi-tenant.
  - [ ] Tabla `connections` (metadatos de exchanges/brokers, status, ping).
  - [ ] Tabla `credentials` (almacenamiento de secrets cifrados con AES-256-GCM, nunca visibles en frontend).
  - [ ] Tabla `orders` (lifecycle del OMS: `CREATED`, `SUBMITTED`, `FILLED`, etc.).
  - [ ] Tabla `positions` y `balances` con precisión decimal estricta (`NUMERIC(28,8)`).
  - [ ] Tabla `audit_logs` para trazabilidad inmutable de cada comando.
  - [ ] Políticas RLS (Row Level Security) activadas en todas las tablas.

---

### 🟠 FASE 3: Infraestructura Docker Local (Redis 7 + Backend Base)
> **Objetivo:** Levantar el entorno de servidor en tu ordenador con un solo comando (`docker compose up -d`).

- [ ] **3.1. Archivo `docker-compose.yml`:**
  - [ ] Servicio `redis`: Imagen oficial `redis:7-alpine` con persistencia appendonly y límites de memoria.
  - [ ] Servicio `backend`: Contenedor Node.js/Python para el Core de Global City.
- [ ] **3.2. Abstracción del Adaptador de Redis en Backend:**
  - [ ] `StateStore`: Hashes para guardar las mejores cotizaciones L2 (`quotes:{venue}:{symbol}`).
  - [ ] `IdempotencyGuard`: Bloqueo atómico con `SET idempotency:order:{id} PROCESSING NX EX 86400`.
  - [ ] `DistributedLock`: Redlock para evitar colisiones de margen en operaciones simultáneas.

---

### 🔴 FASE 4: Market Data Engine & WebSocket Gateway (Cero Polling)
> **Objetivo:** Eliminar por completo los `setInterval(fetch, 3500)` y centralizar los feeds con 1 sola conexión upstream por exchange.

- [ ] **4.1. Conexión Upstream Única en Backend:**
  - [ ] 1 WebSocket persistente hacia Binance (`stream.binance.com`).
  - [ ] 1 WebSocket persistente hacia Bybit v5 (`stream.bybit.com/v5/public/spot`).
  - [ ] 1 WebSocket persistente hacia OKX v5 (`ws.okx.com:8443/ws/v5/public`).
- [ ] **4.2. Ingestor y Normalizador en Memoria RAM + Redis:**
  - [ ] Convertir los ticks externos al modelo DTO canónico de Global City (`MarketDataTick`).
  - [ ] Actualizar Redis 7 en sub-milisegundo.
- [ ] **4.3. WebSocket Gateway Fan-Out hacia el Frontend:**
  - [ ] El frontend se conecta a `ws://localhost:4000/ws/market`.
  - [ ] Salas por símbolo (`quotes:BTC/USDT`). Miles de usuarios reciben el stream local sin hacer peticiones externas a los exchanges.

---

### 🟣 FASE 5: Trading Core (Risk -> OMS -> EMS -> Connectors)
> **Objetivo:** Ejecución de órdenes institucional con validación de riesgo y sin riesgo de duplicados.

- [ ] **5.1. Pre-Trade Risk Engine:**
  - [ ] Validación previa obligatoria: margen libre, apalancamiento máximo, tamaño de orden y límite de pérdida diaria.
- [ ] **5.2. Order Management System (OMS):**
  - [ ] Generación de `client_order_id` unívoco.
  - [ ] Máquina de estados completa y control de estados `UNKNOWN`.
- [ ] **5.3. Conectores Oficiales de Ejecución:**
  - [ ] Adaptador de ejecución real para Binance y KuCoin con firma HMAC-SHA256 en el backend.
  - [ ] Motor de reconciliación automática periódica contra la verdad del exchange.

---

## 🛠️ 4. COMANDOS OPERATIVOS DE REFERENCIA

```bash
# Iniciar servicios locales (PostgreSQL + Supabase Studio + Storage)
npx supabase start

# Aplicar migraciones SQL pendientes al entorno activo
npx supabase db push

# Ver estado de los contenedores locales
docker ps

# Ver logs del motor de Redis
docker logs -f globalcity_redis
```

---

> **Regla de Ejecución para Agentes:** Cada vez que el usuario solicite un avance o cambio, consultar este archivo, identificar el paso exacto que se está trabajando y marcar los checkboxes completados con total transparencia.
