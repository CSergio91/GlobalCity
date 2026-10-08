import React, { useRef, useEffect, useCallback } from 'react';
import { Hero } from './Hero';
import { HeroScrollCanvas } from './HeroScrollCanvas';
import { ProgramsSection } from './ProgramsSection';

interface HeroExperienceStageProps {
  onOpenTerminal: () => void;
  onNavigateSection: (sectionId: string) => void;
  onActiveSectionChange?: (sectionId: string) => void;
}

export const HeroExperienceStage: React.FC<HeroExperienceStageProps> = ({
  onOpenTerminal,
  onNavigateSection,
  onActiveSectionChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroLayerRef = useRef<HTMLDivElement>(null);
  const programsLayerRef = useRef<HTMLDivElement>(null);

  // High-performance single-page scroll choreography (0 React re-renders)
  useEffect(() => {
    let ticking = false;
    let lastActiveSection = 'hero';

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const container = containerRef.current;
          const heroLayer = heroLayerRef.current;
          const programsLayer = programsLayerRef.current;

          if (!container || !heroLayer || !programsLayer) {
            ticking = false;
            return;
          }

          const rect = container.getBoundingClientRect();
          const scrollableHeight = rect.height - window.innerHeight;
          if (scrollableHeight <= 0) {
            ticking = false;
            return;
          }

          // Container progress: 0 (top) to 1 (bottom)
          const progress = Math.max(0, Math.min(1, -rect.top / scrollableHeight));

          // =====================================================================
          // 1. HERO LAYER CHOREOGRAPHY (Active 0.0 -> 0.35, exits gracefully)
          // =====================================================================
          if (progress <= 0.08) {
            // Hero 100% active, stationary at left
            heroLayer.style.opacity = '1';
            heroLayer.style.transform = 'translate3d(0, 0, 0) scale(1)';
            heroLayer.style.pointerEvents = 'auto';
            heroLayer.style.visibility = 'visible';
          } else if (progress < 0.40) {
            // Hero animates OUT ("se va animada")
            const t = (progress - 0.08) / (0.40 - 0.08); // 0 to 1
            const opacity = Math.max(0, 1 - t * 1.05);
            const shiftX = -t * 140; // slides outward to the left
            const shiftY = -t * 30;
            const scale = 1 - t * 0.05;

            heroLayer.style.opacity = `${opacity.toFixed(3)}`;
            heroLayer.style.transform = `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
            heroLayer.style.pointerEvents = opacity > 0.35 ? 'auto' : 'none';
            heroLayer.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible';
          } else {
            // Hero fully vanished
            heroLayer.style.opacity = '0';
            heroLayer.style.pointerEvents = 'none';
            heroLayer.style.visibility = 'hidden';
          }

          // =====================================================================
          // 2. PROGRAMS LAYER CHOREOGRAPHY (Enters 0.28 -> 0.56, active 0.56 -> 1.0)
          // =====================================================================
          if (progress < 0.28) {
            // Programs waiting off-stage
            programsLayer.style.opacity = '0';
            programsLayer.style.transform = 'translate3d(0, 50px, 0) scale(0.96)';
            programsLayer.style.pointerEvents = 'none';
            programsLayer.style.visibility = 'hidden';
          } else if (progress < 0.56) {
            // Programs animates IN ("entra animada desde afuera hacia adentro")
            const t = (progress - 0.28) / (0.56 - 0.28); // 0 to 1
            const opacity = Math.min(1, t * 1.05);
            const shiftY = (1 - t) * 50; // glides up to center
            const scale = 0.96 + t * 0.04;

            programsLayer.style.opacity = `${opacity.toFixed(3)}`;
            programsLayer.style.transform = `translate3d(0, ${shiftY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
            programsLayer.style.pointerEvents = t > 0.65 ? 'auto' : 'none';
            programsLayer.style.visibility = 'visible';
          } else {
            // Programs 100% active, stationary at center, fully interactive
            programsLayer.style.opacity = '1';
            programsLayer.style.transform = 'translate3d(0, 0, 0) scale(1)';
            programsLayer.style.pointerEvents = 'auto';
            programsLayer.style.visibility = 'visible';
          }

          // 3. Notify navbar of active section based on scroll milestone
          const activeSec = progress < 0.45 ? 'hero' : 'programs';
          if (activeSec !== lastActiveSection) {
            lastActiveSection = activeSec;
            if (onActiveSectionChange) onActiveSectionChange(activeSec);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onActiveSectionChange]);

  const handleScrollToPrograms = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      const scrollable = container.offsetHeight - window.innerHeight;
      const targetScroll = container.offsetTop + scrollable * 0.75;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      id="hero-experience"
      className="relative w-full"
      style={{ height: '260vh' }}
    >
      {/* Pinned Sticky Viewport: Holds both the 240-frame Canvas and the Single Screen Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Pinned 240-frame Cosmic Eclipse Canvas (Continuously animated with scroll & mouse) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <HeroScrollCanvas totalFrames={240} containerId="hero-experience" />
        </div>

        {/* Stage Content: Both sections rendered in the EXACT SAME SCREEN with 0 DOM jumping */}
        <div className="absolute inset-0 z-10 w-full h-full">
          
          {/* Layer 1: Hero Section */}
          <div 
            ref={heroLayerRef}
            className="absolute inset-0 w-full h-full flex items-center justify-start pointer-events-auto will-change-transform will-change-opacity"
            style={{ transition: 'none' }}
          >
            <Hero 
              onOpenTerminal={onOpenTerminal} 
              onNavigateToPlans={handleScrollToPrograms} 
            />
          </div>

          {/* Layer 2: Programs (Account Types) Section */}
          <div 
            ref={programsLayerRef}
            className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none will-change-transform will-change-opacity"
            style={{ opacity: 0, transform: 'translate3d(0, 50px, 0) scale(0.96)', visibility: 'hidden', transition: 'none' }}
          >
            <ProgramsSection />
          </div>

        </div>

      </div>
    </div>
  );
};
