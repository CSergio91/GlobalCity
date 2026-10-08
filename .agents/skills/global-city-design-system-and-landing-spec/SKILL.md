---
name: global-city-design-system-and-landing-spec
description: "Sistema de diseño visual, lenguaje estético, tipografía, iconografía, paleta cromática (Dark Obsidian, Morado Eléctrico, Oro Celestial, Cristal Esmerilado) y especificación de la Landing Page de EKLIPSE FUNDED (Empresa de Fondeo Cripto con Terminal Propia, Fondeo Inmediato, Reparto 35/50/80/90 y Cobertura Pantalla Completa)."
version: "4.0.0"
category: "Design System & Landing Page Specification"
author: "EKLIPSE Design & Fintech Architect"
status: "Authoritative / Supreme Standard"
---

# EKLIPSE FUNDED: Design System & Platform Specification
### *Estética Institucional: Dark Obsidian, Celestial Eclipse, Morado Eléctrico y Cristal Esmerilado Ultra-Lujo*

Esta especificación codifica el **sistema de diseño visual, la paleta cromática oficial, la arquitectura de componentes y las reglas inviolables de producto** de **EKLIPSE FUNDED**, la plataforma de fondeo de derivados cripto de próxima generación con terminal propia, fondeo inmediato sin retos, retiros quincenales en USDT y micro-interacciones cinematográficas.

---

## 1. Filosofía de Diseño: Celestial Eclipse & Obsidian Glassmorphism

Rechazamos las plantillas genéricas oscuras tanto como los sitios saturados de datos técnicos irrelevantes. **EKLIPSE FUNDED** proyecta una atmósfera de **alta finanza cuantitativa y lujo cripto institucional**:

### A. Atmósfera y Composición Espacial
- **Lienzo Base (Canvas Nocturno Profundo):** Fondo espacial `#06070B` con viñetas radiales cálidas de ámbar/oro celestial y halos violeta amatista ambiental (`rgba(124, 58, 237, 0.08)` a `rgba(245, 158, 11, 0.10)`).
- **Cobertura de Pantalla Completa (`min-h-screen`):**
  - Cada sección de la plataforma (`#hero`, `#programs`, `#terminal`, `#rules`, `#markets`, `#payout`, `#why-eklipse`, `#community`, `#faq`, `#cta`) ocupa la pantalla completa (`min-h-screen w-full flex flex-col justify-center items-center relative`).
  - El usuario experimenta una narrativa visual continua y cinematográfica al hacer scroll.
- **Superficies de Cristal Líquido (Ultra-Frosted Crystal Glassmorphism):**
  - **Fondo de Tarjeta:** Gradiente vidriado translúcido `from-white/[0.12] via-slate-950/70 to-black/85` con `backdrop-blur-3xl`.
  - **Borde de Refracción Especular:** Borde translúcido `border border-white/15` con resplandor superior reforzado `border-t-white/30` o `border-t-purple-300/80`.
  - **Iluminación Interna:** Sombra interna `shadow-[inset_0_1px_2px_rgba(255,255,255,0.35)]` combinada con resplandor exterior púrpura en la tarjeta activa (`shadow-[0_0_50px_rgba(168,85,247,0.35)]`).
  - **Micro-Paneles Internos:** Paneles interiores con cristal esmerilado ahumado (`bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)]`).

