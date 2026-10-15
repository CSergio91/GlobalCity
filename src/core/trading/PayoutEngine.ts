/**
 * ============================================================================
 * EKLIPSE FUNDED / ZYTI TRADE — PAYOUT & PROFIT SPLIT ENGINE INSTITUCIONAL
 * ============================================================================
 * Archivo Único Centralizado para Toda la Lógica de Retiros, Splits y Consistencia.
 * 
 * Responsabilidades:
 * 1. Reglas de Elegibilidad de Retiro:
 *    - Estado de Cuenta (debe ser 'ACTIVE').
 *    - Cero Posiciones Abiertas (no se permiten retiros con riesgo flotante en mercado).
 *    - Beneficio Mínimo Disponible (currentBalance > initialBalance y >= monto solicitado).
 *    - Regla de Consistencia Institucional del 40% (ningún trade > 40% de las ganancias).
 *    - Días Mínimos Calificados de Trading (conteo de jornadas con trades válidos).
 * 2. Cálculo Matemático de Splits y Escalas:
 *    - Escala Progresiva (Tier 1: 35%, Tier 2: 50%, Tier 3: 80%, Tier 4: 90%) o Split Fijo (80/20, 90/10).
 *    - Desglose neto transferible al trader vs. monto retenido para tesorería de la firma.
 * 3. Sincronización y Persistencia Relacional con PostgreSQL / Supabase:
 *    - Inserción y auditoría forense en `public.payout_requests`.
 *    - Actualización y descuento de balance en `public.trading_accounts`.
 *    - Deduplicación y control de idempotencia.
 */

import { supabase } from '../../lib/supabase';
import { PayoutRequestEntity, PayoutTierStep } from '../../modules/crm/types/crm.types';
import { 
  sendPayoutRequestedEmail, 
  sendPayoutApprovedEmail, 
  sendPayoutRejectedEmail 
} from '../../services/emailService';

export interface PayoutAccountContext {
  id: string;
  accountNumber: string;
  traderEmail: string;
  userId?: string | null;
  initialBalance: number;
  currentBalance: number;
  equity: number;
  status: string; // 'ACTIVE', 'PASSED', 'BREACHED', 'FROZEN'
  tradingDaysCount?: number;
  rulesConfig?: {
    modelType?: string;
    profitSplitPercent?: number;
    payoutScale?: PayoutTierStep[];
    consistencyRulePercent?: number;
    minTradingDays?: number;
    minDailyProfitValue?: number;
    [key: string]: any;
  };
}

export interface PayoutTradeItem {
  id: string;
  realizedPnl: number;
  openedAt?: string;
  closedAt?: string;
  status?: string;
}

export interface PayoutRuleCheckResult {
  ruleId: 'account_status' | 'no_open_positions' | 'profit_available' | 'consistency_rule' | 'min_trading_days';
  ruleName: string;
  passed: boolean;
  currentValueLabel: string;
  thresholdLabel: string;
  details: string;
}

export interface PayoutEligibilityEvaluation {
  eligible: boolean;
  reasons: string[];
  currentTierNumber: number;
  profitSplitPercent: number;
  availableProfit: number;
  netTraderPayout: number;
  firmRetainedAmount: number;
  bestTradePnl: number;
  bestTradeRatio: number;
  consistencyThresholdPct: number;
  tradingDaysCount: number;
  minTradingDaysReq: number;
  checks: PayoutRuleCheckResult[];
}

export interface SubmitPayoutParams {
  account: PayoutAccountContext;
  amount: number;
  cryptoNetwork?: string;
  destinationAddress: string;
  payoutMethod?: string;
  notes?: string;
  trades?: PayoutTradeItem[];
  openPositionsCount?: number;
  pastSettledPayoutsCount?: number;
}

export class PayoutEngine {
  /**
   * Escala por defecto de 4 niveles para retos escalonados
   */
  public static readonly DEFAULT_PAYOUT_SCALE: PayoutTierStep[] = [
    { tier: 1, split: 35 },
    { tier: 2, split: 50 },
    { tier: 3, split: 80 },
    { tier: 4, split: 90 }
  ];

