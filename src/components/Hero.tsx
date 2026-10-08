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
      className="relative w-full h-full text-white select-none flex items-center justify-start px-6 sm:px-12 lg:px-20 py-16 sm:py-20 overflow-hidden pointer-events-auto"
    >
      <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col justify-center items-start">
        
        {/* ========================================================================= */}
        {/* LEFT-ALIGNED HERO CONTENT (Clean, Uncluttered & Highly Visual)            */}
        {/* ========================================================================= */}
        <div 
          className="max-w-xl lg:max-w-2xl flex flex-col justify-center items-start text-left space-y-6 sm:space-y-8 will-change-transform transform-gpu animate-reveal"
        >
          
          {/* Overline Pre-title */}
          <div className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-slate-300/90 uppercase font-sans">
            {isEn ? 'TRADE YOUR SKILLS. GROW YOUR CAPITAL.' : 'OPERA TU TALENTO. CRECE TU CAPITAL.'}
          </div>

          {/* Master Visual Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-black tracking-[-0.03em] leading-[1.05] text-white">
            <span className="block drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
              {isEn ? 'Your Trading' : 'Tu Trading'}
            </span>
            <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] via-[#C084FC] to-[#A855F7] drop-shadow-[0_0_40px_rgba(168,85,247,0.45)]">
              {isEn ? 'Next Level' : 'Siguiente Nivel'}
            </span>
          </h1>

          {/* Clean Subtitle Paragraph */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300/85 font-normal leading-relaxed max-w-lg drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
            {isEn 
              ? 'Eklipse Funded gives you real capital, clear rules and the right conditions to trade without limits.'
              : 'Eklipse Funded te da capital real, reglas claras y las mejores condiciones para operar sin límites.'}
          </p>

          {/* Action Buttons (Only the essential ones) */}
          <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-4 sm:gap-5">
            {/* Primary Pill Button */}
            <button
              onClick={handleGetFunded}
              className="px-8 sm:px-9 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#9333EA] hover:brightness-110 shadow-[0_0_25px_rgba(124,58,237,0.45)] hover:shadow-[0_0_35px_rgba(124,58,237,0.65)] transition-all duration-200 flex items-center gap-2.5 cursor-pointer hover:scale-[1.03] active:scale-95 group"
            >
              <span>{isEn ? 'Get Funded' : 'Obtener Fondeo'}</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Glass Pill Button */}
            <button
              onClick={handleViewPlans}
              className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-medium text-white/95 bg-white/[0.04] hover:bg-white/[0.09] border border-white/20 hover:border-white/40 backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-95"
            >
              <span>{isEn ? 'View Plans' : 'Ver Planes'}</span>
            </button>
          </div>

          {/* Bottom 3 Minimalist Features */}
          <div className="pt-8 sm:pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl border-t border-white/10 mt-6 w-full">
            
            {/* Feature 1: Instant Funding */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-white tracking-tight">
                  {isEn ? 'Instant Funding' : 'Fondeo Inmediato'}
                </div>
                <div className="text-xs text-slate-400">
                  {isEn ? 'Start trading today' : 'Comienza a operar hoy'}
                </div>
              </div>
            </div>

            {/* Feature 2: Transparent Rules */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-white tracking-tight">
                  {isEn ? 'Transparent Rules' : 'Reglas Transparentes'}
                </div>
                <div className="text-xs text-slate-400">
                  {isEn ? 'No hidden conditions' : 'Sin condiciones ocultas'}
                </div>
              </div>
            </div>

            {/* Feature 3: Global Access */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 shrink-0 mt-0.5">
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-white tracking-tight">
                  {isEn ? 'Global Access' : 'Acceso Global'}
                </div>
                <div className="text-xs text-slate-400">
                  {isEn ? 'Trade from anywhere' : 'Opera desde donde quieras'}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
