import React, { useRef } from 'react';
import { 
  HORIZONTAL_ECOSYSTEM_MODULES, 
  MultiVenueFeature 
} from '../data/mockData';
import { 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  Layers, 
  Bot, 
  RefreshCw, 
  Copy, 
  TrendingUp, 
  ShieldCheck, 
  Cpu,
  Radio
} from 'lucide-react';
import routerMeshPath from '../assets/images/cross_asset_router_mesh_1790347063084.jpg';

interface HorizontalShowcaseProps {
  onOpenTerminal: () => void;
}

export const HorizontalShowcase: React.FC<HorizontalShowcaseProps> = ({ onOpenTerminal }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 480;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="horizontal-showcase" className="relative py-28 overflow-hidden bg-[#07080D]">
      {/* Background Hero Mesh Image Behind the Section */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img 
          src={routerMeshPath} 
          alt="Router Mesh Background" 
          className="w-full h-full object-cover object-center filter blur-[1px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07080D] via-transparent to-[#07080D]" />
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header with Arrow Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E06D8A] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#E06D8A]" />
              <span>Navegación Panorámica Horizontal</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Arquitectura del Ecosistema Global City
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl">
              Desliza horizontalmente para explorar cada una de las capacidades del conector unificado antes de descender al motor analítico.
            </p>
          </div>

          {/* Navigation Arrows for Horizontal Flow */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleScroll('left')}
              className="w-12 h-12 rounded-2xl glass-panel hover:bg-white/10 flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer active:scale-90"
              aria-label="Desplazar a la izquierda"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#E06D8A] to-[#C95370] hover:brightness-110 flex items-center justify-center text-white shadow-lg shadow-[#E06D8A]/25 transition-all cursor-pointer active:scale-90"
              aria-label="Desplazar a la derecha"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Track */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto custom-horizontal-scroll pb-8 pt-2 snap-x snap-mandatory scroll-smooth px-2"
        >
          {HORIZONTAL_ECOSYSTEM_MODULES.map((item, idx) => (
            <div
              key={item.id}
              className="w-[360px] sm:w-[440px] shrink-0 snap-start glass-panel glass-panel-hover rounded-3xl p-7 sm:p-8 flex flex-col justify-between border border-white/10 relative transition-all duration-300"
            >
              <div>
                {/* Header Tag & Badge */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-mono-nums font-bold text-[#2DD4BF] px-3 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/20">
                    {item.badge}
                  </span>
                  <span className="text-[11px] font-mono-nums text-slate-400">
                    {item.latency}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
                  {item.title}
                </h3>

                <h4 className="text-xs font-semibold text-[#E06D8A] mt-2 mb-4">
                  {item.subtitle}
                </h4>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                {/* Technology Tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="text-[11px] font-medium text-slate-300 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono-nums">
                  Estado: <strong className="text-white">{item.status}</strong>
                </span>
                <button
                  onClick={onOpenTerminal}
                  className="text-xs font-bold text-[#E06D8A] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group"
                >
                  <span>Probar en Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
