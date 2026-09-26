import React, { useState, useEffect } from 'react';
import { 
  Send,
  ArrowRight,
  LogIn,
  Menu,
  X,
  Compass,
  Layers,
  Repeat,
  Share2,
  Bot
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setIsMobileMenuOpen(false);
    if (isAuthenticated) {
      navigate('/operaciones');
    } else {
      navigate('/login');
    }
  };

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
    onNavigateSection(sectionId);
  };

  const navItems = [
    { id: "hero", label: "Inicio", icon: Compass },
    { id: "multi-venue", label: t.nav.multiVenue, icon: Layers },
    { id: "arbitrage", label: t.nav.arbitrage, icon: Repeat },
    { id: "rebalance", label: t.nav.rebalance, icon: Repeat },
    { id: "copy-trading", label: t.nav.copyTrading, icon: Share2 },
    { id: "telegram", label: "Telegram Ops", icon: Bot }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none ${
        scrolled 
          ? "bg-black/60 backdrop-blur-xl shadow-lg border-b border-white/[0.06] h-16 sm:h-18" 
          : "bg-transparent h-16 sm:h-20"
      }`}
    >
      <div className="w-full h-full px-3.5 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between relative">
        
        {/* 1. Left: Brand Logo (Enlarged and Clean, No circular borders) */}
        <div className="flex items-center shrink-0 z-10">
          <div 
            onClick={() => handleNavClick("hero")}
            className="flex items-center cursor-pointer group shrink-0"
          >
            <BrandLogo size="md" />
          </div>
        </div>

        {/* 2. Center: Prominent Desktop Navigation in Main Flex Flow */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-1 lg:gap-2 xl:gap-3 text-[11px] lg:text-xs font-semibold tracking-wider uppercase text-slate-300 z-10 mx-2 lg:mx-4">
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

        {/* 3. Right: Candlestick Language Selector + Login + Mobile Hamburger Toggle */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 shrink-0 z-10 ml-auto">
          {/* Japanese Candlestick Selector (Responsive) */}
          <CandlestickLanguageSelector />

          {/* Login Button (Responsive) */}
          {isAuthenticated && user ? (
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#0088CC]/20 border border-[#0088CC]/40 text-white hover:bg-[#0088CC]/30 transition-all cursor-pointer group shadow-lg shadow-[#0088CC]/20 shrink-0"
              title="Sesión de Telegram Activa"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#0088CC] flex items-center justify-center text-white shrink-0">
                <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </div>
              <div className="hidden xs:flex flex-col text-left leading-tight">
                <span className="text-[11px] sm:text-xs font-bold text-white max-w-[70px] sm:max-w-none truncate">{user.firstName || user.username}</span>
                <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400">En Línea</span>
              </div>
            </button>
          ) : (
            <button
              onClick={handleLoginClick}
              className="px-2.5 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] hover:brightness-110 rounded-full shadow-[0_2px_12px_rgba(244,114,182,0.35)] flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-all active:scale-95 group shrink-0"
            >
              <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              <span>Login</span>
              <ArrowRight className="hidden sm:inline w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Mobile Hamburger Toggle Button (Mobile Only) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 hover:text-white transition-all cursor-pointer shrink-0 active:scale-95"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú de navegación"}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-rose-400" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile Slide-Down Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-[#070912]/98 backdrop-blur-2xl border-b border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.95)] px-4 py-5 space-y-3 z-40 animate-reveal">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-2 pb-1 border-b border-white/10 flex justify-between items-center">
            <span>Navegación del Ecosistema</span>
            <span className="text-[#2DD4BF] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-ping" />
              Direct Market Access
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 pt-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? "text-white bg-gradient-to-r from-white/[0.12] to-white/[0.04] border border-white/20 shadow-[0_0_15px_rgba(244,114,182,0.25)]"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isActive ? "bg-white/10 text-[#F472B6]" : "bg-white/5 text-slate-400"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] shadow-[0_0_8px_rgba(244,114,182,1)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Footer CTAs */}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={handleLoginClick}
              className="w-full py-2.5 px-4 text-xs font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] hover:brightness-110 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span>{isAuthenticated ? 'Abrir Terminal de Operaciones' : 'Iniciar Sesión con Telegram'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
