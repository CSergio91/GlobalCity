---
name: global-city-design-system-and-landing-spec
description: "Sistema de diseño visual, lenguaje estético, tipografía, iconografía, paleta de colores y especificación arquitectónica de la Landing Page de Global City, inspirada en trading institucional oscuro con acentos rose-mauve y terminología no genérica."
version: "1.0.0"
category: "Design System & Landing Page Specification"
author: "AI Studio Fintech Systems Architect"
status: "Approved Specification"
---

# Global City: Design System & Landing Page Specification

Esta skill codifica el **sistema de diseño estético, la dirección tipográfica, la paleta cromática, la iconografía y la estructura de componentes** para la plataforma **Global City**, fundamentada en las referencias visuales de terminales fintech oscuras de última generación y los 8 módulos de arquitectura institucional estudiados.

---

## 1. Deconstrucción Estética de las Referencias Visuales

A partir del análisis forense de las capturas proporcionadas:

### A. Atmósfera y Composición Espacial
- **Lienzo Principal (Canvas):** Fondo profundo ultra-oscuro `#0B0C10` / `#0E0F14` con sutiles gradientes ambientales verticales tipo cortina lumínica o aurora difusa (*mauve/rosewood/copper sheen*) en el cuadrante superior o tras el hero.
- **Tarjetas y Superficies Bento:**
  - Fondo de tarjeta: `#13141B` o `#171822` con `border: 1px solid rgba(255, 255, 255, 0.07)`.
  - Radio de curvatura de contenedores: `rounded-2xl` a `rounded-3xl` (16px a 24px).
  - Efecto de iluminación interna: sutil resplandor superior (*subtle inner highlight border*).
- **Tratamiento Tipográfico de Alto Impacto:**
  - Titulares masivos, condensados o geométricos con tracking ajustado (`tracking-tight`).
  - Intercalado de etiquetas contextuales sobrias sin encapsulamiento chillón.
  - Cero pills genéricas: el texto informativo es limpio con separadores sutiles (`·` o `/`).

### B. Paleta de Color Institucional Global City
| Token | Valor Hex | Uso Semántico |
| :--- | :--- | :--- |
| `--bg-canvas` | `#0A0B0F` | Fondo general de la página y terminal. |
| `--bg-surface` | `#12131A` | Superficie de tarjetas bento, tablas y paneles. |
| `--bg-surface-elevated` | `#1A1C26` | Hover states, inputs, modales y headers de tabla. |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Líneas divisorias de 1px y bordes de tarjetas. |
| `--accent-rose` | `#E06D8A` | Acento primario de marca, CTAs principales y resplandores. |
| `--accent-rose-hover` | `#ED7D9A` | Estado hover de acciones primarias. |
| `--accent-rose-subtle` | `rgba(224, 109, 138, 0.12)` | Fondos secundarios y micro-badges funcionales. |
| `--accent-cyan` | `#2DD4BF` / `#38BDF8` | Mapeo de liquidez, WebSockets y telemetría de red. |
| `--status-positive` | `#10B981` | Velas alcistas, PnL positivo y estados Online. |
| `--status-negative` | `#F43F5E` | Velas bajistas, Drawdown y alertas de riesgo. |
| `--text-primary` | `#F8FAFC` | Titulares y datos numéricos principales. |
| `--text-secondary` | `#94A3B8` | Descripciones y etiquetas de segundo nivel. |
| `--text-muted` | `#64748B` | Metadatos y notas al pie. |

---

## 2. Tipografía e Iconografía

### A. Tipografías Seleccionadas (Google Fonts / Web Standards)
1. **Titulares y Marca (Display):** `Plus Jakarta Sans` o `Cabinet Grotesk` (pesos 700 y 800, `tracking-tight`), proporcionando presencia ejecutiva contemporánea sin el cliché desgastado de Inter.
2. **Cuerpo de Texto (Body):** `Plus Jakarta Sans` o `Satoshi` (pesos 400 y 500), garantizando legibilidad perfecta sobre fondo oscuro con compensación óptica (`tracking-wide` ligero).
3. **Métricas y Números (Data & Financial Figures):** `JetBrains Mono` con `font-variant-numeric: tabular-nums` para que los precios, spreads y balances se alineen de forma matemática sin saltos visuales.

