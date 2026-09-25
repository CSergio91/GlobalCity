import React from 'react';
import { 
  ArrowRight, 
  Terminal, 
  Sparkles,
  Cpu
} from 'lucide-react';
import skylineVisualPath from '../assets/images/global_city_panoramic_skyline_1790347023744.jpg';
import commandDeckVisualPath from '../assets/images/command_bridge_parallax_1790347047571.jpg';
import gcMonogramPath from '../assets/images/global_city_gc_monogram_1790347507584.jpg';

interface HeroProps {
  onOpenTerminal: () => void;
  onExploreModules: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTerminal, onExploreModules }) => {
  return (
    <section id="hero" className="relative min-h-screen w-full flex flex-col justify-center items-center pt-28 pb-20 overflow-hidden">
      {/* Immersive Parallax Skyline Full-Bleed Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={skylineVisualPath} 
          alt="Global City Panoramic Horizon" 
          className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.15] scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Layered Gradient Overlays for deep atmospheric contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070B] via-[#06070B]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06070B]/90 via-transparent to-[#06070B]/90" />
        <div className="absolute inset-0 ambient-glow-rose pointer-events-none opacity-40" />
      </div>

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10 max-w-[1440px] mx-auto flex flex-col items-center">
        
        {/* Trading City-Inspired Grand GC Monogram Crest */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative group cursor-pointer mb-5">
            {/* Deep Warm Gold & Rose Ambient Aura */}
            <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-[#D4AF37]/35 via-[#E06D8A]/25 to-[#2DD4BF]/15 blur-2xl opacity-80 group-hover:opacity-100 transition-opacity" />
            
            {/* Medallion with pure obsidian backing and brushed bronze rim - ZERO white edges */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full p-[2px] bg-gradient-to-b from-[#D4AF37] via-[#2D251A] to-[#0B0D13] shadow-[0_0_45px_rgba(0,0,0,0.95)] border border-[#D4AF37]/35 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
              <img 
                src={gcMonogramPath} 
                alt="Global City GC Monogram Crest" 
                className="w-full h-full object-cover rounded-full filter contrast-125 brightness-105 scale-102"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Magical Sparkle Particle - Top Right */}
            <div className="absolute -top-2 -right-2 text-[#F3E5AB] pointer-events-none group-hover:scale-125 group-hover:rotate-45 transition-transform duration-500">
              <Sparkles className="w-6 h-6 text-[#F3E5AB] drop-shadow-[0_0_10px_#D4AF37]" />
            </div>

            {/* Subtle Star Particle - Bottom Left */}
            <div className="absolute -bottom-1 -left-2 text-[#E06D8A] pointer-events-none opacity-85 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-[#E06D8A] drop-shadow-[0_0_8px_#E06D8A]" />
            </div>

            {/* Live ultra-low latency status indicator */}
            <span className="absolute bottom-1 right-2 flex h-3.5 w-3.5" title="GC Core Low-Latency Gateway Active">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#10B981] border-2 border-[#06070B]"></span>
            </span>
          </div>

          {/* Clean Graphic Telemetry Line (No pill badge) */}
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] uppercase font-mono text-slate-400">
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="text-[#D4AF37] font-semibold">GLOBAL CITY ECOSYSTEM</span>
            <span className="text-white/20">/</span>
            <span className="text-[#2DD4BF] hidden sm:inline">CROSS-VENUE TRADING PROTOCOL</span>
            <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#2DD4BF]" />
          </div>
        </div>

        {/* Monumental Headline */}
        <div className="text-center max-w-6xl mx-auto">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-[5.75rem] font-extrabold tracking-tight text-white leading-[1.04] text-balance">
            Opera Todo tu Portafolio Global desde{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFF3B0] to-[#E06D8A] drop-shadow-[0_0_40px_rgba(212,175,55,0.25)]">
              un Único Mando
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed text-balance font-light">
            El conector maestro definitivo. Unifica <strong className="text-white font-semibold">Criptoactivos, Forex en cTrader y MetaTrader 5, y Futuros regulados</strong>. Ejecuta arbitraje sintético simultáneo en microsegundos, rebalancea cuentas sin mover fondos físicos y comanda cada orden desde Telegram.
          </p>

          {/* Action Decision Block */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
            <button
              onClick={onOpenTerminal}
              className="w-full sm:w-auto px-10 py-5 text-sm font-bold text-white bg-gradient-to-r from-[#D4AF37] via-[#E06D8A] to-[#9E3553] hover:brightness-110 transition-all rounded-2xl shadow-[0_0_35px_rgba(224,109,138,0.35)] flex items-center justify-center gap-3 cursor-pointer active:scale-95 group border border-white/20"
            >
              <Terminal className="w-5 h-5 text-white" />
              <span>Abrir Terminal de Trading Unificado</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              onClick={onExploreModules}
              className="w-full sm:w-auto px-9 py-5 text-sm font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-all rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer border border-white/10 backdrop-blur-md"
            >
              <span>Explorar Módulos de Operativa</span>
            </button>
          </div>

          {/* Architectural Hairline Telemetry Grid (NO generic cards, pure floating data lines) */}
          <div className="mt-20 pt-10 border-t border-white/10 w-full grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-left">
            <div className="relative pl-4 border-l border-[#D4AF37]/40">
              <div className="text-xs uppercase font-mono tracking-widest text-[#D4AF37]">Protocolo No Custodial</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-1.5">Read & Trade</div>
              <div className="text-xs text-slate-400 mt-1">Cero permisos de retiro por diseño matemático</div>
            </div>

            <div className="relative pl-4 border-l border-[#2DD4BF]/40">
              <div className="text-xs uppercase font-mono tracking-widest text-[#2DD4BF]">Arbitraje Sintético</div>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono-nums mt-1.5">&lt; 95 ms</div>
              <div className="text-xs text-slate-400 mt-1">Despacho atómico L2 con descuento de comisiones</div>
            </div>

            <div className="relative pl-4 border-l border-[#E06D8A]/40">
              <div className="text-xs uppercase font-mono tracking-widest text-[#E06D8A]">Control Remoto Móvil</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-1.5">Telegram 2FA</div>
              <div className="text-xs text-slate-400 mt-1">Monitoreo de equidad y panic-switch biométrico</div>
            </div>

            <div className="relative pl-4 border-l border-white/30">
              <div className="text-xs uppercase font-mono tracking-widest text-slate-400">Normalización de Lote</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-1.5">Cripto ➔ CFDs</div>
              <div className="text-xs text-slate-400 mt-1">Mapeo dinámico cTrader, MT5 y pasarelas FIX</div>
            </div>
          </div>
        </div>

        {/* High-Resolution Terminal Command Deck Feature Mockup */}
        <div className="mt-20 w-full rounded-3xl p-1 bg-gradient-to-b from-white/20 via-white/5 to-transparent border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="relative rounded-[22px] overflow-hidden aspect-[16/9] max-h-[640px] w-full bg-[#090A0F]">
            <img 
              src={commandDeckVisualPath} 
              alt="Global City Holographic Command Deck"
              className="w-full h-full object-cover object-center filter contrast-110 brightness-95"
              referrerPolicy="no-referrer"
            />
            
            {/* Live Telemetry Floating Bar */}
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto bg-[#07090F]/90 backdrop-blur-xl p-5 rounded-2xl max-w-lg border border-white/15 shadow-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] flex items-center justify-center text-white shrink-0 shadow-lg">
                <Cpu className="w-6 h-6 text-black" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span>Smart Order Router & Cross Bridge Activo</span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                </div>
                <div className="text-slate-300 mt-1 leading-snug">
                  Enrutando flujos en microsegundos entre Bybit, OKX, cTrader Open API y terminales MT5 simultáneas.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
