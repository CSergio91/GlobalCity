import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Flame,
  Award,
  Sun,
  Moon,
  Coins,
  ChevronRight,
  TrendingUp,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';
import { 
  PlanCategory, 
  PaymentMode, 
  ChallengePlan, 
  SOLAR_CHALLENGE_PLANS, 
  LUNAR_CHALLENGE_PLANS,
  AVAILABLE_ADDONS,
  calculateDynamicPlanPricing,
  getLiveChallengePlans 
} from '../data/challengePlans';

export const ProgramsSection: React.FC = () => {
  const { language } = useLanguage();
  const { navigate } = useAppRouter();
  const isEn = language === 'en';

  // 1. Category Switch: Solar (Crypto DMA) vs Lunar (Meme Titans)
  const [category, setCategory] = useState<PlanCategory>('solar');

  // 2. Payment Mode: One-time fee vs Monthly subscription
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('one-time');

  // 3. Plans State for current category
  const [plans, setPlans] = useState<ChallengePlan[]>(SOLAR_CHALLENGE_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('solar-50k');

  // 4. Directional animation tracking (Enter from right if capital increases, enter from left if it decreases)
  const [direction, setDirection] = useState<number>(1);
  const prevIndexRef = useRef<number>(5);

  // 5. Selected Add-ons
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Update plans on category switch
  useEffect(() => {
    const defaultList = category === 'solar' ? SOLAR_CHALLENGE_PLANS : LUNAR_CHALLENGE_PLANS;
    getLiveChallengePlans(category).then((live) => {
      setPlans(live || defaultList);
    });

    // Default to 50k in the new category
    const defaultId = category === 'solar' ? 'solar-50k' : 'lunar-50k';
    setSelectedPlanId(defaultId);
    prevIndexRef.current = 5;
  }, [category]);

  // Current active plan
  const currentIndex = plans.findIndex(p => p.id === selectedPlanId);
  const currentPlan = plans[currentIndex >= 0 ? currentIndex : 0] || plans[0];

  // Handle plan selection with directional tracking
  const handleSelectPlan = (planId: string) => {
    const newIdx = plans.findIndex(p => p.id === planId);
    if (newIdx === -1) return;

    if (newIdx > prevIndexRef.current) {
      setDirection(1); // Increasing capital -> Enters from right
    } else if (newIdx < prevIndexRef.current) {
      setDirection(-1); // Decreasing capital -> Enters from left
    }
    prevIndexRef.current = newIdx;
    setSelectedPlanId(planId);
  };

  // Toggle Add-on
  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId) 
        : [...prev, addonId]
    );
  };

  // Dynamic pricing & rules calculation
  const dynamicPricing = calculateDynamicPlanPricing(currentPlan, paymentMode, selectedAddons);

  const handleCheckout = () => {
    navigate('/login');
  };

  // Directional slide animation variants (GPU-accelerated, zero lag)
  const cardSlideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 70 : -70,
      opacity: 0,
      scale: 0.985,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 380, damping: 32, mass: 0.8 },
        opacity: { duration: 0.22 },
        scale: { duration: 0.22 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -70 : 70,
      opacity: 0,
      scale: 0.985,
      transition: {
        x: { type: 'spring' as const, stiffness: 380, damping: 32, mass: 0.8 },
        opacity: { duration: 0.18 },
        scale: { duration: 0.18 }
      }
    })
  };

  const isSolar = category === 'solar';

  return (
    <section 
      id="programs"
      className="relative w-full h-full max-h-screen text-white select-none flex flex-col justify-center items-center px-3 sm:px-6 lg:px-10 py-2 sm:py-4 overflow-y-auto no-scrollbar bg-transparent pointer-events-auto"
    >
      <div className="w-full max-w-6xl mx-auto relative z-10 flex flex-col items-center space-y-4 sm:space-y-6 my-auto">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER: Dual Orbit Categories (Solar vs Lunar)                     */}
        {/* ========================================================================= */}
        <div className="w-full flex flex-col items-center text-center space-y-3">
          
          {/* Cosmic Orbit Switcher: Cuentas Solares vs Cuentas Lunares */}
          <div className="flex items-center p-1 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl">
            
            {/* Solar (Crypto DMA) Button */}
            <button
              onClick={() => setCategory('solar')}
              className={`relative px-4 sm:px-6 py-2 rounded-xl font-mono text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                isSolar 
                  ? 'bg-gradient-to-r from-amber-500/90 to-yellow-500/90 text-black shadow-[0_0_25px_rgba(245,158,11,0.5)] font-black' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Sun className={`w-4 h-4 ${isSolar ? 'text-black' : 'text-amber-400'}`} />
              <span>{isEn ? 'Solar Orbit (Crypto DMA)' : 'Cuentas Solares (Cripto DMA)'}</span>
            </button>

            {/* Lunar (Meme Titans) Button */}
            <button
              onClick={() => setCategory('lunar')}
              className={`relative px-4 sm:px-6 py-2 rounded-xl font-mono text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                !isSolar 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_25px_rgba(147,51,234,0.55)] font-black' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Moon className={`w-4 h-4 ${!isSolar ? 'text-purple-200' : 'text-purple-400'}`} />
              <span>{isEn ? 'Lunar Orbit (Meme Titans)' : 'Cuentas Lunares (Memecoins)'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans uppercase font-bold tracking-wider ${
                !isSolar ? 'bg-purple-900/80 text-purple-200 border border-purple-400/40' : 'bg-white/10 text-slate-300'
              }`}>
                PEPE
              </span>
            </button>

          </div>

          {/* Subtitle with category context */}
          <p className="text-xs sm:text-sm text-slate-300/85 font-normal max-w-xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            {isSolar 
              ? (isEn 
                  ? 'Institutional crypto futures liquidity with direct DMA book execution.' 
                  : 'Liquidez institucional de futuros de criptomonedas con ejecución directa en libros DMA.')
              : (isEn 
                  ? 'High-leverage memecoin accounts (PEPE, DOGE, BONK) without microscalping traps.' 
                  : 'Cuentas especiales para memecoins de alta volatilidad sin trampas por microscalping en pumps.')}
          </p>

        </div>


        {/* ========================================================================= */}
        {/* 2. CAPITAL TIER SELECTOR: 7 Sizes with Directional Motion Activation      */}
        {/* ========================================================================= */}
        <div className="w-full flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 p-1 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md shadow-2xl">
            {plans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              return (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`relative px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? isSolar 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105 font-black' 
                        : 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105 font-black'
                      : 'bg-transparent text-slate-300/80 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{plan.sizeLabel}</span>
                  {plan.popular && (
                    <span className={`text-[9px] font-black uppercase ml-0.5 ${isSelected && isSolar ? 'text-black' : 'text-amber-300'}`}>
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>


        {/* ========================================================================= */}
        {/* 3. TWO-COLUMN SPLIT SHOWCASE: (Left: Pricing + Addons | Right: Rules)     */}
        {/* GPU-Accelerated Directional Slide: Left on Decrease, Right on Increase    */}
        {/* ========================================================================= */}
        <div className="w-full max-w-5xl relative min-h-[440px] sm:min-h-[480px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${category}-${selectedPlanId}-${paymentMode}`}
              custom={direction}
              variants={cardSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className={`w-full rounded-3xl bg-white/[0.03] border ${
                isSolar ? 'border-amber-500/20 shadow-[0_15px_50px_rgba(245,158,11,0.08)]' : 'border-purple-500/25 shadow-[0_15px_50px_rgba(147,51,234,0.12)]'
              } backdrop-blur-xl p-5 sm:p-8 relative overflow-hidden transform-gpu`}
            >
              
              {/* Subtle Refraction Glow */}
              <div className={`absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent ${
                isSolar ? 'via-amber-400/50' : 'via-purple-400/50'
              } to-transparent`} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* ------------------------------------------------------------------- */}
                {/* LADO IZQUIERDO: Monto + Selector Pago + Precio + Addons + Checkout */}
                {/* ------------------------------------------------------------------- */}
                <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-6">
                  
                  {/* Top Bar: Astronomical Tier Name & Mode Switch */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    
                    {/* Astronomical Name (e.g. SOLAR ECLIPSE $50K or LUNA DE SANGRE $50K) */}
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isSolar ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-purple-400 shadow-[0_0_8px_#c084fc]'}`} />
                      <span className="font-mono text-xs sm:text-sm font-black tracking-wider uppercase text-slate-200">
                        {isEn ? currentPlan.astronomicalName.en : currentPlan.astronomicalName.es}
                      </span>
                    </div>

                    {/* Payment Mode Switch: Pago Único vs Mensualidad */}
                    <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono">
                      <button
                        onClick={() => setPaymentMode('one-time')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          paymentMode === 'one-time' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {isEn ? 'One-time' : 'Pago Único'}
                      </button>
                      <button
                        onClick={() => setPaymentMode('monthly')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          paymentMode === 'monthly' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {isEn ? 'Monthly' : 'Mensual'}
                      </button>
                    </div>

                  </div>

                  {/* Monumental Capital Display */}
                  <div className="space-y-1">
                    <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono text-white tracking-tight drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
                      {currentPlan.capitalFormatted} <span className={`text-lg sm:text-xl font-bold ${isSolar ? 'text-amber-400' : 'text-purple-300'}`}>USDT</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {isEn ? currentPlan.marketSpecialty.en : currentPlan.marketSpecialty.es}
                    </div>
                  </div>

                  {/* Dynamic Price Display */}
                  <div className="p-3 rounded-2xl bg-black/30 border border-white/10 flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase">
                        {paymentMode === 'one-time' 
                          ? (isEn ? 'Total Activation Fee' : 'Precio de Activación') 
                          : (isEn ? 'Monthly Subscription Fee' : 'Cuota Mensual')}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl sm:text-3xl font-mono font-black ${isSolar ? 'text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-purple-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]'}`}>
                          {dynamicPricing.totalPrice} USDT
                        </span>
                        {dynamicPricing.addonsCost > 0 && (
                          <span className="text-[11px] font-mono text-emerald-400">
                            (+{dynamicPricing.addonsCost} USDT addons)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-[10px] font-mono text-slate-400">
                      {paymentMode === 'one-time' ? (isEn ? 'Zero subscriptions' : 'Sin suscripción') : (isEn ? 'Cancel anytime' : 'Cancela cuando quieras')}
                    </div>
                  </div>

                  {/* Nexus Add-ons Selector (4 Upgrades) */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-mono uppercase text-slate-300 font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isEn ? 'Custom Add-Ons (Nexus Modifiers)' : 'Add-Ons Personalizables'}</span>
                      </span>
                      <span className="text-[9.5px] font-normal text-slate-400">
                        {isEn ? 'Configurable in Nexus' : 'Sincronizado vía Nexus'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_ADDONS.map((addon) => {
                        const isChecked = selectedAddons.includes(addon.id);
                        const cost = Math.max(addon.minPriceUSDT, Math.round(dynamicPricing.basePrice * addon.priceDeltaPct));

                        return (
                          <button
                            key={addon.id}
                            type="button"
                            onClick={() => handleToggleAddon(addon.id)}
                            className={`p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                              isChecked 
                                ? isSolar
                                  ? 'bg-amber-500/15 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                  : 'bg-purple-600/20 border-purple-400/50 shadow-[0_0_10px_rgba(147,51,234,0.2)]'
                                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10px] font-mono font-bold text-slate-200 truncate">
                                {isEn ? addon.nameEn : addon.nameEs}
                              </span>
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                isChecked 
                                  ? isSolar ? 'bg-amber-400 border-amber-400 text-black' : 'bg-purple-500 border-purple-400 text-white' 
                                  : 'border-white/20'
                              }`}>
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                            </div>
                            <div className="text-[9px] font-mono text-slate-400 mt-1">
                              +{cost} USDT
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary Checkout Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleCheckout}
                      className={`w-full py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-white transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.01] active:scale-95 shadow-xl ${
                        isSolar
                          ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                          : 'bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#9333EA] hover:brightness-110 shadow-[0_0_30px_rgba(124,58,237,0.45)]'
                      }`}
                    >
                      <Flame className={`w-4 h-4 ${isSolar ? 'text-black' : 'text-amber-300'}`} />
                      <span>
                        {isEn 
                          ? `Activate ${currentPlan.sizeLabel} Account` 
                          : `Comprar Cuenta ${currentPlan.sizeLabel}`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>


                {/* ------------------------------------------------------------------- */}
                {/* LADO DERECHO: Reglas Completas y Claras del Plan                    */}
                {/* ------------------------------------------------------------------- */}
                <div className="lg:col-span-6 space-y-4 text-left">
                  
                  {/* Header of the Rules Side */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <ShieldCheck className={`w-4 h-4 ${isSolar ? 'text-amber-400' : 'text-purple-400'}`} />
                      <span>{isEn ? 'Institutional Risk & Rules' : 'Reglas Completas de la Cuenta'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {isEn ? '100% DMA Simulated Books' : 'Libros Reales DMA'}
                    </span>
                  </div>

                  {/* 4 Primary Highlight Rule Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    
                    {/* 1. Daily Loss Limit */}
                    <div className="p-3 rounded-2xl bg-black/25 border border-white/10">
                      <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                        <span>{isEn ? 'Daily Loss' : 'Pérdida Diaria'}</span>
                        <span className="text-rose-400 font-bold">{dynamicPricing.effectiveDailyLossPct}%</span>
                      </div>
                      <div className="text-lg font-mono font-black text-white mt-1">
                        ${(currentPlan.capital * (dynamicPricing.effectiveDailyLossPct / 100)).toLocaleString()} USDT
                      </div>
                      <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                        <div className="bg-rose-500 h-full w-[25%]" />
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 mt-1">
                        {isEn ? 'Reset at 00:00 UTC' : 'Reinicio a las 00:00 UTC'}
                      </div>
                    </div>

                    {/* 2. Max Total Drawdown */}
                    <div className="p-3 rounded-2xl bg-black/25 border border-white/10">
                      <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                        <span>{isEn ? 'Max Drawdown' : 'Drawdown Total'}</span>
                        <span className="text-amber-400 font-bold">{dynamicPricing.effectiveDrawdownPct}%</span>
                      </div>
                      <div className="text-lg font-mono font-black text-white mt-1">
                        ${(currentPlan.capital * (dynamicPricing.effectiveDrawdownPct / 100)).toLocaleString()} USDT
                      </div>
                      <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                        <div className="bg-amber-400 h-full w-[35%]" />
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 mt-1">
                        {selectedAddons.includes('extra_drawdown') 
                          ? (isEn ? '+2% Shield active' : 'Escudo +2% activo') 
                          : (isEn ? 'Trailing EOD equity' : 'Trailing EOD')}
                      </div>
                    </div>

                    {/* 3. Leverage */}
                    <div className="p-3 rounded-2xl bg-black/25 border border-white/10">
                      <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                        <span>{isEn ? 'Leverage' : 'Apalancamiento'}</span>
                        <Zap className="w-3 h-3 text-blue-400" />
                      </div>
                      <div className="text-lg font-mono font-black text-white mt-1">
                        {dynamicPricing.effectiveLeverage}
                      </div>
                      <div className="text-[9px] font-mono text-blue-300 mt-1">
                        {selectedAddons.includes('boost_leverage') 
                          ? (isEn ? 'Boosted tier active' : 'Apalancamiento boost') 
                          : (isEn ? 'Standard crypto leverage' : 'Apalancamiento base')}
                      </div>
                    </div>

                    {/* 4. Profit Split */}
                    <div className="p-3 rounded-2xl bg-black/25 border border-white/10">
                      <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                        <span>{isEn ? 'Profit Split' : 'Reparto Ganancias'}</span>
                        <Award className="w-3 h-3 text-amber-400" />
                      </div>
                      <div className="text-lg font-mono font-black text-white mt-1">
                        {dynamicPricing.effectiveProfitSplit}%
                      </div>
                      <div className="text-[9px] font-mono text-purple-300 mt-1">
                        {isEn ? 'Direct USDT wallet payout' : 'Liquidación directa en USDT'}
                      </div>
                    </div>

                  </div>

                  {/* Secondary Rules List (Airy, institutional, crystal-clear) */}
                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-2 text-xs">
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isEn ? 'Payout Frequency & Speed' : 'Frecuencia de Retiros'}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {dynamicPricing.effectivePayoutSpeed}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isEn ? 'Minimum Trading Days' : 'Días Mínimos de Trading'}</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {isEn ? '0 Days (No restrictions)' : '0 Días (Sin trabas)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isEn ? 'Weekend & Overnight Crypto' : 'Fin de Semana Cripto'}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {isEn ? 'Allowed 24/7' : 'Permitido 24/7'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isEn ? 'Meme Scalping Protection' : 'Operativa en Volatilidad'}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {isSolar 
                          ? (isEn ? 'Crypto Top 100 DMA' : 'Cripto Top 100 DMA') 
                          : (isEn ? 'Unrestricted Meme Trading' : 'Sin filtro en Memecoins')}
                      </span>
                    </div>

                  </div>

                  {/* Bullet features */}
                  <div className="space-y-1.5 pt-1">
                    {(isEn ? currentPlan.features.en : currentPlan.features.es).slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                          isSolar ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
