import React, { useState, useEffect } from 'react';
import { 
  ArrowRight,
  User,
  LayoutDashboard,
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
  const { t, language, setLanguage } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { navigate } = useAppRouter();

  // Detect active connection / authentication in localStorage
  const [hasConnection, setHasConnection] = useState<boolean>(() => {
    try {
      const authUser = localStorage.getItem('globalcity_auth_user');
      const exchangeConn = localStorage.getItem('globalcity_exchange_connections');
      return !!authUser || (!!exchangeConn && exchangeConn !== '[]' && exchangeConn !== '{}');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const checkConnection = () => {
      try {
        const authUser = localStorage.getItem('globalcity_auth_user');
        const exchangeConn = localStorage.getItem('globalcity_exchange_connections');
        setHasConnection(isAuthenticated || !!authUser || (!!exchangeConn && exchangeConn !== '[]' && exchangeConn !== '{}'));
      } catch {
        setHasConnection(isAuthenticated);
      }
    };

    checkConnection();
    window.addEventListener('storage', checkConnection);
    return () => window.removeEventListener('storage', checkConnection);
  }, [isAuthenticated, user]);

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
    if (hasConnection || isAuthenticated) {
      navigate('/operations');
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
          ? "bg-[#06070B]/90 backdrop-blur-xl shadow-lg border-b border-white/[0.08] h-16 sm:h-18" 
          : "bg-[#06070B]/60 backdrop-blur-md border-b border-white/[0.04] h-16 sm:h-20"
      }`}
    >
      <div className="w-full h-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
        
        {/* 1. Left: Brand Logo (Transparent optimized PNG, no circles) */}
        <div className="flex items-center shrink-0 z-10">
          <div 
            onClick={() => handleNavClick("hero")}
            className="flex items-center cursor-pointer group shrink-0"
          >
            <BrandLogo size="md" />
          </div>
        </div>

        {/* 2. Center: Prominent Superior Navigation (Always visible from 768px and up, desktop & tablet) */}
        <nav className="global-desktop-nav items-center justify-center gap-1 lg:gap-2 xl:gap-3 text-[10.5px] lg:text-xs font-semibold tracking-wider uppercase text-slate-300 z-10 mx-auto">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-2.5 lg:px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer group whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive 
                    ? "text-white font-bold bg-white/[0.12] border border-white/20 shadow-[0_0_15px_rgba(244,114,182,0.25)]" 
                    : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {/* Luminous Active Signal Dot */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] shadow-[0_0_8px_rgba(244,114,182,1)] animate-pulse shrink-0" />
                )}

                <span>{item.label}</span>

                {/* Bottom Luminous Indicator Bar (Hover & Active) */}
                <span 
                  className={`absolute -bottom-0.5 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] transition-all duration-300 ${
                    isActive 
                      ? "opacity-100 scale-x-100 shadow-[0_0_10px_rgba(244,114,182,0.9)]" 
                      : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
                  }`} 
                />
              </button>
            );
          })}
        </nav>

        {/* 3. Right: Candlestick Language Selector (Desktop only) + Action Button + Mobile Hamburger Toggle */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0 z-10">
          {/* Japanese Candlestick Selector: Visible ONLY on Desktop/Tablet >= 768px, removed from mobile top navbar */}
          <div className="desktop-only-flex items-center">
            <CandlestickLanguageSelector compactMobile />
          </div>

          {/* Action Button: Dashboard if connection detected in localStorage, otherwise Login */}
          <button
            onClick={handleLoginClick}
            className="px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] hover:brightness-110 rounded-full shadow-[0_2px_12px_rgba(244,114,182,0.35)] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 group shrink-0"
            title={hasConnection ? "Ir al Dashboard de Operaciones" : "Iniciar Sesión"}
          >
            {hasConnection ? (
              <LayoutDashboard className="w-3.5 h-3.5 text-white" />
            ) : (
              <User className="w-3.5 h-3.5 text-white" />
            )}
            <span>{hasConnection ? "Dashboard" : "Login"}</span>
            <ArrowRight className="hidden sm:inline w-3 h-3 text-white group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Hamburger Toggle Button (Mobile phones < 768px: ALWAYS Visible with safe margin) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="global-mobile-menu-btn p-1.5 sm:p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-slate-200 hover:text-white transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm"
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

      {/* Slide-Down Navigation Menu (Mobile Phones < 768px) */}
      {isMobileMenuOpen && (
        <div className="global-mobile-menu fixed inset-x-0 top-16 sm:top-18 bg-[#070912]/98 backdrop-blur-2xl border-b border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.95)] px-4 sm:px-6 py-5 space-y-3.5 z-40 animate-reveal max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Header Row: Ecosystem + Status */}
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-2 pb-1 border-b border-white/10 flex justify-between items-center">
            <span>Navegación del Ecosistema</span>
            <span className="text-[#2DD4BF] flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-ping" />
              Direct Market Access
            </span>
          </div>

          {/* Mobile Language Selector Row: Clean Dual-Pair Pill Switch */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-xs font-semibold text-slate-300">
              Idioma / Language
            </span>
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setLanguage('es')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  language === 'es'
                    ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>ES/BTC</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-rose-500/25 text-rose-400 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>EN/USD</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? "text-white bg-gradient-to-r from-white/[0.14] to-white/[0.04] border border-white/20 shadow-[0_0_15px_rgba(244,114,182,0.25)] font-bold"
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
              {hasConnection ? (
                <LayoutDashboard className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
              <span>{hasConnection ? 'Dashboard' : 'Login'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