### B. Paleta de Color Institucional Oficial
| Token | Valor Hex / RGBA | Uso Semántico |
| :--- | :--- | :--- |
| `--bg-obsidian` | `#06070B` | Fondo matriz general de toda la aplicación. |
| `--bg-card-glass` | `rgba(255, 255, 255, 0.04)` | Superficies translúcidas de tarjetas con `backdrop-blur-3xl`. |
| `--border-specular` | `rgba(255, 255, 255, 0.15)` | Bordes nítidos de refracción de luz en tarjetas de cristal. |
| `--indigo-primary` | `#6366F1` | Acento celestial de botones primarios ("Get Funded") y titular "Next Level". |
| `--purple-primary` | `#7C3AED` / `#9333EA` / `#A855F7` | Morado eléctrico institucional para acentos de marca, degradados y halos cósmicos. |
| `--purple-glow` | `rgba(168, 85, 247, 0.40)` | Resplandor ambiental de cuentas y elementos interactivos. |
| `--pepe-emerald` | `#10B981` / `#34D399` | Protagonista de mercados (PEPE), halos de activo destacado y PnL positivo. |
| `--gold-amber-accent` | `#F59E0B` / `#FBBF24` | Sol del eclipse, badges y detalles de alta jerarquía. |
| `--emerald-payout` | `#10B981` | Retiros, métricas positivas de PnL y cumplimiento de reglas. |
| `--rose-risk` | `#F43F5E` | Límites de pérdida diaria (2%) y drawdown máximo (8%). |
| `--text-white` | `#FFFFFF` | Titulares dominantes, valores financieros y datos prioritarios. |
| `--text-slate-muted` | `#94A3B8` | Etiquetas de especificaciones y descripciones secundarias. |

### C. Composición Asimétrica del Hero & Pinned Single Page Stage
1. **Jerarquía Cromática Oficial:**
   - **Colores Protagonistas de Marca:** Dark Obsidian (`#06070B`), Índigo Eléctrico (`#6366F1`), Púrpura Imperial (`#7C3AED` / `#9333EA` / `#A855F7`) y Oro Ámbar Solar (`#F59E0B`).
   - **Regla Estricta del Color Verde:** El color verde (`#10B981`) queda **estrictamente restringido a micro-acentos** (indicadores de PnL positivo, ticks discretos y avatar de PEPE). Queda terminantemente prohibido usar fondos verdes masivos o tarjetas dominantemente verdes.
2. **Coreografía de Escenario Pinned Single-Screen (`HeroExperienceStage`):**
   - **Misma Pantalla Fija:** Todas las secciones de la experiencia principal (`#hero` y `#programs`) se renderizan en el **mismo viewport fijado** (`sticky top-0 h-screen w-full`).
   - **Transición Animada Saliente y Entrante:** Al hacer scroll sobre la pista contenedora (`h-[260vh]`):
     - La sección activa (`#hero`) se desvanece y se desplaza suavemente hacia afuera (`opacity: 1 -> 0`, `translate3d(-140px, -30px, 0) scale(0.95)`).
     - La sección siguiente (`#programs`) entra animada desde afuera hacia el centro en la misma pantalla (`opacity: 0 -> 1`, `translate3d(0, 0, 0) scale(1)`).
     - Al hacer scroll inverso hacia arriba, la transición se revierte de forma fluida y simétrica a 60/120 FPS sin reflows ni saltos de DOM.
3. **Regla Inviolable de Cero Bloques Opacos (Ultra-Transparent Crystal Glass):**
   - **Fondo de Video 100% Visible:** Queda prohibido utilizar contenedores sólidos, tarjetas opacas o fondos oscuros pesados que tapen el video de 240 fotogramas del eclipse.
   - Todo componente debe usar cristal ultra-traslúcido (`bg-white/[0.03]`, `border border-white/10`, `backdrop-blur-md`), permitiendo contemplar la montaña, el sol naciente, el agua y las luces de la ciudad en todo momento.
4. **Prohibición Estricta de Etiquetas "Direct Capital Allocations" y Etiquetas Superiores:**
   - **Cero Etiquetas de "Direct Capital Allocation":** Prohibido incluir badges, etiquetas o elementos de lista con el texto *"Direct capital allocation"* o *"Asignación directa de capital"*.
   - **Cero Etiquetas Superiores en Tarjetas:** Las tarjetas de cuentas inician directamente con la tipografía monumental del capital (`$50,000 USDT`), erradicando etiquetas superiores redundantes como *"Allocated Capital"* o *"Balance Asignado"*.
5. **Contrato de Datos Dinámico para Nexus CRM:**
   - Todos los modelos de cuentas y reglas de trading residen en un contrato agnóstico reactivo (`src/data/challengePlans.ts` / `getLiveChallengePlans()`).
   - El catálogo es 100% sincronizable y modificable desde la base de datos de PostgreSQL/Supabase a través del CRM Nexus sin requerir cambios de código en la UI.
