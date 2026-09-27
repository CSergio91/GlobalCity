import React, { useEffect, useRef, useState, useCallback } from 'react';
import { init, dispose, Chart, KLineData, DeepPartial, Styles, Period } from 'klinecharts';
import { fetchRealHistoricalKlines } from '../services/realKlineData';

export interface GlobalCityChartProps {
  symbol: string;
  venueId: string;
  venueName?: string;
  livePrice?: number;
  change24h?: number;
  className?: string;
}

// Pro Dark Theme tailored for Global City Institutional Terminal
const GLOBAL_CITY_CHART_THEME: DeepPartial<Styles> = {
  grid: {
    show: true,
    horizontal: { color: 'rgba(255, 255, 255, 0.04)', style: 'dashed', dashedValue: [4, 4] },
    vertical: { color: 'rgba(255, 255, 255, 0.04)', style: 'dashed', dashedValue: [4, 4] }
  },
  candle: {
    type: 'candle_solid',
    bar: {
      upColor: '#00E575',
      downColor: '#FF3B69',
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
        text: { show: true, color: '#FFFFFF', family: 'monospace' }
      }
    }
  },
  indicator: {
    lines: [
      { color: '#38BDF8', size: 1.5 },
      { color: '#FBBF24', size: 1.5 },
      { color: '#F472B6', size: 1.5 },
      { color: '#A78BFA', size: 1.5 }
    ]
  },
  xAxis: {
    axisLine: { color: 'rgba(255, 255, 255, 0.1)' },
    tickText: { color: '#94A3B8', size: 10, family: 'monospace' }
  },
  yAxis: {
    axisLine: { color: 'rgba(255, 255, 255, 0.1)' },
    tickText: { color: '#94A3B8', size: 10, family: 'monospace' }
  },
  crosshair: {
    show: true,
    horizontal: {
      show: true,
      line: { style: 'dashed', dashedValue: [4, 4], color: 'rgba(255, 255, 255, 0.3)' },
      text: { color: '#FFFFFF', backgroundColor: '#1E293B' }
    },
    vertical: {
      show: true,
      line: { style: 'dashed', dashedValue: [4, 4], color: 'rgba(255, 255, 255, 0.3)' },
      text: { color: '#FFFFFF', backgroundColor: '#1E293B' }
    }
  }
};

// Generates realistic baseline candlestick history leading up to the current live price
function generateHistoricalBars(basePrice: number, count = 140, intervalMinutes = 15): KLineData[] {
  const bars: KLineData[] = [];
  const now = Date.now();
  const stepMs = intervalMinutes * 60 * 1000;
  let currentClose = basePrice;
  const volatility = basePrice * 0.0035;

  // Generate in reverse to end precisely at basePrice
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * stepMs;
    const delta = (Math.random() - 0.495) * volatility;
    const open = i === count - 1 ? currentClose - delta : currentClose;
    const close = i === 0 ? basePrice : open + delta;
    const high = Math.max(open, close) + Math.random() * volatility * 0.7;
    const low = Math.min(open, close) - Math.random() * volatility * 0.7;
    const volume = Math.floor(Math.random() * 80 + 20);

    bars.push({
      timestamp,
      open: Number(open.toFixed(basePrice < 10 ? 5 : 2)),
      high: Number(high.toFixed(basePrice < 10 ? 5 : 2)),
      low: Number(low.toFixed(basePrice < 10 ? 5 : 2)),
      close: Number(close.toFixed(basePrice < 10 ? 5 : 2)),
      volume,
      turnover: volume * close
    });

    currentClose = close;
  }

  return bars;
}

