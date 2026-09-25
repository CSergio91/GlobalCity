import React, { useRef, useState, useEffect } from 'react';
import commandDeckVisualPath from '../assets/images/command_bridge_parallax_1790347047571.jpg';
import { ArrowRight, Terminal } from 'lucide-react';

interface HorizontalShowcaseProps {
  onOpenTerminal: () => void;
}

export const HorizontalShowcase: React.FC<HorizontalShowcaseProps> = ({ onOpenTerminal }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;
      
      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const slides = [
    {
      index: "01",
      kicker: "CONECTIVIDAD MULTI-VENUE",
      title: "Unifica Cripto, Forex y Futuros sin Fragmentar tu Capital",
      description: "Conecta tus cuentas institucionales en Bybit v5, OKX DMA, Binance, cTrader Open API y MetaTrader 5 en una consola centralizada de mando. Tus credenciales operan bajo protocolo no custodial estricto: cero permisos de retiro por diseño matemático.",
      highlightStat: "2.4 ms",
      highlightLabel: "Latencia media de ejecución institucional",
      tags: [
        { label: "Arquitectura", value: "No Custodial (Read & Trade)" },
        { label: "Gateways", value: "Bybit · OKX · Binance · cTrader · MT5" },
        { label: "Protocolo", value: "WebSockets + Protobuf TLS & FIX" }
      ]
    },
    {
      index: "02",
      kicker: "ARBITRAJE SINTÉTICO L2",
      title: "Captura Ineficiencias de Spread Simultáneo en Sub-100 Milisegundos",
      description: "Olvídate del arbitraje en cadena lento y expuesto a riesgo de liquidación. El motor analiza libros de órdenes Nivel 2 en tiempo real, descuenta comisiones de taker y slippage VWAP, y despacha órdenes concurrentes con protocolo de rollback instantáneo.",
      highlightStat: "< 95 ms",
      highlightLabel: "Despacho concurrente atómico simultáneo",
      tags: [
        { label: "Seguridad Operativa", value: "Atomic Promise.allSettled + Rollback" },
        { label: "Monedero de Tarifas", value: "Virtual Gas Tank en USDT" },
        { label: "Cálculo de Spread", value: "Net Spread > Taker A + Taker B + Slippage" }
      ]
    },
    {
      index: "03",
      kicker: "CONTROL OPERATIVO TELEGRAM",
      title: "Monitoreo, Alertas y Panic Switch Directamente en tu Móvil",
      description: "Comanda tu operativa global desde cualquier lugar del mundo. Recibe reportes consolidados de equidad en tiempo real, notificaciones push de arbitraje y ejecuta el cierre de emergencia inmediato de todas tus posiciones mediante autenticación biométrica 2FA.",
      highlightStat: "100%",
      highlightLabel: "Control remoto cifrado de punto a punto",
      tags: [
        { label: "Autenticación", value: "HMAC-SHA256 + User Whitelist" },
        { label: "Tiempo de Respuesta", value: "< 180ms vía Webhook Seguro" },
        { label: "Comandos Rápidos", value: "/portfolio · /rebalance · /panic_close_all" }
      ]
    },
    {
      index: "04",
      kicker: "REBALANCEO SINTÉTICO",
      title: "Equilibra Cuentas entre Sedes sin Transferencias On-Chain",
      description: "Cero comisiones de red blockchain y cero esperas de confirmación de bloque. El algoritmo de rebalanceo sintético abre y cierra coberturas delta-neutrales inversas entre sedes para reubicar tu margen efectivo al instante sin mover fondos físicos.",
      highlightStat: "0 $",
      highlightLabel: "Coste de gas blockchain en rebalanceos",
      tags: [
        { label: "Mecánica", value: "Coberturas Delta-Neutral Simultáneas" },
        { label: "Velocidad", value: "Inmediato a precio de mercado" },
        { label: "Riesgo de Mercado", value: "Exposición direccional nula durante ejecución" }
      ]
    },
    {
      index: "05",
      kicker: "COPY TRADING MULTI-ACTIVO",
      title: "Espeja Señales de Cripto hacia Forex y Futuros con Normalización de Lote",
      description: "El motor normaliza la dimensionalidad del activo en microsegundos, traduciendo unidades de Bitcoin o Solana a lotes estándar de FX en MetaTrader 5 o contratos de futuros regulados, respetando la calibración de riesgo y margen de tu cuenta.",
      highlightStat: "< 15 ms",
      highlightLabel: "Latencia de replicación entre plataformas",
      tags: [
        { label: "Traducción de Símbolo", value: "Canónico Universal (BTC/USDT ↔ BTCUSD.raw)" },
        { label: "Riesgo Dinámico", value: "Calibración por apalancamiento y equidad" },
        { label: "Protección", value: "Cap máximo de stop loss por operación" }
      ]
    }
  ];

  const totalSlides = slides.length;
  const translateX = scrollProgress * (totalSlides - 1) * 100;
  // Parallax panoramic translation for the background image
  const bgTranslateX = scrollProgress * 22;
  const currentSlideIndex = Math.min(totalSlides, Math.floor(scrollProgress * (totalSlides - 0.05)) + 1);

  return (
    <section 
      id="horizontal-showcase" 
      ref={containerRef} 
      className="relative h-[420vh] bg-[#050609] select-none"
    >
      {/* Sticky Full-Viewport Stage: Exactly 100vh on any screen size */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        
        {/* Parallax High-Contrast Background Canvas: Vividly illuminated and highlighted */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={commandDeckVisualPath} 
            alt="Global City Command Deck Parallax Horizon" 
            className="w-[130vw] h-full object-cover object-center filter brightness-[0.55] contrast-[1.2] transition-transform duration-100 ease-out will-change-transform"
            style={{
              transform: `scale(1.08) translateX(-${bgTranslateX}%)`
            }}
            referrerPolicy="no-referrer"
          />
          {/* Subtle lateral gradient scrims to ensure high text contrast while letting the image shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/95 via-[#050609]/55 to-[#050609]/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050609] via-transparent to-[#050609]/70" />
          <div className="absolute inset-0 ambient-glow-rose opacity-30" />
        </div>

        {/* Minimal Editorial Header Overlay */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-xs uppercase font-mono tracking-[0.2em] text-[#D4AF37] font-semibold">
              RECORRIDO PANORÁMICO HORIZONTAL // SCROLL VERTICAL CONTINUO
            </span>
          </div>

          {/* Dynamic Slide Counter */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-white font-black text-base drop-shadow-md">0{currentSlideIndex}</span>
            <span className="text-white/30">/</span>
            <span className="text-slate-400">0{totalSlides}</span>
          </div>
        </div>

        {/* Horizontal Moving Content Strip: Full viewport centered presentation */}
        <div className="relative z-10 w-full flex-1 flex items-center overflow-hidden">
          <div 
            className="flex h-full items-center transition-transform duration-100 ease-out will-change-transform"
            style={{
              transform: `translateX(-${translateX}vw)`,
              width: `${totalSlides * 100}vw`
            }}
          >
            {slides.map((slide, idx) => (
              <div 
                key={idx} 
                className="w-screen h-full flex flex-col justify-center px-6 sm:px-16 lg:px-24 xl:px-32 flex-shrink-0"
              >
                {/* Backdrop lighting mask for text clarity over the vivid background image */}
                <div className="max-w-5xl mx-auto w-full p-6 sm:p-12 rounded-3xl bg-[#07090F]/70 backdrop-blur-md border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
                  
                  {/* Watermark Index and Kicker */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-[1.5px] bg-[#D4AF37]" />
                      <span className="text-xs sm:text-sm font-mono tracking-widest text-[#D4AF37] font-bold uppercase">
                        {slide.kicker}
                      </span>
                    </div>
                    <div className="font-mono text-4xl sm:text-6xl font-black text-white/15 tracking-tighter select-none">
                      {slide.index}
                    </div>
                  </div>

                  {/* Monumental Headline */}
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] mb-6 text-balance drop-shadow-lg">
                    {slide.title}
                  </h2>

                  {/* Narrative Body */}
                  <p className="text-base sm:text-lg lg:text-xl text-slate-200 font-light leading-relaxed max-w-3xl mb-8 text-balance">
                    {slide.description}
                  </p>

                  {/* Highlights & Tags: Pure Architectural Hairline Lines */}
                  <div className="pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
                    <div>
                      <div className="text-3xl sm:text-4xl font-extrabold text-[#D4AF37] font-mono-nums drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                        {slide.highlightStat}
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        {slide.highlightLabel}
                      </div>
                    </div>

                    {slide.tags.map((tag, tIdx) => (
                      <div key={tIdx} className="border-l border-white/15 pl-5">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-[#E06D8A] font-semibold">
                          {tag.label}
                        </div>
                        <div className="text-sm font-medium text-white mt-1">
                          {tag.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Link */}
                  <div className="mt-8 pt-4 flex items-center justify-between">
                    <button
                      onClick={onOpenTerminal}
                      className="inline-flex items-center gap-3 text-sm font-bold text-white hover:text-[#D4AF37] transition-colors group cursor-pointer"
                    >
                      <Terminal className="w-4 h-4 text-[#D4AF37]" />
                      <span>Probar este módulo en el Terminal</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </button>
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                      Paso {slide.index} de 0{totalSlides}
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Progress Bar at Bottom - Pure visual feedback */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pb-8 flex items-center gap-6">
          <div className="flex-1 h-[3px] bg-white/15 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#D4AF37] via-[#E06D8A] to-[#2DD4BF] transition-all duration-100 rounded-full"
              style={{ width: `${Math.max(6, scrollProgress * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest hidden sm:inline-block">
            Usa el scroll del ratón para avanzar por la sala de operaciones
          </span>
        </div>

      </div>
    </section>
  );
};