6. **Cursor Celestial:** Anillo orbital con micro-núcleo estelar reactivo al hover y clic (sin velas japonesas intrusivas, cero re-renders de React).

---

## 2. Tipografía e Iconografía

### A. Tipografías
1. **Titulares y Marca (Display):** Tipografía bold y black moderna con compensación visual (`font-black tracking-tight`).
2. **Cuerpo de Texto (Body):** Fuente sans-serif contemporánea (`font-normal leading-relaxed text-slate-300`).
3. **Métricas Financieras y Datos Numéricos:** `JetBrains Mono` con alineación tabular para precios, porcentajes y balances en USDT (`font-mono font-black tracking-tight`).

### B. Iconografía (Lucide React)
- **Riesgo & Seguridad:** `ShieldCheck`, `AlertTriangle`, `Activity`.
- **Trading & Finanzas:** `Flame`, `Target`, `Zap`, `TrendingUp`.
- **Navegación & Acciones:** `ChevronRight`, `ChevronLeft`, `ArrowRight`, `ArrowUpRight`.
- **Soporte & Comunidad:** `Send` (Telegram), `MessageSquare` (Discord), `Mail` (Soporte).

---

## 3. Modelo de Negocio y Reglas Inviolables de Producto

### A. Política Estricta de No Reembolso
- **Regla Inviolable:** No existe reembolso de tarifa ni reembolso de capital bajo ningún concepto.
- **Prohibición Total:** Queda terminantemente prohibido incluir textos como *"100% refundable with 1st payout"*, *"tarifa reembolsable"* o similares en cualquier parte de la plataforma.

### B. Cero Menciones Prohibidas
- **PROHIBIDO "1 Fase":** No se utiliza la etiqueta *"1 Fase"*. El programa se denomina **Fondeo Directo** (Direct Funded).
- **PROHIBIDO "Simulado" o "Retiro USD":** Se eliminan textos redundantes sobre entorno simulado o retiros USD debajo de los balances principales. La moneda es **USDT** de forma exclusiva.
- **PROHIBIDO Jerga Técnica Excesiva:** Prohibido mencionar internamente *"KlineChart"*, *"latencia sub-milimétrica"*, *"FIX 4.4"*, *"KMS Hardware"* o *"pasarelas DMA"*. El trader valora la experiencia de uso, las reglas claras y los pagos rápidos.

### C. Catálogo Oficial de Cuentas y Precios (Exclusivamente USDT)
El selector cuenta con 7 tamaños exactos organizados en un selector de 2 filas:
- **Fila 1 (Superior):**
  - **1K:** 15 USDT
  - **2.5K:** 25 USDT
  - **5K:** 49 USDT
- **Fila 2 (Inferior):**
  - **10K:** 89 USDT
  - **25K:** 159 USDT
  - **50K:** 249 USDT *(Marcada por defecto con estrella `★` y badge `Más Popular`)*
  - **100K:** 399 USDT

### D. Reglas de Riesgo y Operativa
- **Apalancamiento:** `20x – 100x` en todos los pares de futuros cripto.
- **Pérdida Diaria:** `2%` calculado sobre el balance inicial del día (00:00 UTC).
- **Drawdown Máximo:** `8%` respecto al capital inicial de la cuenta.
- **Consistencia:**
  - `20% Estándar` (modo base).
  - `40% Flex` (+15% de coste como Add-on opcional para mayor margen de beneficio diario).
- **Días Mínimos:** `5 Días` rentables (mínimo +0.5% en cada día) antes de solicitar retiro.
- **Reparto Progresivo de Beneficios (Payout Split):**
  - **1er Retiro:** `35%`
  - **2do Retiro:** `50%`
  - **3er Retiro:** `80%`
  - **4to+ Retiro:** `90%` permanente.
- **Objetivo para Pago del 90%:** `15%` de beneficio acumulado permanente. Sin objetivos iniciales obligatorios para retirar beneficios tempranos.
- **Frecuencia de Retiro:** Quincenal (cada 14 días) transferido directamente en **USDT on-chain**.

---

## 4. Arquitectura de Secciones de la Landing Page

La Landing Page de EKLIPSE FUNDED está estructurada para que cada sección cubra el 100% del viewport vertical (`min-h-screen`):

