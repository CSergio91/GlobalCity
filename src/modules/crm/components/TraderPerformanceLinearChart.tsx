import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  RotateCcw, 
  Calendar, 
  TrendingUp, 
  MousePointer,
  Sparkles,
  Maximize2,
  SlidersHorizontal
} from 'lucide-react';
import { TraderTradeAuditItem } from '../types/crm.types';

export interface TraderPerformanceLinearChartProps {
  initialBalance: number;
  currentBalance: number;
  equity: number;
  profitTargetAmount: number;
  maxDailyLossAmount: number;
  maxTotalLossAmount: number;
  trades: TraderTradeAuditItem[];
  isEs?: boolean;
  height?: number;
  selectedDay?: string | null;
  onSelectDay?: (dayKey: string | null) => void;
}

interface DataPoint {
  id: string;
  timestamp: number;
  balance: number;
  pnl?: number;
  tradeInfo?: string;
  symbol?: string;
  side?: string;
  dateKey: string;     // YYYY-MM-DD
  dayLabel: string;    // DD/MM
  timeLabel: string;   // HH:mm
}

interface BezierCoord {
  x: number;
  y: number;
  point: DataPoint;
}

/**
 * Generador de curva Bézier cúbica suave continua (Catmull-Rom a Bézier)
 * Produce olas orgánicas, continuas y elegantes sin picos cortados.
 */
