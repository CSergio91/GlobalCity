import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroExperienceStage } from './components/HeroExperienceStage';
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
import { CelestialCursor } from './components/CelestialCursor';
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
    const doScroll = () => {
      if (sectionId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (sectionId === 'programs') {
        const container = document.getElementById('hero-experience');
        if (container) {
          const scrollable = container.offsetHeight - window.innerHeight;
          const targetScroll = container.offsetTop + scrollable * 0.75;
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
          return;
        }
      }
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    if (isTerminalRoute || isLoginRoute || isDashboardRoute || isCrmRoute) {
      navigate('/');
      setTimeout(doScroll, 100);
    } else {
      doScroll();
    }
  };

  // 1. If on /operaciones, /terminal or /operations route, render the real Institutional Trading Platform
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

  // 2. If on /nexus route or nexus.* subdomain, render the Institutional CRM Nexus
  if (isCrmRoute) {
    return (
      <InstitutionalCrmApp 
        onBackToTerminal={() => navigate('/')} 
        onLogout={() => navigate('/')} 
      />
    );
  }

  // 3. If on /dashboard route or dashboard.* subdomain, render the Trader Dashboard (or Trader Login if unauthenticated)
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

  // 4. If on /login route, render the full-screen LoginPage
  if (isLoginRoute) {
    return <LoginPage />;
  }

  // Otherwise, render the Landing Page with the 11-section master architecture
  return (
    <div className="min-h-screen bg-[#06070B] text-white flex flex-col selection:bg-amber-400/20 selection:text-amber-300 relative transition-colors duration-500">
      
      {/* Dynamic Immersive Navbar with Candlestick Pair Language Selector */}
      <Navbar 
        onOpenTerminal={handleOpenTerminal} 
        onNavigateSection={handleNavigateSection} 
      />

      {/* Main Content Layer: Only Hero Experience is active for initial divine presentation */}
      <main className="flex-1">
        
        {/* Single Page Pinned Viewport Stage (Hero + ProgramsSection over continuous 240-frame eclipse) */}
        <HeroExperienceStage 
          onOpenTerminal={handleOpenTerminal} 
          onNavigateSection={handleNavigateSection} 
        />

        {/* 
          Note: Subsequent sections (ProgramsSection, HorizontalShowcase, MarketsSection, 
          PayoutRoadmapSection, WhyEklipseSection, CommunitySection, FAQSection, FinalCTA)
          are preserved intact in the codebase to be progressively enhanced and reintroduced.
        */}

      </main>

      {/* Global Footer */}
      <Footer />

      {/* High-Performance Celestial Cursor with orbital ring and core star */}
      <CelestialCursor />

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
