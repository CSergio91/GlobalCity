import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  Filter, 
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { PayoutRequestEntity } from '../types/crm.types';
import { crmService } from '../api/crmService';
import { CrmLang } from '../types/i18n';

interface FinancePayoutsViewProps {
  lang?: CrmLang;
}

export const FinancePayoutsView: React.FC<FinancePayoutsViewProps> = ({ lang = 'es' }) => {
  const isEs = lang === 'es';
  const [payouts, setPayouts] = useState<PayoutRequestEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'>('ALL');

  // Modal de Pago con TX Hash
  const [payingPayout, setPayingPayout] = useState<PayoutRequestEntity | null>(null);
  const [txHashInput, setTxHashInput] = useState('');
  const [payNotesInput, setPayNotesInput] = useState('');

  // Modal de Rechazo
  const [rejectingPayout, setRejectingPayout] = useState<PayoutRequestEntity | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const loadPayouts = async () => {
    setIsLoading(true);
    try {
      const data = await crmService.getPayoutRequests();
      setPayouts(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleApprove = async (payout: PayoutRequestEntity) => {
    await crmService.updatePayoutRequestStatus({
      id: payout.id,
      status: 'APPROVED'
    });
    await loadPayouts();
  };

  const handleConfirmPaid = async () => {
    if (!payingPayout) return;
    await crmService.updatePayoutRequestStatus({
      id: payingPayout.id,
      status: 'PAID',
      txHash: txHashInput.trim() || undefined,
      notes: payNotesInput.trim() || undefined
    });
    setPayingPayout(null);
    setTxHashInput('');
    setPayNotesInput('');
    await loadPayouts();
  };

  const handleConfirmReject = async () => {
    if (!rejectingPayout) return;
    await crmService.updatePayoutRequestStatus({
      id: rejectingPayout.id,
      status: 'REJECTED',
      rejectionReason: rejectionReasonInput.trim() || 'No cumple con las reglas institucionales'
    });
    setRejectingPayout(null);
    setRejectionReasonInput('');
    await loadPayouts();
  };

  // Métricas de Tesorería
  const metrics = useMemo(() => {
    let totalRequested = 0;
    let pendingAmount = 0;
    let pendingCount = 0;
    let paidAmount = 0;
    let retainedAmount = 0;

    for (const p of payouts) {
      const amt = Number(p.amount) || 0;
      totalRequested += amt;

      if (p.status === 'PENDING') {
        pendingAmount += Number(p.net_payout_amount) || (amt * 0.8);
        pendingCount++;
      } else if (p.status === 'PAID') {
        paidAmount += Number(p.net_payout_amount) || (amt * 0.8);
        retainedAmount += Number(p.firm_retained_amount) || (amt * 0.2);
      }
    }

    return {
      totalRequests: payouts.length,
      pendingCount,
      pendingAmount,
      paidAmount,
      retainedAmount
    };
  }, [payouts]);

  const filteredPayouts = useMemo(() => {
    return payouts.filter(p => {
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.trader_email.toLowerCase().includes(q) ||
        p.destination_address.toLowerCase().includes(q) ||
        (p.tx_hash && p.tx_hash.toLowerCase().includes(q)) ||
        p.account_id.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [payouts, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header con Resumen Institucional y Recarga */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm shrink-0">
            <DollarSign className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-[#0F172A] tracking-tight">
                {isEs ? 'Tesorería, Finanzas & Payouts' : 'Treasury, Finance & Payouts'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                {isEs ? 'Auditoría en Cadena' : 'On-Chain Audit'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isEs 
                ? 'Supervisión de retiros de beneficios, cálculo del reparto según escala escalonada (35%, 50%, 80%, 90%) y liquidación USDT.' 
                : 'Monitor trader profit splits, tiered schedule deduction (35%, 50%, 80%, 90%), and crypto USDT settlement.'}
            </p>
          </div>
        </div>

        <button
          onClick={loadPayouts}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-600' : 'text-slate-500'}`} />
          <span>{isEs ? 'Sincronizar' : 'Sync'}</span>
        </button>
      </div>

      {/* 2. Grid de Métricas de Tesorería */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
            {isEs ? 'Retiros Pendientes' : 'Pending Requests'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-600 font-mono">
              ${metrics.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-slate-400">({metrics.pendingCount} req)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
            {isEs ? 'Total Pagado a Traders' : 'Total Paid to Traders'}
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-700 font-mono">
            ${metrics.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
            {isEs ? 'Retención Tesorería Firma' : 'Firm Treasury Retained'}
          </span>
          <div className="mt-1 text-2xl font-black text-slate-900 font-mono">
            ${metrics.retainedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
            {isEs ? 'Histórico Solicitudes' : 'Total Requests Lifetime'}
          </span>
          <div className="mt-1 text-2xl font-black text-slate-800 font-mono">
            {metrics.totalRequests}
          </div>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Pestañas de Estado */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'] as const).map(st => {
            const isActive = statusFilter === st;
            const labels: Record<string, { es: string; en: string }> = {
              ALL: { es: 'Todos', en: 'All' },
              PENDING: { es: 'Pendientes', en: 'Pending' },
              APPROVED: { es: 'Aprobados', en: 'Approved' },
              PAID: { es: 'Pagados', en: 'Paid' },
              REJECTED: { es: 'Rechazados', en: 'Rejected' }
            };
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {labels[st][lang]}
              </button>
            );
          })}
        </div>

        {/* Buscador */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEs ? 'Buscar por email, wallet, tx hash...' : 'Search by email, wallet, tx hash...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* 4. Tabla de Solicitudes de Payout */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
              <tr>
                <th className="py-3.5 px-4">{isEs ? 'Trader & Fecha' : 'Trader & Date'}</th>
                <th className="py-3.5 px-3">{isEs ? 'Escalón Payout' : 'Payout Tier'}</th>
                <th className="py-3.5 px-3 text-right">{isEs ? 'Ganancia Bruta' : 'Gross Profit'}</th>
                <th className="py-3.5 px-3 text-right">{isEs ? 'Neto Trader' : 'Trader Net'}</th>
                <th className="py-3.5 px-3 text-right">{isEs ? 'Firma Retiene' : 'Firm Split'}</th>
                <th className="py-3.5 px-3">{isEs ? 'Billetera Crypto' : 'Crypto Wallet'}</th>
                <th className="py-3.5 px-3 text-center">{isEs ? 'Estado' : 'Status'}</th>
                <th className="py-3.5 px-4 text-right">{isEs ? 'Acciones' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-xs">
                      {isEs ? 'No hay solicitudes de retiros registradas con ese filtro.' : 'No payout requests found with this filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPayouts.map(p => {
                  const pNum = p.payout_number || 1;
                  const split = Number(p.profit_split_percent) || 80;
                  const isPaid = p.status === 'PAID';
                  const isPending = p.status === 'PENDING';
                  const isApproved = p.status === 'APPROVED';
                  const isRejected = p.status === 'REJECTED';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.trader_email}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(p.requested_at).toLocaleDateString()} • {new Date(p.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-50 text-purple-900 border border-purple-200">
                          <span>Payout #{pNum}</span>
                          <span className="text-purple-600">({split}%)</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                        ${Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-700">
                        ${Number(p.net_payout_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        ${Number(p.firm_retained_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                            {p.crypto_network || 'TRC20'}
                          </span>
                          <span className="font-mono text-[11px] text-slate-700 truncate max-w-[120px]" title={p.destination_address}>
                            {p.destination_address}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.destination_address)}
                            className="p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Copiar dirección"
                          >
                            {copiedAddress === p.destination_address ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        {p.tx_hash && (
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-700">
                            <span className="font-mono truncate max-w-[140px]">TX: {p.tx_hash}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isPaid ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          isApproved ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          isPending ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(p)}
                                className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                {isEs ? 'Aprobar' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingPayout(p)}
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                {isEs ? 'Rechazar' : 'Reject'}
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setPayingPayout(p);
                                  setTxHashInput('');
                                  setPayNotesInput('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{isEs ? 'Pagar' : 'Pay'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingPayout(p)}
                                className="px-2 py-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors text-[11px]"
                              >
                                {isEs ? 'Rechazar' : 'Reject'}
                              </button>
                            </>
                          )}

                          {isPaid && (
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>{isEs ? 'Completado' : 'Settled'}</span>
                            </span>
                          )}

                          {isRejected && (
                            <span className="text-[10px] text-slate-400 italic" title={p.rejection_reason || ''}>
                              {p.rejection_reason || (isEs ? 'Rechazado' : 'Rejected')}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Registrar Pago con TX Hash */}
      {payingPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isEs ? 'Confirmar Pago de Retiro' : 'Confirm Payout Settlement'}</span>
              </h3>
              <button 
                onClick={() => setPayingPayout(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Trader:</span>
                <span className="font-bold text-slate-800">{payingPayout.trader_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monto Neto a Pagar:</span>
                <span className="font-black text-emerald-700">${Number(payingPayout.net_payout_amount).toLocaleString()} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Red:</span>
                <span className="font-bold">{payingPayout.crypto_network || 'TRC20'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billetera:</span>
                <span className="font-bold text-[11px] truncate max-w-[200px]">{payingPayout.destination_address}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isEs ? 'Hash de la Transacción Blockchain (TX Hash)' : 'Blockchain Transaction Hash (TX Hash)'}
                </label>
                <input
                  type="text"
                  value={txHashInput}
                  onChange={(e) => setTxHashInput(e.target.value)}
                  placeholder="0x... o hash de Tronscan"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl font-bold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isEs ? 'Notas Internas de Tesorería' : 'Internal Treasury Notes'}
                </label>
                <input
                  type="text"
                  value={payNotesInput}
                  onChange={(e) => setPayNotesInput(e.target.value)}
                  placeholder={isEs ? 'Ej: Pagado desde hot-wallet Binance / Fireblocks' : 'e.g. Paid via Fireblocks hot-wallet'}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPayingPayout(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmPaid}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all cursor-pointer shadow-xs"
              >
                {isEs ? 'Marcar como Pagado' : 'Mark as Paid'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Rechazar Retiro */}
      {rejectingPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-sm text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{isEs ? 'Rechazar Solicitud de Payout' : 'Reject Payout Request'}</span>
              </h3>
              <button 
                onClick={() => setRejectingPayout(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                {isEs 
                  ? `Se notificará al trader (${rejectingPayout.trader_email}) con el motivo del rechazo:` 
                  : `The trader (${rejectingPayout.trader_email}) will be notified with this reason:`}
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isEs ? 'Motivo del Rechazo' : 'Rejection Reason'}
                </label>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder={isEs ? 'Ej: Infracción de regla de consistencia (>40% en un trade), posiciones aún abiertas, etc.' : 'e.g. Consistency breach (>40% profit in single trade), open positions pending, etc.'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRejectingPayout(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all cursor-pointer shadow-xs"
              >
                {isEs ? 'Confirmar Rechazo' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
