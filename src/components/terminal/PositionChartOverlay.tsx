import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Chart } from 'klinecharts';
import { PositionItem, LimitOrderItem, ClosedTradeItem } from './types';
import { X, ShieldAlert, Target, Clock, EyeOff, RotateCcw } from 'lucide-react';

export interface TradeSetupPreview {
  enabled: boolean;
  orderType?: 'market' | 'limit';
  side: 'buy' | 'sell';
  entryPrice: number;
  slPercent: number;
  tpPercent: number;
  slPrice: number;
  tpPrice: number;
  estimatedLossUsd: number;
  estimatedProfitUsd: number;
}

interface PositionChartOverlayProps {
  chart: Chart | null;
  positions: PositionItem[];
  limitOrders?: LimitOrderItem[];
  tradeHistory?: ClosedTradeItem[];
  focusedTrade?: ClosedTradeItem | null;
  selectedPair?: string;
  currentPrice: number;
  demoBalance: number;
  isEs: boolean;
  tradeSetupPreview?: TradeSetupPreview | null;
  onUpdatePositionSLTP: (id: string, slPrice?: number | null, tpPrice?: number | null) => void;
  onSetBreakEven?: (pos: PositionItem) => void;
  onClosePosition: (id: string) => void;
  onCancelLimitOrder?: (id: string) => void;
  onUpdatePreviewSLTP?: (slPercent?: number, tpPercent?: number) => void;
  onUpdatePreviewEntry?: (newPrice: number) => void;
  onUpdateLimitOrder?: (id: string, newLimitPrice?: number, newSlPrice?: number | null, newTpPrice?: number | null) => void;
  onHidePreview?: () => void;
  onSelectTrade?: (trade: ClosedTradeItem) => void;
  onClearFocusedTrade?: () => void;
  onReturnToLive?: () => void;
}

interface LimitOrderCoords {
  id: string;
  limitY: number | null;
  slY: number | null;
  tpY: number | null;
}

interface PositionCoords {
  id: string;
  entryY: number | null;
  slY: number | null;
  tpY: number | null;
  entryX: number;
  zoneEndX: number;
}

interface ClosedTradeCoords {
  id: string;
  trade: ClosedTradeItem;
  entryX: number | null;
  entryY: number | null;
  exitX: number | null;
  exitY: number | null;
}

