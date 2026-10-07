import { IRiskRule, PreTradeContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Apalancamiento Máximo:
 * Garantiza que ninguna orden exceda el apalancamiento permitido por la Prop Firm o cuenta.
 */
export class MaxLeverageRule implements IRiskRule {
  public readonly id = 'MAX_LEVERAGE';
  public readonly name = 'Límite de Apalancamiento';

  public validatePreTrade(ctx: PreTradeContext): RiskRuleResult {
    if (ctx.req.leverage > ctx.rules.maxLeverage) {
      return {
        passed: false,
        ruleId: this.id,
        action: 'REJECT_ORDER',
        reason: `Apalancamiento de ${ctx.req.leverage}x excede el límite máximo permitido por la firma (${ctx.rules.maxLeverage}x).`
      };
    }

    return {
      passed: true,
      ruleId: this.id
    };
  }
}
