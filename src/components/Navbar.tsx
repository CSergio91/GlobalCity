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
  Bot,
  Zap,
  Cpu
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

      const sectionIds = ["hero", "programs", "terminal", "markets", "faq"];
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
      navigate('/dashboard');
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
    { id: "hero", label: language === 'en' ? "Home" : "Inicio", icon: Compass },
    { id: "programs", label: language === 'en' ? "Funding" : "Fondeo", icon: Zap },
    { id: "terminal", label: language === 'en' ? "Terminal" : "Terminal", icon: Cpu },
    { id: "markets", label: language === 'en' ? "Markets" : "Mercados", icon: Repeat },
    { id: "faq", label: "FAQ", icon: Bot }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none ${
        scrolled 
          ? "bg-slate-950/60 backdrop-blur-md border-none shadow-none h-20 sm:h-22" 
          : "bg-transparent border-none shadow-none h-22 sm:h-28"
      }`}
    >
      <div className="w-full h-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
        
        {/* 1. Left: Brand Logo (Transparent optimized PNG, no circles) */}
        <div className="flex items-center shrink-0 z-10">
          <div 
            onClick={() => handleNavClick("hero")}
            className="flex items-center cursor-pointer group shrink-0"
          >
            <BrandLogo size="lg" lightMode={false} showText={true} />
          </div>
        </div>

        {/* 2. Center: Integrated Superior Navigation directly on top of the hero background */}
        <nav className="global-desktop-nav items-center justify-center gap-1 lg:gap-1.5 text-[11px] lg:text-[11.5px] font-mono tracking-wider uppercase z-10 mx-auto bg-transparent border-none">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer group whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive 
                    ? "text-white font-bold bg-white/10 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]" 
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {/* Luminous Active Signal Dot */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse shrink-0" />
                )}

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 3. Right: Candlestick Language Selector (Desktop only) + Action Button + Mobile Hamburger Toggle */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0 z-10">
          {/* Japanese Candlestick Selector: Visible ONLY on Desktop/Tablet >= 768px */}
          <div className="desktop-only-flex items-center">
            <CandlestickLanguageSelector compactMobile />
          </div>

          {/* Action Button: Dashboard if authenticated, otherwise Portal Traders / Login */}
          <button
            onClick={handleLoginClick}
            className="px-4 sm:px-5 py-2 text-[11px] sm:text-xs font-mono font-black tracking-wider uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 rounded-xl border border-amber-200/60 shadow-[2px_2px_0px_#000000,0_0_15px_rgba(245,158,11,0.35)] flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 group shrink-0"
            title={hasConnection || isAuthenticated ? (language === 'en' ? "Trader Dashboard" : "Dashboard de Traders") : (language === 'en' ? "Trader Portal Login" : "Portal de Clientes")}
          >
            {hasConnection || isAuthenticated ? (
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-950" />
            ) : (
              <User className="w-3.5 h-3.5 text-slate-950" />
            )}
            <span>{hasConnection || isAuthenticated ? "Dashboard" : (language === 'en' ? "Portal Traders" : "Portal Traders")}</span>
            <ArrowRight className="hidden sm:inline w-3 h-3 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Hamburger Toggle Button (Mobile phones < 768px) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="global-mobile-menu-btn p-1.5 sm:p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/20 text-white transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú de navegación"}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-purple-400" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

      </div>

      {/* Slide-Down Navigation Menu (Mobile Phones < 768px) */}
      {isMobileMenuOpen && (
        <div className="global-mobile-menu fixed inset-x-0 top-20 sm:top-22 bg-slate-950/95 backdrop-blur-2xl border-b border-purple-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] px-4 sm:px-6 py-5 space-y-3.5 z-40 animate-reveal max-h-[calc(100vh-5rem)] overflow-y-auto">
          {/* Header Row: Ecosystem + Status */}
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-2 pb-1 border-b border-purple-100 flex justify-between items-center">
            <span>Eklipse Funded</span>
            <span className="text-[#7C3AED] flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-ping" />
              Terminal Propia v10
            </span>
          </div>

          {/* Mobile Language Selector Row: Clean Dual-Pair Pill Switch */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-purple-50/80 border border-purple-200">
            <span className="text-xs font-semibold text-slate-800">
              Idioma / Language
            </span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-purple-200 shadow-sm">
              <button
                onClick={() => setLanguage('es')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  language === 'es'
                    ? 'bg-purple-100 text-[#6D28D9] border border-purple-300 shadow-sm'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>ES/BTC</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-purple-100 text-[#6D28D9] border border-purple-300 shadow-sm'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
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
                      ? "text-[#5B21B6] bg-purple-100/90 border border-purple-300 shadow-sm font-bold"
                      : "text-slate-700 hover:text-[#5B21B6] hover:bg-purple-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isActive ? "bg-white text-[#7C3AED] shadow-sm" : "bg-purple-50 text-slate-500"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
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
