import React, { useState, useMemo } from 'react';
import { 
  BarChart2, 
  X, 
  Maximize2, 
  Minimize2, 
  ChevronDown,
  Search,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Sliders,
  Sparkles,
  Layers,
  Activity,
  Shield,
  Target
} from 'lucide-react';
import { useLiveMarketTicks, MarketAssetTick } from '../services/liveMarketFeed';
import { StoredExchangeAccount } from '../types/exchange';
import { positionStorage } from '../services/positionStorage';
import { exchangeStorage } from '../services/exchangeStorage';

interface VenueChartViewerProps {
  venueId: string;
  venueName: string;
  venueColor?: string;
  selectedSymbol: string;
  onSymbolChange?: (symbol: string) => void;
  onClose: () => void;
  livePrice?: number;
  connectedAccount?: StoredExchangeAccount;
}

export const VenueChartViewer: React.FC<VenueChartViewerProps> = ({
  venueId,
  venueName,
  venueColor = '#38BDF8',
  selectedSymbol,
  onSymbolChange,
  onClose,
  livePrice,
  connectedAccount
}) => {
  const { ticks } = useLiveMarketTicks();
  const [currentPair, setCurrentPair] = useState(selectedSymbol || 'BTC/USDT');
  const [interval, setInterval] = useState('15');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dropdown symbol selector state (identical to dashboard)
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
  const [pairSearchQuery, setPairSearchQuery] = useState('');
  const [pairCategoryFilter, setPairCategoryFilter] = useState<'all' | 'crypto' | 'forex' | 'futures'>('all');

  // Chart Trading & Tools Overlay State
  const [isTradingBarOpen, setIsTradingBarOpen] = useState(true);
  const [orderAmountUsdt, setOrderAmountUsdt] = useState('500');
  const [activeTool, setActiveTool] = useState<'none' | 'arbitrage' | 'orderblocks' | 'sltp'>('none');
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  // Find active tick for currentPair
  const activeTick = useMemo(() => {
    return ticks.find(t => t.symbol === currentPair) || {
      symbol: currentPair,
      name: currentPair.includes('BTC') ? 'Bitcoin Perpetual' : 'Asset Perpetual',
      price: livePrice || 84150,
      change24h: 2.5,
      category: 'crypto' as const
    };
  }, [ticks, currentPair, livePrice]);

  const currentPrice = Number(activeTick.price || livePrice || 84150);
  const priceChange = Number(activeTick.change24h || 0);

  // Filtered list of pairs for the dashboard-styled dropdown
  const filteredPairs = useMemo(() => {
    return ticks.filter(t => {
      const matchesSearch = 
        t.symbol.toLowerCase().includes(pairSearchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(pairSearchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (pairCategoryFilter === 'all') return true;
      return t.category === pairCategoryFilter;
    });
  }, [ticks, pairSearchQuery, pairCategoryFilter]);

  const handlePairSelect = (tick: MarketAssetTick) => {
    setCurrentPair(tick.symbol);
    setIsPairDropdownOpen(false);
    setPairSearchQuery('');
    if (onSymbolChange) {
      onSymbolChange(tick.symbol);
    }
  };

  // Build TradingView format symbol
  const cleanSymbol = currentPair.replace('/', '');
  let tvPrefix = 'KUCOIN';
  if (venueId === 'binance') tvPrefix = 'BINANCE';
  else if (venueId === 'bybit') tvPrefix = 'BYBIT';
  else if (venueId === 'okx') tvPrefix = 'OKX';
  else if (venueId === 'gateio') tvPrefix = 'GATEIO';
  else if (venueId === 'coinbase') tvPrefix = 'COINBASE';
  else if (venueId === 'kraken') tvPrefix = 'KRAKEN';

  const tvSymbol = `${tvPrefix}:${cleanSymbol}`;

  const tvWidgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${venueId}&symbol=${encodeURIComponent(tvSymbol)}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0D0F17&theme=dark&style=1&timezone=exchange&withdateranges=1&studies=[]&hide_side_toolbar=false&allow_symbol_change=1`;

  // 1-Click Fast Execution from Chart
  const handleQuickChartTrade = (side: 'BUY' | 'SELL') => {
    const numericAmount = parseFloat(orderAmountUsdt) || 500;
    const cryptoSize = (numericAmount / currentPrice).toFixed(4);

    positionStorage.addPosition({
      symbol: currentPair,
      exchange: venueName,
      type: side === 'BUY' ? 'LONG' : 'SHORT',
      entryPrice: currentPrice,
      size: parseFloat(cryptoSize) || 0.01,
      notionalUsd: numericAmount,
      leverage: 1,
      margin: numericAmount
    });

    if (connectedAccount) {
      const updatedAccounts = exchangeStorage.getAccounts().map(acc => {
        if (acc.id === connectedAccount.id) {
          return {
            ...acc,
            freeMarginUsd: Math.max(0, (acc.freeMarginUsd || 0) - numericAmount)
          };
        }
        return acc;
      });
      exchangeStorage.saveAccounts(updatedAccounts);
    }

    try {
      window.dispatchEvent(new CustomEvent('globalcity_operation_executed', {
        detail: {
          venue: venueName,
          side,
          symbol: currentPair,
          price: currentPrice,
          amountUsdt: numericAmount
        }
      }));
    } catch {}

    setExecutionMessage(`✓ Orden ${side} de $${numericAmount} en ${currentPair} ejecutada en ${venueName}`);
    setTimeout(() => setExecutionMessage(null), 4000);
  };

  return (
    <div className={`rounded-2xl border border-white/15 bg-[#08090E]/95 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
      isFullscreen 
        ? 'fixed inset-3 z-50 flex flex-col' 
        : 'mt-3 mb-2 flex flex-col'
    }`}>
      {/* Top Bar: Venue Info + Dashboard-styled Symbol Selector + Controls */}
      <div className="p-3 sm:px-4 bg-[#0D0F17] border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-30">
        
        {/* Left: Venue Emblem & Dashboard-Styled Symbol Dropdown Selector */}
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 border shadow-md"
            style={{ 
              backgroundColor: venueColor + '25', 
              borderColor: venueColor + '50', 
              color: venueColor 
            }}
          >
            {venueName.substring(0, 2).toUpperCase()}
          </div>

          {/* DASHBOARD-STYLE SYMBOL SELECTOR TRIGGER */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
              className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FBBF24] via-[#F472B6] to-[#60A5FA] flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                  {currentPair.substring(0, 3)}
                </div>
                <div className="text-left font-mono">
                  <div className="text-xs font-bold text-white group-hover:text-[#38BDF8] transition-colors flex items-center gap-1.5">
                    <span>{currentPair}</span>
                    <span className="text-[9px] font-sans px-1 py-0.2 rounded bg-white/10 text-slate-400 uppercase">
                      {activeTick.category || 'Crypto'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                    {activeTick.name || currentPair}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono pl-2 border-l border-white/10">
                <div className="text-xs font-bold text-white">
                  ${currentPrice >= 10 
                    ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                    : currentPrice.toFixed(5)
                  }
                </div>
                <div className={`text-[10px] font-bold ${
                  priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {priceChange >= 0 ? `+${priceChange}%` : `${priceChange}%`}
                </div>
              </div>

              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isPairDropdownOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* DASHBOARD-STYLE FLOATING PAIR SELECTOR DROPDOWN */}
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
                    const isSelected = currentPair === tick.symbol;
                    const itemPrice = Number(tick.price || 0);
                    const itemChange = Number(tick.change24h || 0);

                    return (
                      <button
                        key={tick.symbol}
                        type="button"
                        onClick={() => handlePairSelect(tick)}
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
                              {tick.name || tick.symbol}
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-mono text-xs">
                          <div className="font-bold text-white">
                            ${itemPrice >= 10 ? itemPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : itemPrice.toFixed(5)}
                          </div>
                          <div className={`text-[10px] ${
                            itemChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {itemChange >= 0 ? `+${itemChange}%` : `${itemChange}%`}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right: Proprietary Trading Tools Toggle + Timeframes + Window Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
          
          {/* Custom Proprietary Tools Bar */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/60 border border-white/10 text-[10px] font-medium">
            <button
              type="button"
              onClick={() => setActiveTool(activeTool === 'arbitrage' ? 'none' : 'arbitrage')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeTool === 'arbitrage' 
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Radar de Arbitraje vs otros exchanges"
            >
              <Activity className="w-3 h-3 text-amber-400" />
              <span>Arbitraje</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool(activeTool === 'orderblocks' ? 'none' : 'orderblocks')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeTool === 'orderblocks' 
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Bloques de Liquidez Institucional (Order Blocks)"
            >
              <Layers className="w-3 h-3 text-purple-400" />
              <span>Liquidez</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool(activeTool === 'sltp' ? 'none' : 'sltp')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeTool === 'sltp' 
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Líneas automáticas de Stop Loss y Take Profit"
            >
              <Target className="w-3 h-3 text-emerald-400" />
              <span>SL/TP</span>
            </button>
          </div>

          {/* Timeframes */}
          <div className="flex items-center bg-black/50 border border-white/10 rounded-lg p-0.5 text-[10px] font-mono">
            {['1', '5', '15', '60', '240', 'D'].map(tf => (
              <button
                key={tf}
                type="button"
                onClick={() => setInterval(tf)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  interval === tf ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf === '60' ? '1h' : tf === '240' ? '4h' : tf === 'D' ? '1D' : `${tf}m`}
              </button>
            ))}
          </div>

          {/* Fullscreen & Close */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 cursor-pointer"
              title={isFullscreen ? "Minimizar" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 cursor-pointer transition-colors"
              title="Cerrar gráfico"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK 1-CLICK TRADING BAR DIRECTLY OVER THE CHART */}
      {isTradingBarOpen && (
        <div className="px-4 py-2 bg-[#090B12] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Left: Quick Execution Buttons (Buy Ask / Sell Bid) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickChartTrade('BUY')}
              className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-black font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-black stroke-[3]" />
              <span>COMPRAR (ASK: ${currentPrice.toFixed(2)})</span>
            </button>

            {/* Amount input */}
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
              onClick={() => handleQuickChartTrade('SELL')}
              className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white font-bold shadow-md shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-white stroke-[3]" />
              <span>VENDER (BID: ${(currentPrice * 0.9998).toFixed(2)})</span>
            </button>
          </div>

          {/* Quick margin chips */}
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
            <span>Margen:</span>
            {[25, 50, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => {
                  const m = connectedAccount?.freeMarginUsd || 1000;
                  setOrderAmountUsdt(Math.floor((m * pct) / 100).toString());
                }}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 cursor-pointer"
              >
                {pct}%
              </button>
            ))}
            <span className="text-emerald-400 font-bold ml-2">
              Disp: ${(connectedAccount?.freeMarginUsd || 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Execution Alert Banner */}
      {executionMessage && (
        <div className="px-4 py-2 bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <span>{executionMessage}</span>
          <button onClick={() => setExecutionMessage(null)} className="text-emerald-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* PROPRIETARY TOOLS OVERLAY PANEL (When an interactive tool is active) */}
      {activeTool !== 'none' && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-[#10131E] via-[#0E101A] to-[#0A0C14] border-b border-white/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          {activeTool === 'arbitrage' && (
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Activity className="w-3.5 h-3.5" />
                <span>Spread en Tiempo Real:</span>
              </div>
              <span className="text-white">{venueName}: <strong>${currentPrice.toFixed(2)}</strong></span>
              <span className="text-slate-500">vs</span>
              <span className="text-slate-300">Binance DMA: <strong>${(currentPrice * 0.9997).toFixed(2)}</strong></span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                Delta: +$14.20 (+0.03%) ⚡ Arbitrable
              </span>
            </div>
          )}

          {activeTool === 'orderblocks' && (
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1 text-purple-400 font-bold">
                <Layers className="w-3.5 h-3.5" />
                <span>Zonas de Liquidez Detectadas:</span>
              </div>
              <span className="text-emerald-400">Demand Block (OB): ${(currentPrice * 0.985).toFixed(2)} - ${(currentPrice * 0.989).toFixed(2)}</span>
              <span>·</span>
              <span className="text-rose-400">Supply Block (FVG): ${(currentPrice * 1.012).toFixed(2)} - ${(currentPrice * 1.018).toFixed(2)}</span>
            </div>
          )}

          {activeTool === 'sltp' && (
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <Target className="w-3.5 h-3.5" />
                <span>Protección Inteligente (1:2.5 Risk/Reward):</span>
              </div>
              <span className="text-rose-400">Stop Loss: ${(currentPrice * 0.992).toFixed(2)} (-0.8%)</span>
              <span>·</span>
              <span className="text-emerald-400">Take Profit: ${(currentPrice * 1.02).toFixed(2)} (+2.0%)</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setActiveTool('none')}
            className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5 border border-white/10 cursor-pointer self-end sm:self-auto"
          >
            Ocultar Herramienta
          </button>
        </div>
      )}

      {/* Embedded Chart Canvas */}
      <div className={`w-full bg-[#08090E] relative ${isFullscreen ? 'flex-1 min-h-[500px]' : 'h-[460px]'}`}>
        <iframe
          key={`${tvSymbol}_${interval}`}
          src={tvWidgetUrl}
          className="w-full h-full border-0"
          title={`${venueName} ${currentPair} Real-Time Chart`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
};
