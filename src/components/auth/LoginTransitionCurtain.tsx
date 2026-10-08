import React, { useRef, useEffect } from 'react';

interface LoginTransitionCurtainProps {
  isWiping: boolean;
  direction: 'left-to-right' | 'right-to-left'; // right-to-left = to register; left-to-right = to login
  onMidpoint: () => void;
  onComplete: () => void;
}

interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  colorType: number; // 0 = white, 1 = solar amber, 2 = radiant gold, 3 = cosmic starlight
}

export const LoginTransitionCurtain: React.FC<LoginTransitionCurtainProps> = ({
  isWiping,
  direction,
  onMidpoint,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<StardustParticle[]>([]);
  const hasTriggeredMidpointRef = useRef(false);

  useEffect(() => {
    if (!isWiping) return;

    hasTriggeredMidpointRef.current = false;
    particlesRef.current = [];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const startTime = performance.now();
    const duration = 820; // ms total wipe duration: smooth, premium, cinematic
    let rafId: number;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Trigger state swap at 49% of progress when the screen is 100% blanketed by the obsidian veil
      if (progress >= 0.49 && !hasTriggeredMidpointRef.current) {
        hasTriggeredMidpointRef.current = true;
        onMidpoint();
      }

      ctx.clearRect(0, 0, w, h);

      // Quadratic ease-in-out curve
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      let curtainX = 0;
      let curtainWidth = 0;
      let edgeX = 0;

      if (direction === 'right-to-left') {
        // Enters from right (w), covers to left (0), then unveils
        if (progress < 0.5) {
          const subP = progress / 0.5;
          const subEased = subP * subP; // accelerate into full cover
          curtainX = w * (1 - subEased);
          curtainWidth = w * subEased;
          edgeX = curtainX;
        } else {
          const subP = (progress - 0.5) / 0.5;
          const subEased = 1 - Math.pow(1 - subP, 2); // decelerate reveal
          curtainX = 0;
          curtainWidth = w * (1 - subEased);
          edgeX = curtainWidth;
        }
      } else {
        // Enters from left (0), covers to right (w), then unveils
        if (progress < 0.5) {
          const subP = progress / 0.5;
          const subEased = subP * subP;
          curtainX = 0;
          curtainWidth = w * subEased;
          edgeX = curtainWidth;
        } else {
          const subP = (progress - 0.5) / 0.5;
          const subEased = 1 - Math.pow(1 - subP, 2);
          curtainX = w * subEased;
          curtainWidth = w * (1 - subEased);
          edgeX = curtainX;
        }
      }

      // Draw elegant Obsidian black veil (100% opacity to completely eclipse behind)
      if (curtainWidth > 0) {
        ctx.save();
        ctx.fillStyle = '#05060A';
        ctx.fillRect(curtainX, 0, curtainWidth, h);

        // Leading edge glow beam (Amber & Starlight Gold, exactly like the black hole accretion edge)
        const beamGrad = ctx.createLinearGradient(edgeX - 24, 0, edgeX + 24, 0);
        beamGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
        beamGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.45)');
        beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
        beamGrad.addColorStop(0.65, 'rgba(251, 191, 36, 0.45)');
        beamGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(edgeX - 24, 0, 48, h);

        // Razor-sharp 1px core photon line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(edgeX - 0.5, 0, 1, h);

        // Spawn disintegrating stardust particles along the leading edge
        if (progress < 0.92) {
          const spawnCount = 6;
          for (let i = 0; i < spawnCount; i++) {
            const vy = (Math.random() - 0.5) * 3.5;
            const vxSpread = direction === 'right-to-left'
              ? (progress < 0.5 ? -(1.5 + Math.random() * 3) : (1.5 + Math.random() * 3))
              : (progress < 0.5 ? (1.5 + Math.random() * 3) : -(1.5 + Math.random() * 3));

            particlesRef.current.push({
              x: edgeX + (Math.random() - 0.5) * 12,
              y: Math.random() * h,
              vx: vxSpread,
              vy,
              size: 0.9 + Math.random() * 1.8,
              alpha: 0.9 + Math.random() * 0.1,
              decay: 0.02 + Math.random() * 0.03, // lasts ~25-45 frames
              colorType: Math.random() > 0.4 ? 0 : (Math.random() > 0.5 ? 1 : (Math.random() > 0.5 ? 2 : 3))
            });
          }
        }

        // Micro quantum filaments / sparks along the event horizon (inspired by BlackHoleDisintegrationCanvas)
        if (Math.random() > 0.35) {
          const sparkY = Math.random() * h;
          const sparkH = 12 + Math.random() * 28;
          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.4 + Math.random() * 0.5).toFixed(2)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(edgeX, sparkY);
          ctx.lineTo(edgeX + (Math.random() - 0.5) * 8, sparkY + sparkH);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Render and update stardust particles with physics drag and decay
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96; // drag from BlackHole physics
        p.vy *= 0.96;
        p.alpha -= p.decay;

        if (p.alpha <= 0.02) {
          particles.splice(i, 1);
          continue;
        }

        // Crisp, sharp particles (Zero blurry haze)
        let color = `rgba(255, 255, 255, ${p.alpha.toFixed(2)})`;
        if (p.colorType === 1) {
          color = `rgba(245, 158, 11, ${p.alpha.toFixed(2)})`; // solar amber
        } else if (p.colorType === 2) {
          color = `rgba(251, 191, 36, ${p.alpha.toFixed(2)})`; // radiant gold
        } else if (p.colorType === 3) {
          color = `rgba(168, 85, 247, ${p.alpha.toFixed(2)})`; // cosmic starlight purple
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, w, h);
        onComplete();
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isWiping, direction, onMidpoint, onComplete]);

  if (!isWiping) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[100] select-none"
    />
  );
};
