import React, { useState } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Award, 
  Clock, 
  Calendar, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  CreditCard,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { UserTradingAccount } from '../TraderDashboardApp';

interface TraderAddonsStoreViewProps {
  accounts: UserTradingAccount[];
  selectedAccountId: string | null;
  onSelectAccount: (accId: string) => void;
}

export interface AddonItem {
  id: string;
  nameEn: string;
  nameEs: string;
  tagEn: string;
  tagEs: string;
  descEn: string;
  descEs: string;
  priceDelta: string;
  icon: any;
  color: string;
  badge: string;
}

const ALL_ADDONS: AddonItem[] = [
  {
    id: 'profit_split_90',
    nameEn: '90% Lifetime Profit Split',
    nameEs: '90% Reparto de Beneficios de por Vida',
    tagEn: 'MAX EARNINGS',
    tagEs: 'MÁXIMA RENTABILIDAD',
    descEn: 'Locks maximum 90% payout split on all future profit withdrawals without scaling ladders.',
    descEs: 'Bloquea el 90% de reparto neto en todos tus retiros futuros sin necesidad de fases de escalado.',
    priceDelta: '+18% Plan Value',
    icon: Award,
    color: 'amber',
    badge: 'POPULAR'
  },
  {
    id: 'extra_drawdown',
    nameEn: '+2% Drawdown Shield',
    nameEs: '+2% Escudo de Drawdown Máximo',
    tagEn: 'RISK PROTECTION',
    tagEs: 'PROTECCIÓN DE RIESGO',
    descEn: 'Expands maximum overall drawdown by +2% (up to 10% on Solar or 12% on Lunar).',
    descEs: 'Aumenta el drawdown máximo permitido en un +2% adicional (hasta 10% en Solar o 12% en Lunar).',
    priceDelta: '+20% Plan Value',
    icon: ShieldCheck,
    color: 'emerald',
    badge: 'RECOMMENDED'
  },
  {
    id: 'boost_leverage',
    nameEn: '+50% Leverage Power Boost',
    nameEs: '+50% Potencia de Apalancamiento',
    tagEn: 'MAX PURCHASING POWER',
    tagEs: 'MAYOR MARGEN',
    descEn: 'Increases institutional leverage to 1:150 (Solar) or 1:200 (Lunar) for micro-scalping and high frequency sizing.',
    descEs: 'Eleva el apalancamiento institucional a 1:150 (Solar) o 1:200 (Lunar) para mayor flexibilidad táctica.',
    priceDelta: '+15% Plan Value',
    icon: Zap,
    color: 'purple',
    badge: 'LEVERAGE'
  },
  {
    id: 'weekly_payout',
    nameEn: 'Weekly Accelerated Payouts',
    nameEs: 'Retiros Semanales Acelerados',
    tagEn: 'INSTANT LIQUIDITY',
    tagEs: 'LIQUIDEZ SEMANAL',
    descEn: 'Reduces standard 14-day payout cycle to every 7 days with guaranteed on-chain USDT settlement in <2 hours.',
    descEs: 'Reduce el ciclo habitual de 14 días a solo 7 días con liquidación on-chain asegurada en menos de 2 horas.',
    priceDelta: '+12% Plan Value',
    icon: Clock,
    color: 'cyan',
    badge: 'SPEED'
  },
  {
    id: 'weekend_holding',
    nameEn: 'Weekend Holding Pass',
    nameEs: 'Pase de Mantenimiento de Fin de Semana',
    tagEn: 'SWING TRADING',
    tagEs: 'SWING 24/7',
    descEn: 'Exempts this account from Friday 20:55 UTC auto-close rule. Keep swing crypto positions open over the weekend.',
    descEs: 'Exime tu cuenta del auto-cierre de los viernes a las 20:55 UTC. Mantén posiciones abiertas el fin de semana.',
    priceDelta: '+15% Plan Value',
    icon: Calendar,
    color: 'amber',
    badge: 'SWING'
  }
];