```text
[ 1. Top Navbar ] (Logo Eklipse con emblema Sol-Luna, selector de idioma de vela, enlaces a Fondeo, Terminal, Reglas, Mercados, FAQ + Botón "Fondeo Inmediato")
       │
       ▼
[ 2. Hero Section ] (min-h-screen, titular animado: "Fondeo Cripto Inmediato. Sin [Challenge / Reglas Ocultas / Estrés / Presión / Miedo]." + Único CTA Centrado "Obtener Fondeo Inmediato")
       │
       ▼
[ 3. Programs Section (Cuentas de Fondeo) ] (min-h-screen, selector de 2 filas de capital, carrusel 3D Coverflow con foco en el centro exacto, estilo cristal)
       │
       ▼
[ 4. Horizontal Showcase (Eklipse OS Experience) ] (Pinned horizontal scroller con 4 diapositivas: Terminal Propia, Órdenes con SL/TP, Control de Riesgo 2%/8%, Payouts Quincenales)
       │
       ▼
[ 5. Risk & Rules Section ] (min-h-screen, 6 KPI cards: 2% Pérdida Diaria, 8% Drawdown, Consistencia 20%/40%, 5 Días Mínimos, Objetivo 15% para Payout 90%, Apalancamiento 20x-100x)
       │
       ▼
[ 6. Crypto Markets Section ] (min-h-screen, contratos perpetuos líquidos: BTC/USDT, ETH/USDT, SOL/USDT con spreads en vivo)
       │
       ▼
[ 7. Payout Roadmap Section ] (min-h-screen, progresión de reparto 35/50/80/90, pagos quincenales en USDT, escalado de cuenta hasta $2M)
       │
       ▼
[ 8. Why EKLIPSE Section ] (min-h-screen, 4 pilares: Terminal a medida, Reglas transparentes, Motor de riesgo en vivo, Construido para escalar)
       │
       ▼
[ 9. Community Section ] (min-h-screen, accesos directos a Telegram Oficial y Discord de Traders)
       │
       ▼
[ 10. FAQ Section ] (min-h-screen, acordeón con las 13 preguntas clave de fondeo, reglas, operativa y pagos)
       │
       ▼
[ 11. Final CTA Section ] (min-h-screen, titular "¿Listo para demostrar tu ventaja?" + Botón dominante "Obtener Fondeo Inmediato")
       │
       ▼
[ 12. Celestial Eclipse Footer ] (Fondo optimizado footer.webp a 66 KB, sol cenital del eclipse, navegación limpia sin jerga técnica, aviso legal institucional)
```

---

## 5. Especificaciones de Componentes Clave

### A. Escaparate de Cuentas Dividido en 2 Columnas (`ProgramsSection.tsx`)
- **Doble Órbita:**
  - ☀️ **Cuentas Solares (Crypto DMA Futures):** Liquidez institucional de futuros cripto top 100, ejecución DMA real, sin fases de examen artificiales.
  - 🌙 **Cuentas Lunares (Meme Titans):** Cuentas especiales para memecoins (PEPE, DOGE, BONK, SHIB, WIF), sin penalización por microscalping en rallies/pumps, y apalancamiento agresivo.
- **Nomenclatura Astronómica de Tiers:**
  - *Solares:* Chispa Solar ($1K), Rayo Solar ($2.5K), Protuberancia Solar ($5K), Corona Solar ($10K), Helios Solar ($25K), Eclipse Solar ($50K), Cenit Solar ($100K).
  - *Lunares:* Luna Creciente ($1K), Luna Gibosa ($2.5K), Eclipse Lunar ($5K), Superluna ($10K), Luna Azul ($25K), Luna de Sangre ($50K), Titán Lunar ($100K).
- **Animación Direccional GPU (60 FPS, Zero Lag):**
  - Si el usuario selecciona un capital mayor (`newIndex > prevIndex`), la tarjeta se desplaza y **entra desde la DERECHA**.
  - Si el usuario selecciona un capital menor (`newIndex < prevIndex`), la tarjeta se desplaza y **entra desde la IZQUIERDA**.
  - Ejecutado con `AnimatePresence` de `motion/react` mediante transformaciones de hardware (`translate3d`), evitando re-flows de DOM.
