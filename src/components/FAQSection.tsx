import React, { useState } from 'react';
import { Plus, Sparkles, HelpCircle, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ScrollReveal } from './common/ScrollReveal';

export const FAQSection: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const faqs = [
    {
      q: isEn ? 'What is EKLIPSE FUNDED and how is it different from traditional prop firms?' : '¿Qué es EKLIPSE FUNDED y en qué se diferencia de una prop firm convencional?',
      a: isEn 
        ? 'EKLIPSE is an institutional crypto proprietary trading firm. Unlike legacy firms using slow MetaTrader 4/5 bridges with inflated spreads, we operate our own 60 FPS GPU terminal connected directly via DMA WebSocket to real exchange order books (Binance and Bybit). We provide simulated capital accounts up to $100,000, sub-millisecond execution, and on-chain USDT payouts in under 8 hours.'
        : 'EKLIPSE es una empresa de fondeo institucional cripto. A diferencia de las firmas tradicionales que utilizan pasarelas lentas de MetaTrader 4/5 con spreads inflados de brokers b-book, operamos nuestra propia terminal web con GPU a 60 FPS conectada por WebSocket DMA directo a libros de Binance y Bybit. Ofrecemos cuentas de capital simulado de hasta $100,000, ejecución en sub-milisegundo y pagos on-chain en USDT en menos de 8 horas.'
    },
    {
      q: isEn ? 'What is the difference between Solar (Instant Funding) and Lunar (2-Phase Challenge)?' : '¿Cuál es la diferencia entre Chispa Solar (Fondeo Inmediato) y Luna Creciente (Reto 2 Fases)?',
      a: isEn 
        ? 'Solar Accounts (Chispa Solar, Corona Solar, Eclipse Solar) provide Instant Funding with ZERO evaluation phases or waiting periods: you start trading immediately under disciplined risk rules. Lunar Accounts (Luna Creciente, Superluna, Luna de Sangre) follow a traditional 2-phase evaluation (Phase 1: 8% target, Phase 2: 5% target) with 10% maximum drawdown and up to 90% profit split, designed for traders who want to prove their edge at a lower activation fee.'
        : 'Las cuentas Solares (Chispa Solar, Corona Solar, Eclipse Solar) ofrecen Fondeo Inmediato sin exámenes ni fases de espera: comienzas a operar desde el primer minuto bajo reglas claras de gestión. Las cuentas Lunares (Luna Creciente, Superluna, Luna de Sangre) son retos de evaluación en 2 fases (Fase 1: 8% objetivo, Fase 2: 5% objetivo) con 10% de drawdown total y hasta 90% de reparto de ganancias, pensadas para traders que prefieren demostrar consistencia con un costo de activación menor.'
    },
    {
      q: isEn ? 'What are the exact Drawdown and Daily Loss rules?' : '¿Cuáles son las reglas exactas de Drawdown y Pérdida Diaria?',
      a: isEn 
        ? '1) Maximum Daily Loss: 2% of the day’s starting balance (calculated transparently at 00:00 UTC). 2) Maximum Total Drawdown: 8% for Solar Instant accounts and 10% for Lunar Challenge accounts from initial capital. We use static balance/equity limits with zero deceptive intraday trailing drawdown recalculations.'
        : '1) Pérdida Máxima Diaria: 2% del balance inicial del día (calculado de forma transparente a las 00:00 UTC). 2) Drawdown Máximo Total: 8% en cuentas Solares de Fondeo Inmediato y 10% en cuentas Lunares respecto al capital inicial. Utilizamos límites estáticos y transparentes, sin trampas de trailing drawdown intradía ocultas ni comisiones sorpresa.'
    },
    {
      q: isEn ? 'How and when are profit payouts processed?' : '¿Cómo y con qué rapidez se procesan los retiros de beneficios (Payouts)?',
      a: isEn 
        ? 'Payouts are requested directly through your Trader Dashboard once you achieve at least 5 profitable trading days (+0.5% daily gain). Profits are paid directly on-chain in USDT (TRC-20 / BEP-20 / ERC-20) within 8 hours. Default profit splits range from 80% to 90%, or direct 90% from day 1 with the Payout Add-on.'
        : 'Los retiros se solicitan directamente desde tu Trader Dashboard Nexus al cumplir un mínimo de 5 días de consistencia rentables (+0.5% por día). Los pagos se liquidan en USDT on-chain (TRC-20 / BEP-20 / ERC-20) en menos de 8 horas sin demoras burocráticas de intermediarios. El profit split estándar es del 80% al 90%, o 90% directo desde el primer retiro con el Add-on de Payout.'
    },
    {
      q: isEn ? 'Which markets and cryptocurrencies can I trade?' : '¿Qué mercados y criptomonedas puedo operar en la Terminal?',
      a: isEn 
        ? 'You can trade high-liquidity Crypto Perpetual Futures including BTC/USDT, ETH/USDT, and SOL/USDT, as well as verified high-volume meme contracts like PEPE/USDT. All pairs trade 24 hours a day, 7 days a week with zero weekend market interruptions.'
        : 'Puedes operar los contratos de Futuros Perpetuos de mayor liquidez global: BTC/USDT, ETH/USDT, SOL/USDT y memecoins verificadas de alto volumen como PEPE/USDT. Todos los pares operan 24 horas al día, 7 días a la semana sin parones de fin de semana.'
    },
    {
      q: isEn ? 'Why do you use a proprietary Web Terminal instead of MT4 or MT5?' : '¿Por qué una Terminal Web Institucional propia y no MetaTrader 4 o 5?',
      a: isEn 
        ? 'MetaTrader was built in the early 2000s for retail forex. In crypto, MT4/MT5 requires third-party bridge plugins that add 200-500ms of latency, synthetic slippage, and synthetic quotes. Our proprietary terminal is engineered in TypeScript with a 60 FPS GPU KLine canvas connected directly via WebSocket to exchange order books with sub-0.5ms execution and integrated pre-trade risk validation.'
        : 'MetaTrader fue diseñado en la década del 2000 para forex minorista. En cripto, MT4/MT5 requiere puentes de terceros que añaden demoras de 200 a 500ms, deslizamientos artificiales y cotizaciones manipuladas. Nuestra terminal propietaria está construida en TypeScript con motor gráfico GPU a 60 FPS y conectividad WebSocket directa a libros de exchange con ejecución en sub-0.5ms y validación de riesgo previa a cada orden.'
    },
    {
      q: isEn ? 'How does the Trader Dashboard update in real time?' : '¿Cómo se actualiza el Dashboard del Trader en tiempo real?',
      a: isEn 
        ? 'Our background Sentinel Risk Daemon operates in RAM via WebSockets and Redis caching. Every market tick, position price movement, and closed trade immediately recalculates your net equity, profit target, and drawdown status in <1ms without database polling delays.'
        : 'Nuestro centinela de servidor opera en memoria RAM conectado por WebSockets y caché caliente de Redis. Cada tick del mercado, fluctuación de margen y orden cerrada recalcula tu equity neto, objetivo de beneficio y drawdown en menos de 1ms sin depender de consultas lentas de base de datos.'
    },
    {
      q: isEn ? 'Are algorithmic bots and copy trading permitted?' : '¿Están permitidos los bots algorítmicos y el copy trading?',
      a: isEn 
        ? 'Yes. Algorithmic strategies and bots are fully allowed via our direct API endpoints. Internal copy trading between your own accounts or connected personal exchanges is also permitted. Toxic latency arbitrage (exploiting stale feeds) and multi-account hedging are strictly prohibited.'
        : 'Sí. Las estrategias algorítmicas y bots están totalmente permitidos mediante nuestras APIs directas. El copy trading interno para replicar tus operaciones entre tus propias cuentas o exchanges conectados también está habilitado. Queda estrictamente prohibido el arbitraje tóxico de latencia y el hedging de cuentas opuestas.'
    },
    {
      q: isEn ? 'Can I trade during high-impact news and over weekends?' : '¿Puedo operar durante noticias de alto impacto y fines de semana?',
      a: isEn 
        ? 'Yes. Crypto futures markets run 24/7 without weekend closures. You have full freedom to hold positions over the weekend and trade high-impact macroeconomic events (CPI, FOMC, rate decisions), provided your positions respect the 2% daily loss limit.'
        : 'Sí. El mercado cripto opera 24/7 de forma ininterrumpida. Tienes total libertad para mantener posiciones abiertas el fin de semana y operar eventos macroeconómicos de alta volatilidad (IPC, FOMC, tipos de interés), siempre que tu riesgo no vulnere el límite diario del 2%.'
    },
    {
      q: isEn ? 'What are the customizable Add-ons available at checkout?' : '¿Qué son los Add-ons personalizables y cómo benefician mi cuenta?',
      a: isEn 
        ? 'You can enhance any account with 4 modular add-ons: 1) +50% Leverage boost, 2) Extended Drawdown (+2% buffer), 3) Instant 90% Profit Split from day one, and 4) Weekly Payouts (request withdrawals every 7 days instead of 14).'
        : 'Puedes potenciar cualquier cuenta con 4 complementos modulares: 1) +50% de Apalancamiento dinámico, 2) Drawdown extendido (+2% de colchón de seguridad), 3) Payout directo al 90% desde el día 1, y 4) Retiros semanales (solicita tus ganancias cada 7 días en lugar de 14).'
    },
    {
      q: isEn ? 'What happens if I accidentally breach a risk limit?' : '¿Qué ocurre si alcanzo accidentalmente un límite de riesgo?',
      a: isEn 
        ? 'If your account touches the 2% daily loss or overall drawdown limit, our synchronous risk engine automatically closes open positions to protect balance. You will never owe any money, and you can reset your account or activate a new program at a discounted trader rate.'
        : 'Si la cuenta alcanza el 2% de pérdida diaria o el límite de drawdown total, el motor de riesgo síncrono cierra automáticamente las operaciones abiertas para proteger el capital. Nunca deberás dinero y puedes reiniciar tu cuenta o activar un nuevo programa con descuento preferencial para la comunidad.'
    }
  ];

  return (
    <section 
      id="faq"
      className="w-full flex flex-col justify-center items-center py-6 sm:py-12 relative select-none bg-[#06070B] text-white"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.03),transparent_60%)] pointer-events-none" />

      <div className="w-full px-3 sm:px-6 lg:px-10 max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="w-full flex flex-col items-center text-center space-y-1 sm:space-y-2 mb-4 sm:mb-8 max-w-4xl mx-auto">
            
            {/* Overline Pre-title */}
            <div className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-slate-300/90 uppercase font-sans">
              {isEn ? 'KNOWLEDGE BASE & GOVERNANCE' : 'BASE DE CONOCIMIENTO Y REGLAS INSTITUCIONALES'}
            </div>

            {/* Master Visual Headline H1 */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] leading-[1.1] text-white">
              <span className="inline-block drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
                {isEn ? 'Frequently Asked ' : 'Preguntas '}{' '}
              </span>
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.45)]">
                {isEn ? 'Questions.' : 'Frecuentes.'}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-300/85 font-normal max-w-xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              {isEn 
                ? 'Clear answers regarding our instant funding, terminal latency, risk metrics, and guaranteed crypto payouts.' 
                : 'Respuestas claras sobre nuestro fondeo inmediato, latencia de terminal, métricas de riesgo y retiros garantizados en cripto.'}
            </p>
          </div>
        </ScrollReveal>

        {/* Accordion List: 2-Column Grid on Desktop (6 + 5 items) for Perfect Viewport Fit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2.5 max-h-[75vh] lg:max-h-none overflow-y-auto no-scrollbar pr-0.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <ScrollReveal 
                key={idx} 
                animation="fade-up" 
                delay={Math.min(idx * 20, 200)} 
                duration={400}
              >
                <div 
                  className={`rounded-xl sm:rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? 'border-amber-400/40 bg-white/[0.04] shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.08)]' 
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.035] hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full p-2.5 sm:p-4 text-left flex items-center justify-between gap-2 sm:gap-3 cursor-pointer group"
                    aria-expanded={isOpen}
                  >
                    <span className={`font-mono text-xs sm:text-[13px] font-bold transition-colors leading-snug break-words flex-1 pr-1 ${
                      isOpen ? 'text-amber-300' : 'text-white group-hover:text-amber-200'
                    }`}>
                      {faq.q}
                    </span>
                    
                    {/* Animated '+' Icon (Rotates 45deg smoothly to transform into '×') */}
                    <div 
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                        isOpen 
                          ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 rotate-45 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                          : 'bg-white/5 border-white/10 text-slate-400 group-hover:text-white group-hover:border-white/25 rotate-0'
                      }`}
                    >
                      <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                    </div>
                  </button>

                  {/* Expandable Answer Content */}
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="px-2.5 sm:px-4 pb-3 sm:pb-4 pt-1 text-[10.5px] sm:text-xs text-slate-300/90 font-normal leading-relaxed border-t border-white/5 break-words">
                      {faq.a}
                    </div>
                  </div>

                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
};
