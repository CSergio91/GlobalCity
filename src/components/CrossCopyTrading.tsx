import React from 'react';
import { 
  Copy, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Zap, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const CrossCopyTrading: React.FC = () => {
  return (
    <section id="copy-trading" className="py-24 bg-[#07080C] relative">
      <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E06D8A] mb-2">
            <Copy className="w-4 h-4 text-[#E06D8A]" />
            <span>Replicación Bidireccional Cross-Asset</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Copy Trading Puente: Cripto a CFDs y Futuros
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300">
            Replica señales u operaciones maestras de Bybit o TradingView de forma automática hacia terminales MetaTrader 5, cTrader o cuentas de futuros con normalización matemática de lotaje.
          </p>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Step 1: Master Signal */}
            <div className="bg-[#131520] p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-mono-nums text-[#2DD4BF] font-semibold">01 · ORIGEN MAESTRO</span>
                <h4 className="text-lg font-bold text-white mt-1">Disparo de Orden Master</h4>
                <p className="text-xs text-slate-400 mt-2">
                  Un trade manual, webhook de TradingView o bot cuantitativo abre <strong className="text-white">BUY 5 BTC</strong> en Bybit v5.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-300 font-mono-nums">
                <span>Bybit Perp</span>
                <span className="text-emerald-400 font-bold">+5.00 BTC</span>
              </div>
            </div>

            {/* Step 2: The Core Bridge Engine */}
            <div className="bg-gradient-to-br from-[#1C1F2E] to-[#141624] p-6 rounded-2xl border border-[#E06D8A]/40 flex flex-col justify-between h-full shadow-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#E06D8A] text-slate-950 text-[10px] font-extrabold uppercase">
                Motor de Normalización
              </div>
              <div>
                <span className="text-xs font-mono-nums text-[#E06D8A] font-semibold">02 · PROCESAMIENTO CANÓNICO</span>
                <h4 className="text-lg font-bold text-white mt-1">SymbolMapper & Lot Sizer</h4>
                <p className="text-xs text-slate-300 mt-2">
                  El motor traduce <code className="text-[#2DD4BF]">BTC/USDT</code> al símbolo exacto del broker (<code className="text-[#2DD4BF]">BTCUSD.pro</code>) y calcula el ratio de apalancamiento exacto.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 font-mono-nums">
                <span>Tiempo de Conversión</span>
                <span className="text-[#2DD4BF] font-bold">12 milisegundos</span>
              </div>
            </div>

            {/* Step 3: Destination Replicas */}
            <div className="bg-[#131520] p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-mono-nums text-purple-400 font-semibold">03 · DESTINOS MÚLTIPLES</span>
                <h4 className="text-lg font-bold text-white mt-1">Ejecución en Espejo</h4>
                <p className="text-xs text-slate-400 mt-2">
                  La orden se ejecuta simultáneamente en cTrader, MT5 y tu cuenta de futuros ajustada al saldo respectivo de cada broker.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 space-y-1 text-xs text-slate-300 font-mono-nums">
                <div className="flex justify-between">
                  <span>cTrader Broker:</span>
                  <span className="text-emerald-400 font-bold">BUY 1.25 Lotes</span>
                </div>
                <div className="flex justify-between">
                  <span>MT5 Terminal:</span>
                  <span className="text-emerald-400 font-bold">BUY 0.85 Lotes</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Feature Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h4 className="text-base font-bold text-white mb-2">Protección de Slippage Máximo</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Si el precio en el broker destino ha sufrido un deslizamiento superior al límite configurado (ej. 0.05%), la copia se descarta automáticamente para proteger tu capital.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h4 className="text-base font-bold text-white mb-2">Modo Inverso (Reverse Copy)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configura cuentas en modo contra-tendencia o cobertura automática: cuando tu cuenta master compra, la cuenta secundaria vende para neutralizar exposición delta.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h4 className="text-base font-bold text-white mb-2">Multiplicador Proporcional</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calcula automáticamente el tamaño de posición en función de la equidad disponible de cada cuenta, evitando sobre-apalancamientos en cuentas pequeñas.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