export const PositionChartOverlay: React.FC<PositionChartOverlayProps> = ({
  chart,
  positions,
  limitOrders = [],
  tradeHistory = [],
  focusedTrade = null,
  selectedPair,
  currentPrice,
  demoBalance,
  isEs,
  tradeSetupPreview,
  onUpdatePositionSLTP,
  onSetBreakEven,
  onClosePosition,
  onCancelLimitOrder,
  onUpdatePreviewSLTP,
  onUpdatePreviewEntry,
  onUpdateLimitOrder,
  onHidePreview,
  onSelectTrade,
  onClearFocusedTrade,
  onReturnToLive
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Coordenadas calculadas para cada posición abierta y orden límite
  const [positionsCoords, setPositionsCoords] = useState<PositionCoords[]>([]);
  const [limitOrdersCoords, setLimitOrdersCoords] = useState<LimitOrderCoords[]>([]);
  const [closedTradesCoords, setClosedTradesCoords] = useState<ClosedTradeCoords[]>([]);
  const [hoveredTradeId, setHoveredTradeId] = useState<string | null>(null);
  
  // Coordenadas calculadas para la previa (cuando no hay posiciones abiertas)
  const [previewCoords, setPreviewCoords] = useState<{
    entryY: number | null;
    slY: number | null;
    tpY: number | null;
    entryX: number;
    zoneEndX: number;
  }>({ entryY: null, slY: null, tpY: null, entryX: 0, zoneEndX: 0 });

  // Estado de arrastre (posiciones abiertas, orden previa u orden límite pendiente)
  const [draggingItem, setDraggingItem] = useState<{
    type: 'position' | 'preview' | 'limit';
    positionId?: string;
    target: 'entry' | 'sl' | 'tp' | 'auto';
    dragPrice: number | null;
    dragPixelY: number | null;
    initPrice?: number;
    hasMoved?: boolean;
  } | null>(null);

  const hasOpenPositions = positions.length > 0;
  const hasLimitOrders = limitOrders.length > 0;
  const isPreviewMode = Boolean(tradeSetupPreview?.enabled);

  // Conversor pixel Y -> precio en el gráfico KLineChart
  const pixelToPrice = useCallback((pixelY: number): number | null => {
    if (!chart) return null;
    try {
      const converted = (chart as any).convertFromPixel([{ y: pixelY }], { paneId: 'candle_pane' }) as Array<{ value?: number }>;
      const v = converted[0]?.value;
      return typeof v === 'number' && !isNaN(v) && v > 0 ? Number(v.toFixed(2)) : null;
    } catch {
      return null;
    }
  }, [chart]);

  // Sincronización de coordenadas según estado del gráfico KLineChart
  const syncCoordinates = useCallback(() => {
    const hasHistory = (tradeHistory && tradeHistory.length > 0) || Boolean(focusedTrade);
    if (!chart || (!hasOpenPositions && !hasLimitOrders && !tradeSetupPreview?.enabled && !hasHistory)) {
      setPositionsCoords([]);
      setLimitOrdersCoords([]);
      setClosedTradesCoords([]);
      setPreviewCoords({ entryY: null, slY: null, tpY: null, entryX: 0, zoneEndX: 0 });
      return;
    }

    try {
      const dl = (chart as any).getDataList() as Array<{ timestamp: number }> | undefined;
      const canvasWidth = containerRef.current?.offsetWidth ?? 9999;

      let candleWidth = 12;
      let lastCandleX = canvasWidth - 100;

      if (dl && dl.length >= 1) {
        const lastTs = dl[dl.length - 1].timestamp;
        const lastCandleCoord = (chart as any).convertToPixel({ timestamp: lastTs }, { paneId: 'candle_pane' }) as { x?: number } | undefined;
        if (lastCandleCoord && typeof lastCandleCoord.x === 'number' && !isNaN(lastCandleCoord.x)) {
          lastCandleX = Math.round(lastCandleCoord.x);
        }
        if (dl.length >= 2) {
          const pCoord = (chart as any).convertToPixel({ timestamp: dl[dl.length - 2].timestamp }, { paneId: 'candle_pane' }) as { x?: number } | undefined;
          if (pCoord && typeof pCoord.x === 'number' && !isNaN(pCoord.x)) {
            const bw = Math.abs(lastCandleX - pCoord.x);
            if (bw > 1) candleWidth = bw;
          }
        }
      }

      // 1. Sincronizar todas las posiciones abiertas
      if (hasOpenPositions) {
        const newCoordsList: PositionCoords[] = positions.map((pos) => {
          const entryCoord = chart.convertToPixel({ value: pos.entry }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
          const entryY = entryCoord && typeof entryCoord.y === 'number' && !isNaN(entryCoord.y) ? Math.round(entryCoord.y) : null;

          let entryX = lastCandleX;
          const entryTsCoord = (chart as any).convertToPixel({ timestamp: pos.entryTimestamp }, { paneId: 'candle_pane' }) as { x?: number } | undefined;
          if (entryTsCoord && typeof entryTsCoord.x === 'number' && !isNaN(entryTsCoord.x)) {
            const cx = Math.round(entryTsCoord.x);
            if (cx >= 0 && cx < canvasWidth) entryX = cx;
          }

          let slY: number | null = null;
          if (pos.slPrice != null) {
            const c = chart.convertToPixel({ value: pos.slPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
            if (c && typeof c.y === 'number' && !isNaN(c.y)) slY = Math.round(c.y);
          }

          let tpY: number | null = null;
          if (pos.tpPrice != null) {
            const c = chart.convertToPixel({ value: pos.tpPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
            if (c && typeof c.y === 'number' && !isNaN(c.y)) tpY = Math.round(c.y);
          }

          // La caja abarca desde la vela de entrada hasta la última vela viva actual (+ 4 velas hacia adelante)
          // Si la posición es nueva, asegura al menos 12 velas de ancho visual
          const minInitialWidth = Math.round(candleWidth * 12);
          const currentExtent = Math.max(0, lastCandleX - entryX) + Math.round(candleWidth * 4);
          const dynamicWidth = Math.max(minInitialWidth, currentExtent);
          const zoneEndX = Math.min(canvasWidth - 10, entryX + dynamicWidth);

          return { id: pos.id, entryY, slY, tpY, entryX, zoneEndX };
        });

        setPositionsCoords(newCoordsList);
      } else {
        setPositionsCoords([]);
      }

      // 2. Sincronizar coordenadas de la previsualización de orden
      if (isPreviewMode && tradeSetupPreview) {
        const entryCoord = chart.convertToPixel({ value: tradeSetupPreview.entryPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
        const entryY = entryCoord && typeof entryCoord.y === 'number' && !isNaN(entryCoord.y) ? Math.round(entryCoord.y) : null;

        let slY: number | null = null;
        if (tradeSetupPreview.slPrice != null) {
          const c = chart.convertToPixel({ value: tradeSetupPreview.slPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
          if (c && typeof c.y === 'number' && !isNaN(c.y)) slY = Math.round(c.y);
        }

        let tpY: number | null = null;
        if (tradeSetupPreview.tpPrice != null) {
          const c = chart.convertToPixel({ value: tradeSetupPreview.tpPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
          if (c && typeof c.y === 'number' && !isNaN(c.y)) tpY = Math.round(c.y);
        }

        const entryX = lastCandleX;
        const zoneEndX = entryX + Math.round(candleWidth * 12);

        setPreviewCoords({ entryY, slY, tpY, entryX, zoneEndX });
      }

      // 3. Sincronizar coordenadas de órdenes límites pendientes
      if (hasLimitOrders) {
        const newLimitCoords: LimitOrderCoords[] = limitOrders.map((ord) => {
          const limitCoord = chart.convertToPixel({ value: ord.limitPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
          const limitY = limitCoord && typeof limitCoord.y === 'number' && !isNaN(limitCoord.y) ? Math.round(limitCoord.y) : null;

          let slY: number | null = null;
          if (ord.slPrice != null) {
            const c = chart.convertToPixel({ value: ord.slPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
            if (c && typeof c.y === 'number' && !isNaN(c.y)) slY = Math.round(c.y);
          }

          let tpY: number | null = null;
          if (ord.tpPrice != null) {
            const c = chart.convertToPixel({ value: ord.tpPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
            if (c && typeof c.y === 'number' && !isNaN(c.y)) tpY = Math.round(c.y);
          }

          return { id: ord.id, limitY, slY, tpY };
        });
        setLimitOrdersCoords(newLimitCoords);
      } else {
        setLimitOrdersCoords([]);
      }

      // 4. Sincronizar coordenadas de trades históricos cerrados
      if (hasHistory && tradeHistory) {
        const normSelected = (selectedPair || '').replace('/', '').toUpperCase();
        const relevant = tradeHistory
          .filter((t) => {
            if (focusedTrade && focusedTrade.id === t.id) return true;
            return (t.symbol || '').replace('/', '').toUpperCase() === normSelected;
          })
          .slice(0, 35);

        const getTs = (d?: string | number): number | null => {
          if (!d) return null;
          if (typeof d === 'number') return d;
          const num = Number(d);
          if (!isNaN(num) && num > 100000000000) return num;
          const parsed = new Date(d).getTime();
          return isNaN(parsed) ? null : parsed;
        };

        const getCandleX = (ts: number | null): number | null => {
          if (!ts || isNaN(ts)) return null;
          const direct = (chart as any).convertToPixel({ timestamp: ts }, { paneId: 'candle_pane' }) as { x?: number } | undefined;
          if (direct && typeof direct.x === 'number' && !isNaN(direct.x)) {
            return Math.round(direct.x);
          }
          if (dl && dl.length > 0) {
            let closestIdx = 0;
            let minDiff = Math.abs(dl[0].timestamp - ts);
            for (let i = 1; i < dl.length; i++) {
              const diff = Math.abs(dl[i].timestamp - ts);
              if (diff < minDiff) {
                minDiff = diff;
                closestIdx = i;
              }
            }
            const c = (chart as any).convertToPixel({ dataIndex: closestIdx }, { paneId: 'candle_pane' }) as { x?: number } | undefined;
            if (c && typeof c.x === 'number' && !isNaN(c.x)) {
              return Math.round(c.x);
            }
          }
          return null;
        };

        const getPriceY = (price: number | null | undefined): number | null => {
          if (price == null || isNaN(price) || price <= 0) return null;
          const c = chart.convertToPixel({ value: price }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
          if (c && typeof c.y === 'number' && !isNaN(c.y)) {
            return Math.round(c.y);
          }
          return null;
        };

        const mappedHistory: ClosedTradeCoords[] = relevant.map((t) => {
          const openTs = getTs(t.openedAt);
          const closeTs = getTs(t.closedAt);

          let entryX = getCandleX(openTs);
          let exitX = getCandleX(closeTs);

          if (entryX === null && exitX !== null) entryX = exitX - Math.round(candleWidth * 3);
          if (exitX === null && entryX !== null) exitX = entryX + Math.round(candleWidth * 3);

          const entryY = getPriceY(t.entry);
          const exitY = getPriceY(t.exitPrice);

          return {
            id: t.id,
            trade: t,
            entryX,
            entryY,
            exitX,
            exitY
          };
        });

        setClosedTradesCoords(mappedHistory);
      } else {
        setClosedTradesCoords([]);
      }
    } catch {}
  }, [chart, positions, limitOrders, hasOpenPositions, hasLimitOrders, isPreviewMode, tradeSetupPreview, tradeHistory, focusedTrade, selectedPair]);

  useEffect(() => {
    syncCoordinates();
    if (!chart) return;
    const handler = () => syncCoordinates();
    try {
      (chart as any).subscribeAction('onZoom', handler);
      (chart as any).subscribeAction('onScroll', handler);
    } catch {}
    window.addEventListener('resize', handler);
    const interval = setInterval(syncCoordinates, 250);
    return () => {
      try {
        (chart as any).unsubscribeAction('onZoom', handler);
        (chart as any).unsubscribeAction('onScroll', handler);
      } catch {}
      window.removeEventListener('resize', handler);
      clearInterval(interval);
    };
  }, [chart, syncCoordinates]);

  // Referencias para arrastre ininterrumpido en window
  const draggingItemRef = useRef(draggingItem);
  draggingItemRef.current = draggingItem;

  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  const positionsCoordsRef = useRef(positionsCoords);
  positionsCoordsRef.current = positionsCoords;

  const limitOrdersRef = useRef<LimitOrderItem[]>(limitOrders);
  limitOrdersRef.current = limitOrders;

  const limitOrdersCoordsRef = useRef(limitOrdersCoords);
  limitOrdersCoordsRef.current = limitOrdersCoords;

  const currentPriceRef = useRef(currentPrice);
  currentPriceRef.current = currentPrice;

  // Pointer event handlers para arrastrar SL o TP en posiciones, orden previa u orden límite
  const handlePointerDown = (
    type: 'position' | 'preview' | 'limit',
    target: 'entry' | 'sl' | 'tp' | 'auto',
    e: React.PointerEvent,
    posId?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    let initPrice = 0;
    let initPixelY: number | null = null;

    if (type === 'position' && posId) {
      const pos = positions.find((p) => p.id === posId);
      const coord = positionsCoords.find((c) => c.id === posId);
      if (pos && coord) {
        initPrice = target === 'sl'
          ? (pos.slPrice ?? pos.entry)
          : target === 'tp'
          ? (pos.tpPrice ?? pos.entry)
          : pos.entry;
        initPixelY = target === 'sl' ? coord.slY : target === 'tp' ? coord.tpY : coord.entryY;
      }
    } else if (type === 'limit' && posId) {
      const ord = limitOrders.find((o) => o.id === posId);
      const coord = limitOrdersCoords.find((c) => c.id === posId);
      if (ord && coord) {
        initPrice = target === 'sl'
          ? (ord.slPrice ?? ord.limitPrice)
          : target === 'tp'
          ? (ord.tpPrice ?? ord.limitPrice)
          : ord.limitPrice;
        initPixelY = target === 'sl' ? coord.slY : target === 'tp' ? coord.tpY : coord.limitY;
      }
    } else if (type === 'preview' && tradeSetupPreview) {
      initPrice = target === 'sl'
        ? tradeSetupPreview.slPrice
        : target === 'tp'
        ? tradeSetupPreview.tpPrice
        : tradeSetupPreview.entryPrice;
      initPixelY = target === 'sl' ? previewCoords.slY : target === 'tp' ? previewCoords.tpY : previewCoords.entryY;
    }

    const newItem = {
      type,
      positionId: posId,
      target,
      dragPrice: initPrice > 0 ? Number(initPrice.toFixed(2)) : null,
      dragPixelY: initPixelY,
      initPrice: initPrice > 0 ? Number(initPrice.toFixed(2)) : undefined,
      hasMoved: false
    };
    draggingItemRef.current = newItem;
    setDraggingItem(newItem);
  };

  // Listener global en window para arrastre continuo y sin pérdida de eventos
  useEffect(() => {
    if (!draggingItem) return;

    const onWindowPointerMove = (e: PointerEvent) => {
      const currentDrag = draggingItemRef.current;
      if (!currentDrag || !chart || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pixelY = Math.max(4, Math.min(rect.height - 4, e.clientY - rect.top));
      const rawPrice = pixelToPrice(pixelY);
      if (rawPrice === null || rawPrice <= 0) return;

      const hasMoved = currentDrag.hasMoved || (currentDrag.initPrice !== undefined && Math.abs(rawPrice - currentDrag.initPrice) >= 0.02);

      if (currentDrag.type === 'preview' && tradeSetupPreview) {
        if (currentDrag.target === 'entry') {
          const clampedPrice = rawPrice;
          setDraggingItem((prev) => prev ? { ...prev, dragPrice: clampedPrice, dragPixelY: pixelY, hasMoved } : null);
          draggingItemRef.current = { ...currentDrag, dragPrice: clampedPrice, dragPixelY: pixelY, hasMoved };
          onUpdatePreviewEntry?.(clampedPrice);
          return;
        }

        const isLong = tradeSetupPreview.side === 'buy';
        const ep = tradeSetupPreview.entryPrice;

        let target = currentDrag.target;
        if (target === 'auto') {
          target = pixelY < (previewCoords.entryY ?? 0) ? (isLong ? 'tp' : 'sl') : (isLong ? 'sl' : 'tp');
        }

        let clampedPrice = rawPrice;
        if (isLong) {
          if (target === 'sl') clampedPrice = Math.min(rawPrice, Number((ep * 0.999).toFixed(2)));
          if (target === 'tp') clampedPrice = Math.max(rawPrice, Number((ep * 1.001).toFixed(2)));
        } else {
          if (target === 'sl') clampedPrice = Math.max(rawPrice, Number((ep * 1.001).toFixed(2)));
          if (target === 'tp') clampedPrice = Math.min(rawPrice, Number((ep * 0.999).toFixed(2)));
        }

        setDraggingItem((prev) => prev ? { ...prev, target, dragPrice: clampedPrice, dragPixelY: pixelY, hasMoved } : null);
        draggingItemRef.current = { ...currentDrag, target, dragPrice: clampedPrice, dragPixelY: pixelY, hasMoved };

        if (onUpdatePreviewSLTP) {
          if (target === 'sl') {
            const delta = Math.abs(ep - clampedPrice);
            onUpdatePreviewSLTP(Number(((delta / ep) * 100).toFixed(1)), undefined);
          } else if (target === 'tp') {
            const delta = Math.abs(clampedPrice - ep);
            onUpdatePreviewSLTP(undefined, Number(((delta / ep) * 100).toFixed(1)));
          }
        }
      } else if (currentDrag.type === 'limit' && currentDrag.positionId) {
        const ord = limitOrdersRef.current.find((o) => o.id === currentDrag.positionId);
        if (!ord) return;

        const isLong = ord.side === 'buy';
        const ep = ord.limitPrice;
        let clampedPrice = rawPrice;
        const target = currentDrag.target;

        if (target === 'entry') {
          clampedPrice = rawPrice;
        } else if (target === 'sl') {
          clampedPrice = isLong ? Math.min(rawPrice, Number((ep * 0.999).toFixed(2))) : Math.max(rawPrice, Number((ep * 1.001).toFixed(2)));
        } else if (target === 'tp') {
          clampedPrice = isLong ? Math.max(rawPrice, Number((ep * 1.001).toFixed(2))) : Math.min(rawPrice, Number((ep * 0.999).toFixed(2)));
        }

        let activePixelY = pixelY;
        try {
          const pCoord = chart.convertToPixel({ value: clampedPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
          if (pCoord && typeof pCoord.y === 'number' && !isNaN(pCoord.y)) activePixelY = Math.round(pCoord.y);
        } catch {}

        setDraggingItem((prev) => prev ? { ...prev, dragPrice: clampedPrice, dragPixelY: activePixelY, hasMoved } : null);
        draggingItemRef.current = { ...currentDrag, dragPrice: clampedPrice, dragPixelY: activePixelY, hasMoved };
      } else if (currentDrag.type === 'position' && currentDrag.positionId) {
        const pos = positionsRef.current.find((p) => p.id === currentDrag.positionId);
        const coord = positionsCoordsRef.current.find((c) => c.id === currentDrag.positionId);
        if (!pos || !coord) return;

        const isLong = pos.side === 'LONG';
        const ep = pos.entry;
        const cp = (currentPriceRef.current && currentPriceRef.current > 0) ? currentPriceRef.current : pos.mark;

        let target = currentDrag.target;
        if (target === 'auto' && coord.entryY !== null) {
          target = isLong ? (rawPrice > cp ? 'tp' : 'sl') : (rawPrice < cp ? 'tp' : 'sl');
        }

        let clampedPrice = rawPrice;
        if (isLong) {
          if (target === 'sl') {
            const maxAllowedSL = Number((cp * 0.9999).toFixed(2));
            clampedPrice = Math.min(rawPrice, maxAllowedSL);

            if (coord.entryY !== null && Math.abs(pixelY - coord.entryY) <= 4) {
              clampedPrice = ep;
            }
          } else if (target === 'tp') {
            const minAllowedTP = Number((cp * 1.0001).toFixed(2));
            clampedPrice = Math.max(rawPrice, minAllowedTP);
          }
        } else {
          if (target === 'sl') {
            const minAllowedSL = Number((cp * 1.0001).toFixed(2));
            clampedPrice = Math.max(rawPrice, minAllowedSL);

            if (coord.entryY !== null && Math.abs(pixelY - coord.entryY) <= 4) {
              clampedPrice = ep;
            }
          } else if (target === 'tp') {
            const maxAllowedTP = Number((cp * 0.9999).toFixed(2));
            clampedPrice = Math.min(rawPrice, maxAllowedTP);
          }
        }

        let activePixelY = pixelY;
        try {
          const pCoord = chart.convertToPixel({ value: clampedPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
          if (pCoord && typeof pCoord.y === 'number' && !isNaN(pCoord.y)) {
            activePixelY = Math.round(pCoord.y);
          }
        } catch {}

        setDraggingItem((prev) => prev ? { ...prev, target, dragPrice: clampedPrice, dragPixelY: activePixelY, hasMoved } : null);
        draggingItemRef.current = { ...currentDrag, target, dragPrice: clampedPrice, dragPixelY: activePixelY, hasMoved };
      }
    };

    const onWindowPointerUp = () => {
      const currentDrag = draggingItemRef.current;
      if (currentDrag) {
        // VALIDACIÓN ESTRICTA: Si el usuario solo hizo click/tap sin desplazar la orden o línea, NO disparar modificación
        const didActuallyMove = Boolean(
          currentDrag.hasMoved &&
          currentDrag.initPrice !== undefined &&
          currentDrag.dragPrice !== null &&
          Math.abs(currentDrag.dragPrice - currentDrag.initPrice) >= 0.02
        );

        if (!didActuallyMove) {
          setDraggingItem(null);
          draggingItemRef.current = null;
          return;
        }

        if (currentDrag.type === 'position' && currentDrag.positionId && currentDrag.dragPrice) {
          const pos = positionsRef.current.find((p) => p.id === currentDrag.positionId);
          if (pos) {
            let finalTarget = currentDrag.target;
            if (finalTarget === 'auto') {
              const isLong = pos.side === 'LONG';
              finalTarget = isLong
                ? (currentDrag.dragPrice > pos.entry ? 'tp' : 'sl')
                : (currentDrag.dragPrice < pos.entry ? 'tp' : 'sl');
            }

            if (finalTarget === 'sl') {
              if (!pos.slPrice || Math.abs(pos.slPrice - currentDrag.dragPrice) >= 0.02) {
                onUpdatePositionSLTP(pos.id, currentDrag.dragPrice, pos.tpPrice ?? null);
              }
            } else if (finalTarget === 'tp') {
              if (!pos.tpPrice || Math.abs(pos.tpPrice - currentDrag.dragPrice) >= 0.02) {
                onUpdatePositionSLTP(pos.id, pos.slPrice ?? null, currentDrag.dragPrice);
              }
            }
          }
        } else if (currentDrag.type === 'limit' && currentDrag.positionId && currentDrag.dragPrice && onUpdateLimitOrder) {
          const ord = limitOrdersRef.current.find((o) => o.id === currentDrag.positionId);
          if (ord) {
            if (currentDrag.target === 'entry') {
              if (Math.abs(ord.limitPrice - currentDrag.dragPrice) >= 0.02) {
                onUpdateLimitOrder(ord.id, currentDrag.dragPrice, ord.slPrice, ord.tpPrice);
              }
            } else if (currentDrag.target === 'sl') {
              if (!ord.slPrice || Math.abs(ord.slPrice - currentDrag.dragPrice) >= 0.02) {
                onUpdateLimitOrder(ord.id, ord.limitPrice, currentDrag.dragPrice, ord.tpPrice);
              }
            } else if (currentDrag.target === 'tp') {
              if (!ord.tpPrice || Math.abs(ord.tpPrice - currentDrag.dragPrice) >= 0.02) {
                onUpdateLimitOrder(ord.id, ord.limitPrice, ord.slPrice, currentDrag.dragPrice);
              }
            }
          }
        } else if (currentDrag.type === 'preview' && currentDrag.target === 'entry' && currentDrag.dragPrice && onUpdatePreviewEntry) {
          if (!tradeSetupPreview || Math.abs(tradeSetupPreview.entryPrice - currentDrag.dragPrice) >= 0.02) {
            onUpdatePreviewEntry(currentDrag.dragPrice);
          }
        }
      }

      setDraggingItem(null);
      draggingItemRef.current = null;
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
    };
  }, [chart, pixelToPrice, onUpdatePreviewSLTP, onUpdatePreviewEntry, onUpdateLimitOrder, onUpdatePositionSLTP, previewCoords.entryY, tradeSetupPreview, draggingItem]);

  const hasHistoryTrades = closedTradesCoords.length > 0 || Boolean(focusedTrade);
  if (!hasOpenPositions && !hasLimitOrders && !isPreviewMode && !hasHistoryTrades) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none"
    >
      {/* ---------------------------------------------------------------- */}
      {/* CASO 1: HAY POSICIONES ABIERTAS (RENDERIZAR TODAS LAS LÍNEAS) */}
      {/* ---------------------------------------------------------------- */}
      {hasOpenPositions && (
        <>
          <svg className="w-full h-full absolute inset-0">
            {positionsCoords.map((coord, idx) => {
              const pos = positions.find((p) => p.id === coord.id);
              if (!pos || coord.entryY === null) return null;

              const isLong = pos.side === 'LONG';
              const isDraggingThis = draggingItem?.type === 'position' && draggingItem?.positionId === pos.id;

              const activeSlY = isDraggingThis && draggingItem.target === 'sl' && draggingItem.dragPixelY !== null
                ? draggingItem.dragPixelY
                : coord.slY;

              const activeTpY = isDraggingThis && draggingItem.target === 'tp' && draggingItem.dragPixelY !== null
                ? draggingItem.dragPixelY
                : coord.tpY;

              const currentSL = isDraggingThis && draggingItem.target === 'sl' && draggingItem.dragPrice !== null
                ? draggingItem.dragPrice
                : pos.slPrice;

              const slRawPnL = currentSL != null
                ? (isLong ? (currentSL - pos.entry) * pos.sizeUnits : (pos.entry - currentSL) * pos.sizeUnits)
                : 0;

              const isSlInProfit = currentSL != null && slRawPnL > 0.05;
              const isSlBreakEven = currentSL != null && Math.abs(currentSL - pos.entry) <= 0.05;

              const slStrokeColor = isSlBreakEven ? '#3b82f6' : isSlInProfit ? '#10b981' : '#ef4444';
              const slFillColor = isSlBreakEven ? 'rgba(59,130,246,0.12)' : isSlInProfit ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)';

              const zoneWidth = Math.max(0, coord.zoneEndX - coord.entryX);

              return (
                <g key={`pos-lines-${pos.id}`}>
                  {/* ZONA TAKE PROFIT (VERDE CON TRAMADO SUAVE) */}
                  {activeTpY !== null && (
                    <rect
                      x={coord.entryX}
                      y={Math.min(coord.entryY, activeTpY)}
                      width={zoneWidth}
                      height={Math.max(2, Math.abs(coord.entryY - activeTpY))}
                      fill="rgba(16,185,129,0.10)"
                      stroke="#10b981"
                      strokeWidth={0.5}
                      strokeDasharray="4 3"
                    />
                  )}

                  {/* ZONA STOP LOSS (ADAPTATIVA: ROJA EN RIESGO, AZUL EN BREAK-EVEN, VERDE EN GANANCIA PROTEGIDA) */}
                  {activeSlY !== null && (
                    <rect
                      x={coord.entryX}
                      y={Math.min(coord.entryY, activeSlY)}
                      width={zoneWidth}
                      height={Math.max(2, Math.abs(coord.entryY - activeSlY))}
                      fill={slFillColor}
                      stroke={slStrokeColor}
                      strokeWidth={0.5}
                      strokeDasharray="4 3"
                    />
                  )}

                  {/* LÍNEA DE ENTRADA — ESTRICTAMENTE AZUL Y MUY FINA (0.75px) */}
                  <line
                    x1={0}
                    y1={coord.entryY}
                    x2="100%"
                    y2={coord.entryY}
                    stroke="#2563eb"
                    strokeWidth={0.75}
                  />

                  {/* LÍNEA TAKE PROFIT — VERDE Y FINA (0.75px) */}
                  {activeTpY !== null && (
                    <line
                      x1={0}
                      y1={activeTpY}
                      x2="100%"
                      y2={activeTpY}
                      stroke="#10b981"
                      strokeWidth={0.75}
                    />
                  )}

                  {/* LÍNEA STOP LOSS — DINÁMICA: ROJA, AZUL EN BE O VERDE EN BENEFICIO PROTEGIDO */}
                  {activeSlY !== null && (
                    <line
                      x1={0}
                      y1={activeSlY}
                      x2="100%"
                      y2={activeSlY}
                      stroke={slStrokeColor}
                      strokeWidth={0.75}
                    />
                  )}

                  {/* GUÍA VERTICAL EN VELAS */}
                  {coord.entryX > 4 && (
                    <line
                      x1={coord.entryX}
                      y1={activeTpY ?? coord.entryY}
                      x2={coord.entryX}
                      y2={activeSlY ?? coord.entryY}
                      stroke="#2563eb"
                      strokeWidth={0.75}
                      strokeDasharray="3 3"
                      opacity={0.35}
                    />
                  )}

                  {/* MARCADOR EXACTO DE ENTRADA DE POSICIÓN ABIERTA: VERDE OSCURO (LONG) O ROJO OSCURO (SHORT) */}
                  <g
                    transform={`translate(${coord.entryX}, ${coord.entryY})`}
                    className="pointer-events-auto cursor-pointer group"
                  >
                    {isLong ? (
                      // LONG: Flecha VERDE OSCURA compacta apuntando HACIA ARRIBA (↑)
                      <>
                        <polygon
                          points="0,0 -4.2,6.5 -1.4,6.5 -1.4,12 1.4,12 1.4,6.5 4.2,6.5"
                          fill="#047857"
                          stroke="#ffffff"
                          strokeWidth={1}
                          strokeLinejoin="round"
                          style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.85))' }}
                          className="transition-transform group-hover:scale-125"
                        />
                        <circle cx={0} cy={0} r={1.5} fill="#ffffff" />
                      </>
                    ) : (
                      // SHORT: Flecha ROJA OSCURA compacta apuntando HACIA ABAJO (↓)
                      <>
                        <polygon
                          points="0,0 -4.2,-6.5 -1.4,-6.5 -1.4,-12 1.4,-12 1.4,-6.5 4.2,-6.5"
                          fill="#991b1b"
                          stroke="#ffffff"
                          strokeWidth={1}
                          strokeLinejoin="round"
                          style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.85))' }}
                          className="transition-transform group-hover:scale-125"
                        />
                        <circle cx={0} cy={0} r={1.5} fill="#ffffff" />
                      </>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>

          {/* BADGES INTERACTIVOS PARA CADA POSICIÓN ABIERTA */}
          {positionsCoords.map((coord, idx) => {
            const pos = positions.find((p) => p.id === coord.id);
            if (!pos || coord.entryY === null) return null;

            const isLong = pos.side === 'LONG';
            const isDraggingThis = draggingItem?.type === 'position' && draggingItem?.positionId === pos.id;

            const currentSL = isDraggingThis && draggingItem.target === 'sl' && draggingItem.dragPrice !== null
              ? draggingItem.dragPrice
              : pos.slPrice;

            const currentTP = isDraggingThis && draggingItem.target === 'tp' && draggingItem.dragPrice !== null
              ? draggingItem.dragPrice
              : pos.tpPrice;

            const activeSlY = isDraggingThis && draggingItem.target === 'sl' && draggingItem.dragPixelY !== null
              ? draggingItem.dragPixelY
              : coord.slY;

            const activeTpY = isDraggingThis && draggingItem.target === 'tp' && draggingItem.dragPixelY !== null
              ? draggingItem.dragPixelY
              : coord.tpY;

            const slRawPnL = currentSL != null
              ? (isLong ? (currentSL - pos.entry) * pos.sizeUnits : (pos.entry - currentSL) * pos.sizeUnits)
              : 0;
            const tpDelta = currentTP != null ? Math.abs(currentTP - pos.entry) * pos.sizeUnits : 0;

            const isSlInProfit = currentSL != null && slRawPnL > 0.05;
            const isSlBreakEven = currentSL != null && Math.abs(currentSL - pos.entry) <= 0.05;
            const slPct = demoBalance > 0 ? (Math.abs(slRawPnL) / demoBalance) * 100 : 0;
            const tpPct = demoBalance > 0 ? (tpDelta / demoBalance) * 100 : 0;

            // Desplazamiento horizontal respetando la escala de precios lateral (72px)
            // para que en móviles y táctiles se pueda interactuar con el eje Y sin obstáculos
            const baseOffsetRight = 72;
            const offsetRight = baseOffsetRight + (idx * 16);

            // Si la orden de SL o TP está a la misma altura que la Entrada (p.ej. Break-Even < 24px),
            // desplazamos el badge de Entrada a la izquierda para que ambos sean perfectamente visibles
            const isSlNearEntry = activeSlY !== null && coord.entryY !== null && Math.abs(activeSlY - coord.entryY) < 24;
            const isTpNearEntry = activeTpY !== null && coord.entryY !== null && Math.abs(activeTpY - coord.entryY) < 24;
            const entryOffsetRight = offsetRight + (isSlNearEntry || isTpNearEntry ? 200 : 0);

            return (
              <React.Fragment key={`pos-badges-${pos.id}`}>
                {/* BADGE DE ENTRADA (AZUL / SKY) */}
                <div
                  style={{ top: `${coord.entryY}px`, right: `${entryOffsetRight}px` }}
                  className="absolute -translate-y-1/2 pointer-events-auto flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/95 text-white border border-blue-500/80 shadow-md text-[9px] font-mono font-bold z-30 transition-all"
                >
                  <span className={`px-1 py-0.2 rounded text-[8px] font-black ${isLong ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                    {pos.side} #{idx + 1}
                  </span>
                  <span className="text-slate-300">
                    @${pos.entry.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`font-black ${pos.isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pos.pnl}
                  </span>

                  {/* Botones para arrastrar o crear SL y TP si no existen */}
                  {!pos.tpPrice && (
                    <button
                      type="button"
                      onPointerDown={(e) => handlePointerDown('position', 'tp', e, pos.id)}
                      className="px-1 py-0.2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[8px] font-black cursor-ns-resize flex items-center gap-0.5 touch-none"
                      title={isEs ? 'Arrastrar para crear TP' : 'Drag to place TP'}
                    >
                      +TP ⇅
                    </button>
                  )}

                  {!pos.slPrice && (
                    <button
                      type="button"
                      onPointerDown={(e) => handlePointerDown('position', 'sl', e, pos.id)}
                      className="px-1 py-0.2 rounded bg-red-600 hover:bg-red-500 text-white text-[8px] font-black cursor-ns-resize flex items-center gap-0.5 touch-none"
                      title={isEs ? 'Arrastrar para crear SL' : 'Drag to place SL'}
                    >
                      +SL ⇅
                    </button>
                  )}

                  {/* Botón rápido Break-Even (BE): SIEMPRE VISIBLE, con feedback de validación/error */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSetBreakEven) {
                        onSetBreakEven(pos);
                      } else {
                        onUpdatePositionSLTP(pos.id, pos.entry, pos.tpPrice ?? null);
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-black cursor-pointer flex items-center gap-0.5 transition-all ${
                      pos.slPrice && Math.abs(pos.slPrice - pos.entry) < 0.05
                        ? 'bg-blue-500 text-white ring-1 ring-blue-300 shadow-xs'
                        : pos.isProfit
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs active:scale-95'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-amber-300 active:scale-95'
                    }`}
                    title={
                      pos.slPrice && Math.abs(pos.slPrice - pos.entry) < 0.05
                        ? (isEs ? 'Break-Even activo en entrada. Arrastra el SL para proteger ganancias' : 'Break-Even active at entry. Drag SL to trail profits')
                        : pos.isProfit
                        ? (isEs ? 'Fijar Stop Loss a Break-Even (Entrada)' : 'Set Stop Loss to Break-Even (Entry)')
                        : (isEs ? 'Posición en pérdida. Pulsa para ver requerimientos' : 'Position in loss. Click to view requirements')
                    }
                  >
                    BE
                  </button>

                  <div
                    onPointerDown={(e) => handlePointerDown('position', 'auto', e, pos.id)}
                    className="cursor-ns-resize px-0.5 text-slate-400 hover:text-amber-400 touch-none"
                    title={isEs ? 'Arrastra arriba/abajo para SL o TP' : 'Drag up/down for SL or TP'}
                  >
                    ⇅
                  </div>

                  <button
                    type="button"
                    onClick={() => onClosePosition(pos.id)}
                    className="p-0.5 rounded hover:bg-red-700 text-slate-400 hover:text-white cursor-pointer"
                    title={isEs ? 'Cerrar posición a mercado' : 'Close at market'}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* BADGE TAKE PROFIT ARRASTRABLE */}
                {activeTpY !== null && currentTP != null && (
                  <div
                    style={{ top: `${activeTpY}px`, right: `${offsetRight}px` }}
                    onPointerDown={(e) => handlePointerDown('position', 'tp', e, pos.id)}
                    className="absolute -translate-y-1/2 pointer-events-auto cursor-ns-resize flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/95 text-emerald-200 border border-emerald-500 shadow-md text-[9px] font-mono font-bold touch-none z-30"
                  >
                    <Target className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    <span>TP ${currentTP.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="text-[8px] text-emerald-300 font-black">+${tpDelta.toFixed(2)} (+{tpPct.toFixed(1)}%)</span>
                    <span className="text-emerald-400">⇅</span>
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdatePositionSLTP(pos.id, pos.slPrice ?? null, null);
                      }}
                      className="p-0.5 rounded hover:bg-emerald-600 text-emerald-300 hover:text-white cursor-pointer"
                      title={isEs ? 'Quitar orden de TP' : 'Cancel TP order'}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}

                {/* BADGE STOP LOSS ARRASTRABLE (RIESGO, BREAK-EVEN O GANANCIA PROTEGIDA) */}
                {activeSlY !== null && currentSL != null && (
                  <div
                    style={{ top: `${activeSlY}px`, right: `${offsetRight}px` }}
                    onPointerDown={(e) => handlePointerDown('position', 'sl', e, pos.id)}
                    className={`absolute -translate-y-1/2 pointer-events-auto cursor-ns-resize flex items-center gap-1 px-2 py-0.5 rounded-lg shadow-md text-[9px] font-mono font-bold touch-none z-30 transition-colors ${
                      isSlBreakEven
                        ? 'bg-blue-950/95 text-blue-200 border border-blue-400'
                        : isSlInProfit
                        ? 'bg-emerald-950/95 text-emerald-200 border border-emerald-500'
                        : 'bg-red-950/95 text-red-200 border border-red-500'
                    }`}
                  >
                    <ShieldAlert className={`w-2.5 h-2.5 shrink-0 ${
                      isSlBreakEven ? 'text-blue-400' : isSlInProfit ? 'text-emerald-400' : 'text-red-400'
                    }`} />
                    <span>
                      {isSlBreakEven ? 'SL (BE)' : isSlInProfit ? (isEs ? 'SL (Protegido)' : 'SL (Protected)') : 'SL'}{' '}
                      ${currentSL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-[8px] font-black ${
                      isSlBreakEven ? 'text-blue-300' : isSlInProfit ? 'text-emerald-300' : 'text-red-300'
                    }`}>
                      {isSlBreakEven
                        ? '$0.00 (BE)'
                        : isSlInProfit
                        ? `+$${slRawPnL.toFixed(2)} (+${slPct.toFixed(1)}%)`
                        : `-$${Math.abs(slRawPnL).toFixed(2)} (-${slPct.toFixed(1)}%)`}
                    </span>
                    <span className={isSlBreakEven ? 'text-blue-400' : isSlInProfit ? 'text-emerald-400' : 'text-red-400'}>⇅</span>
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdatePositionSLTP(pos.id, null, pos.tpPrice ?? null);
                      }}
                      className="p-0.5 rounded hover:bg-slate-700/60 text-slate-300 hover:text-white cursor-pointer"
                      title={isEs ? 'Quitar orden de SL' : 'Cancel SL order'}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* CASO 2: NO HAY POSICIONES ABIERTAS (PREVIA CONFIGURACIÓN ARRASTRABLE LIMPIA) */}
      {/* ---------------------------------------------------------------- */}
      {isPreviewMode && tradeSetupPreview && previewCoords.entryY !== null && (
        <>
          <svg className="w-full h-full absolute inset-0 pointer-events-none">
            {/* LÍNEA DE ENTRADA PREVIA — AZUL Y FINA (0.75px) */}
            <line
              x1={0}
              y1={previewCoords.entryY}
              x2="100%"
              y2={previewCoords.entryY}
              stroke="#2563eb"
              strokeWidth={0.75}
              strokeDasharray="4 3"
            />
            {/* Línea invisible para arrastrar la entrada previa desde cualquier punto de la línea */}
            <line
              x1={0}
              y1={previewCoords.entryY}
              x2="100%"
              y2={previewCoords.entryY}
              stroke="transparent"
              strokeWidth={16}
              className="pointer-events-auto cursor-ns-resize touch-none"
              onPointerDown={(e) => handlePointerDown('preview', tradeSetupPreview.orderType === 'limit' ? 'entry' : 'auto', e)}
            />

            {/* LÍNEA TP PREVIA — VERDE Y FINA (0.75px) */}
            {previewCoords.tpY !== null && (
              <>
                <line
                  x1={0}
                  y1={previewCoords.tpY}
                  x2="100%"
                  y2={previewCoords.tpY}
                  stroke="#10b981"
                  strokeWidth={0.75}
                  strokeDasharray="4 3"
                />
                <line
                  x1={0}
                  y1={previewCoords.tpY}
                  x2="100%"
                  y2={previewCoords.tpY}
                  stroke="transparent"
                  strokeWidth={16}
                  className="pointer-events-auto cursor-ns-resize touch-none"
                  onPointerDown={(e) => handlePointerDown('preview', 'tp', e)}
                />
              </>
            )}

            {/* LÍNEA SL PREVIA — ROJA Y FINA (0.75px) */}
            {previewCoords.slY !== null && (
              <>
                <line
                  x1={0}
                  y1={previewCoords.slY}
                  x2="100%"
                  y2={previewCoords.slY}
                  stroke="#ef4444"
                  strokeWidth={0.75}
                  strokeDasharray="4 3"
                />
                <line
                  x1={0}
                  y1={previewCoords.slY}
                  x2="100%"
                  y2={previewCoords.slY}
                  stroke="transparent"
                  strokeWidth={16}
                  className="pointer-events-auto cursor-ns-resize touch-none"
                  onPointerDown={(e) => handlePointerDown('preview', 'sl', e)}
                />
              </>
            )}
          </svg>

          {/* BADGE PREVIO DE ENTRADA — AZUL O AMBER (ARRASTRABLE EN TODO EL CUERPO) */}
          <div
            style={{ top: `${previewCoords.entryY}px` }}
            onPointerDown={(e) => handlePointerDown('preview', tradeSetupPreview.orderType === 'limit' ? 'entry' : 'auto', e)}
            className={`absolute right-16 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-white shadow-md text-[9px] font-mono font-bold z-30 pointer-events-auto cursor-ns-resize touch-none select-none transition-all ${
              tradeSetupPreview.orderType === 'limit'
                ? 'bg-amber-950/95 border border-amber-500 hover:border-amber-400'
                : 'bg-slate-900/95 border border-blue-500 hover:border-blue-400'
            }`}
            title={tradeSetupPreview.orderType === 'limit' ? (isEs ? 'Arrastra para modificar el precio límite' : 'Drag to adjust limit price') : (isEs ? 'Arrastra para mover SL o TP' : 'Drag to adjust SL or TP')}
          >
            <span className={`px-1 py-0.2 rounded text-[8px] font-black ${
              tradeSetupPreview.orderType === 'limit'
                ? (tradeSetupPreview.side === 'buy' ? 'bg-emerald-600' : 'bg-red-600')
                : 'bg-blue-600'
            }`}>
              {tradeSetupPreview.orderType === 'limit'
                ? (tradeSetupPreview.side === 'buy'
                    ? (tradeSetupPreview.entryPrice < currentPrice ? 'BUY LIMIT' : 'BUY STOP')
                    : (tradeSetupPreview.entryPrice > currentPrice ? 'SELL LIMIT' : 'SELL STOP'))
                : `CONFIG ${tradeSetupPreview.side === 'buy' ? 'LONG' : 'SHORT'}`}
            </span>
            <span className="text-slate-200">
              @${tradeSetupPreview.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="px-1 text-amber-400 hover:text-white">
              ⇅
            </span>
            {onHidePreview && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onHidePreview();
                }}
                className="p-0.5 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white cursor-pointer ml-0.5"
                title={isEs ? 'Ocultar orden del gráfico' : 'Hide order from chart'}
              >
                <EyeOff className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* BADGE PREVIO TAKE PROFIT ARRASTRABLE (ACTUALIZA PANEL EN TIEMPO REAL) */}
          {previewCoords.tpY !== null && (
            <div
              style={{ top: `${previewCoords.tpY}px` }}
              onPointerDown={(e) => handlePointerDown('preview', 'tp', e)}
              className="absolute right-16 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/95 text-emerald-200 border border-emerald-500 shadow-md text-[9px] font-mono font-bold z-30 pointer-events-auto cursor-ns-resize touch-none"
              title={isEs ? 'Arrastra para modificar TP en tiempo real' : 'Drag to adjust TP in real time'}
            >
              <Target className="w-2.5 h-2.5 text-emerald-400" />
              <span>TP ${tradeSetupPreview.tpPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className="text-[8px] text-emerald-300 font-black">
                (+{tradeSetupPreview.tpPercent}%) +${tradeSetupPreview.estimatedProfitUsd.toFixed(1)}
              </span>
              <span className="text-emerald-400">⇅</span>
            </div>
          )}

          {/* BADGE PREVIO STOP LOSS ARRASTRABLE (ACTUALIZA PANEL EN TIEMPO REAL) */}
          {previewCoords.slY !== null && (
            <div
              style={{ top: `${previewCoords.slY}px` }}
              onPointerDown={(e) => handlePointerDown('preview', 'sl', e)}
              className="absolute right-16 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-950/95 text-red-200 border border-red-500 shadow-md text-[9px] font-mono font-bold z-30 pointer-events-auto cursor-ns-resize touch-none"
              title={isEs ? 'Arrastra para modificar SL en tiempo real' : 'Drag to adjust SL in real time'}
            >
              <ShieldAlert className="w-2.5 h-2.5 text-red-400" />
              <span>SL ${tradeSetupPreview.slPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className="text-[8px] text-red-300 font-black">
                (-{tradeSetupPreview.slPercent}%) -${tradeSetupPreview.estimatedLossUsd.toFixed(1)}
              </span>
              <span className="text-red-400">⇅</span>
            </div>
          )}
        </>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* CASO 3: ÓRDENES LÍMITES PENDIENTES ARRASTRABLES (ENTRADA, SL Y TP) */}
      {/* ---------------------------------------------------------------- */}
      {hasLimitOrders && (
        <>
          <svg className="w-full h-full absolute inset-0 pointer-events-none">
            {limitOrdersCoords.map((coord) => {
              const ord = limitOrders.find((o) => o.id === coord.id);
              if (!ord || coord.limitY === null) return null;
              const isBuy = ord.side === 'buy';

              const isDraggingThis = draggingItem?.type === 'limit' && draggingItem?.positionId === ord.id;
              const activeLimitY = isDraggingThis && draggingItem.target === 'entry' && draggingItem.dragPixelY !== null
                ? draggingItem.dragPixelY
                : coord.limitY;
              const activeSlY = isDraggingThis && draggingItem.target === 'sl' && draggingItem.dragPixelY !== null
                ? draggingItem.dragPixelY
                : coord.slY;
              const activeTpY = isDraggingThis && draggingItem.target === 'tp' && draggingItem.dragPixelY !== null
                ? draggingItem.dragPixelY
                : coord.tpY;

              return (
                <g key={`svg-limit-${ord.id}`}>
                  {/* Línea horizontal del precio límite */}
                  <line
                    x1={0}
                    y1={activeLimitY}
                    x2="100%"
                    y2={activeLimitY}
                    stroke={isBuy ? '#10b981' : '#f43f5e'}
                    strokeWidth={1.25}
                    strokeDasharray="6 4"
                    opacity={0.9}
                  />
                  {/* Línea invisible ancha interactiva para arrastrar la orden límite desde cualquier punto de la línea horizontal */}
                  <line
                    x1={0}
                    y1={activeLimitY}
                    x2="100%"
                    y2={activeLimitY}
                    stroke="transparent"
                    strokeWidth={16}
                    className="pointer-events-auto cursor-ns-resize touch-none"
                    onPointerDown={(e) => handlePointerDown('limit', 'entry', e, ord.id)}
                  />
                  {/* Línea SL proyectada si existe */}
                  {activeSlY !== null && (
                    <>
                      <line
                        x1={0}
                        y1={activeSlY}
                        x2="100%"
                        y2={activeSlY}
                        stroke="#ef4444"
                        strokeWidth={0.75}
                        strokeDasharray="3 3"
                        opacity={0.5}
                      />
                      <line
                        x1={0}
                        y1={activeSlY}
                        x2="100%"
                        y2={activeSlY}
                        stroke="transparent"
                        strokeWidth={16}
                        className="pointer-events-auto cursor-ns-resize touch-none"
                        onPointerDown={(e) => handlePointerDown('limit', 'sl', e, ord.id)}
                      />
                    </>
                  )}
                  {/* Línea TP proyectada si existe */}
                  {activeTpY !== null && (
                    <>
                      <line
                        x1={0}
                        y1={activeTpY}
                        x2="100%"
                        y2={activeTpY}
                        stroke="#10b981"
                        strokeWidth={0.75}
                        strokeDasharray="3 3"
                        opacity={0.5}
                      />
                      <line
                        x1={0}
                        y1={activeTpY}
                        x2="100%"
                        y2={activeTpY}
                        stroke="transparent"
                        strokeWidth={16}
                        className="pointer-events-auto cursor-ns-resize touch-none"
                        onPointerDown={(e) => handlePointerDown('limit', 'tp', e, ord.id)}
                      />
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* BADGES DE ÓRDENES LÍMITES ARRASTRABLES */}
          {limitOrdersCoords.map((coord, idx) => {
            const ord = limitOrders.find((o) => o.id === coord.id);
            if (!ord || coord.limitY === null) return null;
            const isBuy = ord.side === 'buy';
            const offsetRight = 72 + (idx * 16);

            const isDraggingThis = draggingItem?.type === 'limit' && draggingItem?.positionId === ord.id;
            const activeLimitY = isDraggingThis && draggingItem.target === 'entry' && draggingItem.dragPixelY !== null
              ? draggingItem.dragPixelY
              : coord.limitY;
            const activeLimitPrice = isDraggingThis && draggingItem.target === 'entry' && draggingItem.dragPrice !== null
              ? draggingItem.dragPrice
              : ord.limitPrice;

            const activeSlY = isDraggingThis && draggingItem.target === 'sl' && draggingItem.dragPixelY !== null
              ? draggingItem.dragPixelY
              : coord.slY;
            const activeSlPrice = isDraggingThis && draggingItem.target === 'sl' && draggingItem.dragPrice !== null
              ? draggingItem.dragPrice
              : ord.slPrice;

            const activeTpY = isDraggingThis && draggingItem.target === 'tp' && draggingItem.dragPixelY !== null
              ? draggingItem.dragPixelY
              : coord.tpY;
            const activeTpPrice = isDraggingThis && draggingItem.target === 'tp' && draggingItem.dragPrice !== null
              ? draggingItem.dragPrice
              : ord.tpPrice;

            return (
              <React.Fragment key={`limit-group-${ord.id}`}>
                {/* BADGE PRINCIPAL PRECIO LÍMITE (ARRASTRABLE EN TODO EL CUERPO DEL BADGE) */}
                <div
                  style={{ top: `${activeLimitY}px`, right: `${offsetRight}px` }}
                  onPointerDown={(e) => handlePointerDown('limit', 'entry', e, ord.id)}
                  className={`absolute -translate-y-1/2 pointer-events-auto flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-white shadow-md text-[9px] font-mono font-bold z-30 transition-all cursor-ns-resize touch-none select-none ${
                    isBuy
                      ? 'bg-slate-950/95 border border-emerald-500/80 shadow-emerald-950/50 hover:border-emerald-400'
                      : 'bg-slate-950/95 border border-rose-500/80 shadow-rose-950/50 hover:border-rose-400'
                  }`}
                  title={isEs ? 'Arrastra para modificar el precio de la orden pendiente' : 'Drag to adjust pending order price'}
                >
                  <span className={`px-1 py-0.2 rounded text-[8px] font-black ${
                    isBuy ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}>
                    {isBuy
                      ? (activeLimitPrice < currentPrice ? 'BUY LIMIT' : 'BUY STOP')
                      : (activeLimitPrice > currentPrice ? 'SELL LIMIT' : 'SELL STOP')} {ord.leverage}x
                  </span>
                  <span className="text-slate-200">
                    {ord.size} @ ${activeLimitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>

                  {/* Arrastrar límite */}
                  <span className="px-1 text-amber-400 hover:text-white">
                    ⇅
                  </span>

                  {/* Botones para añadir SL o TP si no los tiene aún */}
                  {!ord.tpPrice && (
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        handlePointerDown('limit', 'tp', e, ord.id);
                      }}
                      className="px-1 py-0.2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[8px] font-black cursor-ns-resize flex items-center gap-0.5 touch-none"
                      title={isEs ? 'Arrastrar para crear TP' : 'Drag to place TP'}
                    >
                      +TP ⇅
                    </button>
                  )}

                  {!ord.slPrice && (
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        handlePointerDown('limit', 'sl', e, ord.id);
                      }}
                      className="px-1 py-0.2 rounded bg-red-600 hover:bg-red-500 text-white text-[8px] font-black cursor-ns-resize flex items-center gap-0.5 touch-none"
                      title={isEs ? 'Arrastrar para crear SL' : 'Drag to place SL'}
                    >
                      +SL ⇅
                    </button>
                  )}

                  {onCancelLimitOrder && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelLimitOrder(ord.id);
                      }}
                      className="p-0.5 rounded hover:bg-red-500/30 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title={isEs ? 'Cancelar orden pendiente' : 'Cancel pending order'}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

                {/* BADGE TAKE PROFIT DE LA ORDEN LÍMITE (ARRASTRABLE EN TODO EL CUERPO) */}
                {activeTpY !== null && activeTpPrice && (
                  <div
                    style={{ top: `${activeTpY}px`, right: `${offsetRight}px` }}
                    onPointerDown={(e) => handlePointerDown('limit', 'tp', e, ord.id)}
                    className="absolute -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/95 text-emerald-200 border border-emerald-500 shadow-md text-[9px] font-mono font-bold z-30 pointer-events-auto cursor-ns-resize touch-none select-none"
                    title={isEs ? 'Arrastrar para mover TP' : 'Drag to move TP'}
                  >
                    <Target className="w-2.5 h-2.5 text-emerald-400" />
                    <span>TP ${activeTpPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="text-emerald-400">⇅</span>
                    {onUpdateLimitOrder && (
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateLimitOrder(ord.id, ord.limitPrice, ord.slPrice, null);
                        }}
                        className="p-0.5 rounded hover:bg-slate-700/60 text-slate-300 hover:text-white cursor-pointer"
                        title={isEs ? 'Quitar TP' : 'Remove TP'}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* BADGE STOP LOSS DE LA ORDEN LÍMITE (ARRASTRABLE EN TODO EL CUERPO) */}
                {activeSlY !== null && activeSlPrice && (
                  <div
                    style={{ top: `${activeSlY}px`, right: `${offsetRight}px` }}
                    onPointerDown={(e) => handlePointerDown('limit', 'sl', e, ord.id)}
                    className="absolute -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-950/95 text-red-200 border border-red-500 shadow-md text-[9px] font-mono font-bold z-30 pointer-events-auto cursor-ns-resize touch-none select-none"
                    title={isEs ? 'Arrastrar para mover SL' : 'Drag to move SL'}
                  >
                    <ShieldAlert className="w-2.5 h-2.5 text-red-400" />
                    <span>SL ${activeSlPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="text-red-400">⇅</span>
                    {onUpdateLimitOrder && (
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateLimitOrder(ord.id, ord.limitPrice, null, ord.tpPrice);
                        }}
                        className="p-0.5 rounded hover:bg-slate-700/60 text-slate-300 hover:text-white cursor-pointer"
                        title={isEs ? 'Quitar SL' : 'Remove SL'}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* CASO 4: HISTORIAL DE TRADES: FLECHAS EXACTAS, LÍNEAS Y PNL */}
      {/* ---------------------------------------------------------------- */}
      {closedTradesCoords.length > 0 && (
        <>
          <svg className="w-full h-full absolute inset-0">
            {closedTradesCoords.map((c) => {
              const isFocused = focusedTrade?.id === c.id;
              const isHovered = hoveredTradeId === c.id;
              const isLong = c.trade.side === 'LONG';
              // Reglas del usuario:
              // LONG: Entrada = Verde (↑), Salida = Roja (↓)
              // SHORT: Entrada = Roja (↓), Salida = Verde (↑)
              const hasEntry = c.entryX !== null && c.entryY !== null;
              const hasExit = c.exitX !== null && c.exitY !== null;

              return (
                <g key={`history-trade-svg-${c.id}`}>
                  {/* Línea conectora entre Entrada y Salida: SOLO para el trade enfocado o bajo hover para erradicar saturación */}
                  {hasEntry && hasExit && (isFocused || isHovered) && (
                    <line
                      x1={c.entryX!}
                      y1={c.entryY!}
                      x2={c.exitX!}
                      y2={c.exitY!}
                      stroke={isFocused ? '#f59e0b' : c.trade.isProfit ? '#047857' : '#991b1b'}
                      strokeWidth={isFocused ? 1.5 : 1}
                      strokeDasharray={isFocused ? '3 2' : '2 2'}
                      opacity={isFocused ? 1 : 0.85}
                      className="pointer-events-auto cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTrade?.(c.trade);
                      }}
                      onMouseEnter={() => setHoveredTradeId(c.id)}
                      onMouseLeave={() => setHoveredTradeId(null)}
                    />
                  )}

                    {/* Flecha de ENTRADA en el punto exacto (Ultra-compacta para móvil y desktop) */}
                  {hasEntry && (
                    <g
                      transform={`translate(${c.entryX}, ${c.entryY})`}
                      className="pointer-events-auto cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTrade?.(c.trade);
                      }}
                      onMouseEnter={() => setHoveredTradeId(c.id)}
                      onMouseLeave={() => setHoveredTradeId(null)}
                    >
                      {/* Área táctil invisible para facilitar el click en móvil y desktop */}
                      <circle cx={0} cy={isLong ? 4.5 : -4.5} r={12} fill="transparent" />

                      {isFocused && (
                        <circle
                          cx={0}
                          cy={isLong ? 5 : -5}
                          r={7.5}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth={1.5}
                          strokeDasharray="2 2"
                          className="animate-spin"
                        />
                      )}
                      {isLong ? (
                        // LONG ENTRADA: Flecha VERDE apuntando HACIA ARRIBA (↑)
                        <>
                          <polygon
                            points="0,0 -3.6,5.5 -1.2,5.5 -1.2,10 1.2,10 1.2,5.5 3.6,5.5"
                            fill="#059669"
                            stroke="#ffffff"
                            strokeWidth={0.9}
                            strokeLinejoin="round"
                            style={{
                              filter: isFocused
                                ? 'drop-shadow(0 0 6px rgba(245,158,11,0.95))'
                                : 'drop-shadow(0 1px 3px rgba(0,0,0,0.85))'
                            }}
                            className="transition-transform group-hover:scale-125"
                          />
                          <circle cx={0} cy={0} r={1.3} fill="#ffffff" />
                        </>
                      ) : (
                        // SHORT ENTRADA: Flecha ROJA apuntando HACIA ABAJO (↓)
                        <>
                          <polygon
                            points="0,0 -3.6,-5.5 -1.2,-5.5 -1.2,-10 1.2,-10 1.2,-5.5 3.6,-5.5"
                            fill="#dc2626"
                            stroke="#ffffff"
                            strokeWidth={0.9}
                            strokeLinejoin="round"
                            style={{
                              filter: isFocused
                                ? 'drop-shadow(0 0 6px rgba(245,158,11,0.95))'
                                : 'drop-shadow(0 1px 3px rgba(0,0,0,0.85))'
                            }}
                            className="transition-transform group-hover:scale-125"
                          />
                          <circle cx={0} cy={0} r={1.3} fill="#ffffff" />
                        </>
                      )}
                    </g>
                  )}

                  {/* Flecha de SALIDA en el punto exacto */}
                  {hasExit && (
                    <g
                      transform={`translate(${c.exitX}, ${c.exitY})`}
                      className="pointer-events-auto cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTrade?.(c.trade);
                      }}
                      onMouseEnter={() => setHoveredTradeId(c.id)}
                      onMouseLeave={() => setHoveredTradeId(null)}
                    >
                      {/* Área táctil invisible para facilitar el click en móvil y desktop */}
                      <circle cx={0} cy={isLong ? -4.5 : 4.5} r={12} fill="transparent" />

                      {isFocused && (
                        <circle
                          cx={0}
                          cy={isLong ? -5 : 5}
                          r={7.5}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth={1.5}
                          strokeDasharray="2 2"
                          className="animate-spin"
                        />
                      )}
                      {isLong ? (
                        // LONG SALIDA: Flecha ROJA apuntando HACIA ABAJO (↓)
                        <>
                          <polygon
                            points="0,0 -3.6,-5.5 -1.2,-5.5 -1.2,-10 1.2,-10 1.2,-5.5 3.6,-5.5"
                            fill="#dc2626"
                            stroke="#ffffff"
                            strokeWidth={0.9}
                            strokeLinejoin="round"
                            style={{
                              filter: isFocused
                                ? 'drop-shadow(0 0 6px rgba(245,158,11,0.95))'
                                : 'drop-shadow(0 1px 3px rgba(0,0,0,0.85))'
                            }}
                            className="transition-transform group-hover:scale-125"
                          />
                          <circle cx={0} cy={0} r={1.3} fill="#ffffff" />
                        </>
                      ) : (
                        // SHORT SALIDA: Flecha VERDE apuntando HACIA ARRIBA (↑)
                        <>
                          <polygon
                            points="0,0 -3.6,5.5 -1.2,5.5 -1.2,10 1.2,10 1.2,5.5 3.6,5.5"
                            fill="#059669"
                            stroke="#ffffff"
                            strokeWidth={0.9}
                            strokeLinejoin="round"
                            style={{
                              filter: isFocused
                                ? 'drop-shadow(0 0 6px rgba(245,158,11,0.95))'
                                : 'drop-shadow(0 1px 3px rgba(0,0,0,0.85))'
                            }}
                            className="transition-transform group-hover:scale-125"
                          />
                          <circle cx={0} cy={0} r={1.3} fill="#ffffff" />
                        </>
                      )}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* BADGES Y TOOLTIPS COMPACTOS: SOLO PARA EL TRADE ENFOCADO O BAJO HOVER */}
          {closedTradesCoords.map((c) => {
            const hasEntry = c.entryX !== null && c.entryY !== null;
            const hasExit = c.exitX !== null && c.exitY !== null;
            if (!hasEntry && !hasExit) return null;

            const isFocused = focusedTrade?.id === c.id;
            const isHovered = hoveredTradeId === c.id;
            if (!isFocused && !isHovered) return null;

            const posX = hasEntry && hasExit ? (c.entryX! + c.exitX!) / 2 : (c.exitX ?? c.entryX!);
            const posY = hasEntry && hasExit ? (c.entryY! + c.exitY!) / 2 : (c.exitY ?? c.entryY!);
            const isLong = c.trade.side === 'LONG';

            return (
              <React.Fragment key={`history-badge-group-${c.id}`}>
                {/* Micro-Panel Flotante Compacto (Unificado: reemplaza el panel gigante superior) */}
                <div
                  style={{ left: `${posX}px`, top: `${posY - 8}px` }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute -translate-x-1/2 -translate-y-full pointer-events-auto z-40 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md bg-slate-950/92 backdrop-blur-xs text-white border border-slate-700/80 shadow-xl font-mono whitespace-nowrap animate-in fade-in"
                >
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[8.5px] leading-tight font-bold">
                    <span className={`px-1 py-0.2 rounded text-[7px] sm:text-[7.5px] font-black ${isLong ? 'bg-emerald-500 text-emerald-950' : 'bg-rose-500 text-rose-950'}`}>
                      {c.trade.side}
                    </span>
                    <span className="text-slate-300 font-medium">
                      ${c.trade.entry.toLocaleString()} ➔ ${c.trade.exitPrice.toLocaleString()}
                    </span>
                    <span className={`font-black ${c.trade.isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {c.trade.isProfit ? '+' : ''}${c.trade.pnlUsdt.toFixed(2)}
                    </span>

                    {/* Controles rápidos al estar enfocado */}
                    {isFocused && (
                      <div className="flex items-center gap-1 ml-0.5 pl-1 border-l border-slate-700">
                        {onReturnToLive && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onReturnToLive();
                            }}
                            className="px-1 py-0.2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[7px] sm:text-[7.5px] font-black cursor-pointer flex items-center gap-0.5 transition-all shadow-xs"
                            title={isEs ? 'Volver a velas en vivo' : 'Return to live chart'}
                          >
                            <RotateCcw className="w-2 h-2" />
                            <span>Live</span>
                          </button>
                        )}
                        {onClearFocusedTrade && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearFocusedTrade();
                            }}
                            className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title={isEs ? 'Cerrar' : 'Close'}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </>
      )}

      {/* Botón flotante discreto en esquina inferior derecha para volver a En Vivo cuando un trade está enfocado */}
      {focusedTrade && onReturnToLive && (
        <div className="absolute bottom-3 right-16 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={onReturnToLive}
            className="px-2 py-1 rounded-lg bg-amber-500/90 hover:bg-amber-400 backdrop-blur-xs text-slate-950 font-black text-[9px] shadow-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            title={isEs ? 'Volver a velas en vivo' : 'Return to live chart'}
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>{isEs ? 'Volver a En Vivo' : 'Back to Live'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
