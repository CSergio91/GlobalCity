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
    <section id="telegram" className="w-full py-20 sm:py-28 bg-[#06070B] relative select-none overflow-hidden">
      {/* Background Ambient Radial Lighting */}
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[350px] bg-gradient-to-b from-[#0088CC]/10 via-transparent to-transparent blur-[140px] pointer-events-none" />

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
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {t.telegram.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA]">
                  {t.telegram.titleEnd}
                </span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm lg:text-base text-slate-300 font-light leading-relaxed">
                {t.telegram.subtitle}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border-t border-white/10 backdrop-blur-xl shrink-0">
              <div className="text-[11px] uppercase font-mono tracking-wider text-slate-400 font-bold">{t.telegram.webhookLatency}</div>
              <div className="text-xl sm:text-3xl font-black font-mono-nums text-white mt-1">
                &lt; 180 <span className="text-xs font-normal text-slate-400 font-sans">ms</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Master Telegram Layout: Borderless Glass */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Left: Capability Breakdown */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 rounded-3xl p-5 sm:p-8 bg-white/[0.02] border-t border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{t.telegram.protocolTitle}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.telegram.protocolSubtitle}</p>
                </div>
                <Bot className="w-5 h-5 text-[#38BDF8]" />
              </div>

              <div className="space-y-4">
                <div className="border-l-2 border-[#38BDF8] pl-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-bold flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5" />
                    <span>{t.telegram.f1Title}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                    {t.telegram.f1Desc}
                  </p>
                </div>

                <div className="border-l-2 border-rose-500 pl-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{t.telegram.f2Title}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                    {t.telegram.f2Desc}
                  </p>
                </div>

                <div className="border-l-2 border-[#FBBF24] pl-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#FBBF24] font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t.telegram.f3Title}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                    {t.telegram.f3Desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Command Selector */}
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                {t.telegram.testBotCommands}
              </span>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                {['/portfolio', '/arbitrage_radar', '/emergency_freeze'].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => setActiveCommand(cmd)}
                    className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-bold text-xs ${
                      activeCommand === cmd
                        ? 'bg-[#0088CC] text-white shadow-md'
                        : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Telegram Chat Simulator */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 rounded-3xl p-5 sm:p-8 bg-white/[0.02] border-t border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col justify-between"
          >
            <div>
              {/* Telegram Phone Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#38BDF8] to-[#0088CC] flex items-center justify-center text-white shadow-md font-bold">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">Global City Bot @globalcity_auth_bot</div>
                    <div className="text-[10px] font-mono text-[#10B981] font-semibold">{t.telegram.botVerified}</div>
                  </div>
                </div>
                <Smartphone className="w-4 h-4 text-slate-400" />
              </div>

              {/* Chat Dialogue: Clean and responsive */}
              <div className="space-y-3 font-mono text-xs">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-[#0088CC] text-white px-3.5 py-2 rounded-2xl rounded-tr-none max-w-xs shadow-md">
                    <span>{activeCommand}</span>
                    <span className="block text-[9px] text-white/70 text-right mt-0.5">14:38 ✓✓</span>
                  </div>
                </div>

                {/* Bot Response according to command */}
                <div className="flex justify-start">
                  <div className="bg-white/[0.03] text-slate-200 p-3.5 rounded-2xl rounded-tl-none max-w-md shadow-lg space-y-1.5">
                    {activeCommand === '/portfolio' && (
                      <>
                        <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                          <span>{language === 'en' ? '📊 GLOBAL CITY · CONSOLIDATED STATE' : '📊 GLOBAL CITY · ESTADO CONSOLIDADO'}</span>
                        </div>
                        <div className="text-slate-200 text-[11px] leading-relaxed">
                          • {language === 'en' ? 'Total Equity' : 'Equidad Total'}: <strong className="text-white font-bold">$146,820.00 USD</strong><br/>
                          • Bybit v5: $42,500 (USDT / BTC)<br/>
                          • OKX DMA: $38,400 (USDT / ETH)<br/>
                          • cTrader: $35,920 (Forex EUR/USD)<br/>
                          • MT5 Gateway: $30,000 (CME Futures)<br/>
                          • {language === 'en' ? '24h Floating PnL' : 'PnL Flotante 24h'}: <span className="text-[#10B981] font-bold">+$2,410.80 (+1.67%)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-white/[0.06]">
                          {language === 'en' ? 'Payload generated in 42ms via Protobuf.' : 'Respuesta generada en 42ms vía Protobuf.'}
                        </div>
                      </>
                    )}

                    {activeCommand === '/arbitrage_radar' && (
                      <>
                        <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                          <span>{language === 'en' ? '⚡ CROSS-VENUE ARBITRAGE RADAR L2' : '⚡ RADAR DE ARBITRAJE CROSS-VENUE L2'}</span>
                        </div>
                        <div className="text-slate-200 text-[11px] leading-relaxed">
                          • {language === 'en' ? 'Opportunity Identified' : 'Oportunidad Detectada'}: <strong className="text-[#FBBF24]">BTC/USDT</strong><br/>
                          • {language === 'en' ? 'Buy Bybit' : 'Compra Bybit'}: ${Number(bybitBuy).toLocaleString()}<br/>
                          • {language === 'en' ? 'Sell OKX' : 'Venta OKX'}: ${Number(okxSell).toLocaleString()}<br/>
                          • {language === 'en' ? 'Net Spread' : 'Spread Neto Real'}: <span className="text-[#10B981] font-bold">+{spreadPct}%</span> (+${spreadUsdt} USDT)<br/>
                          • {language === 'en' ? 'Status: Ready for sub-100ms concurrent dispatch.' : 'Estado: Listo para despacho concurrente sub-100ms.'}
                        </div>
                      </>
                    )}

                    {activeCommand === '/emergency_freeze' && (
                      <>
                        <div className="font-bold text-rose-400 flex items-center gap-1.5 text-xs">
                          <span>{language === 'en' ? '🛑 GLOBAL KILL-SWITCH ARMED' : '🛑 KILL-SWITCH GLOBAL ARMADO'}</span>
                        </div>
                        <div className="text-slate-200 text-[11px] leading-relaxed">
                          • {language === 'en' ? 'Venues Targets' : 'Venues Destino'}: Bybit, OKX, cTrader, MT5<br/>
                          • {language === 'en' ? 'Action' : 'Acción'}: Cancel-All resting orders & Flatten<br/>
                          • {language === 'en' ? 'Requires' : 'Requiere'}: Biometric confirmation in private chat<br/>
                          • <span className="text-[#FBBF24] font-bold">{language === 'en' ? 'Reply CONFIRM to execute immediately.' : 'Responde CONFIRMAR para ejecutar.'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <a 
                href="https://t.me/globalcity_auth_bot" 
                target="_blank" 
                rel="noreferrer" 
                className="w-full py-3 rounded-full bg-[#0088CC] hover:bg-[#0077b3] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
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
