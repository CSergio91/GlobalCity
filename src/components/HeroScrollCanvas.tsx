import React, { useRef, useEffect, useState, useCallback } from 'react';

interface HeroScrollCanvasProps {
  totalFrames?: number;
  className?: string;
  scrollProgress?: number;
  containerId?: string;
}

export const HeroScrollCanvas: React.FC<HeroScrollCanvasProps> = ({
  totalFrames = 80,
  className = '',
  scrollProgress,
  containerId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload sequence frames in an optimized, non-blocking queue
  useEffect(() => {
    imagesRef.current = new Array(totalFrames).fill(null);

    // 1. Load initial frame immediately for instant LCP
    const firstImg = new Image();
    firstImg.src = '/hero-sequence/frame_000.webp';
    firstImg.onload = () => {
      imagesRef.current[0] = firstImg;
      setIsLoaded(true);
      renderFrame(0);
    };

    // 2. Preload remaining sequence in background
    const loadRemainingFrames = () => {
      for (let i = 1; i < totalFrames; i++) {
        const img = new Image();
        img.src = `/hero-sequence/frame_${String(i).padStart(3, '0')}.webp`;
        img.onload = () => {
          imagesRef.current[i] = img;
        };
      }
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadRemainingFrames);
    } else {
      setTimeout(loadRemainingFrames, 100);
    }

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [totalFrames]);

  // Render a specific frame on canvas with object-fit: cover math
  const renderFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clampedIdx = Math.max(0, Math.min(totalFrames - 1, Math.round(frameIdx)));
    let img = imagesRef.current[clampedIdx];

    // Fallback to nearest loaded frame if current frame is loading
    if (!img || !img.complete) {
      for (let offset = 1; offset < totalFrames; offset++) {
        if (clampedIdx - offset >= 0 && imagesRef.current[clampedIdx - offset]?.complete) {
          img = imagesRef.current[clampedIdx - offset];
          break;
        }
        if (clampedIdx + offset < totalFrames && imagesRef.current[clampedIdx + offset]?.complete) {
          img = imagesRef.current[clampedIdx + offset];
          break;
        }
      }
    }

    if (!img || !img.complete) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.naturalWidth || 960;
    const imgHeight = img.naturalHeight || 540;

    // High quality aspect ratio cover scaling
    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const renderWidth = imgWidth * scale;
    const renderHeight = imgHeight * scale;
    const renderX = (canvasWidth - renderWidth) / 2;
    const renderY = (canvasHeight - renderHeight) / 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, renderX, renderY, renderWidth, renderHeight);
  }, [totalFrames]);

  // Sync canvas internal resolution with DPR
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = (rect.width || window.innerWidth) * dpr;
      canvas.height = (rect.height || window.innerHeight) * dpr;
      renderFrame(currentFrameRef.current);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [renderFrame]);

  // Handle external scroll progress or local scroll listener
  useEffect(() => {
    if (typeof scrollProgress === 'number') {
      targetFrameRef.current = Math.max(0, Math.min(1, scrollProgress)) * (totalFrames - 1);
      return;
    }

    const handleScroll = () => {
      const container = (containerId ? document.getElementById(containerId) : null) || 
                        document.getElementById('hero-experience') || 
                        document.getElementById('hero');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollableHeight = rect.height - window.innerHeight;
      if (scrollableHeight <= 0) {
        targetFrameRef.current = 0;
        return;
      }

      const progress = Math.max(0, Math.min(1, -rect.top / scrollableHeight));
      targetFrameRef.current = progress * (totalFrames - 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to sync initial scroll position
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollProgress, totalFrames, containerId]);

  // Smooth lerp loop that ONLY animates towards targetFrame when the user scrolls
  useEffect(() => {
    let lastRenderedFrame = -1;

    const updateLoop = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      
      // Only compute and re-render if there is actual scroll movement
      if (Math.abs(diff) > 0.005) {
        currentFrameRef.current += diff * 0.25;
        const frameToRender = Math.round(currentFrameRef.current);
        if (frameToRender !== lastRenderedFrame) {
          renderFrame(frameToRender);
          lastRenderedFrame = frameToRender;
        }
      }

      rafIdRef.current = requestAnimationFrame(updateLoop);
    };

    rafIdRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [renderFrame]);

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Hardware-Accelerated Video Sequence Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover transition-opacity duration-500 will-change-transform"
        style={{ opacity: isLoaded ? 1 : 0 }}
      />

      {/* Balanced Atmospheric Overlays: Keeps the neon city vibrant while guaranteeing text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06070B] via-black/25 to-[#06070B]/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#06070B]/50 via-transparent to-[#06070B]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_35%,rgba(56,189,248,0.12),transparent_75%)] pointer-events-none" />
    </div>
  );
};
