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

  const options: { id: Language; pair: string; label: string; isBullish: boolean; change: string }[] = [
    { id: 'en', pair: 'EN/USDT', label: 'English', isBullish: true, change: '+100%' },
    { id: 'es', pair: 'ES/USDT', label: 'Español', isBullish: false, change: '+99.8%' },
  ];

  const currentOption = options.find((o) => o.id === language) || options[0];

  return (
    <div ref={dropdownRef} className="relative select-none">
      {/* Candlestick Trading Selector Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-liquid flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-white/30 transition-all cursor-pointer font-mono text-xs group shadow-lg shadow-black/40"
        title="Change Trading Pair / Language"
      >
        {/* Japanese Candlestick Micro-Graphic */}
        <div className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            {/* Upper Wick */}
            <div className={`w-[1px] h-1.5 ${currentOption.isBullish ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            {/* Candle Body */}
            <div 
              className={`w-2.5 h-3 rounded-[1px] ${
                currentOption.isBullish 
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' 
                  : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
              }`} 
            />
            {/* Lower Wick */}
            <div className={`w-[1px] h-1.5 ${currentOption.isBullish ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          </div>
        </div>

        {/* Currency Pair Representation */}
        <div className="flex items-center gap-1 font-bold">
          <span className="text-white tracking-wide">{currentOption.pair}</span>
          <span className="text-[10px] text-emerald-400 font-normal hidden sm:inline">{currentOption.change}</span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''}`} />
      </button>

      {/* Floating Trading Book Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#090B12]/95 backdrop-blur-2xl border border-white/20 shadow-[0_15px_50px_rgba(0,0,0,0.9)] p-1.5 z-50 animate-reveal">
          <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/10 flex justify-between items-center">
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
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  language === option.id
                    ? 'bg-gradient-to-r from-white/10 to-white/5 border border-white/20 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Miniature Candle */}
                  <div className="flex flex-col items-center">
                    <div className={`w-[1px] h-1 ${option.isBullish ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <div className={`w-1.5 h-2.5 rounded-[1px] ${option.isBullish ? 'bg-emerald-400' : 'bg-rose-500'}`} />
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
