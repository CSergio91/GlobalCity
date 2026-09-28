import React from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  Coins, 
  Award, 
  TrendingUp, 
  Scale, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ScrollReveal } from './common/ScrollReveal';

export const PayoutRoadmapSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const steps = [
    { label: isEn ? 'Select Capital' : 'Elige Capital', sub: isEn ? '$1K - $100K' : '$1K - $100K', color: 'border-white/20 text-white' },
    { label: isEn ? 'Instant Fund' : 'Fondeo Inmediato', sub: isEn ? 'Zero Waiting' : 'Sin Esperas', color: 'border-cyan-400 text-cyan-300' },
    { label: isEn ? 'Trade Rules' : 'Opera con Reglas', sub: isEn ? '2% Day / 8% Max' : '2% Día / 8% Max', color: 'border-amber-400 text-amber-300' },
    { label: isEn ? '1st Payout' : '1er Retiro', sub: isEn ? '35% Split' : '35% Reparto', color: 'border-amber-400 text-amber-300' },
    { label: isEn ? '2nd Payout' : '2do Retiro', sub: isEn ? '50% Split' : '50% Reparto', color: 'border-yellow-400 text-yellow-300' },
    { label: isEn ? '3rd+ Payout' : '3er+ Retiro', sub: isEn ? '80% Split & Scale' : '80% Reparto & Escala', color: 'border-emerald-400 text-emerald-300' },
  ];

  const highlights = [
    {
      title: isEn ? 'Progression: 35% → 50% → 80% Split' : 'Progresión: 35% → 50% → 80% Reparto',
      desc: isEn 
        ? 'Begin your funded journey with 35% on your 1st payout, advance to 50% on your 2nd, and unlock a permanent 80% split on subsequent cycles.' 
        : 'Inicia con un 35% en tu primer retiro, asciende al 50% en el segundo y asegura un 80% de reparto permanente en los siguientes ciclos.',
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

  return (
    <section 
      id="payout"
      className="w-full py-20 sm:py-28 relative select-none bg-slate-950/70 border-t border-b border-white/10"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        
        {/* Section Header without top tag */}
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
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
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-white/15 backdrop-blur-xl shadow-2xl mb-14">
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
