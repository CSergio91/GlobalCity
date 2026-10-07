import React from 'react';

interface QuickTradeButtonsProps {
  isDesktop: boolean;
  visible: boolean;
  isEs: boolean;
  lastPrice: number;
  onQuickTrade: (side: 'buy' | 'sell') => void;
}

/**
 * Botones flotantes superiores de compra / venta 1-click en escritorio
 * Se muestran en la esquina superior derecha del gráfico cuando el panel de trading está oculto
 */
export const QuickTradeButtons: React.FC<QuickTradeButtonsProps> = ({
  isDesktop,
  visible,
  isEs,
  lastPrice,
  onQuickTrade
}) => {
  if (!isDesktop || !visible) return null;

  return (
    <div className="absolute top-3 right-16 z-30 flex items-center gap-1.5 pointer-events-auto bg-[#fbf9f4]/90 backdrop-blur-md p-1 rounded-xl border border-[#ded5c5] shadow-lg animate-in fade-in zoom-in-95 duration-200">
      {/* BOTÓN VENTA 1-CLICK */}
      <button
        type="button"
        onClick={() => onQuickTrade('sell')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-500/30 hover:border-red-500/70 font-mono font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs group"
        title={isEs ? 'Venta a Mercado Inmediata (1-Click)' : '1-Click Immediate Market Sell'}
      >
        <span className="font-sans font-black text-[11px] uppercase tracking-wider text-red-700 group-hover:text-red-900">
          {isEs ? 'Vender' : 'Sell'}
        </span>
        <span className="text-[11px] font-mono font-bold text-red-800">
          ${lastPrice > 0 ? lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '---'}
        </span>
      </button>

      {/* BOTÓN COMPRA 1-CLICK */}
      <button
        type="button"
        onClick={() => onQuickTrade('buy')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 hover:border-emerald-500/70 font-mono font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs group"
        title={isEs ? 'Compra a Mercado Inmediata (1-Click)' : '1-Click Immediate Market Buy'}
      >
        <span className="font-sans font-black text-[11px] uppercase tracking-wider text-emerald-700 group-hover:text-emerald-900">
          {isEs ? 'Comprar' : 'Buy'}
        </span>
        <span className="text-[11px] font-mono font-bold text-emerald-800">
          ${lastPrice > 0 ? lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '---'}
        </span>
      </button>
    </div>
  );
};
