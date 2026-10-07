import { IRiskRule, PreTradeContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Consistencia del 40% (Anti-Overleveraging / Anti-Lottery):
 * Impide que un operador apruebe o solicite retiros cuando una sola jornada operativa
 * representa más del porcentaje máximo establecido (ej. 40%) de las ganancias totales acumuladas.
 */
export class ConsistencyRule implements IRiskRule {
  public readonly id = 'CONSISTENCY_RULE';
  public readonly name = 'Regla de Consistencia';
  public readonly description = 'Ninguna jornada puede representar más del porcentaje máximo estipulado del beneficio total.';

  /**
   * Valida si la jornada con mayor ganancia cumple el ratio frente al profit total
   */
  public static validateConsistencyRatio(
    bestDayProfitUsd: number,
    totalGrossProfitUsd: number,
    maxPercent: number = 40.0
  ): { passed: boolean; ratioPercent: number; minTotalProfitNeeded: number } {
    if (totalGrossProfitUsd <= 0 || bestDayProfitUsd <= 0) {
      return { passed: true, ratioPercent: 0, minTotalProfitNeeded: 0 };
    }

    const ratioPercent = (bestDayProfitUsd / totalGrossProfitUsd) * 100;
    const minTotalProfitNeeded = bestDayProfitUsd / (maxPercent / 100);

    return {
      passed: ratioPercent <= maxPercent,
      ratioPercent: Number(ratioPercent.toFixed(2)),
      minTotalProfitNeeded: Number(minTotalProfitNeeded.toFixed(2))
    };
  }

  public validatePreTrade(_ctx: PreTradeContext): RiskRuleResult {
    return {
      passed: true,
      ruleId: this.id
    };
  }
}