export const TraderAddonsStoreView: React.FC<TraderAddonsStoreViewProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const activeAcc = accounts.find(a => a.id === selectedAccountId) || accounts[0] || null;

  // Add-ons que ya están activos en la cuenta
  const activeAddonIds = React.useMemo(() => {
    if (!activeAcc) return [];
    const list: string[] = [];
    if (activeAcc.profitSplit >= 90) list.push('profit_split_90');
    if (activeAcc.maxTotalDrawdownPct > 10 || (activeAcc.category === 'solar' && activeAcc.maxTotalDrawdownPct > 6)) {
      list.push('extra_drawdown');
    }
    if (activeAcc.leverage?.includes('150') || activeAcc.leverage?.includes('200')) {
      list.push('boost_leverage');
    }
    return list;
  }, [activeAcc]);

  const handleActivateAddon = (addon: AddonItem) => {
    if (!activeAcc) {
      setFeedbackMsg(isEn ? 'Please select an account first' : 'Selecciona una cuenta primero');
      return;
    }

    setFeedbackMsg(
      isEn 
        ? `✓ ${addon.nameEn} can be unlocked on new challenge checkout or via support ticket desk.`
        : `✓ ${addon.nameEs} se activa al adquirir un nuevo reto o contactando a la mesa de soporte.`
    );
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Header con Selector de Cuenta */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#0A0D15] border border-white/5 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isEn ? 'Institutional Add-ons Store' : 'Tienda de Add-ons Institucionales'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {isEn 
                ? 'Upgrade account rules, expand drawdowns, unlock 90% payout splits and weekend swing holding.' 
                : 'Optimiza las reglas de tu cuenta, amplía drawdowns y desbloquea el 90% de beneficio de por vida.'}
            </p>
          </div>

          {/* Selector de cuenta para ver add-ons activos */}
          {accounts.length > 0 && (
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 shrink-0">
              <span className="text-xs font-mono text-slate-400 pl-2">
                {isEn ? 'Target Account:' : 'Cuenta:'}
              </span>
              <select
                value={activeAcc?.id || ''}
                onChange={(e) => onSelectAccount(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-amber-400 focus:outline-none cursor-pointer"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountNumber} (${acc.initialBalance.toLocaleString()} {acc.category.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {feedbackMsg && (
          <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono">
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* 2. Grid de Add-ons Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_ADDONS.map(addon => {
          const Icon = addon.icon;
          const isAlreadyActive = activeAddonIds.includes(addon.id);

          return (
            <div 
              key={addon.id}
              className={`rounded-3xl p-6 sm:p-7 border flex flex-col justify-between space-y-5 transition-all shadow-xl relative overflow-hidden ${
                isAlreadyActive 
                  ? 'bg-gradient-to-b from-amber-400/10 via-[#0C101A] to-[#0A0D15] border-amber-400/40 shadow-amber-400/5' 
                  : 'bg-[#0A0D15] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                
                {/* Header de la Tarjeta */}
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    addon.color === 'amber' ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30' :
                    addon.color === 'emerald' ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30' :
                    addon.color === 'purple' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' :
                    'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {isAlreadyActive ? (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-400 border border-emerald-400/40 flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{isEn ? 'ACTIVE ON ACCOUNT' : 'ACTIVO EN CUENTA'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                      {addon.badge}
                    </span>
                  )}
                </div>

                {/* Título y Descripción */}
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {addon[isEn ? 'tagEn' : 'tagEs']}
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {addon[isEn ? 'nameEn' : 'nameEs']}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-2 leading-relaxed">
                    {addon[isEn ? 'descEn' : 'descEs']}
                  </p>
                </div>
              </div>

              {/* Footer con Costo y Botón */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">{isEn ? 'Upgrade Cost' : 'Precio Adicional'}</div>
                  <div className="text-xs font-mono font-bold text-amber-400">{addon.priceDelta}</div>
                </div>

                <button
                  onClick={() => handleActivateAddon(addon)}
                  disabled={isAlreadyActive}
                  className={`px-4 py-2 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isAlreadyActive
                      ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                      : 'bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white shadow-md'
                  }`}
                >
                  <span>{isAlreadyActive ? (isEn ? 'Enabled' : 'Habilitado') : (isEn ? 'Add to Plan' : 'Agregar')}</span>
                  {!isAlreadyActive && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
