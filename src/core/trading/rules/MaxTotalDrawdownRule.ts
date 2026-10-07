import { IRiskRule, InFlightContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Pérdida Máxima Total (Max Total Drawdown):
 * Evalúa el Drawdown total acumulado frente al balance inicial de la cuenta.
 * Si se supera, se invalida la cuenta de la Prop Firm.
 */
export class MaxTotalDrawdownRule implements IRiskRule {
  public readonly id = 'MAX_TOTAL_DRAWDOWN';
  public readonly name = 'Pérdida Máxima Total (Total Drawdown)';

  public evaluateInFlight(ctx: InFlightContext): RiskRuleResult {
    const totalLossUsd = Math.max(0, ctx.rules.initialBalance - ctx.metrics.equity);
    const totalLossPct = ctx.rules.initialBalance > 0 ? (totalLossUsd / ctx.rules.initialBalance) * 100 : 0;

    if (totalLossPct >= ctx.rules.maxTotalDrawdownPercent) {
      return {
        passed: false,
        ruleId: this.id,
        action: 'CLOSE_ALL_POSITIONS',
        reason: `Drawdown máximo total alcanzado (${totalLossPct.toFixed(2)}% >= ${ctx.rules.maxTotalDrawdownPercent}%). Regla de Prop Firm infringida.`,
        meta: { totalLossPct, limitPct: ctx.rules.maxTotalDrawdownPercent }
      };
    }

    return {
      passed: true,
      ruleId: this.id,
      meta: { totalLossPct }
    };
  }
}
