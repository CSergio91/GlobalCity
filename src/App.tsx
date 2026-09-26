import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HeroScrollCanvas } from './components/HeroScrollCanvas';
import { MultiVenueHub } from './components/MultiVenueHub';
import { HorizontalShowcase } from './components/HorizontalShowcase';
import { ArbitrageCalculator } from './components/ArbitrageCalculator';
import { AutoRebalancing } from './components/AutoRebalancing';
import { CrossCopyTrading } from './components/CrossCopyTrading';
import { TelegramOperations } from './components/TelegramOperations';
import { Footer } from './components/Footer';
import { DemoTerminal } from './components/DemoTerminal';
import { CandlestickCursor } from './components/CandlestickCursor';
import { ScrollReveal } from './components/ScrollReveal';
import { Terminal, ArrowRight, LogIn } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useAppRouter } from './context/RouterContext';
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';
import { ParallaxBackground } from './components/ParallaxBackground';
import panoramicSkylineVisual from './assets/images/global_city_panoramic_skyline_1790347023744.jpg';

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
    return (
      <>
        <CandlestickCursor />
        <LoginPage />
      </>
    );
  }

  // If on /operaciones, /terminal or /operations route, render the Trading & Operations Terminal
  if (isTerminalRoute) {
    return (
      <>
        <CandlestickCursor />
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
      
      {/* Global Japanese Candlestick (Green + Red) Cursor */}
      <CandlestickCursor />

      {/* Dynamic Immersive Navbar with Candlestick Pair Language Selector */}
      <Navbar 
        onOpenTerminal={handleOpenTerminal} 
        onNavigateSection={handleNavigateSection} 
      />

      <main className="flex-1">
        
        {/* Unified Hero + Multi-Venue Cinematic Scrub Experience:
            The background canvas remains pinned while Hero scrolls away and Multi-Venue rises up on top of it,
            scrubbing frames until the video flight reaches its final frame. */}
        <div id="hero-experience" className="relative w-full">
          {/* Pinned Video Canvas */}
          <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none z-0">
            <HeroScrollCanvas totalFrames={80} containerId="hero-experience" />
          </div>

          {/* Content Layer (Hero then MultiVenue rising on top of the scrolling video) */}
          <div className="relative z-10 -mt-[100vh]">
            {/* Section 1: Hero Deck */}
            <Hero onOpenTerminal={handleOpenTerminal} />

            {/* Section 2: Multi-Venue Liquidity Node rising directly over the scrubbing video */}
            <MultiVenueHub />
          </div>
        </div>

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
        <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-[#05060A] border-t border-white/5 select-none">
          {/* Panoramic Skyline Parallax Backdrop */}
          <ParallaxBackground 
            imageSrc={panoramicSkylineVisual} 
            alt="Global City Panoramic Skyline Backdrop" 
            opacity={0.30}
            speed={0.14}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.10),transparent_70%)] pointer-events-none" />

          <ScrollReveal direction="up" delay={50}>
            <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] drop-shadow-md">
                {t.cta.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] drop-shadow-[0_0_35px_rgba(244,114,182,0.45)]">
                  {t.cta.titleEnd}
                </span>
              </h2>

              <p className="mt-4 text-xs sm:text-sm lg:text-base text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
                {t.cta.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] hover:brightness-110 rounded-full shadow-[0_10px_35px_rgba(244,114,182,0.4)] flex items-center justify-center gap-2.5 cursor-pointer border border-white/20 transition-all active:scale-95 group"
                >
                  <LogIn className="w-4 h-4 text-white" />
                  <span>Login / Iniciar Operaciones</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleNavigateSection('multi-venue')}
                  className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] rounded-full cursor-pointer border border-white/15 hover:border-white/30 backdrop-blur-xl transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <span>{t.cta.exploreGatewaysBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
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