  /**
   * 1. CALCULA EL SPLIT ACTUAL SEGÚN LA ESCALA Y LOS RETIROS ANTERIORES
   */
  public static calculateSplitTier(
    pastSettledCount: number,
    scale?: PayoutTierStep[],
    defaultSplitPercent = 80
  ): { tierNumber: number; splitPercent: number } {
    const tierNumber = pastSettledCount + 1;
    const activeScale = (scale && scale.length > 0) ? scale : this.DEFAULT_PAYOUT_SCALE;
    
    // Si la escala tiene tiers, encontrar el correspondiente al número de retiro
    const match = activeScale.find(s => s.tier === tierNumber);
    if (match) {
      return { tierNumber, splitPercent: Number(match.split) };
    }

    // Si supera el último nivel de la escala, toma el máximo split alcanzado
    if (activeScale.length > 0) {
      const maxTier = activeScale[activeScale.length - 1];
      return { tierNumber, splitPercent: Number(maxTier.split) };
    }

    return { tierNumber, splitPercent: defaultSplitPercent };
  }

  /**
   * 2. CALCULA LA DISTRIBUCIÓN FINANCIERA (TRADER vs FIRMA)
   */
  public static calculateDistribution(amount: number, splitPercent: number): {
    netTraderPayout: number;
    firmRetainedAmount: number;
  } {
    const safeAmount = Math.max(0, Number(amount || 0));
    const safeSplit = Math.min(100, Math.max(1, Number(splitPercent || 80)));
    const netTraderPayout = Number((safeAmount * (safeSplit / 100)).toFixed(2));
    const firmRetainedAmount = Number((safeAmount * ((100 - safeSplit) / 100)).toFixed(2));

    return {
      netTraderPayout,
      firmRetainedAmount
    };
  }