- **Estructura Interna en 2 Lados:**
  - **Lado Izquierdo (Comercial & Checkout):**
    - Identidad astronómica del tier y selector de modo: `Pago Único` vs `Mensualidad`.
    - Tipografía monumental del capital (`$50,000 USDT`).
    - Desglose de precio dinámico (Precio base + costo de add-ons).
    - 4 Modificadores Add-ons interactivos: +50% Apalancamiento, +2% Escudo Drawdown, 90% Reparto Permanente, Retiros Semanales Exprés.
    - Botón primario de compra de alto impacto ("Comprar Cuenta [Monto]").
  - **Lado Derecho (Reglas Completas & Riesgo Institucional):**
    - Pérdida Diaria: Porcentaje y monto exacto en USDT con barra de límite visual.
    - Drawdown Total: Porcentaje y monto exacto en USDT (reacciona en tiempo real si el Escudo de DD está activo).
    - Apalancamiento: Valor base o aumentado dinámicamente con add-on.
    - Reparto de Ganancias: 80% - 90% con liquidación en wallet.
    - Frecuencia de Retiro: Ventana en USDT (<8h estándar, <2h semanal exprés).
    - Días mínimos: 0 Días (libertad operativa total).
    - Holding fin de semana: Permitido 24/7 en cripto.

### B. Arquitectura de Datos: PostgreSQL + Redis Hot-Cache + Cliente Reactivo
- **Nexus CRM (Control Plane):** Los administradores modifican reglas, tiers, precios y multiplicadores de add-ons en PostgreSQL.
- **Redis Hot-Cache (RAM <1ms):** Al guardar en Nexus, se compila e invalida la llave `eklipse:catalog:active` en Redis. El endpoint público de la API responde a los visitantes directamente desde Redis con latencia inferior a 1 milisegundo (0 carga a la base de datos).
- **Cliente Reactivo (0ms Latencia):** El frontend consume el catálogo una sola vez y realiza todos los cálculos de add-ons, porcentajes de drawdown y precios en memoria del cliente. Al hacer clic en comprar, el checkout re-valida la cotización en backend contra Redis para evitar manipulación de precios.

### C. Footer Cinematográfico con Mascota Pepe (`Footer.tsx`)
- **Fondo Dark Obsidian Puro (`#06070B`):** Erradicación total de fondos claros o imágenes toscas. Sutil aura cósmica violeta/ámbar.
- **Pepe emergiendo desde el fondo de la página:** Pepe animado en bucle con audífonos y camiseta azul con tipografía *"eklipse"*, posicionado en el centro (`z-20`) y anclado al suelo (`bottom: 0`), saliendo hacia arriba desde el borde inferior de la web.
- **Tipografía monumental "EKLIPSE":** En el fondo (`z-10`) detrás de Pepe, letras gigantescas (`19vw` - `23vw`) en degradado translúcido blanco/obsidiana, extendiéndose a izquierda y derecha de su figura como si la palabra naciera detrás de él.
- **Cero Etiquetas:** Erradicación total de cualquier badge, tag o píldora ("PEPE TRADES EKLIPSE" eliminado).
- **Aviso Legal y Navegación:** Concentrados ordenadamente en el bloque superior y medio del footer.

---

## 6. Checklist de Calidad para Desarrollo y Futuras Iteraciones

- [ ] ¿La tarjeta de programas se divide limpiamente en 2 columnas (Lado A: checkout/addons, Lado B: reglas completas)?
- [ ] ¿Al subir el capital la animación entra desde la derecha y al bajar entra desde la izquierda?
- [ ] ¿Los nombres de las cuentas son celestiales y únicos (Solares para Cripto y Lunares para Memecoins)?
- [ ] ¿No existen badges o etiquetas innecesarias en el footer ni en la cabecera de cuentas?
- [ ] ¿Pepe emerge directamente desde el borde inferior de la página con "EKLIPSE" gigante de fondo?
- [ ] ¿El proyecto compila limpiamente (`npx tsc --noEmit`) sin errores de TypeScript ni dependencias rotas?
