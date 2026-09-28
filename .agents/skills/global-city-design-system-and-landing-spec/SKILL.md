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
| `--purple-primary` | `#7C3AED` / `#9333EA` | Morado eléctrico institucional para acentos de marca y focus. |
| `--purple-glow` | `rgba(168, 85, 247, 0.40)` | Resplandor ambiental de cuentas y elementos interactivos. |
| `--gold-amber-accent` | `#F59E0B` / `#FBBF24` | Botones de acción principales (CTAs), badges de popularidad y sol del eclipse. |
| `--emerald-payout` | `#10B981` | Retiros, métricas positivas de PnL y cumplimiento de reglas. |
| `--rose-risk` | `#F43F5E` | Límites de pérdida diaria (2%) y drawdown máximo (8%). |
| `--text-white` | `#FFFFFF` | Titulares dominantes, valores financieros y datos prioritarios. |
| `--text-slate-muted` | `#94A3B8` | Etiquetas de especificaciones y descripciones secundarias. |

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

### A. Carrusel 3D Coverflow de Cuentas (`ProgramsSection.tsx`)
- **Foco Central Absoluto:** La tarjeta activa ($\Delta = 0$) está anclada matemáticamente en el centro de la pantalla (`left: 50%`, `translateX(-50%)`, `scale(1)`, `opacity: 1`, `z-30`).
- **Tarjetas Laterales:** La tarjeta anterior ($\Delta = -1$) y siguiente ($\Delta = 1$) son visibles a los costados con `scale(0.88)`, `opacity: 0.45` y filtro blur sutil, invitando al clic o al arrastre.
- **Interacción Multicanal:** Navegable por arrastre táctil (touch), arrastre de ratón (mouse drag), flechas laterales y botones de píldora superiores en 2 filas.
- **Estructura Interna de la Tarjeta en 2 Columnas Definidas:**
  - **Columna Izquierda (Riesgo):** Apalancamiento (`20x–100x`), Pérdida Diaria (`2%`), Drawdown Máx (`8%`), Target (`Sin Límite`).
  - **Columna Derecha (Reglas & Payout):** Consistencia (`20%` / `40% Flex`), Días Mínimos (`5 Días`), Reparto (`35/50/80/90`), Puntos 5x.
  - Cada columna dispone de su propio panel de cristal esmerilado con etiquetas en la línea superior y valores contrastados en la línea inferior para evitar cualquier corte o salto de línea incómodo.

### B. Hero Section (`Hero.tsx`)
- Centrado geométrico y vertical absoluto (`min-h-screen flex flex-col justify-center items-center`).
- Titular con switcher animado de palabras:
  - **ES:** *Fondeo Cripto Inmediato. Sin [Challenge / Reglas Ocultas / Estrés / Presión / Miedo].*
  - **EN:** *Instant Crypto Funding. Zero [Challenges / Hidden Rules / Stress / Pressure / Fear].*
- Único botón CTA centrado de alto impacto en gradiente ámbar/oro celestial: `[ Obtener Fondeo Inmediato ]`.

### C. Footer Cinematográfico (`Footer.tsx`)
- Imagen de fondo: [`footer.webp`](file:///e:/%21%21%21%21%21%21%21%21Repositorio/%21%21GlobalCi-ty/GlobalCity/src/assets/images/footer.webp) optimizada desde JPG a 66.8 KB.
- Foco cenital del sol naciente en el horizonte oscuro del planeta, mezclado con gradientes oscuros para preservar 100% la legibilidad.
- 4 columnas limpias: Marca oficial, Navegación rápida, Comunidad y Soporte, Modelo de Fondeo.
- Aviso de riesgo institucional claro y profesional. Cero endpoints técnicos redundantes.

---

## 6. Checklist de Calidad para Desarrollo y Futuras Iteraciones

- [ ] ¿La tarjeta seleccionada permanece 100% en el centro de la pantalla en móvil y escritorio?
- [ ] ¿Se eliminaron todas las menciones a "1 Fase", "simulado", "retiro USD" o reembolsos?
- [ ] ¿El reparto de beneficios está fijado en 35/50/80/90 en todos los componentes?
- [ ] ¿El apalancamiento indica 20x–100x y el objetivo para pago 90% indica 15%?
- [ ] ¿Cada sección principal de la página incluye `min-h-screen w-full flex flex-col justify-center items-center`?
- [ ] ¿El footer utiliza la imagen optimizada `footer.webp` y está libre de clutter técnico?
- [ ] ¿El proyecto compila limpiamente (`npm run build`) sin errores de TypeScript ni estilos huérfanos?