### B. Sistema de Iconografía (Bootstrap Icons / Lucide Icons)
Se utilizará una biblioteca de iconos limpia y unificada con trazo consistente (1.5px stroke):
- Conectividad & Nodos: `bi-hdd-network`, `bi-cpu`, `bi-link-45deg`.
- Trading & Órdenes: `bi-graph-up-arrow`, `bi-arrow-left-right`, `bi-kanban`.
- Seguridad & Riesgo: `bi-shield-check`, `bi-lock`, `bi-activity`.
- Velocidad & Arbitraje: `bi-lightning-charge`, `bi-stopwatch`, `bi-radar`.

---

## 3. Copywriting Institucional: Cero Textos Genéricos

Se prohiben expresamente frases vacías de IA ("la plataforma definitiva", "potencia tus finanzas", "revoluciona tu trading"). El lenguaje de **Global City** habla como una firma cuantitativa e institucional:

### Contrastes de Copywriting
- ❌ **Evitar:** *"Opera como un profesional con nuestra potente plataforma todo en uno impulsada por IA."*
- ✅ **Global City:** *"Infraestructura de ejecución multi-venue y protocolo de fondeo híbrido. Ejecución directa en libros de órdenes institucionales sin simulación encubierta."*
- ❌ **Evitar:** *"Gana mucho dinero con nuestros retos fáciles y cobros rápidos."*
- ✅ **Global City:** *"Evaluación cuantitativa disciplinada y asignación de subcuentas corporativas vía Broker API. Respaldo de solvencia con ratio de reserva $R \ge 2,0$."*

---

## 4. Arquitectura de Secciones de la Landing Page

La landing page se estructura como un argumento técnico y de confianza sin fisuras:

```
[ 1. Top Navigation Bar ] (Logo Global City, 5 enlaces esenciales, botón de acceso al Terminal)
            │
            ▼
[ 2. Hero Section ] (Titular masivo + Subtítulo de ejecución real + CTA dual + Preview interactiva de la terminal)
            │
            ▼
[ 3. Live Institutional Ticker ] (Sincronización en vivo con libros L2 de Bybit, OKX, Binance y Hyperliquid)
            │
            ▼
[ 4. The 4 Structural Pillars (Bento Grid) ]
     ├── Pilar 1: Terminal SaaS Multicuenta (Sin custodia, claves Read & Trade)
     ├── Pilar 2: Motor de Arbitraje Sintético (Sub-100ms, VWAP L2, Gas Tank)
     ├── Pilar 3: Fondeo Híbrido Cripto (Ejecución real en libro vs. B-Book falso)
     └── Pilar 4: Risk Guardian & Solvencia (Pre-flight checks, EOD Drawdown, Solvencia >= 2x)
            │
            ▼
[ 5. How It Works: El Ciclo de Operación Transparente ] (Paso 1: Conexión -> Paso 2: Evaluación -> Paso 3: Subcuenta Fondeada -> Paso 4: Liquidación B2B)
            │
            ▼
[ 6. Interactive Calculator ] (Calculadora interactiva de Spreads de Arbitraje VWAP o Modelo de Evaluación)
            │
            ▼
[ 7. Comparative Matrix: Global City vs. Prop Firms Tradicionales ] (Tabla sin ambigüedades técnicas)
            │
            ▼
[ 8. Conversion Hero / CTA Final ] + [ 9. Quiet Institutional Footer ]
```

---

## 5. Especificaciones de Componentes Clave

### A. Top Navigation Bar (Contrato de 3 Zonas)
- **Zona 1 (Brand):** Logomarca de Global City (Isotipo geométrico de ciudad de nodos y tipografía `Plus Jakarta Sans` 700).
- **Zona 2 (Nav Links):** `Terminal SaaS`, `Arbitraje L2`, `Prop Firm Híbrida`, `Risk Engine`, `Ecosistema`.
- **Zona 3 (Acciones):** Botón secundario `Documentación` + Botón primario de acento rose `Abrir Terminal`.

