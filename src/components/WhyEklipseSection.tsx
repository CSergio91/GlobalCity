import React from 'react';
import { Terminal, ShieldCheck, Cpu, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ScrollReveal } from './common/ScrollReveal';

export const WhyEklipseSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const pillars = [
    {
      title: isEn ? 'Purpose-built terminal' : 'Terminal diseñada a medida',
      desc: isEn ? 'Crypto Futures focused.' : 'Enfocada en Futuros Cripto.',
      detail: isEn 
        ? 'Not an outdated MetaTrader clone with artificial delays. A native, GPU-accelerated terminal created specifically for liquid crypto derivatives.' 
        : 'Sin clones antiguos de MetaTrader ni demoras artificiales. Una terminal nativa acelerada por GPU creada para derivados cripto líquidos.',
      icon: Terminal,
      color: 'text-amber-400'
    },
    {
      title: isEn ? 'Transparent rules' : 'Reglas transparentes',
      desc: isEn ? 'Know your risk from day one.' : 'Conoce tu riesgo desde el primer día.',
      detail: isEn 
        ? 'Zero hidden clauses or subjective breaches. Your drawdown, targets, and parameters are calculated openly and in real time.' 
        : 'Cero cláusulas ocultas o faltas subjetivas. Tu drawdown, objetivos y parámetros se calculan en abierto y en tiempo real.',
      icon: ShieldCheck,
      color: 'text-purple-400'
    },
    {
      title: isEn ? 'Advanced risk engine' : 'Motor de riesgo avanzado',
      desc: isEn ? 'Real-time monitoring.' : 'Monitorización en tiempo real.',
      detail: isEn 
        ? 'Continuous tick-by-tick risk auditing that prevents sudden account liquidation and gives you immediate clarity on margin utilization.' 
        : 'Auditoría continua de riesgo tick a tick que previene pérdidas imprevistas y te otorga claridad inmediata sobre tu margen.',
      icon: Cpu,
      color: 'text-emerald-400'
    },
    {
      title: isEn ? 'Built to scale' : 'Construido para escalar',
      desc: isEn ? 'Your account can grow with your performance.' : 'Tu cuenta crece al ritmo de tus resultados.',
      detail: isEn 
        ? 'Consistent traders unlock +25% capital bumps on every 3 profitable payout milestones, scaling up to $2,000,000 in institutional backing.' 
        : 'Los traders consistentes desbloquean aumentos del +25% de capital cada 3 ciclos de retiro rentables, escalando hasta $2,000,000.',
      icon: TrendingUp,
      color: 'text-amber-400'
    }
  ];

  return (
    <section 
      id="why-eklipse"
      className="min-h-screen w-full flex flex-col justify-center items-center py-20 sm:py-28 relative select-none bg-transparent"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* Section Header without top tag */}
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
              {isEn ? 'Built for traders, not spreadsheets.' : 'Construido para traders, no para hojas de cálculo.'}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal">
              {isEn 
                ? 'Traditional prop firms rely on legacy forex tech. EKLIPSE is engineered from the ground up for modern crypto traders.' 
                : 'Las empresas de fondeo tradicionales dependen de tecnología anticuada. EKLIPSE ha sido diseñada desde cero para el trading moderno de criptomonedas.'}
            </p>
          </div>
        </ScrollReveal>

        {/* 4 Pillars Grid with Converging Lateral Reveals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            const anim = i % 2 === 0 ? 'slide-left' : 'slide-right';
            const delay = Math.floor(i / 2) * 150 + (i % 2) * 80;
            return (
              <ScrollReveal key={i} animation={anim} delay={delay} duration={700}>
                <div 
                  className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl transition-all duration-300 group flex flex-col justify-between h-full"
                >
                  <div className="space-y-4">
                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 w-fit ${p.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                        {p.title}
                      </h3>
                      <div className="text-sm sm:text-base font-mono font-bold text-amber-300 mt-1">
                        {p.desc}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                      {p.detail}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Institutional Comparison Battlecard: EKLIPSE vs Traditional Prop Firms */}
        <ScrollReveal animation="fade-up" delay={200} duration={750}>
          <div className="rounded-3xl bg-slate-950/80 border border-white/15 backdrop-blur-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] relative overflow-hidden">
            {/* Ambient Background Sheen */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
              {/* Header */}
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>{isEn ? 'THE ARCHITECTURAL ADVANTAGE' : 'LA VENTAJA ARQUITECTÓNICA'}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                  {isEn ? 'EKLIPSE vs Traditional Prop Firms' : 'EKLIPSE vs Prop Firms Tradicionales'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isEn 
                    ? 'Why experienced crypto traders choose our proprietary web execution engine over legacy forex brokers.' 
                    : 'Por qué los traders serios eligen nuestra terminal propietaria web frente a los brokers tradicionales de Forex.'}
                </p>
              </div>

              {/* Comparison Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse min-w-[620px]">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-[11px] uppercase tracking-wider">
                      <th className="py-3.5 px-4 font-semibold">{isEn ? 'Feature / Dimension' : 'Característica / Dimensión'}</th>
                      <th className="py-3.5 px-4 font-black text-amber-300 bg-amber-400/[0.08] rounded-t-xl border-t border-l border-r border-amber-400/30">
                        ⚡ EKLIPSE FUNDED
                      </th>
                      <th className="py-3.5 px-4 font-medium text-slate-400">{isEn ? 'Legacy Forex / MT4/MT5 Firms' : 'Firmas Tradicionales Forex'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {/* Row 1: Funding Model */}
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        {isEn ? 'Funding Access Model' : 'Modelo de Fondeo'}
                      </td>
                      <td className="py-4 px-4 bg-amber-400/[0.04] border-l border-r border-amber-400/20 text-white font-bold">
                        <span className="text-emerald-400 font-black">✓ {isEn ? 'Direct Instant Funding' : 'Fondeo Directo Inmediato'}</span>
                        <div className="text-[10px] text-slate-300 font-normal mt-0.5">
                          {isEn ? 'Zero evaluation traps; start earning from day 1' : 'Sin exámenes trampa; comienzas a operar de inmediato'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        <span className="text-rose-400 font-semibold">✗ {isEn ? 'Rigid 2-Phase Challenges' : 'Retos rígidos de 2 fases'}</span>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                          {isEn ? 'Designed with strict 10% targets for 95% fail rates' : 'Diseñados con metas del 10% para que el 95% falle'}
                        </div>
                      </td>
                    </tr>

                    {/* Row 2: Trading Terminal */}
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        {isEn ? 'Trading Terminal' : 'Terminal de Trading'}
                      </td>
                      <td className="py-4 px-4 bg-amber-400/[0.04] border-l border-r border-amber-400/20 text-white font-bold">
                        <span className="text-emerald-400 font-black">✓ {isEn ? 'Proprietary 60 FPS GPU Web' : 'Terminal Propia Web GPU a 60 FPS'}</span>
                        <div className="text-[10px] text-slate-300 font-normal mt-0.5">
                          {isEn ? 'Zero desktop downloads, native orderbook & charts' : 'Sin descargas de escritorio, libros de órdenes nativos'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        <span className="text-rose-400 font-semibold">✗ {isEn ? 'Legacy MetaTrader 4 / 5' : 'MetaTrader 4/5 de 2004'}</span>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                          {isEn ? 'Outdated desktop clones, clunky plugins & slippage' : 'Clones antiguos de escritorio con plugins y desfases'}
                        </div>
                      </td>
                    </tr>

                    {/* Row 3: Markets & Hours */}
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        {isEn ? 'Markets & Trading Hours' : 'Mercados y Horarios'}
                      </td>
                      <td className="py-4 px-4 bg-amber-400/[0.04] border-l border-r border-amber-400/20 text-white font-bold">
                        <span className="text-emerald-400 font-black">✓ {isEn ? '24/7/365 Continuous Crypto' : 'Futuros Cripto 24/7 Continuos'}</span>
                        <div className="text-[10px] text-slate-300 font-normal mt-0.5">
                          {isEn ? 'No weekend closures, no negative swap penalties' : 'Sin cierres de fin de semana ni swaps abusivos'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        <span className="text-rose-400 font-semibold">✗ {isEn ? 'Forex Weekend Gaps' : 'Cierres de fin de semana en Forex'}</span>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                          {isEn ? 'Markets close Friday, unpredictable Monday opening gaps' : 'Cierran viernes noche con gaps devastadores el lunes'}
                        </div>
                      </td>
                    </tr>

                    {/* Row 4: Payouts */}
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        {isEn ? 'Profit Payouts' : 'Retiro de Beneficios'}
                      </td>
                      <td className="py-4 px-4 bg-amber-400/[0.04] border-l border-r border-amber-400/20 text-white font-bold">
                        <span className="text-emerald-400 font-black">✓ {isEn ? 'USDT On-Chain in < 24 Hours' : 'USDT On-Chain en < 24 Horas'}</span>
                        <div className="text-[10px] text-slate-300 font-normal mt-0.5">
                          {isEn ? 'Direct to your crypto wallet; up to 90% profit split' : 'Directo a tu billetera cripto con hasta 90% de reparto'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        <span className="text-rose-400 font-semibold">✗ {isEn ? 'Bank Wires (5-10 Days)' : 'Transferencias bancarias (5-10 días)'}</span>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                          {isEn ? 'High intermediary fees, currency conversions & hold risks' : 'Comisiones bancarias altas y riesgo de retenciones'}
                        </div>
                      </td>
                    </tr>

                    {/* Row 5: Risk Engine */}
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        {isEn ? 'Risk Engine & Guardrails' : 'Motor de Riesgo y Reglas'}
                      </td>
                      <td className="py-4 px-4 bg-amber-400/[0.04] border-l border-r border-amber-400/20 text-white font-bold">
                        <span className="text-emerald-400 font-black">✓ {isEn ? 'Deterministic < 1ms RAM Engine' : 'Motor en RAM < 1ms Determinista'}</span>
                        <div className="text-[10px] text-slate-300 font-normal mt-0.5">
                          {isEn ? 'Fixed EOD at 00:00 UTC, live metrics openly visible' : 'Reinicio EOD a las 00:00 UTC, métricas transparentes'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        <span className="text-rose-400 font-semibold">✗ {isEn ? 'Intraday Trailing Traps' : 'Trailing Drawdown Intradía Opaco'}</span>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                          {isEn ? 'Trailing drawdown moves with unrealized equity peaks' : 'El límite sube con picos flotantes y te expulsa'}
                        </div>
                      </td>
                    </tr>

                    {/* Row 6: Scaling */}
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        {isEn ? 'Capital Scaling' : 'Escalado de Capital'}
                      </td>
                      <td className="py-4 px-4 bg-amber-400/[0.04] border-l border-r border-amber-400/20 text-white font-bold rounded-b-xl border-b">
                        <span className="text-emerald-400 font-black">✓ {isEn ? '+25% Scaling up to $2,000,000' : '+25% de Capital hasta $2,000,000'}</span>
                        <div className="text-[10px] text-slate-300 font-normal mt-0.5">
                          {isEn ? 'Automatically every 3 consecutive profitable cycles' : 'Automático cada 3 ciclos de retiro con beneficios'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        <span className="text-rose-400 font-semibold">✗ {isEn ? 'Strict Hard Caps' : 'Techos rígidos y restrictivos'}</span>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                          {isEn ? 'Requires months of manual manager reviews' : 'Requiere revisiones manuales arbitrarias y demoras'}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
