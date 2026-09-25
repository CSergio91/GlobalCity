import React from 'react';
import { 
  ArrowRight, 
  Terminal, 
  Layers, 
  Zap, 
  Bot, 
  RefreshCw, 
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import skylineVisualPath from '../assets/images/global_city_panoramic_skyline_1790347023744.jpg';
import commandDeckVisualPath from '../assets/images/command_bridge_parallax_1790347047571.jpg';
import officialLogoPath from '../assets/images/global_city_official_logo_1790347316776.jpg';

interface HeroProps {
  onOpenTerminal: () => void;
  onExploreModules: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTerminal, onExploreModules }) => {
  return (
    <section id="hero" className="relative min-h-[92vh] pt-32 pb-24 flex items-center justify-center overflow-hidden">
      {/* Immersive Parallax Skyline Full-Bleed Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={skylineVisualPath} 
          alt="Global City Panoramic Horizon" 
          className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.1] scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Layered Gradient Overlays to seamlessly blend into deep black */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070A] via-[#06070A]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06070A]/80 via-transparent to-[#06070A]/80" />
        <div className="absolute inset-0 ambient-glow-rose pointer-events-none" />
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-12 relative z-10 max-w-7xl mx-auto">
        
        {/* Trading City-Inspired Grand Emblem Crest */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative group cursor-pointer mb-4">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#D4AF37]/30 via-[#E06D8A]/25 to-[#2DD4BF]/20 blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[2.5px] bg-gradient-to-tr from-[#D4AF37] via-[#FFF3B0] to-[#8C6D23] shadow-2xl shadow-black ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-300">
              <img 
                src={officialLogoPath} 
                alt="Global City Official Logo" 
                className="w-full h-full object-cover rounded-full filter contrast-110 brightness-105"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Live ping dot */}
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#10B981] border-2 border-[#0A0B10]"></span>
            </span>
          </div>

          {/* Upper Architecture Kicker */}
          <div className="glass-panel px-4 py-1.5 rounded-full flex items-center gap-2.5 text-xs text-slate-300 shadow-xl border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="font-semibold text-white">Conector Maestro Multi-Exchange & Multi-Broker</span>
            <span className="text-white/30" aria-hidden="true">·</span>
            <span className="text-[#2DD4BF] font-mono-nums">Bybit · OKX · Binance · cTrader · MT5 · FIX</span>
          </div>
        </div>

        {/* Marquee Headline */}
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] text-balance">
            Opera Todo tu Portafolio Global desde <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E06D8A] via-[#F43F5E] to-[#2DD4BF]">un Único Lugar</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed text-balance">
            El hub definitivo para traders de alto rendimiento. Unifica <strong className="text-white">Criptoactivos, Forex en cTrader y MT5, y Futuros regulados</strong>. Ejecuta arbitraje sintético simultáneo sub-100ms, rebalancea cuentas sin mover fondos por blockchain y comanda tus operaciones de forma segura desde Telegram.
          </p>

          {/* Action Decision Block */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenTerminal}
              className="w-full sm:w-auto px-9 py-4 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#E06D8A] via-[#ED7D9A] to-[#E06D8A] hover:brightness-110 transition-all rounded-xl shadow-2xl shadow-[#E06D8A]/35 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 group border border-white/15"
            >
              <Terminal className="w-4 h-4 text-white" />
              <span>Abrir Terminal de Trading Unificado</span>
              <ArrowRight className="w-4 h-4 text-white/90 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              onClick={onExploreModules}
              className="w-full sm:w-auto px-8 py-4 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white glass-panel hover:bg-white/10 transition-all rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-white/15"
            >
              <span>Descubrir Módulos de Operación</span>
            </button>
          </div>

          {/* Verified Technical Pillars Strip */}
          <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="glass-panel p-4 rounded-2xl">
              <div className="text-[11px] text-slate-400 font-medium">Protocolo No Custodial</div>
              <div className="text-base font-bold text-white mt-1">Claves Read & Trade</div>
              <div className="text-[11px] text-slate-400">Prohibidos permisos de retiro</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl">
              <div className="text-[11px] text-slate-400 font-medium">Arbitraje Sintético</div>
              <div className="text-base font-bold text-[#2DD4BF] font-mono-nums mt-1">&lt; 100 ms</div>
              <div className="text-[11px] text-slate-400">Despacho concurrente L2 VWAP</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl">
              <div className="text-[11px] text-slate-400 font-medium">Control Remoto Móvil</div>
              <div className="text-base font-bold text-[#E06D8A] mt-1">Telegram Bot API</div>
              <div className="text-[11px] text-slate-400">Alertas, PnL y ejecución 2FA</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl">
              <div className="text-[11px] text-slate-400 font-medium">Puente Cross-Asset</div>
              <div className="text-base font-bold text-white mt-1">Copy Cripto ➔ CFDs</div>
              <div className="text-[11px] text-slate-400">Mapeo automático de lotes</div>
            </div>
          </div>
        </div>

        {/* High-Resolution Terminal Command Deck Feature Mockup */}
        <div className="mt-16 rounded-3xl p-2.5 sm:p-4 bg-gradient-to-b from-white/20 via-white/5 to-white/0 border border-white/15 shadow-2xl overflow-hidden">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] max-h-[580px] w-full bg-[#090A0F]">
            <img 
              src={commandDeckVisualPath} 
              alt="Global City Holographic Command Deck"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            
            {/* Live Telemetry Floating Badge */}
            <div className="absolute bottom-5 left-5 right-5 sm:right-auto glass-panel p-4 rounded-2xl max-w-md border border-white/20 shadow-2xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E06D8A] to-[#9E3553] flex items-center justify-center text-white shrink-0 shadow-lg">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Smart Order Router & Bridge Activo</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-slate-300 mt-1 leading-snug">
                  Fragmentando órdenes en microsegundos entre Bybit, OKX, cTrader y terminales MT5 sin colisiones.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
