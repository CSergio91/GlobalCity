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
import { LiquidFollower } from './components/LiquidFollower';
import { ScrollReveal } from './components/ScrollReveal';
import { Terminal, ArrowRight } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useAppRouter } from './context/RouterContext';
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';

function MainAppContent() {
  const { currentPath, navigate } = useAppRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const isLoginRoute = currentPath === '/login';
  const isTerminalRoute = 
    currentPath === '/terminal' || 
    currentPath === '/operaciones' || 
    currentPath === '/operations';

  const handleOpenTerminal = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/operaciones');
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    navigate('/operaciones');
  };

  const handleNavigateSection = (sectionId: string) => {
    if (isTerminalRoute || isLoginRoute) {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If on /login route, render the full-screen split LoginPage
  if (isLoginRoute) {
    return <LoginPage />;
  }

  // If on /operaciones, /terminal or /operations route, render the Trading & Operations Terminal
  if (isTerminalRoute) {
    return (
      <>
        <DemoTerminal 
          onBackToLanding={() => navigate('/')} 
          onOpenAuth={() => navigate('/login')}
        />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onSuccess={handleAuthSuccess} 
        />
      </>
    );
  }

  // Otherwise, render the Landing Page
  return (
    <div className="min-h-screen bg-[#06070B] text-slate-100 flex flex-col selection:bg-[#EC4899]/30 selection:text-white relative">
      
      {/* Interactive Liquid Water Follower */}
      <LiquidFollower />

      {/* Dynamic Immersive Navbar with Candlestick Pair Language Selector */}
      <Navbar 
        onOpenTerminal={handleOpenTerminal} 
        onNavigateSection={handleNavigateSection} 
      />

      <main className="flex-1">
        
        {/* Section 1: Hero Command Deck with Parallax City Skyline Background */}
        <section id="hero">
          <Hero onOpenTerminal={handleOpenTerminal} />
        </section>

        {/* Section 2: Multi-Venue Liquidity Node & Connectivity Plane */}
        <section id="multi-venue">
          <MultiVenueHub />
        </section>

        {/* Section 3: Horizontal Interactive Showcase (Sticky Drag Scroller) */}
        <section id="horizontal-showcase">
          <HorizontalShowcase />
        </section>

        {/* Section 4: Real-time Multi-Exchange Synthetic Arbitrage Engine */}
        <section id="arbitrage">
          <ArbitrageCalculator />
        </section>

        {/* Section 5: Automated Portfolio Rebalancing */}
        <section id="rebalance">
          <AutoRebalancing />
        </section>

        {/* Section 6: Cross-Broker Synchronized Copy Trading */}
        <section id="copy-trading">
          <CrossCopyTrading />
        </section>

        {/* Section 7: Telegram Webhook Automated Operations */}
        <section id="telegram">
          <TelegramOperations />
        </section>

        {/* Section 8: Final Call to Action */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#06070B] via-[#0E1019] to-[#06070B] border-t border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.12),transparent_70%)] pointer-events-none" />

          <ScrollReveal direction="up" delay={50}>
            <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
              <span className="text-xs uppercase tracking-widest text-[#F472B6] font-mono-nums font-bold">
                {t.cta.badge}
              </span>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight text-shadow-hero">
                {t.cta.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#818CF8]">
                  {t.cta.titleEnd}
                </span>
              </h2>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                {t.cta.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={handleOpenTerminal}
                  className="btn-liquid w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#818CF8] hover:brightness-110 rounded-2xl shadow-xl shadow-[#EC4899]/30 flex items-center justify-center gap-2 cursor-pointer border border-white/20 group"
                >
                  <Terminal className="w-5 h-5 text-white" />
                  <span>{t.cta.accessTerminalBtn}</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
                </button>

                <button
                  onClick={() => handleNavigateSection('multi-venue')}
                  className="btn-liquid w-full sm:w-auto px-8 sm:px-9 py-4 sm:py-5 text-xs sm:text-sm font-semibold text-white bg-black/40 hover:bg-black/60 rounded-2xl cursor-pointer border border-white/20 backdrop-blur-xl"
                >
                  <span>{t.cta.exploreGatewaysBtn}</span>
                </button>
              </div>
            </div>
          </ScrollReveal>
        </section>

      </main>

      {/* Institutional Quiet Footer */}
      <Footer />

      {/* Telegram & Institutional Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={handleAuthSuccess} 
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RouterProvider>
          <MainAppContent />
        </RouterProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