### B. Bento Grid de Pilares Tecnológicos
- **Tarjeta 1 (Doble Columna):** Terminal Unificado de Ejecución. Muestra el selector de cuentas múltiples (Bybit, OKX, Binance, Hyperliquid) y el gráfico de equidad consolidada.
- **Tarjeta 2 (Columna Simple):** Arbitraje Sintético Simultáneo. Monitor de spread en tiempo real con indicador VWAP y botón de despacho paralelo.
- **Tarjeta 3 (Columna Simple):** Risk Guardian. Métricas de pérdida diaria, bloqueo por racha perdedora y calculadora de tamaño de posición según Stop Loss.
- **Tarjeta 4 (Doble Columna):** Prop Firm con Verificabilidad Real. Desglose del fill ID en el libro de órdenes del exchange y liquidación 80/20 bajo contrato mercantil B2B.

---

## 6. Sistema de Diseño y Telemetría de Notificaciones en Telegram

Telegram es el **canal troncal omnicanal** de Global City. No solo gestiona el inicio de sesión OAuth 2.0, sino que centraliza el 100% de las comunicaciones operativas, de riesgo, de seguridad y de marketing con una tasa de apertura superior al 90%.

### A. Arquitectura de Hub Central Único
- **Un Solo Bot:** Todo el ecosistema opera bajo un único bot corporativo verificado (`@nombre_bot`), evitando que el usuario deba interactuar con múltiples chats dispersos.
- **Doble Alcance de Entrega:**
  1. **Chat Privado (1 a 1):** Alertas transaccionales confidenciales, confirmación 2FA de órdenes de alto volumen, avisos de riesgo y resúmenes personales de cuenta.
  2. **Canales / Grupos de Equipo:** Tablones operativos para firmas de prop trading, salas de arbitraje institucional y canales de anuncios comunitarios.

### B. Especificación de Diseño y Formato de Mensajes (Telegram MarkdownV2)
Todos los mensajes emitidos por el bot deben respetar la estética institucional de la plataforma (limpia, precisa y numérica):

1. **Tipografía Numérica en Bloque:**
   - Precios, lotajes, latencias, hashes y IDs de orden deben encapsularse obligatoriamente en formato monoespaciado (`` `código` `` o bloques `pre`) para garantizar alineación tabular.
2. **Gramática Cromática Institucional:**
   - 🎯 / 🟢 **TAKE PROFIT / EJECUCIÓN:** `BUY/SELL Fills`, arbitraje completado con éxito, sesiones autorizadas.
   - ⚠️ **STOP LOSS / ADVERTENCIA:** Consumo del 75%-90% del límite diario de pérdida, incremento de latencia en un exchange.
   - 🚨 **MARGIN CALL / RIESGO CRÍTICO:** Violación de drawdown EOD, expiración de clave API, ejecución del *Kill Switch*.
   - 📊 **TELEMETRÍA & BALANCE:** Actualizaciones de equidad agregada, margen libre y reportes periódicos.
   - 🚀 **PRODUCTO & MARKETING:** Anuncios de nuevos conectores, torneos de trading cuantitativo y retos de evaluación de fondeo.

### C. Plantillas de Diseño de Notificaciones

#### 1. Notificación de Ejecución de Orden (Trading Nivel 1)
```text
🟢 ORDEN EJECUTADA · BYBIT V5
━━━━━━━━━━━━━━━━━━━━
Instrumento: BTC/USDT Perpetuo
Operación:   BUY (Long) · Market Fill
Cantidad:    0.50 BTC ($42,155.10)
Precio Fill: $84,310.20
Latencia:    14 ms · ID #918234

[ 📊 Ver en Terminal Web ]  [ ⚙️ Gestionar SL/TP ]
```

