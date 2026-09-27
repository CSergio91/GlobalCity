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
      className="relative h-[380vh] bg-[#F8F9FE] select-none"
    >
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        
        {/* Parallax High-Contrast Background Canvas */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={commandDeckVisualPath} 
            alt="Global City Command Deck Parallax Horizon" 
            className="w-[130vw] h-full object-cover object-center filter brightness-[1.02] contrast-[1.05] opacity-20 transition-transform duration-100 ease-out will-change-transform"
            style={{
              transform: `scale(1.08) translateX(-${bgTranslateX}%)`
            }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F8F9FE]/90 via-transparent to-[#F8F9FE]/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FE] via-transparent to-[#F8F9FE]/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.06),transparent_70%)]" />
        </div>

        {/* Minimal Navigation Counter */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pt-6 sm:pt-8 flex items-center justify-end">
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-purple-200/80 shadow-sm">
            <span className="text-[#090A10] font-black">0{currentSlideIndex}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">0{totalSlides}</span>
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
                <div className="max-w-4xl mx-auto w-full p-6 sm:p-10 lg:p-12 rounded-3xl bg-white/95 border border-purple-200/80 backdrop-blur-2xl shadow-[0_25px_70px_rgba(124,58,237,0.10)] my-auto relative overflow-hidden">
                  
                  {/* Subtle Corner Ambient Mesh */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-100/60 via-transparent to-transparent pointer-events-none rounded-tr-3xl" />

                  {/* Watermark Number */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-2xl sm:text-4xl lg:text-5xl font-black text-[#7C3AED]/25 tracking-tighter select-none">
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
                      <h2 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-[#090A10] tracking-tight leading-tight mb-3 sm:mb-4 text-balance">
                        {startPart}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1]">
                          {endPart}
                        </span>
                      </h2>
                    );
                  })()}

                  {/* Narrative Body */}
                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-normal leading-relaxed max-w-2xl mb-5 sm:mb-7 text-balance">
                    {slide.description}
                  </p>

                  {/* Highlights & Tags */}
                  <div className="pt-4 border-t border-purple-100 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 items-center">
                    <div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#7C3AED] font-mono-nums drop-shadow-[0_0_15px_rgba(124,58,237,0.2)] truncate">
                        {slide.highlightStat}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium truncate">
                        {slide.highlightLabel}
                      </div>
                    </div>

                    {slide.tags.map((tag, tIdx) => (
                      <div key={tIdx} className="border-l border-purple-100 pl-3 group">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#6D28D9] font-bold truncate">
                          {tag.label}
                        </div>
                        <div className="text-xs font-semibold text-[#090A10] mt-0.5 group-hover:text-[#7C3AED] transition-colors truncate">
                          {tag.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Button CTA */}
                  <div className="mt-5 sm:mt-7 pt-4 border-t border-purple-100 flex items-center justify-between">
                    <button
                      onClick={() => navigate('/login')}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] text-xs font-bold uppercase tracking-wider text-white shadow-[0_8px_20px_rgba(124,58,237,0.3)] hover:brightness-105 cursor-pointer transition-all active:scale-95"
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
          <div className="flex-1 h-[2px] bg-purple-100 rounded-full overflow-hidden">
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
