import { IRiskRule, PreTradeContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Stop Loss Obligatorio:
 * Muchas firmas de fondeo exigen que toda orden deba incluir un Stop Loss definido.
 */
export class MandatoryStopLossRule implements IRiskRule {
  public readonly id = 'MANDATORY_STOP_LOSS';
  public readonly name = 'Stop Loss Obligatorio';

  public validatePreTrade(ctx: PreTradeContext): RiskRuleResult {
    // Si la regla está activa y el SL es 0 o negativo
    if (ctx.req.slPercent <= 0) {
      return {
        passed: false,
        ruleId: this.id,
        action: 'REJECT_ORDER',
        reason: 'Stop Loss obligatorio no configurado. La firma exige definir un SL antes de ejecutar la orden.'
      };
    }

    return {
      passed: true,
      ruleId: this.id
    };
  }
}
