import React, { useEffect, useRef } from 'react';

export const CelestialCursor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only activate on fine pointer devices (desktop with mouse)
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const container = containerRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!container || !dot || !ring) return;

    let animFrame: number | null = null;
    let targetX = -100;
    let targetY = -100;
    let currentDotX = -100;
    let currentDotY = -100;
    let currentRingX = -100;
    let currentRingY = -100;
    let isVisible = false;
    let isHovering = false;
    let isDown = false;
    let isRunning = false;

    const startLoop = () => {
      if (isRunning) return;
      isRunning = true;
      animFrame = requestAnimationFrame(render);
    };

    const render = () => {
      // Fluid lerp tracking
      const dDotX = targetX - currentDotX;
      const dDotY = targetY - currentDotY;
      const dRingX = targetX - currentRingX;
      const dRingY = targetY - currentRingY;

      currentDotX += dDotX * 0.75;
      currentDotY += dDotY * 0.75;
      currentRingX += dRingX * 0.22;
      currentRingY += dRingY * 0.22;

      dot.style.transform = `translate3d(${currentDotX}px, ${currentDotY}px, 0)`;
      ring.style.transform = `translate3d(${currentRingX}px, ${currentRingY}px, 0)`;

      // If motion has settled and mouse is still, pause RAF to save 100% CPU/GPU
      if (Math.abs(dDotX) < 0.1 && Math.abs(dDotY) < 0.1 && Math.abs(dRingX) < 0.1 && Math.abs(dRingY) < 0.1) {
        isRunning = false;
        animFrame = null;
        return;
      }

      animFrame = requestAnimationFrame(render);
    };

    let lastCheckTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        container.style.opacity = '1';
      }

      // Throttle closest() DOM lookup to at most once per 60ms
      const now = performance.now();
      if (now - lastCheckTime > 60) {
        lastCheckTime = now;
        const target = e.target as HTMLElement | null;
        const clickable = target ? target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer') : null;
        const shouldHover = !!clickable;
        if (shouldHover !== isHovering) {
          isHovering = shouldHover;
          if (isHovering) {
            ring.className = 'fixed top-0 left-0 -ml-5 -mt-5 w-10 h-10 rounded-full border border-indigo-400 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-[width,height,margin,border-color,background-color] duration-150 ease-out flex items-center justify-center';
            dot.className = 'fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-indigo-300 shadow-[0_0_10px_#A5B4FC] transition-transform duration-100 ease-out';
          } else {
            ring.className = 'fixed top-0 left-0 -ml-3.5 -mt-3.5 w-7 h-7 rounded-full border border-white/40 bg-white/[0.02] shadow-[0_0_8px_rgba(255,255,255,0.15)] transition-[width,height,margin,border-color,background-color] duration-150 ease-out flex items-center justify-center';
            dot.className = 'fixed top-0 left-0 -ml-[3px] -mt-[3px] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-transform duration-100 ease-out';
          }
        }
      }

      startLoop();
    };

    const handleMouseDown = () => {
      isDown = true;
      ring.style.transform += ' scale(0.85)';
      startLoop();
    };

    const handleMouseUp = () => {
      isDown = false;
      startLoop();
    };

    const handleMouseLeave = () => {
      isVisible = false;
      container.style.opacity = '0';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none opacity-0 transition-opacity duration-300 will-change-transform"
    >
      {/* 1. Outer Orbital Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 -ml-3.5 -mt-3.5 w-7 h-7 rounded-full border border-white/40 bg-white/[0.02] shadow-[0_0_8px_rgba(255,255,255,0.15)] will-change-transform"
      />

      {/* 2. Precision Core Star Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-[3px] -mt-[3px] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] will-change-transform"
      />
    </div>
  );
};
