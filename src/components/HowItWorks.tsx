import React from 'react';
import { Layers, TrendingUp, Award, ChevronRight, Zap, Coins } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ScrollReveal } from './common/ScrollReveal';

export const HowItWorks: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const steps = [
    {
      num: '01',
      title: isEn ? 'Choose your account' : 'Elige tu cuenta',
      desc: isEn 
        ? 'Select from $1,000 to $100,000 funded capital. One-time activation fee, zero subscriptions, and 100% refundable with your 1st payout.' 
        : 'Selecciona desde $1,000 hasta $100,000 de capital fondeado. Tarifa de activación única, sin suscripciones y 100% reembolsable con tu 1er retiro.',
      icon: Layers,
      color: 'text-amber-400',
      badge: isEn ? 'Step 1' : 'Paso 1'
    },
    {
      num: '02',
      title: isEn ? 'Trade with Instant Funding' : 'Opera con Fondeo Inmediato',
      desc: isEn 
        ? 'No evaluations or waiting. Execute BTC, ETH, and SOL futures on our proprietary terminal under disciplined 2% daily loss and 8% max drawdown.' 
        : 'Sin evaluaciones ni esperas. Opera futuros de BTC, ETH y SOL en nuestra terminal propia bajo 2% de pérdida diaria y 8% de drawdown máximo.',
      icon: Zap,
      color: 'text-cyan-400',
      badge: isEn ? 'Step 2' : 'Paso 2'
    },
    {
      num: '03',
      title: isEn ? 'Get Paid & Scale' : 'Cobra y Escala',
      desc: isEn 
        ? 'Complete 5 profitable days (+0.5% each) and request bi-weekly on-chain crypto payouts. Profit split scales from 35% to 50% up to 80%.' 
        : 'Cumple 5 días rentables (+0,5% c/u) y solicita retiros quincenales en cripto on-chain. El reparto escala de 35% a 50% hasta el 80%.',
      icon: Coins,
      color: 'text-emerald-400',
      badge: isEn ? 'Step 3' : 'Paso 3'
    }
  ];

  return (
    <section 
      id="how-it-works"
      className="w-full py-20 sm:py-28 relative select-none bg-transparent"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto relative z-10 space-y-16">
        
        {/* Section Title without top tag */}
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {isEn ? 'How It Works' : '¿Cómo Funciona?'}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-normal">
              {isEn 
                ? 'Prove your trading performance under clearly defined risk rules — without passing endless test phases.' 
                : 'Demuestra tu rendimiento bajo reglas claras de riesgo — sin pasar interminables fases de examen.'}
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Sequential Cards with Staggered 3D Flip ScrollReveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <ScrollReveal key={s.num} animation="flip-up" delay={idx * 160} duration={700}>
                <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl transition-all duration-300 relative group flex flex-col justify-between h-full">
                  <div>
                    {/* Step Number & Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-4xl sm:text-5xl font-black font-display text-white/20 group-hover:text-amber-400/30 transition-colors">
                        {s.num}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10">
                        {s.badge}
                      </span>
                    </div>

                    {/* Icon & Title */}
                    <div className="space-y-3">
                      <div className={`p-3 rounded-xl bg-white/5 w-fit border border-white/10 ${s.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                        {s.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>

                  {/* Sub-step indicator arrow on desktop */}
                  {idx < 2 && (
                    <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-950 border border-white/20 items-center justify-center text-slate-400">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Lead Quote */}
        <ScrollReveal animation="blur-reveal" delay={450}>
          <div className="text-center">
            <blockquote className="font-mono text-xs sm:text-sm text-slate-400 border-l-2 border-amber-400/60 pl-4 py-1 inline-block text-left max-w-xl">
              "{isEn 
                ? 'Prove your trading performance under clearly defined risk rules.' 
                : 'Demuestra tu rendimiento de trading bajo reglas de riesgo claramente definidas.'}"
            </blockquote>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
