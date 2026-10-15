import { IRiskRule, PreTradeContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Activos Cripto Autorizados (Allowed Symbols):
 * Garantiza que la orden pertenezca al catálogo permitido por el desafío
 * (ej: Desafío Exclusivo de Memes, Solo Majors BTC/ETH, o Todos los Pares).
 */
export class AllowedSymbolsRule implements IRiskRule {
  public readonly id = 'ALLOWED_SYMBOLS';
  public readonly name = 'Activos Permitidos del Reto';

  public validatePreTrade(ctx: PreTradeContext): RiskRuleResult {
    const allowed = ctx.rules.allowedSymbols;
    
    // Si no está configurado, está vacío, o contiene 'ALL', todos los pares están permitidos
    if (!allowed || !Array.isArray(allowed) || allowed.length === 0 || allowed.includes('ALL')) {
      return {
        passed: true,
        ruleId: this.id
      };
    }

    const orderSym = (ctx.req.symbol || '').replace('/', '').toUpperCase();
    const orderSymWithSlash = ctx.req.symbol.toUpperCase();

    const isMatch = allowed.some(a => {
      const clean = a.replace('/', '').toUpperCase();
      return clean === orderSym || a.toUpperCase() === orderSymWithSlash;
    });

    if (!isMatch) {
      return {
        passed: false,
        ruleId: this.id,
        action: 'REJECT_ORDER',
        reason: `El activo ${ctx.req.symbol} no está autorizado para este desafío (${allowed.length} activos permitidos).`
      };
    }

    return {
      passed: true,
      ruleId: this.id
    };
  }
}
