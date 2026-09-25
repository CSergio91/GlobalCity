import React from 'react';
import officialLogoImg from '../assets/images/global_city_official_exact_logo_1790349385972.jpg';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const dimensionMap = {
    sm: { img: 'w-8 h-8', text: 'text-base' },
    md: { img: 'w-11 h-11', text: 'text-lg' },
    lg: { img: 'w-16 h-16', text: 'text-2xl' },
    xl: { img: 'w-24 h-24 sm:w-28 sm:h-28', text: 'text-3xl' },
  };

  const current = dimensionMap[size];

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Official Exact Global City Emblem Badge */}
      <div className={`relative ${current.img} flex-shrink-0 group cursor-pointer`}>
        {/* Colorful neon ambient glow matching Trading City skyline */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-[#3B82F6]/50 via-[#EC4899]/40 to-[#F59E0B]/35 blur-lg opacity-85 group-hover:opacity-100 transition-opacity" />
        
        {/* Double neon-border circular emblem */}
        <div className="relative w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-[#60A5FA] via-[#F472B6] to-[#FBBF24] shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <img 
            src={officialLogoImg} 
            alt="Global City Official Logo" 
            className="w-full h-full object-cover rounded-full filter contrast-125 brightness-110"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center tracking-tight">
            <span className="font-black text-white font-display text-illuminate tracking-tight text-lg">
              GLOBAL
            </span>
            <span className="ml-1.5 font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#818CF8] text-lg">
              CITY
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
