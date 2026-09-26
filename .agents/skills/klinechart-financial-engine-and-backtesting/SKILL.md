---
name: klinechart-financial-engine-and-backtesting
description: Guía de ingeniería institucional para KLineChart v10 en Global City. Ciclo de vida del Chart Canvas, DataLoader reactivo, streaming tick-by-tick sin polling, creación de componentes React limpios, motor de Backtesting Replay con datos históricos, overlays propietarios de trading (SL/TP, Order Blocks, Arbitraje) y optimización GPU a 60 FPS.
version: "1.0.0"
category: "Fintech & Algorithmic Trading Visualization"
status: "Authoritative / Production Ready"
---

# KLineChart Financial Engine & Backtesting Architecture
### *Motor de Gráficos Financieros Open Source (Apache 2.0) y Simulador Replay para Global City*

---

## 1. AXIOMAS Y FUNDAMENTOS DE KLINECHART v10

> **Axioma Rector:**
> **"El gráfico pertenece a Global City, no a un proveedor externo."**
> Toda vela, indicador y trazo visual se renderiza de forma soberana sobre un `<canvas>` HTML5 acelerado por hardware (GPU), alimentado directamente por nuestro propio backend y memoria caliente en Redis.

### ¿Por qué KLineChart v10 frente al iframe de TradingView?
1. **Licencia Apache 2.0:** 100% Open Source, libre de cánones, marcas de agua forzadas o restricciones comerciales.
2. **Control Absoluto del Canvas:** Capacidad de pintar figuras propietarias de Global City (zonas de arbitraje, bloques de órdenes institucionales, líneas de liquidación y órdenes límite arrastrables) directamente en coordenadas de píxeles y tiempo.
3. **Cero Dependencia de Red Externa:** Funciona en despliegues **Self-Hosted**, redes cerradas o sin acceso a internet externo.
4. **Arquitectura `DataLoader` v10:** Desacopla la lógica del componente visual del proveedor de datos. Soporta carga inicial (`init`), paginación hacia atrás en el historial (`forward`), actualización de vela viva (`update`) y suscripción continua por eventos (`subscribeBar`).
5. **Rendimiento a 60 FPS:** Motor ultraligero (~600 KB empaquetado vs. >5 MB de un iframe), evitando bloqueos en el hilo principal del DOM.

---

## 2. CICLO DE VIDA DEL MOTOR DE GRÁFICOS (Init, Resize, Dispose)

El motor opera directamente sobre el DOM a través de las funciones canónicas `init()` y `dispose()`.

### 2.1 Reglas Críticas del Ciclo de Vida:
- **Montaje Seguro:** Nunca llamar a `init()` sobre un contenedor que no esté renderizado en el DOM o cuyo ancho/alto sea `0px`.
- **ResizeObserver Reactivo:** Todo gráfico debe estar encapsulado con un `ResizeObserver` que invoque `chart.resize()` para adaptarse a cambios de ventana o colapso de sidebars sin distorsión de escala.
- **Limpieza Rigurosa:** Al desmontar el componente (unmount), es **obligatorio** invocar `dispose(chart)` para liberar contextos de Canvas, listeners de mouse/touch y buffers en memoria.

```typescript
import { init, dispose, Chart } from 'klinecharts';

// Inicialización básica
const chart: Chart | null = init('chart_container_id', {
  locale: 'es',
  timezone: 'UTC',
  styles: 'dark' // o configuración de estilos personalizada
});

// Limpieza al desmontar
dispose('chart_container_id'); // o dispose(chartInstance)
```

---

## 3. ARQUITECTURA `DataLoader` v10 (Sin Polling, 100% Reactiva)

En la versión 10 de KLineChart, la ingesta de datos no se hace mediante llamadas arbitrarias dispersas en el código, sino a través de la interfaz canónica `DataLoader`:

