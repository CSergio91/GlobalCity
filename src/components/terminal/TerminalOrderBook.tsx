import React from 'react';
import { Activity, ChevronDown, ChevronUp, X } from 'lucide-react';
import { OrderBookPayload } from '../../core/market-feed/types';

interface TerminalOrderBookProps {
  orderBook: OrderBookPayload;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
}

export const TerminalOrderBook: React.FC<TerminalOrderBookProps> = ({
  orderBook,
  isMinimized = false,
  onToggleMinimize,
  onClose
}) => {
  // Asegurar siempre 5 niveles estables para que nunca salte el layout
  const rawAsks = orderBook.asks || [];
  const rawBids = orderBook.bids || [];

  const displayAsks = rawAsks.length >= 5
    ? rawAsks.slice(0, 5).reverse()
    : Array.from({ length: 5 }, (_, i) => rawAsks[i] || { price: 0, amount: 0 });

  const displayBids = rawBids.length >= 5
    ? rawBids.slice(0, 5)
    : Array.from({ length: 5 }, (_, i) => rawBids[i] || { price: 0, amount: 0 });

  const bestAsk = displayAsks[displayAsks.length - 1]?.price || 0;
  const bestBid = displayBids[0]?.price || 0;
  const spread = bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0;
  const spreadPercent = bestAsk > 0 ? (spread / bestAsk) * 100 : 0.01;

  const maxAskAmount = Math.max(1, ...displayAsks.map((a) => a.amount || 0));
  const maxBidAmount = Math.max(1, ...displayBids.map((b) => b.amount || 0));

  return (
    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs select-none">
      {/* HEADER DEL LIBRO DE ÓRDENES */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
        <span className="text-[11px] font-black text-white flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-slate-600" />
          <span>Order Book L2</span>
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-mono text-slate-400 mr-1">5 Niveles</span>
          {onToggleMinimize && (
            <button
              type="button"
              onClick={onToggleMinimize}
              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-white cursor-pointer"
              title={isMinimized ? 'Expandir Order Book' : 'Minimizar Order Book'}
            >
              {isMinimized ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
              title="Cerrar panel de Order Book"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="mt-1.5">
          {/* CABECERA DE COLUMNAS PRECIO / CANTIDAD */}
          <div className="flex justify-between px-1.5 pb-1 text-[9px] font-mono uppercase text-slate-400 font-bold border-b border-slate-100">
            <span>Precio (USDT)</span>
            <span>Tamaño</span>
          </div>

          {/* ASKS (VENTAS - ROJO) ALTURA FIJA SIN SALTOS */}
          <div className="space-y-0.5 font-mono text-[10px] tabular-nums min-h-[95px] flex flex-col justify-end pt-1">
            {displayAsks.map((ask, i) => {
              const depthPct = Math.min(100, Math.round((ask.amount / maxAskAmount) * 100));
              return (
                <div key={i} className="relative flex justify-between items-center px-1.5 h-[17px] rounded-xs overflow-hidden">
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-red-100/70 transition-all duration-150 pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="relative z-10 text-red-600 font-bold tracking-tight">
                    {ask.price > 0 ? `$${ask.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                  </span>
                  <span className="relative z-10 text-slate-600 text-[9.5px]">
                    {ask.amount > 0 ? ask.amount.toFixed(3) : '—'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* SPREAD INDICATOR FIJO EN EL CENTRO */}
          <div className="py-1 px-1.5 my-1 bg-white border-y border-slate-200 flex items-center justify-between font-mono text-[9.5px]">
            <span className="text-slate-400 text-[8.5px] uppercase font-bold">Spread</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-800 font-bold">
                {spread > 0 ? `$${spread.toFixed(2)}` : '0.01'}
              </span>
              <span className="text-amber-600 font-semibold text-[8.5px]">
                ({spreadPercent.toFixed(3)}%)
              </span>
            </div>
          </div>

          {/* BIDS (COMPRAS - VERDE) ALTURA FIJA SIN SALTOS */}
          <div className="space-y-0.5 font-mono text-[10px] tabular-nums min-h-[95px] flex flex-col justify-start">
            {displayBids.map((bid, i) => {
              const depthPct = Math.min(100, Math.round((bid.amount / maxBidAmount) * 100));
              return (
                <div key={i} className="relative flex justify-between items-center px-1.5 h-[17px] rounded-xs overflow-hidden">
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-emerald-100/70 transition-all duration-150 pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="relative z-10 text-emerald-600 font-bold tracking-tight">
                    {bid.price > 0 ? `$${bid.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                  </span>
                  <span className="relative z-10 text-slate-600 text-[9.5px]">
                    {bid.amount > 0 ? bid.amount.toFixed(3) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
