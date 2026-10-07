---
name: zyti-trade-design-system-and-horizontal-flow-spec
description: Sistema de diseño visual, paleta cromática editorial (Warm Cream y Dark Obsidian), arquitectura de navegación horizontal fluida, animaciones con zoom, levitación orgánica y gobernanza Mobile-First obligatoria para ZYTI Trade.
version: 1.1.0
category: Design System, Mobile-First & Motion Engineering
status: Authoritative
---

# ZYTI TRADE — DESIGN SYSTEM & HORIZONTAL MOTION FLOW SPECIFICATION (MOBILE-FIRST)

## 1. FILOSOFÍA VISUAL: EDITORIAL MINIMALISTA & HIGH-PERFORMANCE
ZYTI Trade rechaza las plantillas genéricas sobrecargadas con badges artificiales y cajitas de iconos repetitivas.
Se inspira en productos de diseño de autor (como Linear, Raycast y Scopebird), combinando un fondo editorial cálido y sereno con una terminal de trading de ultra alta precisión.

---

## 2. PALETA CROMÁTICA EXACTA Y PATRONES DE COLOR

### A. Modo Claro (Warm Cream Editorial — Tema Definitivo)
- **Lienzo Base (Canvas & Body):** `#FBF9F4` (Marfil cálido sereno).
- **Tarjetas Principales (Warm Card):** `#FFFFFF` con bisel fino `rgba(220, 214, 202, 0.7)` y sombra orgánica suave `box-shadow: 0 25px 50px -12px rgba(27, 24, 18, 0.08)`.
- **Texto Principal (Headings):** `#020617` / `#0F172A` (Negro azabache absoluto de imprenta).
- **Texto Secundario (Párrafos y Datos):** `#1E293B` (Carbón profundo con contraste 12:1).
- **Acento Hero (Degradado Eléctrico Vanguardista):**
  `linear-gradient(135deg, #7C3AED 0%, #9333EA 45%, #2563EB 100%)`
- **Botón Primario Unificado:** Amarillo Mostaza Cálido `#EAB308` (`hover: #CA8A04`) con texto negro azabache (`#020617`), icono `Zap` y micro-rebote `active:scale-95`.
- **Botón Secundario:** Borde fino de trazo `#0F172A` sobre fondo transparente con `hover:bg-slate-900/5`.
- **Verde de Ejecución Óptima:** `#65A30D` (Verde oliva institucional).
- **Rojo de Alerta de Spread:** `#DC2626` (Rojo carmesí puro).

### B. Modo Oscuro (Dark Obsidian — Disponible para Terminal)
- **Lienzo Base:** `#0A0D14` (Obsidiana profundo).
- **Tarjetas:** `#111726` con bisel `#1F293D` y sombra profunda.
- **Texto:** `#F8FAFC` (Blanco limpio) y `#94A3B8` (Slate secundario).

---

## 3. ARQUITECTURA MOBILE-FIRST OBLIGATORIA (REGLAS INVIOLABLES)

Todo componente y pantalla de ZYTI Trade debe diseñarse bajo la estricta metodología **Mobile-First**:

### A. Viewport Dinámico (`100dvh`) vs `100vh`
- **Prohibido `h-screen` rígido:** En navegadores móviles (iOS Safari, Android Chrome), las barras de navegación dinámica del sistema recortan el contenido si se usa `h-screen` (`100vh`).
- **Regla Estricta:** Usar siempre `h-[100dvh]` y `min-w-full w-screen`.

### B. Scroll Interno Vertical en Paneles Horizontales
- En pantallas móviles (ancho < 1024px), el alto vertical es limitado (600px - 850px).
- **Regla Estricta:** Cada panel horizontal debe permitir scroll vertical interno:
  `className="min-w-full w-screen h-[100dvh] flex flex-col justify-start lg:justify-center snap-center px-4 sm:px-6 lg:px-12 pt-20 sm:pt-24 lg:pt-16 pb-12 overflow-y-auto no-scrollbar"`
- Esto garantiza que tarjetas, botones CTA y paginadores nunca queden amputados o inalcanzables en pantallas pequeñas.

### C. Navegación Móvil Táctil (Drawer & Menú Hamburguesa)
- **Ocultamiento de Menús Hover en Móvil:** Los dropdowns masivos de 15 items por hover de escritorio quedan terminantemente prohibidos en pantallas táctiles (`hidden lg:flex`).
- **Exclusividad del Menú Hamburguesa en Móvil (`md:hidden`):**
  - El menú de hamburguesa está estrictamente reservado a pantallas móviles (`< 768px`). En resoluciones de escritorio o laptops jamás debe mostrarse el menú de hamburguesa.
  - En la barra superior de móvil se ubica únicamente el logotipo institucional a la izquierda y el botón de hamburguesa a la derecha (sin selector de idioma exterior para evitar duplicidades).
