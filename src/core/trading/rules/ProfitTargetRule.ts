import { IRiskRule, PreTradeContext, InFlightContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Objetivo de Beneficio (Profit Target & Auto-Pass):
 * Comprueba si la cuenta en reto (Fase 1 o Fase 2) ha alcanzado el porcentaje de ganancia requerido
 * habiendo completado los días mínimos de trading calificados.
 */
export class ProfitTargetRule implements IRiskRule {
  public readonly id = 'PROFIT_TARGET';
  public readonly name = 'Objetivo de Ganancia (Profit Target)';
  public readonly description = 'Evalúa si la cuenta alcanzó el objetivo de ganancia para aprobar la fase actual.';

  public validatePreTrade(_ctx: PreTradeContext): RiskRuleResult {
    return {
      passed: true,
      ruleId: this.id
    };
  }

  public evaluateInFlight(ctx: InFlightContext): RiskRuleResult {
    // Si es modelo de fondeo inmediato, no tiene objetivo de ganancia
    if (ctx.rules.modelType === 'INSTANT_FUNDING') {
      return {
        passed: true,
        ruleId: this.id
      };
    }

    const targetPct = ctx.rules.profitTargetPercent ?? 10.0;
    const initialBalance = ctx.rules.initialBalance || 100000;
    const currentEquity = ctx.metrics.equity;
    const profitUsd = currentEquity - initialBalance;
    const profitPct = initialBalance > 0 ? (profitUsd / initialBalance) * 100 : 0;

    const minDays = ctx.rules.minTradingDays ?? 5;
    const tradingDaysCount = (ctx.metrics as any).tradingDaysCount ?? 0;

    if (profitPct >= targetPct && tradingDaysCount >= minDays) {
      return {
        passed: true,
        ruleId: this.id,
        action: 'NOTIFY_TRADER',
        reason: `¡Objetivo de ganancia alcanzado (+${profitPct.toFixed(2)}%)! Evaluación completada con éxito.`,
        meta: {
          targetReached: true,
          achievedProfitPct: Number(profitPct.toFixed(2)),
          tradingDaysCount
        }
      };
    }

    return {
      passed: true,
      ruleId: this.id,
      meta: {
        targetReached: false,
        currentProfitPct: Number(profitPct.toFixed(2)),
        targetPct
      }
    };
  }
}
