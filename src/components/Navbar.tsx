import React, { useState, useEffect } from 'react';
import { 
  ArrowRight,
  User,
  LayoutDashboard,
  Menu,
  X,
  Zap,
  Layers,
  CreditCard,
  Cpu,
  HelpCircle
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

export const Navbar: React.FC<NavbarProps> = ({ onOpenTerminal, onNavigateSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
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

  const navItems = [
    { id: "hero", label: language === 'en' ? "Home" : "Inicio", icon: Zap },
    { id: "programs", label: language === 'en' ? "Programs" : "Programas", icon: Layers },
    { id: "terminal", label: language === 'en' ? "Terminal" : "Terminal", icon: Cpu },
    { id: "markets", label: language === 'en' ? "Markets" : "Mercados", icon: ArrowRight },
    { id: "faq", label: language === 'en' ? "FAQ" : "FAQ", icon: HelpCircle }
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    setIsMobileMenuOpen(false);
    setActiveSection(item.id);
    onNavigateSection(item.id);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none ${
        scrolled 
          ? "bg-slate-950/85 backdrop-blur-md border-b border-white/5 h-14 sm:h-20" 
          : "bg-transparent border-none h-16 sm:h-24 lg:h-28"
      }`}
    >
      <div className="w-full h-full max-w-[1600px] mx-auto px-3 sm:px-10 lg:px-16 flex items-center justify-between relative">
        
        {/* 1. Left: Brand Logo (Animated Entrance) */}
        <div className="flex items-center shrink-0 z-10 animate-reveal">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center cursor-pointer group shrink-0 transition-transform hover:scale-105"
          >
            <BrandLogo size="lg" lightMode={false} showText={true} />
          </div>
        </div>

        {/* 2. Center: Clean Navigation Links matching reference design (Animated Entrance) */}
        <nav className="global-desktop-nav items-center justify-center gap-6 lg:gap-8 text-sm font-medium text-slate-300 z-10 mx-auto bg-transparent border-none animate-reveal" style={{ animationDelay: '120ms' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="hover:text-white transition-colors cursor-pointer whitespace-nowrap text-slate-300/90 text-sm"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* 3. Right: Language Selector + Login + Get Funded Pill (Animated Entrance) */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 shrink-0 z-10 animate-reveal" style={{ animationDelay: '200ms' }}>
          {/* Language Selector: Visible on Desktop/Tablet */}
          <div className="desktop-only-flex items-center">
            <CandlestickLanguageSelector compactMobile />
          </div>

          {/* Minimal Login Text Button (Hidden on small mobile, accessible in drawer) */}
          <button
            onClick={handleLoginClick}
            className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5 cursor-pointer"
          >
            {hasConnection || isAuthenticated ? "Dashboard" : "Login"}
          </button>

          {/* Pill "Get Funded" Button */}
          <button
            onClick={() => {
              try {
                sessionStorage.setItem('eklipse_auth_mode', 'register');
              } catch {}
              navigate('/login?mode=register');
            }}
            className="px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:brightness-110 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all active:scale-95 cursor-pointer hover:scale-105 whitespace-nowrap"
          >
            {language === 'en' ? 'Get Funded' : 'Obtener Fondeo'}
          </button>

          {/* Hamburger Toggle Button (Mobile phones < 768px) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="global-mobile-menu-btn p-1.5 sm:p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/20 text-white transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú de navegación"}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            ) : (
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            )}
          </button>
        </div>

      </div>

      {/* Slide-Down Navigation Menu (Mobile Phones < 768px) */}
      {isMobileMenuOpen && (
        <div className="global-mobile-menu fixed inset-x-0 top-14 sm:top-20 bg-slate-950/95 backdrop-blur-2xl border-b border-purple-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] px-4 sm:px-6 py-4 space-y-3 z-40 animate-reveal max-h-[calc(100dvh-4rem)] overflow-y-auto">
          {/* Header Row: Ecosystem + Status */}
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-2 pb-1.5 border-b border-white/10 flex justify-between items-center">
            <span>Eklipse Funded</span>
            <span className="text-[#A855F7] flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] animate-ping" />
              Terminal Propia v10
            </span>
          </div>

          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-between px-2 py-1 bg-white/[0.03] rounded-xl border border-white/5">
            <span className="text-xs font-mono text-slate-300 font-medium">
              {language === 'en' ? 'Language / Idioma' : 'Idioma / Language'}
            </span>
            <CandlestickLanguageSelector compactMobile />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer text-slate-300 hover:text-white hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white/5 text-purple-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mobile Footer CTAs */}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={handleLoginClick}
              className="w-full py-2.5 px-4 text-xs font-semibold tracking-wider text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:brightness-110 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>{hasConnection ? 'Dashboard' : 'Login'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