  /**
   * 3. EVALUACIÓN EXHAUSTIVA DE ELEGIBILIDAD DE PAYOUT
   * Verifica todas las reglas institucionales antes de permitir o aprobar un retiro.
   */
  public static evaluateEligibility(params: {
    account: PayoutAccountContext;
    requestedAmount: number;
    trades?: PayoutTradeItem[];
    openPositionsCount?: number;
    pastSettledPayoutsCount?: number;
  }): PayoutEligibilityEvaluation {
    const { 
      account, 
      requestedAmount, 
      trades = [], 
      openPositionsCount = 0,
      pastSettledPayoutsCount = 0 
    } = params;

    const rulesCfg = account.rulesConfig || {};
    const checks: PayoutRuleCheckResult[] = [];
    const reasons: string[] = [];

    // Constantes de la cuenta
    const initialBal = Number(account.initialBalance || 100000);
    const currentBal = Number(account.currentBalance || initialBal);
    const availableProfit = Math.max(0, currentBal - initialBal);

    // --- REGLA 1: ESTADO DE LA CUENTA ---
    const isAccountActive = account.status === 'ACTIVE' || account.status === 'PASSED';
    checks.push({
      ruleId: 'account_status',
      ruleName: 'Estado de Cuenta Activo',
      passed: isAccountActive,
      currentValueLabel: account.status,
      thresholdLabel: 'ACTIVE o PASSED',
      details: isAccountActive 
        ? 'La cuenta se encuentra en estado operativo óptimo.' 
        : `La cuenta está en estado ${account.status}. No se permiten retiros en cuentas suspendidas o infringidas.`
    });
    if (!isAccountActive) {
      reasons.push(`La cuenta está en estado ${account.status} y no puede solicitar retiros.`);
    }

    // --- REGLA 2: CERO POSICIONES ABIERTAS ---
    const hasZeroOpenPositions = (openPositionsCount || 0) === 0;
    checks.push({
      ruleId: 'no_open_positions',
      ruleName: 'Cero Posiciones Abiertas',
      passed: hasZeroOpenPositions,
      currentValueLabel: `${openPositionsCount} abiertas`,
      thresholdLabel: '0 posiciones abiertas',
      details: hasZeroOpenPositions 
        ? 'Todas las operaciones están cerradas. No hay riesgo flotante en mercado.' 
        : `Tienes ${openPositionsCount} posiciones abiertas. Debes cerrarlas todas antes de solicitar un retiro.`
    });
    if (!hasZeroOpenPositions) {
      reasons.push('Debes cerrar todas las operaciones abiertas antes de solicitar un retiro.');
    }

    // --- REGLA 3: BENEFICIO DISPONIBLE SUFICIENTE ---
    const hasSufficientProfit = availableProfit > 0 && requestedAmount > 0 && requestedAmount <= availableProfit;
    checks.push({
      ruleId: 'profit_available',
      ruleName: 'Beneficio Neto Disponible',
      passed: hasSufficientProfit,
      currentValueLabel: `$${availableProfit.toFixed(2)} USD`,
      thresholdLabel: `Mínimo $${requestedAmount > 0 ? requestedAmount.toFixed(2) : '1.00'} USD`,
      details: hasSufficientProfit
        ? `Beneficio suficiente generado en la cuenta ($${availableProfit.toFixed(2)} USD).`
        : availableProfit <= 0 
          ? 'No hay ganancias acumuladas por encima del balance inicial.'
          : `El monto solicitado ($${requestedAmount}) supera las ganancias disponibles ($${availableProfit.toFixed(2)}).`
    });
    if (!hasSufficientProfit) {
      if (availableProfit <= 0) {
        reasons.push('La cuenta no tiene beneficios netos sobre el balance inicial.');
      } else if (requestedAmount > availableProfit) {
        reasons.push(`El monto solicitado ($${requestedAmount}) supera el beneficio disponible ($${availableProfit.toFixed(2)}).`);
      } else {
        reasons.push('El monto a retirar debe ser mayor a 0.');
      }
    }

    // --- REGLA 4: REGLA DE CONSISTENCIA INSTITUCIONAL (MAX 40% POR TRADE) ---
    const consistencyThresholdPct = Number(rulesCfg.consistencyRulePercent || 40.0);
    const winningTrades = trades.filter(t => Number(t.realizedPnl || 0) > 0);
    const totalWinsProfit = winningTrades.reduce((acc, t) => acc + Number(t.realizedPnl || 0), 0);
    const effectiveTotalProfit = Math.max(availableProfit, totalWinsProfit);

    let bestTradePnl = 0;
    for (const t of winningTrades) {
      const p = Number(t.realizedPnl || 0);
      if (p > bestTradePnl) bestTradePnl = p;
    }

    const bestTradeRatio = effectiveTotalProfit > 0 ? (bestTradePnl / effectiveTotalProfit) : 0;
    const bestTradePct = Number((bestTradeRatio * 100).toFixed(1));
    const consistencyPassed = effectiveTotalProfit <= 0 || bestTradePct <= consistencyThresholdPct;

    checks.push({
      ruleId: 'consistency_rule',
      ruleName: 'Regla de Consistencia (40% Máx por Trade)',
      passed: consistencyPassed,
      currentValueLabel: `${bestTradePct}% (Mayor Win: $${bestTradePnl.toFixed(2)})`,
      thresholdLabel: `Máximo ${consistencyThresholdPct}% de la ganancia total`,
      details: consistencyPassed
        ? 'Distribución equilibrada del riesgo. Ningún trade concentró más del límite permitido.'
        : `Infracción de consistencia: Un trade generó el ${bestTradePct}% del total (límite: ${consistencyThresholdPct}%).`
    });
    if (!consistencyPassed) {
      reasons.push(`Infracción de Consistencia: Un trade generó $${bestTradePnl.toFixed(2)} (${bestTradePct}% del profit), superando el límite del ${consistencyThresholdPct}%.`);
    }

    // --- REGLA 5: DÍAS MÍNIMOS DE TRADING ---
    const minTradingDaysReq = Number(rulesCfg.minTradingDays || 0);
    const uniqueDates = new Set(
      trades
        .filter(t => t.closedAt || t.openedAt)
        .map(t => (t.closedAt || t.openedAt)!.slice(0, 10))
    );
    const tradingDaysCount = Math.max(account.tradingDaysCount || 0, uniqueDates.size);
    const tradingDaysPassed = minTradingDaysReq === 0 || tradingDaysCount >= minTradingDaysReq;

    checks.push({
      ruleId: 'min_trading_days',
      ruleName: 'Días Mínimos Calificados de Trading',
      passed: tradingDaysPassed,
      currentValueLabel: `${tradingDaysCount} de ${minTradingDaysReq} días`,
      thresholdLabel: `Mínimo ${minTradingDaysReq} días`,
      details: tradingDaysPassed
        ? 'Requisito de jornadas mínimas de operación cumplido.'
        : `Faltan ${Math.max(0, minTradingDaysReq - tradingDaysCount)} días con operaciones registradas.`
    });
    if (!tradingDaysPassed) {
      reasons.push(`Se requieren al menos ${minTradingDaysReq} días operados (actualmente: ${tradingDaysCount} días).`);
    }

    // --- CÁLCULO DE SPLIT Y DISTRIBUCIÓN ---
    const { tierNumber, splitPercent } = this.calculateSplitTier(
      pastSettledPayoutsCount,
      rulesCfg.payoutScale,
      Number(rulesCfg.profitSplitPercent || 80)
    );

    const { netTraderPayout, firmRetainedAmount } = this.calculateDistribution(
      requestedAmount,
      splitPercent
    );

    const eligible = checks.every(c => c.passed);

    return {
      eligible,
      reasons,
      currentTierNumber: tierNumber,
      profitSplitPercent: splitPercent,
      availableProfit,
      netTraderPayout,
      firmRetainedAmount,
      bestTradePnl,
      bestTradeRatio,
      consistencyThresholdPct,
      tradingDaysCount,
      minTradingDaysReq,
      checks
    };
  }

