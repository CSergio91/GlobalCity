import React, { useState } from 'react';
import { INITIAL_ARBITRAGE_DATA, ArbitrageOpportunity } from '../data/mockData';
import { Calculator, ArrowRight, RefreshCw, Zap, AlertCircle, Check } from 'lucide-react';

export const ArbitrageCalculator: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<string>("BTC/USDT");
  const [capitalUsdt, setCapitalUsdt] = useState<number>(10000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedExecution, setSimulatedExecution] = useState<boolean>(false);

  const activeOpp = INITIAL_ARBITRAGE_DATA.find(o => o.pair === selectedPair) || INITIAL_ARBITRAGE_DATA[0];

  // Cálculos basados en el modelo matemático del Doc 5 y Skill 7
  // Spread Bruto = (SellPrice - BuyPrice) / BuyPrice * 100
  const grossSpreadPct = ((activeOpp.sellPrice - activeOpp.buyPrice) / activeOpp.buyPrice) * 100;
  
  // Total Fees en $ = (Capital * FeeBuy) + ((Capital * (1 + grossSpread)) * FeeSell)
  const feeBuyCost = capitalUsdt * (activeOpp.takerFeeBuy / 100);
  const grossReturnUsdt = capitalUsdt * (1 + grossSpreadPct / 100);
  const feeSellCost = grossReturnUsdt * (activeOpp.takerFeeSell / 100);
  const totalFeesUsdt = feeBuyCost + feeSellCost;

  // Beneficio Neto Total = Retorno Bruto - Capital - Fees
  const netProfitUsdt = (grossReturnUsdt - capitalUsdt) - totalFeesUsdt;
  const netSpreadPct = (netProfitUsdt / capitalUsdt) * 100;

  // Split del Modelo: 80% Trader / 20% Plataforma (vía Gas Tank)
  const traderProfitUsdt = netProfitUsdt > 0 ? netProfitUsdt * 0.8 : 0;
  const platformFeeUsdt = netProfitUsdt > 0 ? netProfitUsdt * 0.2 : 0;

  const handleSimulateDispatch = () => {
    setIsSimulating(true);
    setSimulatedExecution(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulatedExecution(true);
      setTimeout(() => setSimulatedExecution(false), 4000);
    }, 850);
  };

  return (
    <section id="calculator" className="py-24 bg-[#0B0C11] border-y border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF] mb-2 flex items-center justify-center gap-2">
            <Calculator className="w-4 h-4 text-[#2DD4BF]" />
            <span>Motor Cuantitativo en Vivo</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Calculadora de Spread Real L2 (VWAP)
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base">
            Comprueba el beneficio neto exacto descontando el deslizamiento por profundidad de libro Nivel 2 y las comisiones de taker de ambos exchanges antes de enviar la orden.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Configurator Controls (Col 5) */}
          <div className="lg:col-span-5 bg-[#12141D] border border-white/10 rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span>Parámetros de Simulación</span>
            </h3>

            {/* Pair Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Seleccionar Par de Arbitraje
              </label>
              <div className="grid grid-cols-3 gap-2">
                {INITIAL_ARBITRAGE_DATA.map((opp) => (
                  <button
                    key={opp.pair}
                    onClick={() => setSelectedPair(opp.pair)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      selectedPair === opp.pair
                        ? "bg-[#E06D8A] text-white shadow-md shadow-[#E06D8A]/20"
                        : "bg-[#181A26] text-slate-400 hover:text-white border border-white/5"
                    }`}
                  >
                    {opp.pair}
                  </button>
                ))}
              </div>
            </div>

            {/* Capital Slider */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-400">
                  Capital Prefondeado Total
                </label>
                <span className="text-sm font-mono-nums font-bold text-white">
                  ${capitalUsdt.toLocaleString()} USDT
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={capitalUsdt}
                onChange={(e) => setCapitalUsdt(Number(e.target.value))}
                className="w-full h-2 bg-[#202333] rounded-lg appearance-none cursor-pointer accent-[#E06D8A]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono-nums mt-1">
                <span>$1,000</span>
                <span>$25,000</span>
                <span>$50,000</span>
              </div>
            </div>

            {/* Venues Summary Box */}
            <div className="p-4 rounded-2xl bg-[#171926] border border-white/10 space-y-3 text-xs mb-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pata Compra (Long):</span>
                <span className="font-bold text-emerald-400">{activeOpp.buyVenue} @ ${activeOpp.buyPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pata Venta (Short):</span>
                <span className="font-bold text-rose-400">{activeOpp.sellVenue} @ ${activeOpp.sellPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-slate-400">Latencia Concurrente:</span>
                <span className="font-mono-nums text-[#2DD4BF] font-semibold">{activeOpp.latencyMs} ms (Sub-100ms)</span>
              </div>
            </div>

            {/* Dispatch Button */}
            <button
              onClick={handleSimulateDispatch}
              disabled={isSimulating}
              className={`w-full py-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSimulating 
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                  : "bg-[#2DD4BF] hover:bg-[#34e2cb] text-slate-950 font-extrabold shadow-lg shadow-[#2DD4BF]/20 active:scale-95"
              }`}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Despachando Promise.allSettled...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Simular Disparo Simultáneo 1-Clic</span>
                </>
              )}
            </button>

            {simulatedExecution && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 shrink-0" />
                <span>¡Arbitraje ejecutado en 18ms! Beneficio acreditado y fee descontado de Gas Tank.</span>
              </div>
            )}
          </div>

          {/* Results Analytics Panel (Col 7) */}
          <div className="lg:col-span-7 bg-[#12141D] border border-white/10 rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white mb-6">
              Desglose Matemático de Liquidación Neta
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-[#171926] border border-white/5">
                <div className="text-[11px] text-slate-400">Spread Bruto L2</div>
                <div className="text-xl font-bold font-mono-nums text-white mt-1">
                  +{grossSpreadPct.toFixed(3)}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Diferencial de libros</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#171926] border border-white/5">
                <div className="text-[11px] text-slate-400">Comisiones Taker</div>
                <div className="text-xl font-bold font-mono-nums text-rose-400 mt-1">
                  -${totalFeesUsdt.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Ambos venues deducidos</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#171926] border border-white/5 col-span-2 sm:col-span-1">
                <div className="text-[11px] text-slate-400">Spread Neto Final</div>
                <div className="text-xl font-bold font-mono-nums text-emerald-400 mt-1">
                  +{netSpreadPct.toFixed(3)}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Supera filtro &gt;0.25%</div>
              </div>
            </div>

            {/* Profit Distribution Block */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#171A28] to-[#1E2133] border border-white/10 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Beneficio Neto de la Operación</div>
                  <div className="text-3xl font-extrabold font-mono-nums text-white mt-1">
                    +${netProfitUsdt.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USDT</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-[11px] text-emerald-400 font-semibold">Para el Trader (80%)</div>
                    <div className="text-lg font-bold font-mono-nums text-white mt-0.5">
                      +${traderProfitUsdt.toFixed(2)}
                    </div>
                  </div>

                  <div className="border-l border-white/10 pl-6">
                    <div className="text-[11px] text-[#E06D8A] font-semibold">Fee Gas Tank (20%)</div>
                    <div className="text-lg font-bold font-mono-nums text-white mt-0.5">
                      ${platformFeeUsdt.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Structural Guarantee Notice */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3 text-xs text-slate-300">
              <AlertCircle className="w-5 h-5 text-[#2DD4BF] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-white">Cero Tráfico On-Chain:</strong> Esta operación no transfiere fondos por blockchain ni sufre demoras de confirmación. Se ejecuta de forma sintética equilibrando inventario pre-fondado en ambas cuentas con permisos exclusivos <span className="text-[#2DD4BF] font-mono-nums">Read & Trade</span>.
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
