import { IRiskRule, PreTradeContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Trading en Noticias de Alto Impacto:
 * Restringe la apertura y cierre de órdenes en ventanas de alta volatilidad
 * (ej. 2 a 5 minutos antes y después de anuncios macro como FOMC, NFP o CPI).
 */
export class NewsTradingRule implements IRiskRule {
  public readonly id = 'NEWS_TRADING';
  public readonly name = 'Restricción de Noticias Macroeconómicas';
  public readonly description = 'Controla si se permite operar durante la ventana de noticias financieras de alto impacto.';

  public validatePreTrade(ctx: PreTradeContext): RiskRuleResult {
    // Si la firma prohíbe operar en noticias y la metadata de la orden o el calendario señala evento activo
    if (ctx.rules.allowNewsTrading === false) {
      // Flag en la metadata de contexto de mercado si se encuentra en ventana de noticia
      const isNewsWindow = (ctx.req as any).isHighImpactNewsWindow ?? false;
      if (isNewsWindow) {
        return {
          passed: false,
          ruleId: this.id,
          action: 'REJECT_ORDER',
          reason: 'Operativa restringida durante noticias de alto impacto (FOMC / NFP / CPI). Espere al cierre de la ventana de volatilidad.'
        };
      }
    }

    return {
      passed: true,
      ruleId: this.id
    };
  }
}
