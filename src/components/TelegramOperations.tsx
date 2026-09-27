import React, { useState } from 'react';
import { 
  Bot, 
  Bell, 
  Zap, 
  Lock,
  Smartphone,
  CheckCircle2,
  Send,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';
import { useLiveMarketTicks } from '../services/liveMarketFeed';
import { ParallaxBackground } from './ParallaxBackground';
import globalCityHeroVisual from '../assets/images/global_city_hero_visual_1790346360975.jpg';

export const TelegramOperations: React.FC = () => {
  const { t, language } = useLanguage();
  const { navigate } = useAppRouter();
  const { ticks } = useLiveMarketTicks();
  const [activeCommand, setActiveCommand] = useState<string>('/portfolio');

  const btcTick = ticks.find(t => t.symbol === 'BTC/USDT');
  const btcPrice = btcTick ? btcTick.price : 84310.20;
  const bybitBuy = (btcPrice * 0.9993).toFixed(2);
  const okxSell = (btcPrice * 1.0007).toFixed(2);
  const spreadUsdt = (parseFloat(okxSell) - parseFloat(bybitBuy)).toFixed(2);
  const spreadPct = (((parseFloat(okxSell) - parseFloat(bybitBuy)) / parseFloat(bybitBuy)) * 100).toFixed(3);

  return (
    <section id="telegram" className="w-full py-20 sm:py-28 bg-[#F1F3FA] border-t-2 border-slate-900/10 relative select-none overflow-hidden">
      {/* Cinematic Parallax Global City Command Skyline Backdrop (Vivid & Clear) */}
      <ParallaxBackground 
        imageSrc={globalCityHeroVisual} 
        alt="Global City Cyberpunk Skyline Backdrop" 
        opacity={0.30}
        speed={0.14}
      />

      {/* Background Ambient Radial Lighting */}
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[350px] bg-gradient-to-b from-[#7C3AED]/15 via-transparent to-transparent blur-[140px] pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-20 max-w-[1360px] mx-auto relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 sm:mb-14"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-50 border border-purple-300 text-[11px] font-mono font-bold text-[#6D28D9] tracking-wider uppercase mb-3 shadow-[2px_2px_0px_#090A10]">
                <span>[ 07 // HERRAMIENTA INTERNA ]</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                <span>TELEGRAM BOT AUTOMATION</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#090A10] tracking-tight leading-tight">
                {t.telegram.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1]">
                  {t.telegram.titleEnd}
                </span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm lg:text-base text-slate-700 font-normal leading-relaxed">
                {t.telegram.subtitle}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border-2 border-slate-900/15 backdrop-blur-xl shadow-[4px_4px_0px_#090A10] shrink-0">
              <div className="text-[11px] uppercase font-mono tracking-wider text-slate-600 font-bold">{t.telegram.webhookLatency}</div>
              <div className="text-xl sm:text-3xl font-black font-mono text-[#090A10] mt-1">
                &lt; 180 <span className="text-xs font-normal text-slate-500 font-sans">ms</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Master Telegram Layout: Retro-Brutalist Light Glass + Dark Screen Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Left: Capability Breakdown */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 rounded-2xl p-5 sm:p-8 bg-white/90 border-2 border-slate-900/15 backdrop-blur-2xl shadow-[8px_8px_0px_#090A10,0_20px_40px_rgba(0,0,0,0.06)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b-2 border-slate-900/10 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-[#090A10] tracking-tight flex items-center gap-2">
                    <span className="text-purple-600 font-mono text-xs">[ BOT DMA ]</span>
                    <span>{t.telegram.protocolTitle}</span>
                  </h3>
                  <p className="text-[11px] text-slate-600 font-mono mt-0.5">{t.telegram.protocolSubtitle}</p>
                </div>
                <Bot className="w-5 h-5 text-[#7C3AED]" />
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-[#7C3AED] pl-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#7C3AED] font-bold flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5" />
                    <span>{t.telegram.f1Title}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed font-normal">
                    {t.telegram.f1Desc}
                  </p>
                </div>

                <div className="border-l-4 border-rose-500 pl-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-rose-600 font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{t.telegram.f2Title}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed font-normal">
                    {t.telegram.f2Desc}
                  </p>
                </div>

                <div className="border-l-4 border-purple-400 pl-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-purple-600 font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t.telegram.f3Title}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed font-normal">
                    {t.telegram.f3Desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Command Selector */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <span className="text-[11px] font-mono text-slate-600 uppercase tracking-wider block mb-2 font-bold">
                {t.telegram.selectCommand}
              </span>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                {['/portfolio', '/arbitrage_radar', '/emergency_freeze'].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => setActiveCommand(cmd)}
                    className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer font-mono font-bold text-xs ${
                      activeCommand === cmd
                        ? 'bg-[#7C3AED] text-white shadow-[2px_2px_0px_#090A10]'
                        : 'bg-slate-100 border border-slate-300 text-slate-800 hover:text-black hover:bg-slate-200'
                    }`}
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Telegram Chat Simulator (Dark Tactile Terminal Visor) */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 rounded-2xl p-5 sm:p-8 bg-slate-950/90 border-2 border-slate-900/20 backdrop-blur-2xl shadow-[8px_8px_0px_#090A10,0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between text-white"
          >
            <div>
              {/* Telegram Phone Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white shadow-sm font-bold">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">Global City Bot @globalcity_auth_bot</div>
                    <div className="text-[10px] font-mono text-emerald-400 font-semibold">{t.telegram.botVerified}</div>
                  </div>
                </div>
                <Smartphone className="w-4 h-4 text-slate-400" />
              </div>

              {/* Chat Dialogue: Clean and responsive */}
              <div className="space-y-3 font-mono text-xs">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white px-3.5 py-2 rounded-xl rounded-tr-none max-w-xs shadow-[2px_2px_0px_#000]">
                    <span>{activeCommand}</span>
                    <span className="block text-[9px] text-white/70 text-right mt-0.5">14:38 ✓✓</span>
                  </div>
                </div>

                {/* Bot Response according to command */}
                <div className="flex justify-start">
                  <div className="bg-slate-900/90 border border-white/15 text-slate-200 p-3.5 rounded-xl rounded-tl-none max-w-md shadow-sm space-y-1.5">
                    {activeCommand === '/portfolio' && (
                      <>
                        <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                          <span>{language === 'en' ? '📊 GLOBAL CITY FUNDING · CONSOLIDATED STATE' : '📊 GLOBAL CITY FUNDING · ESTADO CONSOLIDADO'}</span>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-relaxed">
                          • {language === 'en' ? 'Evaluation Balance' : 'Cuenta Fondeada'}: <strong className="text-white font-bold">$200,000.00 USD</strong><br/>
                          • {language === 'en' ? 'Prop Engine' : 'Motor Prop'}: Global City Terminal v10<br/>
                          • Bybit v5 Mirror: $42,500 (USDT / BTC)<br/>
                          • OKX DMA Mirror: $38,400 (USDT / ETH)<br/>
                          • {language === 'en' ? 'Floating PnL' : 'PnL Flotante'}: <span className="text-emerald-400 font-bold">+$4,210.80 (+2.10%)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">
                          {language === 'en' ? 'Payload generated in 42ms via Protobuf.' : 'Respuesta generada en 42ms vía Protobuf.'}
                        </div>
                      </>
                    )}

                    {activeCommand === '/arbitrage_radar' && (
                      <>
                        <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                          <span>{language === 'en' ? '⚡ CROSS-VENUE ARBITRAGE RADAR L2' : '⚡ RADAR DE ARBITRAJE CROSS-VENUE L2'}</span>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-relaxed">
                          • {language === 'en' ? 'Opportunity Identified' : 'Oportunidad Detectada'}: <strong className="text-purple-300">BTC/USDT</strong><br/>
                          • {language === 'en' ? 'Buy Bybit' : 'Compra Bybit'}: ${Number(bybitBuy).toLocaleString()}<br/>
                          • {language === 'en' ? 'Sell OKX' : 'Venta OKX'}: ${Number(okxSell).toLocaleString()}<br/>
                          • {language === 'en' ? 'Net Spread' : 'Spread Neto Real'}: <span className="text-emerald-400 font-bold">+{spreadPct}%</span> (+${spreadUsdt} USDT)<br/>
                          • {language === 'en' ? 'Status: Ready for sub-100ms concurrent dispatch.' : 'Estado: Listo para despacho concurrente sub-100ms.'}
                        </div>
                      </>
                    )}

                    {activeCommand === '/emergency_freeze' && (
                      <>
                        <div className="font-bold text-rose-400 flex items-center gap-1.5 text-xs">
                          <span>{language === 'en' ? '🛑 GLOBAL KILL-SWITCH ARMED' : '🛑 KILL-SWITCH GLOBAL ARMADO'}</span>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-relaxed">
                          • {language === 'en' ? 'Venues Targets' : 'Venues Destino'}: Global City Terminal, Bybit, OKX<br/>
                          • {language === 'en' ? 'Action' : 'Acción'}: Cancel-All resting orders & Flatten<br/>
                          • {language === 'en' ? 'Requires' : 'Requiere'}: Biometric confirmation in private chat<br/>
                          • <span className="text-purple-300 font-bold">{language === 'en' ? 'Reply CONFIRM to execute immediately.' : 'Responde CONFIRMAR para ejecutar.'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              <a 
                href="https://t.me/globalcity_auth_bot" 
                target="_blank" 
                rel="noreferrer" 
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6366F1] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[4px_4px_0px_#090A10] hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5"
              >
                <Send className="w-4 h-4 fill-white" />
                <span>Abrir Bot en Telegram</span>
              </a>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
