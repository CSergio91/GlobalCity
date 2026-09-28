import React, { useRef, useState, useEffect } from 'react';
import commandDeckVisualPath from '../assets/images/command_bridge_parallax_1790347047571.webp';
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
      className="relative h-[380vh] bg-transparent select-none"
    >
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        
        {/* Parallax High-Contrast Background Canvas (Clean, translucent) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={commandDeckVisualPath} 
            alt="Eklipse Funded Command Deck Parallax Horizon" 
            className="w-[130vw] h-full object-cover object-center filter brightness-[1.05] contrast-[1.12] opacity-30 transition-transform duration-100 ease-out will-change-transform"
            style={{
              transform: `scale(1.08) translateX(-${bgTranslateX}%)`
            }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Minimal Retro Monospace Navigation Counter */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pt-6 sm:pt-8 flex items-center justify-end">
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-white/90 backdrop-blur-xl px-4 py-1.5 rounded-xl border-2 border-slate-900/15 shadow-[3px_3px_0px_#090A10]">
            <span className="text-[#090A10] font-black tracking-wider">[ 0{currentSlideIndex}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500 font-bold">0{totalSlides} ]</span>
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
                {/* Retro-Brutalist Translucent Glass Console Box (relative z-10 to stay in front of astros) */}
                <div className="max-w-4xl mx-auto w-full p-6 sm:p-10 lg:p-12 rounded-2xl bg-slate-950/80 border-2 border-white/20 backdrop-blur-2xl shadow-[8px_8px_0px_#7C3AED,0_20px_50px_rgba(0,0,0,0.6)] my-auto relative z-10 overflow-hidden text-white">
                  
                  {/* Watermark Index */}
                  <div className="flex items-center justify-end mb-2">
                    <div className="font-mono text-2xl sm:text-3xl font-black text-white/20 tracking-tighter select-none">
                      {slide.index}
                    </div>
                  </div>

                  {/* Monumental Headline with Signature Gradient */}
                  {(() => {
                    const words = slide.title.split(' ');
                    const splitIdx = Math.max(1, Math.floor(words.length * 0.55));
                    const startPart = words.slice(0, splitIdx).join(' ');
                    const endPart = words.slice(splitIdx).join(' ');
                    return (
                      <h2 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight mb-3 sm:mb-4 text-balance">
                        {startPart}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#C084FC] to-[#818CF8]">
                          {endPart}
                        </span>
                      </h2>
                    );
                  })()}

                  {/* Narrative Body */}
                  <p className="text-xs sm:text-sm lg:text-base text-slate-200 font-normal leading-relaxed max-w-2xl mb-6 sm:mb-8 text-balance">
                    {slide.description}
                  </p>

                  {/* Highlights & Tags: Retro Brutalist Stamped Cells */}
                  <div className="pt-4 border-t-2 border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 items-stretch">
                    <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-400/30">
                      <div className="text-xl sm:text-2xl font-black text-[#A78BFA] font-mono truncate">
                        {slide.highlightStat}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-300 mt-0.5 font-mono uppercase font-bold truncate">
                        {slide.highlightLabel}
                      </div>
                    </div>

                    {slide.tags.map((tag, tIdx) => (
                      <div key={tIdx} className="p-3 rounded-xl bg-slate-900/60 border border-white/10 group">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold truncate">
                          {tag.label}
                        </div>
                        <div className="text-xs font-semibold text-white mt-0.5 group-hover:text-purple-300 transition-colors truncate">
                          {tag.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Button CTA: Tactile Retro Pill */}
                  <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() => navigate('/login')}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] text-xs font-mono font-bold uppercase tracking-wider text-white border border-purple-300/40 shadow-[4px_4px_0px_#090A10] hover:brightness-110 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <LogIn className="w-3.5 h-3.5 text-white" />
                      <span>{t.showcase.ctaBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Progress Line at Bottom */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pb-6 sm:pb-8 flex items-center gap-6">
          <div className="flex-1 h-[3px] bg-slate-200 rounded-full overflow-hidden border border-slate-300">
            <div 
              className="h-full bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] transition-all duration-100 rounded-full"
              style={{ width: `${Math.max(6, scrollProgress * 100)}%` }}
            />
          </div>
        </div>

      </div>
    </section>
  );
};
