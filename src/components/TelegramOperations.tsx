import React, { useState } from 'react';
import { 
  Bot, 
  Bell, 
  Zap, 
  Lock,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useLanguage } from '../context/LanguageContext';

export const TelegramOperations: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeCommand, setActiveCommand] = useState<string>('/portfolio');

  return (
    <section id="telegram-ops" className="min-h-screen w-full flex flex-col justify-center py-24 bg-[#07080D] relative select-none">
      {/* Background Subtle Gradient Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_70%_50%,rgba(96,165,250,0.08),transparent_70%)] pointer-events-none" />

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 max-w-[1440px] mx-auto relative z-10">
        
        {/* Section Header: Clean, No Noise */}
        <ScrollReveal direction="up" delay={50}>
          <div className="mb-10 sm:mb-16">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
              <div>
                <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] sm:leading-[1.05] text-balance text-shadow-hero">
                  {t.telegram.titleStart}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] via-[#818CF8] to-[#F472B6]">
                    {t.telegram.titleEnd}
                  </span>
                </h2>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-xl text-slate-200 max-w-3xl font-light leading-relaxed text-shadow-subtle text-illuminate">
                  {t.telegram.subtitle}
                </p>
              </div>

              <div className="border-l-2 border-[#60A5FA] pl-4 sm:pl-6 py-1.5 sm:py-2 shrink-0">
                <div className="text-xs uppercase font-mono tracking-widest text-slate-300 font-bold">{t.telegram.webhookLatency}</div>
                <div className="text-2xl sm:text-4xl lg:text-5xl font-black font-mono-nums text-white mt-1">
                  &lt; 180 <span className="text-xs sm:text-sm font-light text-slate-300 font-sans">ms</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Master Telegram Layout */}
        <ScrollReveal direction="up" delay={150}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* Left: Capability Breakdown */}
            <div className="lg:col-span-6 bg-[#0B0D14]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{t.telegram.protocolTitle}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">{t.telegram.protocolSubtitle}</p>
                  </div>
                  <Bot className="w-5 h-5 text-[#60A5FA]" />
                </div>

                <div className="space-y-6">
                  <div className="border-l-2 border-[#60A5FA] pl-5">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#60A5FA] font-bold flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5" />
                      <span>{t.telegram.f1Title}</span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed font-light">
                      {t.telegram.f1Desc}
                    </p>
                  </div>

                  <div className="border-l-2 border-rose-500 pl-5">
                    <div className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{t.telegram.f2Title}</span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed font-light">
                      {t.telegram.f2Desc}
                    </p>
                  </div>

                  <div className="border-l-2 border-[#FBBF24] pl-5">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#FBBF24] font-bold flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t.telegram.f3Title}</span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed font-light">
                      {t.telegram.f3Desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Command Selector */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <span className="text-xs font-mono text-slate-300 uppercase tracking-wider block mb-3 font-semibold">
                  {t.telegram.selectCommand}
                </span>
                <div className="flex flex-wrap gap-2.5 font-mono text-xs">
                  {['/portfolio', '/arbitrage_radar', '/panic_close_all'].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => setActiveCommand(cmd)}
                      className={`btn-liquid px-4 py-2 rounded-xl border transition-all cursor-pointer font-bold ${
                        activeCommand === cmd
                          ? 'bg-[#60A5FA]/25 border-[#60A5FA] text-white shadow-[0_0_15px_rgba(96,165,250,0.3)]'
                          : 'border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Telegram Chat Simulator */}
            <div className="lg:col-span-6 bg-[#0B0D14]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl flex flex-col justify-between">
              <div>
                {/* Telegram Phone Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#60A5FA] to-[#0284C7] flex items-center justify-center text-white shadow-md font-bold">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Global City Bot @GC_MasterBot</div>
                      <div className="text-[11px] font-mono text-[#10B981] font-semibold">{t.telegram.botVerified}</div>
                    </div>
                  </div>
                  <Smartphone className="w-5 h-5 text-slate-400" />
                </div>

                {/* Chat Dialogue */}
                <div className="space-y-4 font-mono text-xs">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-[#0284C7] text-white px-4 py-2.5 rounded-2xl rounded-tr-none max-w-xs shadow-md">
                      <span>{activeCommand}</span>
                      <span className="block text-[9px] text-white/70 text-right mt-1">14:38 ✓✓</span>
                    </div>
                  </div>

                  {/* Bot Response according to command */}
                  <div className="flex justify-start">
                    <div className="bg-white/[0.04] border border-white/10 text-slate-200 p-4 rounded-2xl rounded-tl-none max-w-md shadow-lg space-y-2">
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
                          <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">
                            {language === 'en' ? 'Payload generated in 42ms via Protobuf.' : 'Respuesta generada en 42ms vía Protobuf.'}
                          </div>
                        </>
                      )}

                      {activeCommand === '/arbitrage_radar' && (
                        <>
                          <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                            <span>{language === 'en' ? '⚡ SYNTHETIC ARBITRAGE RADAR L2' : '⚡ RADAR DE ARBITRAJE SINTÉTICO L2'}</span>
                          </div>
                          <div className="text-slate-200 text-[11px] leading-relaxed">
                            • {language === 'en' ? 'Opportunity Identified' : 'Oportunidad Detectada'}: <strong className="text-[#FBBF24]">BTC/USDT</strong><br/>
                            • {language === 'en' ? 'Buy Bybit' : 'Compra Bybit'}: $84,310.20<br/>
                            • {language === 'en' ? 'Sell OKX' : 'Venta OKX'}: $84,380.00<br/>
                            • {language === 'en' ? 'Net Spread' : 'Spread Neto Real'}: <span className="text-[#10B981] font-bold">+0.083%</span> ($12.45 USDT)<br/>
                            • {language === 'en' ? 'Status: Ready for sub-100ms concurrent dispatch.' : 'Estado: Listo para despacho concurrente sub-100ms.'}
                          </div>
                        </>
                      )}

                      {activeCommand === '/panic_close_all' && (
                        <>
                          <div className="font-bold text-rose-400 flex items-center gap-1.5 text-xs">
                            <span>{language === 'en' ? '🚨 EMERGENCY MARKET CLOSURE PROTOCOL' : '🚨 PROTOCOLO DE CIERRE DE EMERGENCIA'}</span>
                          </div>
                          <div className="text-slate-200 text-[11px] leading-relaxed">
                            {language === 'en' 
                              ? 'Confirm market liquidation of 12 open positions across Bybit, OKX, and cTrader?'
                              : '¿Confirmas el cierre a mercado de las 12 posiciones abiertas en Bybit, OKX y cTrader?'}
                            <br/>
                            <span className="text-slate-400 text-[10px] block mt-1">
                              {language === 'en' ? 'Requires 2FA biometric confirmation on terminal.' : 'Requiere confirmación 2FA biométrica en terminal.'}
                            </span>
                          </div>
                          <div className="pt-2 flex gap-2">
                            <button className="btn-liquid px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-[10px] cursor-pointer">
                              {t.telegram.confirmEmergencyBtn}
                            </button>
                            <button className="btn-liquid px-3 py-1.5 rounded-lg bg-white/10 text-slate-200 text-[10px] cursor-pointer">
                              {t.telegram.cancelBtn}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono">{t.telegram.tlsNotice}</span>
                <div className="flex items-center gap-1.5 text-[#10B981] font-mono font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.telegram.nodeOperative}</span>
                </div>
              </div>
            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
