import React from 'react';
import { Flame, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';
import { ScrollReveal } from './common/ScrollReveal';

export const FinalCTA: React.FC = () => {
  const { language } = useLanguage();
  const { navigate } = useAppRouter();
  const isEn = language === 'en';

  const handleStart = () => {
    const el = document.getElementById('programs');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="min-h-screen w-full flex flex-col justify-center items-center py-24 sm:py-36 px-4 sm:px-6 relative overflow-hidden bg-slate-950 border-t border-white/10 select-none">
      {/* Ambient Celestial Eclipse Core Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-amber-600/10 blur-[140px] pointer-events-none" />

      <ScrollReveal animation="zoom-in" duration={800}>
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-widest shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isEn ? 'DIRECT INSTITUTIONAL ACCESS · ZERO EVALUATIONS' : 'ACCESO INSTITUCIONAL DIRECTO · SIN EXÁMENES'}</span>
          </div>

          {/* Aggressive Headline */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
            {isEn ? 'Ready to prove your edge?' : '¿Listo para demostrar tu ventaja?'}
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            {isEn 
              ? 'Activate your corporate funded account in seconds. Direct USDT futures execution on our proprietary GPU terminal, and bi-weekly payouts up to 90%.' 
              : 'Activa tu cuenta de capital en segundos. Ejecución directa en derivados de USDT con nuestra terminal web acelerada por GPU y retiros quincenales de hasta el 90%.'}
          </p>

          {/* Primary High-Impact CTA Button */}
          <div className="pt-2 flex flex-col items-center justify-center gap-4">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-10 sm:px-14 py-5 text-sm sm:text-base font-mono font-black tracking-widest uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 rounded-2xl border border-amber-200/60 shadow-[4px_4px_0px_#000000,0_0_50px_rgba(245,158,11,0.5)] flex items-center justify-center gap-3 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 group"
            >
              <Flame className="w-5 h-5 text-slate-950 group-hover:scale-125 transition-transform" />
              <span>{isEn ? 'Get Instant Funding' : 'Obtener Fondeo Inmediato'}</span>
              <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1.5 transition-transform" />
            </button>

            {/* Instant Delivery Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isEn ? 'Automated Credential Dispatch' : 'Entrega Inmediata de Acceso'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {isEn ? 'USDT (TRC20 · ERC20 · BEP20)' : 'USDT (TRC20 · ERC20 · BEP20)'}
              </span>
            </div>
          </div>

          {/* Bottom Tagline */}
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-slate-500">
              {isEn 
                ? 'Crypto Futures · Clear Rules · Built for Traders' 
                : 'Futuros Cripto · Reglas Claras · Construido para Traders'}
            </p>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
