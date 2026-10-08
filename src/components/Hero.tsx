import React from 'react';
import { 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';

interface HeroProps {
  onOpenTerminal?: () => void;
  onNavigateToPlans?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateToPlans }) => {
  const { language } = useLanguage();
  const { navigate } = useAppRouter();
  const isEn = language === 'en';

  const handleGetFunded = () => {
    if (onNavigateToPlans) {
      onNavigateToPlans();
    } else {
      const el = document.getElementById('programs');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else navigate('/login');
    }
  };

  const handleViewPlans = () => {
    if (onNavigateToPlans) {
      onNavigateToPlans();
    } else {
      const el = document.getElementById('programs');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else navigate('/login');
    }
  };

  return (
    <section 
      id="hero"
      className="relative w-full h-full text-white select-none flex items-center justify-start px-4 sm:px-10 lg:px-20 py-4 sm:py-16 overflow-hidden pointer-events-auto"
    >
      <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col justify-center items-start pt-14 sm:pt-0 my-auto">
        
        {/* ========================================================================= */}
        {/* LEFT-ALIGNED HERO CONTENT (Clean, Uncluttered & Highly Visual)            */}
        {/* ========================================================================= */}
        <div 
          className="max-w-xl lg:max-w-2xl flex flex-col justify-center items-start text-left space-y-3.5 sm:space-y-6 will-change-transform transform-gpu animate-reveal"
        >
          
          {/* Overline Pre-title */}
          <div className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-slate-300/90 uppercase font-sans">
            {isEn ? 'TRADE YOUR SKILLS. GROW YOUR CAPITAL.' : 'OPERA TU TALENTO. CRECE TU CAPITAL.'}
          </div>

          {/* Master Visual Headline (Scaled text-3xl for iPhone SE to prevent text clipping) */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[5.25rem] font-black tracking-[-0.03em] leading-[1.08] text-white">
            <span className="block drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
              {isEn ? 'Your Trading' : 'Tu Trading'}
            </span>
            <span className="block mt-0.5 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] via-[#C084FC] to-[#A855F7] drop-shadow-[0_0_40px_rgba(168,85,247,0.45)]">
              {isEn ? 'Next Level' : 'Siguiente Nivel'}
            </span>
          </h1>

          {/* Clean Subtitle Paragraph */}
          <p className="text-xs sm:text-base md:text-lg text-slate-300/85 font-normal leading-relaxed max-w-lg drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
            {isEn 
              ? 'Eklipse Funded gives you real capital, clear rules and the right conditions to trade without limits.'
              : 'Eklipse Funded te da capital real, reglas claras y las mejores condiciones para operar sin límites.'}
          </p>

          {/* Action Buttons */}
          <div className="pt-1 sm:pt-3 flex flex-wrap items-center gap-3 sm:gap-5">
            {/* Primary Pill Button */}
            <button
              onClick={handleGetFunded}
              className="px-6 sm:px-9 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-base font-semibold text-white bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#9333EA] hover:brightness-110 shadow-[0_0_25px_rgba(124,58,237,0.45)] hover:shadow-[0_0_35px_rgba(124,58,237,0.65)] transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-95 group"
            >
              <span>{isEn ? 'Get Funded' : 'Obtener Fondeo'}</span>
              <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Glass Pill Button */}
            <button
              onClick={handleViewPlans}
              className="px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-base font-medium text-white/95 bg-white/[0.04] hover:bg-white/[0.09] border border-white/20 hover:border-white/40 backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-95"
            >
              <span>{isEn ? 'View Plans' : 'Ver Planes'}</span>
            </button>
          </div>

          {/* Bottom 3 Minimalist Features */}
          <div className="pt-4 sm:pt-8 grid grid-cols-3 gap-2 sm:gap-6 max-w-2xl border-t border-white/10 mt-3 sm:mt-6 w-full">
            
            {/* Feature 1: Instant Funding */}
            <div className="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-3">
              <div className="p-1 sm:p-2 rounded-lg bg-white/[0.04] border border-white/10 shrink-0">
                <Zap className="w-3 sm:w-4 h-3 sm:h-4 text-indigo-400" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] sm:text-sm font-bold text-white tracking-tight">
                  {isEn ? 'Instant Funding' : 'Fondeo Inmediato'}
                </div>
                <div className="text-[9.5px] sm:text-xs text-slate-400 hidden sm:block">
                  {isEn ? 'Start trading today' : 'Comienza hoy'}
                </div>
              </div>
            </div>

            {/* Feature 2: Transparent Rules */}
            <div className="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-3">
              <div className="p-1 sm:p-2 rounded-lg bg-white/[0.04] border border-white/10 shrink-0">
                <ShieldCheck className="w-3 sm:w-4 h-3 sm:h-4 text-purple-400" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] sm:text-sm font-bold text-white tracking-tight">
                  {isEn ? 'Transparent Rules' : 'Reglas Claras'}
                </div>
                <div className="text-[9.5px] sm:text-xs text-slate-400 hidden sm:block">
                  {isEn ? 'No hidden traps' : 'Sin trampas'}
                </div>
              </div>
            </div>

            {/* Feature 3: Global Access */}
            <div className="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-3">
              <div className="p-1 sm:p-2 rounded-lg bg-white/[0.04] border border-white/10 shrink-0">
                <Globe className="w-3 sm:w-4 h-3 sm:h-4 text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] sm:text-sm font-bold text-white tracking-tight">
                  {isEn ? 'Global Access' : 'Acceso Global'}
                </div>
                <div className="text-[9.5px] sm:text-xs text-slate-400 hidden sm:block">
                  {isEn ? 'Trade anywhere' : 'Opera 24/7'}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
