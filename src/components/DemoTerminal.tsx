import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Send, 
  LogOut, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CandlestickLanguageSelector } from './CandlestickLanguageSelector';
import { GlobalCityChart } from './GlobalCityChart';
import { AddConnectionModal } from './AddConnectionModal';
import { PlatformLogo } from './MarketIcons';
import { useAuth } from '../context/AuthContext';
import { useLiveMarketTicks, MarketAssetTick } from '../services/liveMarketFeed';
import { exchangeStorage } from '../services/exchangeStorage';
import { positionStorage } from '../services/positionStorage';
import { getRealMultiVenueQuotes, VenueLiveQuote } from '../services/realVenueQuotes';
import { StoredExchangeAccount } from '../types/exchange';
import { verifyAndFetchExchangeBalance } from '../services/realExchangeApi';

// Voltrex-style Mini Sparkline Component
const MiniSparkline: React.FC<{ isPositive: boolean }> = ({ isPositive }) => (
  <svg className="w-14 sm:w-16 h-5 overflow-visible" viewBox="0 0 64 20" fill="none">
    <path
      d={isPositive ? "M 2 16 Q 16 18 32 8 T 62 4" : "M 2 4 Q 16 2 32 12 T 62 16"}
      stroke={isPositive ? "#00E575" : "#FF3B69"}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="62" cy={isPositive ? 4 : 16} r="2" fill={isPositive ? "#00E575" : "#FF3B69"} />
  </svg>
);

interface DemoTerminalProps {
  onBackToLanding: () => void;
  onOpenAuth?: () => void;
}

export type TabId = 'connections' | 'overview' | 'multiorder' | 'arbitrage' | 'copy' | 'telegram' | 'risk';

