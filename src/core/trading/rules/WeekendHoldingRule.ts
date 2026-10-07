import { IRiskRule, PreTradeContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Mantenimiento en Fin de Semana (Weekend Holding):
 * Exige aplanar posiciones antes del cierre del mercado los viernes por la tarde
 * si la firma prohíbe mantener riesgo durante el fin de semana.
 */
export class WeekendHoldingRule implements IRiskRule {
  public readonly id = 'WEEKEND_HOLDING';
  public readonly name = 'Mantenimiento en Fin de Semana';
  public readonly description = 'Controla si se permite mantener posiciones abiertas a través del fin de semana.';

  /**
   * Determina si el momento actual cae dentro de la ventana de fin de semana (Viernes 21:00 UTC a Domingo 22:00 UTC)
   */
  public static isWeekendWindow(date: Date = new Date()): boolean {
    const day = date.getUTCDay();
    const hour = date.getUTCHours();
    if (day === 5 && hour >= 21) return true; // Viernes noche
    if (day === 6) return true; // Sábado
    if (day === 0 && hour < 22) return true; // Domingo antes de apertura
    return false;
  }

  public validatePreTrade(ctx: PreTradeContext): RiskRuleResult {
    if (ctx.rules.allowWeekendHolding === false) {
      if (WeekendHoldingRule.isWeekendWindow()) {
        return {
          passed: false,
          ruleId: this.id,
          action: 'REJECT_ORDER',
          reason: 'Operativa restringida en fin de semana. La regla prohíbe mantener o abrir operaciones fuera del horario semanal.'
        };
      }
    }

    return {
      passed: true,
      ruleId: this.id
    };
  }
}
