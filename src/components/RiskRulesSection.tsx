import React from 'react';
import { ShieldCheck, AlertTriangle, Target, Zap, Clock, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ScrollReveal } from './common/ScrollReveal';

export const RiskRulesSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const rules = [
    {
      label: isEn ? 'MAX DAILY LOSS' : 'PÉRDIDA MÁX. DIARIA',
      value: '2%',
      desc: isEn 
        ? 'Calculated based on starting balance of the day (00:00 UTC). Protects your capital against single-session tilt.' 
        : 'Calculado sobre el balance inicial del día (00:00 UTC). Protege tu capital contra pérdidas emocionales en una sola sesión.',
      icon: AlertTriangle,
      border: 'border-rose-500/30',
      badgeColor: 'text-rose-400 bg-rose-500/10'
    },
    {
      label: isEn ? 'MAX DRAWDOWN' : 'DRAWDOWN MÁXIMO',
      value: '8%',
      desc: isEn 
        ? 'Static or trailing relative drawdown safeguard. Account breaches if total equity drops 8% from initial capital.' 
        : 'Límite de seguridad de patrimonio. Se incumple la cuenta si el balance o equity total cae un 8% del capital inicial.',
      icon: ShieldCheck,
      border: 'border-amber-400/30',
      badgeColor: 'text-amber-400 bg-amber-400/10'
    },
    {
      label: isEn ? 'CONSISTENCY RULE' : 'REGLA DE CONSISTENCIA',
      value: '20%',
      subValue: isEn ? 'or 40% with Add-on' : 'o 40% con Add-on',
      desc: isEn 
        ? 'No single trading day can account for more than 20% of your total profits (or 40% when activating the Add-on).' 
        : 'Ningún día individual puede representar más del 20% de tus beneficios totales (o 40% al activar el Add-on).',
      icon: Activity,
      border: 'border-purple-400/30',
      badgeColor: 'text-purple-400 bg-purple-500/10'
    },
    {
      label: isEn ? 'MIN PROFITABLE DAYS' : 'DÍAS MÍN. RENTABLES',
      value: '5 Días',
      subValue: isEn ? 'min +0.5% profit each' : 'mín. +0,5% cada uno',
      desc: isEn 
        ? 'Achieve at least 5 profitable days generating at least +0.5% profit each before requesting a withdrawal.' 
        : 'Alcanza al menos 5 días rentables con un beneficio mínimo de +0,5% en cada sesión antes de solicitar retiro.',
      icon: Clock,
      border: 'border-cyan-500/30',
      badgeColor: 'text-cyan-400 bg-cyan-500/10'
    },
    {
      label: isEn ? 'PROFIT TARGET' : 'PROFIT TARGET',
      value: '8%',
      desc: isEn 
        ? 'Achieve 8% simulated gain with zero time limits. Take as many days as you need to trade disciplined.' 
        : 'Alcanza el 8% de ganancia simulada sin prisas ni límites de tiempo. Tómate los días que necesites.',
      icon: Target,
      border: 'border-emerald-500/30',
      badgeColor: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      label: isEn ? 'LEVERAGE' : 'APALANCAMIENTO',
      value: '10x',
      desc: isEn 
        ? 'Disciplined 10x max leverage on all Crypto Futures contracts, preventing catastrophic liquidation.' 
        : 'Apalancamiento máximo de 10x en todos los contratos de futuros cripto, garantizando disciplina y gestión de margen.',
      icon: Zap,
      border: 'border-amber-500/30',
      badgeColor: 'text-amber-400 bg-amber-500/10'
    }
  ];

  return (
    <section 
      id="rules"
      className="w-full py-20 sm:py-28 relative select-none bg-slate-950/80 border-t border-b border-white/10"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        
        {/* Section Header without top tag */}
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
              {isEn ? 'Clear rules. No surprises.' : 'Reglas claras. Sin sorpresas.'}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal">
              {isEn 
                ? 'Transparent risk parameters built so you know exactly where you stand at every moment.' 
                : 'Parámetros de riesgo transparentes para que conozcas exactamente tu posición en todo momento.'}
            </p>
          </div>
        </ScrollReveal>

        {/* 6 Structured KPI Cards with Staggered 3D Flip ScrollReveal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((r, i) => {
            const Icon = r.icon;
            return (
              <ScrollReveal key={i} animation="flip-up" delay={i * 85} duration={700}>
                <div 
                  className={`p-7 rounded-2xl bg-slate-900/80 border ${r.border} backdrop-blur-xl shadow-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 h-full`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                        {r.label}
                      </span>
                      <div className={`p-2 rounded-lg ${r.badgeColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight my-2">
                        {r.value}
                      </div>
                      {r.subValue && (
                        <span className="text-xs font-mono text-amber-400 font-semibold">
                          ({r.subValue})
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 font-normal leading-relaxed mt-4">
                      {r.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Mandated Lead Subtitle */}
        <ScrollReveal animation="fade-up" delay={300}>
          <div className="mt-14 text-center">
            <p className="text-base sm:text-xl font-mono font-bold text-amber-300 max-w-xl mx-auto drop-shadow-sm">
              {isEn ? 'Know exactly where you stand at every moment.' : 'Conoce exactamente tu posición en todo momento.'}
            </p>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
