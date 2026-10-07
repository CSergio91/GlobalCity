import { IRiskRule, PreTradeContext, InFlightContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Pérdida Diaria Máxima (Max Daily Drawdown):
 * Protege contra liquidaciones masivas en un solo día:
 * - Pre-Trade: Impide que una sola orden arriesgue más del límite diario total.
 * - In-Flight: Si la equidad actual de la cuenta perfora el umbral diario, ordena liquidar todo y pausar la cuenta.
 */
export class MaxDailyDrawdownRule implements IRiskRule {
  public readonly id = 'MAX_DAILY_DRAWDOWN';
  public readonly name = 'Pérdida Máxima Diaria';

  public validatePreTrade(ctx: PreTradeContext): RiskRuleResult {
    const maxAllowedSingleLoss = (ctx.metrics.settledBalance * ctx.rules.maxDailyLossPercent) / 100;
    
    if (ctx.estimatedLossUsd > maxAllowedSingleLoss) {
      return {
        passed: false,
        ruleId: this.id,
        action: 'REJECT_ORDER',
        reason: `El riesgo de la orden ($${ctx.estimatedLossUsd.toFixed(2)}) supera el límite diario de la Prop Firm ($${maxAllowedSingleLoss.toFixed(2)} / ${ctx.rules.maxDailyLossPercent}%).`
      };
    }

    return {
      passed: true,
      ruleId: this.id
    };
  }

  public evaluateInFlight(ctx: InFlightContext): RiskRuleResult {
    const dailyLossUsd = Math.max(0, ctx.dailyStartEquity - ctx.metrics.equity);
    const dailyLossPct = ctx.dailyStartEquity > 0 ? (dailyLossUsd / ctx.dailyStartEquity) * 100 : 0;

    if (dailyLossPct >= ctx.rules.maxDailyLossPercent) {
      return {
        passed: false,
        ruleId: this.id,
        action: 'CLOSE_ALL_POSITIONS',
        reason: `Límite diario de pérdida alcanzado (${dailyLossPct.toFixed(2)}% >= ${ctx.rules.maxDailyLossPercent}%). Cuenta pausada por reglas de Prop Firm.`,
        meta: { dailyLossPct, limitPct: ctx.rules.maxDailyLossPercent }
      };
    }

    return {
      passed: true,
      ruleId: this.id,
      meta: { dailyLossPct }
    };
  }
}
