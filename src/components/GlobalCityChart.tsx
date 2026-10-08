import React, { useEffect, useRef, useState, useCallback } from 'react';
import { init, dispose, Chart, KLineData, DeepPartial, Styles } from 'klinecharts';
import { ChevronDown, Star } from 'lucide-react';
import { fetchRealHistoricalKlines } from '../services/realKlineData';

export type Period = {
  type: string;
  span: number;
};

export interface GlobalCityChartProps {
  symbol: string;
  venueId: string;
  venueName?: string;
  livePrice?: number;
  change24h?: number;
  className?: string;
}

export interface TimeframeItem {
  id: string;
  label: string;
  category: 'seconds' | 'minutes' | 'hours' | 'days';
  span: number;
  type: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month';
}

export const ALL_TIMEFRAMES: TimeframeItem[] = [
  // Segundos
  { id: '1s', label: '1s', category: 'seconds', span: 1, type: 'second' },
  { id: '5s', label: '5s', category: 'seconds', span: 5, type: 'second' },
  { id: '15s', label: '15s', category: 'seconds', span: 15, type: 'second' },
  { id: '30s', label: '30s', category: 'seconds', span: 30, type: 'second' },

  // Minutos
  { id: '1m', label: '1m', category: 'minutes', span: 1, type: 'minute' },
  { id: '3m', label: '3m', category: 'minutes', span: 3, type: 'minute' },
  { id: '5m', label: '5m', category: 'minutes', span: 5, type: 'minute' },
  { id: '15m', label: '15m', category: 'minutes', span: 15, type: 'minute' },
  { id: '30m', label: '30m', category: 'minutes', span: 30, type: 'minute' },
  { id: '45m', label: '45m', category: 'minutes', span: 45, type: 'minute' },

  // Horas
  { id: '1h', label: '1h', category: 'hours', span: 1, type: 'hour' },
  { id: '2h', label: '2h', category: 'hours', span: 2, type: 'hour' },
  { id: '3h', label: '3h', category: 'hours', span: 3, type: 'hour' },
  { id: '4h', label: '4h', category: 'hours', span: 4, type: 'hour' },
  { id: '6h', label: '6h', category: 'hours', span: 6, type: 'hour' },
  { id: '8h', label: '8h', category: 'hours', span: 8, type: 'hour' },
  { id: '12h', label: '12h', category: 'hours', span: 12, type: 'hour' },

  // Días, Semanas, Meses
  { id: '1D', label: '1D', category: 'days', span: 1, type: 'day' },
  { id: '3D', label: '3D', category: 'days', span: 3, type: 'day' },
  { id: '1W', label: '1S', category: 'days', span: 1, type: 'week' },
  { id: '1M', label: '1M', category: 'days', span: 1, type: 'month' },
];

const DEFAULT_FAVORITE_TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D'];

