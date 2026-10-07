import { IRiskRule, PreTradeContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Margen Disponible:
 * Impide enviar órdenes si el margen requerido supera el margen libre disponible de la cuenta.
 */
export class AvailableMarginRule implements IRiskRule {
  public readonly id = 'AVAILABLE_MARGIN';
  public readonly name = 'Verificación de Margen Libre';

  public validatePreTrade(ctx: PreTradeContext): RiskRuleResult {
    if (ctx.requiredMargin > ctx.metrics.availableBalance) {
      return {
        passed: false,
        ruleId: this.id,
        action: 'REJECT_ORDER',
        reason: `Margen insuficiente. Requiere $${ctx.requiredMargin.toLocaleString()} USDT, pero solo hay disponible $${ctx.metrics.availableBalance.toFixed(2)} USDT.`
      };
    }

    return {
      passed: true,
      ruleId: this.id
    };
  }
}
