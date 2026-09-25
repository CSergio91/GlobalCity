import React from 'react';
import officialLogoImg from '../assets/images/global_city_official_logo_1790347316776.jpg';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
  className = '',
}) => {
  const dimensionMap = {
    sm: { img: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    md: { img: 'w-10 h-10', text: 'text-base', sub: 'text-[10px]' },
    lg: { img: 'w-14 h-14', text: 'text-xl', sub: 'text-xs' },
    xl: { img: 'w-24 h-24 sm:w-28 sm:h-28', text: 'text-2xl sm:text-3xl', sub: 'text-xs sm:text-sm' },
  };

  const current = dimensionMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Trading City-inspired Emblem Crest */}
      <div className={`relative ${current.img} flex-shrink-0 group`}>
        {/* Glow halo */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#D4AF37]/30 via-[#E06D8A]/30 to-[#2DD4BF]/20 blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
        
        {/* Outer Circular Ring with Metallic Bezel */}
        <div className="relative w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-[#D4AF37] via-[#FFF3B0] to-[#8C6D23] shadow-lg shadow-black/80 overflow-hidden ring-1 ring-white/20">
          <img 
            src={officialLogoImg} 
            alt="Global City Institutional Crest" 
            className="w-full h-full object-cover rounded-full filter contrast-110 brightness-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Small live badge indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#0B0D13] shadow-sm" title="Core Online" />
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`${current.text} font-black tracking-tight text-white flex items-center font-display`}>
              GLOBAL
              <span className="ml-1 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#E06D8A]">
                CITY
              </span>
            </span>
          </div>
          <span className={`${current.sub} text-slate-400 font-mono uppercase tracking-widest mt-1`}>
            {subtitle || 'TRADING ECOSYSTEM'}
          </span>
        </div>
      )}
    </div>
  );
};
