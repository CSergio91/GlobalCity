import { IRiskRule, PreTradeContext, InFlightContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Días Mínimos de Trading con Ganancia Calificada:
 * Exige acumular un número mínimo de jornadas operadas donde el beneficio neto cerrado
 * supere un umbral específico (% o $). Días en pérdida o con $0 no cuentan.
 */
export class QualifiedMinTradingDaysRule implements IRiskRule {
  public readonly id = 'QUALIFIED_MIN_TRADING_DAYS';
  public readonly name = 'Días Mínimos de Trading Calificados';
  public readonly description = 'Exige alcanzar un beneficio diario mínimo para que la jornada compute hacia el objetivo de días requeridos.';

  /**
   * Evalúa si una ganancia realizada en el día califica como jornada válida
   */
  public static isDayQualified(
    realizedPnl: number,
    initialBalance: number,
    minProfitType: 'PERCENT' | 'AMOUNT' = 'PERCENT',
    minProfitValue: number = 0.5
  ): boolean {
    if (realizedPnl <= 0) return false;
    const requiredUsd = minProfitType === 'AMOUNT'
      ? minProfitValue
      : (initialBalance * minProfitValue) / 100;
    return realizedPnl >= requiredUsd;
  }

  public validatePreTrade(_ctx: PreTradeContext): RiskRuleResult {
    // La regla no bloquea órdenes pre-trade, sino que audita la calificación de días
    return {
      passed: true,
      ruleId: this.id
    };
  }

  public evaluateInFlight(ctx: InFlightContext): RiskRuleResult {
    return {
      passed: true,
      ruleId: this.id,
      meta: {
        minTradingDaysRequired: ctx.rules.minTradingDays ?? 5,
        minDailyProfitValue: ctx.rules.minDailyProfitValue ?? 0.5,
        minDailyProfitType: ctx.rules.minDailyProfitType ?? 'PERCENT'
      }
    };
  }
}
