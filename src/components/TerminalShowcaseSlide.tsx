import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ArrowRight,
  TrendingUp,
  Sliders,
  Layers,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  BarChart2,
  Activity
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface TerminalShowcaseSlideProps {
  onNavigateToPlans?: () => void;
  onGoToDashboard?: () => void;
}

export const TerminalShowcaseSlide: React.FC<TerminalShowcaseSlideProps> = ({ 
  onNavigateToPlans,
  onGoToDashboard 
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [activePair, setActivePair] = useState<'BTC' | 'ETH' | 'SOL' | 'PEPE'>('BTC');
  const [activeSide, setActiveSide] = useState<'buy' | 'sell'>('buy');
  const [leverage, setLeverage] = useState<number>(27);
  const [selectedRatio, setSelectedRatio] = useState<string>('1:2');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('5m');
  const [orderExecutedFeedback, setOrderExecutedFeedback] = useState<boolean>(false);
  
  // Mobile tab toggle for iPhone SE and small screens
  const [terminalMobileTab, setTerminalMobileTab] = useState<'chart' | 'order'>('chart');

  // Desktop screen detector for reliable layout rendering
  const [isDesktop, setIsDesktop] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pairData = {
    BTC: { price: '$84,532.78', change: '+3.42%', high: '$85,210.00', low: '$83,100.00', vol: '$4.2B', latency: '0.4 ms', notional: '$27,000' },
    ETH: { price: '$3,485.20', change: '+2.18%', high: '$3,540.00', low: '$3,390.00', vol: '$2.1B', latency: '0.5 ms', notional: '$22,500' },
    SOL: { price: '$152.40', change: '+5.74%', high: '$156.80', low: '$144.50', vol: '$980M', latency: '0.4 ms', notional: '$18,000' },
    PEPE: { price: '$0.00001042', change: '+14.85%', high: '$0.00001120', low: '$0.00000890', vol: '$740M', latency: '0.3 ms', notional: '$15,000' }
  };

  const currentPair = pairData[activePair];

  const handleSimulateExecution = () => {
    setOrderExecutedFeedback(true);
    setTimeout(() => {
      setOrderExecutedFeedback(false);
    }, 2500);
  };

  const handleGoToPlans = () => {
    if (onNavigateToPlans) {
      onNavigateToPlans();
    } else {
      const el = document.getElementById('programs');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center px-2 sm:px-6 lg:px-8 py-2 sm:py-3 select-none overflow-y-auto no-scrollbar pt-12 sm:pt-0">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center space-y-2 sm:space-y-3.5 my-auto">
        
        {/* ========================================================================= */}
        {/* 1. HERO-STYLE H1 SECTION HEADER                                           */}
        {/* ========================================================================= */}
        <div className="w-full flex flex-col items-center text-center space-y-1.5 sm:space-y-2.5 max-w-4xl mx-auto shrink-0">
          
          {/* Overline Pre-title */}
          <div className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-slate-300/90 uppercase font-sans">
            {isEn ? '01 · PROPRIETARY TRADING DESK · 60 FPS GPU ENGINE' : '01 · TERMINAL PROPIA INSTITUCIONAL · MOTOR GPU 60 FPS'}
          </div>

          {/* Master Visual Headline H1 */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] leading-[1.1] text-white">
            <span className="inline-block drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
              {isEn ? 'Institutional Terminal.' : 'Terminal Institucional.'}{' '}
            </span>
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.45)]">
              {isEn ? 'Sub-Millisecond Execution.' : 'Ejecución Sub-Milisegundo.'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-300/85 font-normal max-w-xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] hidden sm:block">
            {isEn
              ? 'Zero slow MT5 bridges. Proprietary 60 FPS GPU canvas connected directly to Binance and Bybit order books with pre-trade risk evaluation (<1ms).'
              : 'Sin pasarelas lentas de MT5. Terminal web propia con aceleración por GPU a 60 FPS, conectada directamente a libros L2 con motor de riesgo en RAM.'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. INSTITUTIONAL TRADING TERMINAL MOCKUP (Glassmorphism Over Hero Canvas) */}
        {/* ========================================================================= */}
        <div className="w-full rounded-2xl bg-[#090C14]/80 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden backdrop-blur-xl">
          
          {/* Top Bar: Pair Switcher + Mark Price + Indicators + Account */}
          <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-[#0C101B]/90 border-b border-white/10 flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap text-xs">
            
            {/* Left: Tickers / Pair Pills */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
              {(['BTC', 'ETH', 'SOL', 'PEPE'] as const).map((pair) => (
                <button
                  key={pair}
                  onClick={() => setActivePair(pair)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-0.5 sm:gap-1 ${
                    activePair === pair
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span>{pair}/USDT</span>
                  {pair === 'PEPE' && (
                    <span className="text-[8px] px-1 rounded bg-purple-900/60 text-purple-200 border border-purple-400/30 font-black">
                      MEME
                    </span>
                  )}
                </button>
              ))}

              <div className="h-3 w-[1px] bg-white/10 mx-0.5 hidden sm:block" />

              {/* Live Ticker Telemetry */}
              <div className="flex items-center gap-1 font-mono text-[10px] sm:text-[10.5px]">
                <span className="text-white font-bold">{currentPair.price}</span>
                <span className="text-emerald-400 font-bold">{currentPair.change}</span>
              </div>
            </div>

            {/* Right: Account Pill */}
            <div className="flex items-center gap-1 font-mono text-[9.5px] sm:text-[10.5px] ml-auto">
              <div className="px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="hidden sm:inline">PRO 100K · </span>
                <span>$100,112.46</span>
              </div>
              <div className="hidden sm:flex items-center gap-0.5 text-slate-400">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{currentPair.latency}</span>
              </div>
            </div>

          </div>

          {/* Mobile Segmented Switcher (ONLY Rendered on Mobile Devices) */}
          {!isDesktop && (
            <div className="flex items-center justify-center p-1 bg-black/60 border-b border-white/10 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setTerminalMobileTab('chart')}
                className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  terminalMobileTab === 'chart'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart2 className="w-3 h-3" />
                <span>{isEn ? '1. Chart & Desk' : '1. Gráfico y Posiciones'}</span>
              </button>
              <button
                type="button"
                onClick={() => setTerminalMobileTab('order')}
                className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  terminalMobileTab === 'order'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>{isEn ? '2. Order Desk' : '2. Panel de Orden DMA'}</span>
              </button>
            </div>
          )}

          {/* Main Workspace: Chart (Desktop 8 cols) + Order Panel (Desktop 4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[220px] sm:min-h-[280px] bg-[#07090F]/90">
            
            {/* ------------------------------------------------------------------- */}
            {/* LEFT: Realistic Candlestick Chart + Risk Brackets                   */}
            {/* ------------------------------------------------------------------- */}
            {(isDesktop || terminalMobileTab === 'chart') && (
              <div className="lg:col-span-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative p-2 sm:p-3">
              
              {/* Dynamic Chart Body */}
              <div className="relative h-28 sm:h-40 lg:h-44 w-full overflow-hidden flex flex-col justify-between">
                
                {/* Visual Risk-Reward Box Overlay */}
                <div className="absolute inset-y-1 right-2 sm:right-10 w-36 sm:w-56 border border-dashed border-emerald-500/40 bg-emerald-500/5 rounded-lg pointer-events-none z-10 flex flex-col justify-between p-1">
                  <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-emerald-300 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-500/30">
                    <span>TP @$84,800.40</span>
                    <span className="font-bold">+$1,450.00</span>
                  </div>
                  <div className="border-t border-blue-400/60 my-auto flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-blue-300 bg-blue-950/70 px-1 py-0.2 rounded border border-blue-400/30">
                    <span>ENTRY @$84,605</span>
                    <span className="font-bold">1:3.45</span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-rose-300 bg-rose-950/80 px-1 py-0.2 rounded border border-rose-500/30">
                    <span>SL @$84,460.59</span>
                    <span className="font-bold">-$420.00</span>
                  </div>
                </div>

                {/* Floating Active Order Pill */}
                <div className="absolute top-1 left-1 z-20 pointer-events-none flex items-center gap-1 bg-[#0F1422]/90 border border-white/15 px-1.5 py-0.5 rounded-lg text-[8.5px] sm:text-[10px] font-mono shadow-xl backdrop-blur-md">
                  <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    SHORT {activePair}
                  </span>
                  <span className="text-emerald-400 font-bold">+$8.04 (+0.80%)</span>
                </div>

                {/* Candlestick Grid Graphics */}
                <div className="w-full h-full flex items-end gap-1 sm:gap-1.5 pt-5 opacity-85">
                  {[45, 32, 60, 85, 55, 95, 75, 115, 90, 130, 110, 145, 160, 135, 175, 190, 165, 185, 200, 180, 210, 195].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className="w-[1px] bg-slate-400/40 h-1.5" />
                      <div 
                        className={`w-full rounded-[1px] ${
                          i % 4 === 1 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                        }`} 
                        style={{ height: `${Math.min(105, h * 0.55)}px` }} 
                      />
                      <div className="w-[1px] bg-slate-400/40 h-1.5" />
                    </div>
                  ))}
                </div>

              </div>

              {/* Bottom Desk: Active Positions Table */}
              <div className="mt-1.5 pt-1.5 border-t border-white/10 font-mono text-[9px] sm:text-[10px]">
                <div className="flex items-center justify-between text-slate-400 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold border-b border-amber-400 pb-0.5">
                      Posiciones (3)
                    </span>
                  </div>
                  <div className="text-emerald-400 font-bold text-[9px]">
                    PnL: +$62.02 USDT
                  </div>
                </div>

                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-slate-300 bg-white/[0.02] p-1 rounded-lg border border-white/5">
                    <div className="flex items-center gap-1">
                      <span className="text-white font-bold">SOL/USDT</span>
                      <span className="px-1 rounded bg-rose-500/20 text-rose-300 text-[8px] font-bold">SHORT</span>
                    </div>
                    <span className="text-emerald-400 font-bold">+$91.65 (+9.17%)</span>
                  </div>
                </div>

              </div>

            </div>
          )}

            {/* ------------------------------------------------------------------- */}
            {/* RIGHT: Panel de Trading (Order Desk)                               */}
            {/* ------------------------------------------------------------------- */}
            {(isDesktop || terminalMobileTab === 'order') && (
              <div className="lg:col-span-4 p-2 sm:p-3 bg-[#090C16]/90 flex flex-col justify-between space-y-2 font-mono">
              
              <div className="space-y-1.5 sm:space-y-2">
                
                {/* Side Toggle: Comprar / Long vs Vender / Short */}
                <div className="grid grid-cols-2 gap-1 p-0.5 rounded-xl bg-black/50 border border-white/10">
                  <button
                    onClick={() => setActiveSide('buy')}
                    className={`py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                      activeSide === 'buy'
                        ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Comprar / Long
                  </button>
                  <button
                    onClick={() => setActiveSide('sell')}
                    className={`py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                      activeSide === 'sell'
                        ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Vender / Short
                  </button>
                </div>

                {/* Colateral & Notional */}
                <div className="flex items-center justify-between px-2 py-1 rounded-xl bg-black/60 border border-white/10 text-white font-bold text-[10.5px]">
                  <span className="text-[9.5px] text-slate-400">Margen: 1,000 USDT</span>
                  <span className="text-amber-400 text-[9.5px]">Notional: {currentPair.notional}</span>
                </div>

                {/* Automated Risk Brackets: SL & TP */}
                <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                  <div className="p-1 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <div className="flex items-center justify-between text-rose-400">
                      <span>SL: -2%</span>
                      <span className="font-bold">-$540</span>
                    </div>
                  </div>

                  <div className="p-1 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>TP: +4%</span>
                      <span className="font-bold">+$1,080</span>
                    </div>
                  </div>
                </div>

                {/* Leverage Slider */}
                <div className="space-y-0.5 text-[9.5px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Apalancamiento: <strong className="text-white">{leverage}x</strong></span>
                    <span className="text-[8.5px] text-slate-500">Max 100x</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={100}
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                  />
                </div>

              </div>

              {/* Simulated Interactive Order Execution (Pure Demo Feedback, ZERO terminal redirect) */}
              <button
                onClick={handleSimulateExecution}
                className={`w-full py-2 rounded-xl font-bold text-[10.5px] sm:text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                  orderExecutedFeedback 
                    ? 'bg-emerald-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.7)]' 
                    : 'text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                }`}
              >
                {orderExecutedFeedback ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ Llenado DMA en {currentPair.latency}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ Probar Llenado DMA (&lt;0.4ms)</span>
                  </>
                )}
              </button>

            </div>
          )}

        </div>
      </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM HIGH-CONVERSION ACTIONS (100% Conversion Focus)                 */}
        {/* ========================================================================= */}
        <div className="w-full flex items-center justify-between gap-2 pt-0.5 sm:pt-1 shrink-0">
          
          <div className="hidden sm:flex items-center gap-2 text-[10.5px] sm:text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>DMA Direct Book Routing · Conexión WebSocket Síncrona</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            {/* Primary Conversion Button: GET FUNDED ACCOUNT */}
            <button
              onClick={handleGoToPlans}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-mono font-black uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.45)] hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>{isEn ? 'Choose Funded Account' : 'Elegir Cuenta de Fondeo'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>

            {/* Horizontal Slide Switcher to Dashboard */}
            {onGoToDashboard && (
              <button
                onClick={onGoToDashboard}
                className="px-3 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-mono font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                title="Ver Dashboard"
              >
                <span>{isEn ? 'Dashboard' : 'Dashboard'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
