import React, { useRef, useEffect, useState, useCallback } from 'react';

interface HeroScrollCanvasProps {
  totalFrames?: number;
  className?: string;
  scrollProgress?: number;
  containerId?: string;
}

const CACHE_NAME = 'eklipse-sequence-v5';

// Automatically purge legacy caches to prevent stale video frames
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((k) => {
      if (k !== CACHE_NAME && (k.startsWith('eklipse-') || k.startsWith('globalcity-'))) {
        caches.delete(k);
      }
    });
  });
}

export const HeroScrollCanvas: React.FC<HeroScrollCanvasProps> = ({
  totalFrames = 240,
  className = '',
  scrollProgress,
  containerId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerWrapperRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<(ImageBitmap | HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const [isFirstFrameReady, setIsFirstFrameReady] = useState(false);

  // Mouse tracking for silky 3D parallax and celestial lighting
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Helper: Load a single frame through persistent CacheStorage + ImageBitmap
  const loadSingleFrame = useCallback(async (idx: number): Promise<ImageBitmap | HTMLImageElement | null> => {
    const relativeUrl = `/eklipse-sequence/frame_${String(idx).padStart(3, '0')}.webp`;

    // 1. Try CacheStorage API for instant disk persistence
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const fullUrl = new URL(relativeUrl, window.location.href).toString();
        const cache = await caches.open(CACHE_NAME);
        let resp = await cache.match(fullUrl);
        if (!resp) {
          resp = await fetch(fullUrl);
          if (resp.ok) {
            try {
              cache.put(fullUrl, resp.clone());
            } catch {
              // Ignore cache storage quota or scheme errors
            }
          }
        }
        if (resp && resp.ok) {
          const blob = await resp.blob();
          if ('createImageBitmap' in window) {
            const bitmap = await createImageBitmap(blob);
            framesRef.current[idx] = bitmap;
            return bitmap;
          }
        }
      } catch {
        // Fallback to standard Image if CacheStorage fails or is restricted
      }
    }

    // 2. Standard HTMLImageElement fallback
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = relativeUrl;
      img.onload = () => {
        framesRef.current[idx] = img;
        resolve(img);
      };
      img.onerror = () => {
        resolve(null);
      };
    });
  }, []);

  // Preload sequence frames in an optimized, non-blocking prioritized queue
  useEffect(() => {
    framesRef.current = new Array(totalFrames).fill(null);

    // 1. Load initial frame (0) immediately for instant 0ms LCP
    loadSingleFrame(0).then((frame) => {
      if (frame) {
        setIsFirstFrameReady(true);
        renderFrame(0);
      }
    });

    // 2. Priority Chunk: Frames 1 to 32 (Initial scroll horizon)
    const loadPriorityChunk = async () => {
      const priorityPromises: Promise<any>[] = [];
      const priorityLimit = Math.min(32, totalFrames);
      for (let i = 1; i < priorityLimit; i++) {
        priorityPromises.push(loadSingleFrame(i));
      }
      await Promise.allSettled(priorityPromises);

      // 3. Background Chunk: Remaining frames loaded in idle batches
      loadRemainingFrames(priorityLimit);
    };

    const loadRemainingFrames = (startIdx: number) => {
      let currentIdx = startIdx;
      const batchSize = 10;

      const scheduleNextBatch = () => {
        if (currentIdx >= totalFrames) return;
        const end = Math.min(currentIdx + batchSize, totalFrames);
        const batchPromises: Promise<any>[] = [];
        for (let i = currentIdx; i < end; i++) {
          batchPromises.push(loadSingleFrame(i));
        }
        currentIdx = end;

        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(scheduleNextBatch);
        } else {
          setTimeout(scheduleNextBatch, 20);
        }
      };

      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(scheduleNextBatch);
      } else {
        setTimeout(scheduleNextBatch, 30);
      }
    };

    // Stagger priority load by 20ms to allow layout bootstrap
    const timer = setTimeout(loadPriorityChunk, 20);

    return () => {
      clearTimeout(timer);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [totalFrames, loadSingleFrame]);

  // Render a specific frame on canvas with object-fit: cover math
  const renderFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clampedIdx = Math.max(0, Math.min(totalFrames - 1, Math.round(frameIdx)));
    let frame = framesRef.current[clampedIdx];

    // Fallback to nearest loaded frame if current frame is still downloading
    if (!frame) {
      for (let offset = 1; offset < totalFrames; offset++) {
        if (clampedIdx - offset >= 0 && framesRef.current[clampedIdx - offset]) {
          frame = framesRef.current[clampedIdx - offset];
          break;
        }
        if (clampedIdx + offset < totalFrames && framesRef.current[clampedIdx + offset]) {
          frame = framesRef.current[clampedIdx + offset];
          break;
        }
      }
    }

    if (!frame) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    if (canvasWidth <= 0 || canvasHeight <= 0) return;

    const imgWidth = (frame as any).width || (frame as any).naturalWidth || 1600;
    const imgHeight = (frame as any).height || (frame as any).naturalHeight || 900;
    if (imgWidth <= 0 || imgHeight <= 0) return;

    // High quality aspect ratio cover scaling
    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const renderWidth = imgWidth * scale;
    const renderHeight = imgHeight * scale;
    const renderX = (canvasWidth - renderWidth) / 2;
    const renderY = (canvasHeight - renderHeight) / 2;

    try {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(frame as any, renderX, renderY, renderWidth, renderHeight);
    } catch {
      // Guard against potential drawImage exception
    }
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

    window.addEventListener('resize', handleResize, { passive: true });
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
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollProgress, totalFrames, containerId]);

  // Track mouse movement for subtle, cinematic 3D parallax tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to +1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to +1
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth lerp loop that animates towards targetFrame on scroll & adds mouse parallax
  useEffect(() => {
    let lastRenderedFrame = -1;

    const updateLoop = () => {
      // 1. Scroll-driven frame interpolation
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.005) {
        currentFrameRef.current += diff * 0.085;
        const frameToRender = Math.round(currentFrameRef.current);
        if (frameToRender !== lastRenderedFrame) {
          renderFrame(frameToRender);
          lastRenderedFrame = frameToRender;
        }
      }

      // 2. Mouse-driven silky 3D perspective parallax (only update if delta is significant)
      const m = mouseRef.current;
      const dx = m.targetX - m.x;
      const dy = m.targetY - m.y;
      
      if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
        m.x += dx * 0.06;
        m.y += dy * 0.06;

        if (containerWrapperRef.current) {
          const tiltX = -m.y * 2.2; // degrees
          const tiltY = m.x * 2.8;  // degrees
          const panX = m.x * 6;     // pixels
          const panY = m.y * 5;     // pixels
          containerWrapperRef.current.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translate3d(${panX.toFixed(1)}px, ${panY.toFixed(1)}px, 0) scale(1.025)`;
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
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* 3D Parallax Transform Wrapper (Clean GPU composition, no CSS transition fighting) */}
      <div 
        ref={containerWrapperRef}
        className="w-full h-full will-change-transform transform-gpu"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 
          Instant Pre-Paint Poster (hero.webp):
          Enhanced 1080p WebP matching Frame 000 for instant 0ms LCP
        */}
        <img
          src="/hero.webp"
          alt="Eklipse Background Hero Poster"
          fetchPriority="high"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${
            isFirstFrameReady ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Hardware-Accelerated Video Sequence Canvas (240 Frames) */}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover transition-opacity duration-500 will-change-transform"
          style={{ opacity: isFirstFrameReady ? 1 : 0 }}
        />
      </div>

      {/* Atmospheric Cinematic Eclipse Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06070B] via-transparent to-[#06070B]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#06070B]/60 via-transparent to-[#06070B]/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_35%,rgba(245,158,11,0.08),transparent_80%)] pointer-events-none" />
    </div>
  );
};
