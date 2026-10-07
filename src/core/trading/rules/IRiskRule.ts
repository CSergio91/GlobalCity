/**
 * ZYTI Trade - Institutional Risk Rule Contract
 * Define la interfaz que debe implementar toda regla de riesgo pre-trade o in-flight.
 * Desacoplada al 100% para permitir configuración dinámica desde Supabase o APIs de Prop Firms.
 */

import { OrderRequest, AccountMetrics, PropFirmRuleConfig, PositionItem } from '../types';

export interface PreTradeContext {
  req: OrderRequest;
  currentPrice: number;
  metrics: AccountMetrics;
  rules: PropFirmRuleConfig;
  requiredMargin: number;
  notionalUsd: number;
  sizeUnits: number;
  estimatedLossUsd: number;
  estimatedProfitUsd: number;
  openPositions?: PositionItem[];
  todayRealizedPnl?: number;
}

export interface InFlightContext {
  metrics: AccountMetrics;
  dailyStartEquity: number;
  rules: PropFirmRuleConfig;
}

export interface RiskRuleResult {
  passed: boolean;
  ruleId: string;
  reason?: string;
  action?: 'REJECT_ORDER' | 'CLOSE_ALL_POSITIONS' | 'FLAG_BREACH' | 'NOTIFY_TRADER';
  meta?: Record<string, any>;
}

export interface IRiskRule {
  readonly id: string;
  readonly name: string;
  readonly description?: string;

  /**
   * Validación previa al envío de la orden (síncrona sub-milisegundo)
   */
  validatePreTrade?(ctx: PreTradeContext): RiskRuleResult;

  /**
   * Monitor continuo de cumplimiento en tiempo real con cada tick o variación de equidad
   */
  evaluateInFlight?(ctx: InFlightContext): RiskRuleResult;
}