- **Selector de Idioma Centralizado en Móvil:**
  - El selector de idioma (Español / English) se aloja exclusivamente en la cabecera interna del Drawer táctil móvil, con botones de conmutación de alto contraste.
- **Prohibición de Prefijos Numéricos en Enlaces:**
  - Queda estrictamente prohibido anteponer números correlativos (`01.`, `02.`, etc.) tanto en los enlaces del menú móvil como en la columna de secciones del Footer institucional. Los enlaces deben mostrar exclusivamente sus nombres limpios (ej. *Inicio / Terminal OS*, *Exchanges (16 Venues)*, *Prop Firms (16 Firmas)*, *Servicios*, *Precios*, *Seguridad*, *Descargar & Apps*).

### D. Escala Tipográfica Fluida
- Títulos principales en móvil: `text-3xl sm:text-5xl lg:text-[66px]` (nunca forzar `text-6xl` directo en pantallas de 360-390px).
- Subtítulos: `text-sm sm:text-base lg:text-lg`.
- Botones de acción: `w-full sm:w-auto` en móvil para facilitar el tap con una sola mano.

### E. Dimensionado Responsivo de Animaciones Lottie
- En desktop: `w-52 h-52` o `w-56 h-56`.
- En móvil: `w-28 h-28 sm:w-36 sm:h-36 lg:w-52 lg:h-52`. Evita desplazar las tarjetas de cotización o los planes fuera del área visible inmediata.

### F. Grids Adaptativos (1 Columna en Móvil -> 2/3 en Desktop)
- Exchanges y Prop Firms: `grid-cols-1 md:grid-cols-2` con controles de carrusel en la base.
- Precios y Descargas: `grid-cols-1 md:grid-cols-3` con espaciado vertical óptimo (`gap-4 sm:gap-6`).

---

## 4. ARQUITECTURA DE NAVEGACIÓN HORIZONTAL FLUIDA (DESKTOP & TOUCH SWIPE)
1. **Paneles Horizontales de Pantalla Completa:**
   - Panel 0: **Hero & Plan de Trading en Vivo** (`w-screen`).
   - Panel 1: **Exchanges Soportados & Conectividad WSS** (16 Venues, Carrusel 4 en 4).
   - Panel 2: **Prop Firms Auditadas** (16 Firmas, Carrusel 4 en 4).
   - Panel 3: **Ecosistema de Servicios** (Prop Firms, MultiExchange, Copy, Arbitraje).
   - Panel 4: **Precios Institucionales** (3 Planes + Toggle Pro Mensual/Anual + Lottie).
   - Panel 5: **Seguridad Criptográfica** (Enclave Local AES-256 + Lottie Escudo).
   - Panel 6: **Descargar Terminal** (Windows .exe, Android APK, Web PWA).
   - Panel 7: **Footer Institucional** (Gobernanza, Telemetría, Links 01-07).
2. **Control Multicanal:**
   - Swipe táctil fluido nativo en móviles mediante `snap-x snap-mandatory`.
   - Rueda del ratón / Trackpad sincronizada con scroll horizontal en escritorio.
   - Paginador horizontal e indicadores de sección.

---

## 5. SISTEMA DE MOTION Y ANIMACIONES
1. **Entrada de Secciones con Zoom (Zoom-in Reveal):**
   - Transición de escala (`scale-95` a `scale-100`) con opacidad progresiva y curva `cubic-bezier(0.16, 1, 0.3, 1)`.
2. **Levitación Orgánica (Float Physics):**
   - Tarjetas satélite flotan sutilmente con keyframes de gravedad cero (`translateY(-6px)` ciclo de 4s).
   - En móvil, adaptadas para no salirse de los límites de pantalla (`relative sm:absolute`).
3. **Barra de Progreso Inferior Dinámica:**
   - Indicador dinámico de avance (`((activeSection + 1) / TOTAL_SCREENS) * 100%`).

---

## 6. GOBERNANZA ESTRICTA DE RESOLUCIONES DE ESCRITORIO (>= 1024px)

> **REGLA DE ORO INVIOLABLE:**
> **Toda pantalla o ventana con ancho igual o superior a 1024px (`>= 1024px`) ES ESCRITORIO INSTITUCIONAL OBLIGATORIO.**

### A. Reglas Mandatarias para la Trading Terminal en Escritorio (>= 1024px):
1. **Layout Dividido Horizontal Permanente:**
   - A la izquierda: **Gráfico KLineCharts Dominante** (`flex-1`, ocupando entre el 78% y 82% del ancho de pantalla).
   - A la derecha: **Panel Lateral Estrecho de Trading** con ancho fijo estricto (`w-[270px]` a `w-[290px]`), alojando el Order Book L2 compacto y el widget de ejecución de órdenes sin saturar la pantalla.
   - En la base izquierda: **Panel de Posiciones y Órdenes** con altura compacta (`h-32` a `h-36`).
