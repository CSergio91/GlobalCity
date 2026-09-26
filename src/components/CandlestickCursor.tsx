import React, { useEffect, useState, useRef } from 'react';

export const CandlestickCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [isIdle, setIsIdle] = useState(false);
  const [idleStep, setIdleStep] = useState(0);

  const lastY = useRef(-100);
  const idleTimerRef = useRef<any>(null);
  const simIntervalRef = useRef<any>(null);

  useEffect(() => {
    // Only activate on fine pointer devices (desktop with mouse)
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    let animFrame: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const startIdleMarketSimulation = () => {
      setIsIdle(true);
      setIdleStep(0);

      // Lightweight sequence simulating green calm rally then sudden red velón
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      
      let step = 0;
      simIntervalRef.current = setInterval(() => {
        step = (step + 1) % 6;
        setIdleStep(step);
      }, 650);
    };

    const resetIdleTimer = () => {
      setIsIdle(false);
      setIdleStep(0);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);

      // Trigger idle market simulation when mouse is still for 750ms
      idleTimerRef.current = setTimeout(startIdleMarketSimulation, 750);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setIsVisible(true);

      const dy = e.clientY - lastY.current;
      if (Math.abs(dy) > 2) {
        setDirection(dy < 0 ? 'up' : 'down');
      }
      lastY.current = e.clientY;

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer');
        setIsPointer(!!isClickable);
      }

      resetIdleTimer();
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsIdle(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };

    const render = () => {
      // Natural fluid lerp tracking
      currentX += (targetX - currentX) * 0.45;
      currentY += (targetY - currentY) * 0.45;

      setPos({ x: currentX, y: currentY });
      animFrame = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    animFrame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animFrame);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  if (!isVisible || pos.x < 0) return null;

  return (
    <div 
      className="fixed pointer-events-none z-[9999] select-none will-change-transform"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        left: 0,
        top: 0
      }}
    >
      {/* Precision Core Aim Dot */}
      <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.95)] opacity-90" />

      {/* When mouse is ACTIVE / MOVING: Dual Candlesticks (Green Bull & Red Bear) */}
      {!isIdle && (
        <div 
          className={`absolute left-3.5 -top-2.5 flex items-center gap-1.5 transition-transform duration-150 ${
            isPointer ? 'scale-125' : 'scale-100'
          }`}
        >
          {/* 1. Green Bullish Candlestick */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-[1.5px] h-1.5 bg-emerald-400" />
            <div 
              className={`w-2 rounded-[1.5px] bg-emerald-400 transition-all duration-150 ${
                direction === 'up' 
                  ? 'h-4 bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,1)]' 
                  : 'h-3 shadow-[0_0_6px_rgba(52,211,153,0.7)]'
              }`} 
            />
            <div className="w-[1.5px] h-1.5 bg-emerald-400" />
          </div>

          {/* 2. Red Bearish Candlestick */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-[1.5px] h-1.5 bg-rose-500" />
            <div 
              className={`w-2 rounded-[1.5px] bg-rose-500 transition-all duration-150 ${
                direction === 'down' 
                  ? 'h-4 bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,1)]' 
                  : 'h-3 shadow-[0_0_6px_rgba(244,63,94,0.7)]'
              }`} 
            />
            <div className="w-[1.5px] h-1.5 bg-rose-500" />
          </div>
        </div>
      )}

      {/* When mouse is IDLE / STILL: Live Market Simulation: Subida tranquila de compras y repentino velón rojo */}
      {isIdle && (
        <div className="absolute left-3.5 -top-6 flex items-end gap-1.5 animate-fadeIn">
          {/* Candle 1 (Green pump 1) */}
          {idleStep >= 0 && (
            <div className="flex flex-col items-center justify-end transform translate-y-1 transition-all duration-200">
              <div className="w-[1.5px] h-1 bg-emerald-400" />
              <div className="w-2 h-2.5 rounded-[1px] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <div className="w-[1.5px] h-1 bg-emerald-400" />
            </div>
          )}

          {/* Candle 2 (Green pump 2, higher) */}
          {idleStep >= 1 && (
            <div className="flex flex-col items-center justify-end transform -translate-y-1 transition-all duration-200">
              <div className="w-[1.5px] h-1.5 bg-emerald-400" />
              <div className="w-2 h-3.5 rounded-[1px] bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              <div className="w-[1.5px] h-1 bg-emerald-400" />
            </div>
          )}

          {/* Candle 3 (Green pump 3, ATH rally) */}
          {idleStep >= 2 && (
            <div className="flex flex-col items-center justify-end transform -translate-y-3 transition-all duration-200">
              <div className="w-[1.5px] h-2 bg-emerald-300" />
              <div className="w-2.5 h-4.5 rounded-[1px] bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,1)]" />
              <div className="w-[1.5px] h-1 bg-emerald-400" />
            </div>
          )}

          {/* Candle 4 (Green pump 4 peak) */}
          {idleStep >= 3 && (
            <div className="flex flex-col items-center justify-end transform -translate-y-5 transition-all duration-200">
              <div className="w-[1.5px] h-2.5 bg-emerald-300" />
              <div className="w-2.5 h-5 rounded-[1px] bg-emerald-300 shadow-[0_0_16px_rgba(52,211,153,1)]" />
              <div className="w-[1.5px] h-1.5 bg-emerald-300" />
            </div>
          )}

          {/* Candle 5: ¡VELÓN ROJO REPENTINO! (Sudden long dump candle) */}
          {idleStep >= 4 && (
            <div className="flex flex-col items-center justify-start transform translate-y-3 transition-all duration-150 animate-bounce">
              <div className="w-[1.5px] h-2 bg-rose-500" />
              <div className="w-3 h-8 rounded-[1px] bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,1)] animate-pulse" />
              <div className="w-[1.5px] h-4 bg-rose-500" />
            </div>
          )}

          {/* Micro HUD pill with real-time percentage */}
          <div className="ml-1 mb-1 font-mono text-[9px] font-black px-1.5 py-0.5 rounded backdrop-blur-md border border-white/20 leading-none">
            {idleStep < 4 ? (
              <span className="text-emerald-400 font-bold">
                +{((idleStep + 1) * 0.85).toFixed(2)}% ▲
              </span>
            ) : (
              <span className="text-rose-400 font-bold animate-pulse">
                -4.20% 🩸 DUMP
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
