import React, { useState } from 'react';
import { Zap, CheckCircle2, Sliders, ArrowRight, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';
import { useLiveMarketTicks } from '../services/liveMarketFeed';
import { PlatformLogo } from './MarketIcons';
import { ParallaxBackground } from './ParallaxBackground';
import arbitrageRadarVisual from '../assets/images/arbitrage_radar_mesh_1790346379182.jpg';

interface ArbitragePairConfig {
  pair: string;
  name: string;
  buyVenue: string;
  buyVenueKey: string;
  buyFee: number;
  buyOffset: number;
  sellVenue: string;
  sellVenueKey: string;
  sellFee: number;
  sellOffset: number;
  exchangeQuotes: {
    venue: string;
    venueKey: string;
    bidOffset: number;
    askOffset: number;
    latencyMs: number;
    fee: string;
  }[];
}

const ARBITRAGE_CONFIGS: Record<string, ArbitragePairConfig> = {
  "BTC/USDT": {
    pair: "BTC/USDT",
    name: "Bitcoin Perpetual L2",
    buyVenue: "Binance DMA",
    buyVenueKey: "binance",
    buyFee: 0.040,
    buyOffset: -0.0006,
    sellVenue: "Bybit v5",
    sellVenueKey: "bybit",
    sellFee: 0.050,
    sellOffset: +0.0009,
    exchangeQuotes: [
      { venue: "Binance DMA", venueKey: "binance", bidOffset: -0.0006, askOffset: -0.0004, latencyMs: 8, fee: "0.04%" },
      { venue: "Bybit v5", venueKey: "bybit", bidOffset: +0.0007, askOffset: +0.0009, latencyMs: 14, fee: "0.05%" },
      { venue: "OKX DMA", venueKey: "okx", bidOffset: +0.0002, askOffset: +0.0004, latencyMs: 12, fee: "0.05%" },
      { venue: "Hyperliquid", venueKey: "hyperliquid", bidOffset: +0.0005, askOffset: +0.0008, latencyMs: 16, fee: "0.045%" }
    ]
  },
  "ETH/USDT": {
    pair: "ETH/USDT",
    name: "Ethereum Perpetual L2",
    buyVenue: "OKX DMA",
    buyVenueKey: "okx",
    buyFee: 0.045,
    buyOffset: -0.0008,
    sellVenue: "Binance Futures",
    sellVenueKey: "binance",
    sellFee: 0.040,
    sellOffset: +0.0011,
    exchangeQuotes: [
      { venue: "OKX DMA", venueKey: "okx", bidOffset: -0.0008, askOffset: -0.0005, latencyMs: 11, fee: "0.045%" },
      { venue: "Binance Futures", venueKey: "binance", bidOffset: +0.0009, askOffset: +0.0011, latencyMs: 9, fee: "0.040%" },
      { venue: "Bybit v5", venueKey: "bybit", bidOffset: +0.0003, askOffset: +0.0006, latencyMs: 15, fee: "0.050%" },
      { venue: "Coinbase Prime", venueKey: "coinbase", bidOffset: +0.0007, askOffset: +0.0010, latencyMs: 22, fee: "0.060%" }
    ]
  },
  "SOL/USDT": {
    pair: "SOL/USDT",
    name: "Solana Perpetual L2",
    buyVenue: "Bybit v5",
    buyVenueKey: "bybit",
    buyFee: 0.050,
    buyOffset: -0.0012,
    sellVenue: "Hyperliquid L1",
    sellVenueKey: "hyperliquid",
    sellFee: 0.045,
    sellOffset: +0.0016,
    exchangeQuotes: [
      { venue: "Bybit v5", venueKey: "bybit", bidOffset: -0.0012, askOffset: -0.0008, latencyMs: 14, fee: "0.050%" },
      { venue: "Hyperliquid L1", venueKey: "hyperliquid", bidOffset: +0.0013, askOffset: +0.0016, latencyMs: 18, fee: "0.045%" },
      { venue: "Binance DMA", venueKey: "binance", bidOffset: +0.0001, askOffset: +0.0004, latencyMs: 10, fee: "0.040%" },
      { venue: "OKX DMA", venueKey: "okx", bidOffset: +0.0005, askOffset: +0.0009, latencyMs: 13, fee: "0.050%" }
    ]
  },
  "BNB/USDT": {
    pair: "BNB/USDT",
    name: "BNB Chain L2",
    buyVenue: "Binance Spot",
    buyVenueKey: "binance",
    buyFee: 0.040,
    buyOffset: -0.0007,
    sellVenue: "OKX DMA",
    sellVenueKey: "okx",
    sellFee: 0.050,
    sellOffset: +0.0010,
    exchangeQuotes: [
      { venue: "Binance Spot", venueKey: "binance", bidOffset: -0.0007, askOffset: -0.0004, latencyMs: 8, fee: "0.040%" },
      { venue: "OKX DMA", venueKey: "okx", bidOffset: +0.0007, askOffset: +0.0010, latencyMs: 13, fee: "0.050%" },
      { venue: "Bybit v5", venueKey: "bybit", bidOffset: +0.0002, askOffset: +0.0005, latencyMs: 16, fee: "0.050%" }
    ]
  },
  "XAU/USD": {
    pair: "XAU/USD",
    name: "Gold Spot vs Dollar",
    buyVenue: "MetaTrader 5 LP",
    buyVenueKey: "mt5",
    buyFee: 0.015,
    buyOffset: -0.0004,
    sellVenue: "cTrader Fix DMA",
    sellVenueKey: "ctrader",
    sellFee: 0.020,
    sellOffset: +0.0005,
    exchangeQuotes: [
      { venue: "MetaTrader 5 LP", venueKey: "mt5", bidOffset: -0.0004, askOffset: -0.0002, latencyMs: 12, fee: "0.015%" },
      { venue: "cTrader Fix DMA", venueKey: "ctrader", bidOffset: +0.0003, askOffset: +0.0005, latencyMs: 14, fee: "0.020%" }
    ]
  }
};

export const ArbitrageCalculator: React.FC = () => {
  const { t } = useLanguage();
  const { navigate } = useAppRouter();
  const { ticks, isConnected } = useLiveMarketTicks();
  const [selectedPair, setSelectedPair] = useState<string>("BTC/USDT");
  const [capitalUsdt, setCapitalUsdt] = useState<number>(15000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedExecution, setSimulatedExecution] = useState<boolean>(false);

  const config = ARBITRAGE_CONFIGS[selectedPair] || ARBITRAGE_CONFIGS["BTC/USDT"];
  const currentTick = ticks.find(t => t.symbol === selectedPair) || {
    price: selectedPair === "BTC/USDT" ? 84310.20 : selectedPair === "ETH/USDT" ? 2728.50 : 186.40,
    change24h: 3.5,
    direction: "same" as const
  };

  const refPrice = currentTick.price;
  const buyPrice = Number((refPrice * (1 + config.buyOffset)).toFixed(selectedPair.includes("EUR") ? 5 : 2));
  const sellPrice = Number((refPrice * (1 + config.sellOffset)).toFixed(selectedPair.includes("EUR") ? 5 : 2));
  const spreadGapUsdt = Math.max(0, sellPrice - buyPrice);
  const grossSpreadPct = ((sellPrice - buyPrice) / buyPrice) * 100;

  const feeBuyCost = capitalUsdt * (config.buyFee / 100);
  const grossReturnUsdt = capitalUsdt * (1 + grossSpreadPct / 100);
  const feeSellCost = grossReturnUsdt * (config.sellFee / 100);
  const totalFeesUsdt = feeBuyCost + feeSellCost;

  const netProfitUsdt = Math.max(0, (grossReturnUsdt - capitalUsdt) - totalFeesUsdt);
  const netSpreadPct = (netProfitUsdt / capitalUsdt) * 100;
  const traderProfitUsdt = netProfitUsdt * 0.80;
  const platformFeeUsdt = netProfitUsdt * 0.20;

  const handleSimulateDispatch = () => {
    setIsSimulating(true);
    setSimulatedExecution(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulatedExecution(true);
      setTimeout(() => setSimulatedExecution(false), 5000);
    }, 600);
  };

  return (
    <section id="arbitrage" className="w-full py-20 sm:py-28 bg-[#05060A] relative select-none overflow-hidden">
      {/* Cinematic Parallax Radar Mesh Backdrop */}
      <ParallaxBackground 
        imageSrc={arbitrageRadarVisual} 
        alt="Arbitrage L2 Radar Mesh Backdrop" 
        opacity={0.34}
        speed={0.16}
      />

      {/* Subtle Atmospheric Glow */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[300px] bg-gradient-to-b from-[#F472B6]/10 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 max-w-[1360px] mx-auto relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 sm:mb-14"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {t.calculator.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA]">
                  {t.calculator.titleEnd}
                </span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm lg:text-base text-slate-300 font-light leading-relaxed">
                {t.calculator.subtitle}
              </p>
            </div>

            {/* Quick Pair Selector */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {Object.keys(ARBITRAGE_CONFIGS).map((pairKey) => (
                <button
                  key={pairKey}
                  onClick={() => setSelectedPair(pairKey)}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-bold text-xs ${
                    selectedPair === pairKey 
                      ? 'bg-gradient-to-r from-[#F472B6] to-[#60A5FA] text-white shadow-lg shadow-pink-500/20' 
                      : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {pairKey}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Master Console Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Left: Real-time Venue Price Gap Matrix & Capital Config */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 rounded-3xl p-5 sm:p-8 bg-white/[0.02] border-t border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{t.calculator.capitalParamsTitle}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.calculator.capitalParamsSubtitle}</p>
                </div>
                <Sliders className="w-5 h-5 text-[#F472B6]" />
              </div>

              {/* Capital Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">{t.calculator.assignedCapital}</span>
                  <span className="text-xl sm:text-2xl font-black font-mono-nums text-white">
                    ${capitalUsdt.toLocaleString()} <span className="text-xs font-normal text-slate-400">USDT</span>
                  </span>
                </div>
                <input 
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={capitalUsdt}
                  onChange={(e) => setCapitalUsdt(Number(e.target.value))}
                  className="w-full accent-[#F472B6] cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                  <span>$1,000</span>
                  <span>$50,000</span>
                  <span>$100,000</span>
                </div>
              </div>

              {/* Venue Real-time Price Matrix with Live Brecha */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-5">
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="text-slate-400 uppercase tracking-wider">Brecha Cross-Exchange Detectada</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+${spreadGapUsdt.toFixed(2)} USDT ({grossSpreadPct > 0 ? `+${grossSpreadPct.toFixed(3)}%` : '0%'})</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Buy Venue */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <PlatformLogo name={config.buyVenueKey} size={18} />
                        <span className="text-xs font-bold text-white">{config.buyVenue}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        COMPRA
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-black font-mono-nums text-emerald-400 mt-1">
                      ${buyPrice.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Taker fee: {config.buyFee}%</div>
                  </div>

                  {/* Sell Venue */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-pink-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <PlatformLogo name={config.sellVenueKey} size={18} />
                        <span className="text-xs font-bold text-white">{config.sellVenue}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400">
                        VENTA
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-black font-mono-nums text-pink-400 mt-1">
                      ${sellPrice.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Taker fee: {config.sellFee}%</div>
                  </div>
                </div>
              </div>

              {/* Comparative Multi-Exchange Book Table */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2.5 flex items-center justify-between">
                  <span>Libros L2 en Tiempo Real</span>
                  <span className="text-[10px] text-slate-500">Live Tick Stream</span>
                </div>
                
                <div className="space-y-1.5 font-mono text-xs">
                  {config.exchangeQuotes.map((ex) => {
                    const exBid = (refPrice * (1 + ex.bidOffset)).toFixed(selectedPair.includes("EUR") ? 5 : 2);
                    const exAsk = (refPrice * (1 + ex.askOffset)).toFixed(selectedPair.includes("EUR") ? 5 : 2);
                    const isBestBuy = ex.venue === config.buyVenue;
                    const isBestSell = ex.venue === config.sellVenue;

                    return (
                      <div 
                        key={ex.venue} 
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                          isBestBuy 
                            ? 'bg-emerald-500/10 border border-emerald-500/25' 
                            : isBestSell 
                            ? 'bg-pink-500/10 border border-pink-500/25' 
                            : 'bg-white/[0.02] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <PlatformLogo name={ex.venueKey} size={16} />
                          <span className="font-semibold text-white text-xs">{ex.venue}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block leading-tight">Bid: ${Number(exBid).toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 block leading-tight">Ask: ${Number(exAsk).toLocaleString()}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{ex.latencyMs}ms</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Simulated Action */}
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <button
                onClick={handleSimulateDispatch}
                disabled={isSimulating}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#F472B6] to-[#60A5FA] text-white text-xs font-black font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-lg cursor-pointer transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>{isSimulating ? t.calculator.simulatingBtn : t.calculator.simulateBtn}</span>
              </button>
            </div>
          </motion.div>

          {/* Right: Net Calculation Telemetry HUD */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 rounded-3xl p-5 sm:p-8 bg-white/[0.02] border-t border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{t.calculator.breakdownTitle}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.calculator.breakdownSubtitle}</p>
                </div>
                <div className="text-xs font-mono font-bold text-[#10B981] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>{t.calculator.positiveSpread}</span>
                </div>
              </div>

              {/* Return Metric */}
              <div className="mb-6">
                <div className="text-[11px] uppercase font-mono tracking-wider text-slate-400 font-bold">{t.calculator.netProfitLabel}</div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono-nums text-[#10B981] mt-1.5 drop-shadow-[0_0_25px_rgba(16,185,129,0.3)] truncate">
                  +${traderProfitUsdt.toFixed(2)}{' '}
                  <span className="text-xs sm:text-sm font-normal text-slate-400 font-sans">USDT</span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1 font-medium">
                  {t.calculator.netSpreadEffective}: <strong className="text-white">+{netSpreadPct.toFixed(3)}%</strong> {t.calculator.afterFees}
                </div>
              </div>

              {/* Telemetry Breakdown Lines */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-slate-400">{t.calculator.grossSpread}</span>
                  <span className="text-white font-bold">+{grossSpreadPct.toFixed(3)}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-slate-400">{t.calculator.takerFees}</span>
                  <span className="text-rose-400 font-bold">-${totalFeesUsdt.toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-slate-400">{t.calculator.traderShare}</span>
                  <span className="text-[#FBBF24] font-bold">${traderProfitUsdt.toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">{t.calculator.infraFee}</span>
                  <span className="text-slate-300 font-bold">${platformFeeUsdt.toFixed(2)} USDT</span>
                </div>
              </div>
            </div>

            {/* Execution Confirmation Toast */}
            {simulatedExecution ? (
              <div className="mt-5 p-3.5 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center gap-2.5 text-xs text-[#10B981] font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.calculator.successToast(config.buyVenue, config.sellVenue)}</span>
              </div>
            ) : (
              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10 active:scale-95"
                >
                  <span>Ejecutar en Cuenta Real</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                </button>
              </div>
            )}
          </motion.div>

        </div>

      </div>
    </section>
  );
};
