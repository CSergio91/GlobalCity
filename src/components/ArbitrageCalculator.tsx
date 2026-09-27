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
    <section id="arbitrage" className="w-full py-20 sm:py-28 bg-[#090A12] border-t border-white/10 relative select-none overflow-hidden">
      {/* Cinematic Parallax Radar Mesh Backdrop (Vivid & Clear) */}
      <ParallaxBackground 
        imageSrc={arbitrageRadarVisual} 
        alt="Arbitrage L2 Radar Mesh Backdrop" 
        opacity={0.35}
        speed={0.16}
      />

      {/* Atmospheric Glow */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[350px] bg-gradient-to-b from-[#7C3AED]/20 via-transparent to-transparent blur-[140px] pointer-events-none" />

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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-400/40 text-[11px] font-mono font-bold text-purple-300 tracking-wider uppercase mb-3 shadow-[0_0_15px_rgba(124,58,237,0.25)]">
                <span>[ 04 // HERRAMIENTA INTERNA ]</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>ARBITRAJE SINTÉTICO L2</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {t.calculator.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300">
                  {t.calculator.titleEnd}
                </span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm lg:text-base text-slate-300 font-normal leading-relaxed">
                {t.calculator.subtitle}
              </p>
            </div>

            {/* Quick Pair Selector */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {Object.keys(ARBITRAGE_CONFIGS).map((pairKey) => (
                <button
                  key={pairKey}
                  onClick={() => setSelectedPair(pairKey)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer font-mono font-bold text-xs border ${
                    selectedPair === pairKey 
                      ? 'bg-[#7C3AED] text-white border-purple-300/50 shadow-[2px_2px_0px_#090A10]' 
                      : 'bg-slate-900/70 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800'
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
            className="lg:col-span-6 rounded-2xl p-5 sm:p-8 bg-slate-950/70 border-2 border-white/15 backdrop-blur-2xl shadow-[6px_6px_0px_rgba(124,58,237,0.3),0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-xs">[ PARAMS ]</span>
                    <span>{t.calculator.capitalParamsTitle}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{t.calculator.capitalParamsSubtitle}</p>
                </div>
                <Sliders className="w-5 h-5 text-purple-400" />
              </div>

              {/* Capital Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">{t.calculator.assignedCapital}</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-white">
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
                  className="w-full accent-[#7C3AED] cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                  <span>$1,000</span>
                  <span>$50,000</span>
                  <span>$100,000</span>
                </div>
              </div>

              {/* Venue Real-time Price Matrix with Live Brecha */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 mb-5">
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="text-slate-300 uppercase tracking-wider font-semibold">Brecha Cross-Exchange Detectada</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+${spreadGapUsdt.toFixed(2)} USDT ({grossSpreadPct > 0 ? `+${grossSpreadPct.toFixed(3)}%` : '0%'})</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Buy Venue */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <PlatformLogo name={config.buyVenueKey} size={18} />
                        <span className="text-xs font-bold text-white">{config.buyVenue}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                        COMPRA
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-black font-mono text-emerald-400 mt-1">
                      ${buyPrice.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Taker fee: {config.buyFee}%</div>
                  </div>

                  {/* Sell Venue */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/40 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <PlatformLogo name={config.sellVenueKey} size={18} />
                        <span className="text-xs font-bold text-white">{config.sellVenue}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                        VENTA
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-black font-mono text-purple-300 mt-1">
                      ${sellPrice.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Taker fee: {config.sellFee}%</div>
                  </div>
                </div>
              </div>

              {/* Comparative Multi-Exchange Book Table */}
              <div className="border-t border-white/10 pt-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2.5 flex items-center justify-between">
                  <span>Libros L2 en Tiempo Real</span>
                  <span className="text-[10px] text-purple-400">Live Tick Stream</span>
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
                            ? 'bg-emerald-950/40 border border-emerald-500/40' 
                            : isBestSell 
                            ? 'bg-purple-950/40 border border-purple-500/40' 
                            : 'bg-slate-900/60 hover:bg-slate-900/90 border border-white/10'
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
                          <span className="text-[10px] text-slate-400 font-mono">{ex.latencyMs}ms</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Simulated Action */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <button
                onClick={handleSimulateDispatch}
                disabled={isSimulating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] text-white text-xs font-black font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-[4px_4px_0px_#090A10,0_0_20px_rgba(124,58,237,0.35)] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
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
            className="lg:col-span-6 rounded-2xl p-5 sm:p-8 bg-slate-950/70 border-2 border-white/15 backdrop-blur-2xl shadow-[6px_6px_0px_rgba(124,58,237,0.3),0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-xs">[ TELEMETRY ]</span>
                    <span>{t.calculator.breakdownTitle}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{t.calculator.breakdownSubtitle}</p>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t.calculator.positiveSpread}</span>
                </div>
              </div>

              {/* Return Metric */}
              <div className="mb-6">
                <div className="text-[11px] uppercase font-mono tracking-wider text-slate-400 font-bold">{t.calculator.netProfitLabel}</div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-emerald-400 mt-1.5 truncate">
                  +${traderProfitUsdt.toFixed(2)}{' '}
                  <span className="text-xs sm:text-sm font-normal text-slate-400 font-sans">USDT</span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1 font-normal">
                  {t.calculator.netSpreadEffective}: <strong className="text-white">+{netSpreadPct.toFixed(3)}%</strong> {t.calculator.afterFees}
                </div>
              </div>

              {/* Telemetry Breakdown Lines */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-400">{t.calculator.grossSpread}</span>
                  <span className="text-white font-bold">+{grossSpreadPct.toFixed(3)}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-400">{t.calculator.takerFees}</span>
                  <span className="text-rose-400 font-bold">-${totalFeesUsdt.toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-400">{t.calculator.traderShare}</span>
                  <span className="text-purple-300 font-bold">${traderProfitUsdt.toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">{t.calculator.infraFee}</span>
                  <span className="text-slate-400 font-bold">${platformFeeUsdt.toFixed(2)} USDT</span>
                </div>
              </div>
            </div>

            {/* Execution Confirmation Toast */}
            {simulatedExecution ? (
              <div className="mt-5 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.calculator.successToast(config.buyVenue, config.sellVenue)}</span>
              </div>
            ) : (
              <div className="mt-5 pt-4 border-t border-white/10">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/15 shadow-[3px_3px_0px_#090A10] active:translate-x-0.5 active:translate-y-0.5"
                >
                  <span>Ejecutar en Cuenta Real</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            )}
          </motion.div>

        </div>

      </div>
    </section>
  );
};
