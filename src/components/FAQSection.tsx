import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
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
      q: isEn ? 'What is EKLIPSE?' : '¿Qué es EKLIPSE?',
      a: isEn 
        ? 'EKLIPSE is a next-generation proprietary trading platform and prop firm focused on Crypto Futures. We provide skilled traders with simulated capital accounts up to $100,000 with Instant Funding (no evaluation challenge), our own proprietary GPU-accelerated terminal, and up to 80% profit payouts based on performance.'
        : 'EKLIPSE es una empresa de fondeo y plataforma de trading de última generación enfocada en Futuros Cripto. Ofrecemos a los traders cuentas de capital simulado de hasta $100,000 con Fondeo Inmediato (sin fases de examen ni retos), terminal propia acelerada por GPU y repartos de beneficio de hasta el 80% basados en su rendimiento.'
    },
    {
      q: isEn ? 'How does instant funding without challenges work?' : '¿Cómo funciona el fondeo inmediato sin challenge?',
      a: isEn 
        ? 'You select your funded account ($1K to $100K) for a single one-time activation fee with zero recurring subscriptions. There are zero evaluation phases or waiting periods: you start trading immediately on our proprietary terminal under disciplined 2% daily loss and 8% maximum drawdown rules. Once you complete 5 profitable days, you can request your payout.'
        : 'Seleccionas tu cuenta de capital ($1K a $100K) mediante una tarifa única de activación sin suscripciones mensuales recurrentes. Cero fases de examen ni periodos de espera: comienzas a operar inmediatamente en nuestra terminal propia bajo 2% de pérdida diaria y 8% de drawdown máximo. Al cumplir 5 días rentables, solicitas tu retiro.'
    },
    {
      q: isEn ? 'What markets can I trade?' : '¿Qué mercados puedo operar?',
      a: isEn 
        ? 'You can trade major Crypto Futures contracts including BTC/USDT, ETH/USDT, and SOL/USDT perpetuals 24 hours a day, 7 days a week, with additional high-liquidity crypto derivative pairs launching continuously.'
        : 'Puedes operar los principales contratos de futuros perpetuos: BTC/USDT, ETH/USDT y SOL/USDT las 24 horas del día, los 7 días de la semana, con nuevos pares de alta liquidez agregándose periódicamente.'
    },
    {
      q: isEn ? 'Is the account simulated?' : '¿La cuenta es simulada?',
      a: isEn 
        ? 'Yes. All trading occurs in a high-fidelity simulated environment matching real orderbook liquidity, depth, and live market pricing. Successful traders who meet the risk rules receive real crypto payouts (USDT/USDC) backed by our capital reserve.'
        : 'Sí. Toda la operativa se realiza en un entorno de simulación de alta fidelidad que replica la liquidez, profundidad y precios de mercado en tiempo real. Los traders que cumplen las reglas de riesgo reciben retiros reales en criptomonedas (USDT/USDC) respaldados por nuestro capital.'
    },
    {
      q: isEn ? 'What are the drawdown rules?' : '¿Cuáles son las reglas de drawdown?',
      a: isEn 
        ? 'There are two clear limits: 1) Maximum Daily Loss of 2% (calculated from the day’s starting balance at 00:00 UTC), and 2) Maximum Overall Drawdown of 8% from your starting account balance. These rules protect capital and ensure long-term risk discipline.'
        : 'Existen dos límites transparentes: 1) Pérdida Máxima Diaria del 2% (calculada sobre el balance inicial del día a las 00:00 UTC), y 2) Drawdown Máximo Total del 8% respecto al saldo inicial. Estas reglas protegen el capital y garantizan la disciplina de riesgo.'
    },
    {
      q: isEn ? 'How are profits calculated?' : '¿Cómo se calculan los beneficios?',
      a: isEn 
        ? 'Profits are calculated continuously using real-time mark-to-market prices. Your closed PnL and floating open PnL are updated tick-by-tick directly in your terminal dashboard.'
        : 'Los beneficios se calculan de manera continua mark-to-market con precios en vivo. Tu PnL cerrado y flotante se actualiza tick a tick directamente en el panel de tu terminal.'
    },
    {
      q: isEn ? 'How do payouts work?' : '¿Cómo funcionan los retiros?',
      a: isEn 
        ? 'On your funded account, you can request profit withdrawals every 14 days after achieving at least 5 profitable trading days (+0.5% each). Profit split begins at 35% on payout 1, 50% on payout 2, 80% on payout 3, and reaches 90% on payout 4+, sent directly in USDT.'
        : 'En tu cuenta fondeada, puedes solicitar retiros de beneficios cada 14 días tras cumplir al menos 5 días rentables de operativa (+0,5% cada uno). El reparto es progresivo: 35% en el 1er retiro, 50% en el 2do, 80% en el 3ero y 90% en el 4to en adelante, transferido directamente en USDT.'
    },
    {
      q: isEn ? 'Can I use my own strategy?' : '¿Puedo usar mi propia estrategia?',
      a: isEn 
        ? 'Absolutely. You are free to trade scalp setups, intraday momentum, swing positions, or price action strategies as long as you respect the risk limits and do not engage in toxic latency exploits or orderbook manipulation.'
        : 'Por supuesto. Tienes total libertad para operar scalping, intradía, swing trading o acción de precio, siempre que respetes los límites de riesgo y no realices prácticas abusivas de latencia o manipulación artificial.'
    },
    {
      q: isEn ? 'Are bots allowed?' : '¿Se permiten bots o EAs?',
      a: isEn 
        ? 'Algorithmic trading and trading bots are permitted via our API connectivity, provided they operate standard technical trading logic and do not perform platform latency arbitrage or tick manipulation.'
        : 'El trading algorítmico y bots están permitidos mediante conectividad API, siempre que ejecuten lógica técnica estándar y no arbitrajes de latencia de plataforma ni manipulación de ticks.'
    },
    {
      q: isEn ? 'Is copy trading allowed?' : '¿Se permite el copy trading?',
      a: isEn 
        ? 'Yes, you can copy trade your own trades between your own accounts or from your connected exchanges using our built-in API tools. Mass commercial mirror copying between unrelated traders is prohibited.'
        : 'Sí, puedes replicar tus propias operaciones entre tus propias cuentas o desde tus exchanges conectados mediante nuestras herramientas internas. Está prohibido el copiado masivo entre cuentas de terceros distintos.'
    },
    {
      q: isEn ? 'Can I trade news?' : '¿Puedo operar noticias de alta volatilidad?',
      a: isEn 
        ? 'Yes. You can hold and execute positions during macro economic news releases (CPI, FOMC, crypto announcements). However, remember that sudden volatility still affects your 2% daily loss limit.'
        : 'Sí. Puedes mantener y abrir posiciones durante eventos macroeconómicos (IPC, FOMC o noticias cripto). No obstante, recuerda que la volatilidad extrema sigue sujeta al límite de pérdida diaria del 2%.'
    },
    {
      q: isEn ? 'Can I hold positions overnight?' : '¿Puedo mantener posiciones abiertas de un día para otro o fin de semana?',
      a: isEn 
        ? 'Yes. Crypto futures markets operate 24/7 without weekend closures. You are fully permitted to hold swing positions overnight and over weekends.'
        : 'Sí. Los mercados de futuros cripto funcionan 24/7 sin parón de fin de semana. Tienes plena libertad para mantener posiciones swing abiertas de un día para otro o durante el fin de semana.'
    },
    {
      q: isEn ? 'What happens if I breach a rule?' : '¿Qué sucede si infrinjo una regla?',
      a: isEn 
        ? 'If your account breaches the 2% daily loss or 8% max drawdown limit, your open positions are automatically closed by our risk engine to protect capital. You can reset or activate a new funded account with a special trader discount at any time.'
        : 'Si la cuenta supera el 2% de pérdida diaria o el 8% de drawdown total, el motor de riesgo cierra automáticamente las posiciones abiertas para salvaguardar el capital. Puedes reiniciar o activar una nueva cuenta de fondeo con tarifa reducida en cualquier momento.'
    }
  ];

  return (
    <section 
      id="faq"
      className="min-h-screen w-full flex flex-col justify-center items-center py-20 sm:py-28 relative select-none bg-transparent"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto relative z-10">
        
        {/* Section Header without top tag */}
        <ScrollReveal animation="fade-up">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {isEn ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal">
              {isEn 
                ? 'Everything you need to know about our instant funding, rules, terminal, and payouts.' 
                : 'Todo lo que necesitas saber sobre nuestro fondeo inmediato, reglas, terminal y retiros.'}
            </p>
          </div>
        </ScrollReveal>

        {/* Accordion Items with Cascading Ripple ScrollReveal */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <ScrollReveal 
                key={idx} 
                animation="fade-up" 
                delay={Math.min(idx * 45, 360)} 
                duration={550}
              >
                <div 
                  className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <span className="font-mono font-bold text-sm sm:text-base text-white">
                      {faq.q}
                    </span>
                    <div className={`p-1.5 rounded-lg bg-white/5 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-amber-400' : 'text-slate-400'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-300 font-normal leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
};

