import React, { useEffect, useState, useRef } from 'react';

export const CandlestickCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const lastY = useRef(-100);

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
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const render = () => {
      // Fast, silky lerp for natural fluid cursor tracking
      currentX += (targetX - currentX) * 0.4;
      currentY += (targetY - currentY) * 0.4;

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
      <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] opacity-85" />

      {/* Japanese Candlestick Duo (Green + Red) Floating Next to Cursor */}
      <div 
        className={`absolute left-3.5 -top-2.5 flex items-center gap-1.5 transition-transform duration-150 ${
          isPointer ? 'scale-125' : 'scale-100'
        }`}
      >
        {/* 1. Green Bullish Candlestick */}
        <div className="flex flex-col items-center justify-center">
          {/* Upper wick */}
          <div className="w-[1.5px] h-1.5 bg-emerald-400 opacity-90" />
          {/* Candle Body */}
          <div 
            className={`w-2 rounded-[1.5px] bg-emerald-400 transition-all duration-150 ${
              direction === 'up' 
                ? 'h-4 bg-emerald-300 shadow-[0_0_14px_rgba(52,211,153,1)]' 
                : 'h-3 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
            }`} 
          />
          {/* Lower wick */}
          <div className="w-[1.5px] h-1.5 bg-emerald-400 opacity-90" />
        </div>

        {/* 2. Red Bearish Candlestick */}
        <div className="flex flex-col items-center justify-center">
          {/* Upper wick */}
          <div className="w-[1.5px] h-1.5 bg-rose-500 opacity-90" />
          {/* Candle Body */}
          <div 
            className={`w-2 rounded-[1.5px] bg-rose-500 transition-all duration-150 ${
              direction === 'down' 
                ? 'h-4 bg-rose-400 shadow-[0_0_14px_rgba(244,63,94,1)]' 
                : 'h-3 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
            }`} 
          />
          {/* Lower wick */}
          <div className="w-[1.5px] h-1.5 bg-rose-500 opacity-90" />
        </div>
      </div>

      {/* Subtle Atmospheric Halo */}
      <div 
        className="absolute -top-10 -left-10 w-20 h-20 rounded-full pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, rgba(244, 63, 94, 0.25) 50%, transparent 75%)',
          filter: 'blur(14px)'
        }}
      />
    </div>
  );
};
