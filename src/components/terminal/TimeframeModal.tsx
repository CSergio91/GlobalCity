import React from 'react';
import { Star, X } from 'lucide-react';
import { ALL_TIMEFRAMES } from './types';

interface TimeframeModalProps {
  isOpen: boolean;
  isEs: boolean;
  timeframe: string;
  favoriteTimeframes: string[];
  onClose: () => void;
  onSelectTimeframe: (tf: string) => void;
  onToggleFavoriteTimeframe: (tf: string, e?: React.MouseEvent) => void;
}

/**
 * Modal responsivo de selección de temporalidades (1s a 1Y)
 */
export const TimeframeModal: React.FC<TimeframeModalProps> = ({
  isOpen,
  isEs,
  timeframe,
  favoriteTimeframes,
  onClose,
  onSelectTimeframe,
  onToggleFavoriteTimeframe
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs select-none">
      <div 
        className="fixed inset-0 -z-10" 
        onClick={onClose} 
      />
      <div className="w-full max-w-md max-h-[85vh] bg-white rounded-3xl border border-[#ded5c5] shadow-2xl p-4 flex flex-col animate-zoom-in text-slate-900 overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 shrink-0">
          <div>
            <h4 className="text-sm font-black text-slate-950 flex items-center gap-2">
              <span>{isEs ? 'Intervalos de Tiempo' : 'Time Intervals'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                1s - 1Y
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEs ? 'Marca la estrella ★ para fijar en tu barra de acceso rápido' : 'Star ★ to pin to your quick toolbar'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isEs ? 'Cerrar' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pr-1">
          {(['seconds', 'minutes', 'hours', 'days', 'periods'] as const).map((cat) => {
            const catLabels: Record<string, string> = {
              seconds: isEs ? 'Segundos (Tick / Scalping)' : 'Seconds (Tick / Scalping)',
              minutes: isEs ? 'Minutos (Intradía)' : 'Minutes (Intraday)',
              hours: isEs ? 'Horas (Swing)' : 'Hours (Swing)',
              days: isEs ? 'Días y Semanas (Posición)' : 'Days & Weeks (Position)',
              periods: isEs ? 'Meses y Anuales (Macro)' : 'Months & Years (Macro)'
            };
            return (
              <div key={cat}>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  {catLabels[cat]}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {ALL_TIMEFRAMES.filter((t) => t.category === cat).map((tf) => {
                    const isFav = favoriteTimeframes.includes(tf.value);
                    const isSelected = timeframe === tf.value;
                    return (
                      <div 
                        key={tf.value}
                        onClick={() => {
                          onSelectTimeframe(tf.value);
                          onClose();
                        }}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100/90 border-amber-400 text-amber-950 font-black shadow-xs'
                            : 'bg-[#fbf9f4] border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <span className="font-bold">{tf.label}</span>
                        <button
                          type="button"
                          onClick={(e) => onToggleFavoriteTimeframe(tf.value, e)}
                          className="p-1 transition-colors cursor-pointer hover:scale-110"
                          title={isFav ? (isEs ? 'Desmarcar favorito' : 'Unfavorite') : (isEs ? 'Marcar favorito' : 'Favorite')}
                        >
                          <Star 
                            className={`w-3.5 h-3.5 ${
                              isFav 
                                ? 'fill-amber-400 text-amber-500' 
                                : 'text-slate-300 hover:text-amber-400'
                            }`} 
                          />
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
    </div>
  );
};
