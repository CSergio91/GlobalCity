import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  Coins, 
  Award, 
  TrendingUp, 
  Scale, 
  ShieldCheck, 
  CheckCircle2,
  Calculator,
  Zap,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ScrollReveal } from './common/ScrollReveal';

export const PayoutRoadmapSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Calculator State
  const accountTiers = [10000, 25000, 50000, 100000];
  const [selectedCapital, setSelectedCapital] = useState<number>(50000);
  const [profitPercent, setProfitPercent] = useState<number>(8); // 8% profit default
  const [payoutStage, setPayoutStage] = useState<number>(3); // 0: 35%, 1: 50%, 2: 80%, 3: 90%

  const stageSplits = [
    { label: isEn ? '1st Payout (35%)' : '1er Retiro (35%)', split: 0.35, tag: '35%' },
    { label: isEn ? '2nd Payout (50%)' : '2do Retiro (50%)', split: 0.50, tag: '50%' },
    { label: isEn ? '3rd Payout (80%)' : '3er Retiro (80%)', split: 0.80, tag: '80%' },
    { label: isEn ? '4th+ Payout (90%)' : '4to+ Retiro (90%)', split: 0.90, tag: '90%' },
  ];

  const totalProfitUSDT = (selectedCapital * profitPercent) / 100;
  const currentSplitRate = stageSplits[payoutStage].split;
  const traderEarningsUSDT = totalProfitUSDT * currentSplitRate;
  const firmReserveUSDT = totalProfitUSDT * (1 - currentSplitRate);
  const scaledCapital = Math.round(selectedCapital * 1.25);

  const steps = [
    { label: isEn ? 'Select Capital' : 'Elige Capital', sub: isEn ? '$1K - $100K' : '$1K - $100K', color: 'border-white/20 text-white' },
    { label: isEn ? 'Instant Fund' : 'Fondeo Inmediato', sub: isEn ? 'Zero Waiting' : 'Sin Esperas', color: 'border-purple-400 text-purple-300' },
    { label: isEn ? '1st Payout' : '1er Retiro', sub: isEn ? '35% Split' : '35% Reparto', color: 'border-amber-400 text-amber-300' },
    { label: isEn ? '2nd Payout' : '2do Retiro', sub: isEn ? '50% Split' : '50% Reparto', color: 'border-yellow-400 text-yellow-300' },
    { label: isEn ? '3rd Payout' : '3er Retiro', sub: isEn ? '80% Split' : '80% Reparto', color: 'border-emerald-400 text-emerald-300' },
    { label: isEn ? '4th+ Payout' : '4to+ Retiro', sub: isEn ? '90% Max Split' : '90% Reparto Máx', color: 'border-purple-400 text-purple-300' },
  ];

  const highlights = [
    {
      title: isEn ? 'Progression: 35/50/80/90 Split' : 'Progresión: Reparto 35/50/80/90',
      desc: isEn 
        ? 'Begin your funded journey with 35% on your 1st payout, advance to 50% on your 2nd, 80% on your 3rd, and unlock the maximum 90% split on subsequent cycles.' 
        : 'Inicia con un 35% en tu primer retiro, asciende al 50% en el segundo, 80% en el tercero y asegura un 90% de reparto máximo en los siguientes ciclos.',
      icon: Coins
    },
    {
      title: isEn ? 'Bi-Weekly Payouts & 5 Profitable Days' : 'Retiros Quincenales & 5 Días Rentables',
      desc: isEn 
        ? 'Request profit withdrawals every 14 days once you achieve at least 5 profitable days (+0.5% each). Paid on-chain via USDT/USDC.' 
        : 'Solicita retiros de beneficios cada 14 días al cumplir 5 días rentables (+0,5% cada uno). Pagos directos on-chain en USDT/USDC.',
      icon: CheckCircle2
    },
    {
      title: isEn ? 'Institutional Account Scaling' : 'Escalado Institucional de Cuenta',
      desc: isEn 
        ? 'Every 3 consecutive profitable payout cycles, your account balance scales by +25% up to $2,000,000.' 
        : 'Cada 3 ciclos consecutivos de retiro con beneficios, tu cuenta escala un +25% hasta $2,000,000.',
      icon: Scale
    }
  ];

  const handleScrollToPrograms = () => {
    const el = document.getElementById('programs');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="payout"
      className="min-h-screen w-full flex flex-col justify-center items-center py-20 sm:py-28 relative select-none bg-slate-950/70 border-t border-b border-white/10"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* Section Header without top tag */}
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
              {isEn ? 'Trade your funded account. Keep your rewards.' : 'Opera tu cuenta fondeada. Conserva tus ganancias.'}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal">
              {isEn 
                ? 'Our incentives are 100% aligned with your success. You provide the trading discipline, we provide the capital and technology.' 
                : 'Nuestros incentivos están alineados con tu éxito. Tú aportas la disciplina en trading, nosotros el capital y la tecnología.'}
            </p>
          </div>
        </ScrollReveal>

        {/* 6-Step Visual Progression Flow with Staggered Cascading Reveals */}
        <ScrollReveal animation="blur-reveal" delay={100} duration={800}>
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-white/15 backdrop-blur-xl shadow-2xl">
            <div className="text-center font-mono text-xs uppercase tracking-widest text-slate-400 mb-6">
              {isEn ? 'Instant Funding Progression Lifecycle' : 'Ciclo de Crecimiento del Fondeo Inmediato'}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative">
              {steps.map((st, i) => (
                <ScrollReveal key={i} animation="flip-up" delay={150 + i * 75} duration={600}>
                  <div 
                    className={`p-4 rounded-xl bg-slate-950/70 border ${st.color} flex flex-col items-center text-center relative group hover:scale-105 transition-transform h-full`}
                  >
                    <div className="text-xs font-mono text-slate-400 mb-1">0{i + 1}</div>
                    <div className="font-mono font-black text-sm sm:text-base text-white">
                      {st.label}
                    </div>
                    <div className="text-[10px] font-mono mt-1 text-slate-400">
                      {st.sub}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* INTERACTIVE PAYOUT SIMULATOR & CALCULATOR */}
        <ScrollReveal animation="fade-up" delay={150} duration={750}>
          <div className="rounded-3xl bg-slate-950/85 border border-white/15 backdrop-blur-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] relative overflow-hidden">
            {/* Ambient Refraction Glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-[10px] font-black uppercase tracking-widest">
                    <Calculator className="w-3 h-3 text-amber-400" />
                    <span>{isEn ? 'INTERACTIVE REWARD CALCULATOR' : 'SIMULADOR INTERACTIVO DE RETIROS'}</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                    {isEn ? 'Simulate Your Bi-Weekly Payout' : 'Calcula Tu Retiro Quincenal en USDT'}
                  </h3>
                </div>

                <div className="font-mono text-xs text-slate-400 bg-white/5 px-3 py-2 rounded-xl border border-white/10 self-start sm:self-center">
                  <span>{isEn ? 'Settlement:' : 'Liquidación:'} </span>
                  <strong className="text-emerald-400 font-black">USDT On-Chain &lt; 24h</strong>
                </div>
              </div>

              {/* Grid: Inputs (Left 7 cols) & Outputs (Right 5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left: Interactive Controls */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Control 1: Account Capital Tier */}
                  <div className="space-y-2.5">
                    <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                      {isEn ? '1. Account Capital Tier' : '1. Nivel de Capital de la Cuenta'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {accountTiers.map(tier => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setSelectedCapital(tier)}
                          className={`py-2.5 px-3 rounded-xl font-mono text-xs sm:text-sm font-black transition-all cursor-pointer border ${
                            selectedCapital === tier
                              ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.5)] scale-[1.02]'
                              : 'bg-white/5 text-slate-300 border-white/10 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          ${tier.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Control 2: Simulated Profit Target Slider */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold uppercase tracking-wider text-slate-300">
                        {isEn ? '2. Net Profit in 14-Day Cycle' : '2. Beneficio Neto en Ciclo de 14 Días'}
                      </span>
                      <span className="text-amber-300 font-black text-sm">
                        +{profitPercent}% (${totalProfitUSDT.toLocaleString('en-US', { minimumFractionDigits: 0 })} USDT)
                      </span>
                    </div>

                    <input
                      type="range"
                      min="2"
                      max="20"
                      step="1"
                      value={profitPercent}
                      onChange={(e) => setProfitPercent(Number(e.target.value))}
                      className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400 border border-white/10"
                    />

                    <div className="flex justify-between font-mono text-[10px] text-slate-500">
                      <span>+2% ($ {((selectedCapital * 2) / 100).toLocaleString()})</span>
                      <span>+8% ($ {((selectedCapital * 8) / 100).toLocaleString()})</span>
                      <span>+15% ($ {((selectedCapital * 15) / 100).toLocaleString()})</span>
                      <span>+20% ($ {((selectedCapital * 20) / 100).toLocaleString()})</span>
                    </div>
                  </div>

                  {/* Control 3: Payout Progression Stage */}
                  <div className="space-y-2.5">
                    <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                      {isEn ? '3. Payout Cycle Progression' : '3. Ciclo de Retiro de Beneficios'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {stageSplits.map((stage, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPayoutStage(idx)}
                          className={`py-2 px-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border text-center flex flex-col items-center justify-center gap-0.5 ${
                            payoutStage === idx
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 border-amber-300 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[1.02]'
                              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span className="text-sm font-black">{stage.tag}</span>
                          <span className="text-[10px] truncate">{idx === 0 ? '1º' : idx === 1 ? '2º' : idx === 2 ? '3º' : '4º+'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Calculated Payout Results Box */}
                <div className="lg:col-span-5">
                  <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-amber-400/40 shadow-[0_10px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] space-y-5">
                    
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        {isEn ? 'Trader Net Payout' : 'Tu Retiro Neto a Billetera'}
                      </div>
                      <div className="text-3xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-tight mt-1 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                        ${traderEarningsUSDT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-bold text-amber-300">USDT</span>
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400 font-semibold mt-1">
                        ✓ {stageSplits[payoutStage].tag} {isEn ? 'of total profit generated' : 'de beneficios netos generados'}
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/10 font-mono text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>{isEn ? 'Total Gross Profit:' : 'Beneficio Bruto Total:'}</span>
                        <span className="font-bold text-white">${totalProfitUSDT.toLocaleString()} USDT</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>{isEn ? 'Eklipse Treasury Reserve:' : 'Reserva Eklipse:'}</span>
                        <span className="font-semibold text-slate-400">${firmReserveUSDT.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/5">
                        <span>{isEn ? 'Minimum Trading Days:' : 'Días Mínimos Operados:'}</span>
                        <span className="font-bold text-purple-300">5 {isEn ? 'Days' : 'Días'} (+0.5%)</span>
                      </div>
                    </div>

                    {/* Scaling Milestone Telemetry */}
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 font-mono text-[11px] text-purple-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                        <span>{isEn ? 'Next Capital Scale Milestone' : 'Próximo Escalado Institucional'}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[10px]">
                        {isEn 
                          ? `Maintain profits across 3 consecutive payout cycles to scale this account from $${selectedCapital.toLocaleString()} to $${scaledCapital.toLocaleString()} USDT (+25%).`
                          : `Conserva beneficios durante 3 ciclos consecutivos de retiro para escalar esta cuenta de $${selectedCapital.toLocaleString()} a $${scaledCapital.toLocaleString()} USDT (+25%).`}
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={handleScrollToPrograms}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-slate-950 font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <span>{isEn ? `Start with $${selectedCapital.toLocaleString()} Account` : `Empezar con Cuenta de $${selectedCapital.toLocaleString()}`}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 3 Core Payout & Scaling Terms with Staggered ScrollReveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <ScrollReveal key={i} animation="fade-up" delay={200 + i * 110} duration={650}>
                <div className="p-7 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl space-y-3 h-full transition-all">
                  <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-300 w-fit border border-amber-400/30">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {h.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                    {h.desc}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
};
