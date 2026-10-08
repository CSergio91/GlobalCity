import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface BlackHoleDisintegrationHandle {
  updateHorizon: (radius: number, isActive: boolean) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  colorType: number; // 0 = white, 1 = pale amber, 2 = starlight
}

export const BlackHoleDisintegrationCanvas = forwardRef<BlackHoleDisintegrationHandle, {}>(
  (_, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef({
      radius: 0,
      isActive: false,
      width: 0,
      height: 0,
      dpr: 1
    });

    const particlesRef = useRef<Particle[]>([]);
    const rafIdRef = useRef<number | null>(null);

    // Expose 0-React-rerender imperative interface
    useImperativeHandle(ref, () => ({
      updateHorizon: (radius: number, isActive: boolean) => {
        stateRef.current.radius = radius;
        stateRef.current.isActive = isActive;

        // Wake up RAF loop if active and not running
        if (isActive && rafIdRef.current === null) {
          startLoop();
        }
      }
    }));

    const startLoop = () => {
      if (rafIdRef.current !== null) return;

      const loop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { radius, isActive, width, height, dpr } = stateRef.current;
        const cx = width / 2;
        const cy = height / 2;

        ctx.clearRect(0, 0, width, height);

        // 1. Spawn disintegrating particles along the expanding event horizon perimeter
        if (isActive && radius > 12) {
          // Spawn 5 to 9 particles per frame
          const spawnCount = Math.min(10, Math.floor(radius / 70) + 4);
          for (let i = 0; i < spawnCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const jitterR = radius + (Math.random() - 0.5) * 6;
            const px = cx + Math.cos(angle) * jitterR;
            const py = cy + Math.sin(angle) * jitterR;

            // Gravitational physics: tangential swirl + slight inward suction into the abyss
            const swirlSpeed = 1.4 + Math.random() * 2.2;
            const inwardSpeed = -(0.8 + Math.random() * 1.8);
            
            const vx = -Math.sin(angle) * swirlSpeed + Math.cos(angle) * inwardSpeed;
            const vy = Math.cos(angle) * swirlSpeed + Math.sin(angle) * inwardSpeed;

            particlesRef.current.push({
              x: px,
              y: py,
              vx,
              vy,
              size: 1.0 + Math.random() * 1.8,
              alpha: 0.85 + Math.random() * 0.15,
              decay: 0.025 + Math.random() * 0.035, // lasts ~25-40 frames (~0.4s)
              colorType: Math.random() > 0.4 ? 0 : (Math.random() > 0.5 ? 1 : 2)
            });
          }
        }

        // 2. Render & update existing particles
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96; // drag
          p.vy *= 0.96;
          p.alpha -= p.decay;

          if (p.alpha <= 0.02) {
            particles.splice(i, 1);
            continue;
          }

          // Crisp, sharp particles (Zero blurry haze)
          let color = `rgba(255, 255, 255, ${p.alpha.toFixed(2)})`;
          if (p.colorType === 1) {
            color = `rgba(245, 158, 11, ${p.alpha.toFixed(2)})`; // subtle solar amber
          } else if (p.colorType === 2) {
            color = `rgba(226, 232, 240, ${p.alpha.toFixed(2)})`; // platinum starlight
          }

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3. Draw micro quantum filaments/sparks along the event horizon perimeter
        if (isActive && radius > 15 && Math.random() > 0.3) {
          const sparkAngle = Math.random() * Math.PI * 2;
          const sparkArc = 0.08 + Math.random() * 0.12;
          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.4 + Math.random() * 0.4).toFixed(2)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, sparkAngle, sparkAngle + sparkArc);
          ctx.stroke();
        }

        // 4. Sleep if not active and all particles have dissipated
        if (!isActive && particles.length === 0) {
          ctx.clearRect(0, 0, width, height);
          rafIdRef.current = null;
          return;
        }

        rafIdRef.current = requestAnimationFrame(loop);
      };

      rafIdRef.current = requestAnimationFrame(loop);
    };

    // Resize handler
    useEffect(() => {
      const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const w = window.innerWidth;
        const h = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        stateRef.current.width = w;
        stateRef.current.height = h;
        stateRef.current.dpr = dpr;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-35 pointer-events-none w-full h-full"
      />
    );
  }
);
