/**
 * GLOBAL CITY — PRE-TRADE RISK ENGINE
 * Regla 25: Pre-Trade Risk Engine síncrono.
 * "Toda orden debe pasar por Risk antes de ser enviada al OMS."
 */

import { ExecutionIntent, RiskDecision, RiskLimitsConfig } from '../../packages/contracts/src';

export class RiskEngine {
  constructor(private readonly limits: RiskLimitsConfig) {}

  public evaluateIntent(intent: ExecutionIntent, currentExposureUSD: number): RiskDecision {
    const violations = [];

    if (this.limits.circuitBreakerActive) {
      violations.push({
        ruleName: 'CIRCUIT_BREAKER',
        reason: 'Circuit breaker is currently active. All trading halted.',
        currentValue: 1,
        limitValue: 0
      });
    }

    const estimatedNotional = intent.quantity * (intent.limitPrice || 1);
    if (estimatedNotional > this.limits.maxOrderNotionalUSD) {
      violations.push({
        ruleName: 'MAX_ORDER_NOTIONAL',
        reason: `Order notional ($${estimatedNotional.toFixed(2)}) exceeds maximum allowed ($${this.limits.maxOrderNotionalUSD.toFixed(2)}).`,
        currentValue: estimatedNotional,
        limitValue: this.limits.maxOrderNotionalUSD
      });
    }

    if (currentExposureUSD + estimatedNotional > this.limits.maxPositionNotionalUSD) {
      violations.push({
        ruleName: 'MAX_POSITION_NOTIONAL',
        reason: `Total exposure ($${(currentExposureUSD + estimatedNotional).toFixed(2)}) exceeds max position limit ($${this.limits.maxPositionNotionalUSD.toFixed(2)}).`,
        currentValue: currentExposureUSD + estimatedNotional,
        limitValue: this.limits.maxPositionNotionalUSD
      });
    }

    return {
      approved: violations.length === 0,
      intentId: intent.intentId,
      evaluatedAt: Date.now(),
      violations
    };
  }
}
