import React from 'react';
import { Terminal, ShieldCheck, Cpu, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ScrollReveal } from './common/ScrollReveal';

export const WhyEklipseSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const pillars = [
    {
      title: isEn ? 'Purpose-built terminal' : 'Terminal diseñada a medida',
      desc: isEn ? 'Crypto Futures focused.' : 'Enfocada en Futuros Cripto.',
      detail: isEn 
        ? 'Not an outdated MetaTrader clone with artificial delays. A native, GPU-accelerated terminal created specifically for liquid crypto derivatives.' 
        : 'Sin clones antiguos de MetaTrader ni demoras artificiales. Una terminal nativa acelerada por GPU creada para derivados cripto líquidos.',
      icon: Terminal,
      color: 'text-amber-400'
    },
    {
      title: isEn ? 'Transparent rules' : 'Reglas transparentes',
      desc: isEn ? 'Know your risk from day one.' : 'Conoce tu riesgo desde el primer día.',
      detail: isEn 
        ? 'Zero hidden clauses or subjective breaches. Your drawdown, targets, and parameters are calculated openly and in real time.' 
        : 'Cero cláusulas ocultas o faltas subjetivas. Tu drawdown, objetivos y parámetros se calculan en abierto y en tiempo real.',
      icon: ShieldCheck,
      color: 'text-cyan-400'
    },
    {
      title: isEn ? 'Advanced risk engine' : 'Motor de riesgo avanzado',
      desc: isEn ? 'Real-time monitoring.' : 'Monitorización en tiempo real.',
      detail: isEn 
        ? 'Continuous tick-by-tick risk auditing that prevents sudden account liquidation and gives you immediate clarity on margin utilization.' 
        : 'Auditoría continua de riesgo tick a tick que previene pérdidas imprevistas y te otorga claridad inmediata sobre tu margen.',
      icon: Cpu,
      color: 'text-emerald-400'
    },
    {
      title: isEn ? 'Built to scale' : 'Construido para escalar',
      desc: isEn ? 'Your account can grow with your performance.' : 'Tu cuenta crece al ritmo de tus resultados.',
      detail: isEn 
        ? 'Consistent traders unlock +25% capital bumps on every 3 profitable payout milestones, scaling up to $2,000,000 in institutional backing.' 
        : 'Los traders consistentes desbloquean aumentos del +25% de capital cada 3 ciclos de retiro rentables, escalando hasta $2,000,000.',
      icon: TrendingUp,
      color: 'text-purple-400'
    }
  ];

  return (
    <section 
      id="why-eklipse"
      className="w-full py-20 sm:py-28 relative select-none bg-transparent"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* Section Header without top tag */}
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
              {isEn ? 'Built for traders, not spreadsheets.' : 'Construido para traders, no para hojas de cálculo.'}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal">
              {isEn 
                ? 'Traditional prop firms rely on legacy forex tech. EKLIPSE is engineered from the ground up for modern crypto traders.' 
                : 'Las empresas de fondeo tradicionales dependen de tecnología anticuada. EKLIPSE ha sido diseñada desde cero para el trading moderno de criptomonedas.'}
            </p>
          </div>
        </ScrollReveal>

        {/* 4 Pillars Grid with Converging Lateral Reveals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            const anim = i % 2 === 0 ? 'slide-left' : 'slide-right';
            const delay = Math.floor(i / 2) * 150 + (i % 2) * 80;
            return (
              <ScrollReveal key={i} animation={anim} delay={delay} duration={700}>
                <div 
                  className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl transition-all duration-300 group flex flex-col justify-between h-full"
                >
                  <div className="space-y-4">
                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 w-fit ${p.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                        {p.title}
                      </h3>
                      <div className="text-sm sm:text-base font-mono font-bold text-amber-300 mt-1">
                        {p.desc}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                      {p.detail}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
};
