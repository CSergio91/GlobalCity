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
    } else {
      const track = document.getElementById('horizontal-showcase-track');
      if (track) {
        track.style.transform = `translate3d(-${slideIdx * 50}%, 0, 0)`;
      }
    }
  };

  return (
    <section 
      id="terminal"
      className="relative w-full h-full max-h-screen text-white select-none overflow-hidden bg-transparent pointer-events-auto flex flex-col justify-between"
    >
      {/* 200vw Horizontal Track Container */}
      <div 
        id="horizontal-showcase-track"
        className="w-[200vw] h-full flex flex-row will-change-transform"
        style={{ 
          transform: 'translate3d(0%, 0, 0)',
          transition: 'transform 0.05s ease-out' 
        }}
      >
        {/* Slide 1: Terminal de Trading Institucional */}
        <div className="w-[100vw] max-w-full h-full shrink-0 flex items-center justify-center pt-16 sm:pt-20 lg:pt-24 pb-2">
          <TerminalShowcaseSlide 
            onNavigateToPlans={onNavigateToPlans}
            onGoToDashboard={() => handleSlideClick(1)}
          />
        </div>

        {/* Slide 2: Trader Dashboard en Tiempo Real */}
        <div className="w-[100vw] max-w-full h-full shrink-0 flex items-center justify-center pt-10 sm:pt-12 pb-2">
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
