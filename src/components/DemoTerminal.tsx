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
    apiKey: '',
    apiSecret: '',
    balanceUsd: 50000,
    freeMarginUsd: 50000,
    currency: 'USDT',
    status: 'CONNECTED',
    isTestnet: true,
    connectedAt: new Date().toISOString()
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

    const numericAmount = parseFloat(orderAmountUsdt) || 500;
    const cryptoSize = (numericAmount / currentPrice).toFixed(4);

    positionStorage.addPosition({
      symbol: selectedSymbol,
      exchange: activeAccount.venueName,
      type: side === 'BUY' ? 'LONG' : 'SHORT',
      entryPrice: currentPrice,
      size: parseFloat(cryptoSize) || 0.01,
      notionalUsd: numericAmount,
      leverage: 1,
      margin: numericAmount
    });

    showNotification(`¡Orden ${side} de $${numericAmount} ${selectedSymbol} despachada a ${activeAccount.venueName}!`);
  };

  return (
    <div className="min-h-screen bg-[#06070B] text-slate-100 flex flex-col font-sans selection:bg-[#EC4899]/30">
      
      {/* Top Navigation Bar: Minimalist, clean, zero noise */}
      <header className="sticky top-0 z-30 w-full bg-[#08090E]/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-2 transition-all">
        <div className="w-full flex items-center justify-between gap-3">
          
          {/* Left: Brand + Back to Web */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={onBackToLanding}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer border border-white/5 hover:border-white/15"
              title="Volver a la Web Principal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Web</span>
            </button>

            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <BrandLogo size="sm" />
            </div>
          </div>

          {/* Center: Clean Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-slate-400">
              {wsConnected ? 'Conectado' : 'Reconectando...'}
            </span>
          </div>

          {/* Right: Telegram User Profile + Visual DEMO/REAL Switch + Language */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            
            {/* DEMO / REAL Switch */}
            <div className="flex items-center p-0.5 rounded-xl bg-black/60 border border-white/15 shadow-inner">
              <button
                type="button"
                onClick={() => handleTradingModeChange('demo')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  tradingMode === 'demo'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span className="text-[10px]">DEMO</span>
              </button>

              <button
                type="button"
                onClick={() => handleTradingModeChange('real')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 hover:border-[#229ED9]/60 transition-colors shadow-sm">
                <div className="w-5 h-5 rounded-md bg-[#229ED9]/30 flex items-center justify-center text-[#229ED9] shrink-0">
                  <Send className="w-3 h-3" />
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
                  className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#229ED9] to-[#0284C7] hover:brightness-110 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#229ED9]/25 active:scale-95"
              >
                <Send className="w-3 h-3 fill-white/20" />
                <span className="hidden sm:inline text-[11px]">Telegram</span>
              </button>
            )}

            {/* Candlestick Language Selector */}
            <CandlestickLanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Operations Canvas (Lienzo Vacío) Edge-to-Edge Fullscreen */}
      <main className="flex-1 w-full px-2 sm:px-4 py-2 flex flex-col gap-2 h-[calc(100vh-52px)] overflow-hidden">
        
        {/* Connected Venues Pills Bar */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          
          {/* Left: Row of Connected Venue Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {connectedAccounts.length > 0 ? (
              connectedAccounts.map((acc) => {
                const isSelected = activeAccount?.id === acc.id;

                return (
                  <div
                    key={acc.id}
                    onClick={() => setActiveAccountId(acc.id)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#0E1524] to-[#121E36] border-[#38BDF8] shadow-lg shadow-[#38BDF8]/20 ring-1 ring-[#38BDF8]/40 text-white'
                        : 'bg-[#0B0D16] hover:bg-[#101322] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <PlatformLogo name={acc.venueName} className="w-5 h-5 rounded-lg shadow-sm shrink-0" />
                    
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate max-w-[110px]">
                          {acc.venueName}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 font-bold">
                        ${(acc.balanceUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Sync Balance Button */}
                    <button
                      type="button"
                      onClick={(e) => handleSyncBalance(acc, e)}
                      className="p-1 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer"
                      title="Sincronizar balance real"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncingId === acc.id ? 'animate-spin text-[#38BDF8]' : ''}`} />
                    </button>

                    {/* Disconnect Button (triggers confirmation dialog) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAccountToDelete(acc);
                      }}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Desvincular cuenta"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            ) : isDemoFeedEnabled ? (
              /* Default Demo Feed Pill when no custom private accounts are added yet */
              <div
                onClick={() => setActiveAccountId('conn_binance_demo_feed')}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border bg-gradient-to-r from-[#0E1524] to-[#121E36] border-[#38BDF8]/40 shadow-lg shadow-[#38BDF8]/10 ring-1 ring-[#38BDF8]/30 text-white select-none cursor-pointer"
                title="Conexión en modo demo con datos en tiempo real de Binance"
              >
                <PlatformLogo name="Binance" className="w-5 h-5 rounded-lg shadow-sm shrink-0" />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">
                      Binance (Demo)
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold">
                    $50,000.00 <span className="text-slate-400 font-normal text-[9px]">(Simulado)</span>
                  </div>
                </div>

                {/* Disconnect Demo Feed Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAccountToDelete(defaultDemoVenue);
                  }}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer ml-1"
                  title="Desconectar feed demo"
                >
                  <Trash2 className="w-3 h-3" />
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/5 text-slate-400 hover:text-white text-xs cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Reactivar Feed Demo</span>
              </button>
            )}

            {/* Always visible: Add Connection Button '+' */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:brightness-110 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-[#38BDF8]/20 active:scale-95 shrink-0"
              title="Añadir nueva conexión a Exchange o Broker"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Añadir Conexión</span>
            </button>
          </div>

          {/* Right: Pair Selector Dropdown (Always visible) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-white transition-all cursor-pointer"
            >
              <span>{selectedSymbol}</span>
              <span className="text-emerald-400 font-bold">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isPairDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Pair dropdown */}
            {isPairDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#0E1018] border border-white/15 rounded-2xl p-2.5 shadow-2xl z-40 backdrop-blur-2xl animate-in fade-in">
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
                      <span>{p.symbol}</span>
                      <span className="text-slate-400 font-sans text-[11px]">${Number(p.price || 0).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* WORKSPACE CANVAS BODY: Fullscreen KLineChart Canvas with Bottom Execution Dock */}
        <div className="flex-1 flex flex-col bg-[#070910] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative min-h-[520px]">
          
          {/* Native KLineChart Hardware-Accelerated Canvas (Full-bleed) */}
          <div className="flex-1 w-full relative min-h-[460px]">
            <GlobalCityChart
              symbol={selectedSymbol}
              venueId={activeAccount?.venueId || 'binance'}
              venueName={activeAccount?.venueName || 'Binance'}
              livePrice={currentPrice}
            />
          </div>

          {/* Quick 1-Click Execution Footer Dock (Down below the chart) */}
          <div className="px-4 py-2 bg-[#090B12] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0 z-10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickTrade('BUY')}
                className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-black font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all text-xs"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-black stroke-[3]" />
                <span>COMPRAR (ASK: ${currentPrice.toFixed(2)})</span>
              </button>

              <div className="flex items-center bg-black/60 border border-white/15 rounded-xl px-2.5 py-1 font-mono">
                <span className="text-slate-500 mr-1">$</span>
                <input
                  type="number"
                  value={orderAmountUsdt}
                  onChange={(e) => setOrderAmountUsdt(e.target.value)}
                  className="w-16 bg-transparent text-white text-xs font-bold focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 ml-1">USDT</span>
              </div>

              <button
                type="button"
                onClick={() => handleQuickTrade('SELL')}
                className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white font-bold shadow-md shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all text-xs"
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-white stroke-[3]" />
                <span>VENDER (BID: ${(currentPrice * 0.9998).toFixed(2)})</span>
              </button>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>Operando en:</span>
                <span className="text-white font-bold flex items-center gap-1.5">
                  <PlatformLogo name={activeAccount?.venueName || 'Binance'} className="w-4 h-4 rounded" />
                  {activeAccount?.venueName || (isDemoFeedEnabled ? 'Binance (Demo)' : 'Desconectado')}
                </span>
                {activeAccount && (
                  <span className="text-emerald-400 font-bold ml-1">
                    (Disp: ${(activeAccount?.freeMarginUsd || 50000).toLocaleString()})
                  </span>
                )}
                {/* Desconectar conexión activa desde el dock */}
                {activeAccount && (
                  <button
                    type="button"
                    onClick={() => setAccountToDelete(activeAccount)}
                    className="ml-1 px-1.5 py-0.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer flex items-center gap-1 text-[10px]"
                    title="Desconectar esta conexión"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Cerrar</span>
                  </button>
                )}
              </div>

              {connectedAccounts.length === 0 && isDemoFeedEnabled && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#38BDF8] border border-[#38BDF8]/20 text-[10px] font-mono">
                  Feed en Vivo / Modo Demo
                </span>
              )}
            </div>
          </div>

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
