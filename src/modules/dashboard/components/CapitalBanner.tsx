import React from 'react';
import { 
  BarChart2, 
  Briefcase, 
  Target, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface CapitalBannerProps {
  onAcquireAccount: () => void;
  isEn?: boolean;
}

export const CapitalBanner: React.FC<CapitalBannerProps> = ({
  onAcquireAccount,
  isEn = false
}) => {
  return (
    <div className="relative rounded-3xl p-6 sm:p-7 border border-white/10 bg-[#080B13]/85 backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden">
      
      {/* Subtle Ambient Lighting */}
      <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

      {/* Left: Graphic Icon + Copy + CTA Button */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-4 text-center sm:text-left z-10">
        
        {/* Glowing Gold Bar Chart Circle */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-400/35 text-amber-300 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
          <TrendingUp className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-white flex items-center justify-center sm:justify-start gap-2">
            <span>{isEn ? 'Need more capital?' : '¿Necesitas más capital?'}</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono max-w-md">
            {isEn 
              ? 'Acquire new evaluation accounts and scale your trading to the next tier.'
              : 'Adquiere nuevas cuentas y escala tu trading al siguiente nivel.'}
          </p>

          <div className="pt-2">
            <button
              onClick={onAcquireAccount}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-amber-300 hover:text-white bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/35 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <span>{isEn ? 'Acquire Account →' : 'Adquirir Cuenta →'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Right: 3 Benefit Capsules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto z-10">
        
        {/* Benefit 1 */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur-md flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-white">
              {isEn ? 'More capital' : 'Más capital'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {isEn ? 'Up to $200k' : 'Hasta $200k'}
            </div>
          </div>
        </div>

        {/* Benefit 2 */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur-md flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-white">
              {isEn ? 'Better conditions' : 'Mejores condiciones'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {isEn ? 'Competitive spreads' : 'Spreads competitivos'}
            </div>
          </div>
        </div>

        {/* Benefit 3 */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur-md flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-white">
              {isEn ? 'Real growth' : 'Crecimiento real'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {isEn ? 'Scale your account' : 'Escala tu cuenta'}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
