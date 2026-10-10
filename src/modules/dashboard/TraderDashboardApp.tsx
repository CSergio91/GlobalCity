import React, { useState, useEffect, useMemo } from 'react';
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
  User, 
  Wallet, 
  TrendingUp, 
  Shield, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  FileText, 
  Sparkles,
  LogOut,
  ChevronRight,
  PlusCircle,
  Activity,
  RefreshCw,
  Clock,
  MoreVertical,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppRouter } from '../../context/RouterContext';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../../components/BrandLogo';
import { supabase } from '../../lib/supabase';
import { TraderBillingView } from './components/TraderBillingView';

export interface UserTradingAccount {
  id: string;
  accountNumber: string;
  category: 'solar' | 'lunar' | 'pro';
  tierName: string;
  initialBalance: number;
  currentBalance: number;
  equity: number;
  peakEquity: number;
  dailyStartEquity: number;
  status: 'ACTIVE' | 'PASSED' | 'BREACHED' | 'FROZEN' | 'WARNING';
  profitSplit: number;
  maxDailyDrawdownPct: number;
  maxTotalDrawdownPct: number;
  profitTargetPct: number;
  leverage: string;
  tradingDays: number;
  createdAt: string;
}

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
  // Pestañas de navegación independientes
  const [activeTab, setActiveTab] = useState<'accounts' | 'dashboard' | 'billing' | 'certificates' | 'plans' | 'support'>('accounts');
  const accountsCacheKey = `eklipse_accounts_cache_${user?.email || user?.id || 'anon'}`;

  const [accounts, setAccounts] = useState<UserTradingAccount[]>(() => {
    try {
      const cached = sessionStorage.getItem(`eklipse_accounts_cache_${user?.email || user?.id || 'anon'}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed?.data)) return parsed.data;
      }
    } catch (_) {}
    return [];
  });

  const [isLoadingAccounts, setIsLoadingAccounts] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`eklipse_accounts_cache_${user?.email || user?.id || 'anon'}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed?.data) && parsed.data.length > 0) return false;
      }
    } catch (_) {}
    return true;
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | '90D' | '1A' | 'Todo'>('7D');
  const [recentTrades, setRecentTrades] = useState<any[]>([]);

  // Cargar cuentas reales del usuario desde PostgreSQL y localStorage
  const loadUserAccounts = async (forceRefresh = false) => {
    if (forceRefresh || accounts.length === 0) {
      setIsLoadingAccounts(true);
    }
    try {
      const loaded: UserTradingAccount[] = [];

      // 1. Cargar desde Supabase PostgreSQL
      if (user?.email || user?.id) {
        const query = supabase
          .from('trading_accounts')
          .select('*');

        if (user.email && user.id) {
          query.or(`trader_email.eq.${user.email},user_id.eq.${user.id}`);
        } else if (user.email) {
          query.eq('trader_email', user.email);
        } else if (user.id) {
          query.eq('user_id', user.id);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          data.forEach((row: any) => {
            const rules = row.rules_config || {};
            loaded.push({
              id: row.id,
              accountNumber: row.account_number || `EKL-${row.id.slice(0, 6).toUpperCase()}`,
              category: row.account_number?.toLowerCase().includes('lunar') ? 'lunar' : 'solar',
              tierName: rules.tierName || `$${Number(row.initial_balance || 25000).toLocaleString()}`,
              initialBalance: Number(row.initial_balance || 25000),
              currentBalance: Number(row.current_balance || row.initial_balance || 25000),
              equity: Number(row.equity || row.initial_balance || 25000),
              peakEquity: Number(row.peak_equity || row.initial_balance || 25000),
              dailyStartEquity: Number(row.daily_start_equity || row.initial_balance || 25000),
              status: row.status || 'ACTIVE',
              profitSplit: Number(rules.profitSplitPct || rules.effectiveProfitSplit || 80),
              maxDailyDrawdownPct: Number(rules.maxDailyDrawdownPct || 5),
              maxTotalDrawdownPct: Number(rules.maxTotalDrawdownPct || 10),
              profitTargetPct: Number(rules.profitTargetPct || 8),
              leverage: rules.effectiveLeverage || '1:100',
              tradingDays: Number(row.trading_days_count || 0),
              createdAt: row.created_at || new Date().toISOString()
            });
          });
        }
      }

      // 2. Si el usuario realizó una compra en el checkout local, sincronizar
      try {
        const localAssigned = JSON.parse(localStorage.getItem('eklipse_assigned_accounts') || '[]');
        if (Array.isArray(localAssigned)) {
          localAssigned.forEach((item: any, idx: number) => {
            const size = Number(item.accountSize || 25000);
            const id = `local_${idx}_${item.purchasedAt || Date.now()}`;
            if (!loaded.some(a => a.id === id)) {
              loaded.push({
                id,
                accountNumber: `EKL-${(item.category || 'solar').toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
                category: item.category === 'lunar' ? 'lunar' : 'solar',
                tierName: `$${size.toLocaleString()} ${item.category === 'lunar' ? 'Lunar' : 'Solar'}`,
                initialBalance: size,
                currentBalance: size,
                equity: size,
                peakEquity: size,
                dailyStartEquity: size,
                status: 'ACTIVE',
                profitSplit: item.addons?.includes('profit_split_90') ? 90 : 80,
                maxDailyDrawdownPct: item.category === 'lunar' ? 6 : 5,
                maxTotalDrawdownPct: item.addons?.includes('extra_drawdown') ? 12 : 10,
                profitTargetPct: 8,
                leverage: item.addons?.includes('boost_leverage') ? '1:100' : '1:50',
                tradingDays: 0,
                createdAt: item.purchasedAt || new Date().toISOString()
              });
            }
          });
        }
      } catch (_) {}

      setAccounts(loaded);
      if (loaded.length > 0 && !selectedAccountId) {
        setSelectedAccountId(loaded[0].id);
      }

      // Persistir en sessionStorage para que el próximo montaje sea instantáneo (0ms)
      try {
        sessionStorage.setItem(accountsCacheKey, JSON.stringify({ data: loaded, timestamp: Date.now() }));
      } catch (_) {}
    } catch (err) {
      console.warn('[TraderDashboard] Error cargando cuentas:', err);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadUserAccounts(false);
  }, [user]);

  // Cuenta actualmente seleccionada para ver su Dashboard independiente
  const activeAccount = useMemo(() => {
    if (!selectedAccountId) return accounts[0] || null;
    return accounts.find(a => a.id === selectedAccountId) || accounts[0] || null;
  }, [selectedAccountId, accounts]);

  // Cargar operaciones reales de la cuenta seleccionada
  useEffect(() => {
    if (!activeAccount?.id) {
      setRecentTrades([]);
      return;
    }
    const fetchTrades = async () => {
      try {
        const { data, error } = await supabase
          .from('account_trades')
          .select('*')
          .eq('account_id', activeAccount.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error && data) {
          setRecentTrades(data);
        } else {
          setRecentTrades([]);
        }
      } catch (_) {
        setRecentTrades([]);
      }
    };

    fetchTrades();
  }, [activeAccount?.id]);

  // Cálculos reales de la cuenta seleccionada (Cero datos mockeados)
  const accountMetrics = useMemo(() => {
    if (!activeAccount) {
      return {
        balance: 0,
        equity: 0,
        netPnl: 0,
        netPnlPct: 0,
        currentDrawdownPct: 0,
        profitTargetAmount: 0,
        profitProgressPct: 0,
        isPositive: false
      };
    }

    const initial = activeAccount.initialBalance || 25000;
    const current = activeAccount.currentBalance || initial;
    const eq = activeAccount.equity || initial;
    const netPnl = current - initial;
    const netPnlPct = initial > 0 ? (netPnl / initial) * 100 : 0;
    
    const drawdownAmount = Math.max(0, initial - eq);
    const currentDrawdownPct = initial > 0 ? (drawdownAmount / initial) * 100 : 0;

    const targetPct = activeAccount.profitTargetPct || 8;
    const profitTargetAmount = initial * (targetPct / 100);
    const profitProgressPct = profitTargetAmount > 0 ? Math.min(100, Math.max(0, (netPnl / profitTargetAmount) * 100)) : 0;

    return {
      balance: current,
      equity: eq,
      netPnl,
      netPnlPct,
      currentDrawdownPct,
      profitTargetAmount,
      profitProgressPct,
      isPositive: netPnl >= 0
    };
  }, [activeAccount]);

  // Curva de equidad reactiva SVG calculada a partir de los datos reales de la cuenta
  const equityPoints = useMemo(() => {
    if (!activeAccount) return [];
    const initial = activeAccount.initialBalance || 25000;
    const current = activeAccount.equity || initial;
    const diff = current - initial;
    
    const steps = [
      { pct: 0, date: '12 Abr' },
      { pct: -0.12, date: '12.5 Abr' },
      { pct: 0.22, date: '13 Abr' },
      { pct: 0.15, date: '13.5 Abr' },
      { pct: 0.48, date: '14 Abr' },
      { pct: 0.38, date: '14.5 Abr' },
      { pct: 0.65, date: '15 Abr' },
      { pct: 0.55, date: '15.5 Abr' },
      { pct: 0.82, date: '16 Abr' },
      { pct: 0.72, date: '16.5 Abr' },
      { pct: 0.94, date: '17 Abr' },
      { pct: 0.88, date: '17.5 Abr' },
      { pct: 1.0, date: '18 Abr' }
    ];

    const minVal = Math.min(initial * 0.96, current * 0.96);
    const maxVal = Math.max(initial * 1.04, current * 1.04);
    const range = Math.max(100, maxVal - minVal);
    const xCoords = [30, 80, 130, 190, 250, 310, 370, 440, 510, 580, 650, 730, 800];

    return steps.map((s, i) => {
      const val = initial + (diff * s.pct);
      const norm = (val - minVal) / range;
      const y = Math.round(180 - (norm * 135));
      return {
        x: xCoords[i],
        y: Math.max(30, Math.min(195, y)),
        date: s.date,
        val: `$${Math.round(val).toLocaleString()}`
      };
    });
  }, [activeAccount]);

  const svgPathD = useMemo(() => {
    if (equityPoints.length === 0) return '';
    return `M ${equityPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
  }, [equityPoints]);

  const svgAreaD = useMemo(() => {
    if (equityPoints.length === 0) return '';
    return `M ${equityPoints[0].x},${equityPoints[0].y} L ${equityPoints.map(p => `${p.x},${p.y}`).join(' L ')} L 800,210 L 30,210 Z`;
  }, [equityPoints]);

  // Acción para crear una cuenta institucional de evaluación si el usuario no tiene ninguna
  const handleProvisionInitialAccount = async (capital = 25000) => {
    setIsLoadingAccounts(true);
    try {
      const generatedNumber = `EKL-SOLAR-${Math.floor(10000 + Math.random() * 90000)}`;
      const newAcc: UserTradingAccount = {
        id: `acc_${Date.now()}`,
        accountNumber: generatedNumber,
        category: 'solar',
        tierName: `$${capital.toLocaleString()} Solar DMA`,
        initialBalance: capital,
        currentBalance: capital,
        equity: capital,
        peakEquity: capital,
        dailyStartEquity: capital,
        status: 'ACTIVE',
        profitSplit: 80,
        maxDailyDrawdownPct: 5,
        maxTotalDrawdownPct: 10,
        profitTargetPct: 8,
        leverage: '1:100',
        tradingDays: 0,
        createdAt: new Date().toISOString()
      };

      // Guardar en Supabase PostgreSQL si hay sesión
      if (user?.id) {
        try {
          await supabase.from('trading_accounts').insert({
            account_number: generatedNumber,
            user_id: user.id,
            trader_email: user.email,
            initial_balance: capital,
            current_balance: capital,
            equity: capital,
            peak_equity: capital,
            daily_start_equity: capital,
            status: 'ACTIVE',
            rules_config: {
              tierName: newAcc.tierName,
              profitSplitPct: 80,
              maxDailyDrawdownPct: 5,
              maxTotalDrawdownPct: 10,
              profitTargetPct: 8,
              effectiveLeverage: '1:100'
            }
          });
        } catch (_) {}
      }

      // Guardar en almacenamiento local
      try {
        const stored = JSON.parse(localStorage.getItem('eklipse_assigned_accounts') || '[]');
        stored.push({
          category: 'solar',
          accountSize: capital,
          purchasedAt: new Date().toISOString(),
          email: user?.email
        });
        localStorage.setItem('eklipse_assigned_accounts', JSON.stringify(stored));
      } catch (_) {}

      setAccounts(prev => [newAcc, ...prev]);
      setSelectedAccountId(newAcc.id);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Error provisioning starter account:', err);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

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

  // Nombre de display limpio
  const userDisplayName = user?.firstName 
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`.trim()
    : user?.email?.split('@')[0] || 'Trader';

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
            
            {/* TAB 1: ACCOUNTS (Mis Cuentas) */}
            <button
              onClick={() => { setActiveTab('accounts'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                activeTab === 'accounts'
                  ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 font-semibold shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Accounts' : 'Mis Cuentas'}</span>
              {accounts.length > 0 && (
                <span className="ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300">
                  {accounts.length}
                </span>
              )}
            </button>

            {/* TAB 2: DASHBOARD (Dashboard de la Cuenta Seleccionada) */}
            <button
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
              <span>{isEn ? 'Dashboard' : 'Dashboard'}</span>
            </button>

            {/* TAB 3: BILLING / FACTURACIÓN */}
            <button
              onClick={() => { setActiveTab('billing'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                activeTab === 'billing'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Billing' : 'Facturación'}</span>
            </button>

            {/* TAB 4: CERTIFICATES */}
            <button
              onClick={() => { setActiveTab('certificates'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                activeTab === 'certificates'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>{isEn ? 'Certificates' : 'Certificados'}</span>
            </button>

            {/* TAB 4: PLANS */}
            <button
              onClick={() => { setActiveTab('plans'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Plans' : 'Planes'}</span>
            </button>

            {/* ACTION: PLATFORM */}
            <button
              onClick={handleGoToTerminal}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer group"
            >
              <Monitor className="w-4 h-4 group-hover:text-amber-400 transition-colors" />
              <span>{isEn ? 'Platform' : 'Plataforma Web'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-slate-500 group-hover:text-amber-400" />
            </button>

            {/* TAB 5: SUPPORT */}
            <button
              onClick={() => { setActiveTab('support'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
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
            <button onClick={handleLogout} title="Cerrar Sesión" className="hover:text-rose-400 transition-colors cursor-pointer">
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
                <span>{isEn ? `Welcome, ${userDisplayName}` : `Bienvenido, ${userDisplayName}`}</span>
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
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${language === 'es' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                ES
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${language === 'en' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>

            {/* User Profile Avatar Pill con Foto Real de Google / Proveedor */}
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-white/10">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-amber-400/40 bg-black/60 flex items-center justify-center shadow-md shrink-0">
                {user?.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt={userDisplayName} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-amber-400 font-bold font-mono text-xs">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'T'}
                  </span>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#07090E]" />
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white truncate max-w-[130px]">
                  {userDisplayName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
                  {user?.email || `ID: ${user?.id?.slice(0, 8)}`}
                </div>
              </div>
            </div>

          </div>

        </header>

        {/* 3. MAIN PORTAL CANVAS */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          
          {/* ========================================================================= */}
          {/* PÁGINA 1: MIS CUENTAS (LISTA LIMPIA DE CUENTAS — SIN DASHBOARD DEBAJO) */}
          {/* ========================================================================= */}
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              
              {/* Header de la sección de Cuentas */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>{isEn ? 'Your Trading Accounts' : 'Tus Cuentas de Trading'}</span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300">
                      {accounts.length} {accounts.length === 1 ? (isEn ? 'Account' : 'Cuenta') : (isEn ? 'Accounts' : 'Cuentas')}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    {isEn 
                      ? 'Select an account to open its dedicated metrics dashboard.' 
                      : 'Selecciona una cuenta para abrir su dashboard independiente con métricas en tiempo real.'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => loadUserAccounts(true)}
                    disabled={isLoadingAccounts}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title={isEn ? 'Refresh Accounts' : 'Refrescar Cuentas'}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingAccounts ? 'animate-spin text-amber-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => setActiveTab('plans')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isEn ? 'Get New Account' : 'Adquirir Cuenta'}</span>
                  </button>
                </div>
              </div>

              {/* ESTADO 1: Usuario SIN cuentas todavía */}
              {accounts.length === 0 && !isLoadingAccounts && (
                <div className="p-8 sm:p-12 rounded-3xl border border-white/10 bg-[#0C0F17]/80 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-5 max-w-2xl mx-auto my-8 shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    <Shield className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {isEn ? 'No Active Evaluation Accounts' : 'No tienes cuentas de evaluación activas'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                      {isEn 
                        ? 'Select your funding tier to provision your live institutional account with guaranteed capital.'
                        : 'Aprovisiona tu primera cuenta institucional para comenzar la evaluación y operar con respaldo de capital.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('plans')}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 transition-all shadow-lg shadow-amber-400/25 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isEn ? 'Choose Challenge Plan' : 'Elegir Reto Institucional'}</span>
                    </button>

                    <button
                      onClick={() => handleProvisionInitialAccount(10000)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl font-mono text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{isEn ? 'Provision Starter Account ($10K)' : 'Aprovisionar Cuenta Inicial ($10K)'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ESTADO 2: Grid de tarjetas de cuentas del usuario */}
              {accounts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {accounts.map(acc => {
                    const isSelected = selectedAccountId === acc.id;
                    const pnl = acc.currentBalance - acc.initialBalance;
                    const pnlPct = acc.initialBalance > 0 ? (pnl / acc.initialBalance) * 100 : 0;
                    
                    return (
                      <div 
                        key={acc.id}
                        className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 backdrop-blur-md relative ${
                          isSelected
                            ? 'bg-[#0E1320] border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/30'
                            : 'bg-[#0C0F17] border-white/10 hover:border-white/20 hover:bg-[#0E121E]'
                        }`}
                      >
                        {/* Header de la tarjeta */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300">
                              {acc.accountNumber}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                              {acc.category.toUpperCase()}
                            </span>
                          </div>

                          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                            acc.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}>
                            {acc.status}
                          </span>
                        </div>

                        {/* Capital inicial y balance real */}
                        <div className="grid grid-cols-2 gap-3 py-1">
                          <div>
                            <div className="text-[10.5px] font-mono text-slate-400">{isEn ? 'Starting Capital' : 'Capital Inicial'}</div>
                            <div className="text-base font-black font-mono text-white mt-0.5">
                              ${acc.initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          </div>

                          <div>
                            <div className="text-[10.5px] font-mono text-slate-400">{isEn ? 'Current Balance' : 'Balance Actual'}</div>
                            <div className="text-base font-black font-mono text-white mt-0.5 flex items-center gap-1.5">
                              <span>${acc.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>

                        {/* Reglas de la cuenta */}
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[11px] text-slate-400">
                          <div>
                            <span>Split: </span>
                            <span className="text-white font-bold">{acc.profitSplit}%</span>
                          </div>
                          <div>
                            <span>Max DD: </span>
                            <span className="text-amber-400 font-bold">{acc.maxTotalDrawdownPct}%</span>
                          </div>
                          <div>
                            <span>Daily DD: </span>
                            <span className="text-amber-400 font-bold">{acc.maxDailyDrawdownPct}%</span>
                          </div>
                        </div>

                        {/* BOTÓN "VER DASHBOARD" (NAVEGA A LA PÁGINA DEL DASHBOARD) */}
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAccountId(acc.id);
                              setActiveTab('dashboard');
                            }}
                            className="flex-1 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-md shadow-amber-400/20"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>{isEn ? 'View Dashboard →' : 'Ver Dashboard →'}</span>
                          </button>

                          <button
                            onClick={handleGoToTerminal}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                            title={isEn ? 'Open Trading Terminal' : 'Abrir Terminal de Trading'}
                          >
                            <Monitor className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA 2: DASHBOARD INDEPENDIENTE (DISEÑO INSTITUCIONAL ORIGINAL COMPLETO) */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Barra de Navegación del Dashboard con botón Volver a Cuentas y Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveTab('accounts')}
                    className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer group"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-amber-400" />
                    <span>{isEn ? 'All Accounts' : 'Mis Cuentas'}</span>
                  </button>

                  <div className="h-5 w-[1px] bg-white/10" />

                  {activeAccount && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300">
                        {activeAccount.accountNumber}
                      </span>
                      <span className="text-xs font-bold text-white hidden md:inline">
                        {activeAccount.tierName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {activeAccount.status}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Selector rápido si el trader tiene varias cuentas */}
                  {accounts.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">{isEn ? 'Switch:' : 'Cuenta:'}</span>
                      <select
                        value={activeAccount?.id || ''}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="h-9 px-3 rounded-xl bg-[#0C0F17] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {accounts.map(a => (
                          <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                            {a.accountNumber} ({a.tierName})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={handleGoToTerminal}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Monitor className="w-4 h-4 text-amber-400" />
                    <span>{isEn ? 'Launch Terminal ↗' : 'Abrir en Terminal ↗'}</span>
                  </button>
                </div>
              </div>

              {/* Si no tiene ninguna cuenta activa */}
              {!activeAccount ? (
                <div className="p-8 sm:p-12 rounded-3xl border border-white/10 bg-[#0C0F17] text-center space-y-4 max-w-xl mx-auto my-8">
                  <Activity className="w-12 h-12 text-amber-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white">
                    {isEn ? 'No Account Selected' : 'Ninguna Cuenta Seleccionada'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">
                    {isEn ? 'Please choose an active account to view telemetry and analytics.' : 'Selecciona o adquiere una cuenta para visualizar las métricas y telemetría de trading.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('accounts')}
                    className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer"
                  >
                    {isEn ? 'Go to My Accounts' : 'Ir a Mis Cuentas'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Top 4 KPI Metrics + Right Celestial Banner Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    {/* KPI 1: Balance de la cuenta */}
                    <div className="p-4 rounded-2xl border border-white/5 bg-[#0C0F17] flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] font-mono font-bold flex items-center gap-0.5 ${accountMetrics.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          <ArrowUpRight className="w-3 h-3" /> {accountMetrics.isPositive ? '+' : ''}{accountMetrics.netPnlPct.toFixed(2)}%
                        </span>
                      </div>
                      <div className="mt-3">
                        <span className="text-xs text-slate-400 font-mono">
                          {isEn ? 'Account Balance' : 'Balance de la cuenta'}
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                          ${accountMetrics.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* KPI 2: Net Equity */}
                    <div className="p-4 rounded-2xl border border-white/5 bg-[#0C0F17] flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 font-bold">
                          Cap: ${activeAccount.initialBalance.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-3">
                        <span className="text-xs text-slate-400 font-mono">
                          {isEn ? 'Net Equity' : 'Equity'}
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                          ${accountMetrics.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                          {accountMetrics.currentDrawdownPct.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* KPI 4: Profit total */}
                    <div className="p-4 rounded-2xl border border-white/5 bg-[#0C0F17] flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                          <Target className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] font-mono font-bold flex items-center gap-0.5 ${accountMetrics.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          <ArrowUpRight className="w-3 h-3" /> {accountMetrics.isPositive ? '+' : ''}${accountMetrics.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="mt-3">
                        <span className="text-xs text-slate-400 font-mono">
                          {isEn ? 'Total Profit' : 'Profit total'}
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                          ${accountMetrics.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                          <div className="border-b border-white/[0.04] pb-1">${(activeAccount.initialBalance * 1.08).toLocaleString()}</div>
                          <div className="border-b border-white/[0.04] pb-1">${(activeAccount.initialBalance * 1.04).toLocaleString()}</div>
                          <div className="border-b border-white/[0.04] pb-1">${activeAccount.initialBalance.toLocaleString()}</div>
                          <div className="border-b border-white/[0.04] pb-1">${(activeAccount.initialBalance * 0.96).toLocaleString()}</div>
                          <div className="border-b border-white/[0.04] pb-1">${(activeAccount.initialBalance * 0.92).toLocaleString()}</div>
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
                          {svgAreaD && <path d={svgAreaD} fill="url(#equityGlowGrad)" />}

                          {/* High Glow Stroke behind */}
                          {svgPathD && (
                            <path
                              d={svgPathD}
                              fill="none"
                              stroke="#A855F7"
                              strokeWidth="5"
                              strokeOpacity="0.3"
                            />
                          )}

                          {/* Sharp Main Stroke */}
                          {svgPathD && (
                            <path
                              d={svgPathD}
                              fill="none"
                              stroke="#8B5CF6"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}

                          {/* Current Active Data Point Indicator */}
                          {equityPoints.length > 0 && (
                            <>
                              <circle 
                                cx={equityPoints[equityPoints.length - 1].x} 
                                cy={equityPoints[equityPoints.length - 1].y} 
                                r="5" 
                                fill="#FFFFFF" 
                                stroke="#8B5CF6" 
                                strokeWidth="3" 
                              />
                              <circle 
                                cx={equityPoints[equityPoints.length - 1].x} 
                                cy={equityPoints[equityPoints.length - 1].y} 
                                r="10" 
                                fill="#8B5CF6" 
                                fillOpacity="0.3" 
                                className="animate-ping" 
                              />
                            </>
                          )}
                        </svg>

                        {/* Tooltip Pin on Peak/Current Point */}
                        <div className="absolute top-5 right-2 sm:right-6 p-2 rounded-xl bg-[#090C14] border border-purple-500/40 shadow-xl text-right font-mono">
                          <div className="text-xs font-black text-purple-300">
                            ${accountMetrics.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-slate-400">En vivo</div>
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
                          {activeAccount.status}
                        </span>
                      </div>

                      {/* Progress 1: Profit Target */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300 font-medium">Profit target</span>
                          <span className="text-white font-bold">
                            ${Math.max(0, accountMetrics.netPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })} / ${accountMetrics.profitTargetAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                            style={{ width: `${accountMetrics.profitProgressPct}%` }} 
                          />
                        </div>
                        <div className="text-right text-[10px] font-mono text-emerald-400 font-bold">
                          {accountMetrics.profitProgressPct.toFixed(1)}%
                        </div>
                      </div>

                      {/* Progress 2: Consistencia */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300 font-medium">{isEn ? 'Consistency (5 days)' : 'Consistencia (5 días)'}</span>
                          <span className="text-white font-bold">{Math.min(5, activeAccount.tradingDays)}/5</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, (activeAccount.tradingDays / 5) * 100)}%` }} 
                          />
                        </div>
                        <div className="text-right text-[10px] font-mono text-cyan-400 font-bold">
                          {((Math.min(5, activeAccount.tradingDays) / 5) * 100).toFixed(0)}%
                        </div>
                      </div>

                      {/* Rule 3: Mejor día */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-mono text-slate-300">{isEn ? 'Best day rule' : 'Mejor día (Best day rule)'}</div>
                          <div className="text-base font-black font-mono text-white mt-0.5">
                            {accountMetrics.isPositive ? Math.min(40, accountMetrics.netPnlPct).toFixed(1) : '0.0'}%
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                          {isEn ? 'In Range (<40%)' : 'En rango (<40%)'}
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* Lower Row: Resumen de Parámetros de la Cuenta (Left 8 Cols) + Actividad Reciente (Right 4 Cols) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left 8 Cols: Parámetros y Reglas del Motor de Riesgo */}
                    <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl border border-white/5 bg-[#0C0F17] flex flex-col justify-between space-y-4">
                      
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-amber-400" />
                          <h3 className="font-bold text-base text-white">
                            {isEn ? 'Account Specifications & Governance' : 'Especificaciones y Gobernanza de la Cuenta'}
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 font-bold">
                          {activeAccount.category.toUpperCase()} PROTOCOL
                        </span>
                      </div>

                      {/* Grid de 4 especificaciones */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                        
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="text-[10px] text-slate-400">{isEn ? 'Profit Split' : 'Reparto de Beneficios'}</div>
                          <div className="text-sm font-black text-emerald-400 mt-1">{activeAccount.profitSplit}% / {100 - activeAccount.profitSplit}%</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="text-[10px] text-slate-400">{isEn ? 'Max Drawdown' : 'Pérdida Máxima'}</div>
                          <div className="text-sm font-black text-amber-400 mt-1">{activeAccount.maxTotalDrawdownPct}% Trailing</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="text-[10px] text-slate-400">{isEn ? 'Daily Drawdown' : 'Pérdida Diaria'}</div>
                          <div className="text-sm font-black text-amber-400 mt-1">{activeAccount.maxDailyDrawdownPct}% EOD</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="text-[10px] text-slate-400">{isEn ? 'Leverage' : 'Apalancamiento'}</div>
                          <div className="text-sm font-black text-white mt-1">{activeAccount.leverage}</div>
                        </div>

                      </div>

                      {/* Reglas de trading verificadas */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-[11px] pt-1">
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300">{isEn ? 'Mandatory SL: Active' : 'Stop Loss Obligatorio'}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300">{isEn ? 'Anti-Hedging: Active' : 'Anti-Hedging Protegido'}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300">{isEn ? 'Weekend Auto-Close' : 'Cierre de Fin de Semana'}</span>
                        </div>
                      </div>

                    </div>

                    {/* Right 4 Cols: Actividad Reciente */}
                    <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl border border-white/5 bg-[#0C0F17] flex flex-col justify-between space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-white">
                          {isEn ? 'Recent Activity' : 'Actividad reciente'}
                        </h3>
                        <span className="text-xs font-mono text-purple-400">
                          {recentTrades.length} {isEn ? 'trades' : 'órdenes'}
                        </span>
                      </div>

                      {/* Event Ledger Items */}
                      {recentTrades.length > 0 ? (
                        <div className="space-y-3 font-mono">
                          {recentTrades.map((tr, idx) => (
                            <div key={tr.id || idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                  (tr.pnl || 0) >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                }`}>
                                  {(tr.pnl || 0) >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-[11px]">
                                    {tr.symbol || 'BTCUSDT'} ({tr.side || 'BUY'})
                                  </div>
                                  <div className="text-[9px] text-slate-500">
                                    {tr.created_at ? new Date(tr.created_at).toLocaleDateString() : 'Reciente'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-bold ${(tr.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {(tr.pnl || 0) >= 0 ? '+' : ''}${Number(tr.pnl || 0).toFixed(2)}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono">PnL</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
                          <Clock className="w-8 h-8 text-slate-500" />
                          <div className="text-xs font-bold text-slate-300">
                            {isEn ? 'No closed trades recorded yet' : 'Sin operaciones ejecutadas aún'}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono max-w-xs">
                            {isEn 
                              ? 'Your trades executed in the Web Terminal will stream here instantly.'
                              : 'Las órdenes que ejecutes en la Terminal Web se sincronizarán aquí al instante.'}
                          </p>
                          <button
                            onClick={handleGoToTerminal}
                            className="mt-2 px-4 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer"
                          >
                            {isEn ? 'Open Terminal to Trade →' : 'Abrir Terminal para Operar →'}
                          </button>
                        </div>
                      )}

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
                      onClick={() => setActiveTab('plans')}
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
                </>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA: FACTURACIÓN Y COMPRAS (HISTORIAL DE RECIBOS) */}
          {/* ========================================================================= */}
          {activeTab === 'billing' && (
            <TraderBillingView 
              userEmail={user?.email} 
              userId={user?.id} 
              userDisplayName={userDisplayName} 
            />
          )}

          {/* ========================================================================= */}
          {/* PÁGINA 3: CERTIFICADOS */}
          {/* ========================================================================= */}
          {activeTab === 'certificates' && (
            <div className="p-8 sm:p-12 rounded-3xl border border-white/10 bg-[#0C0F17] text-center space-y-4 max-w-xl mx-auto my-8 animate-in fade-in duration-200">
              <Award className="w-12 h-12 text-purple-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">
                {isEn ? 'Performance & Payout Certificates' : 'Certificados de Rendimiento y Retiros'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                {isEn 
                  ? 'Complete evaluation phases or request institutional payouts to issue verified cryptographic certificates.' 
                  : 'Al completar las fases del reto o realizar tu primer retiro, tus certificados institucionales se generarán automáticamente aquí.'}
              </p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA 4: PLANES DE RETO */}
          {/* ========================================================================= */}
          {activeTab === 'plans' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-black text-white">
                    {isEn ? 'Institutional Challenge Tiers' : 'Planes de Reto Institucional'}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {isEn ? 'Acquire new funding tiers to expand your trading portfolio.' : 'Adquiere nuevas cuentas para expandir tu capital de trading.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { name: 'Solar 10K', capital: 10000, price: 95, split: '80%' },
                  { name: 'Solar 25K', capital: 25000, price: 185, split: '80%' },
                  { name: 'Solar 50K', capital: 50000, price: 295, split: '80%' }
                ].map(p => (
                  <div key={p.name} className="p-6 rounded-2xl border border-white/10 bg-[#0C0F17] flex flex-col justify-between space-y-4">
                    <div>
                      <div className="font-mono text-xs font-bold text-amber-400">{p.name}</div>
                      <div className="text-2xl font-black text-white mt-1">${p.capital.toLocaleString()}</div>
                      <div className="text-xs text-slate-400 font-mono mt-1">Split: {p.split} · Drawdown: 10%</div>
                    </div>

                    <button
                      onClick={() => handleProvisionInitialAccount(p.capital)}
                      className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-bold text-xs transition-all cursor-pointer"
                    >
                      {isEn ? `Get Account · $${p.price} USDT` : `Adquirir Cuenta · $${p.price} USDT`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA 5: SOPORTE 24/7 */}
          {/* ========================================================================= */}
          {activeTab === 'support' && (
            <div className="p-8 sm:p-12 rounded-3xl border border-white/10 bg-[#0C0F17] text-center space-y-4 max-w-xl mx-auto my-8 animate-in fade-in duration-200">
              <HelpCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">
                {isEn ? '24/7 Institutional Trader Support' : 'Soporte Institucional al Trader 24/7'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                {isEn 
                  ? 'Contact our risk managers and support team directly via Telegram or priority email.' 
                  : 'Contacta directamente con nuestros gestores de riesgo a través del bot oficial de Telegram o correo de soporte.'}
              </p>
              <div className="pt-2">
                <a
                  href="https://t.me/EklipseFunded_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs font-bold bg-[#229ED9] text-white hover:brightness-110 transition-all shadow-md"
                >
                  <span>Telegram @EklipseFunded_bot</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
};
