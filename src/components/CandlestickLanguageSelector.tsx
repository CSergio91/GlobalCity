import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { ChevronDown } from 'lucide-react';

export const CandlestickLanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { id: Language; code: string; pair: string; label: string; isBullish: boolean }[] = [
    { id: 'en', code: 'EN', pair: 'EN/USDT', label: 'English', isBullish: true },
    { id: 'es', code: 'ES', pair: 'ES/USDT', label: 'Español', isBullish: false },
  ];

  const currentOption = options.find((o) => o.id === language) || options[0];

  return (
    <div ref={dropdownRef} className="relative select-none">
      {/* Sleek Candlestick Trading Selector Pill (Fully Responsive) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-white/30 transition-all cursor-pointer font-mono text-xs group shadow-md"
        title="Cambiar Idioma / Language"
        aria-label="Seleccionar Idioma"
      >
        {/* Japanese Candlestick Micro-Graphic */}
        <div className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-[1px] h-1 ${currentOption.isBullish ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <div 
              className={`w-2 h-2.5 rounded-[1px] ${
                currentOption.isBullish 
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' 
                  : 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
              }`} 
            />
            <div className={`w-[1px] h-1 ${currentOption.isBullish ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          </div>
        </div>

        {/* Currency Pair: Compact 'EN' / 'ES' on mobile, 'EN/USDT' on tablet+ */}
        <div className="flex items-center font-bold">
          <span className="text-white text-xs sm:hidden">{currentOption.code}</span>
          <span className="text-white text-xs hidden sm:inline">{currentOption.pair}</span>
        </div>

        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''}`} />
      </button>

      {/* Floating Trading Book Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-[#090B12]/95 backdrop-blur-2xl border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.9)] p-1.5 z-50 animate-reveal">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/10 flex justify-between items-center">
            <span>PAIR</span>
            <span>SIDE</span>
          </div>

          <div className="mt-1 space-y-1">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setLanguage(option.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  language === option.id
                    ? 'bg-white/10 border border-white/20 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`w-[1px] h-1 ${option.isBullish ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <div className={`w-1.5 h-2 rounded-[1px] ${option.isBullish ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                    <div className={`w-[1px] h-1 ${option.isBullish ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  </div>
                  <div className="text-left font-bold">
                    <div>{option.pair}</div>
                    <div className="text-[10px] font-sans text-slate-400 font-normal">{option.label}</div>
                  </div>
                </div>

                <span className={`text-[10px] font-bold ${option.isBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {option.isBullish ? 'BUY' : 'SELL'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
