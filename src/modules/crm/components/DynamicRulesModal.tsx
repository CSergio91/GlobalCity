import React, { useState, useEffect } from 'react';
import { RiskRuleConfigEntity } from '../types/crm.types';
import { CrmLang } from '../types/i18n';
import { 
  X, 
  Save, 
  Sliders, 
  Check, 
  Star, 
  ExternalLink, 
  Search, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Sparkles,
  Percent,
  CheckCircle2
} from 'lucide-react';

interface DynamicRulesModalProps {
  isOpen: boolean;
  lang?: CrmLang;
  onClose: () => void;
  ruleToEdit: RiskRuleConfigEntity | null;
  availableRules?: RiskRuleConfigEntity[];
  onNavigateToChallenges?: () => void;
  onSaveRule: (rule: Partial<RiskRuleConfigEntity>) => Promise<void>;
}

export const DynamicRulesModal: React.FC<DynamicRulesModalProps> = ({
  isOpen,
  lang = 'es',
  onClose,
  ruleToEdit,
  availableRules = [],
  onNavigateToChallenges,
  onSaveRule
}) => {
  const isEs = lang === 'es';

  // Pestaña activa dentro del modal: 'PRESETS' (por defecto) o 'CUSTOMIZE'
  const [activeTab, setActiveTab] = useState<'PRESETS' | 'CUSTOMIZE'>('PRESETS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');

  // Estados editables para el modo de personalización
  const [name, setName] = useState('');
  const [profitTargetPercent, setProfitTargetPercent] = useState(10.0);
  const [maxDailyLossPercent, setMaxDailyLossPercent] = useState(5.0);
  const [maxTotalDrawdownPercent, setMaxTotalDrawdownPercent] = useState(10.0);
  const [drawdownType, setDrawdownType] = useState<'EOD' | 'TRAILING_EQUITY'>('EOD');
  const [maxLeverage, setMaxLeverage] = useState(100);
  const [mandatoryStopLoss, setMandatoryStopLoss] = useState(false);
  const [antiHedgingEnabled, setAntiHedgingEnabled] = useState(false);
  const [weekendHoldingAllowed, setWeekendHoldingAllowed] = useState(true);
  const [consistencyRulePercent, setConsistencyRulePercent] = useState(40.0);
  const [profitSplitPercent, setProfitSplitPercent] = useState(80.0);
  const [minTradingDays, setMinTradingDays] = useState(5);
  const [defaultAccountBalance, setDefaultAccountBalance] = useState(100000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar al abrir o cambiar de regla
  useEffect(() => {
    if (!isOpen) return;

    if (ruleToEdit) {
      // Buscar si coincide con alguna regla de availableRules
      const matched = availableRules.find(r => 
        r.id === ruleToEdit.id || 
        r.name.toLowerCase() === ruleToEdit.name.toLowerCase() ||
        (Number(r.max_daily_loss_percent) === Number(ruleToEdit.max_daily_loss_percent) &&
         Number(r.max_total_drawdown_percent) === Number(ruleToEdit.max_total_drawdown_percent))
      );

      if (matched) {
        setSelectedRuleId(matched.id);
      } else if (availableRules.length > 0) {
        setSelectedRuleId(availableRules[0].id);
      }

      setName(ruleToEdit.name);
      setProfitTargetPercent(Number(ruleToEdit.profit_target_percent || 10.0));
      setMaxDailyLossPercent(Number(ruleToEdit.max_daily_loss_percent || 5.0));
      setMaxTotalDrawdownPercent(Number(ruleToEdit.max_total_drawdown_percent || 10.0));
      setDrawdownType(ruleToEdit.drawdown_type || 'EOD');
      setMaxLeverage(Number(ruleToEdit.max_leverage || 100));
      setMandatoryStopLoss(!!ruleToEdit.mandatory_stop_loss);
      setAntiHedgingEnabled(!!ruleToEdit.anti_hedging_enabled);
      setWeekendHoldingAllowed(ruleToEdit.weekend_holding_allowed !== false);
      setConsistencyRulePercent(Number(ruleToEdit.consistency_rule_percent || 40.0));
      setProfitSplitPercent(Number(ruleToEdit.profit_split_percent || 80.0));
      setMinTradingDays(Number(ruleToEdit.min_trading_days || 5));
      setDefaultAccountBalance(Number(ruleToEdit.default_account_balance || 100000));
    } else if (availableRules.length > 0) {
      const defaultOne = availableRules.find(r => r.is_default_demo) || availableRules[0];
      setSelectedRuleId(defaultOne.id);
      applyRuleFields(defaultOne);
    }
  }, [isOpen, ruleToEdit, availableRules]);

  const applyRuleFields = (r: RiskRuleConfigEntity) => {
    setName(r.name);
    setProfitTargetPercent(Number(r.profit_target_percent || 10.0));
    setMaxDailyLossPercent(Number(r.max_daily_loss_percent || 5.0));
    setMaxTotalDrawdownPercent(Number(r.max_total_drawdown_percent || 10.0));
    setDrawdownType(r.drawdown_type || 'EOD');
    setMaxLeverage(Number(r.max_leverage || 100));
    setMandatoryStopLoss(!!r.mandatory_stop_loss);
    setAntiHedgingEnabled(!!r.anti_hedging_enabled);
    setWeekendHoldingAllowed(r.weekend_holding_allowed !== false);
    setConsistencyRulePercent(Number(r.consistency_rule_percent || 40.0));
    setProfitSplitPercent(Number(r.profit_split_percent || 80.0));
    setMinTradingDays(Number(r.min_trading_days || 5));
    setDefaultAccountBalance(Number(r.default_account_balance || 100000));
  };

  const handleSelectPreset = (preset: RiskRuleConfigEntity) => {
    setSelectedRuleId(preset.id);
    applyRuleFields(preset);
  };

  const handleAssignSelectedPreset = async () => {
    const targetRule = availableRules.find(r => r.id === selectedRuleId);
    if (!targetRule) return;

    setIsSubmitting(true);
    try {
      await onSaveRule({
        ...targetRule,
        id: targetRule.id
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveRule({
        id: ruleToEdit?.id,
        name,
        profit_target_percent: Number(profitTargetPercent),
        max_daily_loss_percent: Number(maxDailyLossPercent),
        max_total_drawdown_percent: Number(maxTotalDrawdownPercent),
        drawdown_type: drawdownType,
        max_leverage: Number(maxLeverage),
        mandatory_stop_loss: mandatoryStopLoss,
        anti_hedging_enabled: antiHedgingEnabled,
        weekend_holding_allowed: weekendHoldingAllowed,
        consistency_rule_percent: Number(consistencyRulePercent),
        profit_split_percent: Number(profitSplitPercent),
        min_trading_days: Number(minTradingDays),
        default_account_balance: Number(defaultAccountBalance)
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Filtrar challenges disponibles
  const filteredPresets = availableRules.filter(r => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return r.name.toLowerCase().includes(q) || 
           String(r.default_account_balance).includes(q) ||
           String(r.model_type).toLowerCase().includes(q);
  });

  const selectedPresetObj = availableRules.find(r => r.id === selectedRuleId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FAF8F5] border border-[#dcd6ca] shadow-2xl overflow-hidden text-slate-800">
        
        {/* 1. Header Institucional */}
        <div className="p-5 border-b border-[#ece7dc] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  {isEs ? 'Asignar / Calibrar Reglas de Challenge' : 'Assign / Calibrate Challenge Rules'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {availableRules.length} {isEs ? 'Configurados en BD' : 'Configured in DB'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isEs 
                  ? 'Aplica directamente uno de los planes definidos en Gestión de Challenges (/challenges) o calibra parámetros.' 
                  : 'Apply plans configured in Challenges (/challenges) directly to this trading account.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Selector de Pestaña Modo Presets / Personalizado */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('PRESETS')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'PRESETS' 
                    ? 'bg-white text-slate-900 shadow-2xs font-black' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isEs ? 'Challenges Disponibles' : 'Configured Challenges'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('CUSTOMIZE')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'CUSTOMIZE' 
                    ? 'bg-white text-slate-900 shadow-2xs font-black' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isEs ? 'Ajuste Fino de Cuenta' : 'Account Override'}
              </button>
            </div>

            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Cuerpo del Modal */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* MODO A: LISTA DE CHALLENGES CONFIGURADOS EN /challenges */}
          {activeTab === 'PRESETS' && (
            <div className="space-y-4">
              
              {/* Barra de Filtro y Acceso Directo a /challenges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isEs ? 'Buscar challenge por nombre o capital...' : 'Search challenge by name or balance...'}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#dcd6ca] rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 font-medium"
                  />
                </div>

                {onNavigateToChallenges && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToChallenges();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer py-1"
                  >
                    <span>{isEs ? 'Ir a Gestión de Challenges (/challenges)' : 'Go to Challenges Management (/challenges)'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Grid de Cards de Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredPresets.map((rule) => {
                  const isSelected = selectedRuleId === rule.id;
                  const isCurrentlyActive = ruleToEdit && (
                    ruleToEdit.id === rule.id || 
                    ruleToEdit.name.toLowerCase() === rule.name.toLowerCase()
                  );

                  const mType = rule.model_type || 'ONE_PHASE';
                  const bal = Number(rule.default_account_balance || 100000);

                  return (
                    <div
                      key={rule.id}
                      onClick={() => handleSelectPreset(rule)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
                          : 'bg-white/80 hover:bg-white border-[#e0dad0] hover:border-slate-400 shadow-2xs'
                      }`}
                    >
                      {/* Cabecera de la Card */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected 
                              ? 'bg-emerald-600 border-emerald-600 text-white' 
                              : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 leading-tight">
                              {rule.name}
                            </h4>
                            <span className="text-xs font-mono font-extrabold text-slate-700">
                              ${bal.toLocaleString()} USD
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            mType === 'INSTANT_FUNDING'
                              ? 'bg-purple-100 text-purple-900 border-purple-200'
                              : mType === 'TWO_PHASE'
                                ? 'bg-blue-100 text-blue-900 border-blue-200'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                          }`}>
                            {mType === 'INSTANT_FUNDING' ? 'Fondeo Directo' : mType === 'TWO_PHASE' ? '2 Fases' : '1 Fase'}
                          </span>
                          {rule.is_default_demo && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              ⭐ Demo Defecto
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Parámetros Institucionales del Challenge */}
                      <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-slate-100 text-[11px] font-mono">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase font-sans">Target</span>
                          <span className="font-bold text-emerald-700">
                            {mType === 'INSTANT_FUNDING' ? 'N/A' : `+${rule.profit_target_percent || 10}%`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase font-sans">Max DD Día</span>
                          <span className="font-bold text-rose-700">
                            -{rule.max_daily_loss_percent}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase font-sans">Max DD Total</span>
                          <span className="font-bold text-rose-700">
                            -{rule.max_total_drawdown_percent}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase font-sans">Split</span>
                          <span className="font-bold text-slate-800">
                            {rule.profit_split_percent || 80}%
                          </span>
                        </div>
                      </div>

                      {/* Badges de Reglas Adicionales */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {rule.max_leverage || 100}x Lev
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {rule.min_trading_days || 5}d Mínimos
                        </span>
                        {rule.mandatory_stop_loss && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                            Stop Loss Req.
                          </span>
                        )}
                        {rule.anti_hedging_enabled && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                            Anti-Hedging
                          </span>
                        )}
                      </div>

                      {/* Indicador de regla activa */}
                      {isCurrentlyActive && (
                        <div className="absolute -top-2 -right-2">
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 text-emerald-400 text-[9px] font-black border border-emerald-500 shadow-xs">
                            ASIGNADO AHORA
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredPresets.length === 0 && (
                  <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-bold">
                      {isEs ? 'No se encontraron challenges con ese filtro.' : 'No challenges found.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODO B: AJUSTE FINO / OVERRIDE DE PARÁMETROS PARA ESTA CUENTA */}
          {activeTab === 'CUSTOMIZE' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                {isEs 
                  ? 'Estás configurando una calibración específica para esta cuenta. Puedes partir de los valores del challenge seleccionado y sobreescribir límites individuales.' 
                  : 'Customizing rules specifically for this account. Values are pre-filled from the selected challenge.'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre / Plan</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tamaño Cuenta ($)</label>
                  <input
                    type="number"
                    value={defaultAccountBalance}
                    onChange={(e) => setDefaultAccountBalance(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Profit (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={profitTargetPercent}
                    onChange={(e) => setProfitTargetPercent(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Daily DD (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxDailyLossPercent}
                    onChange={(e) => setMaxDailyLossPercent(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Total DD (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxTotalDrawdownPercent}
                    onChange={(e) => setMaxTotalDrawdownPercent(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Profit Split (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={profitSplitPercent}
                    onChange={(e) => setProfitSplitPercent(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Apalancamiento</label>
                  <select
                    value={maxLeverage}
                    onChange={(e) => setMaxLeverage(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                  >
                    <option value={10}>10x</option>
                    <option value={20}>20x</option>
                    <option value={30}>30x</option>
                    <option value={50}>50x</option>
                    <option value={100}>100x</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">Stop Loss Obligatorio</span>
                  <input
                    type="checkbox"
                    checked={mandatoryStopLoss}
                    onChange={(e) => setMandatoryStopLoss(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm"
                  />
                </label>
                <label className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">Anti-Hedging</span>
                  <input
                    type="checkbox"
                    checked={antiHedgingEnabled}
                    onChange={(e) => setAntiHedgingEnabled(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm"
                  />
                </label>
                <label className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">Operar Fin de Semana</span>
                  <input
                    type="checkbox"
                    checked={weekendHoldingAllowed}
                    onChange={(e) => setWeekendHoldingAllowed(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm"
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('PRESETS')}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{isSubmitting ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar Calibración Personalizada' : 'Save Custom Calibration')}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* 3. Footer de Acción */}
        {activeTab === 'PRESETS' && (
          <div className="p-4 border-t border-[#ece7dc] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-500 font-medium">
              {selectedPresetObj ? (
                <span>
                  {isEs ? 'Seleccionado:' : 'Selected:'} <strong className="text-slate-900 font-bold">{selectedPresetObj.name}</strong> (${Number(selectedPresetObj.default_account_balance).toLocaleString()} · DD Diario {selectedPresetObj.max_daily_loss_percent}% · DD Total {selectedPresetObj.max_total_drawdown_percent}% · Split {selectedPresetObj.profit_split_percent || 80}%)
                </span>
              ) : (
                <span>{isEs ? 'Selecciona un challenge para aplicar.' : 'Select a challenge to apply.'}</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                {isEs ? 'Cerrar' : 'Close'}
              </button>

              <button
                type="button"
                onClick={handleAssignSelectedPreset}
                disabled={!selectedRuleId || isSubmitting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#020617] text-xs font-black transition-all hover:scale-[1.02] active:scale-95 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {isSubmitting 
                    ? (isEs ? 'Aplicando...' : 'Applying...') 
                    : (isEs ? `Asignar a esta Cuenta` : `Assign to Account`)}
                </span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
