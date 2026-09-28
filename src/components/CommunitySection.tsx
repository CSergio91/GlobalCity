import React from 'react';
import { Send, Instagram, ShieldCheck, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ScrollReveal } from './common/ScrollReveal';

export const CommunitySection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'globalcity_auth_bot';

  return (
    <section 
      id="community"
      className="min-h-screen w-full flex flex-col justify-center items-center py-16 sm:py-24 relative select-none bg-slate-950/60 border-t border-white/10"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto relative z-10 text-center space-y-8">
        
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

        {/* Community Channels Cards: Telegram & Discord with Dynamic Entrance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-2">
          {/* Telegram Channel */}
          <ScrollReveal animation="slide-right" delay={120} duration={650}>
            <a
              href={`https://t.me/${botUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-purple-400/50 backdrop-blur-xl transition-all duration-300 flex items-center justify-between group text-left cursor-pointer hover:scale-[1.02] h-full"
            >
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 group-hover:bg-purple-500/20 transition-colors">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-mono font-black text-base text-white">Telegram Community</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{isEn ? 'Announcements & Alerts' : 'Anuncios & Alertas en Vivo'}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </a>
          </ScrollReveal>

          {/* Instagram Channel */}
          <ScrollReveal animation="slide-left" delay={200} duration={650}>
            <a
              href="https://instagram.com/eklipsefunded"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-400/50 backdrop-blur-xl transition-all duration-300 flex items-center justify-between group text-left cursor-pointer hover:scale-[1.02] h-full"
            >
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500/20 transition-colors">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-mono font-black text-base text-white">Instagram Oficial</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{isEn ? 'Daily Updates & Payout Highlights' : 'Actualizaciones & Retiros'}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </a>
          </ScrollReveal>
        </div>

        {/* Transparency Commitment Notice */}
        <ScrollReveal animation="blur-reveal" delay={320} duration={700}>
          <div className="pt-4 flex items-center justify-center gap-2 font-mono text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isEn ? '100% Real metrics policy. Public on-chain payout audits published regularly.' : 'Política de métricas 100% reales. Auditorías de retiros on-chain públicas y verificables.'}</span>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
