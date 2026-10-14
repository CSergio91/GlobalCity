import React from 'react';
import { CrmKpiStats } from '../types/crm.types';
import { CrmLang, crmTranslations } from '../types/i18n';
import { Activity, Cpu, DollarSign, KeyRound, ArrowUpRight, ArrowDownRight, Wallet, ShieldAlert } from 'lucide-react';
import { useZytiEngineTelemetry } from '../hooks/useZytiEngineTelemetry';

interface KpiHeaderProps {
  kpis: CrmKpiStats | null;
  lang?: CrmLang;
  onRefresh?: () => void;
}

export const KpiHeader: React.FC<KpiHeaderProps> = ({ kpis, lang = 'es' }) => {
  const isEs = lang === 'es';
  const t = crmTranslations[lang] || crmTranslations.es;
  const telemetry = useZytiEngineTelemetry();

  const stats = kpis || {
    totalAccounts: 0,
    activeAccounts: 0,
    breachedAccounts: 0,
    fundedCapitalUsd: 0,
    activeApiKeys: 0,
    aiAgentsConnected: 1,
    liveFloatingPnL: 0,
    pendingPayoutsCount: 0,
    pendingPayoutsAmount: 0,
    riskStatus: 'HEALTHY' as const
  };

  const isProfit = stats.liveFloatingPnL >= 0;

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Traders Activos */}
      <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white border border-[#e5dfd3] shadow-[0_4px_20px_-4px_rgba(27,24,18,0.04)] hover:border-slate-400 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-cyan-700" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{t.kpiTraders}</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-[#0F172A] tracking-tight">{stats.activeAccounts}</span>
            <span className="text-[10px] text-slate-400 font-medium">/ {stats.totalAccounts}</span>
          </div>
          {stats.breachedAccounts > 0 && (
            <span className="text-[9px] font-bold text-rose-600 flex items-center gap-0.5 mt-0.5">
              <ShieldAlert className="w-2.5 h-2.5" />
              {stats.breachedAccounts} {isEs ? 'infracciones' : 'breached'}
            </span>
          )}
        </div>
      </div>

      {/* 2. Capital Asignado */}
      <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white border border-[#e5dfd3] shadow-[0_4px_20px_-4px_rgba(27,24,18,0.04)] hover:border-slate-400 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
          <DollarSign className="w-4 h-4 text-amber-700" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{t.kpiCapital}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-[#0F172A] tracking-tight">
              ${(stats.fundedCapitalUsd / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}k
            </span>
            <span className="text-[10px] text-slate-400 font-medium">USD</span>
          </div>
        </div>
      </div>

      {/* 3. PnL Flotante Global */}
      <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white border border-[#e5dfd3] shadow-[0_4px_20px_-4px_rgba(27,24,18,0.04)] hover:border-slate-400 transition-colors">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
          isProfit ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{t.kpiFloatingPnl}</div>
          <div className="flex items-baseline gap-1">
            <span className={`text-base font-black font-mono tracking-tight truncate ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isProfit ? '+' : ''}${stats.liveFloatingPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Retiros Pendientes (Payouts) */}
      <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white border border-[#e5dfd3] shadow-[0_4px_20px_-4px_rgba(27,24,18,0.04)] hover:border-slate-400 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
          <Wallet className="w-4 h-4 text-emerald-700" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
            {isEs ? 'Payouts Pendientes' : 'Pending Payouts'}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-[#0F172A] tracking-tight">
              ${(stats.pendingPayoutsAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-amber-700 font-bold font-mono">
              ({stats.pendingPayoutsCount || 0})
            </span>
          </div>
        </div>
      </div>

      {/* 5. Servidores EKLIPSE Engine (Real: Solo ON / OFF) */}
      <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white border border-[#e5dfd3] shadow-[0_4px_20px_-4px_rgba(27,24,18,0.04)] hover:border-slate-400 transition-colors">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
          telemetry.wsStatus === 'ON' ? 'bg-[#0A0D14] border-slate-800 text-amber-400' : 'bg-rose-50 border-rose-200 text-rose-600'
        }`}>
          <Cpu className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-black text-slate-500">
            EKLIPSE ENGINE
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold">
              <span className="text-slate-400 font-sans text-[9px]">WS</span>
              <span className={telemetry.wsStatus === 'ON' ? 'text-emerald-600' : 'text-rose-600'}>
                {telemetry.wsStatus === 'ON' ? 'ON' : 'OFF'}
              </span>
            </span>
            <span className="text-slate-300 font-mono">·</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold">
              <span className="text-slate-400 font-sans text-[9px]">BUS</span>
              <span className={telemetry.redisStatus === 'ON' ? 'text-emerald-600' : 'text-rose-600'}>
                {telemetry.redisStatus === 'ON' ? 'ON' : 'OFF'}
              </span>
            </span>
            <span className="text-slate-300 font-mono">·</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold">
              <span className="text-slate-400 font-sans text-[9px]">RISK</span>
              <span className={telemetry.riskSentinelStatus === 'ON' ? 'text-emerald-600' : 'text-rose-600'}>
                {telemetry.riskSentinelStatus === 'ON' ? 'ON' : 'OFF'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 6. APIs & Agentes IA */}
      <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white border border-[#e5dfd3] shadow-[0_4px_20px_-4px_rgba(27,24,18,0.04)] hover:border-slate-400 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200/80 flex items-center justify-center shrink-0">
          <KeyRound className="w-4 h-4 text-purple-700" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{t.kpiApis}</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-[#0F172A] tracking-tight">{stats.activeApiKeys}</span>
            <span className="text-[10px] text-purple-700 font-bold font-mono">
              ({stats.aiAgentsConnected} {isEs ? 'daemon' : 'daemon'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