export const GlobalCityChart: React.FC<GlobalCityChartProps> = ({
  symbol,
  venueId,
  venueName,
  livePrice = 84150,
  change24h = 0,
  className = "w-full h-full min-h-[440px]"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Active Timeframe Pill state
  const [activeInterval, setActiveInterval] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1D'>('15m');
  const activeIntervalRef = useRef<'1m' | '5m' | '15m' | '1h' | '4h' | '1D'>('15m');
  activeIntervalRef.current = activeInterval;

  const [activeIndicators, setActiveIndicators] = useState<{ ma: boolean; ema: boolean; boll: boolean; rsi: boolean }>({
    ma: true,
    ema: false,
    boll: false,
    rsi: false
  });

  // Calculate timeframe period object
  const getPeriod = useCallback((intervalStr: string): Period => {
    switch (intervalStr) {
      case '1m': return { type: 'minute', span: 1 };
      case '5m': return { type: 'minute', span: 5 };
      case '15m': return { type: 'minute', span: 15 };
      case '1h': return { type: 'hour', span: 1 };
      case '4h': return { type: 'hour', span: 4 };
      case '1D': return { type: 'day', span: 1 };
      default: return { type: 'minute', span: 15 };
    }
  }, []);

  const periodToInterval = useCallback((p?: Period): '1m' | '5m' | '15m' | '1h' | '4h' | '1D' => {
    if (!p) return activeIntervalRef.current;
    if (p.type === 'minute') {
      if (p.span === 1) return '1m';
      if (p.span === 5) return '5m';
      return '15m';
    }
    if (p.type === 'hour') {
      if (p.span === 1) return '1h';
      return '4h';
    }
    if (p.type === 'day') return '1D';
    return activeIntervalRef.current;
  }, []);

  const subscriberCallbackRef = useRef<((bar: KLineData) => void) | null>(null);

  // Initialize KLineChart Canvas on DOM Mount
  useEffect(() => {
    if (!containerRef.current) return;

    // Dispose any previous instance
    try {
      dispose(containerRef.current);
    } catch {}

    const chart = init(containerRef.current, {
      styles: 'dark'
    });

    if (!chart) return;
    chartInstanceRef.current = chart;
    chart.setStyles(GLOBAL_CITY_CHART_THEME);

    // 1. Configurar el símbolo y temporalidad ANTES de setDataLoader
    const precision = symbol.includes('USDT') || symbol.includes('USD') || symbol.includes('EUR') ? 2 : 5;

    chart.setSymbol({
      ticker: `${venueId.toUpperCase()}:${symbol}`,
      pricePrecision: precision,
      volumePrecision: 2
    });

    chart.setPeriod(getPeriod(activeIntervalRef.current));

    // 2. Registrar DataLoader canónico de KLineChart v10 (Invocación atómica y segura)
    chart.setDataLoader({
      getBars: async (params) => {
        try {
          const reqInterval = periodToInterval(params.period);
          const intervalMins = reqInterval === '1m' ? 1 : reqInterval === '5m' ? 5 : reqInterval === '1h' ? 60 : reqInterval === '4h' ? 240 : reqInterval === '1D' ? 1440 : 15;

          // Si KLineChart solicita velas históricas anteriores (hacia la izquierda del gráfico)
          if (params.type === 'forward') {
            if (!params.timestamp) {
              params.callback([], { forward: false, backward: false });
              return;
            }

            let olderBars: KLineData[] = [];
            try {
              olderBars = await fetchRealHistoricalKlines(symbol, reqInterval, 100, livePrice, params.timestamp - 1);
            } catch {
              olderBars = [];
            }

            if (olderBars && olderBars.length > 0) {
              const validOlderBars = olderBars.filter(b => b.timestamp < params.timestamp!);
              params.callback(validOlderBars, { forward: validOlderBars.length >= 80, backward: false });
            } else {
              // Cortar paginación hacia atrás para nunca repetir velas
              params.callback([], { forward: false, backward: false });
            }
            return;
          }

          // Si KLineChart solicita velas hacia el futuro (cubierto por streaming en tiempo real)
          if (params.type === 'backward') {
            params.callback([], { forward: false, backward: false });
            return;
          }

          // Carga inicial (params.type === 'init')
          let bars: KLineData[] = [];
          try {
            bars = await fetchRealHistoricalKlines(symbol, reqInterval, 180, livePrice);
          } catch {
            bars = [];
          }

          if (!bars || bars.length === 0) {
            bars = generateHistoricalBars(livePrice, 150, intervalMins);
          }

          // Solo permitir paginación si se consiguieron datos completos
          params.callback(bars, { forward: bars.length >= 100, backward: false });

          requestAnimationFrame(() => {
            if (chartInstanceRef.current) {
              chartInstanceRef.current.resize();
              chartInstanceRef.current.scrollToRealTime();
            }
          });
        } catch (err) {
          console.warn('[DataLoader] Error loading historical bars:', err);
          params.callback([], { forward: false, backward: false });
        }
      },
      subscribeBar: (params) => {
        subscriberCallbackRef.current = params.callback;
      },
      unsubscribeBar: () => {
        subscriberCallbackRef.current = null;
      }
    });

    // 3. Crear indicadores de forma canónica (SMA overlay en velas, VOL en subpanel compacto)
    try {
      const volPaneId = chart.createIndicator('VOL', false);
      if (volPaneId) {
        chart.setPaneOptions({ id: volPaneId, height: 75, minHeight: 40 });
      }
      // Superponer SMA en el panel principal de velas (candle_pane) para no robar altura vertical
      chart.createIndicator({ name: 'SMA', paneId: 'candle_pane' }, true);
    } catch (e) {
      console.warn('Indicator initialization note:', e);
    }

    // 4. Sincronizar dimensiones con el layout completo
    const resizeObserver = new ResizeObserver(() => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    });
    resizeObserver.observe(containerRef.current);

    const rafId = requestAnimationFrame(() => {
      chart.resize();
      chart.scrollToRealTime();
    });
    const timerId1 = setTimeout(() => {
      chart.resize();
      chart.scrollToRealTime();
    }, 80);
    const timerId2 = setTimeout(() => {
      chart.resize();
      chart.scrollToRealTime();
    }, 250);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId1);
      clearTimeout(timerId2);
      resizeObserver.disconnect();
      if (containerRef.current) {
        dispose(containerRef.current);
      }
      chartInstanceRef.current = null;
      subscriberCallbackRef.current = null;
    };
  }, [venueId, symbol, getPeriod, periodToInterval]);

  const isFirstMountRef = useRef(true);

  // Update timeframe period when activeInterval changes (skips redundant first mount)
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    const chart = chartInstanceRef.current;
    if (!chart) return;
    chart.setPeriod(getPeriod(activeInterval));
  }, [activeInterval, getPeriod]);

  // Real-time Tick-by-Tick streaming update via v10 subscriber callback
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart || typeof livePrice !== 'number' || livePrice <= 0) return;

    const currentBarList = chart.getDataList();
    if (!currentBarList || currentBarList.length === 0) return;

    const lastBar = currentBarList[currentBarList.length - 1];
    if (!lastBar) return;

    // Update the live active candle
    const updatedBar: KLineData = {
      ...lastBar,
      close: livePrice,
      high: Math.max(lastBar.high, livePrice),
      low: Math.min(lastBar.low, livePrice),
      volume: (lastBar.volume || 10) + 1,
      turnover: ((lastBar.volume || 10) + 1) * livePrice
    };

    if (subscriberCallbackRef.current) {
      subscriberCallbackRef.current(updatedBar);
    }
  }, [livePrice]);

  // Toggle Technical Indicators in v10 with canonical paneId targets
  const toggleIndicator = (ind: 'ma' | 'ema' | 'boll' | 'rsi') => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    const nextState = !activeIndicators[ind];
    setActiveIndicators(prev => ({ ...prev, [ind]: nextState }));

    try {
      if (ind === 'ma') {
        if (nextState) chart.createIndicator({ name: 'SMA', paneId: 'candle_pane' }, true);
        else chart.removeIndicator({ name: 'SMA', paneId: 'candle_pane' });
      } else if (ind === 'ema') {
        if (nextState) chart.createIndicator({ name: 'EMA', paneId: 'candle_pane' }, true);
        else chart.removeIndicator({ name: 'EMA', paneId: 'candle_pane' });
      } else if (ind === 'boll') {
        if (nextState) chart.createIndicator({ name: 'BOLL', paneId: 'candle_pane' }, true);
        else chart.removeIndicator({ name: 'BOLL', paneId: 'candle_pane' });
      } else if (ind === 'rsi') {
        if (nextState) chart.createIndicator({ name: 'RSI' }, false);
        else chart.removeIndicator({ name: 'RSI' });
      }
    } catch {}
  };

  return (
    <div className={`flex flex-col w-full h-full bg-[#06070B] select-none rounded-xl sm:rounded-2xl overflow-hidden relative min-h-0 flex-1 ${className}`}>
      
      {/* TradingView-Inspired Ultra-Compact Pro Header Bar (Single 36px Line) */}
      <div className="flex items-center justify-between gap-1.5 px-2 sm:px-3 py-1 bg-[#080A12] border-b border-white/[0.08] shrink-0 h-9 sm:h-10">
        
        {/* Left: Symbol + Venue + Live Price + 24h Change */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500/20 to-orange-500/30 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-[10px] shrink-0">
            {symbol.slice(0, 1)}
          </div>

          <span className="text-xs font-mono font-bold text-white tracking-tight truncate">
            {symbol}
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            ({venueName || venueId.toUpperCase()})
          </span>

          <span className="text-xs sm:text-sm font-mono font-black text-white tracking-tight">
            ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>

          {change24h !== undefined && (
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
              change24h >= 0 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
            }`}>
              {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
            </span>
          )}
        </div>

        {/* Right: TradingView Timeframe Selector + Indicator Toggles */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {/* Timeframe Buttons */}
          <div className="flex items-center p-0.5 rounded-lg bg-black/60 border border-white/10 shadow-inner">
            {(['1m', '5m', '15m', '1h', '4h', '1D'] as const).map(tf => (
              <button
                key={tf}
                type="button"
                onClick={() => setActiveInterval(tf)}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeInterval === tf
                    ? 'bg-[#38BDF8] text-black font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicators Toggles */}
          <div className="hidden sm:flex items-center gap-0.5 p-0.5 rounded-lg bg-black/60 border border-white/10">
            {(['ma', 'ema', 'boll', 'rsi'] as const).map(ind => (
              <button
                key={ind}
                type="button"
                onClick={() => toggleIndicator(ind)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  activeIndicators[ind]
                    ? 'bg-white/20 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hardware Accelerated Canvas Container (Full-bleed 100% height) */}
      <div className="w-full relative flex-1 min-h-0 h-full overflow-hidden">
        <div 
          ref={containerRef} 
          className="absolute inset-0 w-full h-full" 
        />
      </div>

    </div>
  );
};
