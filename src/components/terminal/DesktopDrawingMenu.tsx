import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, 
  TrendingUp, 
  MoveHorizontal, 
  ArrowRight, 
  Square, 
  AlignJustify, 
  Layers, 
  Trash2, 
  ChevronDown,
  X 
} from 'lucide-react';
import { DRAWING_TOOLS, DrawingToolItem } from './drawingTools';

interface DesktopDrawingMenuProps {
  isEs: boolean;
  activeDrawingTool: string | null;
  onSelectDrawingTool: (overlayName: string) => void;
  onCancelDrawing: () => void;
  onClearAllDrawings: () => void;
}

export const DesktopDrawingMenu: React.FC<DesktopDrawingMenuProps> = ({
  isEs,
  activeDrawingTool,
  onSelectDrawingTool,
  onCancelDrawing,
  onClearAllDrawings
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const renderIcon = (iconName: string, className = 'w-3.5 h-3.5') => {
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'MoveHorizontal': return <MoveHorizontal className={className} />;
      case 'ArrowRight': return <ArrowRight className={className} />;
      case 'Square': return <Square className={className} />;
      case 'AlignJustify': return <AlignJustify className={className} />;
      case 'Layers': return <Layers className={className} />;
      default: return <PenTool className={className} />;
    }
  };

  const activeToolObj = DRAWING_TOOLS.find((t) => t.overlayName === activeDrawingTool);

  return (
    <div ref={containerRef} className="relative inline-flex items-center gap-1 shrink-0">
      {/* BOTÓN PRINCIPAL DE HERRAMIENTAS */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-2 py-1 rounded-lg border font-mono font-bold text-[10px] sm:text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
          isOpen || activeDrawingTool
            ? 'bg-amber-100/90 border-amber-400 text-amber-950 shadow-xs'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950'
        }`}
        title={isEs ? 'Herramientas de Dibujo (Líneas, Cuadros, Fibonacci)' : 'Drawing Tools (Lines, Boxes, Fibonacci)'}
      >
        <PenTool className="w-3.5 h-3.5 text-amber-600" />
        <span className="hidden md:inline font-sans">
          {activeToolObj ? (isEs ? activeToolObj.nameEs : activeToolObj.name) : (isEs ? 'Dibujo' : 'Draw')}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform text-slate-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* PILL INDICADOR CUANDO HAY HERRAMIENTA ACTIVA PARA TRAZAR */}
      {activeDrawingTool && (
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-mono animate-in fade-in">
          <span>{isEs ? 'Haz clic en el gráfico' : 'Click on chart'}</span>
          <button
            type="button"
            onClick={onCancelDrawing}
            className="p-0.5 rounded hover:bg-blue-200/60 text-blue-700 hover:text-blue-900 cursor-pointer"
            title={isEs ? 'Cancelar dibujo' : 'Cancel drawing'}
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      {/* DROPDOWN DE HERRAMIENTAS */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-60 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/60 flex items-center justify-between">
            <span>{isEs ? 'Herramientas de Dibujo' : 'Drawing Tools'}</span>
            <span className="text-[9px] text-amber-600 font-normal">KLineChart</span>
          </div>

          <div className="py-1 space-y-0.5">
            {DRAWING_TOOLS.map((tool) => {
              const isSelected = activeDrawingTool === tool.overlayName;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    onSelectDrawingTool(tool.overlayName);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100 text-amber-950 font-bold shadow-xs'
                      : 'hover:bg-slate-100/80 text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`p-1 rounded-md ${isSelected ? 'bg-amber-200/80 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
                      {renderIcon(tool.iconName)}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold leading-tight">
                        {isEs ? tool.nameEs : tool.name}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate font-sans">
                        {isEs ? tool.descriptionEs : tool.descriptionEn}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ACCIÓN: LIMPIAR TODOS LOS DIBUJOS */}
          <div className="pt-1 mt-1 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                onClearAllDrawings();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>{isEs ? 'Limpiar todos los dibujos' : 'Clear all drawings'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
