/**
 * GLOBAL CITY — RISK ENGINE CONTRACTS
 * Regla 25: Pre-Trade Risk validation mandatoria.
 */

export interface RiskRuleViolation {
  ruleName: string;
  reason: string;
  currentValue: number;
  limitValue: number;
}

export interface RiskDecision {
  approved: boolean;
  intentId: string;
  evaluatedAt: number;
  violations: RiskRuleViolation[];
}

export interface RiskLimitsConfig {
  organizationId: string;
  accountId: string;
  maxOrderNotionalUSD: number;
  maxPositionNotionalUSD: number;
  maxLeverage: number;
  maxDailyLossUSD: number;
  maxConcurrentOrders: number;
  circuitBreakerActive: boolean;
}