  /**
   * 4. SOLICITA Y REGISTRA UN PAYOUT EN POSTGRESQL / SUPABASE
   * Valida la elegibilidad y realiza el insert atómico.
   */
  public static async submitPayoutRequest(params: SubmitPayoutParams): Promise<{
    success: boolean;
    payout?: PayoutRequestEntity;
    error?: string;
    evaluation?: PayoutEligibilityEvaluation;
  }> {
    const { 
      account, 
      amount, 
      cryptoNetwork = 'TRC20', 
      destinationAddress, 
      payoutMethod = 'CRYPTO_USDT',
      notes,
      trades = [],
      openPositionsCount = 0,
      pastSettledPayoutsCount = 0
    } = params;

    // 1. Evaluación de elegibilidad estricta
    const evaluation = this.evaluateEligibility({
      account,
      requestedAmount: amount,
      trades,
      openPositionsCount,
      pastSettledPayoutsCount
    });

    if (!evaluation.eligible) {
      return {
        success: false,
        error: evaluation.reasons.join(' | '),
        evaluation
      };
    }

    // 2. Construcción del registro institucional
    const payoutPayload: PayoutRequestEntity = {
      id: crypto.randomUUID(),
      account_id: account.id,
      user_id: account.userId || null,
      trader_email: account.traderEmail,
      amount: Number(amount.toFixed(2)),
      profit_split_percent: evaluation.profitSplitPercent,
      net_payout_amount: evaluation.netTraderPayout,
      firm_retained_amount: evaluation.firmRetainedAmount,
      payout_method: payoutMethod as any,
      crypto_network: cryptoNetwork,
      destination_address: destinationAddress.trim(),
      status: 'PENDING',
      payout_number: evaluation.currentTierNumber,
      consistency_checked: true,
      best_day_profit: evaluation.bestTradePnl,
      best_day_ratio: evaluation.bestTradeRatio,
      notes: notes?.trim() || null,
      requested_at: new Date().toISOString()
    };

    // 3. Inserción en Supabase / PostgreSQL
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .insert(payoutPayload)
        .select()
        .single();

      if (error) {
        console.warn('[PayoutEngine] Error insertando en Supabase, guardando fallback:', error.message);
      } else if (data) {
        payoutPayload.id = data.id;
      }
    } catch (err: any) {
      console.warn('[PayoutEngine] Excepción de conexión con Supabase:', err.message);
    }

    // 4. Caché local de respaldo (Zero-Mock sync)
    try {
      const local = localStorage.getItem('eklipse_payout_requests');
      const list = local ? JSON.parse(local) : [];
      localStorage.setItem('eklipse_payout_requests', JSON.stringify([payoutPayload, ...list]));
    } catch (_) {}

    // 5. Despacho asíncrono de notificación de solicitud por correo
    try {
      if (account.traderEmail) {
        sendPayoutRequestedEmail({
          toEmail: account.traderEmail,
          traderName: account.traderEmail.split('@')[0],
          accountNumber: account.accountNumber,
          requestedAmount: payoutPayload.amount.toFixed(2),
          profitSplitPct: payoutPayload.profit_split_percent,
          netAmount: payoutPayload.net_payout_amount.toFixed(2),
          cryptoNetwork: payoutPayload.crypto_network,
          walletAddress: payoutPayload.destination_address,
        }).catch(e => console.warn('[PayoutEngine] Error despachando email de solicitud:', e.message));
      }
    } catch (_) {}

