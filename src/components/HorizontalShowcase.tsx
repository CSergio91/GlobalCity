import React, { useRef, useState, useEffect } from 'react';
import commandDeckVisualPath from '../assets/images/command_bridge_parallax_1790347047571.jpg';
import { ArrowRight, Terminal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HorizontalShowcaseProps {
  onOpenTerminal: () => void;
}

export const HorizontalShowcase: React.FC<HorizontalShowcaseProps> = ({ onOpenTerminal }) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;
      
      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const slides = t.showcase.slides;
  const totalSlides = slides.length;
  const translateX = scrollProgress * (totalSlides - 1) * 100;
  const bgTranslateX = scrollProgress * 25;
  const currentSlideIndex = Math.min(totalSlides, Math.floor(scrollProgress * (totalSlides - 0.05)) + 1);

  return (
    <section 
      id="horizontal-showcase" 
      ref={containerRef} 
      className="relative h-[420vh] bg-[#050609] select-none"
    >
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        
        {/* Parallax High-Contrast Background Canvas */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={commandDeckVisualPath} 
            alt="Global City Command Deck Parallax Horizon" 
            className="w-[135vw] h-full object-cover object-center filter brightness-[0.82] contrast-[1.25] saturate-[1.2] transition-transform duration-100 ease-out will-change-transform"
            style={{
              transform: `scale(1.1) translateX(-${bgTranslateX}%)`
            }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/75 via-transparent to-[#050609]/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050609]/90 via-transparent to-[#050609]/50" />
        </div>

        {/* Minimal Navigation Counter */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pt-8 flex items-center justify-end">
          <div className="flex items-center gap-3 font-mono text-sm bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
            <span className="text-white font-black text-base drop-shadow-md">0{currentSlideIndex}</span>
            <span className="text-white/30">/</span>
            <span className="text-slate-300">0{totalSlides}</span>
          </div>
        </div>

        {/* Horizontal Moving Content Strip: Full viewport centered presentation */}
        <div className="relative z-10 w-full flex-1 flex items-center overflow-hidden">
          <div 
            className="flex h-full items-center transition-transform duration-100 ease-out will-change-transform"
            style={{
              transform: `translateX(-${translateX}vw)`,
              width: `${totalSlides * 100}vw`
            }}
          >
            {slides.map((slide, idx) => (
              <div 
                key={idx} 
                className="w-screen h-full flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 flex-shrink-0 py-12 sm:py-0 overflow-y-auto sm:overflow-visible"
              >
                {/* Crystal Clear Floating Stage Box */}
                <div className="max-w-5xl mx-auto w-full p-5 sm:p-10 lg:p-12 rounded-2xl sm:rounded-3xl bg-[#07090F]/85 backdrop-blur-xl border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.9)] my-auto">
                  
                  {/* Huge Watermark Number */}
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="font-mono text-3xl sm:text-5xl lg:text-6xl font-black text-[#F472B6]/40 tracking-tighter select-none">
                      {slide.index}
                    </div>
                  </div>

                  {/* Monumental Headline with Drop Shadow */}
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.12] sm:leading-[1.08] mb-4 sm:mb-6 text-balance text-shadow-hero drop-shadow-[0_6px_20px_rgba(0,0,0,0.9)]">
                    {slide.title}
                  </h2>

                  {/* Narrative Body */}
                  <p className="text-sm sm:text-base lg:text-xl text-slate-100 font-normal leading-relaxed max-w-3xl mb-6 sm:mb-8 text-balance text-shadow-subtle drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] text-illuminate">
                    {slide.description}
                  </p>

                  {/* Highlights & Tags: Pure Architectural Hairline Lines */}
                  <div className="pt-4 sm:pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-center">
                    <div>
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#FBBF24] font-mono-nums drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                        {slide.highlightStat}
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-200 mt-1 font-medium">
                        {slide.highlightLabel}
                      </div>
                    </div>

                    {slide.tags.map((tag, tIdx) => (
                      <div key={tIdx} className="border-l border-white/20 pl-3 sm:pl-5 group">
                        <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#EC4899] font-bold">
                          {tag.label}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-white mt-0.5 sm:mt-1 group-hover:text-[#FBBF24] transition-colors">
                          {tag.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Liquid Button CTA */}
                  <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 flex items-center justify-between">
                    <button
                      onClick={onOpenTerminal}
                      className="btn-liquid inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#F472B6] to-[#818CF8] text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#EC4899]/30 border border-white/20 cursor-pointer"
                    >
                      <Terminal className="w-4 h-4 text-white" />
                      <span>{t.showcase.ctaBtn}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Progress Line at Bottom */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pb-8 flex items-center gap-6">
          <div className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#60A5FA] via-[#F472B6] to-[#FBBF24] transition-all duration-100 rounded-full"
              style={{ width: `${Math.max(6, scrollProgress * 100)}%` }}
            />
          </div>
        </div>

      </div>
    </section>
  );
};
