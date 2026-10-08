import React, { useRef, useEffect, useState, useCallback } from 'react';

interface PepeInteractiveLoginCanvasProps {
  focusedField?: 'email' | 'password' | 'captcha' | null;
  className?: string;
}

const TOTAL_SUB_FRAMES = 16;

export const PepeInteractiveLoginCanvas: React.FC<PepeInteractiveLoginCanvasProps> = ({
  focusedField,
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

  // State coordinates: X in [-1 (left), +1 (right)], Y in [-1 (down), +1 (up)]
  // Initial target is pointing RIGHT (+0.85, 0.0) directly towards the login form
  const targetCoordRef = useRef({ x: 0.85, y: 0.0 });
  const currentCoordRef = useRef({ x: 0.85, y: 0.0 });
  const lastInteractionTimeRef = useRef(Date.now());
  const rafIdRef = useRef<number | null>(null);

  const [isInitialReady, setIsInitialReady] = useState(false);

  // Helper to load an individual frame
  const loadFrame = useCallback(async (path: string): Promise<HTMLImageElement | ImageBitmap | null> => {
    try {
      if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
        const resp = await fetch(path);
        if (resp.ok) {
          const blob = await resp.blob();
          return await createImageBitmap(blob);
        }
      }
    } catch {
      // Fallback
    }

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
      // 1. Initial essential frames
      const [initialRight, centerImg] = await Promise.all([
        loadFrame('/pepe-login/right_12.webp'),
        loadFrame('/pepe-login/center.webp'),
      ]);

      if (isCancelled) return;
      framesRef.current.right[12] = initialRight;
      framesRef.current.center = centerImg;
      setIsInitialReady(true);

      // 2. Load Right frames (towards form)
      for (let i = 0; i < TOTAL_SUB_FRAMES; i++) {
        if (isCancelled) return;
        if (!framesRef.current.right[i]) {
          const idxStr = String(i).padStart(2, '0');
          framesRef.current.right[i] = await loadFrame(`/pepe-login/right_${idxStr}.webp`);
        }
      }

      // 3. Load Up-Right frames (top right)
      for (let i = 0; i < TOTAL_SUB_FRAMES; i++) {
        if (isCancelled) return;
        const idxStr = String(i).padStart(2, '0');
        framesRef.current.up_right[i] = await loadFrame(`/pepe-login/up_right_${idxStr}.webp`);
      }

      // 4. Load Up-Left frames (top left)
      for (let i = 0; i < TOTAL_SUB_FRAMES; i++) {
        if (isCancelled) return;
        const idxStr = String(i).padStart(2, '0');
        framesRef.current.up_left[i] = await loadFrame(`/pepe-login/up_left_${idxStr}.webp`);
      }

      // 5. Load Left frames (left)
      for (let i = 0; i < TOTAL_SUB_FRAMES; i++) {
        if (isCancelled) return;
        const idxStr = String(i).padStart(2, '0');
        framesRef.current.left[i] = await loadFrame(`/pepe-login/left_${idxStr}.webp`);
      }
    };

    preloadAll();

    return () => {
      isCancelled = true;
    };
  }, [loadFrame]);

  // Handle focus changes (Easter eggs and form gaze)
  useEffect(() => {
    if (focusedField === 'password') {
      // Pepe looks up and away playfully ("I'm not peeking!")
      targetCoordRef.current = { x: -0.5, y: 0.9 };
      lastInteractionTimeRef.current = Date.now();
    } else if (focusedField === 'email' || focusedField === 'captcha') {
      // Pepe focuses intently on the form
      targetCoordRef.current = { x: 0.95, y: 0.0 };
      lastInteractionTimeRef.current = Date.now();
    } else {
      // Default gaze looking at form
      targetCoordRef.current = { x: 0.85, y: 0.0 };
      lastInteractionTimeRef.current = Date.now();
    }
  }, [focusedField]);

  // Global mouse & touch tracker with immediate responsive normalized coordinates
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
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Main 60 FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // pure solid black canvas context
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const now = Date.now();
      // If idle for 4s and no field focused, return to looking at the form
      if (now - lastInteractionTimeRef.current > 4000 && !focusedField) {
        const idleWobble = Math.sin(now * 0.002) * 0.05;
        targetCoordRef.current = {
          x: 0.85 + idleWobble,
          y: Math.cos(now * 0.002) * 0.04,
        };
      }

      // Fast, agile Lerp (0.26)
      const current = currentCoordRef.current;
      const target = targetCoordRef.current;
      current.x += (target.x - current.x) * 0.26;
      current.y += (target.y - current.y) * 0.26;

      const curX = current.x;
      const curY = current.y;

      let selectedFrame: HTMLImageElement | ImageBitmap | null = null;

      // 1. Vertical UP detection (curY > 0.22)
      if (curY > 0.22) {
        const upProgress = Math.min(1, Math.max(0, (curY - 0.15) / 0.85));
        const frameIndex = Math.min(TOTAL_SUB_FRAMES - 1, Math.round(upProgress * (TOTAL_SUB_FRAMES - 1)));

        // If cursor is on the right, use UP-RIGHT!
        if (curX >= 0) {
          selectedFrame = framesRef.current.up_right[frameIndex] || framesRef.current.right[frameIndex];
        } else {
          // If cursor is on the left, use UP-LEFT!
          selectedFrame = framesRef.current.up_left[frameIndex] || framesRef.current.left[frameIndex];
        }
      } 
      // 2. Horizontal RIGHT (curX > 0.04) -> looking at form
      else if (curX > 0.04) {
        const rightProgress = Math.min(1, Math.max(0, curX));
        const frameIndex = Math.min(TOTAL_SUB_FRAMES - 1, Math.round(rightProgress * (TOTAL_SUB_FRAMES - 1)));
        selectedFrame = framesRef.current.right[frameIndex] || framesRef.current.center;
      } 
      // 3. Horizontal LEFT (curX < -0.04) -> looking left
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
        selectedFrame = framesRef.current.right[12] || framesRef.current.center;
      }

      // Render onto Canvas: Pure direct blit without artificial vignette
      if (selectedFrame) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const displayWidth = Math.round(rect.width * dpr);
        const displayHeight = Math.round(rect.height * dpr);

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
          canvas.width = displayWidth;
          canvas.height = displayHeight;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        // Draw image directly at native quality: its background is pure #000000 matching page #000000
        ctx.drawImage(selectedFrame as CanvasImageSource, 0, 0, canvas.width, canvas.height);
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
  }, [focusedField]);

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
