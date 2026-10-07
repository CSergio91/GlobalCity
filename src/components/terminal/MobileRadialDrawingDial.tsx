import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MoveHorizontal, 
  ArrowRight, 
  Square, 
  AlignJustify, 
  Layers, 
  Trash2, 
  PenTool
} from 'lucide-react';

interface MobileRadialDrawingDialProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (overlayName: string) => void;
  onClearDrawings: () => void;
  activeTool: string | null;
  isEs: boolean;
  size?: number; // Tamaño compacto optimizado (195px)
  position?: { x: number; y: number } | null;
}

interface RadialWheelItem {
  id: string;
  name: string;
  shortLabelEs: string;
  shortLabelEn: string;
  overlayName: string;
  iconName: string;
  isAction?: boolean;
}

export const MobileRadialDrawingDial: React.FC<MobileRadialDrawingDialProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onClearDrawings,
  activeTool,
  isEs,
  size = 195,
  position = null
}) => {
  if (!isOpen) return null;

  // 7 Herramientas integradas en un anillo continuo sin separaciones
  const WHEEL_ITEMS: RadialWheelItem[] = [
    {
      id: 'trend_line',
      name: 'Trend Line',
      shortLabelEs: 'TENDENCIA',
      shortLabelEn: 'TREND LINE',
      overlayName: 'segment',
      iconName: 'TrendingUp'
    },
    {
      id: 'horizontal_line',
      name: 'Horizontal Line',
      shortLabelEs: 'HORIZONTAL',
      shortLabelEn: 'HORIZONTAL',
      overlayName: 'horizontalStraightLine',
      iconName: 'MoveHorizontal'
    },
    {
      id: 'horizontal_ray',
      name: 'Horizontal Ray',
      shortLabelEs: 'SEMIRRECTA',
      shortLabelEn: 'RAY LINE',
      overlayName: 'horizontalRayLine',
      iconName: 'ArrowRight'
    },
    {
      id: 'rect',
      name: 'Order Block / Box',
      shortLabelEs: 'CUADRO OB',
      shortLabelEn: 'BOX (OB)',
      overlayName: 'rect',
      iconName: 'Square'
    },
    {
      id: 'parallel_channel',
      name: 'Parallel Channel',
      shortLabelEs: 'CANAL',
      shortLabelEn: 'CHANNEL',
      overlayName: 'parallelStraightLine',
      iconName: 'AlignJustify'
    },
    {
      id: 'fibonacci',
      name: 'Fibonacci Retracement',
      shortLabelEs: 'FIBONACCI',
      shortLabelEn: 'FIBONACCI',
      overlayName: 'fibonacciLine',
      iconName: 'Layers'
    },
    {
      id: 'clear_all',
      name: 'Clear All',
      shortLabelEs: 'LIMPIAR',
      shortLabelEn: 'CLEAR ALL',
      overlayName: 'clear_all',
      iconName: 'Trash2',
      isAction: true
    }
  ];

  const [hoveredItem, setHoveredItem] = useState<RadialWheelItem>(() => {
    return WHEEL_ITEMS.find((t) => t.overlayName === activeTool) || WHEEL_ITEMS[0];
  });

  // ----------------------------------------------------------------------------
  // ANIMACIÓN DE BARRIDO DE TACÓMETRO SUAVE (ESTILO TELEMETRÍA CRM A 60 FPS)
  // ----------------------------------------------------------------------------
  const [animPercent, setAnimPercent] = useState<number>(0);

  useEffect(() => {
    let rafId: number;
    const startTime = performance.now();
    setAnimPercent(0);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const duration = 440; // Barrido inicial aceitado
      const progress = Math.min(1, elapsed / duration);
      // Easing cúbico desacelerado institucional
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimPercent(eased * 100);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setAnimPercent(100);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen]);

  const cx = size / 2;
  const cy = size / 2;

  // Parámetros angulares del tacómetro (anillo continuo)
  const startAngle = 144;
  const sweepAngle = 252;
  const numSectors = WHEEL_ITEMS.length;
  const sectorStep = sweepAngle / numSectors; // 36° por sector exacto

  // Radios compactos de precisión
  const rMin = size * 0.29; // ~56.5px
  const rMax = size * 0.45; // ~87.7px
  const rIcon = (rMin + rMax) / 2;

  // Gradiente profesional continuo de alta intensidad idéntico al CRM
  const crmColors = [
    '#0072FF', // Azul Real
    '#0095FF', // Azul Cobalto
    '#00B8FF', // Azul Cian
    '#00D4FF', // Cian Eléctrico
    '#00F0FF', // Cian Puro
    '#52F5FF', // Cian Neón Claro
    '#EF4444'  // Rojo Alerta para Limpiar
  ];

  // Ángulo actual alcanzado por la aguja
  const currentAngle = startAngle + (animPercent / 100) * sweepAngle;

  const renderIcon = (iconName: string, className = 'w-3.5 h-3.5') => {
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'MoveHorizontal': return <MoveHorizontal className={className} />;
      case 'ArrowRight': return <ArrowRight className={className} />;
      case 'Square': return <Square className={className} />;
      case 'AlignJustify': return <AlignJustify className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Trash2': return <Trash2 className={className} />;
      default: return <PenTool className={className} />;
    }
  };

  const handleExecuteItem = (item: RadialWheelItem) => {
    if (item.isAction) {
      onClearDrawings();
    } else {
      onSelectTool(item.overlayName);
    }
    onClose();
  };

  // Generador de caminos SVG para los sectores continuos (gap = 0)
  const createContinuousSectorPath = (aStartDeg: number, aEndDeg: number, innerR: number, outerR: number) => {
    const a1 = (aStartDeg * Math.PI) / 180;
    const a2 = (aEndDeg * Math.PI) / 180;

    const x1 = cx + innerR * Math.cos(a1);
    const y1 = cy + innerR * Math.sin(a1);
    const x2 = cx + outerR * Math.cos(a1);
    const y2 = cy + outerR * Math.sin(a1);
    const x3 = cx + outerR * Math.cos(a2);
    const y3 = cy + outerR * Math.sin(a2);
    const x4 = cx + innerR * Math.cos(a2);
    const y4 = cy + innerR * Math.sin(a2);

    const largeArc = aEndDeg - aStartDeg > 180 ? 1 : 0;

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1} Z`;
  };

  // Micro-marcas perimetrales estilo cronómetro institucional
  const numOuterTicks = 29;

  // Cálculo de posicionamiento adaptativo: centrado en el punto del toque
  // con CLAMPING estricto para que NUNCA se corte ni se rompa en los bordes
  const radius = size / 2;
  const margin = 10;
  const winW = typeof window !== 'undefined' ? window.innerWidth : 360;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 640;

  const targetX = position ? position.x : winW / 2;
  const targetY = position ? position.y : winH / 2;

  const clampedX = Math.max(radius + margin, Math.min(winW - radius - margin, targetX));
  const clampedY = Math.max(radius + margin, Math.min(winH - radius - margin, targetY));

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      {/* CAPA DE CIERRE AL TOCAR FUERA (100% TRANSPARENTE, SIN FONDO OSCURO) */}
      <div className="absolute inset-0 pointer-events-auto" onClick={onClose} />

      {/* CONTENEDOR PRINCIPAL FLOTANTE EN EL LUGAR EXACTO CON CLAMPING ANTI-ROTURA */}
      <div 
        className="absolute pointer-events-auto"
        style={{ 
          width: size, 
          height: size,
          left: `${clampedX}px`,
          top: `${clampedY}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <svg 
          width={size} 
          height={size} 
          className="absolute inset-0 overflow-visible"
        >
          <defs>
            <filter id="dialCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="dialRedGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* MICRO-MARCAS PERIMETRALES EXTERIORES (CRONÓMETRO DE PRECISIÓN) */}
          {Array.from({ length: numOuterTicks }).map((_, i) => {
            const tickAngle = (startAngle + (i / (numOuterTicks - 1)) * sweepAngle) * (Math.PI / 180);
            const isMajor = i % 4 === 0;
            const tInner = rMax + 2;
            const tOuter = rMax + (isMajor ? 5.5 : 3.5);
            return (
              <line
                key={`tick-${i}`}
                x1={cx + tInner * Math.cos(tickAngle)}
                y1={cy + tInner * Math.sin(tickAngle)}
                x2={cx + tOuter * Math.cos(tickAngle)}
                y2={cy + tOuter * Math.sin(tickAngle)}
                stroke={isMajor ? 'rgba(0, 240, 255, 0.6)' : 'rgba(0, 240, 255, 0.2)'}
                strokeWidth={isMajor ? 1.25 : 0.75}
              />
            );
          })}

          {/* ANILLO CONTINUO INTEGRADO (SIN SEPARACIONES ENTRE HERRAMIENTAS) */}
          {WHEEL_ITEMS.map((item, idx) => {
            const aStart = startAngle + idx * sectorStep;
            const aEnd = aStart + sectorStep;
            const aMid = (aStart + aEnd) / 2;

            const radMid = (aMid * Math.PI) / 180;
            const iconX = cx + rIcon * Math.cos(radMid);
            const iconY = cy + rIcon * Math.sin(radMid);

            const isSectorLoaded = currentAngle >= aStart;
            const isHovered = hoveredItem?.id === item.id;
            const isCurrentActive = activeTool === item.overlayName;
            const isTrash = item.isAction;

            const pathD = createContinuousSectorPath(aStart, aEnd, rMin, rMax);
            const sectorColor = crmColors[idx];

            let fillColor = '#0D1524';
            let fillOpacity = 0.45;
            let strokeColor = 'rgba(6, 11, 20, 0.75)';
            let strokeWidth = 0.75;

            if (isHovered || isCurrentActive) {
              fillColor = sectorColor;
              fillOpacity = 1;
              strokeColor = '#FFFFFF';
              strokeWidth = 1.75;
            } else if (isSectorLoaded) {
              fillColor = sectorColor;
              fillOpacity = 0.92;
              strokeColor = 'rgba(6, 11, 20, 0.65)';
              strokeWidth = 1;
            }

            return (
              <g 
                key={item.id}
                className="cursor-pointer transition-all duration-150 active:opacity-85"
                onClick={() => handleExecuteItem(item)}
                onPointerEnter={() => setHoveredItem(item)}
              >
                {/* Sector del anillo continuo */}
                <path
                  d={pathD}
                  fill={fillColor}
                  fillOpacity={fillOpacity}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  filter={isHovered ? (isTrash ? 'url(#dialRedGlow)' : 'url(#dialCyanGlow)') : undefined}
                />

                {/* Icono centrado con micro-alineación óptica */}
                <foreignObject
                  x={iconX - 9.5}
                  y={iconY - 9.5}
                  width={19}
                  height={19}
                  className="pointer-events-none"
                >
                  <div className={`w-full h-full flex items-center justify-center transition-transform ${
                    isHovered || isCurrentActive 
                      ? (isTrash ? 'text-white scale-110 font-bold' : 'text-slate-950 scale-110 font-bold') 
                      : (isTrash ? 'text-white' : 'text-slate-950 font-semibold')
                  }`}>
                    {renderIcon(item.iconName, 'w-3.5 h-3.5')}
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* AGUJA / DESTELLO LÁSER DE PRECISIÓN EN EL BARRIDO INICIAL */}
          {animPercent < 99 && (
            <line
              x1={cx + (rMin - 2) * Math.cos((currentAngle * Math.PI) / 180)}
              y1={cy + (rMin - 2) * Math.sin((currentAngle * Math.PI) / 180)}
              x2={cx + (rMax + 5) * Math.cos((currentAngle * Math.PI) / 180)}
              y2={cy + (rMax + 5) * Math.sin((currentAngle * Math.PI) / 180)}
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#dialCyanGlow)"
            />
          )}

          {/* NÚCLEO CENTRAL CON BISEL Y DOBLE ANILLO DE CRISTAL OBSIDIANA */}
          <circle
            cx={cx}
            cy={cy}
            r={rMin - 1}
            fill="#060B14"
            stroke="#00F0FF"
            strokeWidth="1.25"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.45))'
            }}
          />
          <circle
            cx={cx}
            cy={cy}
            r={rMin - 6}
            fill="none"
            stroke="rgba(0, 240, 255, 0.25)"
            strokeWidth="0.75"
            strokeDasharray="2 2"
          />
        </svg>

        {/* NÚCLEO CENTRAL CON MICRO-TIPOGRAFÍA Y ESTADO DE HERRAMIENTA */}
        <div 
          onClick={() => handleExecuteItem(hoveredItem)}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto cursor-pointer z-30"
          style={{
            margin: 'auto',
            width: `${(rMin - 3) * 2}px`,
            height: `${(rMin - 3) * 2}px`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%'
          }}
        >
          <div className={hoveredItem.isAction ? 'text-red-400 animate-pulse' : 'text-cyan-400 animate-pulse'}>
            {renderIcon(hoveredItem.iconName, 'w-4 h-4')}
          </div>

          {/* NOMBRE DE LA HERRAMIENTA */}
          <div className="text-[9px] font-mono font-black text-white text-center leading-tight tracking-wider uppercase px-1 mt-0.5 truncate max-w-[80px]">
            {isEs ? hoveredItem.shortLabelEs : hoveredItem.shortLabelEn}
          </div>

          {/* MICRO-INSIGNIA INSTITUCIONAL */}
          <div className={`text-[7px] font-mono font-bold tracking-widest mt-1 px-2 py-0.5 rounded-full border ${
            hoveredItem.isAction
              ? 'text-red-300 border-red-500/60 bg-red-950/85 shadow-[0_0_6px_rgba(239,68,68,0.4)]'
              : 'text-cyan-300 border-cyan-500/60 bg-cyan-950/85 shadow-[0_0_6px_rgba(0,240,255,0.4)]'
          }`}>
            {hoveredItem.isAction 
              ? (isEs ? 'BORRAR' : 'CLEAR')
              : (isEs ? 'ACTIVAR' : 'SELECT')
            }
          </div>
        </div>
      </div>
    </div>
  );
};
