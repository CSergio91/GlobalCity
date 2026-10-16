import React, { useState } from 'react';
import { TerminalShowcaseSlide } from './TerminalShowcaseSlide';
import { TraderDashboardSlide } from './TraderDashboardSlide';
import { Monitor, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface TerminalSectionProps {
  onScrollToFaq?: () => void;
  onSelectSlide?: (slideIndex: number) => void;
  onNavigateToPlans?: () => void;
}

export const TerminalSection: React.FC<TerminalSectionProps> = ({ 
  onScrollToFaq,
  onSelectSlide,
  onNavigateToPlans
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const handleSlideClick = (slideIdx: number) => {
    setActiveSlide(slideIdx);
    if (onSelectSlide) {
      onSelectSlide(slideIdx);
    }
  };

  return (
    <section 
      id="terminal"
      className="relative w-full h-full max-h-screen text-white select-none overflow-hidden bg-transparent pointer-events-auto flex flex-col justify-between"
    >
      {/* Top Floating Dual-Pill Controller */}
      <div 
        role="tablist" 
        aria-label="Terminal and Dashboard Showcase Navigation"
        className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-black/85 border border-white/15 backdrop-blur-xl shadow-2xl max-w-[94vw]"
      >
        <button
          id="btn-slide-terminal"
          role="tab"
          aria-selected={activeSlide === 0}
          aria-controls="slide-panel-terminal"
          onClick={() => handleSlideClick(0)}
          className={`px-2.5 sm:px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSlide === 0
              ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>{isEn ? '01 · Terminal' : '01 · Terminal'}</span>
        </button>

        <button
          id="btn-slide-dashboard"
          role="tab"
          aria-selected={activeSlide === 1}
          aria-controls="slide-panel-dashboard"
          onClick={() => handleSlideClick(1)}
          className={`px-2.5 sm:px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSlide === 1
              ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{isEn ? '02 · Dashboard' : '02 · Dashboard'}</span>
        </button>
      </div>

      {/* 200vw Horizontal Track Container gobernado por estado reactivo */}
      <div 
        id="horizontal-showcase-track"
        className="w-[200vw] h-full flex flex-row will-change-transform"
        style={{ 
          transform: `translate3d(-${activeSlide * 50}%, 0, 0)`,
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}
      >
        {/* Slide 1: Terminal de Trading Institucional */}
        <div 
          id="slide-panel-terminal"
          role="tabpanel"
          aria-labelledby="btn-slide-terminal"
          className="w-[100vw] max-w-full h-full shrink-0 flex items-center justify-center pt-16 sm:pt-20 lg:pt-24 pb-2"
        >
          <TerminalShowcaseSlide 
            onNavigateToPlans={onNavigateToPlans}
            onGoToDashboard={() => handleSlideClick(1)}
          />
        </div>

        {/* Slide 2: Trader Dashboard en Tiempo Real */}
        <div 
          id="slide-panel-dashboard"
          role="tabpanel"
          aria-labelledby="btn-slide-dashboard"
          className="w-[100vw] max-w-full h-full shrink-0 flex items-center justify-center pt-10 sm:pt-12 pb-2"
        >
          <TraderDashboardSlide 
            onBackToTerminal={() => handleSlideClick(0)}
            onScrollToFaq={onScrollToFaq}
            onNavigateToPlans={onNavigateToPlans}
          />
        </div>
      </div>

    </section>
  );
};