export const DemoTerminal: React.FC<DemoTerminalProps> = ({ onBackToLanding, onOpenAuth }) => {
  const { user, logout } = useAuth();
  
  // Real LocalStorage Exchange Accounts
  const [accounts, setAccounts] = useState<StoredExchangeAccount[]>(() => exchangeStorage.getAccounts());
  const connectedAccounts = useMemo(() => accounts.filter(a => a.status === 'CONNECTED'), [accounts]);

  // Default Fallback Demo Venue when user hasn't connected a custom account yet
  const defaultDemoVenue: StoredExchangeAccount = useMemo(() => ({
    id: 'conn_binance_demo_feed',
    venueId: 'binance',
    venueName: 'Binance (Demo)',
    label: 'Binance Demo Account',
    authType: 'api_keys',
    apiKey: '',
    apiSecret: '',
    permissions: ['read', 'trade'],
    balanceUsd: 50000,
    freeMarginUsd: 50000,
    pingMs: 12,
    lastSync: new Date().toISOString(),
    currency: 'USDT',
    status: 'CONNECTED',
    isTestnet: true,
    createdAt: new Date().toISOString()
  }), []);

  // Selected Active Venue Account
  const [activeAccountId, setActiveAccountId] = useState<string | null>(() => {
    return connectedAccounts[0]?.id || 'conn_binance_demo_feed';
  });

  const activeAccount = useMemo(() => {
    return accounts.find(a => a.id === activeAccountId) || connectedAccounts[0] || defaultDemoVenue;
  }, [accounts, activeAccountId, connectedAccounts, defaultDemoVenue]);

  // Modal State for adding new connection
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Live WebSocket Feed Connection
  const { ticks, isConnected: wsConnected } = useLiveMarketTicks();

  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC/USDT");
  const [notification, setNotification] = useState<string | null>(null);
  const [orderAmountUsdt, setOrderAmountUsdt] = useState<string>("500");
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const [selectedRiskPercent, setSelectedRiskPercent] = useState<number>(1);
  const [riskPercentInput, setRiskPercentInput] = useState<string>("1.0");
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [leverage, setLeverage] = useState<number>(20);
  const [isTradePanelOpen, setIsTradePanelOpen] = useState<boolean>(true);
  const [activeSide, setActiveSide] = useState<'BUY' | 'SELL'>('BUY');
  const [stopLossPct, setStopLossPct] = useState<number>(0);
  const [takeProfitPct, setTakeProfitPct] = useState<number>(100);

  // Auto-calcular monto en USDT al seleccionar porcentaje de riesgo
  const handleRiskPercentClick = (pct: number) => {
    setSelectedRiskPercent(pct);
    setRiskPercentInput(pct.toString());
    const balance = activeAccount?.freeMarginUsd || 50000;
    const computedAmount = Math.max(1, Number(((balance * pct) / 100).toFixed(2)));
    setOrderAmountUsdt(computedAmount.toString());
  };

  // Validación estricta: NO permitir 0, NO permitir negativos, PERMITIR decimales (ej. 0.5, 1.25)
  const handleRiskPercentChange = (valStr: string) => {
    if (valStr.includes('-')) return; // Bloquear negativos
    setRiskPercentInput(valStr);
    const num = parseFloat(valStr);
    if (!isNaN(num) && num > 0) {
      setSelectedRiskPercent(num);
      const balance = activeAccount?.freeMarginUsd || 50000;
      const computedAmount = Math.max(1, Number(((balance * num) / 100).toFixed(2)));
      setOrderAmountUsdt(computedAmount.toString());
    }
  };

  const handleRiskPercentBlur = () => {
    const num = parseFloat(riskPercentInput);
    if (isNaN(num) || num <= 0) {
      // Revertir automáticamente a 1.0 si escribió 0, negativo o campo vacío
      const safeVal = 1.0;
      setRiskPercentInput(safeVal.toString());
      setSelectedRiskPercent(safeVal);
      const balance = activeAccount?.freeMarginUsd || 50000;
      const computedAmount = Math.max(1, Number(((balance * safeVal) / 100).toFixed(2)));
      setOrderAmountUsdt(computedAmount.toString());
    } else {
      setRiskPercentInput(num.toString());
    }
  };

  const handleOrderAmountChange = (valStr: string) => {
    if (valStr.includes('-')) return;
    setOrderAmountUsdt(valStr);
    const num = parseFloat(valStr);
    if (!isNaN(num) && num > 0) {
      const balance = activeAccount?.freeMarginUsd || 50000;
      const pct = Number(((num / balance) * 100).toFixed(2));
      if (pct > 0) {
        setSelectedRiskPercent(pct);
        setRiskPercentInput(pct.toString());
      }
    }
  };

  // Pair selector dropdown
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
  const [pairSearchQuery, setPairSearchQuery] = useState('');

  // Trading Mode: 'demo' (Virtual Simulation) vs 'real' (Verified Real Funds)
  const [tradingMode, setTradingMode] = useState<'demo' | 'real'>(() => {
    try {
      return (localStorage.getItem('globalcity_trading_mode') as 'demo' | 'real') || 'real';
    } catch {
      return 'real';
    }
  });

  const handleTradingModeChange = (mode: 'demo' | 'real') => {
    setTradingMode(mode);
    try {
      localStorage.setItem('globalcity_trading_mode', mode);
      window.dispatchEvent(new CustomEvent('globalcity_trading_mode_changed', { detail: mode }));
    } catch {}
    showNotification(
      mode === 'demo'
        ? 'Modo DEMO activado: Simulación sin arriesgar capital.'
        : 'Modo REAL activado: Solo cuentas con claves oficiales autenticadas directamente por el exchange.'
    );
  };

  // Find active tick for currentPair
  const activeTick = useMemo(() => {
    return ticks.find(t => t.symbol === selectedSymbol) || ticks[0] || {
      symbol: selectedSymbol,
      name: 'Bitcoin Perpetual',
      price: 84150,
      change24h: 2.5,
      category: 'crypto' as const
    };
  }, [ticks, selectedSymbol]);

  const currentPrice = Number(activeTick.price || 84150);

  // Filtered pairs for dropdown
  const filteredPairs = useMemo(() => {
    return ticks.filter(t => {
      const q = pairSearchQuery.toLowerCase();
      return t.symbol.toLowerCase().includes(q) || (t.name || '').toLowerCase().includes(q);
    });
  }, [ticks, pairSearchQuery]);

  // Subscribe to storage changes
  useEffect(() => {
    const refreshAccounts = () => {
      const accs = exchangeStorage.getAccounts();
      setAccounts(accs);
      if (!activeAccountId && accs.length > 0) {
        setActiveAccountId(accs[0].id);
      }
    };

    const unsubAcc = exchangeStorage.subscribe(refreshAccounts);
    return () => unsubAcc();
  }, [activeAccountId]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleConnectionSuccess = (newAccount: StoredExchangeAccount) => {
    setAccounts(exchangeStorage.getAccounts());
    setActiveAccountId(newAccount.id);
    showNotification(`¡Conexión establecida con éxito en ${newAccount.venueName}! Alerta de seguridad enviada al bot de Telegram.`);
  };

  const [isDemoFeedEnabled, setIsDemoFeedEnabled] = useState(true);
  const [accountToDelete, setAccountToDelete] = useState<StoredExchangeAccount | null>(null);

  const confirmDeleteAccount = () => {
    if (!accountToDelete) return;

    if (accountToDelete.id === 'conn_binance_demo_feed') {
      setIsDemoFeedEnabled(false);
      setActiveAccountId(connectedAccounts[0]?.id || null);
      showNotification('Feed de Binance (Demo) desconectado.');
    } else {
      exchangeStorage.deleteAccount(accountToDelete.id);
      const updated = exchangeStorage.getAccounts();
      setAccounts(updated);
      if (activeAccountId === accountToDelete.id) {
        const remaining = updated.filter(a => a.id !== accountToDelete.id);
        setActiveAccountId(remaining[0]?.id || (isDemoFeedEnabled ? 'conn_binance_demo_feed' : null));
      }
      showNotification(`Conexión con ${accountToDelete.venueName} desvinculada.`);
    }
    setAccountToDelete(null);
  };

  const handleSyncBalance = async (acc: StoredExchangeAccount, e: React.MouseEvent) => {
    e.stopPropagation();
    setSyncingId(acc.id);
    try {
      const res = await verifyAndFetchExchangeBalance(acc.venueId, {
        apiKey: acc.apiKey,
        apiSecret: acc.apiSecret,
        passphrase: acc.passphrase,
        isTestnet: acc.isTestnet
      });
      if (res.success) {
        const updated = accounts.map(a => a.id === acc.id ? { ...a, balanceUsd: res.balanceUsd, freeMarginUsd: res.freeMarginUsd, lastSync: new Date().toISOString() } : a);
        exchangeStorage.saveAccounts(updated);
        setAccounts(updated);
        showNotification(`Saldo de ${acc.venueName} actualizado: $${res.balanceUsd.toLocaleString()} USD`);
      }
    } catch {}
    finally {
      setSyncingId(null);
    }
  };

  const handleQuickTrade = (side: 'BUY' | 'SELL') => {
    if (!activeAccount) {
      showNotification('Conecta un exchange primero para operar.');
      return;
    }

    const numericAmount = Math.max(1, parseFloat(orderAmountUsdt) || 500);
    const cryptoSize = (numericAmount / currentPrice).toFixed(4);

    positionStorage.addPosition({
      symbol: selectedSymbol,
      exchange: activeAccount.venueName,
      type: side === 'BUY' ? 'LONG' : 'SHORT',
      entryPrice: currentPrice,
      size: parseFloat(cryptoSize) || 0.01,
      notionalUsd: numericAmount * leverage,
      leverage: leverage,
      margin: numericAmount
    });

    showNotification(`¡Orden ${orderType} ${side} de $${numericAmount} (${riskPercentInput}% riesgo, ${leverage}x) ${selectedSymbol} despachada a ${activeAccount.venueName}!`);
  };

  return (
    <div className="min-h-screen sm:h-screen bg-[#06070B] text-slate-100 flex flex-col font-sans selection:bg-[#EC4899]/30 sm:overflow-hidden">
      
      {/* Top Navigation Bar: Mobile-First, Minimalist, clean */}
      <header className="sticky top-0 z-30 w-full bg-[#08090E]/95 backdrop-blur-xl border-b border-white/10 px-2 sm:px-6 py-1.5 sm:py-2 transition-all shrink-0">
        <div className="w-full flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Left: Brand + Back to Web */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button 
              onClick={onBackToLanding}
              className="p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-1 text-xs font-medium cursor-pointer border border-white/5 hover:border-white/15"
              title="Volver a la Web Principal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Web</span>
            </button>

            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <BrandLogo size="sm" />
            </div>
          </div>

          {/* Center: Clean Connection Status (Desktop only) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-slate-400">
              {wsConnected ? 'Conectado' : 'Reconectando...'}
            </span>
          </div>

          {/* Right: Telegram User Profile + Visual DEMO/REAL Switch */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-xs">
            
            {/* DEMO / REAL Switch */}
            <div className="flex items-center p-0.5 rounded-xl bg-black/60 border border-white/15 shadow-inner">
              <button
                type="button"
                onClick={() => handleTradingModeChange('demo')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  tradingMode === 'demo'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="text-[10px]">DEMO</span>
              </button>

              <button
                type="button"
                onClick={() => handleTradingModeChange('real')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  tradingMode === 'real'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px]">REAL</span>
              </button>
            </div>

            {/* Telegram Profile */}
            {user ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 hover:border-[#229ED9]/60 transition-colors shadow-sm">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-[#229ED9]/30 flex items-center justify-center text-[#229ED9] shrink-0">
                  <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
                <div className="hidden sm:flex flex-col text-left font-mono">
                  <span className="text-[11px] font-bold text-white leading-none truncate max-w-[90px]">
                    @{user.username || user.firstName}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    onBackToLanding();
                  }}
                  title="Cerrar Sesión"
                  className="p-0.5 rounded text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-gradient-to-r from-[#229ED9] to-[#0284C7] hover:brightness-110 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#229ED9]/25 active:scale-95"
              >
                <Send className="w-3 h-3 fill-white/20" />
                <span className="text-[10px] sm:text-[11px]">Login</span>
              </button>
            )}

            {/* Candlestick Language Selector (Desktop only) */}
            <div className="hidden md:block">
              <CandlestickLanguageSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Main Operations Canvas (Lienzo Vacío) Edge-to-Edge Fullscreen */}
      <main className="flex-1 w-full px-1 sm:px-2 py-0.5 sm:py-1 flex flex-col gap-1 min-h-0 h-auto sm:h-[calc(100vh-46px)] overflow-y-auto sm:overflow-hidden">
        
        {/* Connected Venues & Pair Bar */}
        <div className="flex items-center justify-between gap-1.5 shrink-0 py-0.5">
          
          {/* Left: Row of Connected Venue Pills */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {connectedAccounts.length > 0 ? (
              connectedAccounts.map((acc) => {
                const isSelected = activeAccount?.id === acc.id;

                return (
                  <div
                    key={acc.id}
                    onClick={() => setActiveAccountId(acc.id)}
                    className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#0E1524] to-[#121E36] border-[#38BDF8] shadow-md shadow-[#38BDF8]/20 ring-1 ring-[#38BDF8]/40 text-white'
                        : 'bg-[#0B0D16] hover:bg-[#101322] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <PlatformLogo name={acc.venueName} className="w-4 h-4 rounded shadow-sm shrink-0" />
                    
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] sm:text-[11px] font-bold text-white truncate max-w-[85px] sm:max-w-[105px]">
                          {acc.venueName}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      </div>
                      <div className="text-[8px] sm:text-[9px] font-mono text-emerald-400 font-bold">
                        ${(acc.balanceUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Sync Balance Button */}
                    <button
                      type="button"
                      onClick={(e) => handleSyncBalance(acc, e)}
                      className="p-0.5 rounded text-slate-500 hover:text-white transition-colors cursor-pointer"
                      title="Sincronizar balance real"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${syncingId === acc.id ? 'animate-spin text-[#38BDF8]' : ''}`} />
                    </button>

                    {/* Disconnect Button (triggers confirmation dialog) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAccountToDelete(acc);
                      }}
                      className="p-0.5 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Desvincular cuenta"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              })
            ) : isDemoFeedEnabled ? (
              /* Default Demo Feed Pill when no custom private accounts are added yet */
              <div
                onClick={() => setActiveAccountId('conn_binance_demo_feed')}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl border bg-gradient-to-r from-[#0E1524] to-[#121E36] border-[#38BDF8]/40 shadow-md shadow-[#38BDF8]/10 ring-1 ring-[#38BDF8]/30 text-white select-none cursor-pointer"
                title="Conexión en modo demo con datos en tiempo real de Binance"
              >
                <PlatformLogo name="Binance" className="w-4 h-4 rounded shadow-sm shrink-0" />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] sm:text-[11px] font-bold text-white truncate max-w-[90px] sm:max-w-[110px]">
                      Binance (Demo)
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  </div>
                  <div className="text-[8px] sm:text-[9px] font-mono text-emerald-400 font-bold">
                    $50,000.00 <span className="text-slate-400 font-normal text-[8px]">(Demo)</span>
                  </div>
                </div>

                {/* Disconnect Demo Feed Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAccountToDelete(defaultDemoVenue);
                  }}
                  className="p-0.5 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer ml-1"
                  title="Desconectar feed demo"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              /* Clean Empty State when user disconnected demo and has no accounts */
              <button
                type="button"
                onClick={() => {
                  setIsDemoFeedEnabled(true);
                  setActiveAccountId('conn_binance_demo_feed');
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-xl border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/5 text-slate-400 hover:text-white text-[10px] cursor-pointer transition-all"
              >
                <RefreshCw className="w-3 h-3 text-[#38BDF8]" />
                <span>Reactivar Feed Demo</span>
              </button>
            )}

            {/* Always visible: Add Connection Button '+' */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:brightness-110 text-white text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer shadow-md shadow-[#38BDF8]/20 active:scale-95 shrink-0"
              title="Añadir nueva conexión a Exchange o Broker"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span className="hidden xs:inline">Conectar</span>
            </button>
          </div>

          {/* Right: Pair Selector Dropdown (Always visible) */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-sm"
            >
              <span>{selectedSymbol}</span>
              <span className="text-emerald-400 font-bold hidden xs:inline">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isPairDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Pair dropdown */}
            {isPairDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-32px)] bg-[#0E1018] border border-white/15 rounded-2xl p-2.5 shadow-2xl z-50 backdrop-blur-2xl animate-in fade-in">
                <div className="relative mb-2">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    value={pairSearchQuery}
                    onChange={(e) => setPairSearchQuery(e.target.value)}
                    placeholder="Buscar par..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg pl-7 pr-2 py-1 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredPairs.map(p => (
                    <button
                      key={p.symbol}
                      type="button"
                      onClick={() => {
                        setSelectedSymbol(p.symbol);
                        setIsPairDropdownOpen(false);
                        setPairSearchQuery('');
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-mono flex items-center justify-between cursor-pointer ${
                        selectedSymbol === p.symbol ? 'bg-white/15 text-white font-bold' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{p.symbol}</span>
                        {p.change24h !== undefined && (
                          <span className={`text-[10px] ${p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {p.change24h >= 0 ? '+' : ''}{p.change24h.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">${Number(p.price || 0).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* WORKSPACE CANVAS BODY: Flex Row (Chart Workstation on Left + Trading Side Navigation on Right) */}
        <div className="flex-1 flex flex-col lg:flex-row gap-1.5 min-h-0 h-full w-full overflow-hidden">
          
          {/* LEFT: Full-bleed Chart Canvas (Takes 100% of workspace, TradingView style) */}
          <div className="flex-1 flex flex-col bg-[#070910] border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl min-h-0 h-full min-w-0">
            {/* Native KLineChart Hardware-Accelerated Canvas (Full-bleed taking all vertical space) */}
            <div className="w-full flex-1 relative min-h-[340px] sm:min-h-0 h-full overflow-hidden">
              <GlobalCityChart
                symbol={selectedSymbol}
                venueId={activeAccount?.venueId || 'binance'}
                venueName={activeAccount?.venueName || 'Binance'}
                livePrice={currentPrice}
                change24h={activeTick?.change24h}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* RIGHT: Trading Side Navigation (Navegación Lateral Replegable/Desplegable) */}
          <aside className={`transition-all duration-300 flex flex-col bg-[#090B12]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl shrink-0 overflow-hidden ${
            isTradePanelOpen 
              ? 'w-full lg:w-[325px] xl:w-[340px] h-auto lg:h-full p-3 sm:p-3.5 space-y-2.5 overflow-y-auto no-scrollbar' 
              : 'w-full lg:w-[84px] h-auto lg:h-full p-2 flex flex-col items-center justify-between space-y-2 overflow-y-auto no-scrollbar'
          }`}>
            {isTradePanelOpen ? (
              /* ESTADO DESPLEGADO: Panel Lateral Completo */
              <div className="w-full flex flex-col space-y-2.5 animate-in fade-in duration-200">
                {/* Header: Venue + Balance + Botón Replegar */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <PlatformLogo name={activeAccount?.venueName || 'Binance'} className="w-4 h-4 rounded shrink-0" />
                    <span className="font-bold text-white text-[11px] truncate">
                      {activeAccount?.venueName || (isDemoFeedEnabled ? 'Binance (Demo)' : 'Desconectado')}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                      ${(activeAccount?.freeMarginUsd || 50000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {activeAccount && (
                      <button
                        type="button"
                        onClick={() => setAccountToDelete(activeAccount)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Desconectar esta conexión"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsTradePanelOpen(false)}
                      className="px-2 py-0.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-0.5"
                      title="Replegar panel lateral"
                    >
                      <span>Replegar</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 1. Voltrex Side Capsule Pill (BUY / SELL) */}
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/60 border border-white/10 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setActiveSide('BUY')}
                    className={`py-2 rounded-xl text-xs font-mono font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      activeSide === 'BUY'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/25'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-3 h-3 stroke-[3]" />
                    <span>BUY (LONG)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSide('SELL')}
                    className={`py-2 rounded-xl text-xs font-mono font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      activeSide === 'SELL'
                        ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/25'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ArrowDownRight className="w-3 h-3 stroke-[3]" />
                    <span>SELL (SHORT)</span>
                  </button>
                </div>

                {/* 2. Order Type Selector (Market / Limit) */}
                <div className="flex items-center justify-between p-1.5 bg-black/40 border border-white/10 rounded-xl text-[10px] font-mono">
                  <span className="text-slate-400 pl-1">Tipo de Orden:</span>
                  <div className="flex rounded-lg bg-black/60 p-0.5 font-bold">
                    <button
                      type="button"
                      onClick={() => setOrderType('MARKET')}
                      className={`px-2.5 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                        orderType === 'MARKET' ? 'bg-[#38BDF8] text-black font-extrabold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      MARKET
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('LIMIT')}
                      className={`px-2.5 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                        orderType === 'LIMIT' ? 'bg-[#38BDF8] text-black font-extrabold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      LIMIT
                    </button>
                  </div>
                </div>

                {/* 3. Amount & Manual Risk % (No 0, no negativos, admite decimales) */}
                <div className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-2xl p-2.5 space-y-2 transition-all">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <span>Monto (Amount)</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-400">Riesgo:</span>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0.01"
                          value={riskPercentInput}
                          onChange={(e) => handleRiskPercentChange(e.target.value)}
                          onBlur={handleRiskPercentBlur}
                          className="w-14 bg-black/80 border border-white/20 rounded px-1 py-0.5 text-right font-mono font-bold text-white text-[10px] focus:outline-none focus:border-[#E06D8A]"
                        />
                        <span className="text-[9px] text-slate-400 ml-0.5">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-mono text-slate-500 mr-1">$</span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={orderAmountUsdt}
                        onChange={(e) => handleOrderAmountChange(e.target.value)}
                        className="w-28 bg-transparent text-xl sm:text-2xl font-mono font-black text-white tracking-tight focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      ≈ {((parseFloat(orderAmountUsdt) || 0) * leverage / currentPrice).toFixed(4)} {selectedSymbol.split('/')[0]}
                    </span>
                  </div>

                  {/* Quick Risk Chips */}
                  <div className="grid grid-cols-5 gap-1 pt-0.5">
                    {[0.5, 1, 2, 5, 10].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleRiskPercentClick(pct)}
                        className={`py-1 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer text-center ${
                          selectedRiskPercent === pct
                            ? 'bg-gradient-to-r from-[#E06D8A] to-[#F43F5E] text-white shadow-sm ring-1 ring-[#E06D8A]'
                            : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Leverage Bento Card with Range Slider */}
                <div className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-2xl p-2.5 space-y-1.5 transition-all">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <span>Apalancamiento</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      leverage <= 10 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {leverage <= 10 ? 'Bajo Riesgo' : 'Alto Riesgo'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight">
                      {leverage}x
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Poder: ${((parseFloat(orderAmountUsdt) || 0) * leverage).toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    className="w-full accent-[#E06D8A] cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-500">
                    <span>1x</span>
                    <span>25x</span>
                    <span>50x</span>
                    <span>75x</span>
                    <span>100x</span>
                  </div>
                </div>

                {/* 5. Stop Loss & Take Profit Bento Cards */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Stop Loss */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-2 space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>Stop Loss</span>
                      <span className="text-rose-400 font-bold">{stopLossPct === 0 ? 'Off' : `-${stopLossPct}%`}</span>
                    </div>
                    <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                      {[0, 10, 25, 50].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setStopLossPct(pct)}
                          className={`flex-1 py-0.5 rounded text-[8px] font-mono font-bold transition-all cursor-pointer ${
                            stopLossPct === pct ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          {pct === 0 ? '0%' : `-${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Take Profit */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-2 space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>Take Profit</span>
                      <span className="text-emerald-400 font-bold">{`+${takeProfitPct}%`}</span>
                    </div>
                    <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                      {[50, 100, 300, 900].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setTakeProfitPct(pct)}
                          className={`flex-1 py-0.5 rounded text-[8px] font-mono font-bold transition-all cursor-pointer ${
                            takeProfitPct === pct ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          {`+${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 6. Primary Place Order Button */}
                <button
                  type="button"
                  onClick={() => handleQuickTrade(activeSide)}
                  className={`w-full py-3 rounded-2xl font-mono font-black text-xs tracking-wider uppercase transition-all shadow-xl cursor-pointer active:scale-[0.98] ${
                    activeSide === 'BUY'
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black shadow-emerald-500/30 hover:brightness-110'
                      : 'bg-gradient-to-r from-rose-500 via-red-600 to-rose-600 text-white shadow-rose-500/30 hover:brightness-110'
                  }`}
                >
                  {activeSide === 'BUY' 
                    ? `Place Buy (${orderType} $${currentPrice.toFixed(2)})` 
                    : `Place Sell (${orderType} $${(currentPrice * 0.9998).toFixed(2)})`}
                </button>

                {/* 7. Institutional Execution Specs Table */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-2 space-y-1 text-[9px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Execution price</span>
                    <span className="text-white font-bold">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spread</span>
                    <span className="text-emerald-400">0% (Zero Markup)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Notional value</span>
                    <span className="text-slate-300 font-bold">${((parseFloat(orderAmountUsdt) || 0) * leverage).toLocaleString()} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Riesgo / Tipo</span>
                    <span className="text-[#38BDF8] font-bold">{riskPercentInput}% ({orderType})</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ESTADO REPLEGADO: Panel Lateral Compacto con Controles Directos */
              <div className="w-full flex flex-row lg:flex-col items-center justify-between gap-1.5 lg:gap-2.5 h-auto lg:h-full">
                {/* Header: Botón para Desplegar */}
                <div className="flex lg:w-full items-center justify-center lg:pb-2 lg:border-b lg:border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsTradePanelOpen(true)}
                    className="p-1 sm:p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 group"
                    title="Desplegar panel de trading"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#38BDF8] group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-[10px] font-mono font-bold lg:hidden">Operar</span>
                  </button>
                </div>

                {/* Mini Venue & Leverage Indicator */}
                <div className="hidden sm:flex flex-row lg:flex-col items-center gap-1 py-0.5 shrink-0">
                  <PlatformLogo name={activeAccount?.venueName || 'Binance'} className="w-4 h-4 sm:w-5 sm:h-5 rounded shrink-0 shadow-sm" />
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">
                    {leverage}x
                  </span>
                </div>

                {/* Botones de Compra y Venta Directos */}
                <div className="flex flex-row lg:flex-col gap-1.5 flex-1 lg:w-full">
                  <button
                    type="button"
                    onClick={() => handleQuickTrade('BUY')}
                    className="flex-1 lg:w-full py-1.5 lg:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-mono font-black text-[11px] shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title={`Comprar (Long ${selectedSymbol})`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                    <span>BUY</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickTrade('SELL')}
                    className="flex-1 lg:w-full py-1.5 lg:py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-mono font-black text-[11px] shadow-lg shadow-rose-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title={`Vender (Short ${selectedSymbol})`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
                    <span>SELL</span>
                  </button>
                </div>

                {/* Debajo: Tipo de Orden */}
                <div className="hidden xs:flex flex-col items-center bg-black/50 border border-white/10 rounded-xl p-1 shrink-0 lg:w-full">
                  <span className="text-[7px] font-mono uppercase text-slate-500 font-bold mb-0.5">Orden</span>
                  <div className="flex w-full rounded-lg bg-black/60 p-0.5 text-[9px] font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => setOrderType('MARKET')}
                      className={`px-1.5 py-0.5 rounded text-center transition-all cursor-pointer ${
                        orderType === 'MARKET' ? 'bg-[#38BDF8] text-black font-extrabold' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Orden a Mercado"
                    >
                      MKT
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('LIMIT')}
                      className={`px-1.5 py-0.5 rounded text-center transition-all cursor-pointer ${
                        orderType === 'LIMIT' ? 'bg-[#38BDF8] text-black font-extrabold' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Orden Límite"
                    >
                      LMT
                    </button>
                  </div>
                </div>

                {/* Debajo: Riesgo en % Manual (No 0, no negativos, admite decimales) */}
                <div className="flex flex-col items-center bg-black/50 border border-white/10 rounded-xl p-1 shrink-0 lg:w-full">
                  <span className="text-[7px] font-mono uppercase text-slate-500 font-bold mb-0.5">% Riesgo</span>
                  <div className="relative w-14 lg:w-full">
                    <input
                      type="number"
                      step="0.1"
                      min="0.01"
                      value={riskPercentInput}
                      onChange={(e) => handleRiskPercentChange(e.target.value)}
                      onBlur={handleRiskPercentBlur}
                      placeholder="1.0"
                      className="w-full bg-black/80 border border-white/15 rounded-lg py-0.5 px-1 text-center font-mono font-bold text-xs text-white focus:outline-none focus:border-[#E06D8A]"
                      title="Escribir % de riesgo manual (no 0, no negativo)"
                    />
                    <span className="text-[8px] text-slate-500 font-mono absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">%</span>
                  </div>
                  <div className="text-[7px] font-mono text-emerald-400 font-bold truncate max-w-full text-center">
                    ${parseFloat(orderAmountUsdt || '0').toLocaleString()}
                  </div>
                </div>

                {/* Acceso inferior para desplegar en desktop */}
                <button
                  type="button"
                  onClick={() => setIsTradePanelOpen(true)}
                  className="hidden lg:flex mt-auto w-full py-1.5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/10 text-slate-400 hover:text-white text-[9px] font-mono transition-all items-center justify-center gap-1 cursor-pointer"
                  title="Desplegar todo el panel lateral"
                >
                  <ChevronLeft className="w-3 h-3 text-[#38BDF8]" />
                  <span>Panel</span>
                </button>
              </div>
            )}
          </aside>

        </div>

      </main>

      {/* Disconnect Account Confirmation Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0E1018] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <PlatformLogo name={accountToDelete.venueName} className="w-8 h-8 rounded-xl shrink-0" />
              <div>
                <h3 className="text-base font-bold text-white">¿Desvincular {accountToDelete.venueName}?</h3>
                <p className="text-xs text-slate-400">
                  {accountToDelete.id === 'conn_binance_demo_feed'
                    ? 'Se detendrá el feed de demostración.'
                    : 'Esta acción cerrará la sesión de esta plataforma.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 leading-relaxed">
              {accountToDelete.id === 'conn_binance_demo_feed'
                ? 'El espacio quedará limpio sin conexiones activas. Podrás reactivarlo en cualquier momento o vincular tus claves API reales.'
                : 'Se eliminarán las claves y credenciales almacenadas. No podrás despachar órdenes en este exchange hasta que vuelvas a vincularlo.'}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteAccount}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Sí, Desvincular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Connection Modal */}
      <AddConnectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleConnectionSuccess}
        tradingMode={tradingMode}
      />

      {/* Floating Web Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md p-3.5 rounded-2xl bg-[#0D0F17]/95 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-2xl shadow-black/80 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-medium">{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
};
