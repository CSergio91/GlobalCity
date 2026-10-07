/**
 * ZYTI Trade - Institutional Risk Engine Facade
 * Orquesta la tubería de reglas desacopladas (Rule Pipeline) para cuentas institucionales y Prop Firms.
 * 100% puro en memoria: evaluación sub-milisegundo agnóstica de frameworks.
 */

import { OrderRequest, AccountMetrics, PropFirmRuleConfig, RiskCheckResult } from './types';
import {
  RiskPipeline,
  AvailableMarginRule,
  MaxLeverageRule,
  MaxDailyDrawdownRule,
  MaxTotalDrawdownRule,
  MandatoryStopLossRule,
  AntiHedgingRule,
  MaxPositionsPerSymbolRule,
  MaxTotalOpenPositionsRule,
  QualifiedMinTradingDaysRule,
  ConsistencyRule,
  MicroscalpingRule,
  WeekendHoldingRule,
  NewsTradingRule,
  InactivityPeriodRule,
  ProfitTargetRule,
  PreTradeContext,
  InFlightContext
} from './rules';

export const DEFAULT_PROP_FIRM_RULES: PropFirmRuleConfig = {
  id: 'standard-eval',
  firmName: 'ZYTI Prop Evaluator',
  initialBalance: 100000, // 100K Cuenta Estandarizada
  maxDailyLossPercent: 5.0, // 5% pérdida diaria máxima ($5,000)
  maxTotalDrawdownPercent: 10.0, // 10% pérdida total acumulada ($10,000)
  maxTrailingDrawdownPercent: 6.0,
  maxLeverage: 100
};

export class RiskEngine {
  private static defaultPipeline: RiskPipeline = new RiskPipeline([
    new MaxLeverageRule(),
    new AvailableMarginRule(),
    new MaxDailyDrawdownRule(),
    new MaxTotalDrawdownRule()
  ]);

  /**
   * Genera una tubería de reglas configurada a medida para una Prop Firm específica
   * (ideal para instanciar según la configuración cargada desde Supabase).
   */
  public static createPipelineForFirm(rules: PropFirmRuleConfig): RiskPipeline {
    const pipeline = new RiskPipeline([
      new MaxLeverageRule(),
      new AvailableMarginRule(),
      new MaxDailyDrawdownRule(),
      new MaxTotalDrawdownRule()
    ]);

    // Reglas dinámicas inyectadas según el preset de la firma
    if (rules.mandatoryStopLoss || rules.id?.includes('strict') || rules.firmName?.toLowerCase().includes('strict')) {
      pipeline.addRule(new MandatoryStopLossRule());
    }
    if (rules.antiHedgingEnabled) {
      pipeline.addRule(new AntiHedgingRule());
    }
    if (rules.maxPositionsPerSymbolEnabled) {
      pipeline.addRule(new MaxPositionsPerSymbolRule());
    }
    if (rules.maxTotalOpenPositionsEnabled) {
      pipeline.addRule(new MaxTotalOpenPositionsRule());
    }
    if (rules.allowWeekendHolding === false) {
      pipeline.addRule(new WeekendHoldingRule());
    }
    if (rules.allowNewsTrading === false) {
      pipeline.addRule(new NewsTradingRule());
    }
    if (rules.inactivityDaysLimit) {
      pipeline.addRule(new InactivityPeriodRule());
    }
    if (rules.minTradingDays) {
      pipeline.addRule(new QualifiedMinTradingDaysRule());
    }
    if (rules.profitTargetPercent) {
      pipeline.addRule(new ProfitTargetRule());
    }

    return pipeline;
  }

