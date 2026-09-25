import React from 'react';
import gcMonogramImg from '../assets/images/global_city_gc_monogram_1790347507584.jpg';
import { Sparkles } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  variant?: 'emblem' | 'vector' | 'hybrid';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
  className = '',
}) => {
  const dimensionMap = {
    sm: { img: 'w-7 h-7', text: 'text-sm', sub: 'text-[8.5px]' },
    md: { img: 'w-10 h-10', text: 'text-base', sub: 'text-[9.5px]' },
    lg: { img: 'w-14 h-14', text: 'text-xl', sub: 'text-xs' },
    xl: { img: 'w-24 h-24 sm:w-28 sm:h-28', text: 'text-2xl sm:text-3xl', sub: 'text-xs sm:text-sm' },
  };

  const current = dimensionMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* GC Monogram Crest - Zero White Borders, Pure Obsidian & Gold Aura */}
      <div className={`relative ${current.img} flex-shrink-0 group`}>
        {/* Soft magical glow */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#D4AF37]/25 via-[#E06D8A]/20 to-[#2DD4BF]/15 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
        
        {/* Obsidian & Antique Gold Circular Frame (NO white border) */}
        <div className="relative w-full h-full rounded-full p-[1.5px] bg-gradient-to-b from-[#D4AF37]/80 via-[#2A2317] to-[#12141C] shadow-2xl shadow-black overflow-hidden border border-[#D4AF37]/30">
          <img 
            src={gcMonogramImg} 
            alt="Global City GC Monogram Crest" 
            className="w-full h-full object-cover rounded-full filter contrast-125 brightness-100 scale-102"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Magical Sparkle Accent */}
        <div className="absolute -top-1 -right-1 text-[#F3E5AB] opacity-80 group-hover:opacity-100 group-hover:rotate-12 transition-all pointer-events-none">
          <Sparkles className="w-2.5 h-2.5 text-[#F3E5AB] drop-shadow-[0_0_4px_#D4AF37]" />
        </div>

        {/* Live status dot */}
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10B981] ring-1 ring-[#06070B]" title="Core Online" />
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
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[9px] font-bold text-[#D4AF37] font-mono tracking-wider">GC</span>
            <span className="text-white/20 text-[9px]">·</span>
            <span className={`${current.sub} text-slate-400 font-mono uppercase tracking-widest`}>
              {subtitle || 'TRADING ECOSYSTEM'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