```typescript
import { DataLoader, DataLoaderGetBarsParams, DataLoaderSubscribeBarParams, KLineData } from 'klinecharts';

export const createGlobalCityDataLoader = (apiBaseUrl: string, wsFeed: any): DataLoader => {
  return {
    // 1. Paginación e inicialización de barras históricas
    getBars: async (params: DataLoaderGetBarsParams) => {
      const { type, timestamp, symbol, period, callback } = params;

      try {
        if (type === 'init') {
          // Carga inicial (ej. últimas 500 velas)
          const bars: KLineData[] = await fetchHistoricalBars(symbol.ticker, period, 500);
          callback(bars, { forward: true, backward: false });
        } else if (type === 'forward') {
          // El usuario hace scroll hacia la izquierda: cargar datos más antiguos
          const olderBars: KLineData[] = await fetchHistoricalBarsBefore(symbol.ticker, period, timestamp!, 300);
          callback(olderBars, { forward: olderBars.length > 0 });
        }
      } catch (err) {
        console.error('Error loading bars in DataLoader:', err);
        callback([]);
      }
    },

    // 2. Suscripción a streaming en tiempo real (Tick a Tick / Vela Viva)
    subscribeBar: (params: DataLoaderSubscribeBarParams) => {
      const { symbol, period, callback } = params;
      wsFeed.subscribe(symbol.ticker, period, (liveBar: KLineData) => {
        callback(liveBar);
      });
    },

    // 3. Desuscripción limpia
    unsubscribeBar: (params) => {
      wsFeed.unsubscribe(params.symbol.ticker, params.period);
    }
  };
};
```

---

## 4. PATRÓN DE COMPONENTE REACT LIMPIO (`GlobalCityChart.tsx`)

A continuación se detalla la implementación del componente estándar para Global City, estilizado con estética Pro Dark e integrado con controles compactos:

```tsx
import React, { useEffect, useRef } from 'react';
import { init, dispose, Chart, KLineData, DeepPartial, Styles } from 'klinecharts';

export interface GlobalCityChartProps {
  symbol: string;               // Ej: 'BTC/USDT'
  venue: string;                // Ej: 'binance', 'bybit', 'kucoin'
  period?: { type: 'minute' | 'hour' | 'day'; span: number };
  initialData?: KLineData[];
  onBarClick?: (bar: KLineData) => void;
  className?: string;
}

// Estilos oscuros profesionales para Global City
const GLOBAL_CITY_CHART_THEME: DeepPartial<Styles> = {
  grid: {
    show: true,
    horizontal: { color: 'rgba(255, 255, 255, 0.04)', style: 'dashed', dashedValue: [4, 4] },
    vertical: { color: 'rgba(255, 255, 255, 0.04)', style: 'dashed', dashedValue: [4, 4] }
  },
  candle: {
    type: 'candle_solid',
    bar: {
      upColor: '#00E575',           // Verde institucional
      downColor: '#FF3B69',         // Rojo magenta pro
      noChangeColor: '#888888',
      upBorderColor: '#00E575',
      downBorderColor: '#FF3B69',
      noChangeBorderColor: '#888888',
      upWickColor: '#00E575',
      downWickColor: '#FF3B69',
      noChangeWickColor: '#888888'
    },
    priceMark: {
      last: {
        show: true,
        upColor: '#00E575',
        downColor: '#FF3B69',
        line: { show: true, style: 'dashed', dashedValue: [3, 3] },
        text: { show: true, color: '#FFFFFF' }
      }
    }
  },
  xAxis: {
    axisLine: { color: 'rgba(255, 255, 255, 0.1)' },
    tickText: { color: '#94A3B8', size: 10 }
  },
  yAxis: {
    axisLine: { color: 'rgba(255, 255, 255, 0.1)' },
    tickText: { color: '#94A3B8', size: 10 }
  }
};

export const GlobalCityChart: React.FC<GlobalCityChartProps> = ({
  symbol,
  venue,
  period = { type: 'minute', span: 15 },
  initialData = [],
  className = "w-full h-[500px]"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Inicializar gráfico
    const chart = init(containerRef.current, {
      locale: 'es',
      styles: GLOBAL_CITY_CHART_THEME
    });

    if (!chart) return;
    chartInstanceRef.current = chart;

    // 2. Configurar símbolo y precisión
    chart.setSymbol({
      ticker: `${venue.toUpperCase()}:${symbol}`,
      pricePrecision: symbol.includes('USDT') || symbol.includes('USD') ? 2 : 5,
      volumePrecision: 2
    });

    // 3. Configurar temporalidad
    chart.setPeriod(period);

    // 4. Inyectar datos iniciales si existen
    if (initialData.length > 0) {
      chart.applyNewData(initialData);
    }

    // 5. Crear indicador de volumen en sub-panel
    chart.createIndicator('VOL', false, { id: 'vol_pane', height: 80 });

    // 6. Observador de redimensionamiento automático
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (containerRef.current) {
        dispose(containerRef.current);
      }
      chartInstanceRef.current = null;
    };
  }, [venue, symbol]);

  return (
    <div className="relative w-full h-full bg-[#06070B] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <div ref={containerRef} className={className} />
    </div>
  );
};
```