2. **Prohibición Terminante de Controles Móviles y Botones Flotantes en Escritorio:**
   - Queda estrictamente prohibido renderizar pestañas táctiles móviles (*Operar / Order Book / Posiciones*), botones flotantes de comprar/vender (Quick Trade), o el checkbox de activación de botones flotantes en el formulario de órdenes en resoluciones `>= 1024px`.
   - En escritorio, toda la operativa se realiza exclusivamente en el panel lateral institucional (`.terminal-desktop-sidebar`).
3. **Blindaje de Estilos con Media Queries Explícitas y Desmontaje en React:**
   - Para evitar inconsistencias de especificidad o fallos de compilación en utilidades de Tailwind, se deben blindar las reglas de escritorio en CSS puro con `@media (min-width: 1024px)` y `!important` en las clases estructurales:
     - `.terminal-desktop-sidebar`: Visible exclusivamente en `>= 1024px`.
     - `.terminal-mobile-controls`, `.terminal-mobile-only`, `.terminal-floating-quicktrade`, `.terminal-mobile-sheet`, `.terminal-mobile-bottom-nav`: Ocultos estrictamente (`display: none !important; visibility: hidden !important; pointer-events: none !important;`) en `>= 1024px`.
   - En React, los componentes móviles (`TerminalMobileSheet`) y el selector de botones flotantes deben estar condicionados a `!isDesktop` para no inyectarse en el DOM de escritorio bajo ninguna circunstancia.

### B. Reglas Mandatarias para la Trading Terminal en Móviles (< 1024px):
1. **Gráfico con Máxima Visibilidad:**
   - El canvas ocupa toda la altura disponible entre la cabecera superior y la barra de navegación inferior (`flex: 1 1 0%`).
2. **Barra de Navegación Inferior Fija:**
   - Barra de botones táctiles en la base (`h-14`): *Operar*, *Order Book*, *Posiciones*.
3. **Bottom Sheet Deslizante a Mitad de Pantalla (50dvh):**
   - Al tocar cualquier botón, la sección se eleva desde la parte inferior cubriendo exactamente la mitad de la pantalla (`h-[50dvh]`).
   - El 50% superior mantiene el gráfico interactivo visible en tiempo real.
   - El usuario puede cerrar la hoja tocando de nuevo el botón activo, pulsando el botón de cierre (`X`) o el fondo translúcido superior para devolver el 100% del espacio al gráfico.
4. **Botones Flotantes de 1 Toque (Quick Trade - Exclusivo Móvil):**
   - Habilitables únicamente en móviles mediante el interruptor dentro del formulario de la hoja modal.
   - Flotan sobre el gráfico a `bottom-16` (o `bottom-[52dvh]` si la hoja está abierta) para compra y venta instantánea con 1 toque.
   - **NUNCA DEBEN EXISTIR NI RENDERIZARSE EN ESCRITORIO.**

### C. Arquitectura Obligatoria de Componentes Modulares y Reutilizables:
1. **Desacoplamiento Estricto y Prohibición de Monolitos:**
   - La Trading Terminal (`TradingTerminal.tsx`) debe ser un orquestador ligero y desacoplado (~150-250 líneas), centrado exclusivamente en inicializar el Canvas KLineCharts y gestionar el Web Worker de datos.
   - Queda estrictamente prohibido acumular más de 300-400 líneas en un solo archivo de terminal; todo bloque funcional debe residir en componentes atómicos en `src/components/terminal/`.
2. **Subcomponentes Atómicos Mandatarios (`src/components/terminal/`):**
   - `TerminalHeader.tsx`: Cabecera institucional con par, precios 24h, estado del Worker, usuario y botón de salir siempre visible en escritorio.
   - `TerminalToolbar.tsx`: Selector de temporalidades e indicadores con menús de 3 puntos (`...`), catálogo ampliado de 1s a anuales, favoritos con estrella ★ y persistencia en `localStorage`.
   - `TerminalSideNav.tsx`: Navegación lateral ultra-slim en escritorio (expandible al hover sobre el gráfico sin empujar el canvas, con botón de cambio de posición izquierda/derecha) y drawer animado para móviles.
   - `TerminalOrderBook.tsx`: Order Book L2 reutilizable con profundidad de compras y ventas.
   - `TerminalOrderForm.tsx`: Formulario de órdenes (compra/venta, apalancamiento, market/limit) reutilizable.
   - `TerminalPositions.tsx`: Tabla inferior de posiciones abiertas para escritorio.
   - `TerminalMobileSheet.tsx`: Barra de navegación inferior móvil + hoja deslizante a mitad de pantalla (`50dvh`).
   - `TerminalExchangeModal.tsx`: Pantallas cristalinas Glassmorphism superpuestas al gráfico.


