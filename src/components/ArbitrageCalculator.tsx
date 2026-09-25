import React, { useState } from 'react';
import { INITIAL_ARBITRAGE_DATA } from '../data/mockData';
import { Zap, CheckCircle2, Sliders } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useLanguage } from '../context/LanguageContext';

export const ArbitrageCalculator: React.FC = () => {
  const { t } = useLanguage();
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
    }, 700);
  };

  return (
    <section id="calculator" className="min-h-screen w-full flex flex-col justify-center py-24 bg-[#05060A] relative select-none">
      {/* Background Subtle Gradient Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(244,114,182,0.1),rgba(255,255,255,0))] pointer-events-none" />

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 max-w-[1440px] mx-auto relative z-10">
        
        {/* Section Header: Clean, No Noise */}
        <ScrollReveal direction="up" delay={50}>
          <div className="mb-10 sm:mb-16">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
              <div>
                <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] sm:leading-[1.05] text-balance text-shadow-hero">
                  {t.calculator.titleStart}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA]">
                    {t.calculator.titleEnd}
                  </span>
                </h2>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-xl text-slate-200 max-w-3xl font-light leading-relaxed text-shadow-subtle text-illuminate">
                  {t.calculator.subtitle}
                </p>
              </div>

              {/* Quick Pair Selector */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs">
                {INITIAL_ARBITRAGE_DATA.map((opp) => (
                  <button
                    key={opp.pair}
                    onClick={() => setSelectedPair(opp.pair)}
                    className={`btn-liquid px-5 py-3 rounded-xl border transition-all cursor-pointer font-bold ${
                      selectedPair === opp.pair 
                        ? 'bg-[#F472B6]/20 border-[#F472B6] text-white shadow-[0_0_20px_rgba(244,114,182,0.3)]' 
                        : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {opp.pair}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Master Mathematical Console */}
        <ScrollReveal direction="up" delay={150}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left: Input Configuration & L2 Depth Matrix */}
            <div className="lg:col-span-6 bg-[#090B12]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{t.calculator.capitalParamsTitle}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">{t.calculator.capitalParamsSubtitle}</p>
                  </div>
                  <Sliders className="w-5 h-5 text-[#F472B6]" />
                </div>

                {/* Capital Slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs uppercase font-mono tracking-wider text-slate-300 font-semibold">{t.calculator.assignedCapital}</span>
                    <span className="text-2xl font-black font-mono-nums text-white">
                      ${capitalUsdt.toLocaleString()} <span className="text-xs font-normal text-slate-300">USDT</span>
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
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
                    <span>$1,000</span>
                    <span>$50,000</span>
                    <span>$100,000</span>
                  </div>
                </div>

                {/* Venue L2 Price Matrix */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="text-[11px] font-mono uppercase text-[#60A5FA] font-bold">{t.calculator.buyAt} {activeOpp.buyVenue}</div>
                    <div className="text-xl font-black font-mono-nums text-white mt-1">
                      ${activeOpp.buyPrice.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono mt-1">Taker fee: {activeOpp.takerFeeBuy}%</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="text-[11px] font-mono uppercase text-[#F472B6] font-bold">{t.calculator.sellAt} {activeOpp.sellVenue}</div>
                    <div className="text-xl font-black font-mono-nums text-white mt-1">
                      ${activeOpp.sellPrice.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono mt-1">Taker fee: {activeOpp.takerFeeSell}%</div>
                  </div>
                </div>
              </div>

              {/* Simulated Action */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={handleSimulateDispatch}
                  disabled={isSimulating}
                  className="btn-liquid w-full py-4 rounded-2xl bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#818CF8] text-white text-xs font-black font-mono uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_30px_rgba(236,72,153,0.4)] border border-white/20 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-white" />
                  <span>{isSimulating ? t.calculator.simulatingBtn : t.calculator.simulateBtn}</span>
                </button>
              </div>
            </div>

            {/* Right: Net Calculation Telemetry HUD */}
            <div className="lg:col-span-6 bg-[#090B12]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{t.calculator.breakdownTitle}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">{t.calculator.breakdownSubtitle}</p>
                  </div>
                  <div className="text-xs font-mono font-bold text-[#10B981] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span>{t.calculator.positiveSpread}</span>
                  </div>
                </div>

                {/* Return Metric */}
                <div className="mb-8">
                  <div className="text-xs uppercase font-mono tracking-widest text-slate-300 font-bold">{t.calculator.netProfitLabel}</div>
                  <div className="text-5xl sm:text-6xl font-black font-mono-nums text-[#10B981] mt-2 drop-shadow-[0_0_30px_rgba(16,185,129,0.35)]">
                    +${traderProfitUsdt.toFixed(2)}{' '}
                    <span className="text-lg font-normal text-slate-300 font-sans">USDT</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 mt-1 font-medium">
                    {t.calculator.netSpreadEffective}: <strong className="text-white">+{netSpreadPct.toFixed(3)}%</strong> {t.calculator.afterFees}
                  </div>
                </div>

                {/* Telemetry Breakdown Lines */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-slate-300">{t.calculator.grossSpread}</span>
                    <span className="text-white font-bold">+{grossSpreadPct.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-slate-300">{t.calculator.takerFees}</span>
                    <span className="text-rose-400 font-bold">-${totalFeesUsdt.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-slate-300">{t.calculator.traderShare}</span>
                    <span className="text-[#FBBF24] font-bold">${traderProfitUsdt.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-300">{t.calculator.infraFee}</span>
                    <span className="text-slate-200 font-bold">${platformFeeUsdt.toFixed(2)} USDT</span>
                  </div>
                </div>
              </div>

              {/* Execution Confirmation Toast */}
              {simulatedExecution && (
                <div className="mt-6 p-4 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/50 flex items-center gap-3 text-xs text-[#10B981] font-bold shadow-lg">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{t.calculator.successToast(activeOpp.buyVenue, activeOpp.sellVenue)}</span>
                </div>
              )}
            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
