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
    sm: { img: 'w-7 h-7', text: 'text-sm' },
    md: { img: 'w-9 h-9', text: 'text-base sm:text-lg' },
    lg: { img: 'w-12 h-12', text: 'text-xl' },
    xl: { img: 'w-16 h-16 sm:w-20 sm:h-20', text: 'text-2xl' },
  };

  const current = dimensionMap[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Sleek, Minimalist Futuristic Brand Emblem */}
      <div className={`relative ${current.img} flex-shrink-0 group cursor-pointer`}>
        {/* Subtle cyan/pink ambient backlight */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#38BDF8]/40 via-[#F472B6]/40 to-[#FBBF24]/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
        
        {/* Crisp, clean emblem container without excessive circular ring */}
        <div className="relative w-full h-full rounded-full overflow-hidden border border-white/25 shadow-lg group-hover:scale-105 transition-transform duration-300 bg-[#090A0F]">
          <img 
            src={officialLogoImg} 
            alt="Global City Logo" 
            className="w-full h-full object-cover rounded-full filter contrast-115 brightness-105"
            referrerPolicy="no-referrer"
          />
        </div>
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
