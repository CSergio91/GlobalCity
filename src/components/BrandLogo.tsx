import React from 'react';
import eklipseEmblemImg from '../assets/images/eklipse_sol_luna_emblem_transparent.png';

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
    sm: { 
      img: 'w-8 h-8 sm:w-9 sm:h-9', 
      text: 'text-xs sm:text-sm', 
      badge: 'text-[8px] px-1.5 py-0.5' 
    },
    md: { 
      img: 'w-11 h-11 sm:w-13 sm:h-13', 
      text: 'text-sm sm:text-base', 
      badge: 'text-[9px] px-2 py-0.5' 
    },
    lg: { 
      img: 'w-16 h-16 sm:w-20 sm:h-20', 
      text: 'text-xl sm:text-2xl', 
      badge: 'text-[10px] sm:text-[11px] px-2.5 py-0.5' 
    },
    xl: { 
      img: 'w-24 h-24 sm:w-28 sm:h-28', 
      text: 'text-3xl sm:text-4xl', 
      badge: 'text-xs px-3 py-1' 
    },
  };

  const current = dimensionMap[size];

  return (
    <div className={`flex items-center gap-3 sm:gap-4 select-none ${className}`}>
      {/* Brand Emblem: Eklipse Sol & Luna Architectural Eclipse Emblem */}
      <div className={`relative ${current.img} flex-shrink-0 group cursor-pointer`}>
        <img 
          src={eklipseEmblemImg} 
          alt="Eklipse Funded Logo" 
          className="w-full h-full object-contain filter contrast-115 brightness-105 group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_2px_18px_rgba(234,179,8,0.35)]"
          referrerPolicy="no-referrer"
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center tracking-wider">
            <span className={`font-black tracking-widest ${current.text} font-display ${lightMode ? 'text-[#090A10]' : 'text-white'}`}>
              EKLIPSE
            </span>
            <span className={`ml-2 rounded font-black uppercase tracking-widest bg-amber-400/10 text-amber-300 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.2)] ${current.badge}`}>
              FUNDED
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
