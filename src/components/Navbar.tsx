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
          ? "bg-[#06070B]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl py-2.5 sm:py-3" 
          : "bg-gradient-to-b from-[#06070B]/95 via-[#06070B]/60 to-transparent border-b border-white/[0.04] py-3 sm:py-4"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-4">
        
        {/* Top Row: Brand Logo + Mobile Actions */}
        <div className="w-full md:w-auto flex items-center justify-between shrink-0">
          <div 
            onClick={() => onNavigateSection("hero")}
            className="flex items-center cursor-pointer group shrink-0"
          >
            <BrandLogo size="md" />
          </div>

          {/* Direct Actions on Mobile (Language + Login, NO Hamburger) */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <CandlestickLanguageSelector />
            <button
              onClick={handleLoginClick}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] text-white text-xs font-black tracking-wide uppercase shadow-md flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-white" />
              <span>Login</span>
            </button>
          </div>
        </div>

        {/* Visual Text Navigation: ALWAYS VISIBLE AT THE TOP ON ALL SCREENS */}
        <nav className="flex items-center justify-start md:justify-center gap-3.5 sm:gap-5 md:gap-6 lg:gap-8 text-[11px] md:text-xs font-semibold tracking-widest uppercase text-slate-300 overflow-x-auto no-scrollbar py-1">
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

        {/* Right Zone on Desktop (Language + Login) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <CandlestickLanguageSelector />

          {isAuthenticated && user ? (
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0088CC]/20 border border-[#0088CC]/40 text-white hover:bg-[#0088CC]/30 transition-all cursor-pointer group shadow-lg shadow-[#0088CC]/20"
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
              className="px-5 py-2 text-xs font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] hover:brightness-110 rounded-full shadow-[0_4px_20px_rgba(244,114,182,0.4)] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 group"
            >
              <LogIn className="w-3.5 h-3.5 text-white" />
              <span>Login</span>
              <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
