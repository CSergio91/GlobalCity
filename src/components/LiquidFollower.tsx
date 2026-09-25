import React, { useEffect, useState } from 'react';

export const LiquidFollower: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = target.closest('button, a, input, [role="button"], .cursor-pointer');
        setIsPointer(!!isClickable);
      }
    };

    const render = () => {
      // Fluid lerp physics for liquid trailing
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      setPos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (pos.x < 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Primary Liquid Glow Follower */}
      <div 
        className="absolute rounded-full transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${isPointer ? 1.4 : 1})`,
          width: '420px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(224, 109, 138, 0.14) 0%, rgba(212, 175, 55, 0.08) 35%, rgba(45, 212, 191, 0.04) 65%, transparent 80%)',
          filter: 'blur(30px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Tight Fluid Ripple Core */}
      <div 
        className="absolute rounded-full transition-transform duration-150 ease-out will-change-transform"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${isPointer ? 1.3 : 1})`,
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(224, 109, 138, 0.18) 40%, transparent 75%)',
          filter: 'blur(12px)',
        }}
      />
    </div>
  );
};
