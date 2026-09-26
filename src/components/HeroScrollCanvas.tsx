import React, { useRef, useEffect, useState, useCallback } from 'react';

interface HeroScrollCanvasProps {
  totalFrames?: number;
  className?: string;
}

export const HeroScrollCanvas: React.FC<HeroScrollCanvasProps> = ({
  totalFrames = 80,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload frames in a non-blocking queue
  useEffect(() => {
    imagesRef.current = new Array(totalFrames).fill(null);

    // 1. Load initial frame immediately for 0ms First Contentful Paint
    const firstImg = new Image();
    firstImg.src = '/hero-sequence/frame_000.webp';
    firstImg.onload = () => {
      imagesRef.current[0] = firstImg;
      setIsLoaded(true);
      renderFrame(0);
    };

    // 2. Preload remaining frames in batches to avoid network congestion
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

    // Use current frame or fallback to closest loaded frame
    let img = imagesRef.current[frameIdx];
    if (!img) {
      for (let offset = 1; offset < totalFrames; offset++) {
        if (frameIdx - offset >= 0 && imagesRef.current[frameIdx - offset]) {
          img = imagesRef.current[frameIdx - offset];
          break;
        }
        if (frameIdx + offset < totalFrames && imagesRef.current[frameIdx + offset]) {
          img = imagesRef.current[frameIdx + offset];
          break;
        }
      }
    }

    if (!img || !img.complete) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.naturalWidth || 960;
    const imgHeight = img.naturalHeight || 540;

    // Compute cover dimensions
    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const renderWidth = imgWidth * scale;
    const renderHeight = imgHeight * scale;
    const renderX = (canvasWidth - renderWidth) / 2;
    const renderY = (canvasHeight - renderHeight) / 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, renderX, renderY, renderWidth, renderHeight);
  }, [totalFrames]);

  // Sync canvas internal resolution with window DPR and client dimensions
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for mobile GPU efficiency
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      renderFrame(Math.round(currentFrameRef.current));
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [renderFrame]);

  // Smooth linear interpolation animation loop
  useEffect(() => {
    const updateLoop = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.05) {
        currentFrameRef.current += diff * 0.18;
        renderFrame(Math.round(currentFrameRef.current));
      }
      rafIdRef.current = requestAnimationFrame(updateLoop);
    };

    rafIdRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [renderFrame]);

  // Scroll handler calculating scroll progress through Hero
  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero');
      if (!heroSection) return;

      const rect = heroSection.getBoundingClientRect();
      const heroHeight = rect.height;
      const scrollY = -rect.top;

      const progress = Math.max(0, Math.min(1, scrollY / (heroHeight * 0.85)));
      targetFrameRef.current = progress * (totalFrames - 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalFrames]);

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
      {/* HTML5 Canvas executing GPU-accelerated video sequence scrub */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover transition-opacity duration-700 will-change-transform"
        style={{ opacity: isLoaded ? 1 : 0 }}
      />

      {/* Atmospheric dark gradient overlays matching NUORBIT reference */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06070B] via-[#06070B]/50 to-[#06070B]/75 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#06070B]/80 via-transparent to-[#06070B]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(56,189,248,0.1),transparent_70%)] pointer-events-none" />
    </div>
  );
};
