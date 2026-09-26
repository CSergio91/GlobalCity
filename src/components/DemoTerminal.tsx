import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  LogOut, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CandlestickLanguageSelector } from './CandlestickLanguageSelector';
import { ExchangeManager, MasterVenueTab } from './ExchangeManager';
import { useAuth } from '../context/AuthContext';
import { useLiveMarketTicks } from '../services/liveMarketFeed';
import { exchangeStorage } from '../services/exchangeStorage';
import { getRealMultiVenueQuotes, VenueLiveQuote } from '../services/realVenueQuotes';
import { StoredExchangeAccount } from '../types/exchange';

interface DemoTerminalProps {
  onBackToLanding: () => void;
  onOpenAuth?: () => void;
}

export type TabId = 'connections' | 'overview' | 'multiorder' | 'arbitrage' | 'copy' | 'telegram' | 'risk';

export const DemoTerminal: React.FC<DemoTerminalProps> = ({ onBackToLanding, onOpenAuth }) => {
  const { user, logout } = useAuth();
  
  // Real LocalStorage Exchange Accounts
  const [accounts, setAccounts] = useState<StoredExchangeAccount[]>(() => exchangeStorage.getAccounts());

  // Live WebSocket Feed Connection
  const { ticks, isConnected: wsConnected } = useLiveMarketTicks();

  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC/USDT");
  const [notification, setNotification] = useState<string | null>(null);
  const [realQuotes, setRealQuotes] = useState<Record<string, VenueLiveQuote>>({});

  // Fetch real market quotes directly from Bybit, OKX, KuCoin, Gate.io, and Coinbase
  useEffect(() => {
    let isMounted = true;
    const tick = ticks.find(t => t?.symbol === selectedSymbol) || ticks[0];
    const baseP = Number(tick?.price || 84000);

    const updateQuotes = async () => {
      try {
        const q = await getRealMultiVenueQuotes(selectedSymbol, baseP);
        if (isMounted) {
          setRealQuotes(q);
        }
      } catch {}
    };

    updateQuotes();
    const interval = setInterval(updateQuotes, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedSymbol, (ticks.find(t => t?.symbol === selectedSymbol) || ticks[0])?.price]);

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
        ? 'Modo DEMO activado: Simulación de trading sin arriesgar capital.'
        : 'Modo REAL activado: Solo cuentas con claves oficiales autenticadas directamente por el exchange.'
    );
  };

  // Master Venue Type Browser Tabs: 'exchanges' | 'brokers' | 'futures'
  const [masterVenueTab, setMasterVenueTab] = useState<MasterVenueTab>(() => {
    try {
      return (localStorage.getItem('globalcity_active_venue_type') as MasterVenueTab) || 'exchanges';
    } catch {
      return 'exchanges';
    }
  });

  const handleMasterVenueTabChange = (tab: MasterVenueTab) => {
    setMasterVenueTab(tab);
    try {
      localStorage.setItem('globalcity_active_venue_type', tab);
      window.dispatchEvent(new CustomEvent('globalcity_active_venue_type_changed', { detail: tab }));
    } catch {}

    if (tab === 'brokers') {
      setSelectedSymbol('EUR/USD');
    } else {
      setSelectedSymbol('BTC/USDT');
    }
  };

  // Subscribe to storage changes
  useEffect(() => {
    const refreshAccounts = () => {
      setAccounts(exchangeStorage.getAccounts());
    };
    const handleVenueTypeSync = (e: any) => {
      if (e?.detail && ['exchanges', 'brokers', 'futures'].includes(e.detail)) {
        setMasterVenueTab(e.detail);
      }
    };

    const unsubAcc = exchangeStorage.subscribe(refreshAccounts);
    window.addEventListener('globalcity_active_venue_type_changed', handleVenueTypeSync);

    return () => {
      unsubAcc();
      window.removeEventListener('globalcity_active_venue_type_changed', handleVenueTypeSync);
    };
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#06070B] text-slate-100 flex flex-col font-sans selection:bg-[#EC4899]/30">
      
      {/* Top Navigation Bar: Minimalist, fast, zero noise */}
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

          {/* Right: Telegram User Profile + Language Selector */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
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

      {/* Main Operations Canvas (Lienzo Vacío) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-16">
        
        {/* Top Browser-Style Master Tabs: Exchanges | Brokers | Futuros + DEMO/REAL Switch */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#07080D]/90 px-3 pt-2 mb-4 rounded-2xl backdrop-blur-xl shadow-lg overflow-hidden">
          <div className="flex items-end gap-1.5 sm:gap-2">
            
            {/* Browser Tab 1: Exchanges */}
            <button
              type="button"
              onClick={() => handleMasterVenueTabChange('exchanges')}
              className={`px-4 sm:px-6 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t-2 border-l border-r -mb-[1px] select-none ${
                masterVenueTab === 'exchanges'
                  ? 'bg-[#0D0F17] text-white border-t-[#38BDF8] border-l-white/10 border-r-white/10 border-b-transparent shadow-lg shadow-black/50 z-10'
                  : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border-transparent'
              }`}
            >
              Exchanges
            </button>

            {/* Browser Tab 2: Brokers */}
            <button
              type="button"
              onClick={() => handleMasterVenueTabChange('brokers')}
              className={`px-4 sm:px-6 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t-2 border-l border-r -mb-[1px] select-none ${
                masterVenueTab === 'brokers'
                  ? 'bg-[#0D0F17] text-white border-t-emerald-400 border-l-white/10 border-r-white/10 border-b-transparent shadow-lg shadow-black/50 z-10'
                  : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border-transparent'
              }`}
            >
              Brokers
            </button>

            {/* Browser Tab 3: Futuros */}
            <button
              type="button"
              onClick={() => handleMasterVenueTabChange('futures')}
              className={`px-4 sm:px-6 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t-2 border-l border-r -mb-[1px] select-none ${
                masterVenueTab === 'futures'
                  ? 'bg-[#0D0F17] text-white border-t-[#EC4899] border-l-white/10 border-r-white/10 border-b-transparent shadow-lg shadow-black/50 z-10'
                  : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border-transparent'
              }`}
            >
              Futuros
            </button>
          </div>

          {/* Right Side: Visual Toggle DEMO vs REAL */}
          <div className="flex items-center gap-2 pb-1.5">
            <div className="flex items-center p-0.5 rounded-xl bg-black/60 border border-white/15 shadow-inner">
              <button
                type="button"
                onClick={() => handleTradingModeChange('demo')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  tradingMode === 'demo'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>DEMO</span>
              </button>

              <button
                type="button"
                onClick={() => handleTradingModeChange('real')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  tradingMode === 'real'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>REAL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Exchange Manager: Directory and connection of venues */}
        <div className="animate-in fade-in duration-200">
          <ExchangeManager 
            activeMasterTab={masterVenueTab} 
            onMasterTabChange={setMasterVenueTab} 
            hideInternalTabs={true} 
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
            realQuotes={realQuotes}
            tradingMode={tradingMode}
          />
        </div>

      </main>

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
