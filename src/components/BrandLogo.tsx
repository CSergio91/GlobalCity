import React from 'react';
import officialLogoImg from '../assets/images/logo.png';

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
    sm: { img: 'w-8 h-8', text: 'text-xs sm:text-sm' },
    md: { img: 'w-11 h-11 sm:w-12 sm:h-12', text: 'text-sm sm:text-base' },
    lg: { img: 'w-14 h-14 sm:w-16 sm:h-16', text: 'text-base sm:text-xl' },
    xl: { img: 'w-20 h-20 sm:w-24 sm:h-24', text: 'text-2xl sm:text-3xl' },
  };

  const current = dimensionMap[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Brand Emblem: Optimized transparent PNG with no background or circular wrapper frames */}
      <div className={`relative ${current.img} flex-shrink-0 group cursor-pointer`}>
        <img 
          src={officialLogoImg} 
          alt="Global City Logo" 
          className="w-full h-full object-contain filter contrast-110 brightness-105 group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          referrerPolicy="no-referrer"
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center tracking-wider">
            <span className="font-black text-white tracking-widest text-sm sm:text-base font-display">
              GLOBAL
            </span>
            <span className="ml-1.5 font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] tracking-widest text-sm sm:text-base">
              CITY
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
