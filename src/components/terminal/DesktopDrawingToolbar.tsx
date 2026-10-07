import React from 'react';
import { 
  TrendingUp, 
  MoveHorizontal, 
  ArrowRight, 
  Square, 
  AlignJustify, 
  Layers, 
  Trash2,
  X 
} from 'lucide-react';
import { DRAWING_TOOLS } from './drawingTools';

interface DesktopDrawingToolbarProps {
  isEs: boolean;
  activeDrawingTool: string | null;
  onSelectDrawingTool: (overlayName: string) => void;
  onCancelDrawing: () => void;
  onClearAllDrawings: () => void;
}

export const DesktopDrawingToolbar: React.FC<DesktopDrawingToolbarProps> = ({
  isEs,
  activeDrawingTool,
  onSelectDrawingTool,
  onCancelDrawing,
  onClearAllDrawings
}) => {
  const renderIcon = (iconName: string, className = 'w-3.5 h-3.5') => {
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'MoveHorizontal': return <MoveHorizontal className={className} />;
      case 'ArrowRight': return <ArrowRight className={className} />;
      case 'Square': return <Square className={className} />;
      case 'AlignJustify': return <AlignJustify className={className} />;
      case 'Layers': return <Layers className={className} />;
      default: return null;
    }
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      {/* BOTONES INDIVIDUALES DE HERRAMIENTAS DE DIBUJO (SOLO ICONOS) */}
      {DRAWING_TOOLS.map((tool) => {
        const isActive = activeDrawingTool === tool.overlayName;
        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => {
              if (isActive) {
                onCancelDrawing();
              } else {
                onSelectDrawingTool(tool.overlayName);
              }
            }}
            className={`p-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isActive
                ? 'bg-amber-200 border-amber-500 text-amber-950 font-bold shadow-xs ring-1 ring-amber-400'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title={`${isEs ? tool.nameEs : tool.name} (${isEs ? tool.descriptionEs : tool.descriptionEn})`}
          >
            <span className={isActive ? 'text-amber-900' : 'text-slate-600'}>
              {renderIcon(tool.iconName, 'w-3.5 h-3.5')}
            </span>
          </button>
        );
      })}

      {/* BOTÓN LIMPIAR TODOS LOS DIBUJOS */}
      <button
        type="button"
        onClick={onClearAllDrawings}
        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
        title={isEs ? 'Limpiar todos los dibujos del gráfico' : 'Clear all drawings from chart'}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
