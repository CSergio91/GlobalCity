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

export const AutoRebalancing: React.FC = () => {
  const { t } = useLanguage();
  const { navigate } = useAppRouter();
  const [ratio, setRatio] = useState<number>(65);

  return (
    <section id="rebalance" className="w-full py-20 sm:py-28 bg-[#06070B] relative select-none overflow-hidden">
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[300px] bg-gradient-to-b from-[#60A5FA]/10 via-transparent to-transparent blur-[120px] pointer-events-none" />

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
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {t.rebalancing.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA]">
                  {t.rebalancing.titleEnd}
                </span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm lg:text-base text-slate-300 font-light leading-relaxed">
                {t.rebalancing.subtitle}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border-t border-white/10 backdrop-blur-xl shrink-0">
              <div className="text-[11px] uppercase font-mono tracking-wider text-slate-400 font-bold">{t.rebalancing.gasSavingsLabel}</div>
              <div className="text-xl sm:text-3xl font-black font-mono-nums text-white mt-1">
                $0.00 <span className="text-xs font-normal text-slate-400 font-sans">USD</span>
              </div>
              <div className="text-[11px] font-mono text-[#60A5FA] mt-1 font-semibold">{t.rebalancing.gasSavingsSub}</div>
            </div>
          </div>
        </motion.div>

        {/* Master Rebalancing Layout: Borderless Glass */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Left: Rebalancing Equalizer Graph */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 rounded-3xl p-5 sm:p-8 bg-white/[0.02] border-t border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{t.rebalancing.simulatorTitle}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.rebalancing.simulatorSubtitle}</p>
                </div>
                <Activity className="w-5 h-5 text-[#60A5FA]" />
              </div>

              {/* Graphical Balance Visualizer */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-white font-bold">Bybit (USDT): {ratio}%</span>
                    <span className="text-[#60A5FA] font-bold">OKX (Base Asset): {100 - ratio}%</span>
                  </div>
                  <div className="h-3.5 bg-white/10 rounded-full overflow-hidden flex p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FBBF24] to-[#F472B6] rounded-full transition-all duration-300"
                      style={{ width: `${ratio}%` }}
                    />
                    <div 
                      className="h-full bg-gradient-to-r from-[#60A5FA] to-[#818CF8] rounded-full transition-all duration-300"
                      style={{ width: `${100 - ratio}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold block mb-2">
                    {t.rebalancing.adjustImbalance}
                  </label>
                  <input 
                    type="range"
                    min="30"
                    max="85"
                    value={ratio}
                    onChange={(e) => setRatio(Number(e.target.value))}
                    className="w-full accent-[#60A5FA] cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                    <span>{t.rebalancing.balanced}</span>
                    <span>{t.rebalancing.thresholdAlert}</span>
                    <span>{t.rebalancing.critical}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Algorithm Action Note */}
              <div className="mt-6 p-4 rounded-2xl bg-white/[0.02]">
                <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${ratio > 70 ? 'bg-rose-400 animate-ping' : 'bg-[#10B981]'}`} />
                  <span>{ratio > 70 ? t.rebalancing.deviationDetected : t.rebalancing.inOptimalRange}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-light">
                  {ratio > 70 
                    ? t.rebalancing.deviationText(((ratio - 50) * 200).toFixed(0))
                    : t.rebalancing.optimalText}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">{t.rebalancing.directionalRisk}</span>
              <span className="font-mono text-[#60A5FA] font-bold">{t.rebalancing.deltaNeutral}</span>
            </div>
          </motion.div>

          {/* Right: Security & Architecture Specs */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 rounded-3xl p-5 sm:p-8 bg-white/[0.02] border-t border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{t.rebalancing.securityTitle}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.rebalancing.securitySubtitle}</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-[#60A5FA]" />
              </div>

              <div className="space-y-4">
                <div className="border-l-2 border-[#FBBF24] pl-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#FBBF24] font-bold">
                    {t.rebalancing.sec1Title}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                    {t.rebalancing.sec1Desc}
                  </p>
                </div>

                <div className="border-l-2 border-[#60A5FA] pl-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#60A5FA] font-bold">
                    {t.rebalancing.sec2Title}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                    {t.rebalancing.sec2Desc}
                  </p>
                </div>

                <div className="border-l-2 border-[#F472B6] pl-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#F472B6] font-bold">
                    {t.rebalancing.sec3Title}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                    {t.rebalancing.sec3Desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-[#10B981] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.rebalancing.auditVerified}</span>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="text-white hover:text-[#60A5FA] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
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
