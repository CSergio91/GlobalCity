import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Lock,
  Layers,
  Activity
} from 'lucide-react';

export const AutoRebalancing: React.FC = () => {
  const [ratio, setRatio] = useState<number>(65);

  return (
    <section id="rebalance" className="min-h-screen w-full flex flex-col justify-center py-24 bg-[#07080C] relative select-none">
      {/* Background Subtle Gradient Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(45,212,191,0.06),transparent_60%)] pointer-events-none" />

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 max-w-[1440px] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-mono text-[#2DD4BF] mb-3">
            <span className="w-6 h-[1.5px] bg-[#2DD4BF]" />
            <span>ALGORITMO DE DISTRIBUCIÓN DE MARGEN</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] text-balance">
                Rebalanceo Sintético.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2DD4BF] via-[#A7F3D0] to-[#D4AF37]">
                  Cero Transferencias de Red.
                </span>
              </h2>
              <p className="mt-4 text-base sm:text-xl text-slate-300 max-w-3xl font-light leading-relaxed">
                Equilibra tus saldos entre sedes mediante órdenes espejo delta-neutrales. Sin pagar tarifas de red blockchain, sin esperas de confirmación y con tus claves API estrictamente protegidas sin permiso de retiro.
              </p>
            </div>

            <div className="border-l-2 border-[#2DD4BF] pl-6 py-2 shrink-0">
              <div className="text-xs uppercase font-mono tracking-widest text-slate-400">Ahorro en Gas Blockchain</div>
              <div className="text-3xl sm:text-5xl font-black font-mono-nums text-white mt-1">
                0.00 $ <span className="text-sm font-light text-slate-400 font-sans">USD</span>
              </div>
              <div className="text-xs font-mono text-[#2DD4BF] mt-1">EJECUCIÓN INMEDIATA A MERCADO</div>
            </div>
          </div>
        </div>

        {/* Master Rebalancing Graphical Layout (No generic cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Rebalancing Equalizer Graph */}
          <div className="lg:col-span-7 bg-[#0B0D14]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Simulador de Desviación de Margen</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Control de ratio óptimo entre sedes operativas</p>
                </div>
                <Activity className="w-5 h-5 text-[#2DD4BF]" />
              </div>

              {/* Graphical Balance Visualizer */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-white font-bold">Bybit (USDT Acumulado): {ratio}%</span>
                    <span className="text-[#2DD4BF] font-bold">OKX (Activo Base): {100 - ratio}%</span>
                  </div>
                  <div className="h-4 bg-white/10 rounded-full overflow-hidden flex p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E06D8A] rounded-full transition-all duration-300"
                      style={{ width: `${ratio}%` }}
                    />
                    <div 
                      className="h-full bg-gradient-to-r from-[#2DD4BF] to-[#10B981] rounded-full transition-all duration-300"
                      style={{ width: `${100 - ratio}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <label className="text-xs uppercase font-mono tracking-wider text-slate-400 block mb-2">
                    Ajustar Desbalance Simulado
                  </label>
                  <input 
                    type="range"
                    min="30"
                    max="85"
                    value={ratio}
                    onChange={(e) => setRatio(Number(e.target.value))}
                    className="w-full accent-[#2DD4BF] cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
                    <span>Equilibrado (50/50)</span>
                    <span>Alerta Umbral (70/30)</span>
                    <span>Crítico (85/15)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Algorithm Action Note */}
              <div className="mt-8 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${ratio > 70 ? 'bg-rose-400 animate-ping' : 'bg-[#10B981]'}`} />
                  <span>{ratio > 70 ? 'Desviación Detectada: Acción Requerida' : 'Ratios de Operación en Rango Óptimo'}</span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed font-light">
                  {ratio > 70 
                    ? `El algoritmo sugiere ejecutar una orden espejo inversa de $${((ratio - 50) * 200).toFixed(0)} USDT para sincronizar el margen en Bybit sin transferencias de billetera.`
                    : 'Las reservas entre ambas sedes permiten ejecutar ráfagas de órdenes continuas sin riesgo de insuficiencia de margen.'}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Riesgo direccional durante ejecución: 0.00%</span>
              <span className="font-mono text-[#2DD4BF]">Protocolo Delta-Neutral</span>
            </div>
          </div>

          {/* Right: Security & Architecture Specs (Clean hairline lines, no boxy cards) */}
          <div className="lg:col-span-5 bg-[#0B0D14]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Garantías de Seguridad</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Arquitectura estrictamente no custodial</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-[#2DD4BF]" />
              </div>

              <div className="space-y-6">
                <div className="border-l border-white/15 pl-5">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-bold">
                    1. Claves Read & Trade Únicamente
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                    Global City rechaza automáticamente cualquier clave API que tenga habilitados permisos de retiro o transferencia externa.
                  </p>
                </div>

                <div className="border-l border-white/15 pl-5">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#2DD4BF] font-bold">
                    2. Enrutamiento por Redes Low-Cost
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                    Si el trader decide realizar una transferencia física opcional, el motor recomienda enrutadores como Arbitrum o Solana con coste inferior a $0.50.
                  </p>
                </div>

                <div className="border-l border-white/15 pl-5">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#E06D8A] font-bold">
                    3. Cifrado AES-256 en Reposo
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                    Los secretos de API se cifran con claves derivadas del usuario antes de ser validados en la memoria volátil del terminal.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono text-[#10B981]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Auditoría de Permisos Verificada en Tiempo Real</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
