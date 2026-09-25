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

## 6. Checklist de Implementación para el Agente

- [ ] ¿Los botones e inputs tienen retroalimentación visual táctil inmediata ($\le 200\text{ms}$)?
- [ ] ¿Se utiliza `font-mono tabular-nums` para todas las tablas de precios, feeds y porcentajes?
- [ ] ¿El fondo incorpora el resplandor difuso rose-mauve sutil de las referencias visuales?
- [ ] ¿Los textos son concretos, técnicos y libres de adjetivos publicitarios vacíos?
- [ ] ¿Todos los botones y selectores cuentan con manejadores de eventos funcionales sin enlaces muertos?
