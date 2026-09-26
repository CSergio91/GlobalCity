import React, { useState, useEffect } from 'react';
import { 
  Send,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CandlestickLanguageSelector } from './CandlestickLanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useAppRouter } from '../context/RouterContext';

interface NavbarProps {
  onOpenTerminal?: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { navigate } = useAppRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginClick = () => {
    if (isAuthenticated) {
      navigate('/operaciones');
    } else {
      navigate('/login');
    }
  };

  const navItems = [
    { id: "hero", label: "Inicio" },
    { id: "multi-venue", label: t.nav.multiVenue },
    { id: "arbitrage", label: t.nav.arbitrage },
    { id: "rebalance", label: t.nav.rebalance },
    { id: "copy-trading", label: t.nav.copyTrading },
    { id: "telegram", label: "Telegram Ops" }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none ${
        scrolled 
          ? "bg-black/20 backdrop-blur-xl shadow-lg py-2.5 sm:py-3" 
          : "bg-transparent py-3 sm:py-4"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* 1. Left: Brand Logo */}
        <div className="flex items-center shrink-0">
          <div 
            onClick={() => onNavigateSection("hero")}
            className="flex items-center cursor-pointer group shrink-0"
          >
            <BrandLogo size="md" />
          </div>
        </div>

        {/* 2. Center: Navigation Menu (Desktop & Tablets) */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-3.5 lg:gap-6 xl:gap-8 text-[11px] lg:text-xs font-semibold tracking-widest uppercase text-slate-300 overflow-x-auto no-scrollbar py-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigateSection(item.id)}
              className="relative py-1 hover:text-white transition-colors cursor-pointer group whitespace-nowrap shrink-0"
            >
              <span>{item.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] group-hover:w-full transition-all duration-300 rounded-full" />
            </button>
          ))}
        </nav>

        {/* 3. Right: Language Selector + Login (Strictly at the right) */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3.5 shrink-0">
          <CandlestickLanguageSelector />

          {isAuthenticated && user ? (
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#0088CC]/20 border border-[#0088CC]/40 text-white hover:bg-[#0088CC]/30 transition-all cursor-pointer group shadow-lg shadow-[#0088CC]/20 shrink-0"
              title="Sesión de Telegram Activa"
            >
              <div className="w-5 h-5 rounded-full bg-[#0088CC] flex items-center justify-center text-white">
                <Send className="w-3 h-3" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-white">{user.firstName || user.username}</span>
                <span className="text-[10px] font-mono text-emerald-400">En Línea</span>
              </div>
            </button>
          ) : (
            <button
              onClick={handleLoginClick}
              className="px-4 sm:px-5 py-1.5 sm:py-2 text-xs font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] hover:brightness-110 rounded-full shadow-[0_4px_20px_rgba(244,114,182,0.4)] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 group shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-white" />
              <span>Login</span>
              <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

      </div>

      {/* Mobile-only menu bar: sits cleanly below the main row without wrapping or breaking right controls */}
      <div className="flex md:hidden w-full px-4 pt-2 pb-0.5 overflow-x-auto no-scrollbar justify-center items-center gap-4 text-[11px] font-semibold tracking-wider uppercase text-slate-300">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigateSection(item.id)}
            className="whitespace-nowrap hover:text-white transition-colors cursor-pointer py-0.5 shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
