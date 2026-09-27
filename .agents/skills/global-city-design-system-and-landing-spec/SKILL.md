---
name: global-city-design-system-and-landing-spec
description: "Sistema de diseño visual, lenguaje estético, tipografía, iconografía, paleta cromática (Morado, Blanco, Negro en tonalidad clara) y especificación de la Landing Page de Global City Funding (Empresa de Fondeo con Terminal Propia, Copy a Exchanges y APKs oficiales)."
version: "3.0.0"
category: "Design System & Landing Page Specification"
author: "Global City Design & Fintech Architect"
status: "Authoritative / Supreme Standard"
---

# Global City Funding: Design System & Landing Page Specification
### *Estética Institucional Clara: Morado Eléctrico, Blanco Puro y Negro Ónix*

Esta skill codifica el **sistema de diseño visual, la paleta cromática clara (Morado, Blanco, Negro), la dirección tipográfica y el copywriting de alta fidelidad** para la Landing Page de **Global City Funding**, enfocada en la Empresa de Fondeo de Próxima Generación con Terminal Propia, retos transparentes, herramientas de copy trading a exchanges vía API y hoja de ruta a APKs oficiales.

---

## 1. Deconstrucción Estética: Atmósfera Clara, Lujosa y No Genérica

Rechazamos los fondos oscuros genéricos de templates tanto como los sitios blancos planos y aburridos. **Global City Funding** adopta una **tonalidad clara de grado institucional suizo/cuantitativo**:

### A. Atmósfera y Composición Espacial
- **Lienzo Base (Canvas Claro):** Fondo ultra-limpio con ligera refracción perlada `#F8F9FE` / `#FFFFFF` con sutiles mallas de resplandor morado/amatista ambiental (`rgba(124, 58, 237, 0.06)` a `rgba(168, 85, 247, 0.12)`).
- **Tarjetas y Superficies Bento Ligeras (Frosted Glassmorphism):**
  - Fondo de tarjeta: Blanco puro translúcido `rgba(255, 255, 255, 0.88)` o `#FFFFFF` sólido con sutil relieve de sombra arquitectónica (`box-shadow: 0 10px 30px -5px rgba(124, 58, 237, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)`).
  - Borde de contenedor: `1px solid rgba(124, 58, 237, 0.14)` o `1px solid rgba(15, 23, 42, 0.08)`.
  - Radio de curvatura de contenedores: `rounded-2xl` a `rounded-3xl` (16px a 24px) con transiciones suaves `duration-300`.
- **Estructura de Contraste Negro & Morado:**
  - Los elementos de mayor jerarquía estructural (botones primarios, badges de tecnología, títulos dominantes) usan **Negro Ónix `#090A10`** o **Morado Eléctrico `#7C3AED`**.
  - Los acentos de acción, estados activos y resplandores usan gradientes violeta-amatista (`from-[#7C3AED] via-[#9333EA] to-[#6366F1]`).

### B. Paleta de Color Institucional Global City Funding
| Token | Valor Hex / RGBA | Uso Semántico |
| :--- | :--- | :--- |
| `--bg-canvas-light` | `#F8F9FE` | Fondo general de la página con sensación abierta y limpia. |
| `--bg-card-light` | `#FFFFFF` | Superficie blanca de tarjetas bento, tablas y paneles. |
| `--bg-card-glass` | `rgba(255, 255, 255, 0.82)` | Paneles flotantes con `backdrop-blur(16px)`. |
| `--border-light-subtle` | `rgba(15, 23, 42, 0.08)` | Bordes sutiles de separación y estructuras de tabla. |
| `--border-purple-accent` | `rgba(124, 58, 237, 0.22)` | Bordes activos, focus rings y contornos de tarjetas destacadas. |
| `--purple-primary` | `#7C3AED` | Morado institucional primario, CTAs principales e iconos clave. |
| `--purple-vibrant` | `#8B5CF6` | Estados hover, gradientes lumínicos y barras de progreso. |
| `--purple-deep` | `#5B21B6` | Texto morado sobre fondo claro para máxima legibilidad WCAG AAA. |
| `--purple-subtle` | `rgba(124, 58, 237, 0.08)` | Fondos de badges, chips de temporalidad y píldoras de estado. |
| `--black-obsidian` | `#090A10` | Tipografía principal, botones estructurados y elementos de máximo contraste. |
| `--black-slate` | `#1E293B` | Subtítulos ejecutivos y textos descriptivos con nitidez. |
| `--status-positive` | `#059669` | Métricas de beneficio, pagos confirmados y PnL verde esmeralda. |
| `--status-risk` | `#DC2626` | Drawdown, alertas de pérdida diaria y límites de riesgo. |

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
- ❌ **Evitar:** *"Pasa tu reto de fondeo fácil y gana miles de dólares con el mejor broker."*
- ✅ **Global City Funding:** *"Programas de evaluación de capital institucional y cuentas fondeadas hasta $500,000. Terminal propia en Canvas acelerada por GPU, reglas objetivas sin trampas de trailing intradía y liquidación de beneficios en 24 horas."*
- ❌ **Evitar:** *"Usa MT5 y copia señales de trading con nosotros."*
- ✅ **Global City Funding:** *"Independencia tecnológica total: opera en nuestra propia terminal de trading sin intermediarios ni latencias de terceros, y replica tus operaciones automáticamente a tus cuentas de Binance y Bybit vía API."*

