import React, { useState } from 'react';
import { INITIAL_ARBITRAGE_DATA } from '../data/mockData';
import { Zap, CheckCircle2, Sliders, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';

export const ArbitrageCalculator: React.FC = () => {
  const { t } = useLanguage();
  const { navigate } = useAppRouter();
  const [selectedPair, setSelectedPair] = useState<string>("BTC/USDT");
  const [capitalUsdt, setCapitalUsdt] = useState<number>(15000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedExecution, setSimulatedExecution] = useState<boolean>(false);

  const activeOpp = INITIAL_ARBITRAGE_DATA.find(o => o.pair === selectedPair) || INITIAL_ARBITRAGE_DATA[0];

  const grossSpreadPct = ((activeOpp.sellPrice - activeOpp.buyPrice) / activeOpp.buyPrice) * 100;
  const feeBuyCost = capitalUsdt * (activeOpp.takerFeeBuy / 100);
  const grossReturnUsdt = capitalUsdt * (1 + grossSpreadPct / 100);
  const feeSellCost = grossReturnUsdt * (activeOpp.takerFeeSell / 100);
  const totalFeesUsdt = feeBuyCost + feeSellCost;

  const netProfitUsdt = (grossReturnUsdt - capitalUsdt) - totalFeesUsdt;
  const netSpreadPct = (netProfitUsdt / capitalUsdt) * 100;
  const traderProfitUsdt = netProfitUsdt > 0 ? netProfitUsdt * 0.8 : 0;
  const platformFeeUsdt = netProfitUsdt > 0 ? netProfitUsdt * 0.2 : 0;

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
    <section id="calculator" className="w-full py-20 sm:py-28 bg-[#05060A] relative select-none overflow-hidden">
      {/* Subtle Atmospheric Glow */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[300px] bg-gradient-to-b from-[#F472B6]/10 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 max-w-[1360px] mx-auto relative z-10">
        
        {/* Section Header: Minimalist & Clean */}
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

            {/* Quick Pair Selector: Sleek pills */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {INITIAL_ARBITRAGE_DATA.map((opp) => (
                <button
                  key={opp.pair}
                  onClick={() => setSelectedPair(opp.pair)}
                  className={`px-4 py-2 rounded-full transition-all cursor-pointer font-bold text-xs ${
                    selectedPair === opp.pair 
                      ? 'bg-gradient-to-r from-[#F472B6] to-[#60A5FA] text-white shadow-lg' 
                      : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {opp.pair}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Master Console: Borderless Glass Surfaces */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Left: Input Configuration & L2 Depth Matrix */}
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

              {/* Venue L2 Price Matrix: Responsive stacking on mobile to avoid overflow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/[0.06]">
                <div className="p-3.5 rounded-2xl bg-white/[0.02]">
                  <div className="text-[10px] font-mono uppercase text-[#38BDF8] font-bold">{t.calculator.buyAt} {activeOpp.buyVenue}</div>
                  <div className="text-base sm:text-lg font-black font-mono-nums text-white mt-0.5 truncate">
                    ${activeOpp.buyPrice.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Taker fee: {activeOpp.takerFeeBuy}%</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02]">
                  <div className="text-[10px] font-mono uppercase text-[#F472B6] font-bold">{t.calculator.sellAt} {activeOpp.sellVenue}</div>
                  <div className="text-base sm:text-lg font-black font-mono-nums text-white mt-0.5 truncate">
                    ${activeOpp.sellPrice.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Taker fee: {activeOpp.takerFeeSell}%</div>
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

              {/* Return Metric: Responsive sizes without clipping */}
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
                <span className="truncate">{t.calculator.successToast(activeOpp.buyVenue, activeOpp.sellVenue)}</span>
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
