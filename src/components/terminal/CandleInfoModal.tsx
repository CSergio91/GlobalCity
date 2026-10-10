import React from 'react';
import { X, Calendar, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { KLineBar } from '../../core/market-feed/types';

interface CandleInfoModalProps {
  candle: KLineBar | null;
  symbol: string;
  isEs: boolean;
  onClose: () => void;
}

export const CandleInfoModal: React.FC<CandleInfoModalProps> = ({
  candle,
  symbol,
  isEs,
  onClose
}) => {
  if (!candle) return null;

  const isUp = candle.close >= candle.open;
  const changePrice = candle.close - candle.open;
  const changePercent = candle.open > 0 ? (changePrice / candle.open) * 100 : 0;
  const range = candle.high - candle.low;

  const dateStr = new Date(candle.timestamp).toLocaleString(isEs ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="absolute top-2 left-2 z-40 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-3 w-64 select-none animate-in fade-in-50 zoom-in-95 duration-150 font-sans">
      {/* HEADER DEL MODALITO */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          {isUp ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-600" />
          )}
          <span className="text-xs font-black text-slate-900 tracking-tight">{symbol}</span>
          <span
            className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded ${
              isUp
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {isUp ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          title={isEs ? 'Cerrar detalles' : 'Close candle details'}
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* TIMESTAMP */}
      <div className="flex items-center gap-1.5 py-1.5 text-[10px] text-slate-500 font-mono">
        <Calendar className="w-3 h-3 text-slate-400" />
        <span>{dateStr}</span>
      </div>

      {/* DETALLES OHLC DE LA VELA */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 py-1 font-mono text-[11px] border-t border-slate-100">
        <div className="flex justify-between">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Open</span>
          <span className="font-bold text-slate-800">${candle.open.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Close</span>
          <span className={`font-bold ${isUp ? 'text-emerald-600' : 'text-red-600'}`}>
            ${candle.close.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 text-[10px] uppercase font-bold">High</span>
          <span className="font-bold text-slate-800">${candle.high.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Low</span>
          <span className="font-bold text-slate-800">${candle.low.toLocaleString()}</span>
        </div>
      </div>

      {/* VOLUMEN Y RANGO */}
      <div className="pt-2 border-t border-slate-100 space-y-1 font-mono text-[10px]">
        <div className="flex justify-between text-slate-600">
          <span className="flex items-center gap-1 text-slate-400">
            <BarChart2 className="w-3 h-3" />
            {isEs ? 'Volumen' : 'Volume'}
          </span>
          <span className="font-bold text-slate-900">{candle.volume.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span className="text-slate-400">{isEs ? 'Rango H/L' : 'H/L Range'}</span>
          <span className="font-bold text-slate-800">${range.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
