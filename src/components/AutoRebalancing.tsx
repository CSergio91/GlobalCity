import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Activity
} from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useLanguage } from '../context/LanguageContext';

export const AutoRebalancing: React.FC = () => {
  const { t } = useLanguage();
  const [ratio, setRatio] = useState<number>(65);

  return (
    <section id="rebalance" className="min-h-screen w-full flex flex-col justify-center py-24 bg-[#07080C] relative select-none">
      {/* Background Subtle Gradient Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(96,165,250,0.08),transparent_60%)] pointer-events-none" />

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 max-w-[1440px] mx-auto relative z-10">
        
        {/* Section Header: Clean, No Noise */}
        <ScrollReveal direction="up" delay={50}>
          <div className="mb-10 sm:mb-16">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
              <div>
                <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] sm:leading-[1.05] text-balance text-shadow-hero">
                  {t.rebalancing.titleStart}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] via-[#F472B6] to-[#FBBF24]">
                    {t.rebalancing.titleEnd}
                  </span>
                </h2>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-xl text-slate-200 max-w-3xl font-light leading-relaxed text-shadow-subtle text-illuminate">
                  {t.rebalancing.subtitle}
                </p>
              </div>

              <div className="border-l-2 border-[#60A5FA] pl-4 sm:pl-6 py-1.5 sm:py-2 shrink-0">
                <div className="text-xs uppercase font-mono tracking-widest text-slate-300 font-bold">{t.rebalancing.gasSavingsLabel}</div>
                <div className="text-2xl sm:text-4xl lg:text-5xl font-black font-mono-nums text-white mt-1">
                  $0.00 <span className="text-xs sm:text-sm font-light text-slate-300 font-sans">USD</span>
                </div>
                <div className="text-xs font-mono text-[#60A5FA] mt-1 font-bold">{t.rebalancing.gasSavingsSub}</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Master Rebalancing Graphical Layout */}
        <ScrollReveal direction="up" delay={150}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left: Rebalancing Equalizer Graph */}
            <div className="lg:col-span-7 bg-[#0B0D14]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{t.rebalancing.simulatorTitle}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">{t.rebalancing.simulatorSubtitle}</p>
                  </div>
                  <Activity className="w-5 h-5 text-[#60A5FA]" />
                </div>

                {/* Graphical Balance Visualizer */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-2">
                      <span className="text-white font-bold">Bybit (USDT): {ratio}%</span>
                      <span className="text-[#60A5FA] font-bold">OKX (Base Asset): {100 - ratio}%</span>
                    </div>
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden flex p-0.5">
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

                  <div className="pt-4">
                    <label className="text-xs uppercase font-mono tracking-wider text-slate-300 font-bold block mb-2">
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
                    <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
                      <span>{t.rebalancing.balanced}</span>
                      <span>{t.rebalancing.thresholdAlert}</span>
                      <span>{t.rebalancing.critical}</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Algorithm Action Note */}
                <div className="mt-8 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${ratio > 70 ? 'bg-rose-400 animate-ping' : 'bg-[#10B981]'}`} />
                    <span>{ratio > 70 ? t.rebalancing.deviationDetected : t.rebalancing.inOptimalRange}</span>
                  </div>
                  <p className="text-xs text-slate-200 mt-2 leading-relaxed font-light">
                    {ratio > 70 
                      ? t.rebalancing.deviationText(((ratio - 50) * 200).toFixed(0))
                      : t.rebalancing.optimalText}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono">{t.rebalancing.directionalRisk}</span>
                <span className="font-mono text-[#60A5FA] font-bold">{t.rebalancing.deltaNeutral}</span>
              </div>
            </div>

            {/* Right: Security & Architecture Specs */}
            <div className="lg:col-span-5 bg-[#0B0D14]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{t.rebalancing.securityTitle}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">{t.rebalancing.securitySubtitle}</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#60A5FA]" />
                </div>

                <div className="space-y-6">
                  <div className="border-l-2 border-[#FBBF24] pl-5">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#FBBF24] font-bold">
                      {t.rebalancing.sec1Title}
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed font-light">
                      {t.rebalancing.sec1Desc}
                    </p>
                  </div>

                  <div className="border-l-2 border-[#60A5FA] pl-5">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#60A5FA] font-bold">
                      {t.rebalancing.sec2Title}
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed font-light">
                      {t.rebalancing.sec2Desc}
                    </p>
                  </div>

                  <div className="border-l-2 border-[#F472B6] pl-5">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#F472B6] font-bold">
                      {t.rebalancing.sec3Title}
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed font-light">
                      {t.rebalancing.sec3Desc}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono text-[#10B981] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.rebalancing.auditVerified}</span>
                </div>
              </div>
            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