function generateSmoothBezier(pts: BezierCoord[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  if (pts.length === 2) {
    const cpX = (pts[0].x + pts[1].x) / 2;
    return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} C ${cpX.toFixed(1)} ${pts[0].y.toFixed(1)}, ${cpX.toFixed(1)} ${pts[1].y.toFixed(1)}, ${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}`;
  }

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : pts.length - 1];

    const tension = 0.25;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

export const TraderPerformanceLinearChart: React.FC<TraderPerformanceLinearChartProps> = ({
  initialBalance = 100000,
  currentBalance = 100000,
  equity = 100000,
  profitTargetAmount = 10000,
  maxDailyLossAmount = 4000,
  maxTotalLossAmount = 6000,
  trades = [],
  isEs = true,
  height = 430,
  selectedDay = null,
  onSelectDay
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartCardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1000);

  // Estados de Zoom & Pan interactivos vía Scroll y Arrastre
  const [zoomRange, setZoomRange] = useState<{ startRatio: number; endRatio: number }>({ startRatio: 0, endRatio: 1 });
  const [activeFilter, setActiveFilter] = useState<'ALL' | '1D' | '3D' | '7D' | '15D'>('ALL');
  
  // Arrastre horizontal interactivo para navegar en el tiempo cuando está en zoom
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStartX, setPanStartX] = useState<number | null>(null);
  const [panStartRange, setPanStartRange] = useState<{ startRatio: number; endRatio: number }>({ startRatio: 0, endRatio: 1 });

  // Hover Tooltip sobre la curva
  const [hoveredPoint, setHoveredPoint] = useState<{ point: DataPoint; x: number; y: number } | null>(null);

  // Medir ancho dinámico del contenedor de manera reactiva
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const measured = containerRef.current.clientWidth;
        if (measured > 300) {
          setContainerWidth(measured);
        }
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // 1. Niveles Clave Institucionales
  const targetPrice = initialBalance + profitTargetAmount;
  const bePrice = initialBalance;
  // Límite máximo absoluto de Drawdown que puede tener el trader (SL Max DD)
  const maxTotalLossLimitPrice = initialBalance - maxTotalLossAmount;
  // Límite de pérdida diaria
  const dailyLossLimitPrice = initialBalance - maxDailyLossAmount;
  
  // 2. Construcción de los Puntos de la Serie Temporal y Balance en Vivo
  const { allPoints, effectiveLivePrice } = useMemo(() => {
    const closedTrades = trades
      .filter(t => (t.status === 'CLOSED' || !t.status) && (t.closedAt || t.openedAt))
      .sort((a, b) => new Date(a.closedAt || a.openedAt).getTime() - new Date(b.closedAt || b.openedAt).getTime());

    const now = Date.now();

    // Suma real de trades cerrados
    let runningBal = initialBalance;
    const pts: DataPoint[] = [];

    if (closedTrades.length > 0) {
      const firstTradeTs = new Date(closedTrades[0].openedAt || closedTrades[0].closedAt!).getTime() - 1000 * 60 * 30;
      const dInit = new Date(firstTradeTs);

      pts.push({
        id: 'pt-zero',
        timestamp: firstTradeTs,
        balance: initialBalance,
        dateKey: dInit.toISOString().slice(0, 10),
        dayLabel: `${String(dInit.getDate()).padStart(2, '0')}/${String(dInit.getMonth() + 1).padStart(2, '0')}`,
        timeLabel: dInit.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tradeInfo: isEs ? 'Apertura de Cuenta (Base BE)' : 'Account Base (BE)'
      });

      closedTrades.forEach((tr, idx) => {
        const pnl = Number(tr.realizedPnl ?? 0);
        runningBal = Number((runningBal + pnl).toFixed(2));
        const ts = new Date(tr.closedAt || tr.openedAt).getTime();
        const d = new Date(ts);

        pts.push({
          id: tr.id || `tr-${idx}`,
          timestamp: ts,
          balance: runningBal,
          pnl,
          symbol: tr.symbol,
          side: tr.side,
          dateKey: d.toISOString().slice(0, 10),
          dayLabel: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
          timeLabel: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tradeInfo: `${tr.symbol} (${tr.side}) ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`
        });
      });
    }

    // Saldo efectivo en vivo
    const liveBal = equity !== undefined && equity !== null && Math.abs(equity - initialBalance) > 0.001
      ? equity 
      : (currentBalance !== undefined && Math.abs(currentBalance - initialBalance) > 0.001 ? currentBalance : runningBal);

    // Si no había trades, generar una serie temporal demostrativa suave
    if (pts.length === 0) {
      const p1Ts = now - 1000 * 60 * 60 * 48;
      const p2Ts = now - 1000 * 60 * 60 * 24;
      const delta = liveBal - initialBalance;
      const d1 = new Date(p1Ts);
      const d2 = new Date(p2Ts);
      const dNow = new Date(now);

      pts.push(
        {
          id: 'pt-init',
          timestamp: p1Ts,
          balance: initialBalance,
          dateKey: d1.toISOString().slice(0, 10),
          dayLabel: `${String(d1.getDate()).padStart(2, '0')}/${String(d1.getMonth() + 1).padStart(2, '0')}`,
          timeLabel: d1.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tradeInfo: isEs ? 'Apertura de Cuenta (Base BE)' : 'Account Opening (BE)'
        },
        {
          id: 'pt-mid',
          timestamp: p2Ts,
          balance: Number((initialBalance + delta * 0.45).toFixed(2)),
          pnl: delta * 0.45,
          dateKey: d2.toISOString().slice(0, 10),
          dayLabel: `${String(d2.getDate()).padStart(2, '0')}/${String(d2.getMonth() + 1).padStart(2, '0')}`,
          timeLabel: d2.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tradeInfo: isEs ? 'Evolución de Sesión' : 'Session Evolution'
        },
        {
          id: 'pt-now',
          timestamp: now,
          balance: liveBal,
          pnl: delta,
          dateKey: dNow.toISOString().slice(0, 10),
          dayLabel: `${String(dNow.getDate()).padStart(2, '0')}/${String(dNow.getMonth() + 1).padStart(2, '0')}`,
          timeLabel: dNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tradeInfo: isEs ? `Balance en Vivo: $${liveBal.toLocaleString()}` : `Live Balance: $${liveBal.toLocaleString()}`
        }
      );
    } else {
      // Conectar con el momento actual en vivo
      const lastTs = pts[pts.length - 1].timestamp;
      if (now - lastTs > 1000 * 60 * 3 || Math.abs(pts[pts.length - 1].balance - liveBal) > 0.001) {
        const dNow = new Date(now);
        pts.push({
          id: 'pt-live-now',
          timestamp: now,
          balance: liveBal,
          pnl: liveBal - initialBalance,
          dateKey: dNow.toISOString().slice(0, 10),
          dayLabel: `${String(dNow.getDate()).padStart(2, '0')}/${String(dNow.getMonth() + 1).padStart(2, '0')}`,
          timeLabel: dNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tradeInfo: isEs ? `Balance en Vivo: $${liveBal.toLocaleString()}` : `Live Balance: $${liveBal.toLocaleString()}`
        });
      }
    }

    return { allPoints: pts, effectiveLivePrice: liveBal };
  }, [trades, initialBalance, currentBalance, equity, isEs]);

  const livePrice = effectiveLivePrice;
  const totalProfitUsd = Number((livePrice - initialBalance).toFixed(2));
  const totalProfitPct = Number(((totalProfitUsd / initialBalance) * 100).toFixed(2));

  // Lista de Días Únicos presentes en el dataset
  const uniqueDays = useMemo(() => {
    const map = new Map<string, { dateKey: string; dayLabel: string; startTs: number; endTs: number }>();
    allPoints.forEach(p => {
      const cur = map.get(p.dateKey);
      if (!cur) {
        map.set(p.dateKey, { dateKey: p.dateKey, dayLabel: p.dayLabel, startTs: p.timestamp, endTs: p.timestamp });
      } else {
        cur.startTs = Math.min(cur.startTs, p.timestamp);
        cur.endTs = Math.max(cur.endTs, p.timestamp);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.startTs - b.startTs);
  }, [allPoints]);

  // Si selectedDay cambia desde fuera, enfocar ese día en el zoom
  useEffect(() => {
    if (!selectedDay || uniqueDays.length === 0) return;
    const dayObj = uniqueDays.find(d => d.dateKey === selectedDay);
    if (dayObj && allPoints.length > 1) {
      const minTs = allPoints[0].timestamp;
      const maxTs = allPoints[allPoints.length - 1].timestamp;
      const span = maxTs - minTs;
      if (span > 0) {
        const startRatio = Math.max(0, (dayObj.startTs - minTs - 1000 * 60 * 30) / span);
        const endRatio = Math.min(1, (dayObj.endTs - minTs + 1000 * 60 * 30) / span);
        setZoomRange({ startRatio, endRatio });
        setActiveFilter('ALL');
      }
    }
  }, [selectedDay, uniqueDays, allPoints]);

  // 3. Filtrado de Puntos visibles según el Zoom actual
  const visiblePoints: DataPoint[] = useMemo(() => {
    if (allPoints.length <= 1) return allPoints;
    const startIndex = Math.floor(zoomRange.startRatio * (allPoints.length - 1));
    const endIndex = Math.ceil(zoomRange.endRatio * (allPoints.length - 1));
    const subset = allPoints.slice(Math.max(0, startIndex), Math.min(allPoints.length, endIndex + 1));
    return subset.length >= 2 ? subset : allPoints;
  }, [allPoints, zoomRange]);

  // 4. Dimensiones del SVG y márgenes
  const width = Math.max(680, containerWidth);
  const paddingLeft = 198;  // Espacio a la IZQUIERDA para montos de TP, BE, SL y Profit con badges más grandes y legibles
  const paddingRight = 45;   // Margen derecho
  const paddingTop = 42;    // Margen superior holgado para que TP Target nunca quede cortado
  const paddingBottom = 48; // Margen inferior para Días y Eje X
  const chartWidth = Math.max(100, width - paddingLeft - paddingRight);
  const chartHeight = Math.max(100, height - paddingTop - paddingBottom);

  // 5. Escala Vertical Y Institucional: RANGO COMPLETO SIEMPRE VISIBLE
  // Enmarca SIEMPRE el TP Target arriba, el SL Max DD abajo, el BE al centro y todos los puntos de la curva
  const { yMin, yMax } = useMemo(() => {
    const ptValues = visiblePoints.map(p => p.balance);
    const minPt = Math.min(...ptValues, livePrice, bePrice);
    const maxPt = Math.max(...ptValues, livePrice, bePrice);

    // Asegurar que el límite de DD (SL Max DD), el Target (TP), el BE y la curva queden SIEMPRE 100% dentro del lienzo visible
    const rawMin = Math.min(maxTotalLossLimitPrice, dailyLossLimitPrice, minPt);
    const rawMax = Math.max(targetPrice, maxPt);
    const totalSpan = rawMax - rawMin;
    const margin = Math.max(totalSpan * 0.09, initialBalance * 0.015);

    return {
      yMin: rawMin - margin,
      yMax: rawMax + margin
    };
  }, [visiblePoints, livePrice, bePrice, targetPrice, maxTotalLossLimitPrice, dailyLossLimitPrice, initialBalance]);

  const getY = useCallback((val: number) => {
    if (yMax === yMin) return paddingTop + chartHeight / 2;
    const ratio = (val - yMin) / (yMax - yMin);
    return paddingTop + chartHeight * (1 - ratio);
  }, [yMin, yMax, paddingTop, chartHeight]);

  const getX = useCallback((index: number) => {
    if (visiblePoints.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (visiblePoints.length - 1)) * chartWidth;
  }, [visiblePoints.length, paddingLeft, chartWidth]);

  // Coordenadas Y de los Niveles Clave
  const beY = getY(bePrice);
  const targetY = getY(targetPrice);
  const currentY = getY(livePrice);
  const maxLossY = getY(maxTotalLossLimitPrice);
  const dailyLossY = getY(dailyLossLimitPrice);

  // Posición porcentual de la línea BE dentro del viewport (0 a 100%) para gradientes divididos dinámicos
  const beRatio = Math.max(0, Math.min(1, beY / height));
  const bePercentNum = beRatio * 100;
  const bePercentLow = Math.max(0, bePercentNum - 0.1).toFixed(2);
  const bePercentHigh = Math.min(100, bePercentNum + 0.1).toFixed(2);

  // Coordenadas Bézier de todos los puntos visibles
  const bezierCoords: BezierCoord[] = useMemo(() => {
    return visiblePoints.map((pt, i) => ({
      x: getX(i),
      y: getY(pt.balance),
      point: pt
    }));
  }, [visiblePoints, getX, getY]);

  // Generar ruta suave de la curva continua
  const smoothCurvePath = useMemo(() => {
    return generateSmoothBezier(bezierCoords);
  }, [bezierCoords]);

  // Rutas de Área Sombreada continua desde la curva hasta la línea BE
  const firstX = bezierCoords.length > 0 ? bezierCoords[0].x : paddingLeft;
  const lastX = bezierCoords.length > 0 ? bezierCoords[bezierCoords.length - 1].x : width - paddingRight;
  const areaPath = `${smoothCurvePath} L ${lastX.toFixed(1)} ${beY.toFixed(1)} L ${firstX.toFixed(1)} ${beY.toFixed(1)} Z`;

  // 6. Detección Inteligente del Punto Más Alto (ATH / Máximo Rendimiento) y Punto Más Bajo (Máximo Drawdown)
  const { peakCoord, troughCoord, peakProfitUsd, peakProfitPct, troughDdUsd, troughDdPct, hasDistinctExtreme } = useMemo(() => {
    if (bezierCoords.length === 0) {
      return {
        peakCoord: null,
        troughCoord: null,
        peakProfitUsd: 0,
        peakProfitPct: 0,
        troughDdUsd: 0,
        troughDdPct: 0,
        hasDistinctExtreme: false
      };
    }

    let maxPt = bezierCoords[0];
    let minPt = bezierCoords[0];

    for (const c of bezierCoords) {
      if (c.point.balance > maxPt.point.balance) {
        maxPt = c;
      }
      if (c.point.balance < minPt.point.balance) {
        minPt = c;
      }
    }

    const pUsd = maxPt.point.balance - bePrice;
    const pPct = bePrice > 0 ? (pUsd / bePrice) * 100 : 0;

    const tUsd = minPt.point.balance - bePrice;
    const tPct = bePrice > 0 ? (tUsd / bePrice) * 100 : 0;

    const hasExtremes = Math.abs(maxPt.point.balance - minPt.point.balance) > 0.01;

    return {
      peakCoord: maxPt,
      troughCoord: minPt,
      peakProfitUsd: pUsd,
      peakProfitPct: pPct,
      troughDdUsd: tUsd,
      troughDdPct: tPct,
      hasDistinctExtreme: hasExtremes
    };
  }, [bezierCoords, bePrice]);

  // 6. Generación de Ticks para el Eje X (Días)
  const xDayTicks = useMemo(() => {
    if (visiblePoints.length === 0) return [];
    const ticks: { x: number; dayLabel: string; timeLabel: string; isDayStart: boolean; dateKey: string }[] = [];
    let lastDateKey = '';

    visiblePoints.forEach((pt, idx) => {
      const x = getX(idx);
      const isDayStart = pt.dateKey !== lastDateKey;
      if (isDayStart || idx === 0 || idx === visiblePoints.length - 1) {
        ticks.push({
          x,
          dayLabel: pt.dayLabel,
          timeLabel: pt.timeLabel,
          isDayStart,
          dateKey: pt.dateKey
        });
        lastDateKey = pt.dateKey;
      }
    });

    return ticks;
  }, [visiblePoints, getX]);

  // 7. Zoom Interactivo con Rueda del Ratón (Wheel Scroll Zoom) SIN AFECTAR EL SCROLL DE LA PÁGINA
  useEffect(() => {
    const el = chartCardRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      // Bloquear 100% el scroll de la página web al hacer zoom en el gráfico
      e.preventDefault();
      e.stopPropagation();

      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      if (mouseX < paddingLeft || mouseX > width - paddingRight) return;

      const mouseRatio = (mouseX - paddingLeft) / chartWidth;
      const currentSpan = zoomRange.endRatio - zoomRange.startRatio;
      
      // Zoom suave exponencial
      const zoomMultiplier = e.deltaY < 0 ? 0.82 : 1.22;
      const newSpan = Math.min(1, Math.max(0.015, currentSpan * zoomMultiplier));

      const cursorAbsRatio = zoomRange.startRatio + mouseRatio * currentSpan;
      const newStart = Math.max(0, Math.min(1 - newSpan, cursorAbsRatio - mouseRatio * newSpan));
      const newEnd = Math.min(1, newStart + newSpan);

      setZoomRange({ startRatio: newStart, endRatio: newEnd });
    };

    el.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheelNative);
    };
  }, [width, paddingLeft, paddingRight, chartWidth, zoomRange]);

  // Arrastre horizontal para desplazar la ventana temporal (Pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    if (mouseX >= paddingLeft && mouseX <= width - paddingRight) {
      setIsPanning(true);
      setPanStartX(mouseX);
      setPanStartRange(zoomRange);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    if (isPanning && panStartX !== null) {
      const deltaPx = mouseX - panStartX;
      const currentSpan = panStartRange.endRatio - panStartRange.startRatio;
      const deltaRatio = -(deltaPx / chartWidth) * currentSpan;

      const newStart = Math.max(0, Math.min(1 - currentSpan, panStartRange.startRatio + deltaRatio));
      const newEnd = newStart + currentSpan;

      setZoomRange({ startRatio: newStart, endRatio: newEnd });
    } else {
      // Detección de punto más cercano para el Tooltip interactivo
      if (mouseX >= paddingLeft && mouseX <= width - paddingRight && bezierCoords.length > 0) {
        let closest = bezierCoords[0];
        let minDist = Infinity;
        bezierCoords.forEach(c => {
          const dist = Math.abs(c.x - mouseX);
          if (dist < minDist) {
            minDist = dist;
            closest = c;
          }
        });
        if (minDist < 45) {
          setHoveredPoint({ point: closest.point, x: closest.x, y: closest.y });
        } else {
          setHoveredPoint(null);
        }
      } else {
        setHoveredPoint(null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setPanStartX(null);
  };

  const handleResetZoom = () => {
    setZoomRange({ startRatio: 0, endRatio: 1 });
    setActiveFilter('ALL');
    onSelectDay?.(null);
  };

  const handleApplyPreset = (preset: 'ALL' | '1D' | '3D' | '7D' | '15D') => {
    setActiveFilter(preset);
    if (preset === 'ALL') {
      setZoomRange({ startRatio: 0, endRatio: 1 });
      return;
    }

    const daysCount = parseInt(preset);
    const msSpan = daysCount * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const startTargetTs = now - msSpan;

    if (allPoints.length <= 1) return;
    const minTs = allPoints[0].timestamp;
    const maxTs = allPoints[allPoints.length - 1].timestamp;
    const totalSpan = maxTs - minTs;

    if (totalSpan <= 0) return;
    const startRatio = Math.max(0, (startTargetTs - minTs) / totalSpan);
    setZoomRange({ startRatio, endRatio: 1 });
  };

  // Nivel de Zoom actual en porcentaje
  const zoomPercent = Math.round(100 / (zoomRange.endRatio - zoomRange.startRatio));

  // Formato monetario
  const fmt = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Lógica de separación vertical anti-colisión entre el badge de PROFIT y el badge de BASE BE
  const isNearBe = Math.abs(currentY - beY) < 34;
  const profitBadgeYOffset = isNearBe ? (livePrice >= bePrice ? -18 : 18) : 0;
  const beBadgeYOffset = isNearBe ? (livePrice >= bePrice ? 18 : -18) : 0;

  // Límite de pérdida SL siempre centrado en la línea roja de SL Max DD
  const slBadgeY = Math.max(paddingTop + 5, Math.min(maxLossY - 14, height - paddingBottom - 30));

  return (
    <div className="w-full select-none" ref={containerRef}>
      {/* ==================================================================== */}
      {/* 1. HEADER INSTITUCIONAL: CONTROLES DE ZOOM CON SCROLL & MODOS */}
      {/* ==================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3.5 mb-3 border-b border-[#ECE7DC] gap-3">
        {/* Título & Badge de PnL / Profit del Trader */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-600 to-slate-900 flex items-center justify-center text-white shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-[#0F172A] tracking-tight uppercase">
                {isEs ? 'Curva de Rendimiento' : 'Performance Curve'}
              </h4>
              <span className={`text-[10.5px] font-mono font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                totalProfitUsd >= 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                {totalProfitUsd >= 0 ? '+' : ''}${fmt(totalProfitUsd)} ({totalProfitPct >= 0 ? '+' : ''}{totalProfitPct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Controles: Presets de Días, Rango Completo y Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Indicador de Rango Completo Siempre Visible */}
          <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded-xl border border-emerald-300 bg-emerald-50/90 text-emerald-900 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isEs ? 'Rango Completo (SL / Target)' : 'Full Range (SL / Target)'}</span>
          </div>

          {/* Presets de Tiempo */}
          <div className="flex items-center bg-[#FAF8F5] border border-[#EBE5D8] rounded-xl p-0.5 shadow-2xs">
            {(['ALL', '15D', '7D', '3D', '1D'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => handleApplyPreset(preset)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  activeFilter === preset && zoomRange.startRatio === 0 && zoomRange.endRatio === 1 && preset === 'ALL'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : activeFilter === preset && preset !== 'ALL'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {preset === 'ALL' ? (isEs ? 'TODO' : 'ALL') : preset}
              </button>
            ))}
          </div>

          {/* Indicador de Nivel de Zoom & Botón de Reset */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#EBE5D8] rounded-xl px-2.5 py-1 shadow-2xs">
            <span className="text-[10px] font-mono font-black text-slate-700 min-w-[44px] text-center">
              {zoomPercent}%
            </span>
            {zoomPercent > 100 && (
              <button
                onClick={handleResetZoom}
                title={isEs ? 'Restablecer Escala' : 'Reset Scale'}
                className="p-0.5 rounded text-slate-500 hover:text-emerald-700 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selector de Chips de Días Específicos */}
      {uniqueDays.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 shrink-0 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            {isEs ? 'Días:' : 'Days:'}
          </span>
          {uniqueDays.map((d, dIdx) => {
            const isDaySelected = selectedDay === d.dateKey;
            return (
              <button
                key={d.dateKey}
                onClick={() => {
                  if (isDaySelected) {
                    handleResetZoom();
                  } else {
                    onSelectDay?.(d.dateKey);
                  }
                }}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-mono font-bold transition-all shrink-0 cursor-pointer border ${
                  isDaySelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                <span>{isEs ? `Día ${dIdx + 1}` : `Day ${dIdx + 1}`}</span>
                <span className="opacity-70 ml-1">({d.dayLabel})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. LIENZO DEL GRÁFICO (CON ZOOM POR SCROLL Y LÍNEAS SUAVES NO DISCONTINUAS) */}
      {/* ==================================================================== */}
      <div 
        ref={chartCardRef}
        className={`relative w-full rounded-3xl border border-[#E5DEC9] bg-[#FAF8F5]/30 backdrop-blur-xs p-1 shadow-2xs overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ overscrollBehavior: 'contain', touchAction: 'none' }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block font-sans"
          style={{ height: height }}
          preserveAspectRatio="none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            setHoveredPoint(null);
          }}
        >
          <defs>
            {/* Gradiente Dividido de la Curva: Verde (#059669) sobre BE, Rojo (#EF4444) bajo BE */}
            <linearGradient id="curveSplitStroke" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#059669" />
              <stop offset={`${bePercentLow}%`} stopColor="#059669" />
              <stop offset={`${bePercentHigh}%`} stopColor="#EF4444" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>

            {/* Gradiente Dividido del Área: Verde Esmeralda sobre BE, Rojo suave bajo BE */}
            <linearGradient id="curveSplitAreaGrad" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
              {/* Zona de Beneficios (Verde Esmeralda arriba de BE) */}
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.38" />
              <stop offset={`${Math.max(0, bePercentNum - 6).toFixed(1)}%`} stopColor="#059669" stopOpacity="0.12" />
              <stop offset={`${bePercentNum.toFixed(1)}%`} stopColor="#10B981" stopOpacity="0.0" />

              {/* Zona de Pérdidas / Drawdown (Rojo bajo BE) */}
              <stop offset={`${bePercentNum.toFixed(1)}%`} stopColor="#EF4444" stopOpacity="0.0" />
              <stop offset={`${Math.min(100, bePercentNum + 6).toFixed(1)}%`} stopColor="#EF4444" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.38" />
            </linearGradient>

            {/* Sombra Suave y Neutra para la Curva (No tiñe el rojo de verde ni viceversa) */}
            <filter id="curveSoftShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.16" />
            </filter>

            {/* Filtro Resplandeciente para el Faro de la Línea de Profits */}
            <filter id="profitGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00E5BE" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Rejilla de Fondo Sutil y Limpia */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={height - paddingBottom}
            stroke="#EBE5D8"
            strokeWidth={1}
          />
          <line
            x1={width - paddingRight}
            y1={paddingTop}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="#EBE5D8"
            strokeWidth={1}
          />

          {/* ================================================================ */}
          {/* RELLENO SUAVE BAJO LA CURVA (VERDE SOBRE BE, ROJO BAJO BE) */}
          {/* ================================================================ */}
          <path
            d={areaPath}
            fill="url(#curveSplitAreaGrad)"
          />

          {/* ================================================================ */}
          {/* TRAZO DE LA CURVA DE RENDIMIENTO: VERDE SOBRE BE, ROJO BAJO BE */}
          {/* ================================================================ */}
          <path
            d={smoothCurvePath}
            fill="none"
            stroke="url(#curveSplitStroke)"
            strokeWidth={3.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#curveSoftShadow)"
          />

          {/* ================================================================ */}
          {/* LÍNEAS DE REFERENCIA HORIZONTALES: SUAVES, CONTINUAS (NO DISCONTINUAS) */}
          {/* ================================================================ */}

          {/* 1. OBJETIVO DE BENEFICIO (TP - Verde Esmeralda Suave y Continuo) */}
          <line
            x1={paddingLeft}
            y1={targetY}
            x2={width - paddingRight}
            y2={targetY}
            stroke="#10B981"
            strokeWidth={1.8}
            strokeOpacity={0.85}
            strokeLinecap="round"
          />
          <g transform={`translate(${paddingLeft - 190}, ${targetY - 14})`}>
            <rect
              width="184"
              height="28"
              rx="7"
              fill="#10B981"
              className="drop-shadow-2xs"
            />
            <text x="10" y="18" className="text-[12px] font-mono font-black fill-white tracking-tight">
              ${fmt(targetPrice)}
            </text>
            <text x="106" y="18" className="text-[9.5px] font-sans font-black fill-white uppercase tracking-wider">
              | TP Target
            </text>
          </g>

          {/* 2. BASE BREAK-EVEN / BALANCE INICIAL (BE - Gris Carbón Suave y Continuo) */}
          <line
            x1={paddingLeft}
            y1={beY}
            x2={width - paddingRight}
            y2={beY}
            stroke="#94A3B8"
            strokeWidth={1.8}
            strokeOpacity={0.7}
            strokeLinecap="round"
          />
          <g transform={`translate(${paddingLeft - 190}, ${beY - 14 + beBadgeYOffset})`}>
            <rect
              width="184"
              height="28"
              rx="7"
              fill="#334155"
              className="drop-shadow-2xs"
            />
            <text x="10" y="18" className="text-[12px] font-mono font-black fill-white tracking-tight">
              ${fmt(bePrice)}
            </text>
            <text x="106" y="18" className="text-[9.5px] font-sans font-black fill-amber-300 uppercase tracking-wider">
              | BE Base
            </text>
          </g>

          {/* 3. LÍMITE DE PÉRDIDA MÁXIMA / DRAWDOWN TOTAL (SL - Rojo Carmín Suave y Continuo) */}
          <line
            x1={paddingLeft}
            y1={maxLossY}
            x2={width - paddingRight}
            y2={maxLossY}
            stroke="#EF4444"
            strokeWidth={1.8}
            strokeOpacity={0.85}
            strokeLinecap="round"
          />
          <g transform={`translate(${paddingLeft - 190}, ${slBadgeY})`}>
            <rect
              width="184"
              height="28"
              rx="7"
              fill="#DC2626"
              className="drop-shadow-2xs"
            />
            <text x="10" y="18" className="text-[12px] font-mono font-black fill-white tracking-tight">
              ${fmt(maxTotalLossLimitPrice)}
            </text>
            <text x="106" y="18" className="text-[9.5px] font-sans font-black fill-white uppercase tracking-wider">
              | SL Max DD
            </text>
          </g>

          {/* 3.1. LÍNEA OPCIONAL DE PÉRDIDA DIARIA (SL Diario - Punteada sutil si es diferente de Max DD) */}
          {dailyLossLimitPrice > maxTotalLossLimitPrice && dailyLossY < maxLossY - 20 && (
            <>
              <line
                x1={paddingLeft}
                y1={dailyLossY}
                x2={width - paddingRight}
                y2={dailyLossY}
                stroke="#F87171"
                strokeWidth={1.2}
                strokeDasharray="4 3"
                strokeOpacity={0.65}
              />
              <g transform={`translate(${paddingLeft - 190}, ${dailyLossY - 12})`}>
                <rect
                  width="184"
                  height="24"
                  rx="6"
                  fill="#7F1D1D"
                  opacity={0.85}
                />
                <text x="10" y="16" className="text-[11px] font-mono font-bold fill-white tracking-tight">
                  ${fmt(dailyLossLimitPrice)}
                </text>
                <text x="106" y="16" className="text-[8.5px] font-sans font-bold fill-rose-200 uppercase tracking-wider">
                  | SL Diario
                </text>
              </g>
            </>
          )}

          {/* ================================================================ */}
          {/* 4. LÍNEA DE PROFITS DEL TRADER: SIEMPRE VISIBLE, RESPLANDECIENTE, CONTINUA */}
          {/* ================================================================ */}
          <line
            x1={paddingLeft}
            y1={currentY}
            x2={width - paddingRight}
            y2={currentY}
            stroke={totalProfitUsd >= 0 ? "#059669" : "#F43F5E"}
            strokeWidth={2.4}
            strokeOpacity={0.95}
            strokeLinecap="round"
            filter="url(#profitGlow)"
          />

          {/* Badge Destacado de PROFIT en el Eje Vertical Izquierdo */}
          <g transform={`translate(${paddingLeft - 190}, ${currentY - 15 + profitBadgeYOffset})`}>
            <rect
              width="184"
              height="30"
              rx="8"
              fill={totalProfitUsd >= 0 ? "#047857" : "#DC2626"}
              stroke="#FFFFFF"
              strokeWidth={1.4}
              className="drop-shadow-md"
            />
            <text x="10" y="19" className="text-[12.5px] font-mono font-black fill-white tracking-tight">
              ${fmt(livePrice)}
            </text>
            <text x="106" y="19" className="text-[10px] font-mono font-black fill-amber-300 uppercase tracking-tight">
              {totalProfitUsd >= 0 ? `+${totalProfitPct}%` : `${totalProfitPct}%`}
            </text>
          </g>

          {/* Faro de Posición en Tiempo Real en el borde derecho (Estático, sin parpadeo) */}
          <g transform={`translate(${width - paddingRight}, ${currentY})`}>
            <circle r={7} fill={totalProfitUsd >= 0 ? "#10B981" : "#EF4444"} opacity={0.25} />
            <circle r={4.5} fill="#FFFFFF" stroke={totalProfitUsd >= 0 ? "#10B981" : "#EF4444"} strokeWidth={2} />
          </g>

          {/* ================================================================ */}
          {/* EJE X INFERIOR: DÍAS Y HORAS DE TRADING */}
          {/* ================================================================ */}
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="#DCD6CA"
            strokeWidth={1.5}
          />

          {xDayTicks.map((tick, tIdx) => {
            const isLast = tIdx === xDayTicks.length - 1;
            const isFirst = tIdx === 0;

            return (
              <g key={`day-tick-${tIdx}`}>
                <line
                  x1={tick.x}
                  y1={height - paddingBottom}
                  x2={tick.x}
                  y2={height - paddingBottom + (tick.isDayStart ? 8 : 4)}
                  stroke={tick.isDayStart ? '#475569' : '#CBD5E1'}
                  strokeWidth={tick.isDayStart ? 1.5 : 1}
                />

                <text
                  x={tick.x}
                  y={height - paddingBottom + 19}
                  textAnchor={isLast ? 'end' : isFirst ? 'start' : 'middle'}
                  className={`text-[10.5px] font-mono ${tick.isDayStart ? 'fill-slate-800 font-extrabold' : 'fill-slate-500 font-medium'}`}
                >
                  {tick.dayLabel}
                </text>

                {zoomPercent > 180 && (
                  <text
                    x={tick.x}
                    y={height - paddingBottom + 30}
                    textAnchor={isLast ? 'end' : isFirst ? 'start' : 'middle'}
                    className="text-[9px] font-mono fill-slate-400 font-bold"
                  >
                    {tick.timeLabel}
                  </text>
                )}
              </g>
            );
          })}

          {/* ================================================================ */}
          {/* PUNTOS CLAVE Y ANILLOS DE PULSO SOBRE LA CURVA */}
          {/* ================================================================ */}
          {bezierCoords.map((coord, idx) => {
            const isLast = idx === bezierCoords.length - 1;
            const isAbove = coord.point.balance >= bePrice;
            const isHovered = hoveredPoint?.point.id === coord.point.id;

            const shouldRenderDot = isLast || isHovered || zoomPercent > 240 || bezierCoords.length < 20;
            if (!shouldRenderDot) return null;

            return (
              <g key={`dot-${coord.point.id}-${idx}`}>
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isHovered ? 7 : isLast ? 5 : 3.5}
                  fill="#FFFFFF"
                  stroke={isAbove ? '#10B981' : '#EF4444'}
                  strokeWidth={isHovered ? 3.5 : 2}
                  className="transition-all duration-150"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                />
              </g>
            );
          })}

          {/* ================================================================ */}
          {/* HITOS EN LA CURVA: PUNTO MÁS ALTO Y PUNTO MÁS BAJO (ESTÁTICOS, SIN PARPADEO) */}
          {/* ================================================================ */}
          {peakCoord && hasDistinctExtreme && (
            <g key="peak-marker-group" pointerEvents="none">
              {/* Punto exacto en la cima de la curva */}
              <circle
                cx={peakCoord.x}
                cy={peakCoord.y}
                r={6}
                fill="#059669"
                stroke="#FFFFFF"
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
              />
              <circle
                cx={peakCoord.x}
                cy={peakCoord.y}
                r={2.5}
                fill="#FFFFFF"
              />
              {/* Etiqueta compacta estática sobre el punto más alto */}
              <g transform={`translate(${Math.max(paddingLeft + 44, Math.min(width - paddingRight - 44, peakCoord.x))}, ${Math.max(paddingTop + 14, peakCoord.y - 12)})`}>
                <rect
                  x="-42"
                  y="-18"
                  width="84"
                  height="18"
                  rx="5"
                  fill="#065F46"
                  stroke="#FFFFFF"
                  strokeWidth={1}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))' }}
                />
                <text
                  x="0"
                  y="-5"
                  textAnchor="middle"
                  className="text-[10px] font-mono font-black fill-white select-none"
                >
                  ▲ ${fmt(peakCoord.point.balance)}
                </text>
              </g>
            </g>
          )}

          {troughCoord && hasDistinctExtreme && (
            <g key="trough-marker-group" pointerEvents="none">
              {/* Punto exacto en el suelo más bajo de la curva */}
              <circle
                cx={troughCoord.x}
                cy={troughCoord.y}
                r={6}
                fill="#DC2626"
                stroke="#FFFFFF"
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
              />
              <circle
                cx={troughCoord.x}
                cy={troughCoord.y}
                r={2.5}
                fill="#FFFFFF"
              />
              {/* Etiqueta compacta estática debajo del punto más bajo */}
              <g transform={`translate(${Math.max(paddingLeft + 44, Math.min(width - paddingRight - 44, troughCoord.x))}, ${Math.min(height - paddingBottom - 14, troughCoord.y + 12)})`}>
                <rect
                  x="-42"
                  y="0"
                  width="84"
                  height="18"
                  rx="5"
                  fill="#991B1B"
                  stroke="#FFFFFF"
                  strokeWidth={1}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))' }}
                />
                <text
                  x="0"
                  y="13"
                  textAnchor="middle"
                  className="text-[10px] font-mono font-black fill-white select-none"
                >
                  ▼ ${fmt(troughCoord.point.balance)}
                </text>
              </g>
            </g>
          )}

          {/* Línea Guía Vertical al hacer Hover */}
          {hoveredPoint && (
            <g pointerEvents="none">
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={height - paddingBottom}
                stroke={hoveredPoint.point.balance >= bePrice ? "#059669" : "#EF4444"}
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r={8}
                fill="none"
                stroke={hoveredPoint.point.balance >= bePrice ? "#059669" : "#EF4444"}
                strokeWidth={2}
                opacity={0.8}
              />
            </g>
          )}
        </svg>

        {/* ================================================================== */}
        {/* TOOLTIP FLOTANTE INTERACTIVO INTELIGENTE (SIN CORTES EN BORDES NI TECHO) */}
        {/* ================================================================== */}
        {hoveredPoint && (() => {
          const isNearTop = hoveredPoint.y < 120 || (hoveredPoint.y / height) < 0.28;
          const isNearLeft = hoveredPoint.x < 140 || (hoveredPoint.x / width) < 0.16;
          const isNearRight = hoveredPoint.x > (width - 140) || (hoveredPoint.x / width) > 0.84;

          const alignClassX = isNearLeft ? 'translate-x-3' : isNearRight ? '-translate-x-[calc(100%+12px)]' : '-translate-x-1/2';
          const alignClassY = isNearTop ? 'translate-y-4' : '-translate-y-[calc(100%+12px)]';

          return (
            <div
              className={`absolute z-50 pointer-events-none transform ${alignClassX} ${alignClassY} px-3.5 py-2.5 rounded-2xl bg-[#0F172A]/95 backdrop-blur-md shadow-2xl border border-slate-700/80 animate-fadeIn min-w-[170px]`}
              style={{
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100}%`
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-slate-700/60">
                <span className="font-mono text-[10px]" style={{ color: '#CBD5E1' }}>
                  {hoveredPoint.point.dayLabel} • {hoveredPoint.point.timeLabel}
                </span>
                <span className={`text-[9.5px] font-mono font-black uppercase px-1.5 py-0.2 rounded ${
                  hoveredPoint.point.balance >= bePrice 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {hoveredPoint.point.balance >= bePrice ? (isEs ? 'Beneficio' : 'Profit') : 'Drawdown'}
                </span>
              </div>

              <div className="text-base font-mono font-black tracking-tight" style={{ color: '#FFFFFF' }}>
                ${fmt(hoveredPoint.point.balance)}
              </div>

              {hoveredPoint.point.tradeInfo && (
                <div className="text-[11px] font-sans font-medium mt-1 flex items-center gap-1" style={{ color: '#E2E8F0' }}>
                  <span>{hoveredPoint.point.tradeInfo}</span>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Footer del Lienzo */}
      <div className="mt-2 px-1 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span className="text-[10px] text-slate-400 font-bold">
          {zoomPercent > 100 ? `${isEs ? 'Zoom activo' : 'Active zoom'}: ${zoomPercent}%` : ''}
        </span>

        <div className="flex items-center gap-2">
          {zoomPercent > 100 && (
            <button
              onClick={handleResetZoom}
              className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              {isEs ? 'Ver Todo (100%)' : 'View All (100%)'}
            </button>
          )}
          <span className="text-[10px] text-slate-400 font-bold">
            ZYTI Engine
          </span>
        </div>
      </div>
    </div>
  );
};
