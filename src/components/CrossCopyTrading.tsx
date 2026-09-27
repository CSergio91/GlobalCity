import React from 'react';
import { 
  ShieldCheck,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';
import { ParallaxBackground } from './ParallaxBackground';
import propFirmExecutionVisual from '../assets/images/prop_firm_execution_node_1790346394469.jpg';

export const CrossCopyTrading: React.FC = () => {
  const { t } = useLanguage();
  const { navigate } = useAppRouter();

  return (
    <section id="copy-trading" className="w-full py-20 sm:py-28 bg-[#F8F9FE] border-t border-purple-100 relative select-none overflow-hidden">
      {/* Cinematic Parallax Execution Node Backdrop */}
      <ParallaxBackground 
        imageSrc={propFirmExecutionVisual} 
        alt="Prop Firm Execution Node Backdrop" 
        opacity={0.12}
        speed={0.14}
      />

      {/* Background Radial Glow */}
      <div className="absolute top-1/2 right-1/3 w-[500px] h-[300px] bg-gradient-to-b from-[#7C3AED]/10 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 max-w-[1360px] mx-auto relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 sm:mb-14"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-[11px] font-mono font-bold text-[#6D28D9] tracking-wider uppercase mb-3 shadow-sm">
              <span>HERRAMIENTA INTERNA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
              <span>COPIA A EXCHANGES VÍA API</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#090A10] tracking-tight leading-tight">
              {t.copyTrading.titleStart}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1]">
                {t.copyTrading.titleEnd}
              </span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm lg:text-base text-slate-600 font-normal leading-relaxed">
              {t.copyTrading.subtitle}
            </p>
          </div>
        </motion.div>

        {/* Master Pipeline Flow: Borderless Glass Stage */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl p-6 sm:p-10 bg-white/95 border border-purple-200/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(124,58,237,0.08)]"
        >
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch relative">
            
            {/* Stage 1: Master Signal Source */}
            <div className="p-5 sm:p-7 rounded-2xl bg-purple-50/50 border border-purple-200/80 flex flex-col justify-between h-full">
              <div>
                <div className="text-[11px] font-mono uppercase text-[#6D28D9] font-bold tracking-wider mb-2">
                  {t.copyTrading.step1Tag}
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-[#090A10] tracking-tight">{t.copyTrading.step1Title}</h4>
                <p className="text-xs text-slate-600 mt-2 font-normal leading-relaxed">
                  {t.copyTrading.step1Desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-purple-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Global City Terminal</span>
                <span className="text-[#059669] font-bold">+2.50 BTC / Long</span>
              </div>
            </div>

            {/* Stage 2: Core Normalization Engine */}
            <div className="p-5 sm:p-7 rounded-2xl bg-gradient-to-b from-purple-50 to-indigo-50/40 border-l-4 border-[#7C3AED] border border-purple-200/80 flex flex-col justify-between h-full relative shadow-sm">
              <div>
                <div className="text-[11px] font-mono uppercase text-[#7C3AED] font-bold tracking-wider mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>{t.copyTrading.step2Tag}</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-[#090A10] tracking-tight">{t.copyTrading.step2Title}</h4>
                <p className="text-xs text-slate-600 mt-2 font-normal leading-relaxed">
                  {t.copyTrading.step2Desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-purple-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">{t.copyTrading.step2ComputeTime}</span>
                <span className="text-[#7C3AED] font-bold">1.2 ms</span>
              </div>
            </div>

            {/* Stage 3: Multi-Broker Concurrent Execution */}
            <div className="p-5 sm:p-7 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between h-full">
              <div>
                <div className="text-[11px] font-mono uppercase text-[#6D28D9] font-bold tracking-wider mb-2">
                  {t.copyTrading.step3Tag}
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-[#090A10] tracking-tight">{t.copyTrading.step3Title}</h4>
                <p className="text-xs text-slate-600 mt-2 font-normal leading-relaxed">
                  {t.copyTrading.step3Desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/80 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Binance DMA (API v3):</span>
                  <span className="text-[#059669] font-bold">+2.50 BTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bybit v5 Direct:</span>
                  <span className="text-[#059669] font-bold">+2.50 BTC</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Security Guarantee */}
          <div className="mt-8 pt-5 border-t border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#059669]" />
              <span>{t.copyTrading.stopLossGuarantee}</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-[#7C3AED] hover:text-[#5B21B6] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{t.copyTrading.leverageAudit}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </motion.div>

      </div>
    </section>
  );
};
