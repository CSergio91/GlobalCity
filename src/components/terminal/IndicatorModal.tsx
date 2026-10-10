import React, { useState } from 'react';
import { Search, X, Check, Star } from 'lucide-react';
import { ALL_INDICATORS, IndicatorOption } from './types';

interface IndicatorModalProps {
  isOpen: boolean;
  isEs: boolean;
  activeIndicators: string[];
  favoriteIndicators: string[];
  onClose: () => void;
  onToggleIndicator: (name: string) => void;
  onToggleFavoriteIndicator: (ind: string, e?: React.MouseEvent) => void;
}

/**
 * Modal responsivo de selección de indicadores técnicos
 */
export const IndicatorModal: React.FC<IndicatorModalProps> = ({
  isOpen,
  isEs,
  activeIndicators,
  favoriteIndicators,
  onClose,
  onToggleIndicator,
  onToggleFavoriteIndicator
}) => {
  const [indicatorSearchQuery, setIndicatorSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredIndicators = ALL_INDICATORS.filter((ind) => 
    ind.name.toLowerCase().includes(indicatorSearchQuery.toLowerCase()) ||
    ind.label.toLowerCase().includes(indicatorSearchQuery.toLowerCase()) ||
    ind.description.toLowerCase().includes(indicatorSearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs select-none">
      <div 
        className="fixed inset-0 -z-10" 
        onClick={onClose} 
      />
      <div className="w-full max-w-lg max-h-[85vh] bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 flex flex-col animate-zoom-in text-slate-900 overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 shrink-0">
          <div>
            <h4 className="text-sm font-black text-slate-950 flex items-center gap-2">
              <span>{isEs ? 'Biblioteca de Indicadores' : 'Indicator Library'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                {ALL_INDICATORS.length}
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEs ? 'Activa indicadores en el gráfico o márcalos con ★ para tu barra' : 'Activate indicators on chart or star ★ for toolbar'}
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

        {/* BUSCADOR */}
        <div className="relative mb-3 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={indicatorSearchQuery}
            onChange={(e) => setIndicatorSearchQuery(e.target.value)}
            placeholder={isEs ? 'Buscar indicador (ej. RSI, OHLC, BOLL, EMA)...' : 'Search indicators (e.g. RSI, OHLC, BOLL, EMA)...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-500 bg-white"
          />
        </div>

        {/* LISTA DE INDICADORES SCROLLABLE */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
          {filteredIndicators.map((ind: IndicatorOption) => {
            const isActive = activeIndicators.includes(ind.name);
            const isFav = favoriteIndicators.includes(ind.name);
            return (
              <div
                key={ind.name}
                onClick={() => onToggleIndicator(ind.name)}
                className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-50/90 border-amber-300 text-slate-950 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className={`w-4.5 h-4.5 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                    isActive
                      ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-slate-950 text-xs">{ind.name}</span>
                      <span className="text-[11px] text-slate-600 font-semibold truncate">{ind.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{ind.description}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => onToggleFavoriteIndicator(ind.name, e)}
                  className="p-1.5 transition-colors shrink-0 cursor-pointer hover:scale-110"
                  title={isFav ? (isEs ? 'Quitar de favoritos' : 'Remove favorite') : (isEs ? 'Añadir a favoritos' : 'Add favorite')}
                >
                  <Star 
                    className={`w-4 h-4 ${
                      isFav 
                        ? 'fill-amber-400 text-amber-500' 
                        : 'text-slate-300 hover:text-amber-400'
                    }`} 
                  />
                </button>
              </div>
            );
          })}
          {filteredIndicators.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              {isEs ? 'No se encontraron indicadores con ese término' : 'No indicators found matching that query'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