// Pro Dark Theme tailored for Global City Institutional Terminal
const GLOBAL_CITY_CHART_THEME: any = {
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
  const chartInstanceRef = useRef<any>(null);

  // Active Timeframe state
  const [activeInterval, setActiveInterval] = useState<string>('15m');
  const activeIntervalRef = useRef<string>('15m');
  activeIntervalRef.current = activeInterval;

  // Favorite Timeframes saved in localStorage
  const [favoriteTimeframes, setFavoriteTimeframes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('globalcity_favorite_timeframes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_FAVORITE_TIMEFRAMES;
  });

  const [isTfDropdownOpen, setIsTfDropdownOpen] = useState(false);

  const toggleFavorite = (tfId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteTimeframes(prev => {
      let next: string[];
      if (prev.includes(tfId)) {
        if (prev.length <= 1) return prev; // Mantener al menos una favorita
        next = prev.filter(t => t !== tfId);
      } else {
        next = [...prev, tfId];
      }
      try {
        localStorage.setItem('globalcity_favorite_timeframes', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSelectTimeframe = (tfId: string) => {
    setActiveInterval(tfId);
    setIsTfDropdownOpen(false);
  };

  const [activeIndicators, setActiveIndicators] = useState<{ ma: boolean; ema: boolean; boll: boolean; rsi: boolean }>({
    ma: true,
    ema: false,
    boll: false,
    rsi: false
  });

  // Calculate timeframe period object
  const getPeriod = useCallback((intervalStr: string): Period => {
    const item = ALL_TIMEFRAMES.find(t => t.id === intervalStr);
    if (item) {
      return { type: item.type, span: item.span };
    }
    return { type: 'minute', span: 15 };
  }, []);

  const periodToInterval = useCallback((p?: Period): string => {
    if (!p) return activeIntervalRef.current;
    const item = ALL_TIMEFRAMES.find(t => t.type === p.type && t.span === p.span);
    return item ? item.id : activeIntervalRef.current;
  }, []);

  const subscriberCallbackRef = useRef<((bar: KLineData) => void) | null>(null);

  // Reaccionar inmediatamente al cambio de temporalidad activa
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.setPeriod(getPeriod(activeInterval));
    }
  }, [activeInterval, getPeriod]);

  // Initialize KLineChart Canvas on DOM Mount
  useEffect(() => {
    if (!containerRef.current) return;

    // Dispose any previous instance
    try {
      dispose(containerRef.current);
    } catch {}

    const chart: any = init(containerRef.current, {
      styles: 'dark' as any
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
          const tfItem = ALL_TIMEFRAMES.find(t => t.id === reqInterval);
          let intervalMins = 15;
          if (tfItem) {
            if (tfItem.type === 'second') intervalMins = Math.max(0.1, tfItem.span / 60);
            else if (tfItem.type === 'minute') intervalMins = tfItem.span;
            else if (tfItem.type === 'hour') intervalMins = tfItem.span * 60;
            else if (tfItem.type === 'day') intervalMins = tfItem.span * 1440;
            else if (tfItem.type === 'week') intervalMins = 7 * 1440;
            else if (tfItem.type === 'month') intervalMins = 30 * 1440;
          }

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
      chart.createIndicator('SMA', false, { id: 'candle_pane' });
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
        if (nextState) chart.createIndicator('SMA', false, { id: 'candle_pane' });
        else chart.removeIndicator('candle_pane', 'SMA');
      } else if (ind === 'ema') {
        if (nextState) chart.createIndicator('EMA', false, { id: 'candle_pane' });
        else chart.removeIndicator('candle_pane', 'EMA');
      } else if (ind === 'boll') {
        if (nextState) chart.createIndicator('BOLL', false, { id: 'candle_pane' });
        else chart.removeIndicator('candle_pane', 'BOLL');
      } else if (ind === 'rsi') {
        if (nextState) chart.createIndicator('RSI', false);
        else chart.removeIndicator('rsi');
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
          
          {/* Timeframe Selector with User Favorites & TradingView Style Dropdown */}
          <div className="relative flex items-center p-0.5 rounded-lg bg-black/60 border border-white/10 shadow-inner">
            {/* Quick Favorite Buttons */}
            {favoriteTimeframes.map(tfId => (
              <button
                key={tfId}
                type="button"
                onClick={() => setActiveInterval(tfId)}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeInterval === tfId
                    ? 'bg-[#38BDF8] text-black font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={`Cambiar a ${tfId}`}
              >
                {tfId}
              </button>
            ))}

            {/* If active interval is not in favorites, show it highlighted */}
            {!favoriteTimeframes.includes(activeInterval) && (
              <button
                type="button"
                className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-[#38BDF8] text-black shadow-sm"
              >
                {activeInterval}
              </button>
            )}

            {/* Dropdown Toggle Chevron */}
            <button
              type="button"
              onClick={() => setIsTfDropdownOpen(!isTfDropdownOpen)}
              className={`px-1 py-0.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center ${
                isTfDropdownOpen ? 'bg-white/10 text-white' : ''
              }`}
              title="Más temporalidades y configuración de favoritos"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${isTfDropdownOpen ? 'rotate-180 text-[#38BDF8]' : ''}`} />
            </button>

            {/* TradingView-Style Categorized Dropdown Menu */}
            {isTfDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsTfDropdownOpen(false)} 
                />
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#0B0D16]/98 border border-white/15 rounded-xl shadow-2xl backdrop-blur-2xl z-50 p-2 text-xs font-mono animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold px-2 py-1 border-b border-white/10 flex justify-between items-center">
                    <span>Temporalidades</span>
                    <span className="text-[8px] text-amber-400 font-normal">★ Favorito</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 py-1 no-scrollbar">
                    {[
                      { title: 'Segundos', category: 'seconds' as const },
                      { title: 'Minutos', category: 'minutes' as const },
                      { title: 'Horas', category: 'hours' as const },
                      { title: 'Días / Semanas / Meses', category: 'days' as const }
                    ].map(group => {
                      const items = ALL_TIMEFRAMES.filter(t => t.category === group.category);
                      if (items.length === 0) return null;

                      return (
                        <div key={group.category} className="space-y-0.5">
                          <div className="text-[8px] font-bold uppercase text-slate-500 px-2 pt-1">
                            {group.title}
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {items.map(item => {
                              const isFav = favoriteTimeframes.includes(item.id);
                              const isSelected = activeInterval === item.id;

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => handleSelectTimeframe(item.id)}
                                  className={`flex items-center justify-between px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                                    isSelected 
                                      ? 'bg-white/15 text-white font-bold ring-1 ring-[#38BDF8]/40' 
                                      : 'hover:bg-white/5 text-slate-300'
                                  }`}
                                >
                                  <span className="text-[11px] font-bold">{item.label}</span>

                                  {/* Star favorite toggle */}
                                  <button
                                    type="button"
                                    onClick={(e) => toggleFavorite(item.id, e)}
                                    className={`p-0.5 rounded transition-transform active:scale-125 cursor-pointer ${
                                      isFav ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                                    }`}
                                    title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                                  >
                                    <Star className={`w-3 h-3 ${isFav ? 'fill-amber-400' : ''}`} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
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
