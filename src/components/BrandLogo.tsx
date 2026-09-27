import React from 'react';
import officialLogoImg from '../assets/images/logo.png';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  lightMode?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  lightMode = true,
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
          alt="Global City Funding Logo" 
          className="w-full h-full object-contain filter contrast-110 brightness-105 group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(124,58,237,0.3)]"
          referrerPolicy="no-referrer"
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center tracking-wider">
            <span className={`font-black tracking-widest text-sm sm:text-base font-display ${lightMode ? 'text-[#090A10]' : 'text-white'}`}>
              GLOBAL
            </span>
            <span className="ml-1.5 font-black text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] tracking-widest text-sm sm:text-base">
              CITY
            </span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-widest bg-purple-100/90 text-[#6D28D9] border border-purple-300/60 shadow-sm">
              FUNDING
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
