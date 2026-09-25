import React from 'react';
import { 
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useLanguage } from '../context/LanguageContext';

export const CrossCopyTrading: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="copy-trading" className="min-h-screen w-full flex flex-col justify-center py-24 bg-[#05060A] relative select-none">
      {/* Background Subtle Gradient Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(244,114,182,0.08),transparent_60%)] pointer-events-none" />

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 max-w-[1440px] mx-auto relative z-10">
        
        {/* Section Header: Clean, No Noise */}
        <ScrollReveal direction="up" delay={50}>
          <div className="mb-10 sm:mb-16">
            <div className="max-w-4xl">
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] sm:leading-[1.05] text-balance text-shadow-hero">
                {t.copyTrading.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#60A5FA]">
                  {t.copyTrading.titleEnd}
                </span>
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-xl text-slate-200 max-w-3xl font-light leading-relaxed text-shadow-subtle text-illuminate">
                {t.copyTrading.subtitle}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Master Pipeline Flow */}
        <ScrollReveal direction="up" delay={150}>
          <div className="bg-[#090B12]/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/15 shadow-2xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative">
              
              {/* Stage 1: Master Signal Source */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between h-full">
                <div>
                  <div className="text-xs font-mono uppercase text-[#60A5FA] font-bold tracking-wider mb-2">
                    {t.copyTrading.step1Tag}
                  </div>
                  <h4 className="text-xl font-bold text-white tracking-tight">{t.copyTrading.step1Title}</h4>
                  <p className="text-xs text-slate-200 mt-2 font-light leading-relaxed">
                    {t.copyTrading.step1Desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Bybit Perpetual</span>
                  <span className="text-[#10B981] font-bold">+2.50 BTC / Long</span>
                </div>
              </div>

              {/* Stage 2: Core Normalization Engine */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#FBBF24]/15 to-[#F472B6]/15 border border-[#F472B6]/40 flex flex-col justify-between h-full shadow-[0_0_35px_rgba(244,114,182,0.2)] relative">
                <div>
                  <div className="text-xs font-mono uppercase text-[#FBBF24] font-bold tracking-wider mb-2 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{t.copyTrading.step2Tag}</span>
                  </div>
                  <h4 className="text-xl font-bold text-white tracking-tight">{t.copyTrading.step2Title}</h4>
                  <p className="text-xs text-slate-100 mt-2 font-light leading-relaxed">
                    {t.copyTrading.step2Desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-200">{t.copyTrading.step2ComputeTime}</span>
                  <span className="text-[#FBBF24] font-bold">1.2 ms</span>
                </div>
              </div>

              {/* Stage 3: Multi-Broker Concurrent Execution */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between h-full">
                <div>
                  <div className="text-xs font-mono uppercase text-[#F472B6] font-bold tracking-wider mb-2">
                    {t.copyTrading.step3Tag}
                  </div>
                  <h4 className="text-xl font-bold text-white tracking-tight">{t.copyTrading.step3Title}</h4>
                  <p className="text-xs text-slate-200 mt-2 font-light leading-relaxed">
                    {t.copyTrading.step3Desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-300">cTrader (Open API):</span>
                    <span className="text-[#10B981] font-bold">+25.0 Lots</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">MetaTrader 5 (Gateway):</span>
                    <span className="text-[#10B981] font-bold">+25.0 Lots</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Security Guarantee */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>{t.copyTrading.stopLossGuarantee}</span>
              </div>
              <span className="font-mono text-slate-300">{t.copyTrading.leverageAudit}</span>
            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
