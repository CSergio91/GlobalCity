import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  ShieldCheck, 
  Layers, 
  Wallet,
  TrendingUp,
  Info
} from 'lucide-react';
import { UserTradingAccount } from '../TraderDashboardApp';
import { PayoutRequestEntity, PayoutTierStep } from '../../crm/types/crm.types';
import { crmService } from '../../crm/api/crmService';
import { supabase } from '../../../lib/supabase';
import { PayoutEngine } from '../../../core/trading/PayoutEngine';

interface TraderPayoutsViewProps {
  accounts: UserTradingAccount[];
  selectedAccountId?: string;
  isEn?: boolean;
  userEmail?: string;
  userId?: string;
}

export const TraderPayoutsView: React.FC<TraderPayoutsViewProps> = ({
  accounts,
  selectedAccountId,
  isEn = false,
  userEmail,
  userId
}) => {
  const [activeAccId, setActiveAccId] = useState<string>(selectedAccountId || (accounts[0]?.id || ''));
  const [payoutsHistory, setPayoutsHistory] = useState<PayoutRequestEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  // Formulario
  const [amountInput, setAmountInput] = useState<number>(0);
  const [cryptoNetwork, setCryptoNetwork] = useState<string>('TRC20');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [traderNotes, setTraderNotes] = useState<string>('');
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAccountId) {
      setActiveAccId(selectedAccountId);
    } else if (accounts.length > 0 && !activeAccId) {
      setActiveAccId(accounts[0].id);
    }
  }, [selectedAccountId, accounts]);

  // Cuenta activa seleccionada
  const activeAccount = useMemo(() => {
    return accounts.find(a => a.id === activeAccId) || accounts[0];
  }, [accounts, activeAccId]);

  // Cargar historial de payouts del trader
  const loadHistory = async () => {
    const accEmail = (activeAccount as any)?.traderEmail;
    if (!userEmail && !accEmail && !activeAccount?.id) return;
    setIsLoading(true);
    try {
      const email = userEmail || accEmail || '';
      const allPayouts = await crmService.getPayoutRequests();
      const filtered = allPayouts.filter(p => 
        (email && p.trader_email && p.trader_email.toLowerCase() === email.toLowerCase()) ||
        (activeAccount && p.account_id === activeAccount.id)
      );
      setPayoutsHistory(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userEmail, activeAccount?.id]);

  // Configuración del modelo y escala de payouts de esta cuenta específica
  const { currentTierNumber, currentSplitPct, payoutScale } = useMemo(() => {
    const rulesConfig: any = (activeAccount as any)?.rulesConfig || {};
    
    // Escala configurada en el modelo de challenge (o por defecto si es nueva)
    const scale: PayoutTierStep[] = rulesConfig.payout_scale || rulesConfig.payoutScale || [
      { tier: 1, split: 35 },
      { tier: 2, split: 50 },
      { tier: 3, split: 80 },
      { tier: 4, split: 90 }
    ];

    // Contar cuántos retiros aprobados o pagados tiene esta cuenta
    const settledCount = payoutsHistory.filter(p => 
      p.account_id === activeAccount?.id && (p.status === 'PAID' || p.status === 'APPROVED' || p.status === 'PENDING')
    ).length;

    const tierNum = settledCount + 1;
    const tierMatch = scale.find(s => s.tier === tierNum) || scale[scale.length - 1] || { tier: tierNum, split: 80 };

    return {
      currentTierNumber: tierNum,
      currentSplitPct: tierMatch.split,
      payoutScale: scale
    };
  }, [activeAccount, payoutsHistory]);

  // Ganancias calculadas
  const initBal = activeAccount?.initialBalance || 100000;
  const currBal = activeAccount?.currentBalance || initBal;
  const netProfit = Math.max(0, currBal - initBal);
  const estimatedTraderPayout = Number((amountInput * (currentSplitPct / 100)).toFixed(2));
  const estimatedFirmRetained = Number((amountInput * ((100 - currentSplitPct) / 100)).toFixed(2));

  // Auto-llenar con el profit disponible si no se ha escrito
  useEffect(() => {
    if (netProfit > 0 && amountInput === 0) {
      setAmountInput(Math.floor(netProfit));
    }
  }, [netProfit]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(text);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMessage(null);
    setFormSuccessMessage(null);

    if (!activeAccount) {
      setFormErrorMessage(isEn ? 'Please select a trading account.' : 'Selecciona una cuenta de trading.');
      return;
    }

    if (amountInput <= 0) {
      setFormErrorMessage(isEn ? 'Withdrawal amount must be greater than 0.' : 'El monto a retirar debe ser mayor a 0.');
      return;
    }

    if (amountInput > netProfit) {
      setFormErrorMessage(
        isEn 
          ? `Withdrawal amount cannot exceed available profit ($${netProfit.toLocaleString()} USD).`
          : `El monto a retirar no puede superar el beneficio generado ($${netProfit.toLocaleString()} USD).`
      );
      return;
    }

    if (!walletAddress.trim()) {
      setFormErrorMessage(isEn ? 'Please enter your crypto wallet address.' : 'Ingresa tu dirección de billetera crypto.');
      return;
    }

    setIsSubmitting(true);
    try {
      const settledCount = payoutsHistory.filter(p => 
        p.account_id === activeAccount.id && (p.status === 'PAID' || p.status === 'APPROVED' || p.status === 'PENDING')
      ).length;

      const res = await PayoutEngine.submitPayoutRequest({
        account: {
          id: activeAccount.id,
          accountNumber: activeAccount.accountNumber,
          traderEmail: userEmail || (activeAccount as any).traderEmail || 'trader@eklipsefunded.com',
          userId: userId || null,
          initialBalance: initBal,
          currentBalance: currBal,
          equity: activeAccount.equity || currBal,
          status: activeAccount.status || 'ACTIVE',
          tradingDaysCount: (activeAccount as any).tradingDaysCount || 0,
          rulesConfig: (activeAccount as any).rulesConfig || {}
        },
        amount: amountInput,
        cryptoNetwork,
        destinationAddress: walletAddress.trim(),
        payoutMethod: 'CRYPTO_USDT',
        notes: traderNotes.trim() || undefined,
        pastSettledPayoutsCount: settledCount
      });

      if (!res.success || !res.payout) {
        setFormErrorMessage(res.error || (isEn ? 'Eligibility criteria not met.' : 'No cumples con las reglas de elegibilidad de retiro.'));
        return;
      }

      setPayoutsHistory(prev => [res.payout!, ...prev]);
      setFormSuccessMessage(
        isEn 
          ? `✓ Payout request #${res.payout.payout_number || currentTierNumber} submitted successfully! Treasury desk will review and dispatch.` 
          : `✓ ¡Solicitud de Retiro #${res.payout.payout_number || currentTierNumber} enviada con éxito! La mesa de tesorería procesará y transferirá tus fondos.`
      );
      setWalletAddress('');
      setTraderNotes('');
    } catch (err: any) {
      setFormErrorMessage(err?.message || (isEn ? 'Error submitting payout request' : 'Error al solicitar retiro'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* 1. Header con Resumen Institucional */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white/[0.06] via-[#101726]/90 to-[#0A0D15]/95 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/40 before:to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent border border-emerald-500/35 text-emerald-300 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(16,185,129,0.25)] overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                  {isEn ? 'Treasury & Settlements' : 'Tesorería & Retiros'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {isEn ? '0% Processing Fees' : '0% Comisiones de Retiro'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isEn ? 'Trader Payout Portal' : 'Portal de Retiros de Beneficios'}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {isEn 
                  ? 'Request your trading profits according to your challenge tiered scale. Dispatched in USDT crypto straight to your wallet.' 
                  : 'Solicita tus ganancias de trading según la escala escalonada de tu modelo. Pagado en USDT cripto directo a tu wallet.'}
              </p>
            </div>
          </div>

          {/* Selector de cuenta si hay varias */}
          {accounts.length > 1 && (
            <div className="flex flex-col gap-1.5 self-start sm:self-auto">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                {isEn ? 'Select Account:' : 'Seleccionar Cuenta:'}
              </span>
              <select
                value={activeAccId}
                onChange={(e) => setActiveAccId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-[#090C14]/90 border border-white/15 text-white font-mono text-xs focus:outline-hidden focus:border-amber-400 backdrop-blur-md cursor-pointer"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                    {acc.accountNumber} (${acc.initialBalance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 2. Visualizador del Escalonamiento de Payouts del Modelo Activo */}
      <div className="p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Your Payout Tier Progression (Independent per Model)' : 'Escalera Progresiva de Payouts de tu Reto'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {isEn 
                ? `Current active step: Payout #${currentTierNumber} granting you ${currentSplitPct}% profit share.` 
                : `Escalón activo: Retiro #${currentTierNumber} con ${currentSplitPct}% de reparto para ti.`}
            </p>
          </div>
          <span className="text-xs font-mono font-black px-3 py-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/35 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            {isEn ? `Tier #${currentTierNumber}: ${currentSplitPct}% Trader` : `Retiro #${currentTierNumber}: ${currentSplitPct}% Trader`}
          </span>
        </div>

        {/* Pasos de la Escalera Visual */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          {payoutScale.map((step) => {
            const isCompleted = step.tier < currentTierNumber;
            const isCurrent = step.tier === currentTierNumber;

            return (
              <div 
                key={step.tier}
                className={`p-4 rounded-2xl border transition-all text-center ${
                  isCurrent 
                    ? 'bg-amber-400/15 border-amber-400/60 ring-2 ring-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
                    : isCompleted
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 opacity-60'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {step.tier === 1 ? (isEn ? '1st Payout' : '1º Retiro') :
                   step.tier === 2 ? (isEn ? '2nd Payout' : '2º Retiro') :
                   step.tier === 3 ? (isEn ? '3rd Payout' : '3º Retiro') :
                   (isEn ? `${step.tier}th+ Payout` : `${step.tier}º+ Retiro`)}
                </div>
                <div className={`text-xl sm:text-2xl font-black mt-1 ${isCurrent ? 'text-amber-300' : isCompleted ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {step.split}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {isCurrent ? (isEn ? '● Current Step' : '● Escalón Actual') :
                   isCompleted ? (isEn ? '✓ Completed' : '✓ Completado') :
                   (isEn ? 'Future Step' : 'Siguiente')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Panel de Formulario de Retiro y Tarjetas de Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Tarjetas de Balance & Profit Elegible (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl shadow-xl space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
              {isEn ? 'Available Profit for Payout' : 'Beneficio Retirable Disponible'}
            </span>

            <div className="text-3xl sm:text-4xl font-mono font-black text-white">
              ${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal text-slate-400 ml-2">USD</span>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">{isEn ? 'Account Balance:' : 'Balance de la Cuenta:'}</span>
                <span className="font-bold text-white">${currBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isEn ? 'Initial Balance:' : 'Capital Inicial:'}</span>
                <span className="font-bold text-slate-400">${initBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isEn ? 'Your Split Share:' : 'Tu Porcentaje de Reparto:'}</span>
                <span className="font-black text-amber-300">{currentSplitPct}%</span>
              </div>
            </div>

            {netProfit <= 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {isEn 
                    ? 'Your account must be in net profit above the initial balance to request a payout.' 
                    : 'Tu cuenta debe generar ganancias netas por encima del balance inicial para poder solicitar retiros.'}
                </span>
              </div>
            )}
          </div>

          {/* Checklist de Requisitos Institucionales */}
          <div className="p-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-[#0A0D15]/95 backdrop-blur-2xl text-xs space-y-3 font-mono">
            <h4 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? 'Pre-Flight Withdrawal Checklist' : 'Checklist de Retiro Institucional'}</span>
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{isEn ? 'Account verified & funded contract signed' : 'Cuenta verificada y contrato firmado'}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{isEn ? 'Consistency rule verified (no trade > 40%)' : 'Regla de consistencia aprobada (<40% en un trade)'}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{isEn ? 'No open positions during payout processing' : 'Sin posiciones abiertas al procesar'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Solicitud de Retiro (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl shadow-xl space-y-5">
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? 'Submit Withdrawal Request' : 'Solicitar Retiro de Ganancias'}</span>
            </h3>

            {formSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{formSuccessMessage}</span>
              </div>
            )}

            {formErrorMessage && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{formErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs font-mono">
              {/* Monto a Retirar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-bold">
                    {isEn ? 'Withdrawal Amount (USDT):' : 'Monto de Beneficio a Retirar (USDT):'}
                  </label>
                  {netProfit > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmountInput(Math.floor(netProfit))}
                      className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      {isEn ? 'Max Profit ($' + Math.floor(netProfit).toLocaleString() + ')' : 'Todo el Profit ($' + Math.floor(netProfit).toLocaleString() + ')'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    max={netProfit > 0 ? netProfit : 1}
                    value={amountInput || ''}
                    onChange={(e) => setAmountInput(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#090C14]/90 border border-white/15 text-white font-mono font-bold text-sm focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Cálculo en Vivo del Reparto */}
              {amountInput > 0 && (
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">{isEn ? 'You Receive (Net):' : 'Tú Recibes (Neto):'}</span>
                    <span className="text-emerald-400 font-black text-sm">
                      ${estimatedTraderPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                    </span>
                    <span className="text-[10px] text-slate-500 block">({currentSplitPct}% trader split)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isEn ? 'Firm Treasury Retains:' : 'Retención de la Firma:'}</span>
                    <span className="text-slate-300 font-bold text-sm">
                      ${estimatedFirmRetained.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                    </span>
                    <span className="text-[10px] text-slate-500 block">({100 - currentSplitPct}% firm share)</span>
                  </div>
                </div>
              )}

              {/* Red Crypto */}
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">
                  {isEn ? 'Settlement Crypto Network:' : 'Red de Liquidación Cripto:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['TRC20', 'ERC20', 'ARBITRUM'].map(net => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setCryptoNetwork(net)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        cryptoNetwork === net
                          ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                      }`}
                    >
                      USDT-{net}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dirección de Wallet */}
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">
                  {isEn ? 'Destination Wallet Address (USDT):' : 'Dirección de Billetera de Destino (USDT):'}
                </label>
                <input
                  type="text"
                  required
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={cryptoNetwork === 'TRC20' ? 'T...' : '0x...'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090C14]/90 border border-white/15 text-white font-mono text-xs focus:outline-hidden focus:border-amber-400"
                />
              </div>

              {/* Notas opcionales */}
              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  {isEn ? 'Optional Notes for Treasury:' : 'Notas adicionales para tesorería (opcional):'}
                </label>
                <input
                  type="text"
                  value={traderNotes}
                  onChange={(e) => setTraderNotes(e.target.value)}
                  placeholder={isEn ? 'e.g. Preferred transfer window, reference...' : 'ej: Horario preferido, referencia personal...'}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#090C14]/90 border border-white/10 text-white font-mono text-xs focus:outline-hidden focus:border-amber-400"
                />
              </div>

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={isSubmitting || netProfit <= 0 || amountInput <= 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 cursor-pointer hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting 
                    ? (isEn ? 'Submitting Request...' : 'Enviando Solicitud...') 
                    : (isEn ? `Submit Payout #${currentTierNumber} Request` : `Solicitar Retiro #${currentTierNumber}`)}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 4. Historial de Payouts del Trader */}
      <div className="p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{isEn ? 'Your Payout History' : 'Historial de Retiros Solicitados'}</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {payoutsHistory.length} {isEn ? 'records' : 'registros'}
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/[0.02] border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">{isEn ? 'Date' : 'Fecha'}</th>
                <th className="py-3 px-3">{isEn ? 'Payout #' : 'Retiro #'}</th>
                <th className="py-3 px-3 text-right">{isEn ? 'Gross Amount' : 'Monto Bruto'}</th>
                <th className="py-3 px-3 text-right">{isEn ? 'Split' : 'Split'}</th>
                <th className="py-3 px-3 text-right">{isEn ? 'Net Payout' : 'Neto Pagado'}</th>
                <th className="py-3 px-3">{isEn ? 'Wallet Destination' : 'Billetera'}</th>
                <th className="py-3 px-4 text-center">{isEn ? 'Status' : 'Estado'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {payoutsHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <span>{isEn ? 'No payout requests submitted yet.' : 'Aún no has solicitado retiros de beneficios.'}</span>
                  </td>
                </tr>
              ) : (
                payoutsHistory.map(p => {
                  const isPaid = p.status === 'PAID';
                  const isApproved = p.status === 'APPROVED';
                  const isPending = p.status === 'PENDING';
                  const isRejected = p.status === 'REJECTED';

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(p.requested_at).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                          Payout #{p.payout_number || 1}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right text-slate-300">
                        ${Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 text-right text-amber-300 font-bold">
                        {p.profit_split_percent}%
                      </td>

                      <td className="py-3 px-3 text-right text-emerald-400 font-black">
                        ${Number(p.net_payout_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px]" title={p.destination_address}>
                            {p.destination_address}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.destination_address)}
                            className="text-slate-500 hover:text-white cursor-pointer"
                          >
                            {copiedTx === p.destination_address ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        {p.tx_hash && (
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                            <span className="truncate max-w-[130px]">TX: {p.tx_hash}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isPaid ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                          isApproved ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                          isPending ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
