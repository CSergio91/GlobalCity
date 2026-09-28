import React, { useRef, useEffect, useState, useCallback } from 'react';

interface HeroScrollCanvasProps {
  totalFrames?: number;
  className?: string;
  scrollProgress?: number;
  containerId?: string;
}

const CACHE_NAME = 'eklipse-sequence-v4';

// Automatically purge legacy caches to prevent stale city video frames
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
  totalFrames = 160,
  className = '',
  scrollProgress,
  containerId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(ImageBitmap | HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const [isFirstFrameReady, setIsFirstFrameReady] = useState(false);

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

    // 2. Priority Chunk: Frames 1 to 24 (Initial scroll horizon)
    const loadPriorityChunk = async () => {
      const priorityPromises: Promise<any>[] = [];
      const priorityLimit = Math.min(25, totalFrames);
      for (let i = 1; i < priorityLimit; i++) {
        priorityPromises.push(loadSingleFrame(i));
      }
      await Promise.allSettled(priorityPromises);

      // 3. Background Chunk: Remaining frames loaded in idle batches
      loadRemainingFrames(priorityLimit);
    };

    const loadRemainingFrames = (startIdx: number) => {
      let currentIdx = startIdx;
      const batchSize = 8;

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
        setTimeout(scheduleNextBatch, 35);
      }
    };

    // Stagger priority load by 30ms to let page finish rendering main layout
    const timer = setTimeout(loadPriorityChunk, 30);

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

    const imgWidth = (frame as any).width || (frame as any).naturalWidth || 1280;
    const imgHeight = (frame as any).height || (frame as any).naturalHeight || 720;
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

  // Smooth lerp loop that ONLY animates towards targetFrame when the user scrolls
  useEffect(() => {
    let lastRenderedFrame = -1;

    const updateLoop = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      
      // Ultra-smooth easing dampener for silky, cinematic transitions
      if (Math.abs(diff) > 0.005) {
        currentFrameRef.current += diff * 0.09;
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
      {/* 
        Instant Pre-Paint Poster (Frame 000 from fondo Eklipse):
        Guarantees 0ms blank time before canvas initializes
      */}
      <img
        src="/eklipse-sequence/frame_000.webp"
        alt="Eklipse Background Poster"
        fetchPriority="high"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${
          isFirstFrameReady ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Hardware-Accelerated Video Sequence Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover transition-opacity duration-500 will-change-transform"
        style={{ opacity: isFirstFrameReady ? 1 : 0 }}
      />

      {/* Atmospheric Cinematic Eclipse Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/45 via-transparent to-slate-950/45 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_35%,rgba(245,158,11,0.06),transparent_80%)] pointer-events-none" />
    </div>
  );
};