---

## 5. MOTOR DE BACKTESTING & REPLAY SIMULATION (Event Sourcing)

El modo de simulación o **Backtesting Replay** permite reproducir el mercado barra por barra o tick a tick, simulando la experiencia de trading en tiempo real sin arriesgar capital real.

### 5.1 Arquitectura del Motor Replay:

```
[ Dataset Histórico (Postgres / S3) ]
                 │
                 ▼
     ┌───────────────────────┐
     │  REPLAY ENGINE CLOCK  │ <── Control: Play / Pause / Step / Speed (1x - 100x)
     └───────────┬───────────┘
                 │
                 ├──────────────────────────────────────┐
                 ▼                                      ▼
       [ DataLoader.updateData ]            [ Simulated Risk & OMS ]
                 │                                      │
                 ▼                                      ▼
        [ KLineChart Canvas ]                [ Execution / Balance PnL ]
```

### 5.2 Implementación del Controlador de Replay:

```typescript
export class BacktestReplayController {
  private fullDataset: KLineData[] = [];
  private currentIndex: number = 0;
  private timer: any = null;
  private speedMs: number = 500; // 500ms por barra
  private chart: Chart;
  private onBarProcessed?: (bar: KLineData, index: number) => void;

  constructor(chart: Chart, dataset: KLineData[]) {
    this.chart = chart;
    this.fullDataset = dataset;
  }

  public initialize(initialBarCount: number = 100): void {
    this.currentIndex = Math.min(initialBarCount, this.fullDataset.length);
    const warmupBars = this.fullDataset.slice(0, this.currentIndex);
    this.chart.applyNewData(warmupBars);
  }

  public play(speedMs: number = 500): void {
    this.pause();
    this.speedMs = speedMs;

    this.timer = setInterval(() => {
      this.stepForward();
    }, this.speedMs);
  }

  public pause(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public stepForward(): boolean {
    if (this.currentIndex >= this.fullDataset.length) {
      this.pause();
      return false; // Fin del dataset
    }

    const nextBar = this.fullDataset[this.currentIndex];
    // Inyectar siguiente barra en el chart
    this.chart.updateData(nextBar);

    if (this.onBarProcessed) {
      this.onBarProcessed(nextBar, this.currentIndex);
    }

    this.currentIndex++;
    return true;
  }

  public setSpeed(speedMultiplier: number): void {
    // 1x = 1000ms, 10x = 100ms, 50x = 20ms
    const newSpeed = Math.max(20, Math.floor(1000 / speedMultiplier));
    this.play(newSpeed);
  }
}
```

---

## 6. OVERLAYS PROPIETARIOS PARA TRADING INSTITUCIONAL

KLineChart permite registrar y dibujar figuras geométricas enriquecidas sobre las velas:

### 6.1 Línea de Orden Límite / SL / TP con Arrastre (Drag & Drop)
Podemos registrar overlays del tipo `priceLine` para pintar el precio de entrada, Stop Loss y Take Profit:

