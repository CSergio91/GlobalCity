import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  ShieldCheck, 
  Bell, 
  Zap, 
  Lock,
  Smartphone,
  CheckCircle2
} from 'lucide-react';

export const TelegramOperations: React.FC = () => {
  const [activeCommand, setActiveCommand] = useState<string>('/portfolio');

  return (
    <section id="telegram-ops" className="min-h-screen w-full flex flex-col justify-center py-24 bg-[#07080D] relative select-none">
      {/* Background Subtle Gradient Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_70%_50%,rgba(56,189,248,0.06),transparent_70%)] pointer-events-none" />

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 max-w-[1440px] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-mono text-[#38BDF8] mb-3">
            <span className="w-6 h-[1.5px] bg-[#38BDF8]" />
            <span>CENTRO DE MANDO REMOTO</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] text-balance">
                Comanda tu Imperio Financiero desde{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#D4AF37]">
                  Telegram.
                </span>
              </h2>
              <p className="mt-4 text-base sm:text-xl text-slate-300 max-w-3xl font-light leading-relaxed">
                Sin necesidad de mantener abiertas 5 pestañas de brokers. Recibe telemetría instantánea de Fills, alertas de arbitraje y ejecuta el botón de pánico global directamente desde tu móvil con cifrado de grado militar.
              </p>
            </div>

            <div className="border-l-2 border-[#38BDF8] pl-6 py-2 shrink-0">
              <div className="text-xs uppercase font-mono tracking-widest text-slate-400">Latencia Webhook Telegram</div>
              <div className="text-3xl sm:text-5xl font-black font-mono-nums text-white mt-1">
                &lt; 180 <span className="text-sm font-light text-slate-400 font-sans">ms</span>
              </div>
              <div className="text-xs font-mono text-[#38BDF8] mt-1">CIFRADO HMAC-SHA256</div>
            </div>
          </div>
        </div>

        {/* Master Telegram Layout: Two Architectural Columns (No generic cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left: Capability Breakdown with Hairline Lines */}
          <div className="lg:col-span-6 bg-[#0B0D14]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Protocolo de Notificaciones y Ejecución</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Enlace punto a punto con tu servidor personal</p>
                </div>
                <Bot className="w-5 h-5 text-[#38BDF8]" />
              </div>

              <div className="space-y-6">
                <div className="border-l-2 border-[#38BDF8] pl-5">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-bold flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Telemetría en Vivo de Órdenes y Fills</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                    Notificación push en menos de 50ms al completarse una orden de Bybit, OKX, cTrader o MT5, con desglose de precio ejecutado y comisiones.
                  </p>
                </div>

                <div className="border-l-2 border-rose-500 pl-5">
                  <div className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Panic Switch Global (/panic_close_all)</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                    Cancela todas las órdenes activas y liquida posiciones a mercado en todas las sedes conectadas en caso de eventos macroeconómicos adversos.
                  </p>
                </div>

                <div className="border-l-2 border-[#D4AF37] pl-5">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-bold flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Whitelist Estricta y Autenticación 2FA</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                    El bot solo acepta comandos procedentes de tu Telegram ID verificado, requiriendo confirmación biométrica antes de disparar ejecuciones de emergencia.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Command Selector */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">
                Selecciona comando para probar en simulador:
              </span>
              <div className="flex flex-wrap gap-2.5 font-mono text-xs">
                {['/portfolio', '/arbitrage_radar', '/panic_close_all'].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => setActiveCommand(cmd)}
                    className={`px-3.5 py-2 rounded-xl border transition-all cursor-pointer font-bold ${
                      activeCommand === cmd
                        ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-white shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                        : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Telegram Chat Simulator */}
          <div className="lg:col-span-6 bg-[#0B0D14]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Telegram Phone Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-white shadow-md font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Global City Bot @GC_MasterBot</div>
                    <div className="text-[11px] font-mono text-[#10B981]">bot verificado · en línea</div>
                  </div>
                </div>
                <Smartphone className="w-5 h-5 text-slate-500" />
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
                          <span>📊 GLOBAL CITY · ESTADO CONSOLIDADO</span>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-relaxed">
                          • Equidad Total: <strong className="text-white">$146,820.00 USD</strong><br/>
                          • Bybit v5: $42,500 (USDT / BTC)<br/>
                          • OKX DMA: $38,400 (USDT / ETH)<br/>
                          • cTrader: $35,920 (Forex EUR/USD)<br/>
                          • MT5 Gateway: $30,000 (Futuros CME)<br/>
                          • PnL Flotante 24h: <span className="text-[#10B981]">+$2,410.80 (+1.67%)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">
                          Respuesta generada en 42ms vía Protobuf.
                        </div>
                      </>
                    )}

                    {activeCommand === '/arbitrage_radar' && (
                      <>
                        <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                          <span>⚡ RADAR DE ARBITRAJE SINTÉTICO L2</span>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-relaxed">
                          • Oportunidad Detectada: <strong className="text-[#D4AF37]">BTC/USDT</strong><br/>
                          • Compra Bybit: $84,310.20<br/>
                          • Venta OKX: $84,380.00<br/>
                          • Spread Neto Real: <span className="text-[#10B981] font-bold">+0.083%</span> ($12.45 USDT)<br/>
                          • Estado: Listo para despacho concurrente sub-100ms.
                        </div>
                      </>
                    )}

                    {activeCommand === '/panic_close_all' && (
                      <>
                        <div className="font-bold text-rose-400 flex items-center gap-1.5 text-xs">
                          <span>🚨 PROTOCOLO DE CIERRE DE EMERGENCIA</span>
                        </div>
                        <div className="text-slate-200 text-[11px] leading-relaxed">
                          ¿Confirmas el cierre a mercado de las <strong className="text-white">12 posiciones abiertas</strong> en Bybit, OKX y cTrader?<br/>
                          <span className="text-slate-400 text-[10px] block mt-1">Requiere confirmación 2FA biométrica en terminal.</span>
                        </div>
                        <div className="pt-2 flex gap-2">
                          <button className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-[10px]">
                            CONFIRMAR CIERRE TOTAL
                          </button>
                          <button className="px-3 py-1.5 rounded-lg bg-white/10 text-slate-300 text-[10px]">
                            Cancelar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Enlace cifrado TLS 1.3</span>
              <div className="flex items-center gap-1.5 text-[#10B981] font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NODO 100% OPERATIVO</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