#### 2. Alerta del Risk Guardian (Riesgo Nivel 2)
```text
⚠️ ALERTA DE RIESGO · STOP LOSS PROTOCOL
━━━━━━━━━━━━━━━━━━━━
Exchange:    OKX DMA Unified
Alerta:      Consumo del 82% del Límite Diario de Pérdida
Pérdida Hoy: -$1,640.00 / -$2,000.00 Max
Margen:      $33,200.00 USDT

Acción recomendada: Pausar órdenes abiertas o activar Cooldown.
[ 🛑 Activar Kill Switch ]  [ ⚡ Mantener Operativa ]
```

#### 3. Reporte Semanal de Rendimiento (Marketing & Engagement Nivel 3)
```text
📊 RESUMEN SEMANAL DE OPERACIONES · GLOBAL CITY
━━━━━━━━━━━━━━━━━━━━
Periodo:     19 Sep - 25 Sep 2026
Win Rate:    68.4% (38 ganadoras / 18 perdedoras)
Volumen:     $1.42M USD (Cross-Venues)
PnL Neto:    +$4,820.50 USDT (+11.2%)
Comisiones:  -$182.10 (35% ahorrado en rebates)

[ 🚀 Iniciar Nueva Sesión ]  [ 📈 Descargar Auditoría ]
```

### D. Centro de Preferencias en la Interfaz Web (UI Spec)
Para evitar la fatiga de notificaciones y que el usuario mutee el bot, el Terminal incluirá en su sección de Ajustes un panel de **"Preferencias de Telemetría Telegram"**:
- `[Toggle]` Notificaciones de ejecución de órdenes (Fills y cancelaciones).
- `[Toggle]` Alertas de diferenciales de arbitraje L2 ($\ge 0.15\%$).
- `[Toggle]` Alertas críticas de riesgo y liquidación *(bloqueado en ACTIVO por seguridad)*.
- `[Toggle]` Resumen dominical de rendimiento y analítica patrimonial.
- `[Toggle]` Novedades de producto, torneos y lanzamientos.

### E. Protocolo de Anti-Spam y Batching en Trading de Alta Frecuencia
Si un algoritmo de arbitraje o fragmentación táctica emite decenas de órdenes por minuto:
- **PROHIBIDO** saturar el chat con 50 mensajes individuales.
- El motor agrupa (*batching*) los fills en un solo reporte de síntesis cada 30-60 segundos:
  *Ejemplo: "⚡ Lote de Arbitraje Ejecutado: 12 órdenes procesadas con éxito. Spread neto capturado: +$142.30 USDT."*

---

## 7. Checklist de Implementación para el Agente

- [ ] ¿Los botones e inputs tienen retroalimentación visual táctil inmediata ($\le 200\text{ms}$)?
- [ ] ¿Se utiliza `font-mono tabular-nums` para todas las tablas de precios, feeds y porcentajes?
- [ ] ¿El fondo incorpora el resplandor difuso rose-mauve sutil de las referencias visuales?
- [ ] ¿Los textos son concretos, técnicos y libres de adjetivos publicitarios vacíos?
- [ ] ¿Todos los botones y selectores cuentan con manejadores de eventos funcionales sin enlaces muertos?
- [ ] ¿Las notificaciones de Telegram siguen la gramática cromática institucional (Take Profit, Stop Loss, Margin Call)?
- [ ] ¿Se implementa el protocolo de batching para evitar spam en el chat de Telegram del usuario?

---

## 8. Micro-Interacciones Avanzadas y Autenticación Telegram-Only

### A. Sistema de Iluminación Fluida de Cursor (`LiquidFollower`)
Para dar vida orgánica a las interfaces oscuras institucionales sin recargar la GPU:
1. **Física Lerp:** El destello del cursor sigue la posición del ratón mediante interpolación lineal fluida (`current += (target - current) * 0.12`).
2. **Gradiente Radial Tricromático:** 
   - Núcleo Rose/Gold: `radial-gradient(circle, rgba(224, 109, 138, 0.14) 0%, rgba(212, 175, 55, 0.08) 35%, rgba(45, 212, 191, 0.04) 65%, transparent 80%)`.
   - Modo de mezcla: `mix-blend-mode: screen`, `filter: blur(30px)`.