---

## 4. Arquitectura de Secciones de la Landing Page

La landing page de Global City Funding se estructura con máxima claridad visual y elegancia:

```text
[ 1. Top Navigation Bar ] (Logo Global City Funding, Programas de Fondeo, Terminal Propia, Copy a CEX, Reglas, Botón "Empezar Reto")
            │
            ▼
[ 2. Hero Section ] (Titular dominante: Empresa de Fondeo con Terminal Propia + Reparto 90% + CTA "Elegir Programa" + Preview de Terminal KLineChart v10)
            │
            ▼
[ 3. Live Funding Telemetry & Ticker ] (Sincronización en vivo con libros L2, métricas de pagos en 24h y ratio de solvencia)
            │
            ▼
[ 4. Horizontal Interactive Showcase (Sticky Drag Scroller) ]
     ├── Slide 1: Programas de Fondeo ($25k a $500k, 1-Step y 2-Step, scaling hasta $2M)
     ├── Slide 2: Terminal Propia Global City (KLineChart v10 a 60 FPS, sin MT5)
     ├── Slide 3: Herramienta de Copy Trading a Exchanges vía API (Replicación a Binance/Bybit)
     ├── Slide 4: Hoja de Ruta a APKs Oficiales (Trading nativo en Android/Mobile)
     └── Slide 5: Risk Guardian & Reglas Claras (Cero trampas de trailing flotante intradía)
            │
            ▼
[ 5. Programas y Calculadora de Fondeo ] (Selector de capital $25k-$500k, objetivos de beneficio 8%/5%, drawdown máximo 10%, split hasta 90%)
            │
            ▼
[ 6. Suite de Herramientas Tecnológicas Propietarias ]
     ├── Módulo A: Motor de Arbitraje Institucional de Liquidez L2
     ├── Módulo B: Rebalanceo Automático y Gestión Delta-Neutral
     └── Módulo C: Gateway de Notificaciones y Operaciones por Telegram
            │
            ▼
[ 7. Matriz Comparativa: Global City Funding vs. Prop Firms Tradicionales (MT5) ]
            │
            ▼
[ 8. Conversion Hero / CTA Final ] + [ 9. Quiet Institutional Footer ]
```

---

## 5. Especificaciones de Componentes Clave

### A. Top Navigation Bar (Estética Clara)
- **Fondo:** Blanco translúcido `rgba(255, 255, 255, 0.85)` con `backdrop-blur(16px)` y sutil borde inferior en `rgba(124, 58, 237, 0.12)`.
- **Zona 1 (Brand):** Logo Global City Funding (Emblema institucional en morado amatista y tipografía negra `Plus Jakarta Sans` 800).
- **Zona 2 (Nav Links):** `Fondeo`, `Terminal Propia`, `Copy a CEX`, `Reglas & Scaling`, `Herramientas`.
- **Zona 3 (Acciones):** Botón secundario "Iniciar Sesión" + Botón primario en Morado Vibrante `#7C3AED` (o Negro Ónix con resplandor morado) "Empezar Reto".

### B. Horizontal Showcase (Fondeo + Terminal + Copy a Exchanges)
- Conserva el suave scroll horizontal interactivo / arrastre en desktop y deslizamiento en mobile.
- Las diapositivas destacan visualmente los beneficios de Global City Funding sobre tarjetas blancas inmaculadas con acentos morados y tipografía negra de alta legibilidad.

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



