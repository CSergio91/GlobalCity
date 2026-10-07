import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { sortTimeframes } from './types';
import { TimeframeModal } from './TimeframeModal';
import { IndicatorModal } from './IndicatorModal';
import { DesktopDrawingToolbar } from './DesktopDrawingToolbar';

interface TerminalToolbarProps {
  isEs: boolean;
  timeframe: string;
  favoriteTimeframes: string[];
  activeIndicators: string[];
  favoriteIndicators: string[];
  activeDrawingTool?: string | null;
  onSelectTimeframe: (tf: string) => void;
  onToggleIndicator: (name: string) => void;
  onToggleFavoriteTimeframe: (tf: string, e?: React.MouseEvent) => void;
  onToggleFavoriteIndicator: (ind: string, e?: React.MouseEvent) => void;
  onSelectDrawingTool?: (overlayName: string) => void;
  onCancelDrawing?: () => void;
  onClearAllDrawings?: () => void;
}

export const TerminalToolbar: React.FC<TerminalToolbarProps> = ({
  isEs,
  timeframe,
  favoriteTimeframes,
  activeIndicators,
  favoriteIndicators,
  activeDrawingTool = null,
  onSelectTimeframe,
  onToggleIndicator,
  onToggleFavoriteTimeframe,
  onToggleFavoriteIndicator,
  onSelectDrawingTool,
  onCancelDrawing,
  onClearAllDrawings
}) => {
  const [isTimeframeModalOpen, setIsTimeframeModalOpen] = useState(false);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);

  // Lista de temporalidades visibles en la barra siempre organizadas de menor a mayor
  const visibleTimeframes = sortTimeframes(
    favoriteTimeframes.includes(timeframe)
      ? favoriteTimeframes
      : [...favoriteTimeframes, timeframe]
  );

  return (
    <>
      <div className="h-9 sm:h-10 px-2 sm:px-4 border-b border-[#ded5c5] flex items-center justify-start gap-2 sm:gap-3 text-xs shrink-0 bg-white/70 overflow-x-auto no-scrollbar relative z-20">
        {/* SELECTOR DE TIMEFRAMES */}
        <div className="flex items-center gap-1 shrink-0">
          {visibleTimeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => onSelectTimeframe(tf)}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-mono font-bold text-[10px] sm:text-xs transition-colors cursor-pointer ${
                timeframe === tf 
                  ? 'bg-slate-950 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-200/60 text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}

          {/* BOTÓN 3 PUNTITOS: MÁS TEMPORALIDADES (1s a Anuales) */}
          <button
            type="button"
            onClick={() => {
              setIsTimeframeModalOpen(true);
              setIsIndicatorModalOpen(false);
            }}
            className={`p-1 sm:p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
              isTimeframeModalOpen
                ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
            title={isEs ? 'Más temporalidades (1s a Anual, Favoritos ★)' : 'More timeframes (1s to Yearly, Favorites ★)'}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* DIVISIÓN VERTICAL DESPUÉS DE LOS 3 PUNTITOS DE LAS TEMPORALIDADES */}
        <div className="h-4 w-px bg-slate-300 shrink-0" />

        {/* HERRAMIENTAS DE DIBUJO POR SEPARADO (SOLO ICONOS: Línea, Tendencia, Cuadros, Fibonacci, Limpiar) */}
        <div className="flex items-center shrink-0">
          <DesktopDrawingToolbar
            isEs={isEs}
            activeDrawingTool={activeDrawingTool}
            onSelectDrawingTool={onSelectDrawingTool || (() => {})}
            onCancelDrawing={onCancelDrawing || (() => {})}
            onClearAllDrawings={onClearAllDrawings || (() => {})}
          />
        </div>

        {/* DIVISIÓN VERTICAL ANTES DE LOS INDICADORES */}
        <div className="h-4 w-px bg-slate-300 shrink-0" />

        {/* INDICADORES TÉCNICOS */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">Indicadores:</span>
          {favoriteIndicators.map((ind) => {
            const isActive = activeIndicators.includes(ind);
            return (
              <button
                key={ind}
                type="button"
                onClick={() => onToggleIndicator(ind)}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {ind}
              </button>
            );
          })}

          {/* BOTÓN 3 PUNTITOS: BIBLIOTECA COMPLETA DE INDICADORES */}
          <button
            type="button"
            onClick={() => {
              setIsIndicatorModalOpen(true);
              setIsTimeframeModalOpen(false);
            }}
            className={`p-1 sm:p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
              isIndicatorModalOpen
                ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
            title={isEs ? 'Biblioteca completa de indicadores y favoritos ★' : 'Full indicator library and favorites ★'}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MODAL RESPONSIVO DE TEMPORALIDADES (MÓVIL Y ESCRITORIO) */}
      <TimeframeModal
        isOpen={isTimeframeModalOpen}
        isEs={isEs}
        timeframe={timeframe}
        favoriteTimeframes={favoriteTimeframes}
        onClose={() => setIsTimeframeModalOpen(false)}
        onSelectTimeframe={onSelectTimeframe}
        onToggleFavoriteTimeframe={onToggleFavoriteTimeframe}
      />

      {/* MODAL RESPONSIVO DE INDICADORES (MÓVIL Y ESCRITORIO) */}
      <IndicatorModal
        isOpen={isIndicatorModalOpen}
        isEs={isEs}
        activeIndicators={activeIndicators}
        favoriteIndicators={favoriteIndicators}
        onClose={() => setIsIndicatorModalOpen(false)}
        onToggleIndicator={onToggleIndicator}
        onToggleFavoriteIndicator={onToggleFavoriteIndicator}
      />
    </>
  );
};
