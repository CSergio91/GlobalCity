import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { ChevronDown, Check } from 'lucide-react';

interface LanguagePairOption {
  id: Language;
  pair: string;
  isGreen: boolean;
  side: string;
}

export const CandlestickLanguageSelector: React.FC<{ compactMobile?: boolean }> = ({ compactMobile = false }) => {
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

  const options: LanguagePairOption[] = [
    { id: 'es', pair: 'ES/BTC', isGreen: true, side: 'BUY' },
    { id: 'en', pair: 'EN/USD', isGreen: false, side: 'SELL' },
  ];

  const currentOption = options.find((o) => o.id === language) || options[0];

  return (
    <div ref={dropdownRef} className="relative select-none shrink-0">
      {/* Candlestick Trading Selector Pill: Only Candlestick + Pair Acronym */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center rounded-full bg-slate-950/90 hover:bg-slate-900 border border-white/20 hover:border-white/40 transition-all cursor-pointer shadow-lg active:scale-95 group ${
          compactMobile 
            ? 'px-2 py-1 gap-1 text-[11px]' 
            : 'px-2.5 sm:px-3 py-1 sm:py-1.5 gap-1.5 sm:gap-2 text-[11px] sm:text-xs'
        }`}
        title="Cambiar Par / Select Pair"
        aria-label="Seleccionar Par de Idioma"
      >
        {/* Japanese Candlestick: Green or Red */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className={`w-[1px] sm:w-[1.5px] h-1 sm:h-1.5 ${currentOption.isGreen ? 'bg-emerald-400' : 'bg-rose-500'}`} />
          <div 
            className={`w-2 sm:w-2.5 h-2.5 sm:h-3 rounded-[1px] ${
              currentOption.isGreen 
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
                : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
            }`} 
          />
          <div className={`w-[1px] sm:w-[1.5px] h-1 sm:h-1.5 ${currentOption.isGreen ? 'bg-emerald-400' : 'bg-rose-500'}`} />
        </div>

        {/* Only Acronym (ES/BTC or EN/USD) */}
        <span className="font-mono font-bold tracking-wider text-white">
          {currentOption.pair}
        </span>

        <ChevronDown 
          className={`w-3 h-3 text-slate-400 group-hover:text-white transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`} 
        />
      </button>

      {/* Floating Orderbook Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#090C16]/98 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-2 z-50 animate-reveal">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400 border-b border-white/10 flex justify-between items-center">
            <span>PAIR</span>
            <span>VELA</span>
          </div>

          <div className="mt-1.5 space-y-1">
            {options.map((option) => {
              const isSelected = language === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    setLanguage(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    isSelected
                      ? option.isGreen
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-white font-bold'
                        : 'bg-rose-500/20 border border-rose-500/50 text-white font-bold'
                      : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Japanese Candlestick */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div className={`w-[1px] h-1 ${option.isGreen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <div 
                        className={`w-2 h-2.5 rounded-[1px] ${
                          option.isGreen 
                            ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' 
                            : 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                        }`} 
                      />
                      <div className={`w-[1px] h-1 ${option.isGreen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    </div>

                    <span className="font-bold text-white text-xs">{option.pair}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span 
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        option.isGreen 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {option.side}
                    </span>
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 ${option.isGreen ? 'text-emerald-400' : 'text-rose-400'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
