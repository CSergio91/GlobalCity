import { IRiskRule, PreTradeContext, RiskRuleResult } from './IRiskRule';

/**
 * Restricción de Microscalping (< 10 segundos):
 * Elimina arbitrajes tóxicos de latencia prohibiendo que más del 50% de las ganancias
 * provengan de transacciones abiertas y cerradas en menos del umbral de duración (ej. 10s).
 */
export class MicroscalpingRule implements IRiskRule {
  public readonly id = 'MICROSCALPING_RESTRICTION';
  public readonly name = 'Restricción de Microscalping';
  public readonly description = 'Prohíbe transacciones de duración ultra-corta (< 10 segundos) que exploten latencia de simulación.';

  public static isMicroscalpTrade(openedAtMs: number, closedAtMs: number, minDurationSeconds: number = 10): boolean {
    const durationSeconds = (closedAtMs - openedAtMs) / 1000;
    return durationSeconds < minDurationSeconds;
  }

  public validatePreTrade(_ctx: PreTradeContext): RiskRuleResult {
    return {
      passed: true,
      ruleId: this.id
    };
  }
}
