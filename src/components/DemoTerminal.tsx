import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Zap, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw, 
  Bot, 
  Copy, 
  Send,
  Key,
  LogOut,
  Plus,
  Activity,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Server,
  Terminal,
  Wifi,
  Sparkles,
  ExternalLink,
  Flame,
  LayoutDashboard,
  Database,
  ChevronDown,
  Search,
  Check
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CandlestickLanguageSelector } from './CandlestickLanguageSelector';
import { ExchangeManager } from './ExchangeManager';
import { AiAssistantDock } from './AiAssistantDock';
import { GlobalCapitalChart } from './GlobalCapitalChart';
import { PortfolioAllocationRing } from './PortfolioAllocationRing';
import { useAuth } from '../context/AuthContext';
import { useLiveMarketTicks } from '../services/liveMarketFeed';
import { exchangeStorage } from '../services/exchangeStorage';
import { StoredExchangeAccount } from '../types/exchange';

interface DemoTerminalProps {
  onBackToLanding: () => void;
  onOpenAuth?: () => void;
}

export type TabId = 'connections' | 'overview' | 'multiorder' | 'arbitrage' | 'copy' | 'telegram' | 'risk';

export const DemoTerminal: React.FC<DemoTerminalProps> = ({ onBackToLanding, onOpenAuth }) => {
  const { user, logout } = useAuth();
  
  // Primary module: Conexiones & Exchanges
  const [activeTab, setActiveTab] = useState<TabId>('connections');
  
  // Hover Overlay Drawer state (replegada con solo iconos en reposo, se despliega completa al hover por encima del contenido)
  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);

  // Searchable Pair Dropdown selector state
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState<boolean>(false);
  const [pairSearchQuery, setPairSearchQuery] = useState<string>('');
  const [pairCategoryFilter, setPairCategoryFilter] = useState<'all' | 'crypto' | 'forex' | 'futures'>('all');
  
  // Real LocalStorage Exchange Accounts
  const [accounts, setAccounts] = useState<StoredExchangeAccount[]>(() => exchangeStorage.getAccounts());
  
  // Live WebSocket Ticks from Singleton Feed
  const { ticks, isConnected: wsConnected } = useLiveMarketTicks();

  const [orderAmount, setOrderAmount] = useState<string>("1.0");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC/USDT");
  const [notification, setNotification] = useState<string | null>(null);

  // Subscribe to storage changes
  useEffect(() => {
    const refreshAccounts = () => {
      setAccounts(exchangeStorage.getAccounts());
    };

    const unsubscribe = exchangeStorage.subscribe(refreshAccounts);
    return () => unsubscribe();
  }, []);

  // Aggregated Real Balances (Zero if no accounts connected)
  const connectedAccounts = accounts.filter(a => a.status === 'CONNECTED');
  const totalBalance = connectedAccounts.reduce((acc, curr) => acc + (curr.balanceUsd || 0), 0);
  const totalFreeMargin = connectedAccounts.reduce((acc, curr) => acc + (curr.freeMarginUsd || 0), 0);
  const gasTankBalance = user ? 50.00 : 0.00;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSimulateSplitOrder = (side: 'BUY' | 'SELL') => {
    if (connectedAccounts.length === 0) {
      showNotification('Conecta al menos una cuenta en "Conexiones & APIs" para despachar órdenes reales.');
      return;
    }

    const venuesList = connectedAccounts.map(a => a.venueName).join(', ');
    showNotification(
      `¡Orden Multi-Exchange ${side} de ${orderAmount} ${selectedSymbol} enviada con éxito! Fragmentada de forma concurrente entre: ${venuesList}.`
    );
  };

  // Grouped Navigation Modules inspired by Bento & Pro Dashboards
  const navSections = [
    {
      group: 'APPLICATION',
      items: [
        { 
          id: 'connections' as TabId, 
          label: 'Connections', 
          icon: Key, 
          badge: `${accounts.length}`,
          badgeColor: accounts.length > 0 ? 'bg-[#EC4899]/20 text-[#F472B6]' : 'bg-white/10 text-slate-400'
        },
        { 
          id: 'overview' as TabId, 
          label: 'Portfolio L2', 
          icon: LayoutDashboard, 
          badge: 'Live',
          badgeColor: 'bg-emerald-500/20 text-emerald-400'
        },
        { 
          id: 'multiorder' as TabId, 
          label: 'Smart Orders', 
          icon: Zap, 
          badge: 'EMS',
          badgeColor: 'bg-amber-500/20 text-amber-400'
        },
        { 
          id: 'arbitrage' as TabId, 
          label: 'Arbitrage L2', 
          icon: RotateCcw, 
          badge: 'Radar',
          badgeColor: 'bg-teal-500/20 text-teal-400'
        },
        { 
          id: 'copy' as TabId, 
          label: 'Copy Trading', 
          icon: Copy, 
          badge: 'Sync',
          badgeColor: 'bg-purple-500/20 text-purple-400'
        },
      ]
    },
    {
      group: 'SETTINGS & RISK',
      items: [
        { 
          id: 'telegram' as TabId, 
          label: 'Telegram Bot', 
          icon: Bot, 
          badge: 'mTLS',
          badgeColor: 'bg-sky-500/20 text-sky-400'
        },
        { 
          id: 'risk' as TabId, 
          label: 'Risk Engine', 
          icon: ShieldCheck, 
          badge: '5% DD',
          badgeColor: 'bg-rose-500/20 text-rose-400'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#06070B] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-[#EC4899]/30">
      
      {/* Cinematic Ambient Atmosphere (Top Blue Glow + Right Warm Gold Glow) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Ambient video layer */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          poster="/video/fondo_poster.webp"
          className="w-full h-full object-cover filter contrast-125 brightness-75 opacity-15"
        >
          <source src="/video/fondo_bg.mp4" type="video/mp4" />
        </video>
        {/* Atmospheric mesh gradient glows matching reference image */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#0284C7]/20 via-[#38BDF8]/10 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-[#F59E0B]/15 via-[#EC4899]/15 to-transparent blur-3xl opacity-50" />
        <div className="absolute inset-0 bg-[#06070B]/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        
        {/* Full-Width Edge-to-Edge Top Navigation Bar */}
        <header className="sticky top-0 z-30 w-full bg-[#090A10]/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-2 transition-all">
          <div className="w-full flex items-center justify-between gap-3">
            
            {/* Left: Brand + Back to Web + Sidebar Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={onBackToLanding}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer border border-white/5 hover:border-white/15"
                title="Back to Landing Page"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Web</span>
              </button>

              <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-2">
                <BrandLogo size="sm" />
                <span className="hidden xl:inline-flex text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-[#EC4899]/15 to-[#38BDF8]/15 border border-[#EC4899]/30 text-[#F472B6]">
                  Institutional Core
                </span>
              </div>

              {/* Sidebar Collapse / Expand Toggle Button */}
              <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/5 ml-1 hidden sm:flex items-center justify-center"
                title={isSidebarExpanded ? "Collapse Sidebar to Rail" : "Expand Sidebar"}
              >
                {isSidebarExpanded ? (
                  <ChevronLeft className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Middle: Real-time Telemetry & Stream Status */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-mono">
                <span className="text-slate-400">Venue Hub:</span>
                <span className="text-white font-bold">28+ CCXT & DMA</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-slate-400">WebSocket:</span>
                <span className={wsConnected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  1-Stream Active
                </span>
              </div>
            </div>

            {/* Right: Metrics Quick Pills + Telegram User + Candlestick Language */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs">
              
              {/* Quick Equity Chip */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
                <span className="text-slate-400 text-[10px] uppercase font-sans">Equity:</span>
                <span className="font-bold text-white font-mono-nums">
                  ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* User Profile */}
              {user ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 hover:border-[#229ED9]/60 transition-colors shadow-sm">
                  <div className="w-5 h-5 rounded-md bg-[#229ED9]/30 flex items-center justify-center text-[#229ED9] shrink-0">
                    <Send className="w-3 h-3" />
                  </div>
                  <div className="hidden sm:flex flex-col text-left font-mono">
                    <span className="text-[11px] font-bold text-white leading-none truncate max-w-[80px]">
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

              {/* Borderless Candlestick Language Selector */}
              <CandlestickLanguageSelector />
            </div>
          </div>
        </header>

        {/* Integrated Layout with Floating Hover-Drawer Lateral Navigation */}
        <div className="flex flex-1 w-full relative overflow-hidden">
          
          {/* Static Spacer Rail: keeps page content stable and prevents layout shift */}
          <div className="w-14 sm:w-16 shrink-0" />

          {/* Lateral Dock / Sidebar: Folded in resting state (icons only), expands on hover floating over canvas */}
          <aside 
            onMouseEnter={() => setIsSidebarHovered(true)}
            onMouseLeave={() => setIsSidebarHovered(false)}
            className={`absolute top-0 bottom-0 left-0 border-r border-white/10 bg-[#090A10]/95 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 ease-in-out select-none z-40 shadow-2xl ${
              isSidebarHovered ? 'w-60 p-3 shadow-black/90 ring-1 ring-white/10' : 'w-14 sm:w-16 p-2 items-center'
            }`}
          >
            {/* Navigation Groups */}
            <div className="space-y-4 w-full">
              {navSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-1 w-full">
                  {/* Category Header (Visible only on hover expansion) */}
                  {isSidebarHovered && (
                    <div className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                      {section.group}
                    </div>
                  )}

                  {/* Category Items */}
                  <div className="space-y-1 w-full">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full transition-all flex items-center cursor-pointer group relative overflow-hidden ${
                            isSidebarHovered 
                              ? 'px-3 py-2.5 rounded-xl text-left gap-3' 
                              : 'w-10 h-10 rounded-xl justify-center mx-auto'
                          } ${
                            isActive 
                              ? 'bg-gradient-to-r from-[#EC4899] to-[#38BDF8] text-white font-bold shadow-lg shadow-[#EC4899]/25' 
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                          }`}
                          title={item.label}
                        >
                          <Icon className={`shrink-0 transition-transform ${
                            isSidebarHovered ? 'w-4 h-4' : 'w-4 h-4'
                          } ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />

                          {isSidebarHovered && (
                            <div className="flex items-center justify-between flex-1 min-w-0">
                              <span className="text-xs truncate">
                                {item.label}
                              </span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                                isActive 
                                  ? 'bg-white/20 text-white font-bold' 
                                  : item.badgeColor
                              }`}>
                                {item.badge}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Bottom: Status / Info */}
            <div className="pt-3 border-t border-white/5 w-full">
              {isSidebarHovered ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-[10px] font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between items-center">
                    <span>Protocol:</span>
                    <span className="text-[#38BDF8] font-bold">CCXT + DMA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Storage:</span>
                    <span className="text-emerald-400 font-bold">Zero-Custody</span>
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 mx-auto" title="Zero-Custody Client Storage">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
              )}
            </div>
          </aside>

          {/* Main Operations Canvas (Takes 100% of remaining width) */}
          <main className="flex-1 w-full overflow-y-auto px-3 sm:px-6 py-4 pb-20 max-w-full">
            
            {/* Real-Time Searchable Pair Selector Dropdown & Live Venue Quotes */}
            <div className="bg-[#0D0F17]/90 border border-white/10 rounded-2xl p-3 sm:p-4 mb-4 backdrop-blur-xl shadow-xl space-y-3 relative z-30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* Searchable Pair Dropdown Selector */}
                <div className="relative">
                  {(() => {
                    const activeTick = ticks.find(t => t.symbol === selectedSymbol) || ticks[0] || {
                      symbol: selectedSymbol,
                      name: "Bitcoin Perpetual",
                      price: 84310.20,
                      change24h: 3.82,
                      volume24h: "$28.4B",
                      category: "crypto"
                    };

                    const filteredPairs = ticks.filter(t => {
                      const matchesSearch = t.symbol.toLowerCase().includes(pairSearchQuery.toLowerCase()) ||
                                            t.name.toLowerCase().includes(pairSearchQuery.toLowerCase());
                      if (!matchesSearch) return false;
                      if (pairCategoryFilter === 'all') return true;
                      return t.category === pairCategoryFilter;
                    });

                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
                          className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-sm group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FBBF24] via-[#F472B6] to-[#60A5FA] flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                              {selectedSymbol.substring(0, 3)}
                            </div>
                            <div className="text-left font-mono">
                              <div className="text-xs font-bold text-white group-hover:text-[#38BDF8] transition-colors flex items-center gap-1.5">
                                <span>{selectedSymbol}</span>
                                <span className="text-[9px] font-sans px-1 py-0.2 rounded bg-white/10 text-slate-400">
                                  {activeTick.category.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                                {activeTick.name}
                              </div>
                            </div>
                          </div>

                          <div className="text-right font-mono pl-2 border-l border-white/10">
                            <div className="text-xs font-bold text-white">
                              ${activeTick.price >= 10 
                                ? activeTick.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                                : activeTick.price.toFixed(5)
                              }
                            </div>
                            <div className={`text-[10px] font-bold ${
                              activeTick.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {activeTick.change24h >= 0 ? `+${activeTick.change24h}%` : `${activeTick.change24h}%`}
                            </div>
                          </div>

                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isPairDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                        </button>

                        {/* Floating Pair Selector Dropdown Menu */}
                        {isPairDropdownOpen && (
                          <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-[#0E1017] border border-white/15 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            {/* Search Input */}
                            <div className="relative mb-2">
                              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                autoFocus
                                placeholder="Buscar cripto o divisa (BTC, SOL, DOGE, EUR...)..."
                                value={pairSearchQuery}
                                onChange={(e) => setPairSearchQuery(e.target.value)}
                                className="w-full bg-[#07080C] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F472B6]"
                              />
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1.5 mb-1.5 border-b border-white/5">
                              {[
                                { id: 'all', label: `Todos (${ticks.length})` },
                                { id: 'crypto', label: 'Cripto' },
                                { id: 'forex', label: 'Forex' },
                                { id: 'futures', label: 'Futuros' },
                              ].map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => setPairCategoryFilter(cat.id as any)}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                                    pairCategoryFilter === cat.id
                                      ? 'bg-white/20 text-white font-bold'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {cat.label}
                                </button>
                              ))}
                            </div>

                            {/* Scrollable List of Pairs */}
                            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                              {filteredPairs.map((tick) => {
                                const isSelected = selectedSymbol === tick.symbol;
                                return (
                                  <button
                                    key={tick.symbol}
                                    type="button"
                                    onClick={() => {
                                      setSelectedSymbol(tick.symbol);
                                      setIsPairDropdownOpen(false);
                                      setPairSearchQuery('');
                                    }}
                                    className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                                      isSelected
                                        ? 'bg-gradient-to-r from-[#FBBF24]/20 via-[#F472B6]/20 to-[#60A5FA]/20 border border-white/20'
                                        : 'hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                          <span>{tick.symbol}</span>
                                          {isSelected && <Check className="w-3 h-3 text-[#38BDF8]" />}
                                        </div>
                                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                          {tick.name}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="text-right font-mono text-xs">
                                      <div className="font-bold text-white">
                                        ${tick.price >= 10 ? tick.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : tick.price.toFixed(5)}
                                      </div>
                                      <div className={`text-[10px] ${
                                        tick.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                      }`}>
                                        {tick.change24h >= 0 ? `+${tick.change24h}%` : `${tick.change24h}%`}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* 24h Clean Market Stats Strip (Replaces the Redis / tech tags) */}
                {(() => {
                  const tick = ticks.find(t => t.symbol === selectedSymbol) || ticks[0];
                  return (
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400 self-start sm:self-auto">
                      <div>
                        <span className="text-[9.5px] uppercase font-sans text-slate-500 mr-1">Vol 24h:</span>
                        <span className="text-white font-bold">{tick?.volume24h || '$28.4B'}</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] uppercase font-sans text-slate-500 mr-1">Spread:</span>
                        <span className="text-emerald-400 font-bold">~0.012%</span>
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Multi-Exchange WebSocket Live Quotes (Small KPIs for connected / primary exchanges) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-white/5">
                {[
                  { id: 'kucoin', name: 'KuCoin', color: '#24AE8F', spreadOffset: 0.00018, ping: '12ms' },
                  { id: 'binance', name: 'Binance', color: '#F0B90B', spreadOffset: 0, ping: '9ms' },
                  { id: 'okx', name: 'OKX', color: '#38BDF8', spreadOffset: -0.00012, ping: '11ms' },
                  { id: 'bybit', name: 'Bybit', color: '#F7A600', spreadOffset: 0.00014, ping: '10ms' },
                  { id: 'hyperliquid', name: 'Hyperliquid', color: '#50D2C1', spreadOffset: -0.00008, ping: '6ms' },
                ].map((venue) => {
                  const tick = ticks.find(t => t.symbol === selectedSymbol) || ticks[0] || {
                    symbol: selectedSymbol,
                    price: selectedSymbol.includes('BTC') ? 84310.20 : selectedSymbol.includes('ETH') ? 2728.50 : 186.40,
                    change24h: 3.45,
                    direction: 'up'
                  };

                  const venuePrice = tick.price * (1 + venue.spreadOffset);
                  const isConnected = accounts.some(a => a.venueId === venue.id && a.status === 'CONNECTED');
                  const isForex = selectedSymbol.includes('EUR');

                  return (
                    <div
                      key={venue.id}
                      className="bg-black/40 border border-white/5 hover:border-white/15 rounded-xl p-2.5 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span 
                            className="w-2 h-2 rounded-full shrink-0" 
                            style={{ backgroundColor: venue.color }} 
                          />
                          <span className="font-bold text-white truncate">{venue.name}</span>
                        </div>
                        {isConnected ? (
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ON
                          </span>
                        ) : (
                          <span className="text-[8.5px] font-mono text-slate-500">
                            {venue.ping}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between gap-1 font-mono">
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                          ${isForex 
                            ? venuePrice.toFixed(5) 
                            : venuePrice >= 1000 
                            ? venuePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : venuePrice.toFixed(2)
                          }
                        </span>
                        <span className={`text-[9px] ${
                          venue.spreadOffset >= 0 ? 'text-emerald-400' : 'text-sky-400'
                        }`}>
                          {venue.spreadOffset >= 0 ? `+${(venue.spreadOffset * 100).toFixed(2)}%` : `${(venue.spreadOffset * 100).toFixed(2)}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compact Bento Grid: Global Capital Chart + Portfolio Allocation Ring */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 mb-4">
              <div className="lg:col-span-8">
                <GlobalCapitalChart totalEquity={totalBalance} />
              </div>
              <div className="lg:col-span-4">
                <PortfolioAllocationRing 
                  accounts={accounts} 
                  totalEquity={totalBalance} 
                  onOpenConnectModal={() => setActiveTab('connections')} 
                />
              </div>
            </div>

            {/* Compact Workspace Key Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
              <div className="bg-[#0D0F17]/80 border border-white/10 px-3.5 py-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] text-slate-400 uppercase font-mono">Equidad Consolidada</div>
                  <div className="text-sm sm:text-base font-bold font-mono text-white">
                    ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <Wallet className="w-4 h-4 text-[#F472B6] shrink-0" />
              </div>

              <div className="bg-[#0D0F17]/80 border border-white/10 px-3.5 py-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] text-slate-400 uppercase font-mono">Margen Libre Total</div>
                  <div className="text-sm sm:text-base font-bold font-mono text-emerald-400">
                    ${totalFreeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <Zap className="w-4 h-4 text-[#38BDF8] shrink-0" />
              </div>

              <div className="bg-[#0D0F17]/80 border border-white/10 px-3.5 py-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] text-slate-400 uppercase font-mono">Conexiones Activas</div>
                  <div className="text-sm sm:text-base font-bold font-mono text-white">
                    {connectedAccounts.length} <span className="text-[10px] text-slate-400 font-normal">/ {accounts.length}</span>
                  </div>
                </div>
                <Key className="w-4 h-4 text-amber-400 shrink-0" />
              </div>

              <div className="bg-[#0D0F17]/80 border border-white/10 px-3.5 py-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] text-slate-400 uppercase font-mono">Gas Tank L2</div>
                  <div className="text-sm sm:text-base font-bold font-mono text-amber-400">
                    {gasTankBalance.toFixed(2)} USDT
                  </div>
                </div>
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              </div>
            </div>

            {/* Notification Toast */}
            {notification && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in shadow-xl backdrop-blur-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{notification}</span>
              </div>
            )}

            {/* TAB 01: Connections & Exchanges (Primary Focus) */}
            {activeTab === 'connections' && (
              <div className="animate-in fade-in duration-200">
                <ExchangeManager />
              </div>
            )}

            {/* TAB 02: Portfolio L2 Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="rounded-2xl p-4 sm:p-5 border border-white/10 bg-[#0D0F17]/85 backdrop-blur-xl shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/5">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>Real-Time Streaming Ticker Catalog</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Multiplexed live feed over 1 single WebSocket connection.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 self-start sm:self-auto">
                      Latency: ~12ms
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono-nums">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 font-sans text-[10px] uppercase">
                          <th className="pb-2.5 px-3">Symbol</th>
                          <th className="pb-2.5 px-3">Spot / Perp Price</th>
                          <th className="pb-2.5 px-3">24h Change</th>
                          <th className="pb-2.5 px-3">24h Volume</th>
                          <th className="pb-2.5 px-3 font-sans">Synced Venues</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {ticks.map((t) => (
                          <tr key={t.symbol} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-2.5 px-3 font-bold text-white font-sans flex items-center gap-2">
                              <span>{t.symbol}</span>
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/5 text-slate-400">
                                {t.category.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`transition-colors font-bold ${
                                t.direction === 'up' ? 'text-emerald-400' : t.direction === 'down' ? 'text-rose-400' : 'text-white'
                              }`}>
                                ${t.price >= 10 ? t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : t.price.toFixed(5)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex items-center gap-1 font-bold ${t.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {t.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {t.change24h >= 0 ? `+${t.change24h}%` : `${t.change24h}%`}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">{t.volume24h}</td>
                            <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px] truncate max-w-[240px]">{t.venues}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 03: Smart Orders EMS */}
            {activeTab === 'multiorder' && (
              <div className="rounded-2xl p-5 sm:p-6 max-w-2xl mx-auto border border-white/10 bg-[#0D0F17]/85 backdrop-blur-xl shadow-xl animate-in fade-in duration-200">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F59E0B]" />
                  <span>Concurrent Asynchronous Order Dispatch (EMS)</span>
                </h3>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Route orders concurrently across multiple active venues to minimize market impact and slippage.
                </p>

                {connectedAccounts.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5 mb-5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <div className="font-bold mb-0.5">No Connected Accounts</div>
                      <div className="text-slate-300">
                        Connect at least one exchange in <button onClick={() => setActiveTab('connections')} className="underline font-bold text-amber-300 cursor-pointer">Connections</button> to enable EMS routing.
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Trading Instrument</label>
                    <select 
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                      className="w-full bg-[#151724] border border-white/10 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#EC4899]"
                    >
                      <option value="BTC/USDT">BTC/USDT (Crypto Perpetual)</option>
                      <option value="ETH/USDT">ETH/USDT (Crypto Perpetual)</option>
                      <option value="SOL/USDT">SOL/USDT (Crypto Perpetual)</option>
                      <option value="EUR/USD">EUR/USD (Forex cTrader/MT5)</option>
                      <option value="XAU/USD">XAU/USD (Gold MT5)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Parent Order Size</label>
                    <input 
                      type="text" 
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      className="w-full bg-[#151724] border border-white/10 rounded-xl p-2.5 text-xs font-mono-nums font-bold text-white focus:outline-none focus:border-[#EC4899]"
                      placeholder="1.0"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-2">
                    <div className="text-slate-400 font-medium text-[11px]">Calculated EMS Split:</div>
                    {connectedAccounts.length > 0 ? (
                      connectedAccounts.map((acc) => {
                        const sharePct = 100 / connectedAccounts.length;
                        const splitQty = (Number(orderAmount || 0) / connectedAccounts.length).toFixed(4);
                        return (
                          <div key={acc.id} className="flex justify-between font-mono-nums text-slate-300 text-[11px]">
                            <span>{acc.venueName} ({acc.label}) ({sharePct.toFixed(0)}%):</span>
                            <span className="font-bold text-white">{splitQty}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-500 italic text-[11px]">Connect exchanges to view real-time split routing.</div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => handleSimulateSplitOrder('BUY')}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      CONCURRENT BUY (LONG)
                    </button>
                    <button
                      onClick={() => handleSimulateSplitOrder('SELL')}
                      className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-lg shadow-rose-500/20"
                    >
                      CONCURRENT SELL (SHORT)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 04: Arbitrage L2 */}
            {activeTab === 'arbitrage' && (
              <div className="rounded-2xl p-5 sm:p-6 border border-white/10 bg-[#0D0F17]/85 backdrop-blur-xl shadow-xl max-w-3xl mx-auto animate-in fade-in duration-200">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#2DD4BF]" />
                  <span>Simultaneous Synthetic Arbitrage Radar</span>
                </h3>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Capture cross-venue L2 price divergences without on-chain transfer delays.
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#141624] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>BTC/USDT: Binance Spot ➔ Bybit v5 Perp</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                          OPPORTUNITY
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Net Spread: <strong className="text-emerald-400 font-mono-nums">+0.284%</strong> (After taker fees)
                      </div>
                    </div>
                    <button 
                      onClick={() => showNotification("Synthetic Arbitrage BTC/USDT executed in 14ms! Gas Tank fee deducted.")}
                      className="px-4 py-2 rounded-xl bg-[#2DD4BF] text-slate-950 font-bold text-xs hover:bg-[#3be0cb] cursor-pointer transition-all active:scale-95 shrink-0"
                    >
                      Execute 1-Click
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 05: Copy Trading */}
            {activeTab === 'copy' && (
              <div className="rounded-2xl p-5 sm:p-6 border border-white/10 bg-[#0D0F17]/85 backdrop-blur-xl shadow-xl max-w-2xl mx-auto animate-in fade-in duration-200">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Copy className="w-4 h-4 text-[#A78BFA]" />
                  <span>Cross-Broker Signal Replication (Copy Trading)</span>
                </h3>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Configure your Master Account and mirror brokers with automatic lot and margin risk normalization.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#141624] border border-white/5 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">
                        Master Account: {connectedAccounts[0]?.venueName || 'Unassigned'}
                      </div>
                      <div className="text-slate-400 text-[11px]">Primary signal source for manual and algo trades.</div>
                    </div>
                    <span className="text-emerald-400 font-bold font-mono-nums px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px]">
                      MASTER OK
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 06: Telegram Bot */}
            {activeTab === 'telegram' && (
              <div className="rounded-2xl p-5 sm:p-6 border border-white/10 bg-[#0D0F17]/85 backdrop-blur-xl shadow-xl max-w-xl mx-auto text-center animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-xl bg-[#229ED9]/15 text-[#229ED9] border border-[#229ED9]/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#229ED9]/20">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Telegram Bot Control Center</h3>
                <p className="text-xs text-slate-300 mt-1 mb-5 leading-relaxed">
                  Authorize orders, receive real-time margin alerts, and manage risk using encrypted bot commands.
                </p>

                <div className="p-3.5 rounded-xl bg-[#141624] border border-white/5 text-xs text-slate-300 font-mono-nums mb-5 space-y-1 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Official Bot:</span>
                    <span className="text-white font-bold">@GlobalCityMaster_bot</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Webhook State:</span>
                    <span className="text-emerald-400 font-bold">ACTIVE (mTLS SSL)</span>
                  </div>
                </div>

                <button 
                  onClick={() => showNotification("Test notification sent to your Telegram chat with @GlobalCityMaster_bot.")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#229ED9] to-[#0284C7] text-white font-bold text-xs hover:brightness-110 cursor-pointer shadow-lg shadow-[#229ED9]/25 transition-all active:scale-95"
                >
                  Send Test Telegram Alert
                </button>
              </div>
            )}

            {/* TAB 07: Risk Engine & Prop Firm */}
            {activeTab === 'risk' && (
              <div className="rounded-2xl p-5 sm:p-6 border border-white/10 bg-[#0D0F17]/85 backdrop-blur-xl shadow-xl max-w-3xl mx-auto animate-in fade-in duration-200">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Institutional Risk Engine & Governance (Prop Firm)</span>
                </h3>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Enforce strict max daily drawdown (5%), total drawdown (10%), and dynamic leverage caps.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-[#12141F] border border-white/5">
                    <div className="text-slate-400 text-[10px]">MAX DAILY DRAWDOWN</div>
                    <div className="text-lg font-bold text-rose-400 mt-1">-5.00%</div>
                    <div className="text-[10px] text-slate-500 mt-1">EOD Threshold: $0.00 USD</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#12141F] border border-white/5">
                    <div className="text-slate-400 text-[10px]">MAX TOTAL DRAWDOWN</div>
                    <div className="text-lg font-bold text-rose-400 mt-1">-10.00%</div>
                    <div className="text-[10px] text-slate-500 mt-1">Trailing High-Water Mark</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#12141F] border border-white/5">
                    <div className="text-slate-400 text-[10px]">MAX LEVERAGE CAP</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">1:30 (DMA)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Tier-based margin rule</div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>

        {/* Minimalist Floating AI Assistant Dock (Grok / Raycast Style) */}
        <AiAssistantDock 
          accounts={accounts}
          totalEquity={totalBalance}
          wsConnected={wsConnected}
          onOpenTab={(tabId) => setActiveTab(tabId)}
        />

      </div>
    </div>
  );
};
