import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const CrossCopyTrading: React.FC = () => {
  return (
    <section id="copy-trading" className="min-h-screen w-full flex flex-col justify-center py-24 bg-[#05060A] relative select-none">
      {/* Background Subtle Gradient Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(224,109,138,0.06),transparent_60%)] pointer-events-none" />

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 max-w-[1440px] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-mono text-[#E06D8A] mb-3">
            <span className="w-6 h-[1.5px] bg-[#E06D8A]" />
            <span>REPLICACIÓN UNIVERSAL CROSS-ASSET</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] text-balance">
                Copy Trading Puente.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E06D8A] via-[#ED7D9A] to-[#D4AF37]">
                  De Criptoactivos a CFDs y Futuros.
                </span>
              </h2>
              <p className="mt-4 text-base sm:text-xl text-slate-300 max-w-3xl font-light leading-relaxed">
                Replica operaciones maestras disparadas en exchanges de criptomonedas directamente hacia cuentas de cTrader, MetaTrader 5 o futuros regulados, con normalización instantánea de lotaje y apalancamiento.
              </p>
            </div>

            <div className="border-l-2 border-[#E06D8A] pl-6 py-2 shrink-0">
              <div className="text-xs uppercase font-mono tracking-widest text-slate-400">Velocidad de Replicación</div>
              <div className="text-3xl sm:text-5xl font-black font-mono-nums text-white mt-1">
                &lt; 12 <span className="text-sm font-light text-slate-400 font-sans">ms</span>
              </div>
              <div className="text-xs font-mono text-[#E06D8A] mt-1">PROTOCOLO PROTOBUF TLS & FIX</div>
            </div>
          </div>
        </div>

        {/* Master Pipeline Diagram (No generic cards, architectural interconnected flow) */}
        <div className="bg-[#090B12]/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative">
            
            {/* Stage 1: Master Signal Source */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between h-full">
              <div>
                <div className="text-xs font-mono uppercase text-[#2DD4BF] font-bold tracking-wider mb-2">
                  01 // ORIGEN MAESTRO
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight">Disparo de Orden Master</h4>
                <p className="text-xs text-slate-300 mt-2 font-light leading-relaxed">
                  Un trade manual, webhook de TradingView o bot algorítmico abre posición en Bybit v5 o Hyperliquid L1.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Bybit Perpetual</span>
                <span className="text-[#10B981] font-bold">+2.50 BTC / Long</span>
              </div>
            </div>

            {/* Stage 2: Core Normalization Engine */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#D4AF37]/15 to-[#E06D8A]/10 border border-[#D4AF37]/40 flex flex-col justify-between h-full shadow-[0_0_35px_rgba(212,175,55,0.15)] relative">
              <div>
                <div className="text-xs font-mono uppercase text-[#D4AF37] font-bold tracking-wider mb-2 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>02 // NORMALIZACIÓN CANÓNICA</span>
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight">SymbolMapper & Lot Calibrator</h4>
                <p className="text-xs text-slate-200 mt-2 font-light leading-relaxed">
                  Traduce el símbolo universal <code className="text-[#F3E5AB]">BTC/USDT</code> al identificador de cada broker (<code className="text-[#F3E5AB]">BTCUSD.pro</code>) y calcula el tamaño de lote proporcional a la equidad de cada cuenta esclava.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Tiempo de cómputo:</span>
                <span className="text-[#D4AF37] font-bold">1.2 milisegundos</span>
              </div>
            </div>

            {/* Stage 3: Multi-Broker Concurrent Execution */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between h-full">
              <div>
                <div className="text-xs font-mono uppercase text-[#E06D8A] font-bold tracking-wider mb-2">
                  03 // DESPACHO MULTI-SEDE
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight">Ejecución en Destino</h4>
                <p className="text-xs text-slate-300 mt-2 font-light leading-relaxed">
                  Las órdenes se despachan simultáneamente hacia las terminales configuradas sin descalce ni latencia perceptible.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">cTrader (Open API):</span>
                  <span className="text-[#10B981] font-bold">+25.0 Lots</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MetaTrader 5 (Gateway):</span>
                  <span className="text-[#10B981] font-bold">+25.0 Lots</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Security Guarantee */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Protección Stop-Loss Integrada: Las órdenes esclavas heredan automáticamente el SL/TP de la orden maestra.</span>
            </div>
            <span className="font-mono text-slate-300">Algoritmo auditado para evitar sobre-apalancamiento</span>
          </div>

        </div>

      </div>
    </section>
  );
};
