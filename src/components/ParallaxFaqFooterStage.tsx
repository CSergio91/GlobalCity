import React, { useRef, useEffect } from 'react';
import { FAQSection } from './FAQSection';
import { Footer } from './Footer';

export const ParallaxFaqFooterStage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const faqWrapperRef = useRef<HTMLDivElement>(null);
  const footerWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const faqEl = faqWrapperRef.current;
          const footerEl = footerWrapperRef.current;

          if (!faqEl || !footerEl) {
            ticking = false;
            return;
          }

          const footerRect = footerEl.getBoundingClientRect();
          const winHeight = window.innerHeight;

          // As the footer rises from below (footerRect.top goes from winHeight to 0):
          if (footerRect.top < winHeight) {
            const overlapProgress = Math.max(0, Math.min(1, (winHeight - footerRect.top) / winHeight));
            const isMobile = window.innerWidth < 768;
            
            // FAQs stay in the background with parallax lag, subtle scale and dimming
            const parallaxShiftY = overlapProgress * (isMobile ? 35 : 90); // lag behind the curtain
            const scale = 1 - overlapProgress * (isMobile ? 0.015 : 0.035); // gentle recession into depth
            const opacity = Math.max(0.15, 1 - overlapProgress * 0.7); // graceful fade

            faqEl.style.transform = `translate3d(0, ${parallaxShiftY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
            faqEl.style.opacity = `${opacity.toFixed(3)}`;
          } else {
            faqEl.style.transform = 'translate3d(0, 0, 0) scale(1)';
            faqEl.style.opacity = '1';
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full bg-[#06070B]">
      
      {/* 1. STICKY BACKGROUND FAQ LAYER: Stays locked at top: 0 in the viewport as the footer curtain rises over it */}
      <div 
        ref={faqWrapperRef}
        className="sticky top-0 z-10 w-full min-h-screen flex flex-col justify-center will-change-transform will-change-opacity origin-center transition-none bg-[#06070B] overflow-hidden"
        style={{ transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 }}
      >
        <FAQSection />
      </div>

      {/* 2. FOOTER CURTAIN LAYER (CAPA POR ENCIMA): Elevated z-30 layer that scrolls UP directly OVER the sticky FAQs */}
      <div 
        ref={footerWrapperRef}
        className="relative z-30 w-full shadow-[0_-60px_180px_rgba(0,0,0,1),0_-20px_60px_rgba(245,158,11,0.08)] border-t border-amber-400/30 bg-[#06070B]"
      >
        <Footer />
      </div>

    </div>
  );
};