3. **Escala Reactiva al Puntero:** Al hacer hover sobre elementos interactivos (`button`, `a`, `input`, `.cursor-pointer`), el halo se expande a escala `1.4x` de forma elástica (`duration-300 ease-out`).
4. **Presencia Global:** Tanto la Landing Page como la ruta `/login` deben montar `<LiquidFollower />` sobre el fondo nocturno panorámico (`global_city_night_skyline.jpg`) con viñeta semi-translúcida y `backdrop-blur`.

### B. Arquitectura de Autenticación 100% Nativa con Telegram (Zero Friction)
Para eliminar la fricción de contraseñas olvidadas y maximizar la conversión en una comunidad activa:
1. **Sin Formularios Manuales:** No se solicitan correos ni contraseñas.
2. **Detección Instantánea de Sesión:** Si el usuario ya interactuó con `@globalcity_auth_bot`, la tarjeta muestra su badge de usuario detectado (ej. `Travel`, `@life_trading_motivation`) con un botón de un solo toque: `⚡ Entrar como [Nombre]`.
3. **Deep Link Criptográfico con Nonce:** El botón primario redirige a `https://t.me/<bot_username>?start=auth_<nonce>`, mientras un polling ultra-ligero (`1500ms`) detecta la confirmación en tiempo real.
4. **Acceso Demo Inmediato:** Modo terminal con un solo clic para explorar libros L2 sin registro previo.

### C. Divisor de Separación Orgánico en Capas de Nube (Cloud Wave Geometry)
La división entre la presentación visual (video 9:16) y la tarjeta de acceso debe replicar exactamente la referencia de nubes multicapa:
- **Desktop (Divisor Vertical Izquierdo):**
  - **Capa Exterior 1 (Celeste Neón Translúcido):** `rgba(56, 189, 248, 0.35)` con lóbulos más pronunciados hacia el video.
  - **Capa Media 2 (Azul Institucional):** `rgba(37, 99, 235, 0.55)` con retracción intermedia.
  - **Capa Frontal 3 (Superficie del Card):** `#0C0E17` fundiéndose de forma contigua con la tarjeta.
- **Mobile (Divisor Horizontal Superior):**
  - Los 3 lóbulos abombados se curvan hacia arriba invadiendo la zona inferior del video (`-top-8`), asegurando una altura compacta `h-40` que elimina el scroll en pantallas móviles.

---

## 9. Dashboard / Operaciones & Arquitectura Navbar Mobile-First

### A. Selector de Idiomas Candlestick (Sin Contenedor ni Bordes)
- **Diseño Ultra-Limpio:** El selector de idiomas abandona contenedores tipo píldora gruesos. Es completamente transparente y sin bordes (`bg-transparent border-0 shadow-none`).
- **Composición del Glifo:**
  - Vela japonesa gráfica con sombra incandescente (`emerald-400` para compras/ES, `rose-500` para ventas/EN), mostrando mecha superior, cuerpo y mecha inferior.
  - Acrónimo institucional directo en tipografía monospace (`ES/BTC` o `EN/USD`).
  - Chevron con rotación fluida al abrir el libro de órdenes desplegable.

### B. Distribución Navbar Mobile-First
1. **Dispositivos Móviles (< 768px):**
   - La barra superior debe permanecer despejada para evitar saturación: muestra exclusivamente el **Logo de la Marca**, el **Botón de Acción** (`Login` o `Dashboard`) y el **Botón de Menú de Hamburguesa**.
   - El selector de idiomas se reubica **dentro del menú desplegable de hamburguesa** con un control segmentado táctil directo (`[ 🟢 ES/BTC ] [ 🔴 EN/USD ]`).
2. **Escritorio & Tablets (>= 768px / 1920px+):**
   - El menú central de navegación se muestra con `display: flex !important` mediante clases CSS dedicadas (`.global-desktop-nav`), inmunes a omisiones del compilador JIT.
   - El selector de idiomas se muestra en la cabecera junto al botón de acción.
   - El botón de acción es reactivo a `localStorage`: muestra **`Dashboard`** si detecta sesión o cuentas guardadas, o **`Login`** en caso contrario.

