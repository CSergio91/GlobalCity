import { IRiskRule, PreTradeContext, RiskRuleResult } from './IRiskRule';

/**
 * Regla de Periodo de Inactividad:
 * Controla si la cuenta ha superado el número máximo de días consecutivos sin registrar
 * ninguna operación activa, congelando o expirando la evaluación según la política de la firma.
 */
export class InactivityPeriodRule implements IRiskRule {
  public readonly id = 'INACTIVITY_PERIOD';
  public readonly name = 'Límite de Inactividad';
  public readonly description = 'Congela o expira cuentas que permanezcan inactivas más días de los autorizados.';

  public static isAccountInactive(lastTradeDate: string | null, maxInactiveDays: number = 30): boolean {
    if (!lastTradeDate) return false;
    const last = new Date(lastTradeDate).getTime();
    const now = Date.now();
    const diffDays = (now - last) / (1000 * 60 * 60 * 24);
    return diffDays > maxInactiveDays;
  }

  public validatePreTrade(ctx: PreTradeContext): RiskRuleResult {
    const limit = ctx.rules.inactivityDaysLimit ?? 30;
    const lastDate = (ctx.metrics as any).lastTradeDate ?? null;

    if (InactivityPeriodRule.isAccountInactive(lastDate, limit)) {
      return {
        passed: false,
        ruleId: this.id,
        action: 'REJECT_ORDER',
        reason: `Cuenta congelada por inactividad prolongada (más de ${limit} días sin operar). Contacte con soporte para reactivar.`
      };
    }

    return {
      passed: true,
      ruleId: this.id
    };
  }
}
