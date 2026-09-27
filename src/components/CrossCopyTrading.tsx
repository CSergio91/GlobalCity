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
    <section id="copy-trading" className="w-full py-20 sm:py-28 bg-[#090A12] border-t border-white/10 relative select-none overflow-hidden">
      {/* Cinematic Parallax Execution Node Backdrop (Vivid & Clear) */}
      <ParallaxBackground 
        imageSrc={propFirmExecutionVisual} 
        alt="Prop Firm Execution Node Backdrop" 
        opacity={0.32}
        speed={0.14}
      />

      {/* Background Radial Glow */}
      <div className="absolute top-1/2 right-1/3 w-[600px] h-[350px] bg-gradient-to-b from-[#7C3AED]/20 via-transparent to-transparent blur-[140px] pointer-events-none" />

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-400/40 text-[11px] font-mono font-bold text-purple-300 tracking-wider uppercase mb-3 shadow-[0_0_15px_rgba(124,58,237,0.25)]">
              <span>[ 06 // HERRAMIENTA INTERNA ]</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>COPIA A EXCHANGES VÍA API</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {t.copyTrading.titleStart}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300">
                {t.copyTrading.titleEnd}
              </span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm lg:text-base text-slate-300 font-normal leading-relaxed">
              {t.copyTrading.subtitle}
            </p>
          </div>
        </motion.div>

        {/* Master Pipeline Flow: Retro-Brutalist Dark Glass Console */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-6 sm:p-10 bg-slate-950/75 border-2 border-white/15 backdrop-blur-2xl shadow-[8px_8px_0px_rgba(124,58,237,0.3),0_25px_60px_rgba(0,0,0,0.6)]"
        >
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch relative">
            
            {/* Stage 1: Master Signal Source */}
            <div className="p-5 sm:p-7 rounded-xl bg-slate-900/70 border border-white/15 shadow-[3px_3px_0px_#090A10] flex flex-col justify-between h-full">
              <div>
                <div className="text-[11px] font-mono uppercase text-purple-400 font-bold tracking-wider mb-2">
                  [ {t.copyTrading.step1Tag} ]
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">{t.copyTrading.step1Title}</h4>
                <p className="text-xs text-slate-300 mt-2 font-normal leading-relaxed">
                  {t.copyTrading.step1Desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Terminal Global City</span>
                <span className="text-emerald-400 font-bold">+2.50 BTC / Long</span>
              </div>
            </div>

            {/* Stage 2: Core Normalization Engine */}
            <div className="p-5 sm:p-7 rounded-xl bg-slate-900/90 border-l-4 border-[#7C3AED] border border-purple-400/40 shadow-[4px_4px_0px_#090A10] flex flex-col justify-between h-full relative">
              <div>
                <div className="text-[11px] font-mono uppercase text-purple-300 font-bold tracking-wider mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>[ {t.copyTrading.step2Tag} ]</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">{t.copyTrading.step2Title}</h4>
                <p className="text-xs text-slate-300 mt-2 font-normal leading-relaxed">
                  {t.copyTrading.step2Desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">{t.copyTrading.step2ComputeTime}</span>
                <span className="text-purple-300 font-bold">1.2 ms</span>
              </div>
            </div>

            {/* Stage 3: Multi-Broker Concurrent Execution */}
            <div className="p-5 sm:p-7 rounded-xl bg-slate-900/70 border border-white/15 shadow-[3px_3px_0px_#090A10] flex flex-col justify-between h-full">
              <div>
                <div className="text-[11px] font-mono uppercase text-purple-400 font-bold tracking-wider mb-2">
                  [ {t.copyTrading.step3Tag} ]
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">{t.copyTrading.step3Title}</h4>
                <p className="text-xs text-slate-300 mt-2 font-normal leading-relaxed">
                  {t.copyTrading.step3Desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Binance DMA (API v3):</span>
                  <span className="text-emerald-400 font-bold">+2.50 BTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bybit v5 Direct:</span>
                  <span className="text-emerald-400 font-bold">+2.50 BTC</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Security Guarantee */}
          <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.copyTrading.stopLossGuarantee}</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-purple-300 hover:text-white font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
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