### C. Dashboard & Terminal de Operaciones (Mobile-First)
1. **Cero Datos Demo Falsos:** Se eliminan los balances y cuentas hardcodeadas de prueba. El estado inicial refleja las cuentas reales que el usuario conecta y almacena en su navegador vía `localStorage`.
2. **Catálogo Integral CCXT:** Infraestructura lista para descubrir y conectar más de 80 exchanges globales de criptomonedas y protocolos de brokers (MT4/MT5, cTrader, QuickFIX).
3. **Stream Unificado Singleton:** La telemetría en tiempo real se alimenta exclusivamente del servicio Singleton multiplexado, sin abrir sockets redundantes.
4. **Fondo Cinematográfico Optimizado:** Se proyecta el video `fondo_bg.mp4` / `fondo_loop.webp` con máscara de gradiente oscuro (`opacity-25`), manteniendo legibilidad perfecta de métricas financieras.

---

## 10. Estándar de Ejecución por Módulo: Ergonomía Móvil, Highlight por Coordenadas y Traducción Nativa

### 10.1 Ergonomía y Densidad Mobile-First en Paralelo
- **Diseño Móvil Concurrente Obligatorio:** Todo componente, tabla, fila o modal debe construirse y validarse simultáneamente en pantallas móviles (360px - 430px) y escritorio (1080p - 4K).
- **Prohibición de Elementos Gigantes:**
  - En móvil están terminantemente prohibidos encabezados o métricas de tamaños gigantescos (`text-3xl`, `text-4xl`) que roben el espacio de trading.
  - La escala tipográfica móvil debe mantenerse compacta y ultra legible: métricas primarias en `text-base` o `text-sm font-bold font-mono-nums`, etiquetas en `text-[10px]` o `text-[11px]`.
  - Paddings y márgenes reducidos (`p-3`, `p-3.5`, `gap-2`, `gap-2.5`) para maximizar el área visible sin scrolls innecesarios.
  - Botones y filas táctiles con altura mínima ergonómica (`min-h-[38px]`) pero compacta.

### 10.2 Sistema de Ayuda Contextual con Highlight por Coordenadas (`Onboarding Highlight System`)
- **Requisito al Concluir Cada Módulo:** Al finalizar el desarrollo funcional de cada sección, se debe incorporar una guía interactiva contextual.
- **Mecánica de Coordenadas Flotantes:**
  - El sistema detecta dinámicamente las coordenadas del elemento objetivo (`getBoundingClientRect()`) para proyectar un foco o anillo brillante (`ring-2 ring-[#EC4899] shadow-[0_0_25px_rgba(236,72,153,0.5)]`).
  - Posiciona un tooltip o ventana flotante asistida de forma inteligente (arriba, abajo o a los lados según el espacio de pantalla disponible).
  - Incluye: Título del paso, explicación técnica concisa, contador de pasos (`1 de 4`), botón "Siguiente", botón "Omitir Tour" y persistencia en `localStorage` (`globalcity_tour_completed_{moduleId}`).

### 10.3 Traducción Nativa Integral Dual (Inglés / Español)
- **Requisito al Concluir Cada Módulo:** Queda prohibido dejar textos huérfanos o hardcodeados en un solo idioma.
- **Implementación Reactiva:** Todo texto visible (encabezados, etiquetas, placeholders, botones de acción, estados de conexión, tooltips y mensajes de error/éxito) debe consumir el contexto de idioma activo (`useLanguage` / `CandlestickLanguageSelector`).
- **Diccionarios Tipados:** Cada sección debe proveer su diccionario bilingüe estructurado (`en` y `es`) garantizando consistencia terminológica institucional (ej. `Margin`, `Spread`, `Taker Fee`, `Order Book`, `API Key`, etc.).

---

## 11. Enrutamiento Canónico en Inglés y Aprovechamiento Total del Canvas (Full-Width Pro Layout)

