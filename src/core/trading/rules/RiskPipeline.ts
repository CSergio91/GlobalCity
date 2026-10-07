import { IRiskRule, PreTradeContext, InFlightContext, RiskRuleResult } from './IRiskRule';

/**
 * Tubería de Ejecución de Riesgo (Risk Pipeline):
 * Ejecuta en serie las reglas de riesgo registradas para la cuenta.
 * Si alguna regla rechaza la orden o activa un circuit breaker, detiene el flujo de inmediato.
 */
export class RiskPipeline {
  private rules: IRiskRule[] = [];

  constructor(initialRules: IRiskRule[] = []) {
    this.rules = [...initialRules];
  }

  public addRule(rule: IRiskRule): this {
    this.rules.push(rule);
    return this;
  }

  public removeRule(ruleId: string): this {
    this.rules = this.rules.filter((r) => r.id !== ruleId);
    return this;
  }

  public clearRules(): void {
    this.rules = [];
  }

  public getRules(): readonly IRiskRule[] {
    return this.rules;
  }

  /**
   * Ejecuta la validación Pre-Trade a través de todas las reglas activas.
   */
  public executePreTrade(ctx: PreTradeContext): RiskRuleResult {
    for (const rule of this.rules) {
      if (rule.validatePreTrade) {
        const result = rule.validatePreTrade(ctx);
        if (!result.passed) {
          return result;
        }
      }
    }

    return {
      passed: true,
      ruleId: 'ALL_PASSED'
    };
  }

  /**
   * Ejecuta la evaluación In-Flight (monitoreo en tiempo real con cada tick o cambio de equidad).
   */
  public executeInFlight(ctx: InFlightContext): RiskRuleResult {
    for (const rule of this.rules) {
      if (rule.evaluateInFlight) {
        const result = rule.evaluateInFlight(ctx);
        if (!result.passed) {
          return result;
        }
      }
    }

    return {
      passed: true,
      ruleId: 'ALL_PASSED'
    };
  }
}
