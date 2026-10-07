import React from 'react';
import { Send, Instagram, ShieldCheck, ExternalLink, Headphones, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ScrollReveal } from './common/ScrollReveal';

export const CommunitySection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'globalcity_auth_bot';

  const telemetryMetrics = [
    { label: isEn ? 'Terminal Engine SLA' : 'Disponibilidad de Terminal', value: '99.98%', sub: isEn ? 'High-availability cluster' : 'Clúster de alta disponibilidad' },
    { label: isEn ? 'WebSocket Gateway Latency' : 'Latencia de WebSocket', value: '< 15ms', sub: isEn ? 'Multiplexed tick streaming' : 'Streaming multiplexado' },
    { label: isEn ? 'Crypto Trading Clock' : 'Horario de Mercados', value: '24/7/365', sub: isEn ? 'Continuous perpetuals' : 'Perpetuos continuos' }
  ];

  return (
    <section 
      id="community"
      className="min-h-screen w-full flex flex-col justify-center items-center py-16 sm:py-24 relative select-none bg-slate-950/60 border-t border-white/10"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto relative z-10 text-center space-y-10">
        
        {/* Header without top tag */}
        <ScrollReveal animation="fade-up">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {isEn ? 'Join the EKLIPSE Trader Network' : 'Únete a la Red de Traders EKLIPSE'}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal">
              {isEn 
                ? 'Connect directly with fellow crypto derivatives traders, share technical setups, track platform updates, and access institutional support.' 
                : 'Conecta con otros traders de derivados cripto, comparte análisis técnicos, sigue las actualizaciones de la plataforma y accede a soporte prioritario.'}
            </p>
          </div>
        </ScrollReveal>

        {/* Live Platform Telemetry Bar */}
        <ScrollReveal animation="blur-reveal" delay={80} duration={650}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {telemetryMetrics.map((m, i) => (
              <div 
                key={i} 
                className="p-3.5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-md text-center font-mono"
              >
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{m.label}</div>
                <div className="text-xl font-black text-white mt-0.5 tracking-tight">{m.value}</div>
                <div className="text-[10px] text-amber-300/80 mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Community Channels Cards: Telegram, Instagram & Institutional Desk */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-2">
          {/* Telegram Channel */}
          <ScrollReveal animation="slide-right" delay={120} duration={650}>
            <a
              href={`https://t.me/${botUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-purple-400/50 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group text-left cursor-pointer hover:scale-[1.02] h-full"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 group-hover:bg-purple-500/20 transition-colors">
                    <Send className="w-5 h-5" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
                <div>
                  <h3 className="font-mono font-black text-sm sm:text-base text-white">Telegram VIP</h3>
                  <p className="text-xs text-slate-400 mt-1">{isEn ? 'Live community, platform releases & risk updates.' : 'Comunidad en vivo, alertas y actualizaciones de riesgo.'}</p>
                </div>
              </div>
            </a>
          </ScrollReveal>

          {/* Instagram Channel */}
          <ScrollReveal animation="fade-up" delay={180} duration={650}>
            <a
              href="https://instagram.com/eklipsefunded"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-400/50 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group text-left cursor-pointer hover:scale-[1.02] h-full"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500/20 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <div>
                  <h3 className="font-mono font-black text-sm sm:text-base text-white">Instagram Oficial</h3>
                  <p className="text-xs text-slate-400 mt-1">{isEn ? 'Daily payout proofs and trader spotlights.' : 'Comprobantes de retiros y destacados de traders.'}</p>
                </div>
              </div>
            </a>
          </ScrollReveal>

          {/* Institutional Support Desk */}
          <ScrollReveal animation="slide-left" delay={240} duration={650}>
            <a
              href="mailto:support@eklipsefunded.com"
              className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-400/50 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group text-left cursor-pointer hover:scale-[1.02] h-full"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500/20 transition-colors">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div>
                  <h3 className="font-mono font-black text-sm sm:text-base text-white">{isEn ? 'Priority Desk' : 'Mesa de Soporte'}</h3>
                  <p className="text-xs text-slate-400 mt-1">{isEn ? 'Direct institutional email & account assistance 24/7.' : 'Soporte prioritario por correo y asistencia 24/7.'}</p>
                </div>
              </div>
            </a>
          </ScrollReveal>
        </div>

        {/* Transparency Commitment Notice */}
        <ScrollReveal animation="blur-reveal" delay={320} duration={700}>
          <div className="pt-2 flex items-center justify-center gap-2 font-mono text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isEn ? '100% Real metrics policy. Public on-chain payout audits published regularly.' : 'Política de métricas 100% reales. Auditorías de retiros on-chain públicas y verificables.'}</span>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
