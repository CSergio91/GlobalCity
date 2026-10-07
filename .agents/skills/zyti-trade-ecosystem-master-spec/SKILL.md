---
name: zyti-trade-ecosystem-master-spec
description: Especificación maestra y holística del ecosistema ZYTI Trade. Gobierna el Trading OS Multi-Exchange, pasarela de Prop Firms, Copy Trading API-to-API, Arbitraje triangular/sintético, motor KLineChart v10, estética Glassmorphism clara con blur, y arquitectura i18n (/es y /en).
version: 2.0.0
category: Supreme Product & Engineering Architecture
status: Authoritative
---

# ZYTI TRADE — SUPREME ECOSYSTEM ARCHITECTURE & PRODUCT SPECIFICATION

## 1. VISIÓN DEL PRODUCTO: TRADING OS INDEPENDIENTE
**ZYTI Trade** es una plataforma institucional de grado profesional que fusiona cuatro pilares clave:
1. **Trading Terminal de Alto Desempeño:** KLineChart v10 GPU Canvas a 60 FPS, con estética minimalista de overlay transparente claro con backdrop-blur sobre un gráfico vivo de fondo.
2. **Multi-Exchange Hub (Criptomonedas):** Conectividad unificada con los principales exchanges globales (Binance, Bybit, OKX, Kraken, Coinbase, Bitget, KuCoin, Gate.io).
3. **Copy Trading de API a API:** Replicación en milisegundos de operaciones entre diferentes exchanges mediante API Keys cifradas localmente (Zero-Knowledge / AES-GCM).
4. **Arbitraje entre Exchanges:** Detección de spreads cruzados y arbitraje sintético/triangular en tiempo real.
5. **Pasarela para Empresas de Fondeo (Prop Firms):** Aprovisionamiento automático de cuentas de trading vía REST API y despacho de Webhooks para auditoría de riesgo externa.
6. **Bus de Eventos WebSocket Multi-Dispositivo & Telemetría:** Sincronización en sub-2ms de órdenes, SL/TP, Break-Even, órdenes límite y balances en todas las pantallas vivas, respaldado por telemetría instrumental en vivo (60 FPS Damped Spring).

---

## 2. ESPECIFICACIÓN VISUAL (LIGHT GLASSMORPHISM & TRADINGVIEW BACKGROUND)
- **Fondo Activo:** Gráfico de fondo interactivo y fluido (Canvas KLineChart con velas claras, grid suave, medias móviles y animación sutil de precios).
- **Overlay Superior:** Cristal esmerilado claro (`backdrop-blur-md bg-white/70 dark:bg-slate-900/60`) con bordes sutiles (`border-slate-200/50`), sombras difusas y sensación de ligereza.
- **Tipografía:** Inter / Outfit para interfaces y JetBrains Mono para datos numéricos y precios de mercado.
- **Paleta Cromática:**
  - Base: Blanco Puro / Cristal Esmerilado Claro (#F8FAFC a #FFFFFF con opacidad 70-85%).
  - Acentos Primarios: Azul Cobalto Financiero (#2563EB) y Violeta Eléctrico (#7C3AED).
  - Estados: Verde Esmeralda (#10B981) para compras/ganancias, Rojo Carmesí (#EF4444) para ventas/pérdidas.

---

## 3. ARQUITECTURA DE NAVEGACIÓN Y MENÚS
### Navbar Superior:
- **Logo ZYTI Trade:** Renderizado nítido con bordes anti-aliasing suavizados.
- **Menú Exchange (Hover vertical):**
  - Binance
  - Bybit
  - OKX
  - Kraken
  - Coinbase
  - Bitget
  - KuCoin
  - Gate.io
- **Menú Servicios (Hover vertical):**
  - *Prop Firms Gateway:* Infraestructura de terminal para empresas de evaluación y fondeo.
  - *Trading MultiExchange:* Gestión unificada de múltiples cuentas y balances en un solo panel.
  - *Copy Trading entre Exchanges:* Replicación de trades entre exchanges sin latencia.
  - *Arbitraje entre Exchanges:* Escaneo algorítmico de discrepancias de precio.
- **Internacionalización (i18n):**
  - Rutas soportadas: `/es` y `/en`.
  - Selector de idioma persistente con detección automática por `navigator.language`.
- **Botón CTA:** "Lanzar Terminal" / "Launch Terminal".

---

## 4. CONECTIVIDAD DE EXCHANGES (CCXT & NATIVE WEBSOCKETS)
- **Modo Lectura:** Streaming de datos de mercado vía WebSockets nativos con heartbeat ping/pong.
- **Modo Ejecución:** Conectores CCXT Pro / REST firmados con HMAC-SHA256 para cada exchange.
- **Rate Limit Optimizer:** Token-bucket throttler para evitar suspensiones de IP o API ban.

## 5. REGLAS INVIOLABLES DE INTERNACIONALIZACION (i18n /es y /en)
1. **Rutas URL Obligatorias:** Todas las vistas deben responder en `/es` (Espanol) y `/en` (Ingles).
2. **Cero Textos Hardcodeados:** Ningun texto visible en la interfaz (botones, descripciones, titulos, alertas, tareas de checklist) puede quemarse en codigo sin su correspondiente par en `translations.ts`.
3. **Persistencia y Redireccion:** La seleccion se almacena en `localStorage` y sincroniza la URL sin recargas bruscas.

---

## 6. GOBERNANZA ESTRICTA DE RESOLUCIONES Y DISPOSITIVOS (>= 1024px ES ESCRITORIO OBLIGATORIO)
1. **Regla de Oro:** Cualquier viewport con ancho `>= 1024px` se clasifica estrictamente como **ESCRITORIO INSTITUCIONAL**.
2. **Terminal de Trading:**
   - Debe renderizar **SIEMPRE** el layout horizontal dividido:
     - Gráfico central KLineCharts dominante (78% - 82% del ancho).
     - Panel lateral de trading derecho estrecho (`280px`).
     - Tabla inferior de posiciones (`140px`).
   - Queda terminantemente **prohibido** renderizar vistas móviles, pestañas inferiores colapsables o layouts apilados en resoluciones `>= 1024px`.
3. **Móviles (< 1024px):**
   - El gráfico KLineCharts debe mantener una altura mínima garantizada (`48dvh` / `min-height: 280px`).
   - La operativa y libros se gestionan mediante las pestañas táctiles inferiores (*Operar / Order Book / Posiciones*).

