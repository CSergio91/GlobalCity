import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export interface ChartContextMenuData {
  x: number;
  y: number;
  price: number;
}

interface ChartContextMenuProps {
  isEs: boolean;
  selectedPair: string;
  lastPrice: number;
  contextMenu: ChartContextMenuData | null;
  onPlacePendingOrder: (side: 'buy' | 'sell', price: number) => void;
  onConfigureInPanel: (price: number) => void;
  onClose: () => void;
}

/**
 * Menú contextual flotante de clic derecho en el gráfico KLineChart
 */
export const ChartContextMenu: React.FC<ChartContextMenuProps> = ({
  isEs,
  selectedPair,
  lastPrice,
  contextMenu,
  onPlacePendingOrder,
  onConfigureInPanel,
  onClose
}) => {
  if (!contextMenu) return null;

  return (
    <>
      {/* BACKDROP INVISIBLE — cierra el menú al tocar/clicar FUERA del popup */}
      <div
        className="fixed inset-0 z-[49]"
        onClick={onClose}
        onTouchStart={onClose}
      />

      <div
        style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="fixed z-50 min-w-56 bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-2 font-mono text-xs animate-in fade-in zoom-in-95 duration-100"
      >
        <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {selectedPair}
          </span>
          <span className="text-amber-400 font-black">
            ${contextMenu.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="space-y-1">
          {/* Botón Buy Limit / Buy Stop */}
          <button
            type="button"
            onClick={() => onPlacePendingOrder('buy', contextMenu.price)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-950/70 border border-emerald-900/40 hover:border-emerald-500/80 transition-all cursor-pointer font-bold"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {contextMenu.price <= lastPrice ? 'Buy Limit' : 'Buy Stop'}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              {contextMenu.price <= lastPrice ? (isEs ? 'Retroceso' : 'Dip') : (isEs ? 'Ruptura' : 'Breakout')}
            </span>
          </button>

          {/* Botón Sell Limit / Sell Stop */}
          <button
            type="button"
            onClick={() => onPlacePendingOrder('sell', contextMenu.price)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-950/70 border border-rose-900/40 hover:border-rose-500/80 transition-all cursor-pointer font-bold"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {contextMenu.price >= lastPrice ? 'Sell Limit' : 'Sell Stop'}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              {contextMenu.price >= lastPrice ? (isEs ? 'Repunte' : 'Rally') : (isEs ? 'Ruptura' : 'Breakdown')}
            </span>
          </button>

          {/* Configurar en panel */}
          <button
            type="button"
            onClick={() => onConfigureInPanel(contextMenu.price)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent transition-all cursor-pointer text-[11px]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>{isEs ? 'Configurar en Panel' : 'Set in Order Form'}</span>
          </button>
        </div>
      </div>
    </>
  );
};
