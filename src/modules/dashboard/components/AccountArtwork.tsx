import React from 'react';

export type AccountArtworkTheme = 'solar_gold' | 'solar_violet' | 'solar_amber';

interface AccountArtworkProps {
  theme: AccountArtworkTheme;
  className?: string;
}

export const AccountArtwork: React.FC<AccountArtworkProps> = ({ theme, className = '' }) => {
  return (
    <div className={`relative w-full h-24 rounded-2xl overflow-hidden select-none pointer-events-none ${className}`}>
      {theme === 'solar_gold' && (
        <>
          {/* Base Cosmic Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#140E06] via-[#1F1608] to-[#0A0D15]" />
          
          {/* Warm Solar Corona Glow */}
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-amber-500/35 blur-2xl" />
          <div className="absolute right-6 top-2 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.8)] opacity-90" />
          
          {/* Realistic Asteroids Cluster in Golden Rim Light */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 340 96" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="goldAsteroidGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#D97706" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#1E1B18" stopOpacity="0.95" />
              </linearGradient>
              <radialGradient id="goldLightAura" cx="80%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#goldLightAura)" />

            {/* Micro Stars */}
            <circle cx="20" cy="18" r="0.8" fill="#FFFFFF" opacity="0.6" />
            <circle cx="50" cy="45" r="1.1" fill="#FDE68A" opacity="0.8" />
            <circle cx="110" cy="22" r="0.7" fill="#FFFFFF" opacity="0.5" />
            <circle cx="160" cy="65" r="1.2" fill="#FBBF24" opacity="0.7" />
            <circle cx="210" cy="30" r="0.9" fill="#FFFFFF" opacity="0.6" />

            {/* Main Asteroid Rock 1 */}
            <polygon points="260,25 285,12 310,28 322,55 300,75 270,68 252,48" fill="url(#goldAsteroidGrad)" stroke="#FBBF24" strokeWidth="0.8" opacity="0.95" />
            <line x1="285" y1="12" x2="280" y2="45" stroke="#FDE68A" strokeWidth="0.5" opacity="0.7" />
            <line x1="280" y1="45" x2="310" y2="28" stroke="#FDE68A" strokeWidth="0.5" opacity="0.6" />

            {/* Secondary Floating Asteroids */}
            <polygon points="220,50 232,42 242,52 236,65 224,62" fill="url(#goldAsteroidGrad)" stroke="#F59E0B" strokeWidth="0.5" opacity="0.8" />
            <polygon points="245,18 252,14 258,20 254,26 248,24" fill="url(#goldAsteroidGrad)" opacity="0.75" />
            <polygon points="195,32 200,28 206,34 202,40 197,38" fill="url(#goldAsteroidGrad)" opacity="0.6" />
          </svg>

          {/* Bottom Fade Gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E17] via-transparent to-transparent opacity-90" />
        </>
      )}

      {theme === 'solar_violet' && (
        <>
          {/* Base Cosmic Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C0B1B] via-[#121026] to-[#0A0D15]" />
          
          {/* Electric Blue-Violet Nebula Glow */}
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-violet-600/35 blur-2xl" />
          <div className="absolute right-6 top-2 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 shadow-[0_0_30px_rgba(139,92,246,0.8)] opacity-85" />
          
          {/* Realistic Asteroids Cluster in Electric Violet Light */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 340 96" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="violetAsteroidGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#6D28D9" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#0F0E1A" stopOpacity="0.95" />
              </linearGradient>
              <radialGradient id="violetLightAura" cx="80%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#violetLightAura)" />

            {/* Micro Stars */}
            <circle cx="25" cy="22" r="0.9" fill="#FFFFFF" opacity="0.7" />
            <circle cx="65" cy="38" r="1.1" fill="#A78BFA" opacity="0.8" />
            <circle cx="120" cy="18" r="0.7" fill="#67E8F9" opacity="0.7" />
            <circle cx="170" cy="55" r="1.2" fill="#C4B5FD" opacity="0.7" />
            <circle cx="205" cy="25" r="0.8" fill="#FFFFFF" opacity="0.6" />

            {/* Main Asteroid Rock 1 */}
            <polygon points="265,22 290,10 315,26 325,52 305,74 274,66 256,45" fill="url(#violetAsteroidGrad)" stroke="#A78BFA" strokeWidth="0.8" opacity="0.95" />
            <line x1="290" y1="10" x2="284" y2="42" stroke="#C4B5FD" strokeWidth="0.5" opacity="0.7" />
            <line x1="284" y1="42" x2="315" y2="26" stroke="#67E8F9" strokeWidth="0.5" opacity="0.6" />

            {/* Secondary Floating Asteroids */}
            <polygon points="225,48 236,38 248,48 240,62 228,58" fill="url(#violetAsteroidGrad)" stroke="#8B5CF6" strokeWidth="0.5" opacity="0.8" />
            <polygon points="248,16 254,12 260,18 256,24 250,22" fill="url(#violetAsteroidGrad)" opacity="0.75" />
            <polygon points="198,30 204,26 210,32 206,38 200,36" fill="url(#violetAsteroidGrad)" opacity="0.6" />
          </svg>

          {/* Bottom Fade Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E17] via-transparent to-transparent opacity-90" />
        </>
      )}

      {theme === 'solar_amber' && (
        <>
          {/* Base Cosmic Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#170C05] via-[#211208] to-[#0A0D15]" />
          
          {/* Amber-Orange Flare Glow */}
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-orange-600/35 blur-2xl" />
          <div className="absolute right-6 top-2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 shadow-[0_0_30px_rgba(234,88,12,0.8)] opacity-85" />
          
          {/* Realistic Asteroids Cluster in Amber-Orange Light */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 340 96" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="amberAsteroidGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#C2410C" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#1A0D07" stopOpacity="0.95" />
              </linearGradient>
              <radialGradient id="amberLightAura" cx="80%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#EA580C" stopOpacity="0.5" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#amberLightAura)" />

            {/* Micro Stars */}
            <circle cx="30" cy="20" r="0.9" fill="#FFFFFF" opacity="0.6" />
            <circle cx="75" cy="42" r="1.1" fill="#FDBA74" opacity="0.8" />
            <circle cx="130" cy="25" r="0.8" fill="#FFFFFF" opacity="0.5" />
            <circle cx="175" cy="62" r="1.2" fill="#FED7AA" opacity="0.7" />
            <circle cx="215" cy="28" r="0.8" fill="#FFFFFF" opacity="0.6" />

            {/* Main Asteroid Rock 1 */}
            <polygon points="262,24 288,11 312,27 324,54 302,75 272,67 254,47" fill="url(#amberAsteroidGrad)" stroke="#FB923C" strokeWidth="0.8" opacity="0.95" />
            <line x1="288" y1="11" x2="282" y2="44" stroke="#FED7AA" strokeWidth="0.5" opacity="0.7" />
            <line x1="282" y1="44" x2="312" y2="27" stroke="#FDBA74" strokeWidth="0.5" opacity="0.6" />

            {/* Secondary Floating Asteroids */}
            <polygon points="222,49 234,40 245,50 238,64 226,60" fill="url(#amberAsteroidGrad)" stroke="#EA580C" strokeWidth="0.5" opacity="0.8" />
            <polygon points="246,17 252,13 258,19 254,25 248,23" fill="url(#amberAsteroidGrad)" opacity="0.75" />
            <polygon points="196,31 202,27 208,33 204,39 198,37" fill="url(#amberAsteroidGrad)" opacity="0.6" />
          </svg>

          {/* Bottom Fade Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E17] via-transparent to-transparent opacity-90" />
        </>
      )}
    </div>
  );
};
