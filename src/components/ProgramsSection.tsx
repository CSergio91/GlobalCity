import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Coins, 
  Check, 
  Gift, 
  Info,
  Zap,
  Lock,
  Flame,
  BadgeCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../context/RouterContext';
import { ScrollReveal } from './common/ScrollReveal';

export interface AccountSizeConfig {
  id: string;
  sizeLabel: string;
  capital: number;
  capitalFormatted: string;
  basePriceUSDT: number;
  avgRewardUSDT: string;
  popular?: boolean;
}

export const ProgramsSection: React.FC = () => {
  const { language } = useLanguage();
  const { navigate } = useAppRouter();
  const isEn = language === 'en';

  // Selected Account Size (1k, 2.5k, 5k, 10k, 25k, 50k, 100k)
  const [selectedSizeId, setSelectedSizeId] = useState<string>('50k');

  // Consistency 40% Add-on Toggle
  const [consistencyAddon, setConsistencyAddon] = useState<boolean>(false);

  // Loyalty Points Discount Toggle (0, 15%, 25%)
  const [loyaltyDiscount, setLoyaltyDiscount] = useState<number>(0);

  const accountSizes: AccountSizeConfig[] = [
    { id: '1k', sizeLabel: '1K', capital: 1000, capitalFormatted: '1,000 USDT', basePriceUSDT: 19, avgRewardUSDT: '340 USDT' },
    { id: '2.5k', sizeLabel: '2.5K', capital: 2500, capitalFormatted: '2,500 USDT', basePriceUSDT: 35, avgRewardUSDT: '850 USDT' },
    { id: '5k', sizeLabel: '5K', capital: 5000, capitalFormatted: '5,000 USDT', basePriceUSDT: 59, avgRewardUSDT: '1,700 USDT' },
    { id: '10k', sizeLabel: '10K', capital: 10000, capitalFormatted: '10,000 USDT', basePriceUSDT: 109, avgRewardUSDT: '3,400 USDT' },
    { id: '25k', sizeLabel: '25K', capital: 25000, capitalFormatted: '25,000 USDT', basePriceUSDT: 199, avgRewardUSDT: '8,500 USDT' },
    { id: '50k', sizeLabel: '50K', capital: 50000, capitalFormatted: '50,000 USDT', basePriceUSDT: 329, avgRewardUSDT: '17,000 USDT', popular: true },
    { id: '100k', sizeLabel: '100K', capital: 100000, capitalFormatted: '100,000 USDT', basePriceUSDT: 549, avgRewardUSDT: '34,000 USDT' }
  ];

  const currentSize = accountSizes.find(s => s.id === selectedSizeId) || accountSizes[5];

  // Price calculations in pure USDT
  const calculateFinalPrice = () => {
    let price = currentSize.basePriceUSDT;
    if (loyaltyDiscount > 0) {
      price = Math.round(price * (1 - loyaltyDiscount / 100));
    }
    if (consistencyAddon) {
      price += Math.max(5, Math.round(currentSize.basePriceUSDT * 0.15));
    }
    return price;
  };

  const originalPrice = currentSize.basePriceUSDT;
  const finalPrice = calculateFinalPrice();

  const dailyLossAmount = Math.round(currentSize.capital * 0.02);
  const maxDrawdownAmount = Math.round(currentSize.capital * 0.08);

  const handleStartChallenge = () => {
    navigate('/login');
  };

  return (
    <section 
      id="programs"
      className="w-full py-20 sm:py-32 relative select-none bg-transparent"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto relative z-10 space-y-12">
        
        {/* Section Header - Clean, Spacious & Animated (No top tag) */}
        <ScrollReveal animation="fade-up" duration={700}>
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
              {isEn ? 'Choose Your Capital' : 'Elige Tu Capital'}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal">
              {isEn 
                ? 'Instant funding in USDT with zero challenges. Trade immediately under clear risk rules with bi-weekly on-chain payouts.' 
                : 'Fondeo directo en USDT sin retos. Opera de inmediato bajo reglas claras con retiros quincenales on-chain.'}
            </p>
          </div>
        </ScrollReveal>

        {/* Upgraded Capital Tier Selector: Sleek Crypto Tiles */}
        <ScrollReveal animation="blur-reveal" delay={120} duration={700}>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
            {accountSizes.map((s) => {
              const isSelected = selectedSizeId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSizeId(s.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-400/20 via-slate-900/90 to-slate-950/95 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)] scale-[1.03] z-10'
                      : 'bg-slate-950/70 border border-white/10 hover:border-white/25 hover:bg-slate-900/80 backdrop-blur-xl'
                  }`}
                >
                  {/* Popular Badge */}
                  {s.popular && (
                    <div className="absolute top-1.5 right-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 block animate-pulse" />
                    </div>
                  )}

                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    {s.sizeLabel}
                  </div>

                  <div className={`font-mono font-black text-base sm:text-lg tracking-tight ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                    {s.capital >= 1000 ? `${s.capital / 1000}K` : s.capital}
                  </div>

                  <div className="text-[10px] font-mono text-cyan-300/80 mt-0.5">
                    USDT
                  </div>

                  <div className={`mt-2 pt-2 border-t w-full text-center text-xs font-mono font-bold ${
                    isSelected ? 'border-amber-400/30 text-amber-200' : 'border-white/5 text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {s.basePriceUSDT} USDT
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* 2-Column Split: Rules & Parameters (Left) vs Checkout & Loyalty (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Trading Objectives & Risk Rules */}
          <div className="lg:col-span-7">
            <ScrollReveal animation="slide-left" delay={180} duration={700}>
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/85 border border-white/10 hover:border-white/20 backdrop-blur-2xl shadow-2xl space-y-6">
                
                {/* Header with Capital & Refundable Tag */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-black font-mono uppercase tracking-wider text-white">
                      {isEn ? 'Account Specifications' : 'Especificaciones de Cuenta'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/30">
                      {currentSize.capitalFormatted}
                    </span>
                  </div>
                </div>

                {/* Parameters List */}
                <div className="space-y-4 font-mono text-xs sm:text-sm">
                  {/* Daily Loss */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-slate-300">{isEn ? 'Daily Loss Limit (2%)' : 'Pérdida Máx. Diaria (2%)'}</span>
                    <span className="font-bold text-rose-400">-{dailyLossAmount} USDT</span>
                  </div>

                  {/* Max Drawdown */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-slate-300">{isEn ? 'Max Drawdown (8%)' : 'Drawdown Máximo (8%)'}</span>
                    <span className="font-bold text-rose-400">-{maxDrawdownAmount} USDT</span>
                  </div>

                  {/* Consistency Rule with 40% Addon toggle */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <span className="text-slate-300">{isEn ? 'Consistency Rule' : 'Regla de Consistencia'}</span>
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                        {isEn ? 'Max % profit in a single session' : 'Máx % de ganancia en una sola sesión'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${consistencyAddon ? 'text-emerald-400' : 'text-amber-300'}`}>
                        {consistencyAddon ? '40%' : '20%'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setConsistencyAddon(!consistencyAddon)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          consistencyAddon 
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-white/5 border-white/20 text-slate-400 hover:text-white hover:border-white/40'
                        }`}
                      >
                        {consistencyAddon ? '40% Activo' : '+ 40% Add-on'}
                      </button>
                    </div>
                  </div>

                  {/* Min Profitable Days */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-slate-300">{isEn ? 'Min Profitable Days' : 'Días Mín. Rentables'}</span>
                    <span className="font-bold text-cyan-300">5 {isEn ? 'Days (+0.5% each)' : 'Días (+0,5% c/u)'}</span>
                  </div>

                  {/* Payout Progression */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-slate-300">{isEn ? 'Profit Split Progression' : 'Escalamiento de Reparto'}</span>
                    <span className="font-black text-amber-400">35% → 50% → 80%</span>
                  </div>

                  {/* Fee Refund */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-300">{isEn ? 'Fee Refund' : 'Reembolso de Tarifa'}</span>
                    <span className="font-black text-emerald-400 flex items-center gap-1">
                      <BadgeCheck className="w-4 h-4 text-emerald-400" />
                      100% {isEn ? 'with 1st Payout' : 'en tu 1er Retiro'}
                    </span>
                  </div>
                </div>

                {/* Feature Check Line */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    {isEn ? 'Sub-ms WebSockets' : 'WebSockets Sub-ms'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    {isEn ? 'GPU Engine 60 FPS' : 'Motor GPU 60 FPS'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    {isEn ? 'USDT On-Chain Payouts' : 'Retiros Directos en USDT'}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Checkout & Loyalty Points Simulator */}
          <div className="lg:col-span-5">
            <ScrollReveal animation="slide-right" delay={260} duration={700}>
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6">
                
                {/* Activation Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    {isEn ? 'One-Time Activation' : 'Tarifa de Activación Única'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {isEn ? 'No Subscriptions' : 'Sin Mensualidades'}
                  </span>
                </div>

                {/* Loyalty Points Quick Redeem */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? 'Loyalty Points Discount:' : 'Descuento Puntos Loyalty:'}</span>
                    </span>
                    {loyaltyDiscount > 0 && (
                      <span className="text-emerald-400 font-bold">-{loyaltyDiscount}% OFF</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setLoyaltyDiscount(0)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                        loyaltyDiscount === 0
                          ? 'bg-white text-slate-950 border-white shadow-sm'
                          : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      0 Pts
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoyaltyDiscount(15)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                        loyaltyDiscount === 15
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                          : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      500 Pts
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoyaltyDiscount(25)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                        loyaltyDiscount === 25
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                          : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      1K Pts
                    </button>
                  </div>
                </div>

                {/* Price Display in USDT */}
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-white font-mono tracking-tight">
                      {finalPrice} <span className="text-2xl text-amber-400 font-bold">USDT</span>
                    </span>
                    {finalPrice < originalPrice && (
                      <span className="text-xl font-mono text-slate-500 line-through">
                        {originalPrice} USDT
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    {isEn ? '100% Refundable with your 1st payout' : '100% Reembolsable con tu 1er retiro'}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={handleStartChallenge}
                  className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-mono font-black text-sm uppercase tracking-widest shadow-[0_4px_30px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                >
                  <Flame className="w-4 h-4 text-slate-950 group-hover:scale-125 transition-transform" />
                  <span>{isEn ? 'Get Funded in USDT' : 'Obtener Fondeo en USDT'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="text-center font-mono text-[11px] text-slate-400 flex items-center justify-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? 'Instant On-Chain Activation · 24/7 Futures' : 'Activación Inmediata On-Chain · Futuros 24/7'}</span>
                </div>

              </div>
            </ScrollReveal>
          </div>

        </div>

      </div>
    </section>
  );
};

