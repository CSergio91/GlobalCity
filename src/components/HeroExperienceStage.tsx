import React, { useRef, useEffect, useCallback } from 'react';
import { Hero } from './Hero';
import { HeroScrollCanvas } from './HeroScrollCanvas';
import { ProgramsSection } from './ProgramsSection';
import { TerminalSection } from './TerminalSection';
import { BlackHoleDisintegrationCanvas, BlackHoleDisintegrationHandle } from './BlackHoleDisintegrationCanvas';

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
  const terminalStageRef = useRef<HTMLDivElement>(null);
  const vortexRimRef = useRef<HTMLDivElement>(null);
  const vortexRimInnerRef = useRef<HTMLDivElement>(null);
  const disintegrationCanvasRef = useRef<BlackHoleDisintegrationHandle>(null);

  // High-performance single-page scroll choreography across 3 Acts (0 React re-renders)
  useEffect(() => {
    let ticking = false;
    let lastActiveSection = 'hero';

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const container = containerRef.current;
          const heroLayer = heroLayerRef.current;
          const programsLayer = programsLayerRef.current;
          const terminalStage = terminalStageRef.current;
          const vortexRim = vortexRimRef.current;
          const vortexRimInner = vortexRimInnerRef.current;
          const disintegrationCanvas = disintegrationCanvasRef.current;

          if (!container || !heroLayer || !programsLayer || !terminalStage || !vortexRim || !vortexRimInner) {
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
          // ACT 1: HERO LAYER CHOREOGRAPHY (Active 0.00 -> 0.18)
          // =====================================================================
          const isMobile = window.innerWidth < 768;

          if (progress <= 0.08) {
            heroLayer.style.opacity = '1';
            heroLayer.style.transform = 'translate3d(0, 0, 0) scale(1)';
            heroLayer.style.pointerEvents = 'auto';
            heroLayer.style.visibility = 'visible';
          } else if (progress < 0.18) {
            // Hero animates OUT (Upward fade on mobile, lateral on desktop)
            const t = (progress - 0.08) / (0.18 - 0.08); // 0 to 1
            const opacity = Math.max(0, 1 - t * 1.05);
            const shiftX = isMobile ? -t * 20 : -t * 120;
            const shiftY = isMobile ? -t * 35 : -t * 25;
            const scale = 1 - t * 0.04;

            heroLayer.style.opacity = `${opacity.toFixed(3)}`;
            heroLayer.style.transform = `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
            heroLayer.style.pointerEvents = opacity > 0.35 ? 'auto' : 'none';
            heroLayer.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible';
          } else {
            heroLayer.style.opacity = '0';
            heroLayer.style.pointerEvents = 'none';
            heroLayer.style.visibility = 'hidden';
          }

          // =====================================================================
          // ACT 2: PROGRAMS LAYER CHOREOGRAPHY (Enters 0.15 -> 0.22, STABLE 0.22 -> 0.54)
          // =====================================================================
          if (progress < 0.15) {
            programsLayer.style.opacity = '0';
            programsLayer.style.transform = `translate3d(0, ${isMobile ? 25 : 45}px, 0) scale(0.97)`;
            programsLayer.style.pointerEvents = 'none';
            programsLayer.style.visibility = 'hidden';
          } else if (progress < 0.22) {
            // Programs animates IN swiftly to 100% opacity
            const t = (progress - 0.15) / (0.22 - 0.15);
            const opacity = Math.min(1, t * 1.1);
            const shiftY = (1 - t) * (isMobile ? 25 : 45);
            const scale = 0.97 + t * 0.03;

            programsLayer.style.opacity = `${opacity.toFixed(3)}`;
            programsLayer.style.transform = `translate3d(0, ${shiftY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
            programsLayer.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
            programsLayer.style.visibility = 'visible';
          } else if (progress < 0.48) {
            // GENEROUS STABLE PLATEAU: 100% visible, fully interactable, crystal-clear!
            programsLayer.style.opacity = '1';
            programsLayer.style.transform = 'translate3d(0, 0, 0) scale(1)';
            programsLayer.style.pointerEvents = 'auto';
            programsLayer.style.visibility = 'visible';
          } else if (progress < 0.53) {
            // Swift clean fade-out BEFORE the black hole event horizon begins
            const t = (progress - 0.48) / (0.53 - 0.48);
            const opacity = Math.max(0, 1 - t);
            const shiftY = -t * (isMobile ? 20 : 35);
            const scale = 1 - t * 0.03;
            programsLayer.style.opacity = `${opacity.toFixed(3)}`;
            programsLayer.style.transform = `translate3d(0, ${shiftY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
            programsLayer.style.pointerEvents = 'none';
            programsLayer.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible';
          } else {
            // 100% Hidden — ZERO components of previous section can leak through
            programsLayer.style.opacity = '0';
            programsLayer.style.pointerEvents = 'none';
            programsLayer.style.visibility = 'hidden';
          }

          // =====================================================================
          // ACT 3 TRANSITION: SOLID BLACK HOLE OVERLAY (0.53 -> 0.70)
          // =====================================================================
          const w = window.innerWidth;
          const h = window.innerHeight;
          const rMax = Math.sqrt((w / 2) * (w / 2) + (h / 2) * (h / 2)) * 1.06;

          if (progress < 0.53) {
            terminalStage.style.clipPath = 'circle(0px at 50% 50%)';
            terminalStage.style.pointerEvents = 'none';
            terminalStage.style.visibility = 'hidden';

            vortexRim.style.visibility = 'hidden';
            vortexRim.style.opacity = '0';

            disintegrationCanvas?.updateHorizon(0, false);
          } else if (progress < 0.70) {
            const t = (progress - 0.53) / (0.70 - 0.53); // 0 to 1
            const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const currentR = Math.max(1, easedT * rMax);
            const rotationDeg = t * 720;

            terminalStage.style.visibility = 'visible';
            terminalStage.style.clipPath = `circle(${currentR.toFixed(1)}px at 50% 50%)`;
            terminalStage.style.pointerEvents = t > 0.85 ? 'auto' : 'none';

            vortexRim.style.visibility = 'visible';
            vortexRim.style.opacity = t > 0.94 ? `${Math.max(0, (1 - t) / 0.06).toFixed(3)}` : '1';
            
            const diameter = Math.round(currentR * 2);
            vortexRimInner.style.width = `${diameter}px`;
            vortexRimInner.style.height = `${diameter}px`;
            vortexRimInner.style.transform = `rotate(${rotationDeg.toFixed(1)}deg)`;

            disintegrationCanvas?.updateHorizon(currentR, true);
          } else {
            terminalStage.style.visibility = 'visible';
            terminalStage.style.clipPath = 'none';
            terminalStage.style.pointerEvents = 'auto';

            vortexRim.style.visibility = 'hidden';
            vortexRim.style.opacity = '0';

            disintegrationCanvas?.updateHorizon(0, false);
          }

          // =====================================================================
          // ACT 3 HORIZONTAL SHOWCASE TRACK: Terminal (0.70->0.82) -> Dashboard (0.94->1.00)
          // =====================================================================
          const horizontalTrack = document.getElementById('horizontal-showcase-track');
          const btnTerminal = document.getElementById('btn-slide-terminal');
          const btnDashboard = document.getElementById('btn-slide-dashboard');

          if (horizontalTrack) {
            let hProgress = 0;
            if (progress <= 0.82) {
              hProgress = 0;
            } else if (progress < 0.94) {
              hProgress = (progress - 0.82) / (0.94 - 0.82);
            } else {
              hProgress = 1;
            }

            // High precision cubic easing for horizontal slide transition
            const easedH = hProgress < 0.5 
              ? 4 * hProgress * hProgress * hProgress 
              : 1 - Math.pow(-2 * hProgress + 2, 3) / 2;
            
            const shiftPct = (easedH * 50).toFixed(3);
            horizontalTrack.style.transform = `translate3d(-${shiftPct}%, 0, 0)`;

            // Update UI buttons based on active slide
            if (btnTerminal && btnDashboard) {
              if (hProgress < 0.5) {
                btnTerminal.className = 'px-3 sm:px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]';
                btnDashboard.className = 'px-3 sm:px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5';
              } else {
                btnTerminal.className = 'px-3 sm:px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5';
                btnDashboard.className = 'px-3 sm:px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]';
              }
            }
          }

          // =====================================================================
          // NAVBAR ACTIVE SECTION TRACKING
          // =====================================================================
          let activeSec = 'hero';
          if (progress >= 0.18 && progress < 0.53) {
            activeSec = 'programs';
          } else if (progress >= 0.53) {
            activeSec = 'terminal';
          }

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
      const targetScroll = container.offsetTop + scrollable * 0.35;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }, []);

  const handleSelectSlide = useCallback((slideIdx: number) => {
    const container = containerRef.current;
    if (container) {
      const scrollable = container.offsetHeight - window.innerHeight;
      // slideIdx 0 -> Terminal (progress 0.75), slideIdx 1 -> Dashboard (progress 0.96)
      const targetRatio = slideIdx === 0 ? 0.75 : 0.96;
      const targetScroll = container.offsetTop + scrollable * targetRatio;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }, []);

  const handleScrollToFaq = useCallback(() => {
    const faqEl = document.getElementById('faq');
    if (faqEl) {
      faqEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      id="hero-experience"
      className="relative w-full"
      style={{ height: '580vh' }}
    >
      {/* Pinned Sticky Viewport: Holds the Canvas and the 3 Stage Acts */}
      <div className="sticky top-0 h-screen h-[100dvh] w-full overflow-hidden">
        
        {/* 1. Pinned 240-frame Cosmic Eclipse Canvas */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <HeroScrollCanvas totalFrames={240} containerId="hero-experience" />
        </div>

        {/* 2. Act 1: Hero Section */}
        <div 
          ref={heroLayerRef}
          className="absolute inset-0 z-10 w-full h-full flex items-center justify-start pointer-events-auto will-change-transform will-change-opacity"
          style={{ transition: 'none' }}
        >
          <Hero 
            onOpenTerminal={onOpenTerminal} 
            onNavigateToPlans={handleScrollToPrograms} 
          />
        </div>

        {/* 3. Act 2: Programs (Account Types) Section */}
        <div 
          ref={programsLayerRef}
          className="absolute inset-0 z-10 w-full h-full flex items-center justify-center pointer-events-none will-change-transform will-change-opacity"
          style={{ opacity: 0, transform: 'translate3d(0, 50px, 0) scale(0.96)', visibility: 'hidden', transition: 'none' }}
        >
          <ProgramsSection />
        </div>

        {/* 4. Act 3: Terminal Stage (Translucent Glass Overlay with Circular Clip Hole) */}
        <div 
          ref={terminalStageRef}
          className="absolute inset-0 z-20 w-full h-full bg-black/40 backdrop-blur-[2px] flex items-center justify-center overflow-hidden pointer-events-none will-change-[clip-path]"
          style={{ clipPath: 'circle(0px at 50% 50%)', visibility: 'hidden', transition: 'none' }}
        >
          {/* Terminal & Real-Time Dashboard Horizontal Showcase */}
          <TerminalSection 
            onNavigateToPlans={handleScrollToPrograms}
            onScrollToFaq={handleScrollToFaq}
            onSelectSlide={handleSelectSlide}
          />
        </div>

        {/* 5. Minimalist Crisp Event Horizon Rim with Quantum Dashed Orbital Filament */}
        <div
          ref={vortexRimRef}
          className="absolute pointer-events-none z-30 flex items-center justify-center will-change-transform"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            visibility: 'hidden'
          }}
        >
          <div 
            ref={vortexRimInnerRef}
            className="relative rounded-full flex items-center justify-center will-change-transform border border-white/25 sm:border-white/35 shadow-[0_0_15px_rgba(0,0,0,0.85),inset_0_0_20px_rgba(0,0,0,0.95)]"
            style={{ width: '0px', height: '0px' }}
          >
            {/* Inner Technical Quantum Dashed Filament */}
            <div className="absolute inset-1 sm:inset-1.5 rounded-full border border-dashed border-amber-400/35 pointer-events-none" />
          </div>
        </div>

        {/* 6. Disintegrating Stardust Particles Canvas along the expanding event horizon edge */}
        <BlackHoleDisintegrationCanvas ref={disintegrationCanvasRef} />

      </div>
    </div>
  );
};
