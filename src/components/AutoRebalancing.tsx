import React from 'react';
import { 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sliders, 
  Zap,
  Lock,
  Layers,
  Fuel
} from 'lucide-react';

export const AutoRebalancing: React.FC = () => {
  return (
    <section id="rebalance" className="py-24 bg-[#090A10] border-t border-white/[0.08] relative">
      <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2DD4BF] mb-2">
            <RefreshCw className="w-4 h-4 text-[#2DD4BF]" />
            <span>Gestión Óptima de Liquidez</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Rebalanceo Inteligente de Fondos entre Exchanges
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300">
            Mantén tus cuentas siempre equilibradas para seguir ejecutando arbitrajes y órdenes continuas sin arriesgar tus fondos con transferencias automáticas sin custodia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Card Left: Rebalancing Engine Logic */}
          <div className="lg:col-span-6 glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              ¿Cómo Funciona el Algoritmo de Umbral?
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              En el arbitraje sintético simultáneo, una cuenta acumula el activo base (ej. BTC) mientras que la otra acumula la moneda cotizada (USDT). El motor de Global City vigila los ratios en todo momento:
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#141624] border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Threshold Alerts (Alertas de Desviación):</span>
                  <span className="text-[#2DD4BF] font-mono-nums font-semibold">Configurado al 70/30</span>
                </div>
                <p className="text-slate-400">
                  Si Bybit acumula el 75% del capital y OKX cae al 25%, el sistema genera una recomendación exacta de transferencia asistida.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#141624] border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Ruta de Coste Mínimo:</span>
                  <span className="text-emerald-400 font-mono-nums font-semibold">Arbitrum / Solana &lt; $0.50</span>
                </div>
                <p className="text-slate-400">
                  Calcula la red blockchain más rápida y económica en ese instante exacto para evitar pagar tarifas excesivas de gas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#141624] border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Cero Permisos de Retiro por API:</span>
                  <span className="text-rose-400 font-bold">SEGURIDAD MÁXIMA</span>
                </div>
                <p className="text-slate-400">
                  Por seguridad, la plataforma nunca exige el endpoint <code className="text-rose-300">exchange.withdraw()</code>. El usuario aprueba el movimiento asistido con su propio 2FA personal.
                </p>
              </div>
            </div>
          </div>

          {/* Card Right: Interactive Balance Simulator */}
          <div className="lg:col-span-6 glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
            <h4 className="text-base font-bold text-white flex items-center justify-between">
              <span>Estado del Inventario de Cuentas</span>
              <span className="text-xs font-mono-nums text-emerald-400 font-semibold">Balance Óptimo</span>
            </h4>

            {/* Visual Balance Bar 1 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Bybit v5 (USDT Liquidity)</span>
                <span className="font-mono-nums text-white font-bold">$26,500 / $50,000 (53%)</span>
              </div>
              <div className="w-full h-3 bg-[#1A1C2B] rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-gradient-to-r from-[#E06D8A] to-[#ED7D9A] rounded-full w-[53%]" />
              </div>
            </div>

            {/* Visual Balance Bar 2 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">OKX DMA (USDT Liquidity)</span>
                <span className="font-mono-nums text-white font-bold">$23,500 / $50,000 (47%)</span>
              </div>
              <div className="w-full h-3 bg-[#1A1C2B] rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-gradient-to-r from-[#2DD4BF] to-[#38BDF8] rounded-full w-[47%]" />
              </div>
            </div>

            {/* Visual Gas Tank Status */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#17192A] to-[#121422] border border-white/10 mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-[#E06D8A]" />
                  <span className="text-sm font-bold text-white">Gas Tank de Créditos Virtuales</span>
                </div>
                <span className="text-xs font-mono-nums font-bold text-emerald-400">142.50 USDT Saldo</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                El Gas Tank es el monedero prepagado donde la plataforma deduce las pequeñas comisiones de servicio de arbitraje sin necesidad de tocar tus balances principales en los exchanges.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
