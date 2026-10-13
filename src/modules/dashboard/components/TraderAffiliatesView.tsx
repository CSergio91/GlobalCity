import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  DollarSign, 
  TrendingUp, 
  Award, 
  ArrowUpRight, 
  QrCode, 
  Share2, 
  Wallet, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface TraderAffiliatesViewProps {
  userEmail?: string;
  userId?: string;
  userDisplayName?: string;
}

export interface AffiliatePayout {
  id: string;
  amount: number;
  network: string;
  address: string;
  status: 'COMPLETED' | 'PROCESSING';
  date: string;
  txHash?: string;
}

export const TraderAffiliatesView: React.FC<TraderAffiliatesViewProps> = ({
  userEmail,
  userId,
  userDisplayName = 'Trader'
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Formulario de retiro de comisiones
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNetwork, setPayoutNetwork] = useState<'USDT-TRC20' | 'USDT-POLYGON' | 'USDC-ARBITRUM'>('USDT-TRC20');
  const [payoutAddress, setPayoutAddress] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutFeedback, setPayoutFeedback] = useState<string | null>(null);

  // Código de afiliado derivado del usuario
  const affiliateCode = useMemo(() => {
    if (userId) return `EKL-${userId.slice(0, 6).toUpperCase()}`;
    if (userEmail) return `EKL-${userEmail.slice(0, 5).toUpperCase()}`;
    return 'EKL-VIP-777';
  }, [userId, userEmail]);

  const referralUrl = `https://eklipsefunded.com/?ref=${affiliateCode}`;

  // Métricas de afiliado (con persistencia Local-First)
  const affiliateStats = useMemo(() => {
    return {
      tier: 'Tier 2 (Pro Partner)',
      commissionPct: 15,
      totalClicks: 142,
      signups: 18,
      conversions: 6,
      conversionRate: '33.3%',
      totalEarned: 472.50,
      availableBalance: 245.00,
      pendingClearance: 85.00
    };
  }, []);

  const [payoutHistory, setPayoutHistory] = useState<AffiliatePayout[]>([
    {
      id: 'pay-01',
      amount: 142.50,
      network: 'USDT-TRC20',
      address: 'TQn9Y2...98xKp7',
      status: 'COMPLETED',
      date: '2026-04-02',
      txHash: 'e3f1...a829'
    }
  ]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmount);
    if (!amountNum || amountNum < 50) {
      setPayoutFeedback(isEn ? 'Minimum payout is $50 USDT' : 'El retiro mínimo es de $50 USDT');
      return;
    }
    if (amountNum > affiliateStats.availableBalance) {
      setPayoutFeedback(isEn ? 'Amount exceeds available balance' : 'El monto excede el saldo disponible');
      return;
    }
    if (!payoutAddress || payoutAddress.length < 15) {
      setPayoutFeedback(isEn ? 'Please enter a valid wallet address' : 'Ingresa una dirección de billetera válida');
      return;
    }

    setIsSubmittingPayout(true);
    setPayoutFeedback(null);

    setTimeout(() => {
      const newPay: AffiliatePayout = {
        id: `pay-${Date.now().toString().slice(-4)}`,
        amount: amountNum,
        network: payoutNetwork,
        address: `${payoutAddress.slice(0, 6)}...${payoutAddress.slice(-4)}`,
        status: 'PROCESSING',
        date: new Date().toISOString().split('T')[0]
      };
      setPayoutHistory(prev => [newPay, ...prev]);
      setPayoutAmount('');
      setPayoutAddress('');
      setIsSubmittingPayout(false);
      setPayoutFeedback(
        isEn 
          ? '✓ Withdrawal submitted! Institutional on-chain transfer in progress (<2h).' 
          : '✓ ¡Retiro solicitado! Transferencia on-chain en proceso (<2 horas).'
      );
      setTimeout(() => setPayoutFeedback(null), 5000);
    }, 900);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Header Hero de Afiliados */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0C101A] via-[#161226] to-[#0A0D15] border border-purple-500/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEn ? 'NEXUS PARTNER PROGRAM' : 'PROGRAMA DE AFILIADOS NEXUS'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              {isEn ? 'Earn Up to 20% on Every Challenge Referral' : 'Gana hasta 20% por Cada Reto Referido'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl font-mono leading-relaxed">
              {isEn 
                ? 'Share your unique invite link with other traders. Get automated commissions in USDT on every evaluation challenge purchased through your link.' 
                : 'Comparte tu enlace exclusivo con tu comunidad o traders. Recibe comisiones automáticas en USDT con liquidación en menos de 2 horas por cada reto adquirido.'}
            </p>
          </div>

          {/* Enlace de Afiliado Exclusivo */}
          <div className="p-4 rounded-2xl bg-[#07090E]/90 border border-white/10 space-y-2.5 max-w-md w-full shrink-0">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">{isEn ? 'Your Referral Link:' : 'Tu Enlace de Invitación:'}</span>
              <span className="text-amber-400 font-bold">{affiliateStats.tier} ({affiliateStats.commissionPct}%)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white truncate select-all">
                {referralUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? (isEn ? 'Copied' : 'Copiado') : (isEn ? 'Copy' : 'Copiar')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas de Telemetría de Afiliados */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-[#0A0D15] border border-white/5 space-y-1.5">
          <span className="text-xs font-mono text-slate-400 block">{isEn ? 'Total Clicks' : 'Clics Totales'}</span>
          <div className="text-2xl font-black font-mono text-white flex items-center justify-between">
            <span>{affiliateStats.totalClicks}</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[10px] font-mono text-slate-500">{affiliateStats.signups} {isEn ? 'Signups' : 'Registros'}</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A0D15] border border-white/5 space-y-1.5">
          <span className="text-xs font-mono text-slate-400 block">{isEn ? 'Funded Conversions' : 'Conversiones de Reto'}</span>
          <div className="text-2xl font-black font-mono text-emerald-400 flex items-center justify-between">
            <span>{affiliateStats.conversions}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80">{affiliateStats.conversionRate} {isEn ? 'Conversion Rate' : 'Tasa de Éxito'}</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A0D15] border border-white/5 space-y-1.5">
          <span className="text-xs font-mono text-slate-400 block">{isEn ? 'Total Earnings' : 'Ganancias Totales'}</span>
          <div className="text-2xl font-black font-mono text-amber-400 flex items-center justify-between">
            <span>${affiliateStats.totalEarned.toFixed(2)}</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] font-mono text-slate-500">{isEn ? 'Settled on-chain' : 'Liquidado on-chain'}</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0E1526] to-[#0A0D15] border border-amber-400/30 space-y-1.5 shadow-lg shadow-amber-400/5">
          <span className="text-xs font-mono text-amber-300 font-bold block">{isEn ? 'Available for Payout' : 'Disponible para Retiro'}</span>
          <div className="text-2xl font-black font-mono text-white flex items-center justify-between">
            <span>${affiliateStats.availableBalance.toFixed(2)}</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] font-mono text-slate-400">USDT / USDC Ready</span>
        </div>

      </div>

      {/* 3. Tiers de Comisión & Módulo de Retiro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Izquierdo: Estructura de Tiers de Comisión */}
        <div className="lg:col-span-2 rounded-3xl p-6 sm:p-8 bg-[#0A0D15] border border-white/5 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {isEn ? 'Commission Volume Tiers' : 'Niveles de Comisión por Volumen'}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {isEn ? 'Your payout percentage increases automatically with every sales milestone.' : 'Tu porcentaje de ganancia escala automáticamente con cada venta.'}
              </p>
            </div>
            <Award className="w-6 h-6 text-amber-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Tier 1 */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">TIER 1 · NOVICE</span>
                <span className="text-base font-black font-mono text-white">10%</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">0 - 5 {isEn ? 'Challenges sold' : 'Retos vendidos'}</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-full" />
              </div>
            </div>

            {/* Tier 2 (Activo) */}
            <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/40 space-y-2 relative overflow-hidden">
              <span className="absolute top-1.5 right-2 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
                ACTIVO
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300">TIER 2 · PRO</span>
                <span className="text-base font-black font-mono text-amber-400">15%</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">6 - 20 {isEn ? 'Challenges sold' : 'Retos vendidos'}</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[60%]" />
              </div>
            </div>

            {/* Tier 3 */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-300">TIER 3 · MASTER</span>
                <span className="text-base font-black font-mono text-purple-400">20%</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">20+ {isEn ? 'Challenges sold' : 'Retos vendidos'}</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[0%]" />
              </div>
            </div>
          </div>

          {/* Historial de Retiros de Comisiones */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              {isEn ? 'Affiliate Payouts History' : 'Historial de Liquidaciones de Afiliado'}
            </h4>
            
            {payoutHistory.length === 0 ? (
              <div className="text-xs text-slate-500 font-mono py-4 text-center">
                {isEn ? 'No payouts requested yet.' : 'Aún no has solicitado retiros.'}
              </div>
            ) : (
              <div className="space-y-2">
                {payoutHistory.map(p => (
                  <div key={p.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-bold text-white">${p.amount.toFixed(2)} USDT</span>
                      <span className="text-slate-400">({p.network})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{p.date}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'COMPLETED' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-amber-400/20 text-amber-300'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Formulario de Retiro de Comisiones */}
        <div className="rounded-3xl p-6 sm:p-8 bg-[#0A0D15] border border-white/5 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                {isEn ? 'ON-CHAIN SETTLEMENT' : 'LIQUIDACIÓN ON-CHAIN'}
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                {isEn ? 'Request Commission Payout' : 'Solicitar Retiro de Comisiones'}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {isEn ? 'Instant on-chain transfer to your personal crypto wallet.' : 'Transferencia directa a tu wallet en menos de 2 horas.'}
              </p>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-3.5">
              
              {/* Monto */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  {isEn ? 'Payout Amount (USDT):' : 'Monto a Retirar (USDT):'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    step="0.01"
                    placeholder="Min $50.00"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPayoutAmount(affiliateStats.availableBalance.toString())}
                    className="absolute right-2 top-2 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-amber-400 font-bold cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Red */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  {isEn ? 'Network:' : 'Red Blockchain:'}
                </label>
                <select
                  value={payoutNetwork}
                  onChange={(e: any) => setPayoutNetwork(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value="USDT-TRC20">TRON (USDT-TRC20) · Fee $0</option>
                  <option value="USDT-POLYGON">POLYGON (USDT) · Fee $0</option>
                  <option value="USDC-ARBITRUM">ARBITRUM (USDC) · Fee $0</option>
                </select>
              </div>

              {/* Dirección de Wallet */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  {isEn ? 'Your Wallet Address:' : 'Dirección de tu Billetera:'}
                </label>
                <input
                  type="text"
                  placeholder="Ej: TQn9Y2... o 0x71C..."
                  value={payoutAddress}
                  onChange={(e) => setPayoutAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              {payoutFeedback && (
                <div className={`p-3 rounded-xl text-xs font-mono ${
                  payoutFeedback.startsWith('✓') 
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                }`}>
                  {payoutFeedback}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingPayout}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
              >
                <span>{isSubmittingPayout ? (isEn ? 'Processing...' : 'Procesando...') : (isEn ? 'WITHDRAW EARNINGS' : 'RETIRAR GANANCIAS')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          </div>

          <div className="text-[11px] text-slate-500 font-mono text-center">
            {isEn ? 'Zero fees on corporate TRC20/Polygon payouts.' : 'Cero comisiones en liquidaciones institucionales.'}
          </div>
        </div>

      </div>

    </div>
  );
};
