import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HeroScrollCanvas } from './components/HeroScrollCanvas';
import { ProgramsSection } from './components/ProgramsSection';
import { HorizontalShowcase } from './components/HorizontalShowcase';
import { MarketsSection } from './components/MarketsSection';
import { PayoutRoadmapSection } from './components/PayoutRoadmapSection';
import { WhyEklipseSection } from './components/WhyEklipseSection';
import { CommunitySection } from './components/CommunitySection';
import { FAQSection } from './components/FAQSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { TradingTerminal } from './components/TradingTerminal';
import { UserSession } from './lib/supabase';
import { CandlestickCursor } from './components/CandlestickCursor';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useAppRouter } from './context/RouterContext';
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';
import { TraderDashboardApp } from './modules/dashboard/TraderDashboardApp';
import { InstitutionalCrmApp } from './modules/crm/InstitutionalCrmApp';

function MainAppContent() {
  const { currentPath, subdomain, navigate } = useAppRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  const isCrmRoute = currentPath === '/nexus' || currentPath === '/crm' || subdomain === 'nexus';
  const isDashboardRoute = currentPath === '/dashboard' || subdomain === 'dashboard';
  const isLoginRoute = currentPath === '/login';
  const isTerminalRoute = 
    currentPath === '/terminal' || 
    currentPath === '/operaciones' || 
    currentPath === '/operations';

  const handleOpenTerminal = () => {
    navigate('/operations');
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    navigate('/dashboard');
  };

  const handleNavigateSection = (sectionId: string) => {
    if (isTerminalRoute || isLoginRoute || isDashboardRoute || isCrmRoute) {
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

  // 1. If on /nexus route or nexus.* subdomain, render the Institutional CRM Nexus
  if (isCrmRoute) {
    return (
      <InstitutionalCrmApp 
        onBackToTerminal={() => navigate('/')} 
        onLogout={() => navigate('/')} 
      />
    );
  }

  // 2. If on /dashboard route or dashboard.* subdomain, render the Trader Dashboard (or Trader Login if unauthenticated)
  if (isDashboardRoute) {
    if (!isAuthenticated) {
      return <LoginPage />;
    }
    return (
      <TraderDashboardApp 
        onBackToLanding={() => navigate('/')} 
        onLogout={() => {
          logout();
          navigate('/dashboard');
        }}
        onGoToTerminal={() => navigate('/operations')}
      />
    );
  }

  // 3. If on /login route, render the full-screen LoginPage
  if (isLoginRoute) {
    return <LoginPage />;
  }

  // 4. If on /operaciones, /terminal or /operations route, render the real Institutional Trading Platform (KLineCharts v10)
  if (isTerminalRoute) {
    const terminalUser: UserSession | null = user ? {
      id: user.id,
      email: (user as any).email || `${user.username || 'trader'}@eklipsefunded.com`,
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username,
      avatarUrl: user.photoUrl,
      isDemo: user.authProvider === 'demo',
      provider: (user.authProvider as any) || 'demo',
      role: 'trader',
      isVerified: true
    } : null;

    return (
      <TradingTerminal 
        currentLang={language}
        user={terminalUser}
        onExit={() => {
          if (isAuthenticated) {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        }}
        onOpenAuth={() => navigate('/login')}
        onLanguageChange={(newLang) => setLanguage(newLang)}
      />
    );
  }

  // Otherwise, render the Landing Page with the 11-section master architecture
  return (
    <div className="min-h-screen bg-[#06070B] text-white flex flex-col selection:bg-amber-400/20 selection:text-amber-300 relative transition-colors duration-500">
      
      {/* Dynamic Immersive Navbar with Candlestick Pair Language Selector */}
      <Navbar 
        onOpenTerminal={handleOpenTerminal} 
        onNavigateSection={handleNavigateSection} 
      />

      {/* Main Content Layer */}
      <main className="flex-1">
        
        {/* Unified 2-Section Video Atmosphere (Hero + Instant Funding Programs) */}
        <div id="hero-experience" className="relative w-full">
          {/* Pinned Video Canvas */}
          <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none z-0">
            <HeroScrollCanvas totalFrames={160} containerId="hero-experience" />
          </div>

          {/* Content Layer: Hero + Programs Section flowing seamlessly over the video */}
          <div className="relative z-10 -mt-[100vh]">
            <Hero onOpenTerminal={handleOpenTerminal} />
            <ProgramsSection />
          </div>
        </div>

        {/* Horizontal Terminal Showcase (Eklipse OS Experience) */}
        <HorizontalShowcase onOpenTerminal={handleOpenTerminal} />

        {/* Section 5: Markets (Trade the market that never sleeps: BTC, ETH, SOL) */}
        <MarketsSection />

        {/* Section 7: Funding & Payout Roadmap (Pass the challenge. Keep trading. Get rewarded.) */}
        <PayoutRoadmapSection />

        {/* Section 8: Why EKLIPSE (Built for traders, not spreadsheets.) */}
        <WhyEklipseSection />

        {/* Section 9: Social Proof / Community */}
        <CommunitySection />

        {/* Section 10: FAQ (13 Questions) */}
        <FAQSection />

        {/* Section 11: Final CTA (Ready to prove your edge?) */}
        <FinalCTA />

      </main>

      {/* Global Footer */}
      <Footer />

      {/* High-Performance Candlestick Laser Cursor */}
      <CandlestickCursor />

      {/* Auth Modal for Quick Login / Registration */}
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
    <RouterProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </LanguageProvider>
    </RouterProvider>
  );
}
