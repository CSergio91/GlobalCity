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
  Fuel,
  Key,
  LogOut,
  Plus,
  Activity,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Wallet,
  Server
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CandlestickLanguageSelector } from './CandlestickLanguageSelector';
import { ExchangeManager } from './ExchangeManager';
import { useAuth } from '../context/AuthContext';
import { useLiveMarketTicks } from '../services/liveMarketFeed';
import { exchangeStorage } from '../services/exchangeStorage';
import { StoredExchangeAccount } from '../types/exchange';

interface DemoTerminalProps {
  onBackToLanding: () => void;
  onOpenAuth?: () => void;
}

export const DemoTerminal: React.FC<DemoTerminalProps> = ({ onBackToLanding, onOpenAuth }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'connections' | 'overview' | 'multiorder' | 'arbitrage' | 'copy' | 'telegram'>('connections');
  
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

  return (
    <div className="min-h-screen bg-[#06070B] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Dynamic Ambient Background Video */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-25">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070B] via-[#06070B]/85 to-[#06070B]/60" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Terminal Top Bar - Mobile-First */}
        <header className="sticky top-0 z-40 bg-[#0D0F17]/90 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-2.5 sm:py-3 transition-all">
          <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto w-full">
            
            {/* Left: Back + Brand */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={onBackToLanding}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-white/5 hover:border-white/15 active:scale-95"
                title="Volver a la Web"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Volver a la Web</span>
              </button>

              <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-2">
                <BrandLogo size="sm" />
                <span className="hidden lg:inline-flex text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-[#EC4899]/15 to-[#38BDF8]/15 border border-[#EC4899]/30 text-[#F472B6]">
                  CCXT & DMA Broker Hub
                </span>
              </div>
            </div>

            {/* Middle: Live Feed Status (Tablet/Desktop) */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-400">Stream:</span>
              <span className={wsConnected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {wsConnected ? 'Binance WS 1-Conn' : 'Polling Macro'}
              </span>
            </div>

            {/* Right: Metrics / User Profile / Language Selector */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs">
              
              {/* Telegram Identity or Login Button */}
              {user ? (
                <div className="flex items-center gap-2 px-2.5 py-1 sm:py-1.5 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 hover:border-[#229ED9]/60 transition-colors shadow-sm shadow-[#229ED9]/10">
                  <div className="relative">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#229ED9]/30 flex items-center justify-center text-[#229ED9] shrink-0">
                      <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0D0F17] animate-pulse" />
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <div className="font-bold text-white text-[11px] leading-none flex items-center gap-1">
                      <span className="truncate max-w-[90px]">{user.firstName || user.username}</span>
                      <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        ACTIVO
                      </span>
                    </div>
                    <div className="text-[9px] font-mono text-[#38BDF8] leading-tight mt-0.5">
                      @{user.username || 'trader'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      onBackToLanding();
                    }}
                    title="Cerrar Sesión"
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#229ED9] to-[#0284C7] hover:brightness-110 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#229ED9]/25 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 fill-white/20" />
                  <span className="hidden sm:inline">Identificarse con Telegram</span>
                  <span className="sm:hidden">Login</span>
                </button>
              )}

              {/* Borderless Candlestick Language Selector */}
              <CandlestickLanguageSelector />
            </div>
          </div>

          {/* Mobile Metrics Ribbon */}
          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between sm:justify-start gap-4 text-[11px] font-mono overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-400 text-[10px] uppercase font-sans">Equidad Consolidada:</span>
              <span className="font-bold text-white font-mono-nums">
                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>

            <div className="h-3 w-[1px] bg-white/10 shrink-0" />

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-400 text-[10px] uppercase font-sans">Margen Libre:</span>
              <span className="font-bold text-slate-200 font-mono-nums">
                ${totalFreeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="h-3 w-[1px] bg-white/10 shrink-0" />

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-400 text-[10px] uppercase font-sans">Cuentas:</span>
              <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                connectedAccounts.length > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {connectedAccounts.length} / {accounts.length}
              </span>
            </div>

            <div className="h-3 w-[1px] bg-white/10 shrink-0" />

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-400 text-[10px] uppercase font-sans">Gas Tank:</span>
              <span className="font-bold text-emerald-400 font-mono-nums">
                {gasTankBalance.toFixed(2)} USDT
              </span>
            </div>
          </div>
        </header>

        {/* Navigation Sub-Tabs - Mobile-First Horizontal Scroll */}
        <div className="sticky top-[95px] sm:top-[90px] z-30 bg-[#0A0B10]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2">
            
            {/* Tab 0: Conexiones & APIs */}
            <button
              onClick={() => setActiveTab('connections')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'connections' 
                  ? 'bg-gradient-to-r from-[#EC4899]/20 to-[#38BDF8]/20 border border-[#EC4899]/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.25)]' 
                  : 'bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-[#E06D8A]" />
              <span>Conexiones & APIs</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                accounts.length > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {accounts.length}
              </span>
            </button>

            {/* Tab 1: Portafolio Agregado */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'overview' 
                  ? 'bg-gradient-to-r from-[#EC4899]/20 to-[#38BDF8]/20 border border-[#EC4899]/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.25)]' 
                  : 'bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Portafolio Agregado</span>
            </button>

            {/* Tab 2: Multi-Order Splitting */}
            <button
              onClick={() => setActiveTab('multiorder')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'multiorder' 
                  ? 'bg-gradient-to-r from-[#EC4899]/20 to-[#38BDF8]/20 border border-[#EC4899]/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.25)]' 
                  : 'bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Multi-Order Splitting</span>
            </button>

            {/* Tab 3: Arbitraje Sintético */}
            <button
              onClick={() => setActiveTab('arbitrage')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'arbitrage' 
                  ? 'bg-gradient-to-r from-[#EC4899]/20 to-[#38BDF8]/20 border border-[#EC4899]/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.25)]' 
                  : 'bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Arbitraje L2</span>
            </button>

            {/* Tab 4: Copy Trading Cruzado */}
            <button
              onClick={() => setActiveTab('copy')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'copy' 
                  ? 'bg-gradient-to-r from-[#EC4899]/20 to-[#38BDF8]/20 border border-[#EC4899]/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.25)]' 
                  : 'bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Copy className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Copy Trading</span>
            </button>

            {/* Tab 5: Telegram Webhook Control */}
            <button
              onClick={() => setActiveTab('telegram')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'telegram' 
                  ? 'bg-gradient-to-r from-[#EC4899]/20 to-[#38BDF8]/20 border border-[#EC4899]/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.25)]' 
                  : 'bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-[#229ED9]" />
              <span>Telegram Bot</span>
            </button>
          </div>
        </div>

        {/* Main Viewport Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {/* Notification Toast */}
          {notification && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in shadow-xl backdrop-blur-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-medium">{notification}</span>
            </div>
          )}

          {/* TAB 0: Conexiones & APIs (ExchangeManager) */}
          {activeTab === 'connections' && (
            <div className="animate-in fade-in duration-200">
              <ExchangeManager />
            </div>
          )}

          {/* TAB 1: Portafolio Agregado */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Accounts Status Cards or Clean Empty State */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#F472B6]" />
                    <span>Cuentas y Brokers Vinculados ({connectedAccounts.length})</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab('connections')}
                    className="text-xs font-semibold text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Conexión</span>
                  </button>
                </div>

                {accounts.length === 0 ? (
                  <div className="rounded-3xl p-6 sm:p-10 border border-white/10 bg-[#0D0F17]/80 backdrop-blur-xl text-center flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EC4899]/20 to-[#38BDF8]/20 border border-[#EC4899]/30 flex items-center justify-center text-[#F472B6] mb-4 shadow-lg shadow-[#EC4899]/10">
                      <Key className="w-7 h-7" />
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-white mb-2">
                      Sin Cuentas Vinculadas en este Dispositivo
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                      Tus credenciales se almacenan únicamente en tu navegador con arquitectura Zero-Knowledge. Conecta tus API Keys de Bybit, Binance, OKX, Hyperliquid o terminales MT5 para monitorear tu balance en tiempo real.
                    </p>
                    <button
                      onClick={() => setActiveTab('connections')}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#06B6D4] text-white font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#EC4899]/25 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Conectar mi Primer Exchange / Broker</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map((acc) => (
                      <div 
                        key={acc.id} 
                        className={`rounded-2xl p-5 border backdrop-blur-xl transition-all ${
                          acc.status === 'CONNECTED' 
                            ? 'bg-[#0D0F17]/80 border-white/10 hover:border-white/20' 
                            : 'bg-[#0D0F17]/40 border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">{acc.venueName}</span>
                          <span className={`text-[10px] font-mono-nums px-2 py-0.5 rounded ${
                            acc.status === 'CONNECTED' 
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                          }`}>
                            {acc.status} ({acc.pingMs}ms)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{acc.label}</div>
                        <div className="text-xl sm:text-2xl font-extrabold font-mono-nums text-white mt-3">
                          ${acc.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                          <span className="text-xs font-normal text-slate-400">USD</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono-nums mt-1 flex justify-between">
                          <span>Margen libre:</span>
                          <span className="text-slate-200">${acc.freeMarginUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Real-time Streaming Ticker Catalog (Singleton Pub/Sub WebSocket) */}
              <div className="rounded-3xl p-4 sm:p-6 border border-white/10 bg-[#0D0F17]/80 backdrop-blur-xl shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Catálogo de Activos y Precios en Tiempo Real</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Flujo de mercado multiplexado en 1 sola conexión WebSocket persistente.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                      Latencia: ~12ms
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="min-w-[620px] px-4 sm:px-0">
                    <table className="w-full text-left text-xs font-mono-nums">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 font-sans text-[11px]">
                          <th className="pb-3 px-3">Símbolo</th>
                          <th className="pb-3 px-3">Precio Spot / Perp</th>
                          <th className="pb-3 px-3">Variación 24h</th>
                          <th className="pb-3 px-3">Volumen 24h</th>
                          <th className="pb-3 px-3 font-sans">Infraestructura & Venues</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {ticks.map((t) => (
                          <tr key={t.symbol} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-3 font-bold text-white font-sans flex items-center gap-2">
                              <span>{t.symbol}</span>
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/5 text-slate-400">
                                {t.category.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`transition-colors font-bold ${
                                t.direction === 'up' ? 'text-emerald-400' : t.direction === 'down' ? 'text-rose-400' : 'text-white'
                              }`}>
                                ${t.price >= 10 ? t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : t.price.toFixed(5)}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center gap-1 font-bold ${t.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {t.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {t.change24h >= 0 ? `+${t.change24h}%` : `${t.change24h}%`}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-300">{t.volume24h}</td>
                            <td className="py-3 px-3 text-slate-400 font-sans text-[11px] truncate max-w-[200px]">{t.venues}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Multi-Order Splitting */}
          {activeTab === 'multiorder' && (
            <div className="rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto border border-white/10 bg-[#0D0F17]/80 backdrop-blur-xl shadow-xl">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#F59E0B]" />
                <span>Despacho Concurrente Asíncrono</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Envía una orden padre que el Smart Order Router fragmenta en milisegundos entre tus cuentas activas sin saturar la liquidez de un solo libro.
              </p>

              {connectedAccounts.length === 0 ? (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <div className="font-bold mb-1">Sin cuentas de trading vinculadas</div>
                    <div className="text-slate-300">
                      Para utilizar el Multi-Order Router, necesitas conectar al menos una cuenta en la pestaña <button onClick={() => setActiveTab('connections')} className="underline font-bold text-amber-300 cursor-pointer">Conexiones & APIs</button>.
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Instrumento a Operar</label>
                  <select 
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="w-full bg-[#151724] border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-[#EC4899]"
                  >
                    <option value="BTC/USDT">BTC/USDT (Cripto Perpetuo)</option>
                    <option value="ETH/USDT">ETH/USDT (Cripto Perpetuo)</option>
                    <option value="SOL/USDT">SOL/USDT (Cripto Perpetuo)</option>
                    <option value="EUR/USD">EUR/USD (Forex cTrader/MT5)</option>
                    <option value="XAU/USD">XAU/USD (Oro MT5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tamaño Total de la Orden Padre</label>
                  <input 
                    type="text" 
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    className="w-full bg-[#151724] border border-white/10 rounded-xl p-3 text-sm font-mono-nums font-bold text-white focus:outline-none focus:border-[#EC4899]"
                    placeholder="1.0"
                  />
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-2.5">
                  <div className="text-slate-400 font-medium">Distribución Calculada por el EMS:</div>
                  {connectedAccounts.length > 0 ? (
                    connectedAccounts.map((acc, idx) => {
                      const sharePct = 100 / connectedAccounts.length;
                      const splitQty = (Number(orderAmount || 0) / connectedAccounts.length).toFixed(4);
                      return (
                        <div key={acc.id} className="flex justify-between font-mono-nums text-slate-300">
                          <span>{acc.venueName} ({acc.label}) ({sharePct.toFixed(0)}%):</span>
                          <span className="font-bold text-white">{splitQty}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-slate-500 italic">Conecta exchanges para ver el split automático en tiempo real.</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleSimulateSplitOrder('BUY')}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    COMPRA CONCURRENTE (LONG)
                  </button>
                  <button
                    onClick={() => handleSimulateSplitOrder('SELL')}
                    className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-lg shadow-rose-500/20"
                  >
                    VENTA CONCURRENTE (SHORT)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Arbitraje */}
          {activeTab === 'arbitrage' && (
            <div className="rounded-3xl p-6 sm:p-8 border border-white/10 bg-[#0D0F17]/80 backdrop-blur-xl shadow-xl max-w-3xl mx-auto">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#2DD4BF]" />
                <span>Radar de Arbitraje Sintético Simultáneo</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Captura divergencias de precio entre libros L2 en tiempo real sin transferencias on-chain, ejecutando operaciones en ambos lados en microsegundos.
              </p>

              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141624] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>BTC/USDT: Binance Spot ➔ Bybit v5 Perp</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                        OPORTUNIDAD
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Spread Neto: <strong className="text-emerald-400 font-mono-nums">+0.284%</strong> (Deducidas comisiones taker de ambos lados)
                    </div>
                  </div>
                  <button 
                    onClick={() => showNotification("¡Arbitraje Sintético BTC/USDT ejecutado en 14ms! Fee deducido de Gas Tank.")}
                    className="px-5 py-2.5 rounded-xl bg-[#2DD4BF] text-slate-950 font-bold text-xs hover:bg-[#3be0cb] cursor-pointer transition-all active:scale-95 shrink-0 shadow-md shadow-[#2DD4BF]/20"
                  >
                    Disparar en 1-Clic
                  </button>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#141624] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>ETH/USDT: OKX DMA ➔ Hyperliquid L1</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                        ACTIVO
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Spread Neto: <strong className="text-emerald-400 font-mono-nums">+0.192%</strong> (Latencia cruzada 8ms)
                    </div>
                  </div>
                  <button 
                    onClick={() => showNotification("¡Arbitraje Sintético ETH/USDT ejecutado en 18ms! Fee deducido de Gas Tank.")}
                    className="px-5 py-2.5 rounded-xl bg-[#2DD4BF] text-slate-950 font-bold text-xs hover:bg-[#3be0cb] cursor-pointer transition-all active:scale-95 shrink-0 shadow-md shadow-[#2DD4BF]/20"
                  >
                    Disparar en 1-Clic
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Copy Trading Cruzado */}
          {activeTab === 'copy' && (
            <div className="rounded-3xl p-6 sm:p-8 border border-white/10 bg-[#0D0F17]/80 backdrop-blur-xl shadow-xl max-w-2xl mx-auto">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 flex items-center gap-2">
                <Copy className="w-5 h-5 text-[#A78BFA]" />
                <span>Puente de Replicación de Señales (Copy Trading)</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Configura tu cuenta Maestra y las secundarias para replicar operaciones con normalización de lotaje y riesgo por equidad.
              </p>

              {connectedAccounts.length < 2 ? (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <div className="font-bold mb-1">Requiere al menos 2 cuentas</div>
                    <div className="text-slate-300">
                      Para replicar órdenes necesitas 1 cuenta Master y al menos 1 cuenta Slave conectadas. Visita <button onClick={() => setActiveTab('connections')} className="underline font-bold text-amber-300 cursor-pointer">Conexiones & APIs</button> para añadirlas.
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-3.5 text-xs">
                <div className="p-4 rounded-2xl bg-[#141624] border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">
                      Cuenta Master: {connectedAccounts[0]?.venueName || 'No asignada'}
                    </div>
                    <div className="text-slate-400 text-[11px]">Origen de señales de trading y órdenes manuales.</div>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono-nums px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                    MASTER OK
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#141624] border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">
                      Espejo 1: {connectedAccounts[1]?.venueName || 'Broker Secundario'}
                    </div>
                    <div className="text-slate-400 text-[11px]">Multiplicador: 1.0x (Normalización automática de contratos)</div>
                  </div>
                  <span className="text-cyan-400 font-bold font-mono-nums px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                    ENLACE OK
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Telegram Webhook Control */}
          {activeTab === 'telegram' && (
            <div className="rounded-3xl p-6 sm:p-8 border border-white/10 bg-[#0D0F17]/80 backdrop-blur-xl shadow-xl max-w-xl mx-auto text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#229ED9]/15 text-[#229ED9] border border-[#229ED9]/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#229ED9]/20">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Centro de Control Telegram Bot</h3>
              <p className="text-xs text-slate-300 mt-2 mb-6 leading-relaxed">
                Controla la ejecución de órdenes, recibe reportes de margin call y autoriza retiros de capital con comandos cifrados vía Telegram.
              </p>
              
              <div className="p-4 rounded-2xl bg-[#141624] border border-white/5 text-xs text-slate-300 font-mono-nums mb-6 space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Bot Oficial:</span>
                  <span className="text-white font-bold">@GlobalCityMaster_bot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Estado Webhook:</span>
                  <span className="text-emerald-400 font-bold">ACTIVO (SSL MTLS)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Usuario Vinculado:</span>
                  <span className="text-[#38BDF8] font-bold">
                    {user ? `@${user.username || user.firstName}` : 'Sin identificar'}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => showNotification("Notificación enviada a tu chat de Telegram con @GlobalCityMaster_bot.")}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#229ED9] to-[#0284C7] text-white font-bold text-xs hover:brightness-110 cursor-pointer shadow-lg shadow-[#229ED9]/25 transition-all active:scale-95"
              >
                Enviar Notificación de Prueba a Telegram
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
