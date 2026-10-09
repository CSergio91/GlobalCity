import React, { useRef, useEffect, useState, useCallback } from 'react';

interface PepeInteractiveLoginCanvasProps {
  focusedField?: 'email' | 'password' | 'captcha' | null;
  facingSide?: 'right' | 'left'; // 'right' when Pepe is on left, 'left' when Pepe is on right
  className?: string;
}

const TOTAL_SUB_FRAMES = 16;
const CACHE_NAME = 'eklipse-pepe-v3';

export const PepeInteractiveLoginCanvas: React.FC<PepeInteractiveLoginCanvasProps> = ({
  focusedField,
  facingSide = 'right',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Loaded frames dictionary
  const framesRef = useRef<{
    center: HTMLImageElement | ImageBitmap | null;
    left: (HTMLImageElement | ImageBitmap | null)[];
    right: (HTMLImageElement | ImageBitmap | null)[];
    up_left: (HTMLImageElement | ImageBitmap | null)[];
    up_right: (HTMLImageElement | ImageBitmap | null)[];
  }>({
    center: null,
    left: new Array(TOTAL_SUB_FRAMES).fill(null),
    right: new Array(TOTAL_SUB_FRAMES).fill(null),
    up_left: new Array(TOTAL_SUB_FRAMES).fill(null),
    up_right: new Array(TOTAL_SUB_FRAMES).fill(null),
  });

  // Default coordinate according to facingSide:
  // If facingSide is 'right' -> target X is +0.85 (towards modal on right)
  // If facingSide is 'left'  -> target X is -0.85 (towards modal on left)
  const defaultTargetX = facingSide === 'right' ? 0.85 : -0.85;

  const targetCoordRef = useRef({ x: defaultTargetX, y: 0.0 });
  const currentCoordRef = useRef({ x: defaultTargetX, y: 0.0 });
  const lastInteractionTimeRef = useRef(Date.now());
  const isIdleRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const [isInitialReady, setIsInitialReady] = useState(true);

  // Update default target when facingSide changes (e.g. switching between Login & Register)
  useEffect(() => {
    targetCoordRef.current = {
      x: facingSide === 'right' ? 0.85 : -0.85,
      y: 0.0,
    };
    lastInteractionTimeRef.current = Date.now();
  }, [facingSide]);

  // Helper to load an individual frame with CacheStorage API for ultra-fast browser disk caching
  const loadFrame = useCallback(async (path: string): Promise<HTMLImageElement | ImageBitmap | null> => {
    // 1. Try CacheStorage API for instant persistent caching
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const fullUrl = new URL(path, window.location.href).toString();
        const cache = await caches.open(CACHE_NAME);
        let resp = await cache.match(fullUrl);
        if (!resp) {
          resp = await fetch(fullUrl);
          if (resp && resp.ok) {
            try {
              cache.put(fullUrl, resp.clone());
            } catch {
              // Ignore cache storage quota errors
            }
          }
        }
        if (resp && resp.ok) {
          const blob = await resp.blob();
          if ('createImageBitmap' in window) {
            return await createImageBitmap(blob);
          }
        }
      } catch {
        // Fallback to Image()
      }
    }

    // 2. Standard HTMLImageElement fallback
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = path;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
  }, []);

  // Preload all frames prioritized
  useEffect(() => {
    let isCancelled = false;

    const preloadAll = async () => {
      try {
        // 1. Load initial frames immediately
        const initialKey = facingSide === 'right' ? '/pepe-login/right_12.webp' : '/pepe-login/left_12.webp';
        const [initialSide, centerImg] = await Promise.all([
          loadFrame(initialKey),
          loadFrame('/pepe-login/center.webp'),
        ]);

        if (isCancelled) return;
        if (facingSide === 'right') {
          framesRef.current.right[12] = initialSide;
        } else {
          framesRef.current.left[12] = initialSide;
        }
        framesRef.current.center = centerImg;
        setIsInitialReady(true);

        // 2. Load Right & Left frames
        for (let i = 0; i < TOTAL_SUB_FRAMES; i++) {
          if (isCancelled) return;
          const idxStr = String(i).padStart(2, '0');
          if (!framesRef.current.right[i]) {
            framesRef.current.right[i] = await loadFrame(`/pepe-login/right_${idxStr}.webp`);
          }
          if (!framesRef.current.left[i]) {
            framesRef.current.left[i] = await loadFrame(`/pepe-login/left_${idxStr}.webp`);
          }
        }

        // 3. Load Up-Right & Up-Left frames
        for (let i = 0; i < TOTAL_SUB_FRAMES; i++) {
          if (isCancelled) return;
          const idxStr = String(i).padStart(2, '0');
          if (!framesRef.current.up_right[i]) {
            framesRef.current.up_right[i] = await loadFrame(`/pepe-login/up_right_${idxStr}.webp`);
          }
          if (!framesRef.current.up_left[i]) {
            framesRef.current.up_left[i] = await loadFrame(`/pepe-login/up_left_${idxStr}.webp`);
          }
        }
      } catch (err) {
        console.warn('[PepeInteractiveLoginCanvas] Frame preload warning:', err);
      } finally {
        setIsInitialReady(true);
      }
    };

    preloadAll();

    return () => {
      isCancelled = true;
    };
  }, [loadFrame, facingSide]);

  // Focus easter eggs
  useEffect(() => {
    if (focusedField === 'password') {
      // Pepe looks up and away playfully ("I'm not looking at your password!")
      targetCoordRef.current = {
        x: facingSide === 'right' ? -0.5 : 0.5,
        y: 0.9,
      };
      lastInteractionTimeRef.current = Date.now();
    } else if (focusedField === 'email' || focusedField === 'captcha') {
      // Pepe focuses intently on the form
      targetCoordRef.current = {
        x: facingSide === 'right' ? 0.95 : -0.95,
        y: 0.0,
      };
      lastInteractionTimeRef.current = Date.now();
    } else {
      targetCoordRef.current = {
        x: facingSide === 'right' ? 0.85 : -0.85,
        y: 0.0,
      };
      lastInteractionTimeRef.current = Date.now();
    }
  }, [focusedField, facingSide]);

  // Global mouse & touch tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.45; // eye level

      const maxDeltaX = window.innerWidth * 0.45;
      const maxDeltaY = window.innerHeight * 0.45;

      const rawX = (e.clientX - centerX) / (maxDeltaX || 1);
      const rawY = (centerY - e.clientY) / (maxDeltaY || 1); // positive is UP

      targetCoordRef.current = {
        x: Math.max(-1, Math.min(1, rawX)),
        y: Math.max(-1, Math.min(1, rawY)),
      };
      lastInteractionTimeRef.current = Date.now();
      isIdleRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0 || !containerRef.current) return;
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.45;

      const rawX = (touch.clientX - centerX) / (window.innerWidth * 0.4 || 1);
      const rawY = (centerY - touch.clientY) / (window.innerHeight * 0.4 || 1);

      targetCoordRef.current = {
        x: Math.max(-1, Math.min(1, rawX)),
        y: Math.max(-1, Math.min(1, rawY)),
      };
      lastInteractionTimeRef.current = Date.now();
      isIdleRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Main 60 FPS Canvas Render Loop with Organic Idle Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const now = Date.now();
      const idleTime = now - lastInteractionTimeRef.current;

      // ORGANIC IDLE ANIMATION:
      // If user stops moving mouse for > 1.8s and no input is focused,
      // Pepe naturally animates, shifts gaze, breathes, and tilts his head!
      if (idleTime > 1800 && !focusedField) {
        isIdleRef.current = true;
        const timeSec = now * 0.001;

        if (facingSide === 'right') {
          // Base gaze towards modal on right (+0.75 to +0.95), with gentle breathing oscillation
          const gazeShift = Math.sin(timeSec * 0.8) * 0.12; // slow gaze shift
          const headBob = Math.cos(timeSec * 1.6) * 0.08;   // rhythmic breathing tilt
          const occasionalUp = Math.sin(timeSec * 0.3) > 0.7 ? 0.35 : 0.0; // occasional glance up

          targetCoordRef.current = {
            x: 0.82 + gazeShift,
            y: headBob + occasionalUp,
          };
        } else {
          // Base gaze towards modal on left (-0.75 to -0.95)
          const gazeShift = Math.sin(timeSec * 0.8) * 0.12;
          const headBob = Math.cos(timeSec * 1.6) * 0.08;
          const occasionalUp = Math.sin(timeSec * 0.3) > 0.7 ? 0.35 : 0.0;

          targetCoordRef.current = {
            x: -0.82 - gazeShift,
            y: headBob + occasionalUp,
          };
        }
      }

      // Snappy lerp when user is active (0.28), softer cinematic easing when idle (0.08)
      const lerpFactor = isIdleRef.current ? 0.08 : 0.28;
      const current = currentCoordRef.current;
      const target = targetCoordRef.current;
      current.x += (target.x - current.x) * 0.28; // always responsive to prevent lag
      current.y += (target.y - current.y) * 0.28;

      const curX = current.x;
      const curY = current.y;

      let selectedFrame: HTMLImageElement | ImageBitmap | null = null;

      // 1. Vertical UP detection (curY > 0.22)
      if (curY > 0.22) {
        const upProgress = Math.min(1, Math.max(0, (curY - 0.15) / 0.85));
        const frameIndex = Math.min(TOTAL_SUB_FRAMES - 1, Math.round(upProgress * (TOTAL_SUB_FRAMES - 1)));

        if (curX >= 0) {
          selectedFrame = framesRef.current.up_right[frameIndex] || framesRef.current.right[frameIndex];
        } else {
          selectedFrame = framesRef.current.up_left[frameIndex] || framesRef.current.left[frameIndex];
        }
      } 
      // 2. Horizontal RIGHT (curX > 0.04)
      else if (curX > 0.04) {
        const rightProgress = Math.min(1, Math.max(0, curX));
        const frameIndex = Math.min(TOTAL_SUB_FRAMES - 1, Math.round(rightProgress * (TOTAL_SUB_FRAMES - 1)));
        selectedFrame = framesRef.current.right[frameIndex] || framesRef.current.center;
      } 
      // 3. Horizontal LEFT (curX < -0.04)
      else if (curX < -0.04) {
        const leftProgress = Math.min(1, Math.max(0, Math.abs(curX)));
        const frameIndex = Math.min(TOTAL_SUB_FRAMES - 1, Math.round(leftProgress * (TOTAL_SUB_FRAMES - 1)));
        selectedFrame = framesRef.current.left[frameIndex] || framesRef.current.center;
      } 
      // 4. Center
      else {
        selectedFrame = framesRef.current.center;
      }

      if (!selectedFrame) {
        selectedFrame = facingSide === 'right' 
          ? (framesRef.current.right[12] || framesRef.current.center)
          : (framesRef.current.left[12] || framesRef.current.center);
      }

      // Render onto Canvas
      if (selectedFrame) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const displayWidth = Math.round(rect.width * dpr);
        const displayHeight = Math.round(rect.height * dpr);

        if (displayWidth > 0 && displayHeight > 0) {
          if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(selectedFrame as CanvasImageSource, 0, 0, canvas.width, canvas.height);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    rafIdRef.current = animId;

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [focusedField, facingSide]);

  return (
    <div 
      ref={containerRef} 
      className={`relative select-none pointer-events-none w-full h-full flex items-end justify-center ${className}`}
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain pointer-events-none transition-opacity duration-300 ${
          isInitialReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
