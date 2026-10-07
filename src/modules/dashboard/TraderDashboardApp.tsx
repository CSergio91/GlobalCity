import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Award, 
  Layers, 
  Monitor, 
  HelpCircle, 
  Menu, 
  X, 
  Bell, 
  ChevronDown, 
  User, 
  Wallet, 
  TrendingUp, 
  Shield, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sparkles,
  LogOut,
  ChevronRight,
  ExternalLink,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppRouter } from '../../context/RouterContext';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../../components/BrandLogo';

interface TraderDashboardAppProps {
  onBackToLanding?: () => void;
  onLogout?: () => void;
  onGoToTerminal?: () => void;
}

export const TraderDashboardApp: React.FC<TraderDashboardAppProps> = ({ 
  onBackToLanding,
  onLogout,
  onGoToTerminal
}) => {
  const { user, logout } = useAuth();
  const { navigate } = useAppRouter();
  const { language, setLanguage } = useLanguage();
  const isEn = language === 'en';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'certificates' | 'plans' | 'support'>('dashboard');
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | '90D' | '1A' | 'Todo'>('7D');
  const [selectedAccount, setSelectedAccount] = useState<string>('PRO 5K');
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const handleLogout = () => {
    logout();
    if (onLogout) {
      onLogout();
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoToTerminal = () => {
    if (onGoToTerminal) {
      onGoToTerminal();
    } else {
      navigate('/operations');
    }
  };

  // SVG Equity curve coordinate points for 7D timeframe
  const equityPoints = [
    { x: 30, y: 155, date: '12 Abr', val: '$22,400' },
    { x: 80, y: 160, date: '12.5 Abr', val: '$22,100' },
    { x: 130, y: 145, date: '13 Abr', val: '$23,200' },
    { x: 190, y: 152, date: '13.5 Abr', val: '$22,800' },
    { x: 250, y: 125, date: '14 Abr', val: '$24,500' },
    { x: 310, y: 135, date: '14.5 Abr', val: '$23,900' },
    { x: 370, y: 110, date: '15 Abr', val: '$25,200' },
    { x: 440, y: 120, date: '15.5 Abr', val: '$24,800' },
    { x: 510, y: 95, date: '16 Abr', val: '$25,900' },
    { x: 580, y: 105, date: '16.5 Abr', val: '$25,400' },
    { x: 650, y: 80, date: '17 Abr', val: '$26,050' },
    { x: 730, y: 90, date: '17.5 Abr', val: '$25,800' },
    { x: 800, y: 65, date: '18 Abr', val: '$26,134.17' }
  ];

  const svgPathD = `M ${equityPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const svgAreaD = `M ${equityPoints[0].x},${equityPoints[0].y} L ${equityPoints.map(p => `${p.x},${p.y}`).join(' L ')} L 800,210 L 30,210 Z`;

  return (
    <div className="min-h-screen w-full bg-[#07090E] text-white flex select-none overflow-x-hidden font-sans">
      
      {/* 1. LEFT SIDEBAR (Fixed / Collapsible) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0D15] border-r border-white/5 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header */}
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-white/5">
            <div 
              onClick={() => { onBackToLanding ? onBackToLanding() : navigate('/'); }}
              className="cursor-pointer"
            >
              <BrandLogo size="md" lightMode={false} showText={true} />
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 font-medium">
            <button
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{isEn ? 'Dashboard' : 'Dashboard'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('accounts'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                activeTab === 'accounts'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{isEn ? 'Accounts' : 'Cuentas'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('certificates'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                activeTab === 'certificates'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{isEn ? 'Certificates' : 'Certificados'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('plans'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{isEn ? 'Plans' : 'Planes'}</span>
            </button>

            <button
              onClick={handleGoToTerminal}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer group"
            >
              <Monitor className="w-4 h-4 group-hover:text-amber-400 transition-colors" />
              <span>{isEn ? 'Platform' : 'Plataforma Web'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-slate-500 group-hover:text-amber-400" />
            </button>

            <button
              onClick={() => { setActiveTab('support'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{isEn ? 'Support' : 'Soporte 24/7'}</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom: Promo Box & Version */}
        <div className="p-4 space-y-4">
          
          {/* Atmospheric Promo Card */}
          <div className="relative rounded-2xl overflow-hidden p-4 border border-purple-500/20 bg-gradient-to-b from-purple-900/40 via-[#0E1220] to-[#0A0D15] shadow-lg">
            <div className="absolute top-2 right-2 text-purple-400/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-white leading-tight">
              {isEn ? 'Your discipline, our capital.' : 'Tu disciplina, nuestro capital.'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              {isEn ? 'Trade. Prove. Withdraw.' : 'Opera. Demuestra. Cobra.'}
            </div>
            <button
              onClick={() => {
                if (onBackToLanding) {
                  onBackToLanding();
                  setTimeout(() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' }), 100);
                } else {
                  navigate('/');
                }
              }}
              className="mt-3 w-full py-2 rounded-lg text-xs font-mono font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-md cursor-pointer"
            >
              {isEn ? 'View Plans' : 'Ver planes'}
            </button>
          </div>

          {/* Footer Version Tag */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Eklipse Funded v1.0.0</span>
            </div>
            <button onClick={handleLogout} title="Cerrar Sesión" className="hover:text-rose-400 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </aside>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* 2. MAIN VIEW CONTAINER (Sidebar offset) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Header Bar */}
        <header className="h-20 border-b border-white/5 bg-[#07090E]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          
          {/* Left Greeting & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{isEn ? 'Welcome, Trader' : 'Bienvenido, Trader'}</span>
                <span className="text-amber-400">👋</span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block font-mono">
                {isEn ? 'Your account, your strategy, our backing.' : 'Tu cuenta, tu estrategia, nuestro respaldo.'}
              </p>
            </div>
          </div>

          {/* Right Controls: Notifications, Language, User Badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Notification Bell */}
            <button 
              onClick={() => setShowNotificationToast(!showNotificationToast)}
              className="relative p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#07090E]" />
            </button>

            {/* Language Selector */}
            <div className="flex items-center rounded-xl border border-white/5 bg-white/5 p-1 text-xs font-mono font-bold">
              <button 
                onClick={() => setLanguage('es')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${language === 'es' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                ES
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${language === 'en' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>

            {/* User Profile Avatar Pill */}
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 border border-purple-400/40 flex items-center justify-center text-white font-bold text-xs shadow-md">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white">
                  {user?.firstName || 'Trader Pro'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  ID: {user?.id || '123456'}
                </div>
              </div>
            </div>

          </div>

        </header>

        {/* Main Dashboard Canvas Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          
          {/* Top 4 KPI Metrics + Right Celestial Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* KPI 1: Balance de la cuenta */}
            <div className="p-4 rounded-2xl border border-white/5 bg-[#0C0F17] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +12.4%
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-slate-400 font-mono">
                  {isEn ? 'Account Balance' : 'Balance de la cuenta'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                  $25,680.42
                </div>
              </div>
            </div>

            {/* KPI 2: Equity */}
            <div className="p-4 rounded-2xl border border-white/5 bg-[#0C0F17] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +11.8%
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-slate-400 font-mono">
                  {isEn ? 'Net Equity' : 'Equity'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                  $26,134.17
                </div>
              </div>
            </div>

            {/* KPI 3: Drawdown actual */}
            <div className="p-4 rounded-2xl border border-white/5 bg-[#0C0F17] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  {isEn ? 'In Range' : 'En rango'}
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-slate-400 font-mono">
                  {isEn ? 'Current Drawdown' : 'Drawdown actual'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                  2.3%
                </div>
              </div>
            </div>

            {/* KPI 4: Profit total */}
            <div className="p-4 rounded-2xl border border-white/5 bg-[#0C0F17] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +18.7%
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-slate-400 font-mono">
                  {isEn ? 'Total Profit' : 'Profit total'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                  $4,312.76
                </div>
              </div>
            </div>

            {/* Right Celestial Banner Card */}
            <div className="p-4 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-indigo-950/60 via-[#0F1322] to-[#0A0D15] flex flex-col justify-between relative overflow-hidden shadow-[0_0_25px_rgba(99,102,241,0.12)] sm:col-span-2 lg:col-span-1">
              <div className="absolute top-2 right-2 text-purple-400/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white">
                  {isEn ? 'Discipline today, freedom tomorrow.' : 'Disciplina hoy, libertad mañana.'}
                </h3>
                <p className="text-[11px] text-slate-300/80 mt-1.5 leading-relaxed font-sans">
                  {isEn 
                    ? 'Trade real capital. Prove your consistency and withdraw your earnings.'
                    : 'Opera con un capital real. Demuestra tu consistencia y retira tus ganancias.'}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-amber-300 font-bold">
                <span>Eklipse Funded</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

          </div>

          {/* Middle Row: Equity Chart (Left) + Account Health / Rules (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 8 Cols: Rendimiento de la cuenta (Equity Curve Chart) */}
            <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl border border-white/5 bg-[#0C0F17] flex flex-col justify-between">
              
              {/* Chart Header & Timeframe Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-base font-bold text-white">
                    {isEn ? 'Account Performance' : 'Rendimiento de la cuenta'}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    {isEn ? 'Live equity tracking & high-water mark' : 'Evolución de balance y curva de equidad'}
                  </span>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/5 font-mono text-xs font-bold self-start sm:self-auto">
                  {(['7D', '30D', '90D', '1A', 'Todo'] as const).map(tf => (
                    <button
                      key={tf}
                      onClick={() => setChartTimeframe(tf)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        chartTimeframe === tf 
                          ? 'bg-purple-600 text-white shadow-md' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Glowing SVG Equity Chart Canvas */}
              <div className="relative w-full h-64 sm:h-72">
                
                {/* Background Grid Lines & Y-Axis Labels */}
                <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-mono text-slate-600 pointer-events-none">
                  <div className="border-b border-white/[0.04] pb-1">$28,000</div>
                  <div className="border-b border-white/[0.04] pb-1">$26,000</div>
                  <div className="border-b border-white/[0.04] pb-1">$24,000</div>
                  <div className="border-b border-white/[0.04] pb-1">$22,000</div>
                  <div className="border-b border-white/[0.04] pb-1">$20,000</div>
                </div>

                {/* SVG Curve Line + Area Gradient */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 830 220" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="equityGlowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                      <stop offset="60%" stopColor="#6366F1" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#0C0F17" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area fill */}
                  <path d={svgAreaD} fill="url(#equityGlowGrad)" />

                  {/* High Glow Stroke behind */}
                  <path
                    d={svgPathD}
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="5"
                    strokeOpacity="0.3"
                  />

                  {/* Sharp Main Stroke */}
                  <path
                    d={svgPathD}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Current Active Data Point Indicator */}
                  <circle cx="800" cy="65" r="5" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="3" />
                  <circle cx="800" cy="65" r="10" fill="#8B5CF6" fillOpacity="0.3" className="animate-ping" />
                </svg>

                {/* Tooltip Pin on Peak Point (18 Abr) */}
                <div className="absolute top-5 right-2 sm:right-6 p-2 rounded-xl bg-[#090C14] border border-purple-500/40 shadow-xl text-right font-mono">
                  <div className="text-xs font-black text-purple-300">$26,134.17</div>
                  <div className="text-[10px] text-slate-400">18 Abr 2025</div>
                </div>

                {/* X-Axis Dates */}
                <div className="absolute -bottom-5 inset-x-0 flex justify-between text-[10px] font-mono text-slate-500 px-4">
                  <span>12 Abr</span>
                  <span>13 Abr</span>
                  <span>14 Abr</span>
                  <span>15 Abr</span>
                  <span>16 Abr</span>
                  <span>17 Abr</span>
                  <span>18 Abr</span>
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Estado de la cuenta (Health & Progress) */}
            <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl border border-white/5 bg-[#0C0F17] flex flex-col justify-between space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">
                  {isEn ? 'Account Status' : 'Estado de la cuenta'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                  {isEn ? 'Active' : 'Activa'}
                </span>
              </div>

              {/* Progress 1: Profit Target */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-medium">Profit target</span>
                  <span className="text-white font-bold">$4,312.76 / $10,000</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '43.1%' }} />
                </div>
                <div className="text-right text-[10px] font-mono text-emerald-400 font-bold">
                  43.1%
                </div>
              </div>

              {/* Progress 2: Consistencia */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-medium">{isEn ? 'Consistency (5 days)' : 'Consistencia (5 días)'}</span>
                  <span className="text-white font-bold">3/5</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" style={{ width: '60%' }} />
                </div>
                <div className="text-right text-[10px] font-mono text-cyan-400 font-bold">
                  60.0%
                </div>
              </div>

              {/* Rule 3: Mejor día */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-300">{isEn ? 'Best day rule' : 'Mejor día (Best day rule)'}</div>
                  <div className="text-base font-black font-mono text-white mt-0.5">12.4%</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  {isEn ? 'In Range' : 'En rango'}
                </span>
              </div>

            </div>

          </div>

          {/* Lower Row: Mis Cuentas (Left) + Actividad Reciente (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 8 Cols: Mis Cuentas */}
            <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl border border-white/5 bg-[#0C0F17] flex flex-col justify-between">
              
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-base text-white">
                  {isEn ? 'My Accounts' : 'Mis cuentas'}
                </h3>
                <button 
                  onClick={() => setActiveTab('accounts')}
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>{isEn ? 'View all →' : 'Ver todas →'}</span>
                </button>
              </div>

              {/* 3 Account Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Account 1: PRO 1K */}
                <div className="p-4 rounded-xl border border-white/5 bg-slate-950/60 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300">
                      PRO 1K
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {isEn ? 'In trading' : 'En trading'}
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-slate-400">{isEn ? 'Initial capital' : 'Capital inicial'}</div>
                    <div className="text-lg font-black font-mono text-white">$1,000.00</div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-xs">
                    <div>
                      <div className="text-[9px] text-slate-400">Balance</div>
                      <div className="font-bold text-slate-200">$1,248.32</div>
                    </div>
                    <span className="text-emerald-400 font-bold text-[11px]">+24.8%</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      onClick={handleGoToTerminal}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono font-bold text-slate-200 hover:text-white transition-colors cursor-pointer text-center"
                    >
                      {isEn ? 'View Details' : 'Ver detalles'}
                    </button>
                    <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Account 2: PRO 5K */}
                <div className="p-4 rounded-xl border border-amber-500/20 bg-slate-950/60 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      PRO 5K
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {isEn ? 'Active' : 'Activa'}
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-slate-400">{isEn ? 'Initial capital' : 'Capital inicial'}</div>
                    <div className="text-lg font-black font-mono text-white">$5,000.00</div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-xs">
                    <div>
                      <div className="text-[9px] text-slate-400">Balance</div>
                      <div className="font-bold text-slate-200">$5,832.17</div>
                    </div>
                    <span className="text-emerald-400 font-bold text-[11px]">+16.3%</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      onClick={handleGoToTerminal}
                      className="flex-1 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-[11px] font-mono font-bold text-amber-300 transition-colors cursor-pointer text-center"
                    >
                      {isEn ? 'View Details' : 'Ver detalles'}
                    </button>
                    <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Account 3: PRO 10K */}
                <div className="p-4 rounded-xl border border-white/5 bg-slate-950/60 hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300">
                      PRO 10K
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {isEn ? 'In trading' : 'En trading'}
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-slate-400">{isEn ? 'Initial capital' : 'Capital inicial'}</div>
                    <div className="text-lg font-black font-mono text-white">$10,000.00</div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-xs">
                    <div>
                      <div className="text-[9px] text-slate-400">Balance</div>
                      <div className="font-bold text-slate-200">$11,024.76</div>
                    </div>
                    <span className="text-emerald-400 font-bold text-[11px]">+10.2%</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      onClick={handleGoToTerminal}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono font-bold text-slate-200 hover:text-white transition-colors cursor-pointer text-center"
                    >
                      {isEn ? 'View Details' : 'Ver detalles'}
                    </button>
                    <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Right 4 Cols: Actividad Reciente */}
            <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl border border-white/5 bg-[#0C0F17] flex flex-col justify-between space-y-4">
              
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white">
                  {isEn ? 'Recent Activity' : 'Actividad reciente'}
                </h3>
                <button className="text-xs font-mono text-purple-400 hover:text-purple-300 cursor-pointer">
                  {isEn ? 'View all →' : 'Ver todo →'}
                </button>
              </div>

              {/* Event Ledger Items */}
              <div className="space-y-3 font-mono">
                
                {/* Event 1 */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-[11px]">
                        {isEn ? 'Closed Trade (BTCUSDT)' : 'Operación cerrada (BTCUSDT)'}
                      </div>
                      <div className="text-[9px] text-slate-500">18 Abr 2025 · 14:32</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">+$125.40</div>
                    <div className="text-[9px] text-emerald-500/80">{isEn ? 'Profit' : 'Ganancia'}</div>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-[11px]">
                        {isEn ? 'Open Position (ETHUSDT)' : 'Operación abierta (ETHUSDT)'}
                      </div>
                      <div className="text-[9px] text-slate-500">18 Abr 2025 · 13:15</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-rose-400">-$250.00</div>
                    <div className="text-[9px] text-slate-500">{isEn ? 'Margin' : 'Posición'}</div>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-[11px]">
                        {isEn ? 'Payout Requested' : 'Payout solicitado'}
                      </div>
                      <div className="text-[9px] text-slate-500">17 Abr 2025 · 10:24</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-300">$1,000.00</div>
                    <div className="text-[9px] text-amber-400/80">{isEn ? 'Pending' : 'Pendiente'}</div>
                  </div>
                </div>

                {/* Event 4 */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-[11px]">
                        {isEn ? 'Plan Activated (Pro)' : 'Plan activado (Pro)'}
                      </div>
                      <div className="text-[9px] text-slate-500">16 Abr 2025 · 18:45</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-400">$0.00</div>
                    <div className="text-[9px] text-blue-400/80">{isEn ? 'System' : 'Sistema'}</div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Bottom Row: 3 Action Cards (Certificados, Planes, Plataforma) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            
            {/* Action 1: Certificados */}
            <div 
              onClick={() => setActiveTab('certificates')}
              className="p-5 rounded-2xl border border-white/5 bg-[#0C0F17] hover:border-purple-500/30 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                    {isEn ? 'Certificates' : 'Certificados'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isEn 
                      ? 'Download performance certificates & track progress.'
                      : 'Descarga tus certificados de rendimiento y verifica tu progreso.'}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-purple-600 text-slate-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors ml-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Action 2: Planes */}
            <div 
              onClick={() => {
                if (onBackToLanding) {
                  onBackToLanding();
                  setTimeout(() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' }), 100);
                } else {
                  navigate('/');
                }
              }}
              className="p-5 rounded-2xl border border-white/5 bg-[#0C0F17] hover:border-amber-500/30 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                    {isEn ? 'Plans' : 'Planes'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isEn 
                      ? 'Choose the funding plan best fitted to your trading style.'
                      : 'Elige el plan que mejor se adapte a tu estilo de trading.'}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-amber-400 text-slate-400 group-hover:text-slate-950 flex items-center justify-center shrink-0 transition-colors ml-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Action 3: Plataforma */}
            <div 
              onClick={handleGoToTerminal}
              className="p-5 rounded-2xl border border-white/5 bg-[#0C0F17] hover:border-blue-500/30 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                    {isEn ? 'Platform' : 'Plataforma'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isEn 
                      ? 'Access our high-performance institutional trading terminal.'
                      : 'Accede a nuestra plataforma de trading de alto rendimiento.'}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors ml-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

          </div>

        </main>

      </div>

    </div>
  );
};