  /**
   * Evaluación Pre-Trade Síncrona:
   * Calcula el tamaño institucional y pasa el contexto por la tubería de reglas desacopladas.
   */
  public static evaluateOrderRisk(
    req: OrderRequest,
    metrics: AccountMetrics,
    currentPrice: number,
    rules: PropFirmRuleConfig = DEFAULT_PROP_FIRM_RULES,
    customPipeline?: RiskPipeline
  ): RiskCheckResult {
    if (currentPrice <= 0) {
      return {
        allowed: false,
        reason: 'Precio de mercado inválido o no disponible.',
        requiredMargin: 0,
        notionalUsd: 0,
        sizeUnits: 0,
        estimatedLossUsd: 0,
        estimatedProfitUsd: 0
      };
    }

    // 1. Cálculo de tamaño institucional y notional
    let notionalUsd = 0;
    let requiredMargin = 0;
    let estimatedLossUsd = 0;
    let estimatedProfitUsd = 0;

    if (req.orderMode === 'risk') {
      const riskPercent = Math.max(0.1, req.riskPercent ?? 1);
      const slPercent = Math.max(0.1, req.slPercent);
      const riskAmountUsd = (metrics.settledBalance * riskPercent) / 100;
      
      notionalUsd = riskAmountUsd / (slPercent / 100);
      requiredMargin = Math.max(10, Math.round(notionalUsd / req.leverage));
      estimatedLossUsd = riskAmountUsd;
      estimatedProfitUsd = notionalUsd * (req.tpPercent / 100);
    } else {
      const amountUsdt = Math.max(10, req.amountUsdt ?? 1000);
      requiredMargin = amountUsdt;
      notionalUsd = requiredMargin * req.leverage;
      estimatedLossUsd = notionalUsd * (req.slPercent / 100);
      estimatedProfitUsd = notionalUsd * (req.tpPercent / 100);
    }

    const sizeUnits = notionalUsd / currentPrice;

    // 2. Construir el contexto de pre-trade
    const ctx: PreTradeContext = {
      req,
      currentPrice,
      metrics,
      rules,
      requiredMargin,
      notionalUsd,
      sizeUnits,
      estimatedLossUsd,
      estimatedProfitUsd
    };

    // 3. Ejecución a través del pipeline de reglas
    const pipeline = customPipeline || this.defaultPipeline;
    const ruleResult = pipeline.executePreTrade(ctx);

    if (!ruleResult.passed) {
      return {
        allowed: false,
        reason: ruleResult.reason || 'Orden rechazada por el motor de riesgo.',
        requiredMargin,
        notionalUsd,
        sizeUnits,
        estimatedLossUsd,
        estimatedProfitUsd
      };
    }

    return {
      allowed: true,
      requiredMargin,
      notionalUsd,
      sizeUnits,
      estimatedLossUsd,
      estimatedProfitUsd
    };
  }

  /**
   * Monitor de Drawdown para Prop Firms:
   * Evalúa la equidad y pérdidas frente a los límites diarios y totales.
   */
  public static checkPropFirmStatus(
    metrics: AccountMetrics,
    dailyStartEquity: number,
    rules: PropFirmRuleConfig = DEFAULT_PROP_FIRM_RULES,
    customPipeline?: RiskPipeline
  ): { breached: boolean; reason?: string; dailyLossPct: number; totalLossPct: number } {
    const dailyLossUsd = Math.max(0, dailyStartEquity - metrics.equity);
    const dailyLossPct = dailyStartEquity > 0 ? (dailyLossUsd / dailyStartEquity) * 100 : 0;

    const totalLossUsd = Math.max(0, rules.initialBalance - metrics.equity);
    const totalLossPct = rules.initialBalance > 0 ? (totalLossUsd / rules.initialBalance) * 100 : 0;

    const ctx: InFlightContext = {
      metrics,
      dailyStartEquity,
      rules
    };

    const pipeline = customPipeline || this.defaultPipeline;
    const ruleResult = pipeline.executeInFlight(ctx);

    if (!ruleResult.passed) {
      return {
        breached: true,
        reason: ruleResult.reason,
        dailyLossPct,
        totalLossPct
      };
    }

    return {
      breached: false,
      dailyLossPct,
      totalLossPct
    };
  }
}
export * from './rules';
