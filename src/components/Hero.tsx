import React from 'react';
import { 
  Flame, 
  Terminal, 
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';

interface HeroProps {
  onOpenTerminal?: () => void;
  onExploreModules?: () => void;
}

export const Hero: React.FC<HeroProps> = () => {
  const { t } = useLanguage();
  const { navigate } = useAppRouter();

  const handleScrollToPlans = () => {
    const el = document.getElementById('planes');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/login');
    }
  };

  const handleScrollToTools = () => {
    const el = document.getElementById('planes');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/login');
    }
  };

  return (
    <section 
      id="hero"
      className="min-h-screen w-full flex flex-col justify-center items-center pt-28 sm:pt-36 pb-20 sm:pb-28 relative select-none bg-transparent"
    >
      {/* 
        CLEAN, LUMINOUS & SPACIOUS HERO:
        No heavy enclosing boxes or rules clutter.
        Allows the underlying 3D video sequence to shine unimpeded.
      */}
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 max-w-[1240px] mx-auto relative z-10 flex flex-col items-center text-center my-auto">
        
        {/* Monumental Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.12] sm:leading-[1.08] max-w-5xl drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
          {t.hero.headlineStart}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-[0_0_40px_rgba(245,158,11,0.5)]">
            {t.hero.headlineEnd}
          </span>
        </h1>

        {/* High-Impact Action Buttons mounted directly below the headline */}
        <div className="mt-9 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {/* Primary Action: Fondearme Ahora with Energetic Flame Icon in Gold/Obsidian */}
          <button
            onClick={handleScrollToPlans}
            className="w-full sm:w-auto px-9 sm:px-11 py-4 text-xs sm:text-sm font-mono font-black tracking-widest uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 rounded-xl border border-amber-200/60 shadow-[4px_4px_0px_#000000,0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 group"
          >
            <Flame className="w-4 h-4 text-slate-950 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" />
            <span>{t.hero.openTerminalBtn}</span>
            <ChevronRight className="w-4 h-4 text-slate-950/80 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Action: Probar Herramientas */}
          <button
            onClick={handleScrollToTools}
            className="w-full sm:w-auto px-8 sm:px-10 py-4 text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-white hover:text-amber-300 bg-slate-950/70 hover:bg-slate-900/90 backdrop-blur-xl rounded-xl flex items-center justify-center gap-2.5 cursor-pointer border border-white/20 hover:border-amber-400/40 shadow-[4px_4px_0px_#000000] transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <Terminal className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
            <span>{t.hero.exploreModulesBtn}</span>
          </button>
        </div>

        {/* Micro-note: Loyalty Points & Tools Benefits */}
        <p className="mt-5 text-[11px] sm:text-xs font-mono text-slate-400/90 max-w-lg">
          {t.hero.note}
        </p>

      </div>
    </section>
  );
};
