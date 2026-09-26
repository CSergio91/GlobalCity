import React, { useEffect, useRef, useState, useCallback } from 'react';
import { init, dispose, Chart, KLineData, DeepPartial, Styles, Period } from 'klinecharts';

export interface GlobalCityChartProps {
  symbol: string;
  venueId: string;
  venueName?: string;
  livePrice?: number;
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
function generateHistoricalBars(basePrice: number, count = 120, intervalMinutes = 15): KLineData[] {
  const bars: KLineData[] = [];
  const now = Date.now();
  const stepMs = intervalMinutes * 60 * 1000;
  let currentClose = basePrice;
  const volatility = basePrice * 0.0035;

  // Generate in reverse to end precisely at currentClose
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
  className = "w-full h-full min-h-[440px]"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Active Timeframe Pill state
  const [activeInterval, setActiveInterval] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1D'>('15m');
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

  // Initialize KLineChart Canvas on DOM Mount
  useEffect(() => {
    if (!containerRef.current) return;

    // Dispose any previous instance
    try {
      dispose(containerRef.current);
    } catch {}

    const chart = init(containerRef.current, {
      locale: 'es',
      styles: GLOBAL_CITY_CHART_THEME
    });

    if (!chart) return;
    chartInstanceRef.current = chart;

    const precision = symbol.includes('USDT') || symbol.includes('USD') || symbol.includes('EUR') ? 2 : 5;

    chart.setSymbol({
      ticker: `${venueId.toUpperCase()}:${symbol}`,
      pricePrecision: precision,
      volumePrecision: 2
    });

    chart.setPeriod(getPeriod(activeInterval));

    // Generate initial historical candles
    const intervalMinutes = activeInterval === '1m' ? 1 : activeInterval === '5m' ? 5 : activeInterval === '1h' ? 60 : activeInterval === '4h' ? 240 : activeInterval === '1D' ? 1440 : 15;
    const initialBars = generateHistoricalBars(livePrice, 100, intervalMinutes);
    chart.applyNewData(initialBars);

    // Create sub-pane for Volume
    try {
      chart.createIndicator('VOL', false, { id: 'vol_pane', height: 70 });
      chart.createIndicator('MA', true, { id: 'candle_pane' });
    } catch {}

    // Attach ResizeObserver to keep canvas sharp on resizing
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
  }, [venueId, symbol]);

  // Update timeframe period when activeInterval changes
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;
    chart.setPeriod(getPeriod(activeInterval));
  }, [activeInterval, getPeriod]);

  // Real-time Tick-by-Tick streaming update (Zero Polling, Canvas Hardware Accelerated)
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

    chart.updateData(updatedBar);
  }, [livePrice]);

  // Toggle Technical Indicators
  const toggleIndicator = (ind: 'ma' | 'ema' | 'boll' | 'rsi') => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    const nextState = !activeIndicators[ind];
    setActiveIndicators(prev => ({ ...prev, [ind]: nextState }));

    try {
      if (ind === 'ma') {
        if (nextState) chart.createIndicator('MA', true, { id: 'candle_pane' });
        else chart.removeIndicator('candle_pane', 'MA');
      } else if (ind === 'ema') {
        if (nextState) chart.createIndicator('EMA', true, { id: 'candle_pane' });
        else chart.removeIndicator('candle_pane', 'EMA');
      } else if (ind === 'boll') {
        if (nextState) chart.createIndicator('BOLL', true, { id: 'candle_pane' });
        else chart.removeIndicator('candle_pane', 'BOLL');
      } else if (ind === 'rsi') {
        if (nextState) chart.createIndicator('RSI', false, { id: 'rsi_pane', height: 80 });
        else chart.removeIndicator('rsi_pane', 'RSI');
      }
    } catch {}
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#06070B] select-none">
      
      {/* Chart Control Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#090A10] border-b border-white/10 text-xs">
        
        {/* Left: Timeframe Switcher Pills */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase mr-1 hidden sm:inline">TF:</span>
          {(['1m', '5m', '15m', '1h', '4h', '1D'] as const).map(tf => (
            <button
              key={tf}
              type="button"
              onClick={() => setActiveInterval(tf)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                activeInterval === tf
                  ? 'bg-gradient-to-r from-[#38BDF8] to-[#0284C7] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Right: Pro Indicators Quick Toggles */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase mr-1 hidden md:inline">Indicadores:</span>
          {(['ma', 'ema', 'boll', 'rsi'] as const).map(ind => (
            <button
              key={ind}
              type="button"
              onClick={() => toggleIndicator(ind)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                activeIndicators[ind]
                  ? 'bg-white/15 text-white border-white/20'
                  : 'text-slate-500 border-white/5 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {ind}
            </button>
          ))}

          {/* Engine Badge */}
          <span className="ml-2 hidden lg:inline-flex text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            KLineChart v10 Native Canvas 60 FPS
          </span>
        </div>
      </div>

      {/* Hardware Accelerated Canvas Container */}
      <div className="flex-1 w-full relative">
        <div ref={containerRef} className={className} />
      </div>

    </div>
  );
};
