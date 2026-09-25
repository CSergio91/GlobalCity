import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  ArrowRight, 
  Menu, 
  X, 
  Layers, 
  Zap, 
  Bot, 
  RefreshCw, 
  Copy,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onOpenTerminal: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTerminal, onNavigateSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: "multi-venue", label: "Multi-Exchange & Brokers" },
    { id: "arbitrage", label: "Arbitraje Sintético" },
    { id: "horizontal-showcase", label: "Módulos & Telegram" },
    { id: "rebalance", label: "Rebalanceo" },
    { id: "copy-trading", label: "Copy Trading Cruzado" },
    { id: "calculator", label: "Calculadora VWAP" }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[#07080C]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl py-3.5" 
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark & Isotype */}
        <div 
          onClick={() => onNavigateSection("hero")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <BrandLogo size="md" subtitle="MULTI-VENUE CONNECTOR" />
          <span className="hidden sm:inline-flex text-[10px] font-mono-nums px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F3E5AB] font-semibold items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
            CORE v2.4
          </span>
        </div>

        {/* Zone 2: Navigation Links (Pure typography, no boxed pills) */}
        <nav className="hidden xl:flex items-center gap-8 text-sm font-medium text-slate-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigateSection(item.id)}
              className="relative py-1 hover:text-white transition-colors cursor-pointer group"
            >
              <span>{item.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#E06D8A] to-[#2DD4BF] group-hover:w-full transition-all duration-300 rounded-full" />
            </button>
          ))}
        </nav>

        {/* Zone 3: Direct Action */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="hidden 2xl:flex items-center gap-2 text-xs font-mono-nums text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>6 Conectores Activos</span>
          </div>

          <button
            onClick={onOpenTerminal}
            className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#E06D8A] to-[#C95370] hover:from-[#ED7D9A] hover:to-[#E06D8A] transition-all rounded-xl shadow-lg shadow-[#E06D8A]/25 flex items-center gap-2.5 cursor-pointer active:scale-95 group border border-white/10"
          >
            <Terminal className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span>Abrir Terminal Unificado</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="xl:hidden flex items-center gap-3">
          <button
            onClick={onOpenTerminal}
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#E06D8A] rounded-lg"
          >
            Terminal
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0C0E14]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex flex-col gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigateSection(item.id);
                setMobileMenuOpen(false);
              }}
              className="text-left text-sm py-1.5 font-medium text-slate-300 hover:text-[#E06D8A] transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTerminal();
            }}
            className="w-full py-3 text-center text-xs font-bold text-white bg-[#E06D8A] rounded-xl mt-2"
          >
            Acceder al Terminal de Trading
          </button>
        </div>
      )}
    </header>
  );
};