### 11.1 Regla Canónica de Rutas en Inglés
- **Todas las rutas de la aplicación deben estar en idioma inglés:**
  - `/` (Home / Landing Page)
  - `/operations` (Trading & Operations Hub — reemplaza canónicamente a `/operaciones`)
  - `/login` (Authentication Hub)
  - `/terms` (Terms of Service)
  - `/privacy` (Privacy Policy)
- **Redirección de Compatibilidad:** Cualquier acceso legado a `/operaciones` o `/terminal` debe redirigir inmediatamente a `/operations`.

### 11.2 Aprovechamiento Total del Espacio (100% Full-Width)
- **Sin Márgenes Muertos:** En el Navbar, header superior y workspace de `/operations`, queda terminantemente prohibido encerrar la interfaz en contenedores angostos como `max-w-7xl` que dejen márgenes vacíos en monitores amplios (1080p, 1440p, 4K).
- **Layout de Borde a Borde:** Utilizar `w-full px-3 sm:px-6` con altura completa `min-h-screen`, permitiendo a los operadores ver tablas de órdenes, feeds y gráficos aprovechando todo el ancho de su pantalla.

### 11.3 Navegación Lateral Replegada en Reposo y Despliegue al Hover (Floating Overlay Drawer)
- **Modo en Reposo:** La barra lateral de navegación se mantiene replegada con solo los iconos de cada módulo (`w-16`), dejando el 100% del área de trabajo visible y despejada.
- **Despliegue al Hover:** Al pasar el cursor sobre la barra lateral o barra de usuario, se expande fluidamente (`w-64`) posicionándose por encima del contenido (`z-40 floating overlay`) con fondo backdrop-blur profundo y bordes nítidos, retrayéndose automáticamente al retirar el cursor (`onMouseLeave`).
- **Alineación Estética con la Landing Page:**
  - Secciones agrupadas con etiquetas en mayúsculas monospace (`APPLICATION`, `SETTINGS & RISK`).
  - Botón activo en píldora con esquinas redondeadas (`rounded-xl`) y degradado insignia de la landing (`bg-gradient-to-r from-[#EC4899] to-[#38BDF8] text-white font-bold shadow-lg shadow-[#EC4899]/25`).
  - Badges de conteo numérico en píldoras con color de acento (`bg-[#EC4899]/20 text-[#F472B6]`).

---

## 12. Prohibición Terminante de Etiquetas Técnicas Innecesarias & Pestañas de Categoría

### 12.1 Prohibición de Badges Técnicos Clutter (Cero Etiquetas Tipo Redis / WS Multiplex)
- **Regla Estricta:** Queda terminantemente prohibido incluir etiquetas o pills visibles que expongan detalles técnicos internos como `Redis 7 NX`, `WS Multiplex 1:1`, o estados de caché similares en el dashboard.
- **Enfoque Limpio:** La interfaz debe ser limpia, ejecutiva y enfocada 100% en cotizaciones, balances, gestión de órdenes y rendimiento del portafolio.

### 12.2 Sistema de Pestañas Superiores de Conectividad (Exchanges, Brokers, Futuros)
- **Tres Categorías Distintivas con Código Cromático Propio:**
  1. **Exchanges (Cripto CCXT):** Acento azul/ámbar (`#38BDF8` / `#F59E0B`). Muestra el catálogo y conexiones de Binance, Bybit, OKX, KuCoin, Hyperliquid, etc.
  2. **Brokers (DMA / Forex / ECN):** Acento verde esmeralda (`#10B981`). Muestra terminales MetaTrader 5 (MT5), cTrader y brokers ECN como Pepperstone.
  3. **Futuros (CME / Institucional):** Acento rosa/púrpura (`#EC4899`). Muestra estado de despliegue institucional para futuros regulados (CME, Rithmic, CQG).
- **Persistencia de Estado:** La pestaña activa se almacena en `localStorage` (`globalcity_active_venue_type`) para preservar la selección del operador incluso al cambiar de módulo lateral.



