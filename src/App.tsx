import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MultiVenueHub } from './components/MultiVenueHub';
import { HorizontalShowcase } from './components/HorizontalShowcase';
import { ArbitrageCalculator } from './components/ArbitrageCalculator';
import { AutoRebalancing } from './components/AutoRebalancing';
import { CrossCopyTrading } from './components/CrossCopyTrading';
import { TelegramOperations } from './components/TelegramOperations';
import { Footer } from './components/Footer';
import { DemoTerminal } from './components/DemoTerminal';
import { ArrowRight, Terminal, Layers, Zap, Bot, RefreshCw } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'landing' | 'terminal'>('landing');

  const handleOpenTerminal = () => {
    setView('terminal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setView('landing');
  };

  const handleNavigateSection = (sectionId: string) => {
    if (view === 'terminal') {
      setView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (view === 'terminal') {
    return <DemoTerminal onBackToLanding={handleBackToLanding} />;
  }

  return (
    <div className="min-h-screen bg-[#06070B] text-slate-100 flex flex-col selection:bg-[#E06D8A]/30 selection:text-white">
      
      {/* Dynamic Immersive Navbar with Full-Width Visual Alignment */}
      <Navbar 
        onOpenTerminal={handleOpenTerminal} 
        onNavigateSection={handleNavigateSection}
      />

      <main className="flex-1">
        
        {/* Section 1: Hero Command Deck with Parallax City Skyline Background */}
        <Hero 
          onOpenTerminal={handleOpenTerminal}
          onExploreModules={() => handleNavigateSection('horizontal-showcase')}
        />

        {/* Section 2: Unified Multi-Venue Portfolio & Live Streaming Quotes */}
        <MultiVenueHub onOpenTerminal={handleOpenTerminal} />

        {/* Section 3: Horizontal Panoramic Scroll Showcase (Ecosystem Modules) */}
        <HorizontalShowcase onOpenTerminal={handleOpenTerminal} />

        {/* Section 4: Quantitative Live L2 VWAP Arbitrage Calculator */}
        <div id="arbitrage">
          <ArbitrageCalculator />
        </div>

        {/* Section 5: Cross Copy Trading: Crypto to Forex CFDs & CME Futures */}
        <CrossCopyTrading />

        {/* Section 6: Smart Auto-Rebalancing Engine & Gas Tank */}
        <AutoRebalancing />

        {/* Section 7: Mobile Telegram Bot Control & Emergency Telemetry */}
        <TelegramOperations />

        {/* Section 8: High-Conversion Panoramic CTA */}
        <section className="min-h-[85vh] w-full flex flex-col justify-center py-32 bg-gradient-to-b from-[#07080D] via-[#0D101A] to-[#05060A] border-t border-white/10 relative overflow-hidden text-center select-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-[#D4AF37]/15 via-[#E06D8A]/15 to-[#2DD4BF]/10 blur-[120px] pointer-events-none opacity-60" />

          <div className="max-w-5xl mx-auto px-6 sm:px-10 relative z-10">
            <div className="flex items-center justify-center gap-3 text-xs tracking-[0.25em] uppercase font-mono text-[#D4AF37] mb-6">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <span>TERMINAL UNIFICADO EN VIVO</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>

            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] text-balance">
              Toma el Control Total de tu Operativa Global{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFF3B0] to-[#E06D8A]">
                en un Solo Lugar
              </span>
            </h2>

            <p className="mt-8 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed text-balance">
              Conecta tus cuentas bajo protocolo no custodial estricto en Bybit, OKX, cTrader, MetaTrader 5 y CME. Ejecuta arbitraje sintético simultáneo sub-100ms y opera con total tranquilidad desde Telegram.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
              <button
                onClick={handleOpenTerminal}
                className="w-full sm:w-auto px-10 py-5 text-sm font-bold text-white bg-gradient-to-r from-[#D4AF37] via-[#E06D8A] to-[#9E3553] hover:brightness-110 transition-all rounded-2xl shadow-[0_0_35px_rgba(224,109,138,0.35)] flex items-center justify-center gap-3 cursor-pointer active:scale-95 group border border-white/20"
              >
                <Terminal className="w-5 h-5 text-white" />
                <span>Acceder al Terminal de Trading</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={() => handleNavigateSection('multi-venue')}
                className="w-full sm:w-auto px-9 py-5 text-sm font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-all rounded-2xl cursor-pointer border border-white/10 backdrop-blur-md"
              >
                <span>Explorar Conectores y Sedes</span>
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Institutional Quiet Footer */}
      <Footer />

    </div>
  );
}
