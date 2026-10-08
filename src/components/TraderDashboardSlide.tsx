import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Bell, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  ArrowDown, 
  Sparkles,
  Activity
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BrandLogo } from './BrandLogo';

interface TraderDashboardSlideProps {
  onBackToTerminal?: () => void;
  onScrollToFaq?: () => void;
  onNavigateToPlans?: () => void;
}

export const TraderDashboardSlide: React.FC<TraderDashboardSlideProps> = ({ 
  onBackToTerminal,
  onScrollToFaq,
  onNavigateToPlans 
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D' | '1A' | 'Todo'>('7D');

  // Desktop screen detector for reliable layout rendering
  const [isDesktop, setIsDesktop] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Exact coordinates matching the equity curve in media_1791466129958.png
  const curvePoints = [
    { x: 30, y: 135, date: '12 Abr' },
    { x: 80, y: 140 },
    { x: 130, y: 125, date: '13 Abr' },
    { x: 190, y: 132 },
    { x: 250, y: 105, date: '14 Abr' },
    { x: 310, y: 115 },
    { x: 370, y: 90, date: '15 Abr' },
    { x: 440, y: 100 },
    { x: 510, y: 75, date: '16 Abr' },
    { x: 580, y: 85 },
    { x: 650, y: 60, date: '17 Abr' },
    { x: 730, y: 70 },
    { x: 800, y: 45, date: '18 Abr', peak: true, val: '$26,134.17' }
  ];

  const svgPathD = `M ${curvePoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const svgAreaD = `M ${curvePoints[0].x},${curvePoints[0].y} L ${curvePoints.map(p => `${p.x},${p.y}`).join(' L ')} L 800,175 L 30,175 Z`;

  const handleGoToPlans = () => {
    if (onNavigateToPlans) {
      onNavigateToPlans();
    } else {
      const el = document.getElementById('programs');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center px-2 sm:px-6 lg:px-8 py-2 sm:py-3 select-none overflow-y-auto no-scrollbar pt-12 sm:pt-0">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center space-y-1.5 sm:space-y-3.5 my-auto">
        
        {/* ========================================================================= */}
        {/* 1. HERO-STYLE H1 SECTION HEADER                                           */}
        {/* ========================================================================= */}
        <div className="w-full flex flex-col items-center text-center space-y-1.5 sm:space-y-2.5 max-w-4xl mx-auto shrink-0">
          
          {/* Overline Pre-title */}
          <div className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-slate-300/90 uppercase font-sans">
            {isEn ? '02 · REAL-TIME TRADER TELEMETRY · IN-MEMORY SENTINEL' : '02 · TELEMETRÍA EN TIEMPO REAL · CENTINELA EN RAM'}
          </div>

          {/* Master Visual Headline H1 */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] leading-[1.1] text-white">
            <span className="inline-block drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
              {isEn ? 'Trader Dashboard Nexus.' : 'Trader Dashboard Nexus.'}{' '}
            </span>
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-400 drop-shadow-[0_0_35px_rgba(168,85,247,0.45)]">
              {isEn ? 'In-Memory State Sync.' : 'Sincronización en RAM a <1ms.'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-300/85 font-normal max-w-xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] hidden sm:block">
            {isEn
              ? 'Real-time equity tracking, high-water mark calculation, and automated rule consistency in RAM without broker delays.'
              : 'Monitoreo de equity en tiempo real, cálculo de High-Water Mark y consistencia automatizada en RAM sin trampas de fin de día.'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. REALISTIC TRADER DASHBOARD CONTAINER (Glassmorphism Over Hero Canvas)  */}
        {/* ========================================================================= */}
        <div className="w-full rounded-2xl bg-[#080A12]/80 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-xl p-2 sm:p-3.5 space-y-1.5 sm:space-y-2.5">
          
          {/* Top Bar: Logo + Welcome + Indicators */}
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" lightMode={false} showText={true} />
              <div className="h-3 w-[1px] bg-white/10 hidden sm:block" />
              <span className="text-[11px] sm:text-sm font-bold text-white flex items-center gap-1">
                <span>Welcome, Trader</span>
                <span className="text-amber-400">⚡</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono">
              <div className="px-1.5 py-0.2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] sm:text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">WebSockets </span>
                <span>&lt;1ms</span>
              </div>
              <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 relative">
                <Bell className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-amber-400" />
              </div>
              <div className="px-1.5 py-0.2 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-200 text-[9.5px] sm:text-[10px] font-bold">
                ES
              </div>
            </div>
          </div>

          {/* Row 1: KPI Metric Cards (2 on Mobile to guarantee fit, 5 on Desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 sm:gap-2 font-mono">
            
            {/* Card 1: Balance */}
            <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#0D111E] border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[8.5px] sm:text-[9.5px]">
                <div className="p-0.5 sm:p-1 rounded bg-purple-500/10 text-purple-400">
                  <Wallet className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                </div>
                <span className="text-emerald-400 font-bold">+12.6%</span>
              </div>
              <div className="mt-0.5 sm:mt-1">
                <div className="text-[8.5px] sm:text-[9px] text-slate-400">Balance</div>
                <div className="text-[11px] sm:text-sm font-bold text-white">$25,680.42</div>
              </div>
            </div>

            {/* Card 2: Net Equity */}
            <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#0D111E] border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[8.5px] sm:text-[9.5px]">
                <div className="p-0.5 sm:p-1 rounded bg-purple-500/10 text-purple-400">
                  <TrendingUp className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                </div>
                <span className="text-emerald-400 font-bold">+11.8%</span>
              </div>
              <div className="mt-0.5 sm:mt-1">
                <div className="text-[8.5px] sm:text-[9px] text-slate-400">Net Equity</div>
                <div className="text-[11px] sm:text-sm font-bold text-white">$26,134.17</div>
              </div>
            </div>

            {/* Card 3: Drawdown (Desktop/Tablet) */}
            <div className={`${isDesktop ? 'flex' : 'hidden md:flex'} p-2.5 rounded-xl bg-[#0D111E] border border-white/5 flex-col justify-between`}>
              <div className="flex items-center justify-between text-slate-400 text-[9.5px]">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                  <Shield className="w-3 h-3" />
                </div>
                <span className="px-1 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[8.5px] font-bold">In Range</span>
              </div>
              <div className="mt-1">
                <div className="text-[9px] text-slate-400">Drawdown</div>
                <div className="text-xs sm:text-sm font-bold text-white">2.3%</div>
              </div>
            </div>

            {/* Card 4: Total Profit (Desktop/Tablet) */}
            <div className={`${isDesktop ? 'flex' : 'hidden md:flex'} p-2.5 rounded-xl bg-[#0D111E] border border-white/5 flex-col justify-between`}>
              <div className="flex items-center justify-between text-slate-400 text-[9.5px]">
                <div className="p-1 rounded bg-purple-500/10 text-purple-400">
                  <Coins className="w-3 h-3" />
                </div>
                <span className="text-emerald-400 font-bold">+18.7%</span>
              </div>
              <div className="mt-1">
                <div className="text-[9px] text-slate-400">Total Profit</div>
                <div className="text-xs sm:text-sm font-bold text-white">$4,312.76</div>
              </div>
            </div>

            {/* Card 5: Motivation Banner (Desktop/Tablet) */}
            <div className={`${isDesktop ? 'flex' : 'hidden md:flex'} p-2.5 rounded-xl bg-gradient-to-br from-purple-900/30 via-[#0E1220] to-[#0A0D15] border border-purple-500/20 flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white">Discipline today.</span>
                <Sparkles className="w-3 h-3 text-purple-400" />
              </div>
              <div className="text-[8.5px] text-slate-400 mt-0.5 leading-tight">
                Trade real capital. Prove consistency and withdraw.
              </div>
              <div className="text-[9px] font-mono text-amber-400 font-bold mt-1">
                Eklipse Funded &gt;
              </div>
            </div>

          </div>

          {/* Row 2: Middle Section (Account Performance Chart + Account Status) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 sm:gap-2.5">
            
            {/* Left: Account Performance Chart */}
            <div className="lg:col-span-8 p-2 sm:p-2.5 rounded-xl bg-[#0A0D18] border border-white/5 flex flex-col justify-between">
              
              <div className="flex items-center justify-between pb-1 border-b border-white/5 flex-wrap gap-1">
                <div>
                  <div className="text-[10px] sm:text-xs font-bold text-white">Account Performance</div>
                  <div className="text-[8.5px] text-slate-400 font-mono hidden sm:block">Live equity tracking & high-water mark</div>
                </div>

                <div className="flex items-center gap-1 font-mono text-[8.5px] sm:text-[9px]">
                  {(['7D', '30D', '90D', '1A', 'Todo'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-1.5 py-0.2 rounded cursor-pointer transition-all ${
                        timeframe === tf
                          ? 'bg-purple-600 text-white font-bold shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Realistic SVG Equity Curve scaled for iPhone SE */}
              <div className="relative h-20 sm:h-32 lg:h-36 w-full pt-1">
                
                {/* Guidelines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none font-mono text-[7.5px] sm:text-[8.5px] text-slate-600">
                  <div className="flex items-center gap-1.5"><span className="w-6 sm:w-8 text-right">$28k</span><div className="flex-1 border-b border-dashed border-white/5" /></div>
                  <div className="flex items-center gap-1.5"><span className="w-6 sm:w-8 text-right">$25k</span><div className="flex-1 border-b border-dashed border-white/5" /></div>
                  <div className="flex items-center gap-1.5"><span className="w-6 sm:w-8 text-right">$22k</span><div className="flex-1 border-b border-dashed border-white/5" /></div>
                </div>

                {/* SVG Graph */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 840 175" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="equityGradMobile" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
                      <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path d={svgAreaD} fill="url(#equityGradMobile)" />
                  <path 
                    d={svgPathD} 
                    fill="none" 
                    stroke="#C084FC" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]"
                  />
                  <circle cx="800" cy="45" r="4" fill="#FFFFFF" stroke="#A855F7" strokeWidth="2.5" className="animate-pulse" />
                </svg>

                {/* Peak Tooltip Pill */}
                <div className="absolute top-0.5 right-2 bg-[#141A2D] border border-purple-500/40 px-1.5 py-0.2 rounded-lg font-mono text-[8px] sm:text-[9px] text-right shadow-xl">
                  <div className="font-bold text-white">$26,134.17</div>
                  <div className="text-[7.5px] text-purple-300">18 Abr 2025</div>
                </div>

                {/* Dates */}
                <div className="flex justify-between pl-8 pr-2 pt-0.5 font-mono text-[7.5px] sm:text-[8.5px] text-slate-500">
                  <span>12 Abr</span>
                  <span>14 Abr</span>
                  <span>16 Abr</span>
                  <span>18 Abr</span>
                </div>

              </div>

            </div>

            {/* Right: Account Status */}
            <div className="lg:col-span-4 p-2 sm:p-2.5 rounded-xl bg-[#0A0D18] border border-white/5 flex flex-col justify-between space-y-1.5 font-mono">
              
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="text-[10px] sm:text-xs font-bold text-white">Account Status</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] sm:text-[9px] font-bold">
                  Active
                </span>
              </div>

              {/* Progress 1: Profit Target */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[9px] sm:text-[10px]">
                  <span className="text-slate-400">Profit target</span>
                  <span className="text-white font-bold">$4,312.76 / $10,000</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full w-[43.1%]" />
                </div>
                <div className="text-right text-[8px] sm:text-[8.5px] text-teal-400 font-bold">43.1%</div>
              </div>

              {/* Progress 2: Consistency */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[9px] sm:text-[10px]">
                  <span className="text-slate-400">Consistency (5 days)</span>
                  <span className="text-white font-bold">3/5</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full w-[60%]" />
                </div>
                <div className="text-right text-[8px] sm:text-[8.5px] text-teal-400 font-bold">60.0%</div>
              </div>

              {/* Rule: Best Day */}
              <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[9px] sm:text-[10px]">
                <div>
                  <span className="text-slate-400 text-[8px] sm:text-[9px]">Best day rule: </span>
                  <span className="text-white font-bold">12.4%</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[8px] font-bold">
                  In Range
                </span>
              </div>

            </div>

          </div>

          {/* Row 3: Bottom Row (My Accounts & Recent Activity, Desktop/Tablet only) */}
          <div className="hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-2 font-mono">
            
            {/* Left: My Accounts */}
            <div className="lg:col-span-7 p-2 rounded-xl bg-[#0A0D18] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[10.5px] pb-0.5">
                <span className="font-bold text-white">My Accounts</span>
                <span className="text-[9px] text-purple-400">PRO Series Active</span>
              </div>

              <div className="grid grid-cols-3 gap-1 text-[9px]">
                <div className="p-1 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="px-1 py-0.2 rounded bg-purple-900/40 text-purple-300 font-bold text-[8px]">PRO 1K</span>
                    <span className="text-teal-400 text-[7.5px]">In trading</span>
                  </div>
                  <div className="text-white font-bold">$1,248.32</div>
                  <div className="text-emerald-400 text-[8px] font-bold">+24.8%</div>
                </div>

                <div className="p-1 rounded-lg bg-amber-400/5 border border-amber-400/30 space-y-0.5 shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                  <div className="flex items-center justify-between">
                    <span className="px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold text-[8px]">PRO 5K</span>
                    <span className="text-emerald-400 text-[7.5px] font-bold">Active</span>
                  </div>
                  <div className="text-white font-bold">$5,832.17</div>
                  <div className="text-emerald-400 text-[8px] font-bold">+16.2%</div>
                </div>

                <div className="p-1 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="px-1 py-0.2 rounded bg-purple-900/40 text-purple-300 font-bold text-[8px]">PRO 10K</span>
                    <span className="text-teal-400 text-[7.5px]">In trading</span>
                  </div>
                  <div className="text-white font-bold">$11,024.76</div>
                  <div className="text-emerald-400 text-[8px] font-bold">+10.2%</div>
                </div>
              </div>
            </div>

            {/* Right: Recent Activity */}
            <div className="lg:col-span-5 p-2 rounded-xl bg-[#0A0D18] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[10.5px] pb-0.5">
                <span className="font-bold text-white">Recent Activity</span>
                <span className="text-[9px] text-purple-400">Live PnL</span>
              </div>

              <div className="space-y-0.5 text-[8.5px]">
                <div className="flex items-center justify-between p-1 rounded bg-white/[0.02]">
                  <span className="text-white font-bold">Closed Trade (BTCUSDT)</span>
                  <span className="text-emerald-400 font-bold">+$125.40 Profit</span>
                </div>
                <div className="flex items-center justify-between p-1 rounded bg-white/[0.02]">
                  <span className="text-white font-bold">Payout Requested</span>
                  <span className="text-amber-400 font-bold">$1,000.00 Pending</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM HIGH-CONVERSION ACTIONS (100% Conversion Focus)                 */}
        {/* ========================================================================= */}
        <div className="w-full flex items-center justify-between gap-2 pt-0.5 sm:pt-1 shrink-0">
          
          <div className="hidden sm:flex items-center gap-2 text-[10.5px] sm:text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0" />
            <span>Auditoría Automática · Retiros USDT On-Chain &lt;8h</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            {onBackToTerminal && (
              <button
                onClick={onBackToTerminal}
                className="px-3 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-mono font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>{isEn ? 'Terminal' : 'Terminal'}</span>
              </button>
            )}

            {/* Primary Conversion CTA: CHOOSE FUNDING PLAN */}
            <button
              onClick={handleGoToPlans}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-mono font-black uppercase tracking-wider text-black bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-400 hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>{isEn ? 'Get Funded Account' : 'Obtener Cuenta de Fondeo'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>

            {onScrollToFaq && (
              <button
                onClick={onScrollToFaq}
                className="px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-mono font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                title="Ver Preguntas Frecuentes"
              >
                <span>FAQs</span>
                <ArrowDown className="w-3 h-3" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
