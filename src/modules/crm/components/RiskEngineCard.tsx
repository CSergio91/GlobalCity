import React from 'react';
import { MonitoredPosition, RiskRuleConfigEntity } from '../types/crm.types';
import { CrmLang, crmTranslations } from '../types/i18n';
import { ShieldCheck, Sliders, AlertOctagon, ArrowUpRight, ArrowDownRight, Skull, Zap, Plus, RotateCcw } from 'lucide-react';

interface RiskEngineCardProps {
  rules: RiskRuleConfigEntity[];
  activeRule: RiskRuleConfigEntity;
  selectedRuleId: string;
  lang?: CrmLang;
  onSelectRuleId: (id: string) => void;
  onOpenRulesModal: () => void;
  onOpenCreateRuleModal?: () => void;
  monitoredPositions: MonitoredPosition[];
  onEmergencyLiquidate: (positionId: string) => void;
  onResetAccount?: (accountNumberOrId: string) => void;
}

export const RiskEngineCard: React.FC<RiskEngineCardProps> = ({
  rules,
  activeRule,
  selectedRuleId,
  lang = 'es',
  onSelectRuleId,
  onOpenRulesModal,
  onOpenCreateRuleModal,
  monitoredPositions,
  onEmergencyLiquidate,
  onResetAccount
}) => {
  const t = crmTranslations[lang] || crmTranslations.es;

  return (
    <div className="w-full rounded-2xl bg-white border border-[#e5dfd3] p-5 shadow-[0_20px_50px_-12px_rgba(27,24,18,0.06)]">
      {/* Cabecera del Risk Engine */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ece7dc]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                {t.riskCardTitle}
              </h2>
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {t.riskCardBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {t.riskCardDesc}
            </p>
          </div>
        </div>

        {/* Selector de Preset y Botón Calibrar */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedRuleId}
            onChange={(e) => onSelectRuleId(e.target.value)}
            className="bg-[#f8f6f0] border border-[#dcd6ca] rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-slate-800 transition-colors shadow-sm"
          >
            {rules.map(r => (
              <option key={r.id} value={r.id}>
                {r.is_default_demo 
                  ? `⭐ ${r.name} ($${Math.round(Number(r.default_account_balance || 100000) / 1000)}K - Demo Defecto)`
                  : `${r.name} ($${Math.round(Number(r.default_account_balance || 100000) / 1000)}K)`}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenRulesModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-[#EAB308]" />
            <span>{t.calibrateRules}</span>
          </button>

          <button
            onClick={onOpenCreateRuleModal || onOpenRulesModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#020617] text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{lang === 'es' ? 'Nuevo Challenge' : 'New Challenge'}</span>
          </button>
        </div>
      </div>

      {/* Franja de Parámetros Dinámicos Institucionales (Reglas Clave) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-13 gap-2 my-4 p-3 rounded-xl bg-[#fbf9f5] border border-[#e5dfd3]">
        <div className="px-2 py-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">{lang === 'es' ? 'Modelo' : 'Model'}</div>
          <div className="text-xs font-black text-[#0F172A] uppercase">
            {activeRule?.model_type === 'INSTANT_FUNDING' ? 'Fondeo Directo' : activeRule?.model_type === 'TWO_PHASE' ? '2 Fases' : '1 Fase'}
          </div>
        </div>
        <div className="px-2 py-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">{lang === 'es' ? 'Tamaño Cuenta' : 'Account Size'}</div>
          <div className="text-xs font-mono font-extrabold text-[#0F172A] flex items-center gap-1">
            <span>${(Number(activeRule?.default_account_balance || 100000)).toLocaleString()}</span>
            {activeRule?.is_default_demo && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">⭐ Demo</span>
            )}
          </div>
        </div>
        <div className="px-2 py-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Target Profit</div>
          <div className="text-xs font-mono font-extrabold text-emerald-700">
            {activeRule?.model_type === 'INSTANT_FUNDING' ? 'N/A' : `+${activeRule?.profit_target_percent || 10}%`}
          </div>
        </div>
        <div className="px-2 py-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">{t.ruleDailyLoss}</div>
          <div className="text-xs font-mono font-extrabold text-rose-700">
            {activeRule?.max_daily_loss_percent}% <span className="text-[10px] text-slate-400 font-medium">({activeRule?.drawdown_type})</span>
          </div>
        </div>
        <div className="px-2 py-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">{t.ruleTotalLoss}</div>
          <div className="text-xs font-mono font-extrabold text-rose-700">
            {activeRule?.max_total_drawdown_percent}%
          </div>
        </div>
        <div className="px-2 py-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">{t.ruleLeverage}</div>
          <div className="text-xs font-mono font-extrabold text-amber-700">
            {activeRule?.max_leverage}x
          </div>
        </div>
        <div className="px-2 py-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">{t.ruleStopLoss}</div>
          <div className={`text-xs font-bold ${activeRule?.mandatory_stop_loss ? 'text-indigo-700' : 'text-slate-500'}`}>
            {activeRule?.mandatory_stop_loss ? t.ruleStrict : t.ruleOptional}
          </div>
        </div>
        <div className="px-2 py-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Anti-Hedging</div>
          <div className={`text-xs font-bold ${activeRule?.anti_hedging_enabled ? 'text-indigo-700' : 'text-slate-500'}`}>
            {activeRule?.anti_hedging_enabled ? 'Estricto' : 'Permitido'}
          </div>
        </div>
        <div className="px-2 py-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Por Activo</div>
          <div className="text-xs font-mono font-bold text-slate-800">
            {activeRule?.max_positions_per_symbol_enabled ? `Máx ${activeRule.max_positions_per_symbol}` : 'Sin Límite'}
          </div>
        </div>
        <div className="px-2 py-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Total Posiciones</div>
          <div className="text-xs font-mono font-bold text-slate-800">
            {activeRule?.max_total_open_positions_enabled ? `Máx ${activeRule.max_total_open_positions}` : 'Sin Límite'}
          </div>
        </div>
        <div className="px-2 py-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">{lang === 'es' ? 'Día Mínimo' : 'Min Days'}</div>
          <div className="text-xs font-mono font-extrabold text-blue-700">
            {activeRule?.min_trading_days || 5}d <span className="text-[10px] text-slate-400">({activeRule?.min_daily_profit_value ? `+${activeRule.min_daily_profit_value}${activeRule.min_daily_profit_type === 'AMOUNT' ? '$' : '%'}` : 'Libre'})</span>
          </div>
        </div>
        <div className="px-2 py-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">{t.ruleWeekends}</div>
          <div className={`text-xs font-bold ${activeRule?.weekend_holding_allowed ? 'text-emerald-700' : 'text-rose-700'}`}>
            {activeRule?.weekend_holding_allowed ? t.ruleAllowed : t.ruleForbidden}
          </div>
        </div>
        <div className="px-2 py-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Profit Split</div>
          <div className="text-xs font-mono font-extrabold text-emerald-700">
            {activeRule?.profit_split_percent || 80}% <span className="text-[10px] text-slate-400 font-normal">/ {100 - (activeRule?.profit_split_percent || 80)}%</span>
          </div>
        </div>
      </div>

      {/* Monitor de Posiciones en Tiempo Real */}
      <div className="overflow-x-auto rounded-xl border border-[#e5dfd3] bg-[#fbf9f5]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e5dfd3] bg-[#f5f1e8] text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3.5">{t.thTrader}</th>
              <th className="py-2.5 px-3">{lang === 'es' ? 'Tamaño Cuenta' : 'Account Size'}</th>
              <th className="py-2.5 px-3">{t.thPair}</th>
              <th className="py-2.5 px-3">{t.thSize}</th>
              <th className="py-2.5 px-3">{t.thPrices}</th>
              <th className="py-2.5 px-3">{t.thPnl}</th>
              <th className="py-2.5 px-3">{t.thDrawdown}</th>
              <th className="py-2.5 px-3">{t.thStatus}</th>
              <th className="py-2.5 px-3 text-right">{t.thAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece7dc] bg-white">
            {monitoredPositions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                  {t.noPositions}
                </td>
              </tr>
            ) : (
              monitoredPositions.map(pos => {
                const isLong = pos.side === 'LONG';
                const floatingPnl = Number(pos.floatingPnl) || 0;
                const isPosProfit = floatingPnl >= 0;
                const accSize = Number(pos.accountSize) || 100000;
                const entryP = Number(pos.entryPrice) || 0;
                const currentP = Number(pos.currentPrice) || entryP;
                const ddPct = Number(pos.dailyDrawdownPct) || 0;
                const maxDailyLimit = Number(activeRule?.max_daily_loss_percent) || 5;
                const sizeLabel = pos.sizeUnits !== undefined && pos.sizeUnits !== null ? String(pos.sizeUnits) : '0';

                return (
                  <tr key={pos.id} className="hover:bg-[#faf8f4] transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-[#0F172A]">{pos.traderName || pos.accountNumber}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{pos.traderEmail}</div>
                    </td>

                    {/* Tamaño de Cuenta */}
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#f5f1e8] border border-[#dcd6ca] text-[11px] font-mono font-extrabold text-[#0F172A]">
                        ${(accSize / 1000).toFixed(0)}k USD
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[#0F172A]">{pos.symbol}</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isLong 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isLong ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                          {pos.side}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono font-semibold text-slate-800">{sizeLabel}</div>
                      <div className="text-[10px] text-amber-700 font-mono font-bold">{pos.leverage || 1}x Lev</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div className="text-slate-400 font-medium">${entryP.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className="text-[#0F172A] font-bold">${currentP.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-xs">
                      <span className={`font-extrabold ${isPosProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isPosProfit ? '+' : ''}${floatingPnl.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              ddPct > maxDailyLimit * 0.8 ? 'bg-rose-600' : ddPct > maxDailyLimit * 0.5 ? 'bg-amber-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${Math.min(100, (ddPct / maxDailyLimit) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-700 font-bold">
                          {ddPct.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {pos.ruleHealth === 'HEALTHY' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          {t.statusHealthy}
                        </span>
                      )}
                      {pos.ruleHealth === 'WARNING' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold" title={pos.breachReason}>
                          <AlertOctagon className="w-3 h-3 text-amber-600" />
                          {t.statusWarning}
                        </span>
                      )}
                      {pos.ruleHealth === 'BREACHED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-extrabold animate-pulse" title={pos.breachReason}>
                          <Skull className="w-3 h-3 text-rose-600" />
                          {t.statusBreached}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {pos.ruleHealth === 'BREACHED' ? (
                        <button
                          onClick={() => onResetAccount ? onResetAccount(pos.accountNumber || pos.id) : onEmergencyLiquidate(pos.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xs"
                          title={lang === 'es' ? 'Restablecer cuenta a estado ACTIVA' : 'Reset account to ACTIVE status'}
                        >
                          <RotateCcw className="w-3 h-3 text-emerald-600" />
                          <span>{lang === 'es' ? 'Restablecer' : 'Reset'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onEmergencyLiquidate(pos.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xs"
                          title="Liquidación forzosa inmediata a mercado"
                        >
                          <Zap className="w-3 h-3" />
                          {t.btnLiquidate}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
