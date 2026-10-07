import { IRiskRule, PreTradeContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Límite de Operaciones Abiertas por Activo:
 * Evita la sobre-exposición concentrada limitando la cantidad de órdenes concurrentes en un mismo par.
 */
export class MaxPositionsPerSymbolRule implements IRiskRule {
  public readonly id = 'MAX_POSITIONS_PER_SYMBOL';
  public readonly name = 'Límite de Operaciones por Activo';
  public readonly description = 'Restringe el número máximo de posiciones abiertas concurrentes en un mismo símbolo.';

  public validatePreTrade(ctx: PreTradeContext): RiskRuleResult {
    if (!ctx.rules.maxPositionsPerSymbolEnabled) {
      return { passed: true, ruleId: this.id };
    }

    const limit = ctx.rules.maxPositionsPerSymbol ?? 2;
    const targetSymbol = ctx.req.symbol.replace(/[\/\-_:]/g, '').toUpperCase();

    if (ctx.openPositions && ctx.openPositions.length > 0) {
      const openInSymbol = ctx.openPositions.filter(p => {
        const pSym = p.symbol.replace(/[\/\-_:]/g, '').toUpperCase();
        return pSym === targetSymbol && p.status === 'OPEN';
      }).length;

      if (openInSymbol >= limit) {
        return {
          passed: false,
          ruleId: this.id,
          action: 'REJECT_ORDER',
          reason: `Límite por activo alcanzado: Ya existen ${openInSymbol} posiciones abiertas en ${ctx.req.symbol}. El máximo autorizado por la firma es ${limit}.`
        };
      }
    }

    return {
      passed: true,
      ruleId: this.id
    };
  }
}
