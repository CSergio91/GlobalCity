import { IRiskRule, PreTradeContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla Anti-Hedging:
 * Prohíbe abrir órdenes en sentido opuesto (LONG vs SHORT) sobre el mismo activo.
 */
export class AntiHedgingRule implements IRiskRule {
  public readonly id = 'ANTI_HEDGING';
  public readonly name = 'Regla Anti-Hedging';
  public readonly description = 'Prohíbe mantener posiciones simultáneas en sentido opuesto en el mismo activo.';

  public validatePreTrade(ctx: PreTradeContext): RiskRuleResult {
    // Si la regla no está habilitada en la configuración de la cuenta
    if (!ctx.rules.antiHedgingEnabled) {
      return { passed: true, ruleId: this.id };
    }

    const incomingSide = ctx.req.side === 'buy' ? 'LONG' : 'SHORT';
    const oppositeSide = incomingSide === 'LONG' ? 'SHORT' : 'LONG';
    const currentSymbol = ctx.req.symbol.replace(/[\/\-_:]/g, '').toUpperCase();

    if (ctx.openPositions && ctx.openPositions.length > 0) {
      const hasOpposite = ctx.openPositions.some(p => {
        const pSym = p.symbol.replace(/[\/\-_:]/g, '').toUpperCase();
        return pSym === currentSymbol && p.side === oppositeSide && p.status === 'OPEN';
      });

      if (hasOpposite) {
        return {
          passed: false,
          ruleId: this.id,
          action: 'REJECT_ORDER',
          reason: `Violación Anti-Hedging: Ya existe una posición ${oppositeSide} abierta en ${ctx.req.symbol}. La firma prohíbe operar cobertura simultánea en el mismo activo.`
        };
      }
    }

    return {
      passed: true,
      ruleId: this.id
    };
  }
}
