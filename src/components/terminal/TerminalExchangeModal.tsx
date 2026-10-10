import React from 'react';
import { Repeat, X } from 'lucide-react';

interface TerminalExchangeModalProps {
  isEs: boolean;
  onClose: () => void;
}

export const TerminalExchangeModal: React.FC<TerminalExchangeModalProps> = ({ isEs, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-zoom-in">
      <div className="w-full max-w-2xl bg-white/90 dark:bg-[#111726]/90 backdrop-blur-2xl rounded-3xl border border-slate-200/80 shadow-2xl p-6 relative text-slate-900">
        {/* CABECERA */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-xs">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                <span>{isEs ? 'Módulo Exchange Multi-Venue' : 'Multi-Venue Exchange Module'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Live WSS
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {isEs ? 'Enrutamiento y liquidez cruzada sobre el gráfico en tiempo real' : 'Cross-venue routing and liquidity over live chart'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isEs ? 'Cerrar y volver al gráfico' : 'Close and return to chart'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO DEMO DE MEDICIÓN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Venue Activo</div>
            <div className="text-sm font-black text-slate-900 mt-1">Binance / Spot</div>
            <div className="text-[10px] font-mono text-emerald-600 mt-0.5 font-bold">Latencia: 18ms</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Liquidez L2 Agregada</div>
            <div className="text-sm font-black text-slate-900 mt-1">$48,290,140</div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">Spread: 0.01%</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Smart Router</div>
            <div className="text-sm font-black text-slate-900 mt-1">Óptimo VWAP</div>
            <div className="text-[10px] font-mono text-amber-600 mt-0.5 font-bold">Zero-Slippage</div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs transition-all"
          >
            {isEs ? 'Volver al Gráfico Completo' : 'Back to Full Chart'}
          </button>
        </div>
      </div>
    </div>
  );
};
