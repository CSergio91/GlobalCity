import React, { useRef, useState, useEffect } from 'react';
import commandDeckVisualPath from '../assets/images/command_bridge_parallax_1790347047571.jpg';
import { ArrowRight, LogIn } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';

export const HorizontalShowcase: React.FC = () => {
  const { t } = useLanguage();
  const { navigate } = useAppRouter();
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
  const bgTranslateX = scrollProgress * 20;
  const currentSlideIndex = Math.min(totalSlides, Math.floor(scrollProgress * (totalSlides - 0.05)) + 1);

  return (
    <section 
      id="horizontal-showcase" 
      ref={containerRef} 
      className="relative h-[380vh] bg-[#050609] select-none"
    >
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        
        {/* Parallax High-Contrast Background Canvas */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={commandDeckVisualPath} 
            alt="Global City Command Deck Parallax Horizon" 
            className="w-[130vw] h-full object-cover object-center filter brightness-[0.7] contrast-[1.2] saturate-[1.1] transition-transform duration-100 ease-out will-change-transform"
            style={{
              transform: `scale(1.08) translateX(-${bgTranslateX}%)`
            }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/85 via-transparent to-[#050609]/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050609] via-transparent to-[#050609]/70" />
        </div>

        {/* Minimal Navigation Counter */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pt-6 sm:pt-8 flex items-center justify-end">
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-black/50 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10">
            <span className="text-white font-black drop-shadow-md">0{currentSlideIndex}</span>
            <span className="text-white/30">/</span>
            <span className="text-slate-400">0{totalSlides}</span>
          </div>
        </div>

        {/* Horizontal Moving Content Strip */}
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
                className="w-screen h-full flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 flex-shrink-0 py-8 sm:py-0 overflow-y-auto sm:overflow-visible"
              >
                {/* Borderless Floating Stage Box */}
                <div className="max-w-4xl mx-auto w-full p-5 sm:p-9 lg:p-11 rounded-3xl bg-[#07090F]/85 border-t border-white/10 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] my-auto">
                  
                  {/* Watermark Number */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-2xl sm:text-4xl lg:text-5xl font-black text-[#F472B6]/40 tracking-tighter select-none">
                      {slide.index}
                    </div>
                  </div>

                  {/* Monumental Headline */}
                  <h2 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight mb-3 sm:mb-4 text-balance drop-shadow-md">
                    {slide.title}
                  </h2>

                  {/* Narrative Body */}
                  <p className="text-xs sm:text-sm lg:text-base text-slate-300 font-light leading-relaxed max-w-2xl mb-5 sm:mb-7 text-balance">
                    {slide.description}
                  </p>

                  {/* Highlights & Tags */}
                  <div className="pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 items-center">
                    <div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#FBBF24] font-mono-nums drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] truncate">
                        {slide.highlightStat}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium truncate">
                        {slide.highlightLabel}
                      </div>
                    </div>

                    {slide.tags.map((tag, tIdx) => (
                      <div key={tIdx} className="border-l border-white/10 pl-3 group">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#EC4899] font-bold truncate">
                          {tag.label}
                        </div>
                        <div className="text-xs font-semibold text-white mt-0.5 group-hover:text-[#FBBF24] transition-colors truncate">
                          {tag.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Button CTA */}
                  <div className="mt-5 sm:mt-7 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <button
                      onClick={() => navigate('/login')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] text-xs font-bold uppercase tracking-wider text-white shadow-lg cursor-pointer transition-all active:scale-95"
                    >
                      <LogIn className="w-3.5 h-3.5 text-white" />
                      <span>{t.showcase.ctaBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Progress Line at Bottom */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pb-6 sm:pb-8 flex items-center gap-6">
          <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
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
