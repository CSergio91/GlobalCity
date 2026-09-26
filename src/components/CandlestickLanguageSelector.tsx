import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { ChevronDown, Check } from 'lucide-react';

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

  const options: { id: Language; code: string; label: string; flag: string }[] = [
    { id: 'es', code: 'ES', label: 'Español', flag: '🇪🇸' },
    { id: 'en', code: 'EN', label: 'English', flag: '🇺🇸' },
  ];

  const currentOption = options.find((o) => o.id === language) || options[0];

  return (
    <div ref={dropdownRef} className="relative select-none shrink-0">
      {/* Crisp, Crystal-Clear Language Selector Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-full bg-slate-900/80 hover:bg-slate-800/90 border border-white/20 hover:border-white/40 transition-all cursor-pointer text-xs font-semibold text-white shadow-lg active:scale-95 group"
        title="Cambiar Idioma / Change Language"
        aria-label="Seleccionar Idioma"
      >
        <span className="text-base leading-none select-none">{currentOption.flag}</span>
        
        {/* Clearly readable language label on desktop */}
        <span className="text-xs font-bold text-white tracking-wide">
          {currentOption.label}
        </span>

        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-amber-300 border border-white/10">
          {currentOption.code}
        </span>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''}`} />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0B0F19]/95 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-2 z-50 animate-reveal">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400 border-b border-white/10">
            Idioma / Language
          </div>

          <div className="mt-1 space-y-1">
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
                      ? 'bg-gradient-to-r from-[#FBBF24]/20 to-[#F472B6]/20 border border-[#F472B6]/50 text-white font-bold shadow-sm'
                      : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{option.flag}</span>
                    <div className="text-left">
                      <div className="font-bold text-white text-xs">{option.label}</div>
                      <div className="text-[10px] font-mono text-slate-400">{option.code}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[#F472B6]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};;
