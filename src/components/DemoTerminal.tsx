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
  Menu,
  X,
  ShieldCheck,
  FileText,
  ChevronRight,
  Gauge,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CandlestickLanguageSelector } from './CandlestickLanguageSelector';
import { ExchangeManager } from './ExchangeManager';
import { AiAssistantDock } from './AiAssistantDock';
import { useAuth } from '../context/AuthContext';
import { useLiveMarketTicks } from '../services/liveMarketFeed';
import { exchangeStorage } from '../services/exchangeStorage';
import { StoredExchangeAccount } from '../types/exchange';

interface DemoTerminalProps {
  onBackToLanding: () => void;
  onOpenAuth?: () => void;
}

export type TabId = 'connections' | 'overview' | 'multiorder' | 'arbitrage' | 'copy' | 'telegram' | 'risk' | 'roadmap';

export const DemoTerminal: React.FC<DemoTerminalProps> = ({ onBackToLanding, onOpenAuth }) => {
  const { user, logout } = useAuth();
  
  // Starting with the primary workspace module: Conexiones & Exchanges
  const [activeTab, setActiveTab] = useState<TabId>('connections');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);
  
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

  // Modules List ordered from easiest to most complex (as codified in WORKFLOW_ROADMAP.md)
  const moduleList = [
    { 
      id: 'connections' as TabId, 
      num: '01', 
      title: 'Conexiones & Exchanges CCXT', 
      desc: 'Gestor de API Keys y Brokers DMA (Uno debajo de otro)', 
      icon: Key, 
      color: '#EC4899',
      badge: `${accounts.length} Venues`,
      status: 'Enfoque Actual'
    },
    { 
      id: 'overview' as TabId, 
      num: '02', 
      title: 'Portafolio & Margen Agregado', 
      desc: 'Visión consolidada y streaming WebSocket de ticks', 
      icon: Layers, 
      color: '#38BDF8',
      badge: 'Live WS',
      status: 'Fase 2'
    },
    { 
      id: 'multiorder' as TabId, 
      num: '03', 
      title: 'Smart Order Router (EMS)', 
      desc: 'Fragmentación concurrente asíncrona de órdenes', 
      icon: Zap, 
      color: '#F59E0B',
      badge: 'Bajo Slippage',
      status: 'Fase 3'
    },
    { 
      id: 'arbitrage' as TabId, 
      num: '04', 
      title: 'Arbitraje Sintético L2', 
      desc: 'Captura de spreads cruzados entre libros de órdenes', 
      icon: RotateCcw, 
      color: '#2DD4BF',
      badge: 'Sub-20ms',
      status: 'Fase 4'
    },
    { 
      id: 'copy' as TabId, 
      num: '05', 
      title: 'Copy Trading Multibroker', 
      desc: 'Replicación cruzada con normalización de lotaje', 
      icon: Copy, 
      color: '#A78BFA',
      badge: 'Master / Slave',
      status: 'Fase 5'
    },
    { 
      id: 'telegram' as TabId, 
      num: '06', 
      title: 'Webhooks & Telegram Bot', 
      desc: 'Control y auditoría por chat @GlobalCityMaster_bot', 
      icon: Bot, 
      color: '#229ED9',
      badge: 'Cifrado mTLS',
      status: 'Fase 6'
    },
    { 
      id: 'risk' as TabId, 
      num: '07', 
      title: 'Risk Engine & Prop Firm', 
      desc: 'Drawdown diario (5%), colateral y governance', 
      icon: ShieldCheck, 
      color: '#10B981',
      badge: 'Auditoría',
      status: 'Fase 7'
    },
    { 
      id: 'roadmap' as TabId, 
      num: '08', 
      title: 'Roadmap & Checklist MCP', 
      desc: 'Ruta de desarrollo paso a paso y protocolo de IA', 
      icon: FileText, 
      color: '#F43F5E',
      badge: 'Hoja de Ruta',
      status: 'Checklist'
    }
  ];

  const sidebarVisible = isSidebarOpen || isSidebarHovered;

  return (
    <div className="min-h-screen bg-[#06070B] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-[#EC4899]/30">
      
      {/* Dynamic Ambient Background Video (Streamed with zero memory bloat) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          poster="/video/fondo_poster.webp"
          className="w-full h-full object-cover filter contrast-125 brightness-90"
        >
          <source src="/video/fondo_bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070B] via-[#06070B]/90 to-[#06070B]/70" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen pb-16">
        
        {/* Terminal Top Bar (High-Density Zoom-Out Pro Header) */}
        <header className="sticky top-0 z-40 bg-[#0A0B10]/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-2 transition-all">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            
            {/* Left: Sidebar Trigger (Opens on Hover or Click) + Back + Brand */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Lateral Navigation Trigger Button */}
              <div 
                className="relative"
                onMouseEnter={() => setIsSidebarHovered(true)}
              >
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:from-[#EC4899]/20 hover:to-[#38BDF8]/20 border border-white/10 hover:border-[#EC4899]/40 text-slate-200 hover:text-white transition-all flex items-center gap-2 text-xs font-bold cursor-pointer active:scale-95 shadow-sm"
                  title="Desplegar Menú Lateral de Módulos (Hover o Clic)"
                >
                  <Menu className="w-4 h-4 text-[#F472B6]" />
                  <span className="hidden sm:inline font-mono">Módulos</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-[#38BDF8]">
                    08
                  </span>
                </button>
              </div>

              <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

              <button 
                onClick={onBackToLanding}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer border border-white/5 hover:border-white/15"
                title="Volver a la Web"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Web</span>
              </button>

              <div className="flex items-center gap-2">
                <BrandLogo size="sm" />
                <span className="hidden lg:inline-flex text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-[#EC4899]/15 to-[#38BDF8]/15 border border-[#EC4899]/30 text-[#F472B6]">
                  CCXT Hub
                </span>
              </div>
            </div>

            {/* Middle: Active Module Title & Single-WebSocket Indicator */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-mono">
                <span className="text-slate-400">Espacio de Trabajo:</span>
                <span className="text-white font-bold">
                  {moduleList.find(m => m.id === activeTab)?.title}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-slate-400">Stream:</span>
                <span className={wsConnected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  1 Conexión Binance WS
                </span>
              </div>
            </div>

            {/* Right: User / Telegram / Borderless Candlestick Language */}
            <div className="flex items-center gap-2 text-xs">
              
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

              {/* Candlestick Language Selector */}
              <CandlestickLanguageSelector />
            </div>
          </div>

          {/* Compact Pro Metrics Ribbon (Zoom-Alejado Density) */}
          <div className="mt-1.5 pt-1.5 border-t border-white/5 max-w-7xl mx-auto flex items-center justify-between sm:justify-start gap-4 text-[10px] font-mono overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-500 font-sans uppercase">Equidad:</span>
              <span className="font-bold text-white font-mono-nums">
                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>

            <div className="h-2.5 w-[1px] bg-white/10 shrink-0" />

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-500 font-sans uppercase">Margen Libre:</span>
              <span className="font-bold text-slate-300 font-mono-nums">
                ${totalFreeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="h-2.5 w-[1px] bg-white/10 shrink-0" />

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-500 font-sans uppercase">Conexiones:</span>
              <span className={`font-bold px-1.5 py-0.2 rounded ${
                connectedAccounts.length > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {connectedAccounts.length} / {accounts.length}
              </span>
            </div>

            <div className="h-2.5 w-[1px] bg-white/10 shrink-0" />

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-500 font-sans uppercase">Gas Tank:</span>
              <span className="font-bold text-emerald-400 font-mono-nums">
                {gasTankBalance.toFixed(2)} USDT
              </span>
            </div>

            <div className="h-2.5 w-[1px] bg-white/10 shrink-0" />

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-500 font-sans uppercase">Catálogo:</span>
              <span className="text-[#38BDF8] font-bold">28+ Venues</span>
            </div>
          </div>
        </header>

        {/* Lateral Navigation Sidebar (Hover Triggered / Pinned) */}
        {sidebarVisible && (
          <div 
            className="fixed inset-0 z-50 flex pointer-events-auto"
            onMouseLeave={() => setIsSidebarHovered(false)}
          >
            {/* Backdrop */}
            <div 
              onClick={() => {
                setIsSidebarOpen(false);
                setIsSidebarHovered(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            />

            {/* Lateral Drawer Content */}
            <div 
              className="relative w-full max-w-xs sm:max-w-sm bg-[#0B0D14]/98 border-r border-white/10 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-left duration-200"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BrandLogo size="sm" />
                  <div>
                    <div className="font-bold text-white text-xs">Módulos de Trading</div>
                    <div className="text-[10px] font-mono text-[#F472B6]">GlobalCity Pro Suite</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsSidebarHovered(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modules List (Ordered from Easiest to Most Complex) */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-500 font-bold">
                  Ruta de Implementación Secuencial
                </div>

                {moduleList.map((m) => {
                  const Icon = m.icon;
                  const isActive = activeTab === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setActiveTab(m.id);
                        setIsSidebarOpen(false);
                        setIsSidebarHovered(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 cursor-pointer group relative overflow-hidden ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#EC4899]/20 to-[#38BDF8]/20 border border-[#EC4899]/50 shadow-md' 
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10'
                      }`}
                    >
                      {/* Left accent color strip */}
                      {isActive && (
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#EC4899] to-[#38BDF8]"
                        />
                      )}

                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ 
                          backgroundColor: `${m.color}20`,
                          color: m.color,
                          border: `1px solid ${m.color}40`
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                            {m.num}. {m.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {m.desc}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px]">
                          <span className="px-1.5 py-0.2 rounded bg-white/5 text-slate-300">
                            {m.badge}
                          </span>
                          <span className={isActive ? 'text-[#F472B6] font-bold' : 'text-slate-500'}>
                            {m.status}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 self-center transition-transform ${
                        isActive ? 'text-[#EC4899] translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                      }`} />
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer (System & Architecture Info) */}
              <div className="p-3 border-t border-white/10 bg-[#07080D] text-[10px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Arquitectura:</span>
                  <span className="text-white font-bold">Zero-Knowledge LocalStorage</span>
                </div>
                <div className="flex justify-between">
                  <span>Protocolo IA:</span>
                  <span className="text-[#38BDF8] font-bold">Model Context Protocol (MCP)</span>
                </div>
                <div className="flex justify-between">
                  <span>Streaming:</span>
                  <span className="text-emerald-400 font-bold">1 Conexión Singleton</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Main Clean Workspace Canvas (Zoom-Alejado Pro Trading Density) */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          
          {/* Notification Toast */}
          {notification && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in shadow-xl backdrop-blur-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{notification}</span>
            </div>
          )}

          {/* TAB 01: Conexiones & Exchanges CCXT (CURRENT FOCUS & WORKSPACE) */}
          {activeTab === 'connections' && (
            <div className="animate-in fade-in duration-200">
              <ExchangeManager />
            </div>
          )}

          {/* TAB 02: Portafolio Agregado & Margen Consolidado */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Real-time Streaming Ticker Catalog */}
              <div className="rounded-2xl p-4 sm:p-5 border border-white/10 bg-[#0D0F17]/85 backdrop-blur-xl shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/5">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Catálogo de Activos y Precios en Tiempo Real</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Flujo de mercado multiplexado en 1 sola conexión WebSocket persistente.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 self-start sm:self-auto">
                    Latencia: ~12ms
                  </span>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="min-w-[580px] px-4 sm:px-0">
                    <table className="w-full text-left text-xs font-mono-nums">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 font-sans text-[10px] uppercase">
                          <th className="pb-2.5 px-3">Símbolo</th>
                          <th className="pb-2.5 px-3">Precio Spot / Perp</th>
                          <th className="pb-2.5 px-3">Variación 24h</th>
                          <th className="pb-2.5 px-3">Volumen 24h</th>
                          <th className="pb-2.5 px-3 font-sans">Venues Sincronizados</th>
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
                            <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px] truncate max-w-[200px]">{t.venues}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 03: Smart Order Router (EMS) */}
          {activeTab === 'multiorder' && (
            <div className="rounded-2xl p-5 sm:p-6 max-w-2xl mx-auto border border-white/10 bg-[#0D0F17]/85 backdrop-blur-xl shadow-xl animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F59E0B]" />
                <span>Despacho Concurrente Asíncrono (EMS)</span>
              </h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Envía una orden padre que el Smart Order Router fragmenta en milisegundos entre tus cuentas activas sin saturar la liquidez de un solo libro.
              </p>

              {connectedAccounts.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5 mb-5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <div className="font-bold mb-0.5">Sin cuentas vinculadas</div>
                    <div className="text-slate-300">
                      Conecta tus exchanges en <button onClick={() => setActiveTab('connections')} className="underline font-bold text-amber-300 cursor-pointer">Conexiones & APIs</button> para activar el enrutamiento concurrente.
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Instrumento a Operar</label>
                  <select 
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="w-full bg-[#151724] border border-white/10 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#EC4899]"
                  >
                    <option value="BTC/USDT">BTC/USDT (Cripto Perpetuo)</option>
                    <option value="ETH/USDT">ETH/USDT (Cripto Perpetuo)</option>
                    <option value="SOL/USDT">SOL/USDT (Cripto Perpetuo)</option>
                    <option value="EUR/USD">EUR/USD (Forex cTrader/MT5)</option>
                    <option value="XAU/USD">XAU/USD (Oro MT5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tamaño de la Orden Padre</label>
                  <input 
                    type="text" 
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    className="w-full bg-[#151724] border border-white/10 rounded-xl p-2.5 text-xs font-mono-nums font-bold text-white focus:outline-none focus:border-[#EC4899]"
                    placeholder="1.0"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-2">
                  <div className="text-slate-400 font-medium text-[11px]">Distribución Calculada por el EMS:</div>
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
                    <div className="text-slate-500 italic text-[11px]">Conecta exchanges para ver el split automático en tiempo real.</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => handleSimulateSplitOrder('BUY')}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    COMPRA CONCURRENTE (LONG)
                  </button>
                  <button
                    onClick={() => handleSimulateSplitOrder('SELL')}
                    className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-lg shadow-rose-500/20"
                  >
                    VENTA CONCURRENTE (SHORT)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 04: Arbitraje Sintético L2 */}
          {activeTab === 'arbitrage' && (
            <div className="rounded-2xl p-5 sm:p-6 border border-white/10 bg-[#0D0F17]/85 backdrop-blur-xl shadow-xl max-w-3xl mx-auto animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#2DD4BF]" />
                <span>Radar de Arbitraje Sintético Simultáneo</span>
              </h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Captura divergencias de precio entre libros L2 en tiempo real sin transferencias on-chain, ejecutando operaciones en ambos lados en microsegundos.
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#141624] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>BTC/USDT: Binance Spot ➔ Bybit v5 Perp</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                        OPORTUNIDAD
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Spread Neto: <strong className="text-emerald-400 font-mono-nums">+0.284%</strong> (Deducidas comisiones taker)
                    </div>
                  </div>
                  <button 
                    onClick={() => showNotification("¡Arbitraje Sintético BTC/USDT ejecutado en 14ms! Fee deducido de Gas Tank.")}
                    className="px-4 py-2 rounded-xl bg-[#2DD4BF] text-slate-950 font-bold text-xs hover:bg-[#3be0cb] cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    Disparar 1-Clic
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
                <span>Puente de Replicación de Señales (Copy Trading)</span>
              </h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Configura tu cuenta Maestra y las secundarias para replicar operaciones con normalización de lotaje y riesgo por equidad.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#141624] border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">
                      Cuenta Master: {connectedAccounts[0]?.venueName || 'No asignada'}
                    </div>
                    <div className="text-slate-400 text-[11px]">Origen de señales de trading y órdenes manuales.</div>
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
              <h3 className="text-base font-bold text-white">Centro de Control Telegram Bot</h3>
              <p className="text-xs text-slate-300 mt-1 mb-5 leading-relaxed">
                Controla la ejecución de órdenes, recibe reportes de margin call y autoriza retiros con comandos cifrados vía Telegram.
              </p>

              <div className="p-3.5 rounded-xl bg-[#141624] border border-white/5 text-xs text-slate-300 font-mono-nums mb-5 space-y-1 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Bot Oficial:</span>
                  <span className="text-white font-bold">@GlobalCityMaster_bot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Estado Webhook:</span>
                  <span className="text-emerald-400 font-bold">ACTIVO (SSL MTLS)</span>
                </div>
              </div>

              <button 
                onClick={() => showNotification("Notificación enviada a tu chat de Telegram con @GlobalCityMaster_bot.")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#229ED9] to-[#0284C7] text-white font-bold text-xs hover:brightness-110 cursor-pointer shadow-lg shadow-[#229ED9]/25 transition-all active:scale-95"
              >
                Enviar Notificación de Prueba a Telegram
              </button>
            </div>
          )}

          {/* TAB 07: Risk Engine & Prop Firm */}
          {activeTab === 'risk' && (
            <div className="rounded-2xl p-5 sm:p-6 border border-white/10 bg-[#0D0F17]/85 backdrop-blur-xl shadow-xl max-w-3xl mx-auto animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Risk Engine & Governance Institucional (Prop Firm)</span>
              </h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Reglas de control de drawdown diario (5%), drawdown total (10%), apalancamiento máximo y protección frente a caídas bruscas.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-[#12141F] border border-white/5">
                  <div className="text-slate-400 text-[10px]">MAX DRAWDOWN DIARIO</div>
                  <div className="text-lg font-bold text-rose-400 mt-1">-5.00%</div>
                  <div className="text-[10px] text-slate-500 mt-1">Límite: $0.00 USD</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#12141F] border border-white/5">
                  <div className="text-slate-400 text-[10px]">MAX DRAWDOWN TOTAL</div>
                  <div className="text-lg font-bold text-rose-400 mt-1">-10.00%</div>
                  <div className="text-[10px] text-slate-500 mt-1">Trailing High-Water Mark</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#12141F] border border-white/5">
                  <div className="text-slate-400 text-[10px]">APALANCAMIENTO MÁXIMO</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">1:30 (DMA)</div>
                  <div className="text-[10px] text-slate-500 mt-1">Margen dinámico por tier</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 08: Roadmap & Checklist MCP */}
          {activeTab === 'roadmap' && (
            <div className="rounded-2xl p-5 sm:p-6 border border-white/10 bg-[#0D0F17]/85 backdrop-blur-xl shadow-xl max-w-3xl mx-auto animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F43F5E]" />
                <span>Hoja de Ruta y Checklist Secuencial (WORKFLOW_ROADMAP.md)</span>
              </h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Desarrollo modular de menor a mayor complejidad algorítmica para GlobalCity Institutional Core.
              </p>

              <div className="space-y-2.5 text-xs">
                {moduleList.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-[#12141F] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500 text-[11px] font-bold">{m.num}</span>
                      <div>
                        <div className="font-bold text-white">{m.title}</div>
                        <div className="text-[11px] text-slate-400">{m.desc}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#38BDF8] border border-white/10 shrink-0">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* Bottom AI Assistant Dock (Grok / ChatGPT / Cursor Style) */}
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
