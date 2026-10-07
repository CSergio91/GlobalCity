/**
 * ZYTI Trade - Trading Engine & Risk Core Contracts
 * Modelos de datos TypeScript 100% puros y desacoplados de React y del DOM.
 * Compatibles con Web Workers, Node.js, PostgreSQL y microservicios.
 */

export type MarketType = 'spot' | 'futures';
export type OrderSide = 'buy' | 'sell';
export type PositionSide = 'LONG' | 'SHORT';
export type OrderType = 'market' | 'limit';
export type PositionStatus = 'OPEN' | 'CLOSED';

export interface OrderRequest {
  symbol: string;
  exchange?: string;
  marketType?: MarketType;
  side: OrderSide;
  orderType: OrderType;
  orderMode: 'amount' | 'risk';
  amountUsdt?: number;
  riskPercent?: number;
  slPercent: number;
  tpPercent: number;
  leverage: number;
  limitPrice?: number;
}

export interface PositionItem {
  id: string; // UUID v4 / v7
  userId?: string;
  symbol: string;
  exchange?: string;
  marketType?: MarketType;
  side: PositionSide;
  orderType: OrderType;
  status: PositionStatus;
  size: string;
  sizeUnits: number;
  entry: number;
  entryTimestamp: number;
  mark: number;
  slPrice?: number | null;
  tpPrice?: number | null;
  riskPercent?: number | null;
  slPercent?: number | null;
  tpPercent?: number | null;
  leverage: number;
  collateralUsdt: number;
  pnlUsdt: number;
  pnlPercentNum: number;
  pnl: string;
  pnlPercent: string;
  isProfit: boolean;
  createdAt: string; // ISO 8601
  closedAt?: string | null;
}

export interface LimitOrderItem {
  id: string; // UUID v4 / v7
  userId?: string;
  symbol: string;
  exchange?: string;
  marketType?: MarketType;
  side: OrderSide;
  orderType: 'limit';
  orderSubtype?: 'LIMIT' | 'STOP';
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  limitPrice: number;
  placedAtPrice: number; // Precio de mercado en el momento de colocación o ajuste de la orden
  size: string;
  sizeUnits: number;
  amountUsdt: number;
  collateralUsdt: number;
  leverage: number;
  riskPercent?: number;
  slPercent: number;
  tpPercent: number;
  slPrice: number;
  tpPrice: number;
  createdAt: string; // ISO 8601
  filledAt?: string | null;
}

export interface LimitEvaluationResult {
  remainingOrders: LimitOrderItem[];
  filledOrders: LimitOrderItem[];
  newlyOpenedPositions: PositionItem[];
}

export interface AccountMetrics {
  settledBalance: number;
  lockedMargin: number;
  availableBalance: number;
  unrealizedPnL: number;
  equity: number;
  openPositionsCount: number;
  isMarginCall: boolean;
}

export interface PropFirmRuleConfig {
  id: string;
  firmName: string; // e.g. "FTMO", "Funding Pips", "E8", "ZYTI Prop"
  initialBalance: number;
  modelType?: 'INSTANT_FUNDING' | 'ONE_PHASE' | 'TWO_PHASE';
  maxDailyLossPercent: number; // e.g. 5% diario
  maxTotalDrawdownPercent: number; // e.g. 10% total
  maxTrailingDrawdownPercent?: number; // e.g. 6% trailing
  drawdownType?: 'EOD' | 'TRAILING_EQUITY';
  profitTargetPercent?: number;
  profitTargetPhase2Percent?: number;
  maxLeverage: number; // e.g. 30x o 100x
  mandatoryStopLoss?: boolean;
  maxPositionsPerSymbolEnabled?: boolean;
  maxPositionsPerSymbol?: number;
  maxTotalOpenPositionsEnabled?: boolean;
  maxTotalOpenPositions?: number;
  antiHedgingEnabled?: boolean;
  maxRiskPerTradePercent?: number;
  consistencyRulePercent?: number;
  minTradingDays?: number;
  minDailyProfitType?: 'PERCENT' | 'AMOUNT';
  minDailyProfitValue?: number;
  allowWeekendHolding?: boolean;
  allowNewsTrading?: boolean;
  minTradeDurationSeconds?: number;
  profitSplitPercent?: number;
  inactivityDaysLimit?: number;
}

export interface RiskCheckResult {
  allowed: boolean;
  reason?: string;
  requiredMargin: number;
  notionalUsd: number;
  sizeUnits: number;
  estimatedLossUsd: number;
  estimatedProfitUsd: number;
}

export interface TickEvaluationResult {
  updatedPositions: PositionItem[];
  closedPositions: PositionItem[];
  balanceDelta: number;
  events: Array<{
    type: 'TP_HIT' | 'SL_HIT';
    position: PositionItem;
    realizedPnL: number;
    price: number;
  }>;
}
