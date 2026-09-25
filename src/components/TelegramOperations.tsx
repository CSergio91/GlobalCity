import React from 'react';
import { 
  Bot, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Bell, 
  Zap, 
  Terminal,
  Smartphone,
  Lock
} from 'lucide-react';

export const TelegramOperations: React.FC = () => {
  return (
    <section className="py-24 bg-[#0A0C12] border-t border-white/[0.08] relative overflow-hidden">
      <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Explanatory Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2DD4BF]">
              <Bot className="w-4 h-4 text-[#2DD4BF]" />
              <span>Control Móvil Descentralizado</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Control Total de tu Portafolio a través de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2DD4BF] to-[#38BDF8]">Telegram</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              No necesitas estar frente a la pantalla 24/7. Nuestro bot institucional en Telegram se enlaza de forma encriptada a tu nodo de Global City, permitiéndote recibir telemetría, alertas de riesgo y ejecutar órdenes tácticas al instante.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 glass-panel p-4 rounded-2xl border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF] shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Alertas Push de Fills y Liquidación</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Notificación instantánea en menos de 50ms cuando una orden de Bybit, OKX, cTrader o MT5 es ejecutada.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 glass-panel p-4 rounded-2xl border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-[#E06D8A]/10 flex items-center justify-center text-[#E06D8A] shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Comandos de Emergencia (Kill Switch)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Envía <code className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded font-mono-nums">/panic_close_all</code> para cerrar de golpe todas tus posiciones en todos los exchanges ante noticias inesperadas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 glass-panel p-4 rounded-2xl border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Autenticación Biométrica y Whitelist de ID</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    El bot solo acepta instrucciones de tu ID único de Telegram verificado con firma de clave pública y token rotativo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Telegram Interactive Simulation Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-[#11141E] border border-white/15 rounded-3xl p-6 shadow-2xl relative">
              
              {/* Phone Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2DD4BF] to-[#0284C7] flex items-center justify-center text-slate-950 font-extrabold text-sm">
                    GC
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Global City Master Bot</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono-nums">bot en línea · webhook v2.0</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono-nums text-slate-400">Canal Seguro 2FA</div>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3.5 text-xs font-sans">
                
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-[#E06D8A] text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow">
                    /portfolio_status
                  </div>
                </div>

                {/* Bot Response */}
                <div className="flex justify-start">
                  <div className="bg-[#181B28] border border-white/10 text-slate-200 p-4 rounded-2xl rounded-tl-sm max-w-[90%] space-y-2 shadow-lg font-mono-nums">
                    <div className="text-white font-bold font-sans text-xs flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span>📊 REPORTE CONSOLIDADO GLOBAL</span>
                      <span className="text-[10px] text-[#2DD4BF]">hace 2s</span>
                    </div>
                    <div className="text-xs">
                      Equidad Total: <strong className="text-white">$118,900.00 USD</strong>
                    </div>
                    <div className="text-[11px] text-emerald-400">
                      PnL Hoy: +$1,420.30 (+1.21%) 🟢
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1 space-y-0.5">
                      <div>• Bybit v5: $42,500 (2 Posiciones)</div>
                      <div>• OKX DMA: $31,200 (1 Posición)</div>
                      <div>• cTrader FX: $25,000 (EURUSD Long)</div>
                      <div>• MT5 Gateway: $19,800 (Oro XAU)</div>
                    </div>
                  </div>
                </div>

                {/* User Action */}
                <div className="flex justify-end">
                  <div className="bg-[#E06D8A] text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow">
                    /rebalance_check
                  </div>
                </div>

                {/* Bot Response */}
                <div className="flex justify-start">
                  <div className="bg-[#181B28] border border-white/10 text-slate-200 p-3.5 rounded-2xl rounded-tl-sm max-w-[90%] space-y-1.5 shadow-lg font-mono-nums">
                    <div className="text-emerald-400 text-xs font-bold">
                      ⚖️ INVENTARIO PERFECTAMENTE EQUILIBRADO
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Ratio Bybit/OKX: 52% / 48%. No se requiere rebalanceo de fondos en este momento.
                    </div>
                  </div>
                </div>

              </div>

              {/* Fake Telegram input */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                <input 
                  type="text" 
                  disabled
                  placeholder="Escribe un comando (/buy, /sell, /close_all)..."
                  className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-400 outline-none"
                />
                <button className="p-2 rounded-xl bg-[#2DD4BF] text-slate-950 font-bold shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
