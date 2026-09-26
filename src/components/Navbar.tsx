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
  const [activeSection, setActiveSection] = useState<string>("hero");
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { navigate } = useAppRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);

      const sectionIds = ["hero", "multi-venue", "arbitrage", "rebalance", "copy-trading", "telegram"];
      const scrollPosition = window.scrollY + 220;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginClick = () => {
    if (isAuthenticated) {
      navigate('/operaciones');
    } else {
      navigate('/login');
    }
  };

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    onNavigateSection(sectionId);
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
          ? "bg-black/30 backdrop-blur-xl shadow-lg h-14 sm:h-16" 
          : "bg-transparent h-16 sm:h-20"
      }`}
    >
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between relative">
        
        {/* 1. Left: Brand Logo */}
        <div className="flex items-center shrink-0 z-10">
          <div 
            onClick={() => handleNavClick("hero")}
            className="flex items-center cursor-pointer group shrink-0"
          >
            <BrandLogo size="md" />
          </div>
        </div>

        {/* 2. Center: Perfectly Centered on the Navbar Axis (Vertical & Horizontal) */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center justify-center gap-1 lg:gap-2 xl:gap-3 text-[11px] lg:text-xs font-semibold tracking-wider uppercase text-slate-300 z-10">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer group whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive 
                    ? "text-white font-bold bg-white/[0.08] border border-white/15 shadow-[0_0_15px_rgba(244,114,182,0.2)]" 
                    : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {/* Luminous Active Signal Dot */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] shadow-[0_0_8px_rgba(244,114,182,1)] animate-pulse shrink-0" />
                )}

                <span>{item.label}</span>

                {/* Bottom Luminous Indicator Bar (Hover & Active) */}
                <span 
                  className={`absolute -bottom-0.5 left-2.5 right-2.5 h-[2px] rounded-full bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] transition-all duration-300 ${
                    isActive 
                      ? "opacity-100 scale-x-100 shadow-[0_0_10px_rgba(244,114,182,0.9)]" 
                      : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
                  }`} 
                />
              </button>
            );
          })}
        </nav>

        {/* 3. Right: Language Selector + Login (Strictly at the right) */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3.5 shrink-0 z-10 ml-auto">
          <CandlestickLanguageSelector />

          {isAuthenticated && user ? (
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#0088CC]/20 border border-[#0088CC]/40 text-white hover:bg-[#0088CC]/30 transition-all cursor-pointer group shadow-lg shadow-[#0088CC]/20 shrink-0"
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
    </header>
  );
};
