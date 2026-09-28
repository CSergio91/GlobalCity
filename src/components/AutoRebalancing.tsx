import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';
import { ParallaxBackground } from './ParallaxBackground';
import crossAssetRouterVisual from '../assets/images/cross_asset_router_mesh_1790347063084.webp';

export const AutoRebalancing: React.FC = () => {
  const { t } = useLanguage();
  const { navigate } = useAppRouter();
  const [ratio, setRatio] = useState<number>(65);

  return (
    <section id="rebalance" className="w-full py-20 sm:py-28 bg-transparent border-t-2 border-white/10 relative select-none overflow-hidden">
      {/* Cinematic Parallax Cross-Asset Router Mesh Backdrop (Vivid & Clear) */}
      <ParallaxBackground 
        imageSrc={crossAssetRouterVisual} 
        alt="Cross Asset Liquidity Router Mesh Backdrop" 
        opacity={0.28}
        speed={0.15}
      />

      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[350px] bg-gradient-to-b from-[#7C3AED]/15 via-transparent to-transparent blur-[130px] pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 max-w-[1360px] mx-auto relative z-10">
        
        {/* Section Header: Minimalist & Clean */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 sm:mb-14"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {t.rebalancing.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300">
                  {t.rebalancing.titleEnd}
                </span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm lg:text-base text-slate-200 font-normal leading-relaxed">
                {t.rebalancing.subtitle}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border-2 border-white/20 backdrop-blur-xl shadow-[4px_4px_0px_#7C3AED] shrink-0 text-white relative z-10">
              <div className="text-[11px] uppercase font-mono tracking-wider text-purple-300 font-bold">{t.rebalancing.gasSavingsLabel}</div>
              <div className="text-xl sm:text-3xl font-black font-mono text-white mt-1">
                $0.00 <span className="text-xs font-normal text-slate-300 font-sans">USD</span>
              </div>
              <div className="text-[11px] font-mono text-purple-300 mt-1 font-semibold">{t.rebalancing.gasSavingsSub}</div>
            </div>
          </div>
        </motion.div>

        {/* Master Rebalancing Layout: Retro-Brutalist Light Glass Consoles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Left: Rebalancing Equalizer Graph */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 rounded-2xl p-5 sm:p-8 bg-slate-950/80 border-2 border-white/20 backdrop-blur-2xl shadow-[8px_8px_0px_#7C3AED,0_20px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between text-white relative z-10"
          >
            <div>
              <div className="flex items-center justify-between border-b-2 border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{t.rebalancing.simulatorTitle}</span>
                  </h3>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">{t.rebalancing.simulatorSubtitle}</p>
                </div>
                <Activity className="w-5 h-5 text-purple-400" />
              </div>

              {/* Graphical Balance Visualizer */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-white font-bold">Bybit (USDT): {ratio}%</span>
                    <span className="text-purple-400 font-bold">OKX (Base Asset): {100 - ratio}%</span>
                  </div>
                  <div className="h-4 bg-slate-900 rounded-xl overflow-hidden flex p-0.5 border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] rounded-lg transition-all duration-300"
                      style={{ width: `${ratio}%` }}
                    />
                    <div 
                      className="h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-lg transition-all duration-300"
                      style={{ width: `${100 - ratio}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs uppercase font-mono tracking-wider text-slate-300 font-bold block mb-2">
                    {t.rebalancing.adjustImbalance}
                  </label>
                  <input 
                    type="range"
                    min="30"
                    max="85"
                    value={ratio}
                    onChange={(e) => setRatio(Number(e.target.value))}
                    className="w-full accent-[#7C3AED] cursor-pointer h-2.5 bg-slate-800 rounded-lg appearance-none border border-white/10"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5 font-semibold">
                    <span>{t.rebalancing.balanced}</span>
                    <span>{t.rebalancing.thresholdAlert}</span>
                    <span>{t.rebalancing.critical}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Algorithm Action Note */}
              <div className="mt-6 p-4 rounded-xl bg-purple-950/60 border border-purple-400/30">
                <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${ratio > 70 ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
                  <span>{ratio > 70 ? t.rebalancing.deviationDetected : t.rebalancing.inOptimalRange}</span>
                </div>
                <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-normal">
                  {ratio > 70 
                    ? t.rebalancing.deviationText(((ratio - 50) * 200).toFixed(0))
                    : t.rebalancing.optimalText}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">{t.rebalancing.directionalRisk}</span>
              <span className="font-mono text-purple-400 font-bold">{t.rebalancing.deltaNeutral}</span>
            </div>
          </motion.div>

          {/* Right: Security & Architecture Specs */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 rounded-2xl p-5 sm:p-8 bg-slate-950/80 border-2 border-white/20 backdrop-blur-2xl shadow-[8px_8px_0px_#7C3AED,0_20px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between text-white relative z-10"
          >
            <div>
              <div className="flex items-center justify-between border-b-2 border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{t.rebalancing.securityTitle}</span>
                  </h3>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">{t.rebalancing.securitySubtitle}</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-purple-400" />
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-[#7C3AED] pl-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#7C3AED] font-bold">
                    {t.rebalancing.sec1Title}
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed font-normal">
                    {t.rebalancing.sec1Desc}
                  </p>
                </div>

                <div className="border-l-4 border-indigo-500 pl-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold">
                    {t.rebalancing.sec2Title}
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed font-normal">
                    {t.rebalancing.sec2Desc}
                  </p>
                </div>

                <div className="border-l-4 border-purple-400 pl-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-purple-600 font-bold">
                    {t.rebalancing.sec3Title}
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed font-normal">
                    {t.rebalancing.sec3Desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t.rebalancing.auditVerified}</span>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 border border-purple-300 text-[#7C3AED] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_#090A10] active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>Configurar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
