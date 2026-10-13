import React, { useState, useEffect } from 'react';
import backCapa1 from '../../../assets/images/back_capa1.webp';
import middleCapa2 from '../../../assets/images/middle_capa2.webp';
import frontCapa3 from '../../../assets/images/front_capa3.webp';
import backFallback from '../../../assets/images/back_fallback.webp';

interface ParallaxCoords {
  x: number;
  y: number;
}

interface SpaceParallaxLayerProps {
  mousePos: ParallaxCoords;
}

/**
 * Estilos de animación de deriva orgánica cósmica cuando el mouse está en reposo.
 * Se ejecutan en GPU (transform) a 60 FPS garantizando una experiencia viva y cinematográfica.
 */
const AMBIENT_DRIFT_STYLES = `
@keyframes eklipseAmbientDrift1 {
  0% { transform: translate3d(0px, 0px, 0px) scale(1); }
  33% { transform: translate3d(7px, -6px, 0px) scale(1.008); }
  66% { transform: translate3d(-6px, 5px, 0px) scale(1.004); }
  100% { transform: translate3d(5px, 7px, 0px) scale(1.012); }
}

@keyframes eklipseAmbientDrift2 {
  0% { transform: translate3d(0px, 0px, 0px) rotate(0deg); }
  30% { transform: translate3d(-14px, 9px, 0px) rotate(0.4deg); }
  70% { transform: translate3d(12px, -11px, 0px) rotate(-0.35deg); }
  100% { transform: translate3d(-8px, -8px, 0px) rotate(0.25deg); }
}

@keyframes eklipseAmbientDrift3 {
  0% { transform: translate3d(0px, 0px, 0px); }
  35% { transform: translate3d(16px, -12px, 0px); }
  75% { transform: translate3d(-12px, 14px, 0px); }
  100% { transform: translate3d(10px, 8px, 0px); }
}
`;

/**
 * Capa 1 y Capa 2: Fondo y Asteroides Medios
 * Se renderizan DETRÁS de los componentes principales (z-0)
 * Incluye deriva orgánica cósmica continua incluso con mouse en reposo.
 */
export const SpaceParallaxBackground: React.FC<SpaceParallaxLayerProps> = ({ mousePos }) => {
  const [bgSrc, setBgSrc] = useState(backCapa1);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Multiplicadores de profundidad para efecto cinematográfico sutil y no mareante
  const factor1 = prefersReducedMotion ? 0 : 7;
  const factor2 = prefersReducedMotion ? 0 : 16;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      <style>{AMBIENT_DRIFT_STYLES}</style>

      {/* CAPA 1: Fondo espacial profundo (Planeta, horizonte de eclipse y estrellas) */}
      <div 
        className="absolute inset-[-4%] w-[108%] h-[108%] will-change-transform"
        style={{
          animation: prefersReducedMotion ? 'none' : 'eklipseAmbientDrift1 24s ease-in-out infinite alternate',
          transformOrigin: 'center center'
        }}
      >
        <div 
          className="w-full h-full bg-cover bg-center transition-transform duration-500 ease-out will-change-transform"
          style={{
            backgroundImage: `url('${bgSrc}')`,
            transform: `translate3d(${mousePos.x * factor1}px, ${mousePos.y * factor1}px, 0)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%'
          }}
          onError={() => setBgSrc(backFallback)}
        />
      </div>

      {/* Atmospheric Soft Lighting Voids (Restrained editorial glow) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-transparent to-black/30 pointer-events-none" />

      {/* CAPA 2: Asteroides y restos cósmicos de profundidad intermedia */}
      <div 
        className="absolute inset-[-5%] w-[110%] h-[110%] will-change-transform opacity-95"
        style={{
          animation: prefersReducedMotion ? 'none' : 'eklipseAmbientDrift2 18s ease-in-out infinite alternate',
          transformOrigin: 'center center'
        }}
      >
        <div 
          className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out will-change-transform"
          style={{
            backgroundImage: `url('${middleCapa2}')`,
            transform: `translate3d(${mousePos.x * factor2}px, ${mousePos.y * factor2}px, 0)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%'
          }}
        />
      </div>

      {/* Subtle Central Quiet Grid Overlay (Para máxima legibilidad en las tarjetas) */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
};

/**
 * Capa 3: Asteroides en Primer Plano (Rocas)
 * Se renderizan ENCIMA de los componentes para enmarcar la escena,
 * con pointer-events-none absoluto para NUNCA obstruir ningún clic o botón.
 * Incluye deriva orgánica cósmica continua incluso con mouse en reposo.
 */
export const SpaceParallaxForeground: React.FC<SpaceParallaxLayerProps> = ({ mousePos }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const factor3 = prefersReducedMotion ? 0 : 24;

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-20 select-none"
      aria-hidden="true"
    >
      {/* CAPA 3: Asteroides cercanos que enmarcan la vista lateral e inferior */}
      <div 
        className="absolute inset-[-6%] w-[112%] h-[112%] will-change-transform opacity-90"
        style={{
          animation: prefersReducedMotion ? 'none' : 'eklipseAmbientDrift3 20s ease-in-out infinite alternate',
          transformOrigin: 'center center'
        }}
      >
        <div 
          className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out will-change-transform"
          style={{
            backgroundImage: `url('${frontCapa3}')`,
            transform: `translate3d(${mousePos.x * factor3}px, ${mousePos.y * factor3}px, 0)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%'
          }}
        />
      </div>
    </div>
  );
};
