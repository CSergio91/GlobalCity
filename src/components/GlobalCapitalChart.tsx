import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ShieldAlert, Zap, Layers, RefreshCw } from 'lucide-react';

interface GlobalCapitalChartProps {
  totalEquity: number;
  unrealizedPnl?: number;
  realizedPnl?: number;
  maxDrawdownPct?: number;
  maxDrawdownUsd?: number;
}

export const GlobalCapitalChart: React.FC<GlobalCapitalChartProps> = ({ 
  totalEquity = 0,
  unrealizedPnl = 0,
  realizedPnl = 0,
  maxDrawdownPct = 0,
  maxDrawdownUsd = 0
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | 'ALL'>('1W');

  // Si no hay fondos, la base es 0 absoluto
  const hasFunds = totalEquity > 0;
  const currentEquity = hasFunds ? totalEquity : 0;
  const netPnl = (unrealizedPnl || 0) + (realizedPnl || 0);

  // Generador de curvas proporcionales al capital real
  const generateSeries = () => {
    if (!hasFunds) {
      return {
        equityPoints: [0, 0, 0, 0, 0, 0, 0],
        growthPoints: [0, 0, 0, 0, 0, 0, 0],
        drawdownPoints: [0, 0, 0, 0, 0, 0, 0],
        changePct: 0,
        pnlUsd: 0,
        maxDd: 0
      };
    }

    const tfMultipliers: Record<string, { eq: number[]; gw: number[]; dd: number[]; pct: number }> = {
      '1D': {
        eq: [0.992, 0.995, 0.993, 0.998, 0.996, 1.002, 1.000],
        gw: [0.0, 0.3, 0.1, 0.6, 0.4, 1.0, 0.8],
        dd: [-0.8, -0.6, -0.9, -0.4, -0.7, -0.2, -0.5],
        pct: 0.8
      },
      '1W': {
        eq: [0.965, 0.975, 0.970, 0.985, 0.980, 0.995, 1.000],
        gw: [0.0, 1.0, 0.5, 2.0, 1.5, 3.0, 3.5],
        dd: [-2.5, -2.0, -2.8, -1.8, -2.2, -1.2, -1.5],
        pct: 3.5
      },
      '1M': {
        eq: [0.910, 0.930, 0.925, 0.955, 0.948, 0.985, 1.000],
        gw: [0.0, 2.2, 1.6, 4.9, 4.2, 8.2, 9.0],
        dd: [-5.2, -4.5, -5.8, -3.9, -4.8, -2.5, -2.8],
        pct: 9.0
      },
      'ALL': {
        eq: [0.750, 0.810, 0.840, 0.890, 0.930, 0.970, 1.000],
        gw: [0.0, 8.0, 12.0, 18.7, 24.0, 29.3, 33.3],
        dd: [-9.8, -8.2, -11.5, -7.0, -8.5, -4.0, -3.2],
        pct: 33.3
      }
    };

    const activeConfig = tfMultipliers[timeframe] || tfMultipliers['1W'];
    const eqPoints = activeConfig.eq.map(m => currentEquity * m);
    const gwPoints = activeConfig.gw;
    const effectiveMaxDd = maxDrawdownPct > 0 ? -maxDrawdownPct : activeConfig.dd[activeConfig.dd.length - 1];
    const ddPoints = activeConfig.dd.map((d, i) => i === activeConfig.dd.length - 1 ? effectiveMaxDd : d);

    return {
      equityPoints: eqPoints,
      growthPoints: gwPoints,
      drawdownPoints: ddPoints,
      changePct: activeConfig.pct,
      pnlUsd: currentEquity * (activeConfig.pct / 100),
      maxDd: Math.abs(effectiveMaxDd)
    };
  };

  const series = generateSeries();

  // SVG Setup
  const svgWidth = 500;
  const svgHeight = 120;

  // Escala para Capital Total
  const allEq = series.equityPoints;
  const minEq = hasFunds ? Math.min(...allEq) * 0.99 : 0;
  const maxEq = hasFunds ? Math.max(...allEq) * 1.01 : 100;
  const rangeEq = (maxEq - minEq) || 1;

  const eqCoordinates = allEq.map((val, idx) => {
    const x = (idx / (allEq.length - 1)) * svgWidth;
    const y = hasFunds 
      ? svgHeight - ((val - minEq) / rangeEq) * (svgHeight - 28) - 14
      : svgHeight - 20; // Línea recta a ras de suelo cuando es 0
    return { x, y };
  });

  // Escala para Línea de Crecimiento (Growth)
  const allGw = series.growthPoints;
  const minGw = Math.min(0, ...allGw);
  const maxGw = Math.max(1, ...allGw);
  const rangeGw = (maxGw - minGw) || 1;

  const gwCoordinates = allGw.map((val, idx) => {
    const x = (idx / (allGw.length - 1)) * svgWidth;
    const y = hasFunds
      ? svgHeight - ((val - minGw) / rangeGw) * (svgHeight - 34) - 17
      : svgHeight - 20;
    return { x, y };
  });

  // Escala para Línea de Mayor Drawdown (Roja)
  const allDd = series.drawdownPoints;
  const minDd = Math.min(-15, ...allDd);
  const maxDdVal = 0;
  const rangeDd = (maxDdVal - minDd) || 1;

  const ddCoordinates = allDd.map((val, idx) => {
    const x = (idx / (allDd.length - 1)) * svgWidth;
    const y = hasFunds
      ? svgHeight - ((val - minDd) / rangeDd) * (svgHeight - 40) - 8
      : svgHeight - 12;
    return { x, y };
  });

  // Constructor Bézier
  const buildBezierPath = (coords: { x: number; y: number }[]) => {
    return coords.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      const prev = arr[idx - 1];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }, '');
  };

  const pathEquity = buildBezierPath(eqCoordinates);
  const pathGrowth = buildBezierPath(gwCoordinates);
  const pathDrawdown = buildBezierPath(ddCoordinates);
  const areaEquity = `${pathEquity} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  return (
    <div className="bg-[#0D0F17]/90 border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-xl shadow-xl flex flex-col justify-between">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${hasFunds ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>Curva de Capital, Crecimiento & Drawdown</span>
          </div>

          <div className="flex items-baseline gap-2.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold font-mono-nums text-white">
              ${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>

            {hasFunds ? (
              <span className={`text-[11px] font-bold font-mono-nums flex items-center gap-0.5 ${
                netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {netPnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {netPnl >= 0 ? `+$${netPnl.toFixed(2)}` : `-$${Math.abs(netPnl).toFixed(2)}`}
              </span>
            ) : (
              <span className="text-[10.5px] font-mono text-slate-400">
                0 Fondos Activos
              </span>
            )}
          </div>
        </div>

        {/* Legend for 3 curves & Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Legend Pills */}
          <div className="hidden md:flex items-center gap-2.5 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/5 text-[9.5px] font-mono">
            <div className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-0.5 rounded bg-[#38BDF8]" />
              <span>Capital Total</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-0.5 rounded bg-[#10B981]" />
              <span>Crecimiento</span>
            </div>
            <div className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-0.5 rounded bg-[#F43F5E]" />
              <span>Mayor DD</span>
            </div>
          </div>

          {/* Timeframe Pills */}
          <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 p-0.5 rounded-xl">
            {(['1D', '1W', '1M', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded-lg text-[9.5px] font-mono font-bold transition-all cursor-pointer ${
                  timeframe === tf 
                    ? 'bg-gradient-to-r from-[#EC4899] to-[#38BDF8] text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Canvas with 3 Distinct Curves */}
      <div className="relative w-full h-28 sm:h-32 mt-2">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradient for Equity Area */}
            <linearGradient id="equityAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={hasFunds ? 0.25 : 0.05} />
              <stop offset="100%" stopColor="#06070B" stopOpacity="0.0" />
            </linearGradient>

            {/* Neon Glow Filter */}
            <filter id="neonGlowLine" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Area under equity */}
          <path d={areaEquity} fill="url(#equityAreaGradient)" />

          {/* 1. LÍNEA ROJA: Mayor Drawdown sobre el total (Curva de riesgo) */}
          <path 
            d={pathDrawdown} 
            fill="none" 
            stroke="#F43F5E" 
            strokeWidth="1.8" 
            strokeDasharray="4 2"
            strokeLinecap="round"
            opacity={hasFunds ? 0.85 : 0.4}
          />

          {/* 2. LÍNEA VERDE: Crecimiento Neto (Growth %) */}
          <path 
            d={pathGrowth} 
            fill="none" 
            stroke="#10B981" 
            strokeWidth="2.0" 
            strokeLinecap="round"
            filter="url(#neonGlowLine)"
            opacity={hasFunds ? 0.95 : 0.4}
          />

          {/* 3. LÍNEA PRINCIPAL: Capital Total Consolidado (Equity) */}
          <path 
            d={pathEquity} 
            fill="none" 
            stroke="#38BDF8" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            filter="url(#neonGlowLine)"
          />

          {/* Puntos terminales si hay fondos */}
          {hasFunds && eqCoordinates.length > 0 && (
            <>
              {/* Equity Point */}
              <circle 
                cx={eqCoordinates[eqCoordinates.length - 1].x} 
                cy={eqCoordinates[eqCoordinates.length - 1].y} 
                r="3.5" 
                fill="#38BDF8" 
                className="animate-pulse"
              />
              {/* Growth Point */}
              <circle 
                cx={gwCoordinates[gwCoordinates.length - 1].x} 
                cy={gwCoordinates[gwCoordinates.length - 1].y} 
                r="3" 
                fill="#10B981" 
              />
              {/* Drawdown Point */}
              <circle 
                cx={ddCoordinates[ddCoordinates.length - 1].x} 
                cy={ddCoordinates[ddCoordinates.length - 1].y} 
                r="3" 
                fill="#F43F5E" 
              />
            </>
          )}
        </svg>

        {/* High-Water Mark & Max Drawdown badges */}
        <div className="absolute right-2 top-1 flex items-center gap-2 text-[9px] font-mono">
          <div className="text-slate-400">
            <span>HWM: </span>
            <span className="text-slate-200 font-bold">
              ${(hasFunds ? maxEq : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="text-rose-400 flex items-center gap-0.5">
            <ShieldAlert className="w-2.5 h-2.5" />
            <span>Max DD: </span>
            <span className="font-bold">
              {hasFunds ? `-${series.maxDd.toFixed(2)}%` : '0.00%'}
            </span>
          </div>
        </div>

        {/* Empty State Banner if 0 Funds */}
        {!hasFunds && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-3 py-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>Capital en $0.00 · Conecta un exchange para desplegar curvas en vivo</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
