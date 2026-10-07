import { registerOverlay } from 'klinecharts';

export interface DrawingToolItem {
  id: string;
  name: string;
  nameEs: string;
  overlayName: string;
  iconName: 'TrendingUp' | 'MoveHorizontal' | 'ArrowRight' | 'Square' | 'AlignJustify' | 'Layers';
  category: 'line' | 'shape' | 'fibonacci';
  descriptionEs: string;
  descriptionEn: string;
}

export const DRAWING_TOOLS: DrawingToolItem[] = [
  {
    id: 'trend_line',
    name: 'Trend Line',
    nameEs: 'Línea de Tendencia',
    overlayName: 'segment',
    iconName: 'TrendingUp',
    category: 'line',
    descriptionEs: 'Directriz dinámica entre 2 puntos',
    descriptionEn: 'Dynamic directional line between 2 points'
  },
  {
    id: 'horizontal_line',
    name: 'Horizontal Line',
    nameEs: 'Línea Horizontal',
    overlayName: 'horizontalStraightLine',
    iconName: 'MoveHorizontal',
    category: 'line',
    descriptionEs: 'Soporte / Resistencia infinita',
    descriptionEn: 'Infinite support / resistance level'
  },
  {
    id: 'horizontal_ray',
    name: 'Horizontal Ray',
    nameEs: 'Semirrecta Horizontal',
    overlayName: 'horizontalRayLine',
    iconName: 'ArrowRight',
    category: 'line',
    descriptionEs: 'Nivel proyectado hacia adelante',
    descriptionEn: 'Level projected forward in time'
  },
  {
    id: 'rect',
    name: 'Order Block / Box',
    nameEs: 'Cuadro (Order Block)',
    overlayName: 'rect',
    iconName: 'Square',
    category: 'shape',
    descriptionEs: 'Zona de liquidez o bloque de órdenes',
    descriptionEn: 'Liquidity zone or order block box'
  },
  {
    id: 'parallel_channel',
    name: 'Parallel Channel',
    nameEs: 'Canal Paralelo',
    overlayName: 'parallelStraightLine',
    iconName: 'AlignJustify',
    category: 'line',
    descriptionEs: 'Canales paralelos equidistantes',
    descriptionEn: 'Equidistant parallel price channels'
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci Retracement',
    nameEs: 'Retroceso Fibonacci',
    overlayName: 'fibonacciLine',
    iconName: 'Layers',
    category: 'fibonacci',
    descriptionEs: 'Niveles áureos 0.382, 0.5, 0.618',
    descriptionEn: 'Golden ratio retracement levels'
  }
];

let isCustomOverlaysRegistered = false;

/**
 * Registra figuras y overlays personalizados en KLineChart (ej. Rectángulo / Order Block)
 */
export function registerCustomChartOverlays() {
  if (isCustomOverlaysRegistered) return;
  try {
    registerOverlay({
      name: 'rect',
      totalStep: 3,
      needDefaultPointFigure: true,
      needDefaultXAxisFigure: false,
      needDefaultYAxisFigure: false,
      createPointFigures: ({ coordinates }: any) => {
        if (coordinates && coordinates.length > 1) {
          return [{
            type: 'rect',
            attrs: {
              x: Math.min(coordinates[0].x, coordinates[1].x),
              y: Math.min(coordinates[0].y, coordinates[1].y),
              width: Math.abs(coordinates[0].x - coordinates[1].x),
              height: Math.abs(coordinates[0].y - coordinates[1].y)
            },
            styles: {
              style: 'stroke_fill',
              color: 'rgba(59, 130, 246, 0.14)',
              borderColor: '#2563eb',
              borderSize: 1.25,
              borderRadius: 2
            }
          }];
        }
        return [];
      }
    });

    // Override de Fibonacci: Delimitado entre el punto de inicio y el punto donde se mueve el ratón
    registerOverlay({
      name: 'fibonacciLine',
      totalStep: 3,
      needDefaultPointFigure: true,
      needDefaultXAxisFigure: true,
      needDefaultYAxisFigure: true,
      createPointFigures: ({ coordinates, overlay }: any) => {
        const points = overlay?.points;
        if (!coordinates || coordinates.length < 2 || !points || points.length < 2) return [];

        const p0Val = points[0]?.value;
        const p1Val = points[1]?.value;
        if (typeof p0Val !== 'number' || typeof p1Val !== 'number') return [];

        const startX = coordinates[0].x;
        const endX = coordinates[1].x;
        const leftX = Math.min(startX, endX);
        const rightX = Math.max(startX, endX);
        const width = Math.max(rightX - leftX, 20);

        const yDif = coordinates[0].y - coordinates[1].y;
        const valueDif = p0Val - p1Val;

        const levels = [
          { percent: 1, color: '#787b86' },
          { percent: 0.786, color: '#2962ff' },
          { percent: 0.618, color: '#00bcd4' },
          { percent: 0.5, color: '#10b981' },
          { percent: 0.382, color: '#f59e0b' },
          { percent: 0.236, color: '#ef4444' },
          { percent: 0, color: '#787b86' }
        ];

        const lines: any[] = [];
        const texts: any[] = [];

        // Zona áurea destacada (0.382 a 0.618)
        const y0382 = coordinates[1].y + yDif * 0.382;
        const y0618 = coordinates[1].y + yDif * 0.618;
        const goldenZone = [{
          type: 'polygon',
          attrs: {
            coordinates: [
              { x: leftX, y: y0382 },
              { x: rightX, y: y0382 },
              { x: rightX, y: y0618 },
              { x: leftX, y: y0618 }
            ]
          },
          styles: {
            style: 'fill',
            color: 'rgba(245, 158, 11, 0.08)'
          }
        }];

        levels.forEach(({ percent }) => {
          const y = coordinates[1].y + yDif * percent;
          const val = p1Val + valueDif * percent;
          const formattedVal = val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          // Línea horizontal delimitada exactamente entre leftX y rightX
          lines.push({
            coordinates: [
              { x: leftX, y },
              { x: rightX, y }
            ]
          });

          // Etiqueta de porcentaje y precio en el extremo derecho delimitado
          texts.push({
            x: rightX + 4,
            y: y - 2,
            text: `${(percent * 100).toFixed(1)}% (${formattedVal})`,
            baseline: 'bottom',
            align: 'left'
          });
        });

        return [
          ...goldenZone,
          {
            type: 'line',
            attrs: lines,
            styles: {
              style: 'stroke',
              size: 1.25,
              color: '#3b82f6',
              dashedValue: [4, 4]
            }
          },
          {
            type: 'text',
            isCheckEvent: false,
            attrs: texts,
            styles: {
              color: '#64748b',
              size: 10,
              family: 'monospace'
            }
          }
        ];
      }
    });

    isCustomOverlaysRegistered = true;
  } catch (err) {
    console.warn('[ZYTI Trade] Error registrando overlays personalizados:', err);
  }
}

// Auto-ejecución inmediata para asegurar que los overlays estén listos
registerCustomChartOverlays();
