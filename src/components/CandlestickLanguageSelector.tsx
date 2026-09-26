import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { ChevronDown, Check } from 'lucide-react';

interface LanguagePairOption {
  id: Language;
  pair: string;
  label: string;
  isBullish: boolean;
  leverage: string;
}

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

  const options: LanguagePairOption[] = [
    { id: 'es', pair: 'ES/BTC', label: 'Español', isBullish: true, leverage: 'LONG' },
    { id: 'en', pair: 'EN/USD', label: 'English', isBullish: true, leverage: 'LONG' },
  ];

  const currentOption = options.find((o) => o.id === language) || options[0];

  return (
    <div ref={dropdownRef} className="relative select-none shrink-0">
      {/* Candlestick Trading Selector Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/20 hover:border-white/35 transition-all cursor-pointer shadow-lg active:scale-95 group"
        title="Cambiar Par de Idioma / Change Language Pair"
        aria-label="Seleccionar Par de Idioma"
      >
        {/* Japanese Candlestick Micro-Graphic */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="w-[1.5px] h-1.5 bg-emerald-400" />
          <div className="w-2.5 h-3.5 rounded-[1.5px] bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
          <div className="w-[1.5px] h-1.5 bg-emerald-400" />
        </div>

        {/* Trading Pair Symbol (ES/BTC or EN/USD) */}
        <span className="font-mono font-black text-xs tracking-wider text-white">
          {currentOption.pair}
        </span>

        {/* Clear Language Label on Desktop */}
        <span className="text-xs font-semibold text-slate-200 tracking-wide">
          · {currentOption.label}
        </span>

        <ChevronDown 
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`} 
        />
      </button>

      {/* Floating Orderbook Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#090C16]/95 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-2 z-50 animate-reveal">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400 border-b border-white/10 flex justify-between items-center">
            <span>PAIR / VELAS</span>
            <span>SIDE</span>
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 border border-emerald-500/50 text-white font-bold shadow-sm'
                      : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Japanese Candlestick */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div className={`w-[1px] h-1 ${option.isBullish ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <div className={`w-2 h-2.5 rounded-[1px] ${option.isBullish ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-rose-500'}`} />
                      <div className={`w-[1px] h-1 ${option.isBullish ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    </div>

                    <div className="text-left font-mono">
                      <div className="font-bold text-white text-xs">{option.pair}</div>
                      <div className="text-[10px] font-sans text-slate-300 font-medium">{option.label}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {option.leverage}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-400" />
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
};;
