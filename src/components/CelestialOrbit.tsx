import React, { useState, useEffect } from 'react';
import solImg from '../assets/images/sol.webp';
import lunaImg from '../assets/images/luna.webp';

interface CelestialOrbitProps {
  onThemeLightnessChange?: (lightness: number) => void;
}

export const CelestialOrbit: React.FC<CelestialOrbitProps> = ({ onThemeLightnessChange }) => {
  // 1. Detect day or night based on user's local country official time (6:00 to 18:00 = Day)
  const [isInitiallyDay, setIsInitiallyDay] = useState<boolean>(() => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18;
  });

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  // Entrance animation: Astro descends smoothly from above on mount
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [isEntranceFinished, setIsEntranceFinished] = useState<boolean>(false);

  useEffect(() => {
    const entranceTimer = setTimeout(() => {
      setHasEntered(true);
    }, 60);

    const finishTimer = setTimeout(() => {
      setIsEntranceFinished(true);
    }, 1500);

    return () => {
      clearTimeout(entranceTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  useEffect(() => {
    const checkResponsive = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const hour = new Date().getHours();
    setIsInitiallyDay(hour >= 6 && hour < 18);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const progress = Math.max(0, Math.min(1, scrollY / docHeight));
      setScrollProgress(progress);
      if (progress > 0.005) {
        setIsEntranceFinished(true);
      }
    };

    window.addEventListener('resize', checkResponsive, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('resize', checkResponsive);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // SMOOTH THEME TRANSITION LOGIC:
  // If ending with Sol: smooth transition into Light Mode (Modo Claro).
  // If ending with Luna: smooth transition into Dark Mode (Modo Oscuro).
  // During the eclipse (0.42 to 0.58), darkness dips dramatically (Totality).
  // ---------------------------------------------------------------------------
  const s = scrollProgress;

  // Eclipse window centered at 0.50
  const eclipseWindow = 0.12; 
  const distFromEclipseCenter = Math.abs(s - 0.50) / eclipseWindow;
  const eclipseIntensity = distFromEclipseCenter < 1
    ? Math.cos(distFromEclipseCenter * (Math.PI / 2))
    : 0;

  // Calculate global page lightness (0 = Deep Dark, 1 = Daylight Radiant)
  let lightness = 0;
  if (!isInitiallyDay) {
    // Night initially: starts at 0 (Dark).
    // Eclipse in middle (deep dark).
    // Ends with Sol: smoothly rises to 1.0 (Light Mode) from s=0.55 to 1.0!
    if (s <= 0.52) {
      lightness = 0;
    } else {
      const p = (s - 0.52) / 0.48; // 0 -> 1
      lightness = Math.pow(Math.min(1, Math.max(0, p)), 1.3);
    }
  } else {
    // Day initially: starts at 1.0 (Light).
    // Dips towards sunset and eclipse.
    // Ends with Luna: smoothly transitions to 0 (Dark Mode) at the end!
    if (s <= 0.45) {
      const p = s / 0.45;
      lightness = 1 - Math.pow(p, 1.2) * (1 - 0.2); // starts daylight, softens into golden hour
    } else if (s <= 0.55) {
      lightness = 0; // Totality eclipse
    } else {
      lightness = 0; // Full night mode
    }
  }

  // Notify parent of lightness value for seamless root adaptation
  useEffect(() => {
    if (onThemeLightnessChange) {
      onThemeLightnessChange(lightness);
    }
  }, [lightness, onThemeLightnessChange]);

  // ---------------------------------------------------------------------------
  // RESPONSIVE COORDINATES (Corner to Corner, Never Centered at End, Never Over Content)
  // On mobile: strictly clamped within safe perimeter padding to prevent edge cropping.
  // ---------------------------------------------------------------------------
  const cornerX = isMobile ? 76 : 86; // Safe upper-right corner
  const cornerY = isMobile ? 12 : 9;  // High in the sky
  const meetX = 50;                  // High center sky during eclipse
  const meetY = isMobile ? 12 : 9;

  let lunaX = meetX;
  let lunaY = meetY;
  let lunaOpacity = 1;
  let lunaScale = 1;

  let solX = meetX;
  let solY = meetY;
  let solOpacity = 1;
  let solScale = 1;

  if (!isInitiallyDay) {
    // -------------------------------------------------------------------------
    // NIGHT MODE INITIALLY (Starts with Luna in dark sky -> Ends with Sol in Daylight)
    // -------------------------------------------------------------------------
    if (s <= 0.50) {
      const t = s / 0.50; // 0 -> 1
      // Luna descends from corner (76/86vw, 12/9vh) to eclipse position (50vw, 12/9vh)
      lunaX = cornerX - t * (cornerX - meetX);
      lunaY = cornerY;
      lunaOpacity = 1;
      lunaScale = 1;

      // Sol ascends from below the horizon (15vw, 115vh) to eclipse position (50vw, 12/9vh)
      solX = 15 + t * 35;
      solY = 115 - Math.sin(t * Math.PI * 0.5) * (115 - meetY);
      solOpacity = t < 0.15 ? Math.max(0, t / 0.15) : 1;
      solScale = 0.92 + t * 0.08;
    } else {
      const t = (s - 0.50) / 0.50; // 0 -> 1
      // Luna sinks into bottom-left horizon (10vw, 115vh)
      lunaX = meetX - t * (meetX - 10);
      lunaY = meetY + Math.pow(t, 1.4) * (115 - meetY);
      lunaOpacity = t > 0.85 ? Math.max(0, (1 - t) / 0.15) : 1;
      lunaScale = 1 - t * 0.15;

      // Sol ascends from eclipse position to the upper corner (76/86vw, 12/9vh) - NOT IN THE MIDDLE!
      solX = meetX + t * (cornerX - meetX);
      solY = meetY;
      solOpacity = 1;
      solScale = 1;
    }
  } else {
    // -------------------------------------------------------------------------
    // DAY MODE INITIALLY (Starts with Sol in Daylight -> Ends with Luna in Night)
    // -------------------------------------------------------------------------
    if (s <= 0.50) {
      const t = s / 0.50; // 0 -> 1
      solX = cornerX - t * (cornerX - meetX);
      solY = cornerY;
      solOpacity = 1;
      solScale = 1;

      lunaX = 15 + t * 35;
      lunaY = 115 - Math.sin(t * Math.PI * 0.5) * (115 - meetY);
      lunaOpacity = t < 0.15 ? Math.max(0, t / 0.15) : 1;
      lunaScale = 0.92 + t * 0.08;
    } else {
      const t = (s - 0.50) / 0.50; // 0 -> 1
      solX = meetX - t * (meetX - 10);
      solY = meetY + Math.pow(t, 1.4) * (115 - meetY);
      solOpacity = t > 0.85 ? Math.max(0, (1 - t) / 0.15) : 1;
      solScale = 1 - t * 0.15;

      lunaX = meetX + t * (cornerX - meetX);
      lunaY = meetY;
      lunaOpacity = 1;
      lunaScale = 1;
    }
  }

  return (
    <>
      {/* 
        1. SMOOTH DAYLIGHT ATMOSPHERE LAYER (MODO CLARO TRANSITION)
        Interpolates gracefully as the user reaches the end when Sol is the final astro.
      */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-300 ease-out select-none"
        style={{
          opacity: lightness,
          background: 'linear-gradient(180deg, #F8FAFC 0%, #EDE9FE 35%, #F3E8FF 70%, #FAF5FF 100%)',
        }}
      />

      {/* 
        2. ECLIPSE TOTALITY OVERLAY: Deep cosmic blackout during eclipse crossover
        Located in background z-[2], so it changes the sky atmosphere without covering text.
        Deep midnight obsidian sky without artificial purple tones.
      */}
      <div 
        className="fixed inset-0 pointer-events-none z-[2] transition-opacity duration-200 ease-out select-none"
        style={{
          opacity: Math.pow(eclipseIntensity, 1.2) * 0.96,
          background: `radial-gradient(ellipse at 50vw ${meetY}vh, rgba(4, 6, 12, 0.5) 0%, rgba(2, 2, 5, 0.96) 45%, #000000 85%)`,
        }}
      />

      {/* 
        3. CELESTIAL BODIES CONTAINER:
        Positioned at z-[5]: in front of transparent section backgrounds (z-0),
        but strictly behind the cards (relative z-10).
      */}
      <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden select-none">

        {/* --- EL SOL (Z-INDEX: 10 - Placed behind the Moon during eclipse) --- */}
        {solOpacity > 0 && (
          <div 
            className="absolute will-change-transform z-10"
            style={{
              left: `${solX}vw`,
              top: `${solY + ((isInitiallyDay && !hasEntered && s === 0) ? -35 : 0)}vh`,
              transform: `translate(-50%, -50%) scale(${solScale})`,
              opacity: (isInitiallyDay && !hasEntered && s === 0) ? 0 : solOpacity,
              transition: (!isEntranceFinished && s === 0)
                ? 'top 1.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease-out, transform 0.075s ease-out'
                : 'transform 0.075s ease-out',
            }}
          >
            {/* 
              CINEMATIC HIGH-FIDELITY SOLAR CORONA (True Astrophysics Plasma Glow)
              Multi-layered white-gold corona and ethereal plasma streamers.
              No artificial purple discs or harsh rings.
            */}
            {eclipseIntensity > 0.02 && (
              <>
                {/* Layer 1: Expansive Ethereal Solar Streamers */}
                <div 
                  className="absolute inset-[-42%] pointer-events-none rounded-full blur-[28px] transition-opacity duration-150"
                  style={{
                    opacity: Math.pow(eclipseIntensity, 1.2) * 0.85,
                    background: 'radial-gradient(circle at 50% 50%, rgba(254,240,138,0.75) 0%, rgba(245,158,11,0.5) 45%, rgba(180,83,9,0.2) 70%, transparent 95%)',
                  }}
                />

                {/* Layer 2: Brilliant Incandescent Plasma Limb (White/Gold Core) */}
                <div 
                  className="absolute inset-[-16%] pointer-events-none rounded-full blur-[12px] transition-opacity duration-150"
                  style={{
                    opacity: Math.pow(eclipseIntensity, 1.1) * 0.98,
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(254,243,199,0.95) 40%, rgba(245,158,11,0.7) 65%, rgba(217,119,6,0.3) 85%, transparent 100%)',
                  }}
                />

                {/* Layer 3: Diamond Ring Flare (Baily's Beads Effect at Upper-Right Rim) */}
                {eclipseIntensity > 0.50 && (
                  <div 
                    className="absolute pointer-events-none z-30 transition-opacity duration-150"
                    style={{
                      top: '12%',
                      right: '18%',
                      opacity: Math.sin(Math.min(1, (eclipseIntensity - 0.50) / 0.50) * Math.PI),
                    }}
                  >
                    {/* Center Diamond Bead */}
                    <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-white shadow-[0_0_20px_#ffffff,0_0_35px_rgba(254,240,138,0.9),0_0_70px_rgba(245,158,11,0.85)] -translate-x-1/2 -translate-y-1/2" />
                    {/* Horizontal Anamorphic Ray Streak */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-72 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none shadow-[0_0_12px_#ffffff]" />
                    {/* Delicate Diagonal Cross Ray */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 sm:w-36 h-[1.5px] rotate-45 bg-gradient-to-r from-transparent via-amber-200 to-transparent pointer-events-none" />
                  </div>
                )}
              </>
            )}

            {/* Sol WebP Graphic - Clean, sharp, responsive */}
            <img 
              src={solImg}
              alt="Sol"
              className="w-28 h-28 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-contain filter contrast-[1.05]"
              draggable={false}
            />
          </div>
        )}

        {/* --- LA LUNA (Z-INDEX: 20 - Placed ON TOP of the Sun creating the Solar Eclipse) --- */}
        {lunaOpacity > 0 && (
          <div 
            className="absolute will-change-transform z-20"
            style={{
              left: `${lunaX}vw`,
              top: `${lunaY + ((!isInitiallyDay && !hasEntered && s === 0) ? -35 : 0)}vh`,
              transform: `translate(-50%, -50%) scale(${lunaScale})`,
              opacity: (!isInitiallyDay && !hasEntered && s === 0) ? 0 : lunaOpacity,
              transition: (!isEntranceFinished && s === 0)
                ? 'top 1.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease-out, transform 0.075s ease-out'
                : 'transform 0.075s ease-out',
            }}
          >
            <div className="relative w-28 h-28 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96">
              {/* Luna WebP Graphic: Dims into obsidian shadow during eclipse crossover */}
              <img 
                src={lunaImg}
                alt="Luna"
                className="w-full h-full object-contain transition-[filter] duration-150"
                style={{
                  filter: `contrast(${1 + eclipseIntensity * 0.3}) brightness(${Math.max(0.03, 1 - eclipseIntensity * 0.97)})`,
                }}
                draggable={false}
              />

              {/* 
                REALISTIC OBSIDIAN ECLIPSE SILHOUETTE OVERLAY
                Turns the Moon into a velvety black celestial body blocking the sun,
                with a delicate golden rim reflection from the fiery corona behind it.
              */}
              {eclipseIntensity > 0.04 && (
                <div 
                  className="absolute inset-[1.5%] rounded-full pointer-events-none transition-opacity duration-150"
                  style={{
                    opacity: eclipseIntensity,
                    background: 'radial-gradient(circle at 48% 48%, rgba(4, 5, 8, 0.98) 0%, rgba(2, 2, 4, 0.99) 72%, #000000 100%)',
                    boxShadow: `inset 0 0 ${14 * eclipseIntensity}px rgba(254, 240, 138, ${0.45 * eclipseIntensity}), 0 0 ${8 * eclipseIntensity}px rgba(0, 0, 0, 0.8)`,
                  }}
                />
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
};
