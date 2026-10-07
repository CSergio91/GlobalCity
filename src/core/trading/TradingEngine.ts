/**
 * ZYTI Trade - Pure Trading Engine (OMS / EMS Core)
 * Motor transaccional desacoplado de React y del DOM.
 * Puede ejecutarse en el navegador, en un Web Worker dedicado o en Node.js/Bun en el backend.
 */

import { 
  OrderRequest, 
  PositionItem, 
  LimitOrderItem,
  LimitEvaluationResult,
  AccountMetrics, 
  TickEvaluationResult,
  PropFirmRuleConfig 
} from './types';
import { RiskEngine, DEFAULT_PROP_FIRM_RULES } from './RiskEngine';
import { RiskPipeline } from './rules';

// Generador de UUIDv4 compatible con navegadores, túneles locales y workers
export const generateTradeId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export class TradingEngine {
  /**
   * Calcula las métricas de la cuenta (Balance, Margen bloqueado, Margen disponible y Equity).
   */
  public static calculateAccountMetrics(
    settledBalance: number,
    positions: PositionItem[],
    limitOrders: LimitOrderItem[] = []
  ): AccountMetrics {
    const lockedMarginPositions = positions.reduce((acc, p) => acc + (p.collateralUsdt || 0), 0);
    const lockedMarginLimits = limitOrders.reduce((acc, o) => acc + (o.collateralUsdt || 0), 0);
    const lockedMargin = Number((lockedMarginPositions + lockedMarginLimits).toFixed(2));
    const availableBalance = Math.max(0, Number((settledBalance - lockedMargin).toFixed(2)));
    const unrealizedPnL = Number(positions.reduce((acc, p) => acc + (p.pnlUsdt || 0), 0).toFixed(2));
    const equity = Number((settledBalance + unrealizedPnL).toFixed(2));

    return {
      settledBalance,
      lockedMargin,
      availableBalance,
      unrealizedPnL,
      equity,
      openPositionsCount: positions.length,
      isMarginCall: availableBalance <= 0 && unrealizedPnL < 0
    };
  }

  /**
   * Apertura de Posición con Pre-Trade Risk Check.
   */
  public static openPosition(
    req: OrderRequest,
    currentPrice: number,
    entryTimestamp: number,
    metrics: AccountMetrics,
    rules: PropFirmRuleConfig = DEFAULT_PROP_FIRM_RULES,
    customPipeline?: RiskPipeline
  ): { success: boolean; position?: PositionItem; error?: string } {
    // 1. Pre-Trade Risk Validation con Pipeline Dinámico de la Cuenta
    const pipeline = customPipeline || RiskEngine.createPipelineForFirm(rules);
    const riskCheck = RiskEngine.evaluateOrderRisk(req, metrics, currentPrice, rules, pipeline);
    if (!riskCheck.allowed) {
      return { success: false, error: riskCheck.reason };
    }

    const isLong = req.side === 'buy';

    // 2. Cálculo estricto de precios SL / TP
    const calculatedSlPrice = isLong
      ? Number((currentPrice * (1 - req.slPercent / 100)).toFixed(2))
      : Number((currentPrice * (1 + req.slPercent / 100)).toFixed(2));

    const calculatedTpPrice = isLong
      ? Number((currentPrice * (1 + req.tpPercent / 100)).toFixed(2))
      : Number((currentPrice * (1 - req.tpPercent / 100)).toFixed(2));

    const newPosition: PositionItem = {
      id: generateTradeId(),
      symbol: req.symbol,
      exchange: req.exchange,
      marketType: req.marketType,
      side: isLong ? 'LONG' : 'SHORT',
      orderType: req.orderType,
      status: 'OPEN',
      size: `${riskCheck.sizeUnits.toFixed(4)} ${req.symbol.split('/')[0]}`,
      sizeUnits: riskCheck.sizeUnits,
      entry: currentPrice,
      entryTimestamp,
      mark: currentPrice,
      slPrice: calculatedSlPrice,
      tpPrice: calculatedTpPrice,
      riskPercent: req.riskPercent,
      slPercent: req.slPercent,
      tpPercent: req.tpPercent,
      leverage: req.leverage,
      collateralUsdt: riskCheck.requiredMargin,
      pnlUsdt: 0,
      pnlPercentNum: 0,
      pnl: '$0.00 USDT',
      pnlPercent: '0.00%',
      isProfit: true,
      createdAt: new Date().toISOString()
    };

    return { success: true, position: newPosition };
  }

  /**
   * Evaluación de Posiciones al recibir un Tick del Market Worker:
   * Monitorea TP / SL e impacta el balance en caso de ejecución.
   */
  public static evaluatePositionsOnTick(
    positions: PositionItem[],
    currentPrice: number,
    symbol: string,
    exchange?: string
  ): TickEvaluationResult {
    if (positions.length === 0 || !currentPrice || isNaN(currentPrice) || currentPrice <= 0) {
      return { updatedPositions: positions, closedPositions: [], balanceDelta: 0, events: [] };
    }

    let balanceDelta = 0;
    const updatedPositions: PositionItem[] = [];
    const closedPositions: PositionItem[] = [];
    const events: TickEvaluationResult['events'] = [];

    const normTickSym = (symbol || '').replace('/', '').toUpperCase();

    for (const pos of positions) {
      // 1. Filtro estricto de símbolo normalizado (ej. 'BTC/USDT' vs 'BTCUSDT')
      const normPosSym = (pos.symbol || '').replace('/', '').toUpperCase();
      if (normPosSym !== normTickSym) {
        updatedPositions.push(pos);
        continue;
      }

      // 2. Si la posición tiene exchange fijado y el tick proviene de otro exchange, no cerrar por fluctuaciones externas
      if (pos.exchange && exchange && pos.exchange.toLowerCase() !== exchange.toLowerCase()) {
        updatedPositions.push(pos);
        continue;
      }

      // 3. Protección de integridad de precio (Sanity check): descartar anomalías absurdas (>35% de salto instantáneo de precio contra la entrada)
      if (pos.entry > 0 && Math.abs(currentPrice - pos.entry) / pos.entry > 0.35) {
        updatedPositions.push(pos);
        continue;
      }

      const isLong = pos.side === 'LONG';

      // 1. Verificación Take Profit
      if (pos.tpPrice) {
        const hitTP = isLong ? currentPrice >= pos.tpPrice : currentPrice <= pos.tpPrice;
        if (hitTP) {
          const pnlWin = Math.abs(pos.tpPrice - pos.entry) * pos.sizeUnits;
          balanceDelta += pnlWin;
          const closed = {
            ...pos,
            status: 'CLOSED' as const,
            mark: pos.tpPrice,
            pnlUsdt: pnlWin,
            pnlPercentNum: pos.collateralUsdt > 0 ? (pnlWin / pos.collateralUsdt) * 100 : 0,
            closedAt: new Date().toISOString()
          };
          closedPositions.push(closed);
          events.push({
            type: 'TP_HIT',
            position: closed,
            realizedPnL: pnlWin,
            price: pos.tpPrice
          });
          continue;
        }
      }

      // 2. Verificación Stop Loss (soporta riesgo estándar, Break-Even exacto y trailing stop en ganancia)
      if (pos.slPrice) {
        const hitSL = isLong ? currentPrice <= pos.slPrice : currentPrice >= pos.slPrice;
        if (hitSL) {
          const rawPnL = isLong
            ? (pos.slPrice - pos.entry) * pos.sizeUnits
            : (pos.entry - pos.slPrice) * pos.sizeUnits;
          const pnlVal = Number(rawPnL.toFixed(2));
          balanceDelta += pnlVal;
          const isProfit = pnlVal >= 0;
          const closed = {
            ...pos,
            status: 'CLOSED' as const,
            mark: pos.slPrice,
            pnlUsdt: pnlVal,
            pnlPercentNum: pos.collateralUsdt > 0 ? Number(((pnlVal / pos.collateralUsdt) * 100).toFixed(2)) : 0,
            pnl: `${isProfit ? '+' : ''}${pnlVal.toFixed(2)} USDT`,
            pnlPercent: `${isProfit ? '+' : ''}${pos.collateralUsdt > 0 ? ((pnlVal / pos.collateralUsdt) * 100).toFixed(2) : '0.00'}%`,
            isProfit,
            closedAt: new Date().toISOString()
          };
          closedPositions.push(closed);
          events.push({
            type: 'SL_HIT',
            position: closed,
            realizedPnL: pnlVal,
            price: pos.slPrice
          });
          continue;
        }
      }

      // 3. PnL no realizado en vivo
      const priceDiff = isLong ? (currentPrice - pos.entry) : (pos.entry - currentPrice);
      const pnlUsdt = Number((priceDiff * pos.sizeUnits).toFixed(2));
      const pnlPercentNum = pos.collateralUsdt > 0 ? Number(((pnlUsdt / pos.collateralUsdt) * 100).toFixed(2)) : 0;
      const isProfit = pnlUsdt >= 0;

      updatedPositions.push({
        ...pos,
        mark: currentPrice,
        pnlUsdt,
        pnlPercentNum,
        pnl: `${isProfit ? '+' : ''}${pnlUsdt.toFixed(2)} USDT`,
        pnlPercent: `${isProfit ? '+' : ''}${pnlPercentNum.toFixed(2)}%`,
        isProfit
      });
    }

    return {
      updatedPositions,
      closedPositions,
      balanceDelta,
      events
    };
  }

  /**
   * Cierre manual de posición a precio de mercado.
   */
  public static closePosition(
    positions: PositionItem[],
    positionId: string
  ): { remainingPositions: PositionItem[]; closedPosition: PositionItem | null; realizedPnL: number } {
    const target = positions.find((p) => p.id === positionId);
    if (!target) {
      return { remainingPositions: positions, closedPosition: null, realizedPnL: 0 };
    }

    const remainingPositions = positions.filter((p) => p.id !== positionId);
    const closedPosition: PositionItem = {
      ...target,
      status: 'CLOSED',
      closedAt: new Date().toISOString()
    };

    return {
      remainingPositions,
      closedPosition,
      realizedPnL: target.pnlUsdt
    };
  }

  /**
   * Actualización de precios de SL / TP (soporta null para eliminar la orden).
   */
  public static updatePositionSLTP(
    positions: PositionItem[],
    id: string,
    slPrice?: number | null,
    tpPrice?: number | null
  ): PositionItem[] {
    return positions.map((pos) => {
      if (pos.id !== id) return pos;
      return {
        ...pos,
        slPrice: slPrice === null ? undefined : (slPrice !== undefined ? slPrice : pos.slPrice),
        tpPrice: tpPrice === null ? undefined : (tpPrice !== undefined ? tpPrice : pos.tpPrice)
      };
    });
  }

  /**
   * Creación de Orden Límite con Pre-Trade Risk Check.
   */
  public static createLimitOrder(
    req: OrderRequest,
    limitPrice: number,
    currentPrice: number,
    metrics: AccountMetrics,
    rules: PropFirmRuleConfig = DEFAULT_PROP_FIRM_RULES,
    customPipeline?: RiskPipeline
  ): { success: boolean; limitOrder?: LimitOrderItem; error?: string } {
    if (!limitPrice || isNaN(limitPrice) || limitPrice <= 0) {
      return { success: false, error: 'Precio límite no válido' };
    }

    // 1. Pre-Trade Risk Validation contra el precio límite con Pipeline Dinámico
    const pipeline = customPipeline || RiskEngine.createPipelineForFirm(rules);
    const riskCheck = RiskEngine.evaluateOrderRisk(req, metrics, limitPrice, rules, pipeline);
    if (!riskCheck.allowed) {
      return { success: false, error: riskCheck.reason };
    }

    const isLong = req.side === 'buy';

    // 2. Precios proyectados de SL y TP anclados al precio límite
    const calculatedSlPrice = isLong
      ? Number((limitPrice * (1 - req.slPercent / 100)).toFixed(2))
      : Number((limitPrice * (1 + req.slPercent / 100)).toFixed(2));

    const calculatedTpPrice = isLong
      ? Number((limitPrice * (1 + req.tpPercent / 100)).toFixed(2))
      : Number((limitPrice * (1 - req.tpPercent / 100)).toFixed(2));

    const refPrice = currentPrice > 0 ? currentPrice : limitPrice;
    const orderSubtype: 'LIMIT' | 'STOP' = isLong
      ? (limitPrice <= refPrice ? 'LIMIT' : 'STOP')
      : (limitPrice >= refPrice ? 'LIMIT' : 'STOP');

    const newLimitOrder: LimitOrderItem = {
      id: generateTradeId(),
      symbol: req.symbol,
      exchange: req.exchange,
      marketType: req.marketType,
      side: req.side,
      orderType: 'limit',
      orderSubtype,
      status: 'PENDING',
      limitPrice,
      placedAtPrice: refPrice,
      size: `${riskCheck.sizeUnits.toFixed(4)} ${req.symbol.split('/')[0]}`,
      sizeUnits: riskCheck.sizeUnits,
      amountUsdt: req.amountUsdt || 1000,
      collateralUsdt: riskCheck.requiredMargin,
      leverage: req.leverage,
      riskPercent: req.riskPercent,
      slPercent: req.slPercent,
      tpPercent: req.tpPercent,
      slPrice: calculatedSlPrice,
      tpPrice: calculatedTpPrice,
      createdAt: new Date().toISOString()
    };

    return { success: true, limitOrder: newLimitOrder };
  }

  /**
   * Modificación de Orden Límite pendiente (cuando se arrastra el límite, SL o TP en el gráfico).
   */
  public static updateLimitOrder(
    limitOrders: LimitOrderItem[],
    id: string,
    newLimitPrice?: number,
    newSlPrice?: number | null,
    newTpPrice?: number | null,
    currentMarketPrice?: number
  ): LimitOrderItem[] {
    return limitOrders.map((ord) => {
      if (ord.id !== id) return ord;
      const isLong = ord.side === 'buy';
      const nextLimit = (newLimitPrice !== undefined && newLimitPrice > 0) ? Number(newLimitPrice.toFixed(2)) : ord.limitPrice;
      const nextPlacedAt = (currentMarketPrice !== undefined && currentMarketPrice > 0) ? currentMarketPrice : ord.placedAtPrice;
      const nextSL = newSlPrice === null ? undefined : (newSlPrice !== undefined ? Number(newSlPrice.toFixed(2)) : ord.slPrice);
      const nextTP = newTpPrice === null ? undefined : (newTpPrice !== undefined ? Number(newTpPrice.toFixed(2)) : ord.tpPrice);

      const notional = ord.collateralUsdt * ord.leverage;
      const sizeUnits = nextLimit > 0 ? Number((notional / nextLimit).toFixed(4)) : ord.sizeUnits;
      const size = `${sizeUnits.toFixed(4)} ${ord.symbol.split('/')[0]}`;

      const nextSubtype: 'LIMIT' | 'STOP' = isLong
        ? (nextLimit <= nextPlacedAt ? 'LIMIT' : 'STOP')
        : (nextLimit >= nextPlacedAt ? 'LIMIT' : 'STOP');

      return {
        ...ord,
        orderSubtype: nextSubtype,
        limitPrice: nextLimit,
        placedAtPrice: nextPlacedAt,
        size,
        sizeUnits,
        slPrice: nextSL ?? ord.slPrice,
        tpPrice: nextTP ?? ord.tpPrice
      };
    });
  }

  /**
   * Evaluación de Órdenes Límite al recibir un Tick del Market Worker:
   * Convierte órdenes pendientes en posiciones activas SOLO cuando el precio de mercado toca o cruza el nivel límite.
   */
  public static evaluateLimitOrdersOnTick(
    limitOrders: LimitOrderItem[],
    currentPrice: number,
    symbol: string,
    exchange?: string
  ): LimitEvaluationResult {
    if (limitOrders.length === 0 || !currentPrice || isNaN(currentPrice) || currentPrice <= 0) {
      return { remainingOrders: limitOrders, filledOrders: [], newlyOpenedPositions: [] };
    }

    const remainingOrders: LimitOrderItem[] = [];
    const filledOrders: LimitOrderItem[] = [];
    const newlyOpenedPositions: PositionItem[] = [];

    const normTickSym = (symbol || '').replace('/', '').toUpperCase();

    for (const order of limitOrders) {
      if (order.status !== 'PENDING') continue;

      const normOrderSym = (order.symbol || '').replace('/', '').toUpperCase();
      if (normOrderSym !== normTickSym) {
        remainingOrders.push(order);
        continue;
      }

      if (order.exchange && exchange && order.exchange.toLowerCase() !== exchange.toLowerCase()) {
        remainingOrders.push(order);
        continue;
      }

      const isLong = order.side === 'buy';
      const placedAt = order.placedAtPrice || order.limitPrice;

      // Distinción institucional estricta:
      // BUY LIMIT: colocado por debajo del mercado -> se ejecuta cuando el precio baja a tocarlo (currentPrice <= limitPrice)
      // BUY STOP: colocado por encima del mercado -> se ejecuta cuando el precio sube a romperlo (currentPrice >= limitPrice)
      // SELL LIMIT: colocado por encima del mercado -> se ejecuta cuando el precio sube a tocarlo (currentPrice >= limitPrice)
      // SELL STOP: colocado por debajo del mercado -> se ejecuta cuando el precio baja a romperlo (currentPrice <= limitPrice)
      let isFilled = false;
      if (isLong) {
        if (order.limitPrice < placedAt - 0.0001) {
          // BUY LIMIT: Espera retroceso (dip) a la baja
          isFilled = currentPrice <= order.limitPrice;
        } else if (order.limitPrice > placedAt + 0.0001) {
          // BUY STOP: Espera ruptura (breakout) al alza
          isFilled = currentPrice >= order.limitPrice;
        } else {
          isFilled = false;
        }
      } else {
        if (order.limitPrice > placedAt + 0.0001) {
          // SELL LIMIT: Espera repunte (rally) para vender alto
          isFilled = currentPrice >= order.limitPrice;
        } else if (order.limitPrice < placedAt - 0.0001) {
          // SELL STOP: Espera ruptura (breakdown) a la baja
          isFilled = currentPrice <= order.limitPrice;
        } else {
          isFilled = false;
        }
      }

      if (isFilled) {
        const filledOrder: LimitOrderItem = {
          ...order,
          status: 'FILLED',
          filledAt: new Date().toISOString()
        };
        filledOrders.push(filledOrder);

        const newPos: PositionItem = {
          id: generateTradeId(), // Genera ID único para la posición abierta
          symbol: order.symbol,
          exchange: order.exchange,
          marketType: order.marketType,
          side: isLong ? 'LONG' : 'SHORT',
          orderType: 'limit',
          status: 'OPEN',
          size: order.size,
          sizeUnits: order.sizeUnits,
          entry: order.limitPrice, // La entrada es exactamente el precio límite pactado
          entryTimestamp: Date.now(),
          mark: order.limitPrice, // Al tocarse, el mark inicial es el precio de entrada (PnL = 0)
          slPrice: order.slPrice,
          tpPrice: order.tpPrice,
          riskPercent: order.riskPercent,
          slPercent: order.slPercent,
          tpPercent: order.tpPercent,
          leverage: order.leverage,
          collateralUsdt: order.collateralUsdt,
          pnlUsdt: 0,
          pnlPercentNum: 0,
          pnl: '$0.00 USDT',
          pnlPercent: '0.00%',
          isProfit: true,
          createdAt: new Date().toISOString()
        };
        newlyOpenedPositions.push(newPos);
      } else {
        remainingOrders.push(order);
      }
    }

    return {
      remainingOrders,
      filledOrders,
      newlyOpenedPositions
    };
  }

  /**
   * Cancelación manual de una orden límite pendiente.
   */
  public static cancelLimitOrder(
    limitOrders: LimitOrderItem[],
    orderId: string
  ): { remainingOrders: LimitOrderItem[]; cancelledOrder: LimitOrderItem | null } {
    const target = limitOrders.find((o) => o.id === orderId);
    if (!target) {
      return { remainingOrders: limitOrders, cancelledOrder: null };
    }

    const remainingOrders = limitOrders.filter((o) => o.id !== orderId);
    const cancelledOrder: LimitOrderItem = {
      ...target,
      status: 'CANCELLED'
    };

    return {
      remainingOrders,
      cancelledOrder
    };
  }
}
