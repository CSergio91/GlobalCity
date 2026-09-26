import React, { useState } from 'react';
import { TrendingUp, Calendar, Zap, DollarSign } from 'lucide-react';

interface GlobalCapitalChartProps {
  totalEquity: number;
}

export const GlobalCapitalChart: React.FC<GlobalCapitalChartProps> = ({ totalEquity }) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | 'ALL'>('1W');

  // Multiplier data points to simulate realistic smooth capital curve based on current equity
  const baseValue = totalEquity > 0 ? totalEquity : 10000;
  
  const timeframeData: Record<string, { points: number[]; changePct: number; pnlUsd: number }> = {
    '1D': {
      points: [baseValue * 0.988, baseValue * 0.991, baseValue * 0.989, baseValue * 0.996, baseValue * 0.993, baseValue * 1.002, baseValue],
      changePct: 1.22,
      pnlUsd: baseValue * 0.0122
    },
    '1W': {
      points: [baseValue * 0.945, baseValue * 0.958, baseValue * 0.951, baseValue * 0.978, baseValue * 0.969, baseValue * 0.985, baseValue],
      changePct: 5.82,
      pnlUsd: baseValue * 0.0582
    },
    '1M': {
      points: [baseValue * 0.892, baseValue * 0.915, baseValue * 0.908, baseValue * 0.942, baseValue * 0.935, baseValue * 0.971, baseValue],
      changePct: 12.11,
      pnlUsd: baseValue * 0.1211
    },
    'ALL': {
      points: [baseValue * 0.720, baseValue * 0.785, baseValue * 0.820, baseValue * 0.880, baseValue * 0.925, baseValue * 0.965, baseValue],
      changePct: 38.89,
      pnlUsd: baseValue * 0.3889
    }
  };

  const activeData = timeframeData[timeframe];
  const points = activeData.points;
  const minVal = Math.min(...points) * 0.995;
  const maxVal = Math.max(...points) * 1.005;
  const range = maxVal - minVal || 1;

  // Generate SVG coordinates for a 400x120 viewport
  const svgWidth = 500;
  const svgHeight = 120;
  const coordinates = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * svgWidth;
    const y = svgHeight - ((val - minVal) / range) * (svgHeight - 20) - 10;
    return { x, y };
  });

  // Construct smooth bezier curve path
  const pathD = coordinates.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  return (
    <div className="bg-[#0D0F17]/90 border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-xl shadow-xl flex flex-col justify-between">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Curva Global de Capital Consolidado</span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold font-mono-nums text-white">
              ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-bold font-mono-nums text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +{activeData.changePct}% (+${activeData.pnlUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })})
            </span>
          </div>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-0.5 rounded-xl self-start sm:self-auto">
          {(['1D', '1W', '1M', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
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

      {/* SVG Chart Graphic */}
      <div className="relative w-full h-28 sm:h-32 mt-2">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#06070B" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill="url(#capitalGradient)" />

          {/* Neon line */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="url(#strokeGradient)" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            filter="url(#neonGlow)"
          />

          {/* End glowing point */}
          {coordinates.length > 0 && (
            <circle 
              cx={coordinates[coordinates.length - 1].x} 
              cy={coordinates[coordinates.length - 1].y} 
              r="4" 
              fill="#F59E0B" 
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Micro High-Water Mark indicator */}
        <div className="absolute right-2 top-1 text-[9px] font-mono text-slate-500 flex items-center gap-1">
          <span>HWM:</span>
          <span className="text-slate-300">${maxVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

    </div>
  );
};
