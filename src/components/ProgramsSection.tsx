import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  Check, 
  Info,
  Zap,
  Flame,
  ChevronLeft,
  ChevronRight
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

  const accountSizes: AccountSizeConfig[] = [
    { id: '1k', sizeLabel: '$1K', capital: 1000, capitalFormatted: '$1,000', basePriceUSDT: 15, avgRewardUSDT: '340 USDT' },
    { id: '2.5k', sizeLabel: '$2.5K', capital: 2500, capitalFormatted: '$2,500', basePriceUSDT: 25, avgRewardUSDT: '850 USDT' },
    { id: '5k', sizeLabel: '$5K', capital: 5000, capitalFormatted: '$5,000', basePriceUSDT: 49, avgRewardUSDT: '1,700 USDT' },
    { id: '10k', sizeLabel: '$10K', capital: 10000, capitalFormatted: '$10,000', basePriceUSDT: 89, avgRewardUSDT: '3,400 USDT' },
    { id: '25k', sizeLabel: '$25K', capital: 25000, capitalFormatted: '$25,000', basePriceUSDT: 159, avgRewardUSDT: '8,500 USDT' },
    { id: '50k', sizeLabel: '$50K', capital: 50000, capitalFormatted: '$50,000', basePriceUSDT: 249, avgRewardUSDT: '17,000 USDT', popular: true },
    { id: '100k', sizeLabel: '$100K', capital: 100000, capitalFormatted: '$100,000', basePriceUSDT: 399, avgRewardUSDT: '34,000 USDT' }
  ];

  // Two rows: row 1 (1k, 2.5k, 5k) and row 2 (10k, 25k, 50k, 100k)
  const row1Sizes = accountSizes.slice(0, 3);
  const row2Sizes = accountSizes.slice(3);

  // Default index is 5 (50k)
  const [currentIndex, setCurrentIndex] = useState<number>(5);

  // Consistency 40% Add-on - Enabled by DEFAULT
  const [isFlexAddon, setIsFlexAddon] = useState<boolean>(true);

  // Coupon / Loyalty Discount Toggle (0, 10%)
  const [discountPercent, setDiscountPercent] = useState<number>(10);

  // Drag & Swipe State
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartX = useRef<number>(0);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  const currentSize = accountSizes[currentIndex];

  const handleSelectSize = (id: string) => {
    const idx = accountSizes.findIndex(s => s.id === id);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(accountSizes.length - 1, prev + 1));
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - dragStartX.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 45) {
      handlePrev();
    } else if (dragOffset < -45) {
      handleNext();
    }
    setDragOffset(0);
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStartX.current;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 45) {
      handlePrev();
    } else if (dragOffset < -45) {
      handleNext();
    }
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (dragOffset > 45) {
        handlePrev();
      } else if (dragOffset < -45) {
        handleNext();
      }
      setDragOffset(0);
    }
  };

  const handleStart = () => {
    navigate('/login');
  };

  return (
    <section 
      id="programs"
      className="min-h-screen w-full flex flex-col justify-center items-center py-12 sm:py-16 relative select-none bg-transparent overflow-hidden"
    >
      <div className="w-full max-w-6xl mx-auto px-4 relative z-10 space-y-6 sm:space-y-8 flex flex-col items-center">
        
        {/* Section Header */}
        <ScrollReveal animation="fade-up" duration={500}>
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-widest shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>{isEn ? 'DIRECT CAPITAL ALLOCATION · USDT FUTURES' : 'ASIGNACIÓN DIRECTA · DERIVADOS EN USDT'}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              {isEn ? 'Choose Your Capital Tier' : 'Elige Tu Nivel de Capital'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              {isEn 
                ? 'Direct institutional capital accounts from $1,000 to $100,000 USDT. Zero evaluation traps: start trading immediately with up to 90% profit split.' 
                : 'Cuentas de capital corporativo directo de $1,000 a $100,000 USDT. Cero trampas de examen: comienzas a operar de inmediato con hasta 90% de reparto.'}
            </p>
          </div>
        </ScrollReveal>

        {/* 2-Row Pill Selector (Synchronized with Carousel) */}
        <ScrollReveal animation="blur-reveal" delay={80} duration={500}>
          <div className="flex flex-col items-center gap-2">
            {/* Row 1: 1K, 2.5K, 5K */}
            <div className="inline-flex items-center p-1 rounded-full bg-slate-950/90 border border-white/10 backdrop-blur-xl shadow-lg">
              {row1Sizes.map((s) => {
                const isSelected = currentSize.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSize(s.id)}
                    className={`px-4 sm:px-6 py-1.5 rounded-full font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white font-black shadow-[0_0_16px_rgba(147,51,234,0.6)] scale-[1.03]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.sizeLabel}
                  </button>
                );
              })}
            </div>

            {/* Row 2: 10K, 25K, 50K, 100K */}
            <div className="inline-flex items-center p-1 rounded-full bg-slate-950/90 border border-white/10 backdrop-blur-xl shadow-lg">
              {row2Sizes.map((s) => {
                const isSelected = currentSize.id === s.id;
                const is50k = s.id === '50k';
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSize(s.id)}
                    className={`px-3.5 sm:px-5 py-1.5 rounded-full font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-purple-600 text-white font-black shadow-[0_0_16px_rgba(147,51,234,0.6)] scale-[1.03]'
                        : is50k 
                          ? 'text-purple-300 font-extrabold hover:text-white' 
                          : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{s.sizeLabel}</span>
                    {is50k && (
                      <span className={`text-[10px] ${isSelected ? 'text-amber-300' : 'text-amber-400'}`}>★</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* 3D Animated Carousel Container - FOCUSED CARD DEAD CENTER */}
        <div className="relative w-full max-w-5xl py-2 flex items-center justify-center">
          
          {/* Navigation Arrows */}
          <div className="flex items-center justify-between absolute inset-y-0 left-2 right-2 sm:left-4 sm:right-4 z-40 pointer-events-none">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-2.5 sm:p-3 rounded-full bg-slate-950/85 border border-white/15 text-white backdrop-blur-xl shadow-2xl transition-all pointer-events-auto cursor-pointer ${
                currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-purple-600 hover:border-purple-400 hover:scale-110 active:scale-95'
              }`}
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === accountSizes.length - 1}
              className={`p-2.5 sm:p-3 rounded-full bg-slate-950/85 border border-white/15 text-white backdrop-blur-xl shadow-2xl transition-all pointer-events-auto cursor-pointer ${
                currentIndex === accountSizes.length - 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-purple-600 hover:border-purple-400 hover:scale-110 active:scale-95'
              }`}
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Carousel Viewport - Height constrained, cards anchored to center */}
          <div 
            ref={carouselContainerRef}
            className="w-full h-[510px] sm:h-[530px] relative flex items-center justify-center overflow-visible cursor-grab active:cursor-grabbing select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {accountSizes.map((size, index) => {
              const delta = index - currentIndex;
              const isCurrent = delta === 0;
              const isPrev = delta === -1;
              const isNext = delta === 1;
              const isVisible = Math.abs(delta) <= 1;

              // Price calculations for this card
              const addOnCost = Math.max(5, Math.round(size.basePriceUSDT * 0.15));
              const activeBasePrice = isFlexAddon ? size.basePriceUSDT + addOnCost : size.basePriceUSDT;
              const discountAmount = Math.round(activeBasePrice * (discountPercent / 100));
              const finalPrice = activeBasePrice - discountAmount;
              const dailyLossAmount = Math.round(size.capital * 0.02);
              const maxDrawdownAmount = Math.round(size.capital * 0.08);

              // Responsive step offset: 350px on desktop, 300px on mobile
              const stepOffset = typeof window !== 'undefined' && window.innerWidth < 640 ? 300 : 360;
              const cardOffset = delta * stepOffset + dragOffset;

              return (
                <div
                  key={size.id}
                  onClick={() => {
                    if (!isCurrent) setCurrentIndex(index);
                  }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: `translateX(calc(-50% + ${cardOffset}px)) scale(${isCurrent ? 1 : 0.88})`,
                    zIndex: isCurrent ? 30 : isVisible ? 20 : 0,
                    opacity: isCurrent ? 1 : isVisible ? 0.45 : 0,
                    pointerEvents: isCurrent ? 'auto' : isVisible ? 'auto' : 'none',
                    filter: isCurrent ? 'none' : 'blur(0.5px)',
                    transition: isDragging ? 'none' : 'all 450ms cubic-bezier(0.16, 1, 0.3, 1)',
                    width: 'min(370px, 86vw)'
                  }}
                  className="transition-all"
                >
                  <div 
                    className={`rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-3xl transition-all duration-300 ${
                      isCurrent 
                        ? 'bg-gradient-to-b from-white/[0.12] via-slate-950/70 to-black/85 border border-purple-400/60 border-t-purple-300/80 shadow-[0_0_50px_rgba(168,85,247,0.35),0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.4)]' 
                        : 'bg-gradient-to-b from-white/[0.05] via-slate-950/50 to-black/75 border border-white/15 border-t-white/25 shadow-[0_12px_36px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)]'
                    }`}
                  >
                    {/* Crystal refraction sheen flare */}
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-white/15 via-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                    {isCurrent && (
                      <div className="absolute top-0 right-0 w-52 h-52 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
                    )}

                    <div className="space-y-3.5 relative z-10">
                      {/* Header: Title & Badges */}
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight drop-shadow-sm">
                              {isEn ? 'Direct Funded' : 'Fondeo Directo'}
                            </h3>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.2)] flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-400" />
                            {size.popular ? (isEn ? 'Most Popular' : 'Más Popular') : (isEn ? 'Instant' : 'Instantáneo')}
                          </span>
                        </div>

                        <div className="mt-1 flex items-baseline justify-between">
                          <div className="text-3xl font-black text-white font-mono tracking-tight drop-shadow-md">
                            ${size.capital.toLocaleString()}
                          </div>
                          <div className="text-xs font-mono text-purple-300 font-black tracking-wider">
                            USDT
                          </div>
                        </div>
                      </div>

                      {/* Consistency 40% Add-on Selector in Crystal Bar */}
                      <div className="p-1 rounded-xl bg-white/[0.04] border border-white/15 backdrop-blur-xl shadow-inner grid grid-cols-2 gap-1 text-[11px] font-mono">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFlexAddon(false);
                          }}
                          className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
                            !isFlexAddon
                              ? 'bg-white/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border border-white/30'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {isEn ? '20% Standard' : '20% Estándar'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFlexAddon(true);
                          }}
                          className={`py-1.5 px-2 rounded-lg font-black transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                            isFlexAddon
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_16px_rgba(147,51,234,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-purple-300/40'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>40% Flex</span>
                          <span className="text-[8px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black">+15%</span>
                        </button>
                      </div>

                      {/* Specs - 2 Distinct Defined Frosted Glass Column Panels */}
                      <div className="grid grid-cols-2 gap-2.5 py-1 font-mono text-xs">
                        {/* Columna Izquierda: Parámetros de Riesgo */}
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-2.5 shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)]">
                          <div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              {isEn ? 'Leverage' : 'Apalancamiento'}
                            </div>
                            <div className="text-xs font-black text-white mt-0.5">20x – 100x</div>
                          </div>

                          <div className="pt-1.5 border-t border-white/10">
                            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              {isEn ? 'Daily Loss' : 'Pérdida Diaria'}
                            </div>
                            <div className="text-xs font-black text-rose-400 mt-0.5">2% (-${dailyLossAmount})</div>
                          </div>

                          <div className="pt-1.5 border-t border-white/10">
                            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              {isEn ? 'Max Drawdown' : 'Drawdown Máx'}
                            </div>
                            <div className="text-xs font-black text-rose-400 mt-0.5">8% (-${maxDrawdownAmount})</div>
                          </div>

                          <div className="pt-1.5 border-t border-white/10">
                            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Target</div>
                            <div className="text-xs font-black text-white mt-0.5">
                              {isEn ? 'No Target' : 'Sin Límite'}
                            </div>
                          </div>
                        </div>

                        {/* Columna Derecha: Reglas y Payouts */}
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-2.5 shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)]">
                          <div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              {isEn ? 'Consistency' : 'Consistencia'}
                            </div>
                            <div className={`text-xs font-black mt-0.5 ${isFlexAddon ? 'text-amber-300' : 'text-purple-300'}`}>
                              {isFlexAddon ? '40% Flex' : (isEn ? '20% Base' : '20% Base')}
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-white/10">
                            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              {isEn ? 'Min Days' : 'Días Mínimos'}
                            </div>
                            <div className="text-xs font-black text-purple-300 mt-0.5">
                              {isEn ? '5 Days' : '5 Días'}
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-white/10">
                            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              {isEn ? 'Profit Split' : 'Reparto'}
                            </div>
                            <div className="text-xs font-black text-emerald-400 mt-0.5">35/50/80/90</div>
                          </div>

                          <div className="pt-1.5 border-t border-white/10">
                            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              {isEn ? 'Loyalty Points' : 'Puntos 5x'}
                            </div>
                            <div className="text-xs font-black text-emerald-400 mt-0.5 flex items-center gap-0.5">
                              {Math.round(size.basePriceUSDT * (isFlexAddon ? 2.3 : 2))} Pts <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price, Coupon & Action Button */}
                      <div className="space-y-2.5 pt-1 relative z-10">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-3xl font-black text-white font-mono drop-shadow-md">
                              ${finalPrice}
                            </span>
                            <span className="text-xs font-mono text-purple-300 font-bold">USDT</span>
                            {discountPercent > 0 && (
                              <span className="text-xs font-mono text-slate-500 line-through">
                                ${activeBasePrice}
                              </span>
                            )}
                          </div>
                          {isFlexAddon && (
                            <span className="text-[10px] font-mono text-amber-300 font-bold">
                              {isEn ? '40% Add-on Active' : 'Add-on 40% Incluido'}
                            </span>
                          )}
                        </div>

                        {/* Coupon Banner in Glass */}
                        <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/15 backdrop-blur-md flex items-center justify-between text-[10px] font-mono shadow-inner">
                          <span className="text-slate-300 truncate">
                            💳 {isEn ? 'Code' : 'Código'} <strong className="text-white">EKLIPSE</strong> (-{discountPercent}%)
                          </span>
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {[0, 10].map(pct => (
                              <button
                                key={pct}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDiscountPercent(pct);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-bold cursor-pointer transition-all ${
                                  discountPercent === pct
                                    ? 'bg-purple-600 text-white font-black shadow-[0_0_8px_rgba(147,51,234,0.6)]'
                                    : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                              >
                                {pct === 0 ? 'Off' : '10%'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Primary CTA Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStart();
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-slate-950 font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_22px_rgba(245,158,11,0.4),inset_0_1px_1px_rgba(255,255,255,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                        >
                          <span>{isEn ? `Start with $${size.capital.toLocaleString()}${isFlexAddon ? ' Flex' : ''}` : `Empezar con $${size.capital.toLocaleString()}${isFlexAddon ? ' Flex' : ''}`}</span>
                          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Institutional Trust Guarantees Row */}
        <div className="w-full max-w-4xl pt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-center font-mono text-[11px] text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-md flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{isEn ? 'Instant Credentials' : 'Entrega Inmediata'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-md flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{isEn ? 'Direct USDT Futures' : 'Futuros en USDT'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-md flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{isEn ? 'No Evaluation Traps' : 'Sin Fases Trampa'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-md flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{isEn ? 'Bi-Weekly Payouts' : 'Retiros Quincenales'}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};