```typescript
// Añadir línea interactiva de Stop Loss
const slOverlayId = chart.createOverlay({
  name: 'priceLine',
  points: [{ value: 83200 }],
  styles: {
    line: { color: '#FF3B69', style: 'dashed', size: 1.5 },
    text: { color: '#FFFFFF', backgroundColor: '#FF3B69', size: 10 }
  },
  extendData: { label: 'STOP LOSS (Risk 1.5%)', orderId: 'ord_1234' }
});

// Añadir línea interactiva de Take Profit
const tpOverlayId = chart.createOverlay({
  name: 'priceLine',
  points: [{ value: 86500 }],
  styles: {
    line: { color: '#00E575', style: 'solid', size: 1.5 },
    text: { color: '#FFFFFF', backgroundColor: '#00E575', size: 10 }
  },
  extendData: { label: 'TAKE PROFIT (+3.8%)', orderId: 'ord_1234' }
});
```

### 6.2 Bloques de Órdenes Institucionales (Order Blocks / Rectángulos L2)
Uso de overlays poligonales rectangulares (`rect`) para marcar zonas de liquidez y desequilibrio institucional:

```typescript
chart.createOverlay({
  name: 'rect',
  points: [
    { timestamp: 1711500000000, value: 84500 },
    { timestamp: 1711586400000, value: 83800 }
  ],
  styles: {
    polygon: {
      color: 'rgba(56, 189, 248, 0.12)',      // Relleno celeste translúcido
      borderColor: '#38BDF8',
      borderSize: 1,
      borderStyle: 'solid'
    }
  }
});
```

---

## 7. INDICADORES TÉCNICOS Y GESTIÓN MULTI-PANE

KLineChart soporta indicadores integrados y personalizados:
- **Indicadores de Vela Principal (Overlap):**
  - `MA` (Moving Average)
  - `EMA` (Exponential Moving Average)
  - `BOLL` (Bollinger Bands)
  - `SAR` (Parabolic SAR)
  ```typescript
  // Crear EMA de 20 y 50 periodos en el panel de velas
  chart.createIndicator('EMA', true, { id: 'candle_pane' });
  ```
- **Indicadores en Sub-Paneles Separados (Non-Overlap):**
  - `VOL` (Volumen con barras coloreadas)
  - `MACD` (Moving Average Convergence Divergence)
  - `RSI` (Relative Strength Index)
  - `KDJ`, `ATR`, `OBV`
  ```typescript
  // Crear RSI en un panel secundario dedicado
  chart.createIndicator('RSI', false, { id: 'rsi_pane', height: 100 });
  ```

---

## 8. OPTIMIZACIÓN Y RENDIMIENTO (GPU 60 FPS SOSTENIDOS)

1. **Evitar Re-renders Innecesarios de React:**
   - La instancia de `Chart` se custodia en un `useRef`, nunca en un `useState`. Actualizar el gráfico jamás debe disparar re-renderizado del componente React padre.
2. **Throttling en Alta Volatilidad (Debounce de 16ms):**
   - Si el WebSocket entrega 100 ticks por segundo durante noticias de alto impacto, agrupar las actualizaciones en una cola y aplicar `updateData()` en el ciclo de animación del navegador (`requestAnimationFrame`).
3. **Paginación Inteligente (`forward`):**
   - No cargar 100.000 velas en memoria de golpe. Iniciar con 300–500 barras y solicitar paquetes de 200 barras adicionales únicamente cuando el usuario desplaza el gráfico hacia la izquierda.

---

## 9. CHECKLIST DE VERIFICACIÓN PARA AGENTES DE IA

Antes de dar por concluida cualquier tarea relacionada con gráficos en Global City:
- [ ] ¿Se eliminó todo iframe externo y se utiliza `klinecharts` nativo?
- [ ] ¿El contenedor tiene dimensiones `width` y `height` definidas antes de `init()`?
- [ ] ¿Se implementó `ResizeObserver` con `chart.resize()`?
- [ ] ¿Se limpia la memoria al desmontar con `dispose()`?
- [ ] ¿Se utiliza la paleta de colores oficial de Global City (`#06070B`, `#00E575`, `#FF3B69`)?
- [ ] ¿El streaming de datos usa `updateData()` sin recargar la página?
- [ ] ¿Los overlays de SL/TP y Order Blocks tienen coordenadas válidas de precio y tiempo?
