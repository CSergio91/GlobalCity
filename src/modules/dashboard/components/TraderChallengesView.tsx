import React, { useState, useMemo } from 'react';
import { 
  Sun, 
  Moon, 
  ShieldCheck, 
  Zap, 
  Award, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Check, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  Layers,
  HelpCircle,
  Percent
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  PlanCategory, 
  PaymentMode, 
  ChallengePlan, 
  SOLAR_CHALLENGE_PLANS, 
  LUNAR_CHALLENGE_PLANS,
  AVAILABLE_ADDONS,
  calculateDynamicPlanPricing,
  getLiveChallengePlans
} from '../../../data/challengePlans';

interface TraderChallengesViewProps {
  onSelectPlanForCheckout?: (planId: string, addons: string[], category: PlanCategory) => void;
}

export const TraderChallengesView: React.FC<TraderChallengesViewProps> = ({
  onSelectPlanForCheckout
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [category, setCategory] = useState<PlanCategory>('solar');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('one-time');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('solar-50k');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [plans, setPlans] = useState<ChallengePlan[]>(() => {
    try {
      const cached = localStorage.getItem('eklipse_cached_challenge_plans');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const catPlans = parsed.filter(p => p.category === 'solar');
          if (catPlans.length > 0) return catPlans;
        }
      }
    } catch (_) {}
    return SOLAR_CHALLENGE_PLANS;
  });

  React.useEffect(() => {
    getLiveChallengePlans(category).then((live) => {
      if (live && live.length > 0) {
        setPlans(live);
        if (!live.some(p => p.id === selectedPlanId)) {
          setSelectedPlanId(live[0].id);
        }
      }
    });
  }, [category]);

  const activePlan = useMemo(() => {
    return plans.find(p => p.id === selectedPlanId) || plans[0] || SOLAR_CHALLENGE_PLANS[0];
  }, [plans, selectedPlanId]);

  const pricing = useMemo(() => {
    return calculateDynamicPlanPricing(activePlan, paymentMode, selectedAddons);
  }, [activePlan, paymentMode, selectedAddons]);

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const handleCategoryChange = (newCat: PlanCategory) => {
    setCategory(newCat);
    getLiveChallengePlans(newCat).then((live) => {
      if (live && live.length > 0) {
        setPlans(live);
        setSelectedPlanId(live[0].id);
      }
    });
  };

  const handleProceedToCheckout = () => {
    if (onSelectPlanForCheckout) {
      onSelectPlanForCheckout(activePlan.id, selectedAddons, category);
    } else {
      // Guardar preselección y redirigir
      try {
        sessionStorage.setItem('eklipse_target_plan', activePlan.id);
        sessionStorage.setItem('eklipse_target_addons', JSON.stringify(selectedAddons));
        sessionStorage.setItem('eklipse_auth_mode', 'register');
      } catch (_) {}
      const addonsQuery = selectedAddons.length > 0 ? `&addons=${selectedAddons.join(',')}` : '';
      window.location.href = `/login?mode=register&plan=${activePlan.id}${addonsQuery}`;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner de Challenges */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0C101A] via-[#111728] to-[#0A0D15] border border-amber-400/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEn ? 'OFFICIAL PROP CHALLENGES' : 'RETOS INSTITUCIONALES OFICIALES'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              {isEn ? 'Choose Your Evaluation Challenge' : 'Selecciona tu Reto de Evaluación'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl font-mono leading-relaxed">
              {isEn 
                ? 'Prove your consistency on real exchange order books with institutional capital up to $200,000. Up to 90% profit split and zero minimum trading days.' 
                : 'Demuestra tu disciplina operando libros reales de exchanges con capital garantizado hasta $200,000 USD. Hasta 90% de reparto y sin días mínimos forzosos.'}
            </p>
          </div>

          {/* Selector de Modo Solar / Lunar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#07090E]/80 p-1.5 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => handleCategoryChange('solar')}
              className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl font-mono font-bold text-xs transition-all cursor-pointer ${
                category === 'solar'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>{isEn ? 'Solar (1-Phase DMA)' : 'Solar (1 Fase DMA)'}</span>
            </button>
            <button
              onClick={() => handleCategoryChange('lunar')}
              className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl font-mono font-bold text-xs transition-all cursor-pointer ${
                category === 'lunar'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>{isEn ? 'Lunar (2-Phase Titans)' : 'Lunar (2 Fases)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Selector de Capital (Horizontal Scroll / Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>{isEn ? 'Select Account Size' : 'Selecciona el Tamaño de Cuenta'}</span>
          </label>
          <div className="text-xs font-mono text-slate-400">
            {isEn ? 'Instant Deployment' : 'Despliegue Inmediato'}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {plans.map((p) => {
            const isSelected = p.id === activePlan.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`p-3.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? category === 'solar'
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                    : 'bg-[#0A0D15] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {p.popular && (
                  <span className="absolute top-1 right-1.5 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
                    POPULAR
                  </span>
                )}
                <span className="text-sm sm:text-base font-black font-mono tracking-tight text-white">
                  {p.capitalFormatted}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {p.oneTimePriceUSDT} USDT
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Panel Comparativo de Reglas de Evaluación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Izquierdo: Resumen del Reto Activo */}
        <div className="lg:col-span-2 rounded-3xl p-6 sm:p-8 bg-[#0A0D15] border border-white/5 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                {category === 'solar' ? 'SOLAR 1-PHASE EVALUATION' : 'LUNAR 2-PHASE EVALUATION'}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                {activePlan?.astronomicalName 
                  ? (activePlan.astronomicalName[isEn ? 'en' : 'es'] || activePlan.name) 
                  : (activePlan?.name || `$${(activePlan?.capital || 50000).toLocaleString()}`)}
              </h3>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                ${pricing.totalPrice} <span className="text-xs text-slate-400 font-normal">USDT</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {isEn ? 'One-time evaluation fee' : 'Tarifa única de evaluación'}
              </div>
            </div>
          </div>

          {/* Matriz de Parámetros de Riesgo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono block">🎯 {isEn ? 'Profit Target' : 'Objetivo Ganancia'}</span>
              <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                {category === 'solar' ? '10%' : 'F1: 8% | F2: 5%'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono block">📉 {isEn ? 'Max Daily Loss' : 'Pérdida Máx. Diaria'}</span>
              <span className="text-base sm:text-lg font-black text-rose-400 font-mono">
                {category === 'solar' ? '4% (EOD)' : '5% (EOD)'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono block">🛑 {isEn ? 'Max Overall Loss' : 'Pérdida Máx. Total'}</span>
              <span className="text-base sm:text-lg font-black text-rose-400 font-mono">
                {selectedAddons.includes('extra_drawdown') 
                  ? (category === 'solar' ? '8% (+2% Escudo)' : '12% (+2% Escudo)')
                  : (category === 'solar' ? '6% Trailing' : '10% Estático')}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono block">⚡ {isEn ? 'Leverage' : 'Apalancamiento'}</span>
              <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
                {selectedAddons.includes('boost_leverage') ? activePlan.boostedLeverage : activePlan.baseLeverage}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono block">💰 {isEn ? 'Profit Split' : 'Reparto Ganancias'}</span>
              <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                {selectedAddons.includes('profit_split_90') ? '90% Trader' : `${activePlan.baseProfitSplit}% Trader`}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono block">⏱️ {isEn ? 'Min. Trading Days' : 'Días Mínimos'}</span>
              <span className="text-base sm:text-lg font-black text-white font-mono">
                0 {isEn ? 'Days' : 'Días'}
              </span>
            </div>
          </div>

          {/* Características Clave del Reto */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
              {isEn ? 'Included Infrastructure Benefits' : 'Beneficios de Infraestructura Incluidos'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activePlan.features[isEn ? 'en' : 'es'].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 font-mono">
                  <div className="w-4 h-4 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lado Derecho: Tienda de Add-ons y Botón de Checkout */}
        <div className="rounded-3xl p-6 sm:p-8 bg-[#0A0D15] border border-white/5 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
                {isEn ? 'CUSTOMIZE YOUR EDGE' : 'PERSONALIZA TU VENTAJA'}
              </div>
              <h4 className="text-lg font-bold text-white mt-1">
                {isEn ? 'Challenge Add-ons' : 'Add-ons del Reto'}
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {isEn ? 'Upgrade rules before dispatching' : 'Optimiza tus reglas institucionales'}
              </p>
            </div>

            {/* Lista de Add-ons */}
            <div className="space-y-2.5">
              {AVAILABLE_ADDONS.map((addon) => {
                const isChecked = selectedAddons.includes(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => handleToggleAddon(addon.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'bg-amber-400/10 border-amber-400/40 text-white'
                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                      isChecked 
                        ? 'bg-amber-400 border-amber-400 text-slate-950 font-bold' 
                        : 'border-white/20 bg-black/40'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span className="truncate">{addon[isEn ? 'nameEn' : 'nameEs']}</span>
                        <span className="text-[11px] font-mono text-amber-400 shrink-0 ml-2">
                          +{Math.round(addon.priceDeltaPct * 100)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-snug line-clamp-2">
                        {addon[isEn ? 'descriptionEn' : 'descriptionEs']}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen Final de Precio y Botón CTA */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">{isEn ? 'Base Evaluation:' : 'Evaluación Base:'}</span>
              <span className="text-white font-bold">${pricing.basePrice} USDT</span>
            </div>
            {pricing.addonsCost > 0 && (
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400">{isEn ? 'Add-ons Selected:' : 'Add-ons Elegidos:'}</span>
                <span className="text-amber-400 font-bold">+${pricing.addonsCost} USDT</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-mono pt-2 border-t border-white/5">
              <span className="font-bold text-white">{isEn ? 'Total Checkout:' : 'Total a Pagar:'}</span>
              <span className="text-xl font-black text-amber-400 font-mono">${pricing.totalPrice} USDT</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-mono font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-400/25 transition-all cursor-pointer"
            >
              <span>{isEn ? 'START THIS CHALLENGE' : 'COMENZAR ESTE RETO'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