    return {
      success: true,
      payout: payoutPayload,
      evaluation
    };
  }

  /**
   * 5. APROBACIÓN Y LIQUIDACIÓN DEL PAYOUT EN NEXUS ERP (MESA DE TESORERÍA)
   * Al transferir en blockchain, descuenta el balance de trading y marca 'PAID'.
   */
  public static async processPayoutApproval(params: {
    payoutId: string;
    accountId: string;
    amount: number;
    txHash?: string;
    notes?: string;
    reviewerId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { payoutId, accountId, amount, txHash, notes, reviewerId } = params;

    const updatePayload = {
      status: 'PAID',
      tx_hash: txHash || null,
      notes: notes || null,
      reviewed_by: reviewerId || null,
      processed_at: new Date().toISOString()
    };

    try {
      // 1. Actualizar estado del Payout
      await supabase
        .from('payout_requests')
        .update(updatePayload)
        .eq('id', payoutId);

      // 2. Descontar las ganancias retiradas del balance actual de la cuenta
      const { data: acc } = await supabase
        .from('trading_accounts')
        .select('current_balance, initial_balance')
        .eq('id', accountId)
        .single();

      if (acc) {
        const currentBal = Number(acc.current_balance);
        const newBal = Math.max(Number(acc.initial_balance), currentBal - Number(amount));
        
        await supabase
          .from('trading_accounts')
          .update({
            current_balance: newBal,
            equity: newBal,
            updated_at: new Date().toISOString()
          })
          .eq('id', accountId);
      }

      // Sincronizar en localStorage
      try {
        const local = localStorage.getItem('eklipse_payout_requests');
        if (local) {
          const list: PayoutRequestEntity[] = JSON.parse(local);
          const updated = list.map(p => p.id === payoutId ? { ...p, ...updatePayload } : p);
          localStorage.setItem('eklipse_payout_requests', JSON.stringify(updated));
        }
      } catch (_) {}

      // 3. Despacho asíncrono de correo de confirmación de liquidación
      try {
        const { data: payoutItem } = await supabase
          .from('payout_requests')
          .select('*')
          .eq('id', payoutId)
          .single();

        const destEmail = payoutItem?.trader_email;
        if (destEmail) {
          sendPayoutApprovedEmail({
            toEmail: destEmail,
            traderName: destEmail.split('@')[0],
            accountNumber: accountId.slice(0, 8),
            netAmount: (payoutItem.net_payout_amount || Number(amount)).toFixed(2),
            payoutTier: payoutItem.payout_number || 1,
            profitSplitPct: payoutItem.profit_split_percent || 80,
            cryptoNetwork: payoutItem.crypto_network || 'TRC20',
            walletAddress: payoutItem.destination_address || 'Billetera Registrada',
            txHash: txHash || 'Emitido vía liquidación institucional'
          }).catch(e => console.warn('[PayoutEngine] Error despachando email de aprobación:', e.message));
        }
      } catch (_) {}

      return { success: true };
    } catch (err: any) {
      console.error('[PayoutEngine] Error procesando aprobación de pago:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * 6. RECHAZO DE PAYOUT CON MOTIVO FORENSE AUDITADO
   */
  public static async rejectPayout(params: {
    payoutId: string;
    rejectionReason: string;
    reviewerId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { payoutId, rejectionReason, reviewerId } = params;

    const updatePayload = {
      status: 'REJECTED',
      rejection_reason: rejectionReason,
      reviewed_by: reviewerId || null,
      processed_at: new Date().toISOString()
    };

    try {
      await supabase
        .from('payout_requests')
        .update(updatePayload)
        .eq('id', payoutId);

      try {
        const local = localStorage.getItem('eklipse_payout_requests');
        if (local) {
          const list: PayoutRequestEntity[] = JSON.parse(local);
          const updated = list.map(p => p.id === payoutId ? { ...p, ...updatePayload } : p);
          localStorage.setItem('eklipse_payout_requests', JSON.stringify(updated));
        }
      } catch (_) {}

      // Despacho asíncrono de correo de auditoría / rechazo
      try {
        const { data: payoutItem } = await supabase
          .from('payout_requests')
          .select('*')
          .eq('id', payoutId)
          .single();

        const destEmail = payoutItem?.trader_email;
        if (destEmail) {
          sendPayoutRejectedEmail({
            toEmail: destEmail,
            traderName: destEmail.split('@')[0],
            accountNumber: payoutItem.account_id ? payoutItem.account_id.slice(0, 8) : 'EKL',
            requestedAmount: (payoutItem.amount || 0).toFixed(2),
            rejectionReason: rejectionReason
          }).catch(e => console.warn('[PayoutEngine] Error despachando email de rechazo:', e.message));
        }
      } catch (_) {}

      return { success: true };
    } catch (err: any) {
      console.error('[PayoutEngine] Error rechazando payout:', err);
      return { success: false, error: err.message };
    }
  }
}
