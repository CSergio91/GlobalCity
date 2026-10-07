import { IRiskRule, PreTradeContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Límite Total de Operaciones Abiertas Simultáneas:
 * Impide la dispersión excesiva de margen y riesgo en la cuenta del operador.
 */
export class MaxTotalOpenPositionsRule implements IRiskRule {
  public readonly id = 'MAX_TOTAL_OPEN_POSITIONS';
  public readonly name = 'Límite Total de Operaciones';
  public readonly description = 'Restringe el número global de posiciones abiertas concurrentes en la cuenta.';

  public validatePreTrade(ctx: PreTradeContext): RiskRuleResult {
    if (!ctx.rules.maxTotalOpenPositionsEnabled) {
      return { passed: true, ruleId: this.id };
    }

    const limit = ctx.rules.maxTotalOpenPositions ?? 5;
    const currentCount = ctx.openPositions 
      ? ctx.openPositions.filter(p => p.status === 'OPEN').length 
      : ctx.metrics.openPositionsCount;

    if (currentCount >= limit) {
      return {
        passed: false,
        ruleId: this.id,
        action: 'REJECT_ORDER',
        reason: `Límite total de operaciones alcanzado: La cuenta ya tiene ${currentCount} posiciones abiertas. El máximo permitido es ${limit}.`
      };
    }

    return {
      passed: true,
      ruleId: this.id
    };
  }
}
