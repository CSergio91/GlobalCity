import React, { useRef, useEffect, useState } from 'react';

interface ParallaxBackgroundProps {
  imageSrc: string;
  alt: string;
  speed?: number;
  opacity?: number;
  brightness?: number;
  contrast?: number;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  imageSrc,
  alt,
  speed = 0.14,
  opacity = 0.30,
  brightness = 0.45,
  contrast = 1.3
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Only calculate if visible near viewport
      if (rect.bottom >= -150 && rect.top <= viewportHeight + 150) {
        const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
        const targetOffset = -centerOffset * speed;
        setOffsetY(targetOffset);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
    >
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-[140%] object-cover object-center will-change-transform transition-transform duration-75 ease-out"
        style={{
          transform: `translateY(${offsetY}px) scale(1.08)`,
          opacity: opacity,
          filter: `brightness(${brightness}) contrast(${contrast}) saturate(1.15)`
        }}
        referrerPolicy="no-referrer"
      />

      {/* Atmospheric Top, Bottom and Edge Vignettes for Seamless Blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05060A] via-transparent to-[#05060A]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05060A]/80 via-transparent to-[#05060A]/80" />
    </div>
  );
};
