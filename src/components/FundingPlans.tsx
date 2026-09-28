import React, { useState } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Gift, 
  Award, 
  Percent, 
  Clock, 
  TrendingUp, 
  Terminal, 
  Coins, 
  Globe2, 
  CalendarCheck2, 
  Sliders, 
  HelpCircle,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';

interface FundingPlansProps {
  onSelectPlan?: (planId: string) => void;
}

export const FundingPlans: React.FC<FundingPlansProps> = ({ onSelectPlan }) => {
  const { navigate } = useAppRouter();
  const [activeTab, setActiveTab] = useState<'funding' | 'loyalty' | 'tools'>('funding');
  const [fundingMarket, setFundingMarket] = useState<'crypto' | 'forex'>('crypto');
  const [selectedTier, setSelectedTier] = useState<number>(10000);
  
  // Add-on State: 40% Consistency Add-on (+15% of plan price or $15 USD min)
  const [hasConsistencyAddon, setHasConsistencyAddon] = useState<boolean>(false);

  // Loyalty Points Simulator (100 pts = $10 USD discount)
  const [appliedPoints, setAppliedPoints] = useState<number>(0);

  // Exact 7 Account Sizes requested: 1k, 2.5k, 5k, 10k, 25k, 50k, 100k
  const fundingTiers = [
    { size: 1000, label: '$1,000', price: 29, dailyLoss: '$20 (2%)', maxLoss: '$80 (8%)', popular: false },
    { size: 2500, label: '$2,500', price: 49, dailyLoss: '$50 (2%)', maxLoss: '$200 (8%)', popular: false },
    { size: 5000, label: '$5,000', price: 89, dailyLoss: '$100 (2%)', maxLoss: '$400 (8%)', popular: false },
    { size: 10000, label: '$10,000', price: 149, dailyLoss: '$200 (2%)', maxLoss: '$800 (8%)', popular: true },
    { size: 25000, label: '$25,000', price: 249, dailyLoss: '$500 (2%)', maxLoss: '$2,000 (8%)', popular: false },
    { size: 50000, label: '$50,000', price: 399, dailyLoss: '$1,000 (2%)', maxLoss: '$4,000 (8%)', popular: false },
    { size: 100000, label: '$100,000', price: 699, dailyLoss: '$2,000 (2%)', maxLoss: '$8,000 (8%)', popular: false },
  ];

  const currentTier = fundingTiers.find(t => t.size === selectedTier) || fundingTiers[3];
  
  // Calculate price with add-on and loyalty discount
  const addonCost = hasConsistencyAddon ? Math.max(15, Math.round(currentTier.price * 0.15)) : 0;
  const pointsDiscount = Math.round((appliedPoints / 100) * 10);
  const finalPrice = Math.max(9, currentTier.price + addonCost - pointsDiscount);

  const handleCheckout = (planKey: string) => {
    if (onSelectPlan) {
      onSelectPlan(`${planKey}-tier-${selectedTier}-${fundingMarket}-addon-${hasConsistencyAddon ? '40' : '20'}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <section id="planes" className="w-full py-20 sm:py-28 relative select-none overflow-hidden bg-transparent">
      {/* Soft atmospheric gradient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#7C3AED]/15 via-[#9333EA]/10 to-transparent blur-[140px] pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 max-w-[1360px] mx-auto relative z-10">
        
        {/* Section Header: Minimalist & Direct */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Fondeo Institucional{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300">
              Cripto y Forex
            </span>
          </h2>
          <p className="mt-3.5 text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed">
            Planes desde <strong>$1,000 hasta $100,000 USD</strong> con reglas claras y justas.
            <span className="text-purple-300 font-semibold block sm:inline sm:ml-1.5">
              Suite de herramientas 100% incluida y programa de puntos Loyalty para descuentos directos.
            </span>
          </p>

          {/* Master Tabs: Fondeo | Loyalty Points | Suscripción Herramientas */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center p-1.5 rounded-2xl bg-slate-900/80 border border-white/20 backdrop-blur-xl shadow-[4px_4px_0px_#000] gap-1">
            <button
              onClick={() => setActiveTab('funding')}
              className={`px-5 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'funding'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Planes de Fondeo</span>
            </button>

            <button
              onClick={() => setActiveTab('loyalty')}
              className={`px-5 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'loyalty'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Programa Loyalty (Puntos Eklipse)</span>
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`px-5 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Suscripción Herramientas</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PLANES DE FONDEO CON TODAS LAS REGLAS */}
        {activeTab === 'funding' && (
          <div className="space-y-8 sm:space-y-10">
            
            {/* Market Switcher: Cripto vs Forex */}
            <div className="flex justify-center items-center gap-3">
              <button
                onClick={() => setFundingMarket('crypto')}
                className={`px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border ${
                  fundingMarket === 'crypto'
                    ? 'bg-purple-600/30 border-purple-400/60 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                    : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Mercado Cripto</span>
              </button>
              <button
                onClick={() => setFundingMarket('forex')}
                className={`px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border ${
                  fundingMarket === 'forex'
                    ? 'bg-purple-600/30 border-purple-400/60 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                    : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mercado Forex</span>
              </button>
            </div>

            {/* 7 Account Sizes: 1k, 2.5k, 5k, 10k, 25k, 50k, 100k */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3 max-w-5xl mx-auto">
              {fundingTiers.map((tier) => {
                const isSelected = tier.size === selectedTier;
                return (
                  <button
                    key={tier.size}
                    onClick={() => setSelectedTier(tier.size)}
                    className={`relative p-3 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-purple-950/80 border-purple-400 text-white shadow-[3px_3px_0px_#7C3AED,0_0_20px_rgba(124,58,237,0.4)] scale-105 z-10'
                        : 'bg-slate-900/50 border-white/10 text-slate-300 hover:border-white/30 hover:bg-slate-900/70'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-[8px] font-mono font-black text-white uppercase tracking-wider shadow-sm">
                        Popular
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-black tracking-tight">{tier.label}</span>
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5">${tier.price} USD</span>
                  </button>
                );
              })}
            </div>

            {/* Core Plan Details Card */}
            <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 backdrop-blur-2xl bg-slate-950/75 border-2 border-white/20 shadow-[8px_8px_0px_rgba(124,58,237,0.35),0_25px_60px_rgba(0,0,0,0.6)] relative z-10 text-white">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-[11px] font-mono text-purple-300 font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                    <span>Fondeo Inmediato • {fundingMarket === 'crypto' ? 'Cripto' : 'Forex'}</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-white">
                    Cuenta {currentTier.label} USD
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Reglas transparentes sin sorpresas: opera con disciplina y retira según tu rendimiento.
                  </p>
                </div>

                <div className="text-left lg:text-right shrink-0">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Tarifa única</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">${finalPrice}</span>
                    <span className="text-sm font-mono text-slate-400">USD</span>
                    {pointsDiscount > 0 && (
                      <span className="ml-2 text-xs font-mono text-amber-400 line-through">${currentTier.price + addonCost}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Tarifa única reembolsable con tu retiro</span>
                </div>
              </div>

              {/* Exact Rules Matrix Requested by the User */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 py-6 border-b border-white/10 text-left">
                {/* 1. Daily 2% */}
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Pérdida Diaria (Daily)</span>
                  <p className="text-base sm:text-lg font-black text-white mt-0.5">{currentTier.dailyLoss}</p>
                  <span className="text-[10px] text-slate-400">2% de balance</span>
                </div>

                {/* 2. DD Max 8% */}
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Drawdown Máximo</span>
                  <p className="text-base sm:text-lg font-black text-white mt-0.5">{currentTier.maxLoss}</p>
                  <span className="text-[10px] text-slate-400">8% Trailing Drawdown</span>
                </div>

                {/* 3. Consistency Rule (20% or 40% with add-on) */}
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Consistencia</span>
                  <p className={`text-base sm:text-lg font-black mt-0.5 ${hasConsistencyAddon ? 'text-amber-400' : 'text-purple-300'}`}>
                    {hasConsistencyAddon ? '40% (Add-on)' : '20% (Base)'}
                  </p>
                  <span className="text-[10px] text-slate-400">Máx ganancia por trade</span>
                </div>

                {/* 4. 5 Rentable Days >= 0.5% */}
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Días Rentables</span>
                  <p className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">5 días ≥ 0.5%</p>
                  <span className="text-[10px] text-slate-400">Mínimo para retiro</span>
                </div>

                {/* 5. Progressive Profit Split (35% -> 50% -> 80%) */}
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Profit Split</span>
                  <div className="mt-0.5 flex items-baseline gap-1 font-mono font-black text-xs sm:text-sm">
                    <span className="text-purple-300">1º: 35%</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-emerald-400">2º: 50%</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Luego escalable al 80%</span>
                </div>
              </div>

              {/* Add-on Selector: Consistency 40% */}
              <div className="mt-6 p-4 rounded-2xl bg-purple-950/40 border border-purple-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="addon-consistency"
                    checked={hasConsistencyAddon}
                    onChange={(e) => setHasConsistencyAddon(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer shrink-0"
                  />
                  <label htmlFor="addon-consistency" className="cursor-pointer text-left">
                    <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>Add-on: Consistencia Expandida al 40%</span>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                        Recomendado
                      </span>
                    </span>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Permite que una sola operación represente hasta el 40% del total de beneficios (en lugar del 20% base).
                    </p>
                  </label>
                </div>

                <div className="shrink-0 font-mono text-xs font-bold text-purple-300">
                  +{addonCost} USD <span className="text-[10px] text-slate-400 font-normal">o 150 Pts GC</span>
                </div>
              </div>

              {/* Loyalty Points Redemption Bar (If user has points or wants to apply) */}
              <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-200">
                  <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>¿Tienes Puntos Eklipse?</strong> Aplica tus puntos loyalty para obtener descuento inmediato en este challenge.
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setAppliedPoints(appliedPoints === 0 ? 200 : 0)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold uppercase transition-all cursor-pointer ${
                      appliedPoints > 0 
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40'
                    }`}
                  >
                    {appliedPoints > 0 ? '✓ 200 Pts Aplicados (-$20)' : 'Simular 200 Pts (-$20)'}
                  </button>
                </div>
              </div>

              {/* Bonus Included Tools Box */}
              <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 text-purple-300 font-mono text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Acceso 100% Gratuito a la Suite de Herramientas durante tu Fondeo Activo</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Terminal Propia Eklipse institucional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Conexión directa por API a Binance, Bybit, OKX y BingX</span>
                  </div>
                </div>
              </div>

              {/* Checkout Action Button */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400 text-left">
                  <span>Credenciales instantáneas vía email y Telegram. Retiros disponibles en USDT TRC20 o Transferencia.</span>
                </div>

                <button
                  onClick={() => handleCheckout(`funding-${selectedTier}`)}
                  className="w-full sm:w-auto px-10 py-4 rounded-xl text-xs font-mono font-black tracking-widest uppercase text-white bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] hover:brightness-110 shadow-[4px_4px_0px_#000,0_0_25px_rgba(124,58,237,0.4)] transition-all cursor-pointer flex items-center justify-center gap-3 group active:translate-x-0.5 active:translate-y-0.5 shrink-0"
                >
                  <span>Iniciar Fondeo de {currentTier.label} (${finalPrice} USD)</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: PROGRAMA LOYALTY & PUNTOS GC */}
        {activeTab === 'loyalty' && (
          <div className="max-w-4xl mx-auto space-y-8 relative z-10 text-white">
            <div className="rounded-3xl p-6 sm:p-10 backdrop-blur-2xl bg-slate-950/75 border-2 border-amber-400/30 shadow-[8px_8px_0px_#F59E0B,0_25px_60px_rgba(0,0,0,0.6)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[11px] font-mono text-amber-300 font-bold mb-2">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Eklipse Loyalty Club</span>
                  </div>
                  <h3 className="text-3xl font-black text-white">
                    Puntos Eklipse: Gana Mientras Operas
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Cada trade rentable, cada día de disciplina y cada retiro completado te otorga Puntos Eklipse canjeables por descuentos directos en tus siguientes challenges.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-center shrink-0">
                  <span className="text-[10px] font-mono text-amber-300 uppercase">Equivalencia</span>
                  <p className="text-xl font-black text-white">100 Pts = $10 USD</p>
                  <span className="text-[10px] text-slate-400">Descuento directo en caja</span>
                </div>
              </div>

              {/* How to Earn Points Grid */}
              <div className="py-6 border-b border-white/10">
                <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-purple-300 mb-4">
                  ¿Cómo se acumulan los Puntos Eklipse?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-base font-black text-amber-400 font-mono">+25 Pts</span>
                    <h5 className="text-xs font-bold text-white mt-1">Día Rentable (≥ 0.5%)</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5">Premio diario por mantener consistencia y disciplina.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-base font-black text-amber-400 font-mono">+150 Pts</span>
                    <h5 className="text-xs font-bold text-white mt-1">Retiro Exitoso</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5">Otorgado automáticamente con cada retiro aprobado.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-base font-black text-amber-400 font-mono">+100 Pts</span>
                    <h5 className="text-xs font-bold text-white mt-1">Conexión de API</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5">Por vincular tu primer exchange CEX a la Terminal.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-base font-black text-amber-400 font-mono">+250 Pts</span>
                    <h5 className="text-xs font-bold text-white mt-1">Trader Referido</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5">Por cada colega que inicie un Challenge con tu enlace.</p>
                  </div>
                </div>
              </div>

              {/* What Can You Redeem Points For */}
              <div className="py-6 border-b border-white/10">
                <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-purple-300 mb-4">
                  Beneficios y Canjes Disponibles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-mono text-purple-300 font-bold uppercase">Hasta 50% OFF</span>
                      <h5 className="text-sm font-bold text-white mt-1">Descuentos en Challenges</h5>
                      <p className="text-xs text-slate-300 mt-1">Canjea 100, 200 o hasta 500 puntos para reducir el costo de tu próxima cuenta de 1K a 100K.</p>
                    </div>
                    <span className="text-[11px] font-mono text-amber-400 mt-3 font-semibold">100 Pts = -$10 USD</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-mono text-purple-300 font-bold uppercase">Add-on Gratuito</span>
                      <h5 className="text-sm font-bold text-white mt-1">Consistencia al 40%</h5>
                      <p className="text-xs text-slate-300 mt-1">Usa 150 puntos para activar sin coste adicional el margen de consistencia expandido.</p>
                    </div>
                    <span className="text-[11px] font-mono text-amber-400 mt-3 font-semibold">Canje: 150 Pts</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-mono text-purple-300 font-bold uppercase">Reset Bonificado</span>
                      <h5 className="text-sm font-bold text-white mt-1">Reinicio con 50% OFF</h5>
                      <p className="text-xs text-slate-300 mt-1">Si tuviste un mal día, canjea 250 puntos para reiniciar tu challenge a mitad de precio.</p>
                    </div>
                    <span className="text-[11px] font-mono text-amber-400 mt-3 font-semibold">Canje: 250 Pts</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-400">
                  Tus puntos se sincronizan de forma transparente con tu cuenta de usuario al conectar tu wallet o email.
                </span>
                <button
                  onClick={() => {
                    setActiveTab('funding');
                    setAppliedPoints(200);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:brightness-110 shadow-[3px_3px_0px_#000] cursor-pointer transition-all shrink-0"
                >
                  Probar Descuento en Challenge (-$20)
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: SUSCRIPCIÓN A HERRAMIENTAS (Para traders sin fondeo activo) */}
        {activeTab === 'tools' && (
          <div id="herramientas" className="space-y-8 max-w-4xl mx-auto relative z-10 text-white">
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs sm:text-sm flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Nota:</strong> Si tienes una cuenta de fondeo activa, tienes acceso <strong>totalmente gratuito</strong> a estas herramientas. Esta sección es exclusiva para traders que operan su propio capital en exchanges.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Plan Starter Tools */}
              <div className="p-6 sm:p-8 rounded-2xl backdrop-blur-2xl bg-slate-950/75 border border-white/15 flex flex-col justify-between shadow-[4px_4px_0px_#000]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold">Herramientas Pro</span>
                  <h3 className="text-2xl font-black text-white mt-1">Terminal + Conectores API</h3>
                  <p className="text-xs text-slate-300 mt-2">
                    Ideal para operar tu propio capital en Binance y Bybit utilizando nuestra interfaz institucional.
                  </p>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$29</span>
                    <span className="text-xs font-mono text-slate-400">USD / mes</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-slate-200">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Terminal propia Eklipse (KLineChart v10 a 60 FPS)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Conexión API encriptada a 2 CEXs (Binance + Bybit)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Ejecución táctica One-Click sin pasar por web del exchange</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Alertas de mercado por Telegram</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleCheckout('tools-starter')}
                  className="mt-8 w-full py-3.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-white bg-slate-900 hover:bg-slate-800 border border-white/20 shadow-[3px_3px_0px_#000] transition-all cursor-pointer text-center"
                >
                  Suscribirse a Starter Tools
                </button>
              </div>

              {/* Plan Institutional Suite */}
              <div className="p-6 sm:p-8 rounded-2xl backdrop-blur-2xl bg-slate-950/80 border-2 border-purple-400/40 flex flex-col justify-between shadow-[6px_6px_0px_#7C3AED,0_15px_40px_rgba(0,0,0,0.5)] relative">
                <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-[10px] font-mono font-black text-white uppercase tracking-wider shadow-sm">
                  Suite Completa
                </span>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold">Suite Institucional</span>
                  <h3 className="text-2xl font-black text-white mt-1">Full Trading Ecosystem</h3>
                  <p className="text-xs text-slate-300 mt-2">
                    Acceso total a todos los exchanges, copy trading cruzado y calculadora de arbitraje.
                  </p>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$59</span>
                    <span className="text-xs font-mono text-slate-400">USD / mes</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-slate-200">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Todo lo del plan Starter sin limitaciones</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Conexión a TODOS los exchanges vía API (Binance, Bybit, OKX, BingX)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Motor de Cross-Venue Copy Trading en tiempo real</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Scanner y Calculadora de Arbitraje automatizada</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Bot de Telegram con ejecución DMA directa por webhook</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleCheckout('tools-suite')}
                  className="mt-8 w-full py-3.5 rounded-xl text-xs font-mono font-black tracking-widest uppercase text-white bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] hover:brightness-110 shadow-[3px_3px_0px_#000,0_0_20px_rgba(124,58,237,0.4)] transition-all cursor-pointer text-center"
                >
                  Suscribirse a Full Suite
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
