import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Monitor,
  Activity,
  Sliders,
  Maximize2,
  Camera,
  CheckCircle2,
  Crosshair,
  Minus,
  PenTool,
  Type,
  Smile,
  BarChart2,
  Lock,
  ChevronDown,
  Globe
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import terminalPepeWebp from '../assets/images/terminal.webp';
import terminalPepePng from '../assets/images/terminal.png';

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

  // ============================================================================
  // 1. MOUSE PARALLAX (Resortes elásticos como en el Hero para efecto 2.5D)
  // ============================================================================
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 100, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Pepe (Movimiento en contraposición al cursor con rotación elástica)
  const pepeX = useTransform(smoothX, [-1, 1], [-20, 20]);
  const pepeY = useTransform(smoothY, [-1, 1], [-14, 14]);
  const pepeRotate = useTransform(smoothX, [-1, 1], [-1.8, 1.8]);
  const glowX = useTransform(smoothX, [-1, 1], [-25, 25]);
  const glowY = useTransform(smoothY, [-1, 1], [-18, 18]);

  // Terminal Window (Desplazamiento complementario con inclinación 3D)
  const terminalX = useTransform(smoothX, [-1, 1], [12, -12]);
  const terminalY = useTransform(smoothY, [-1, 1], [8, -8]);
  const terminalRotateX = useTransform(smoothY, [-1, 1], [-1.5, 1.5]);
  const terminalRotateY = useTransform(smoothX, [-1, 1], [1.5, -1.5]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set((e.clientX - centerX) / centerX);
      mouseY.set((e.clientY - centerY) / centerY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // ============================================================================
  // 2. ESTADOS INTERACTIVOS DE LA TERMINAL
  // ============================================================================
  const [activeSide, setActiveSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<string>('Market');
  const [orderSize, setOrderSize] = useState<number>(1000);
  const [sliderPercent, setSliderPercent] = useState<number>(25);
  const [activeTimeframe, setActiveTimeframe] = useState<string>('15m');
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');
  const [isOrderPlaced, setIsOrderPlaced] = useState<boolean>(false);

  // Tickers interactivos superiores
  const tickers = [
    {
      symbol: 'BTC/USDT',
      price: '84,532.78',
      change: '+3.42%',
      isPositive: true,
      iconColor: 'text-[#F7931A]',
      sparkline: 'M0,15 Q8,5 16,12 T32,8 T48,14 T64,4'
    },
    {
      symbol: 'ETH/USDT',
      price: '3,267.14',
      change: '+2.11%',
      isPositive: true,
      iconColor: 'text-[#627EEA]',
      sparkline: 'M0,14 Q8,10 16,6 T32,12 T48,5 T64,3'
    },
    {
      symbol: 'SOL/USDT',
      price: '198.43',
      change: '-0.62%',
      isPositive: false,
      iconColor: 'text-[#14F195]',
      sparkline: 'M0,4 Q8,10 16,8 T32,15 T48,11 T64,16'
    }
  ];

  const handleSliderChange = (pct: number) => {
    setSliderPercent(pct);
    setOrderSize(Math.round(4000 * (pct / 100)));
  };

  const handleBuyOrder = () => {
    setIsOrderPlaced(true);
    setTimeout(() => {
      setIsOrderPlaced(false);
    }, 2500);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between items-center px-3 sm:px-6 lg:px-8 py-1 sm:py-2 select-none overflow-y-auto no-scrollbar relative">
      
      {/* Luz ambiental dorada central */}
      <motion.div 
        style={{ x: glowX, y: glowY }}
        className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" 
      />

      <div className="w-full max-w-7xl mx-auto flex flex-col justify-between h-full space-y-2 sm:space-y-3 my-auto">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER ROW: TITLE & SUBTITLE + MINI MARKET TICKERS                 */}
        {/* ========================================================================= */}
        <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 sm:gap-4 shrink-0">
          
          {/* Left: Badge, Heading, Subtitle */}
          <div className="flex flex-col space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase w-fit shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <span>{isEn ? 'EKLIPSE TERMINAL' : 'EKLIPSE TERMINAL'}</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-none text-white">
              <span>{isEn ? 'Institutional Trading. ' : 'Institutional Trading. '}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                {isEn ? 'In your hands.' : 'In your hands.'}
              </span>
            </h1>

            <p className="text-[11px] sm:text-xs text-slate-400 font-normal">
              {isEn 
                ? 'Analyze, Execute, Manage your risk. All from a single terminal.' 
                : 'Analiza, Ejecuta, Gestiona tu riesgo. Todo desde un único terminal.'}
            </p>
          </div>

          {/* Right: Mini Market Ticker Cards + Link */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap lg:flex-nowrap">
            {tickers.map((t) => (
              <div 
                key={t.symbol}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#090C14]/85 border border-white/10 backdrop-blur-md shadow-lg hover:border-amber-400/30 transition-all cursor-pointer"
              >
                {/* Symbol & Price */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${t.isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className="text-[10px] sm:text-[11px] font-bold text-white font-mono">{t.symbol}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9.5px] sm:text-[10px] font-mono">
                    <span className="text-slate-200 font-semibold">{t.price}</span>
                    <span className={`font-bold ${t.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.change}
                    </span>
                  </div>
                </div>

                {/* Mini Sparkline SVG */}
                <div className="w-10 h-5 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 64 20">
                    <path 
                      d={t.sparkline} 
                      fill="none" 
                      stroke={t.isPositive ? '#10B981' : '#F43F5E'} 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                    />
                  </svg>
                </div>
              </div>
            ))}

            {/* Ver todos los mercados */}
            <button 
              onClick={() => {
                const el = document.getElementById('programs');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2 py-1 rounded-xl text-[10px] sm:text-[11px] font-mono font-medium text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{isEn ? 'View all markets' : 'Ver todos los mercados'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. MAIN STAGE: PEPE TRADER (LEFT) + INSTITUTIONAL TERMINAL CARD (RIGHT)    */}
        {/* ========================================================================= */}
        <div className="w-full relative flex flex-col lg:flex-row items-center lg:items-end justify-between gap-3 lg:gap-4 my-auto">
          
          {/* ----------------------------------------------------------------------- */}
          {/* PEPE THE TRADER: ELASTIC PARALLAX SPRINGS LAYER (LEFT FOREGROUND)       */}
          {/* ----------------------------------------------------------------------- */}
          <motion.div 
            style={{ 
              x: pepeX, 
              y: pepeY, 
              rotateZ: pepeRotate
            }}
            className="w-[280px] sm:w-[340px] md:w-[380px] lg:w-[420px] xl:w-[450px] shrink-0 z-20 flex items-end justify-center lg:justify-start pointer-events-none select-none lg:-mr-12 xl:-mr-16"
          >
            <div className="relative w-full">
              {/* Glowing Aura behind Pepe */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/25 via-amber-400/10 to-transparent blur-2xl rounded-full scale-90 -z-10" />
              
              <img 
                src={terminalPepeWebp} 
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== terminalPepePng) {
                    target.src = terminalPepePng;
                  }
                }}
                alt="Pepe The Funded Trader at Eklipse Terminal" 
                className="w-full h-auto max-h-[38vh] sm:max-h-[44vh] lg:max-h-[50vh] object-contain object-bottom filter contrast-105 brightness-105 drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)]"
                loading="eager"
              />
            </div>
          </motion.div>

          {/* ----------------------------------------------------------------------- */}
          {/* INSTITUTIONAL TERMINAL WINDOW CARD (CENTER & RIGHT)                     */}
          {/* ----------------------------------------------------------------------- */}
          <motion.div 
            style={{ 
              x: terminalX, 
              y: terminalY,
              rotateX: terminalRotateX,
              rotateY: terminalRotateY,
              perspective: 1200 
            }}
            className="flex-1 min-w-0 w-full z-10 rounded-2xl bg-[#090C14]/90 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-xl"
          >
            
            {/* TERMINAL TOP BAR */}
            <div className="px-3 sm:px-4 py-2 bg-[#0C101B]/95 border-b border-white/10 flex items-center justify-between gap-2 flex-wrap text-xs">
              
              {/* Pair Badge & Price Telemetry */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#F7931A] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                    ₿
                  </div>
                  <span className="font-mono font-bold text-white text-xs sm:text-sm">BTC/USDT</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">+3.42%</span>
                </div>

                <div className="h-4 w-[1px] bg-white/15 mx-1 hidden sm:block" />

                {/* Timeframes */}
                <div className="flex items-center gap-0.5 font-mono text-[10px] sm:text-[11px]">
                  {(['1m', '5m', '15m', '1h', '4h', '1D'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setActiveTimeframe(tf)}
                      className={`px-1.5 sm:px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
                        activeTimeframe === tf
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Tools Icons */}
              <div className="flex items-center gap-2 text-slate-400 text-[11px] ml-auto">
                <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-mono">{isEn ? 'Indicators' : 'Indicadores'}</span>
                </button>
                <button className="p-1 hover:text-white transition-colors cursor-pointer rounded hover:bg-white/5">
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 hover:text-white transition-colors cursor-pointer rounded hover:bg-white/5">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* MAIN CHART + ORDER ENTRY SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[260px] sm:min-h-[300px] bg-[#07090F]/95">
              
              {/* LEFT & CENTER: CANDLESTICK CHART */}
              <div className="lg:col-span-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative p-2 sm:p-3">
                
                {/* Toolbar Izquierda + Candlestick Stage */}
                <div className="relative w-full h-44 sm:h-52 flex">
                  
                  {/* Vertical Drawing Tools Pallet */}
                  <div className="hidden sm:flex flex-col gap-2 pr-2.5 border-r border-white/5 text-slate-500 shrink-0">
                    <Crosshair className="w-3.5 h-3.5 text-amber-400 hover:text-amber-300 cursor-pointer" />
                    <Minus className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                    <Sliders className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                    <PenTool className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                    <Type className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                    <Smile className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                  </div>

                  {/* Candlestick Graphic Simulation */}
                  <div className="flex-1 relative pl-2 flex flex-col justify-between overflow-hidden">
                    
                    {/* Current Price Line & Badge */}
                    <div className="absolute top-[38%] left-0 right-0 border-b border-dashed border-emerald-400/60 z-10 flex items-center justify-end">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-black font-mono font-bold text-[9px] shadow-[0_0_12px_rgba(16,185,129,0.5)] mr-1">
                        84,532.78
                      </span>
                    </div>

                    {/* Price Grid Y Axis Labels */}
                    <div className="absolute right-1 top-0 bottom-6 flex flex-col justify-between font-mono text-[8px] text-slate-500 select-none pointer-events-none">
                      <span>86,000.00</span>
                      <span>85,000.00</span>
                      <span>84,000.00</span>
                      <span>83,000.00</span>
                      <span>82,000.00</span>
                      <span>81,000.00</span>
                    </div>

                    {/* Realistic Candlesticks */}
                    <div className="w-full h-[80%] flex items-end gap-1 sm:gap-1.5 pt-2 pr-14">
                      {[
                        { h: 35, up: false }, { h: 50, up: true }, { h: 42, up: false },
                        { h: 65, up: true }, { h: 55, up: false }, { h: 80, up: true },
                        { h: 70, up: true }, { h: 95, up: true }, { h: 85, up: false },
                        { h: 110, up: true }, { h: 125, up: true }, { h: 105, up: false },
                        { h: 140, up: true }, { h: 130, up: false }, { h: 155, up: true },
                        { h: 145, up: false }, { h: 170, up: true }, { h: 160, up: false },
                        { h: 180, up: true }, { h: 172, up: false }, { h: 195, up: true }
                      ].map((candle, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div className={`w-[1px] ${candle.up ? 'bg-emerald-400/60' : 'bg-rose-400/60'}`} style={{ height: '6px' }} />
                          <div 
                            className={`w-full rounded-[1px] transition-all duration-300 ${
                              candle.up 
                                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.25)]' 
                                : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.25)]'
                            }`}
                            style={{ height: `${Math.min(105, candle.h * 0.52)}px` }}
                          />
                          <div className={`w-[1px] ${candle.up ? 'bg-emerald-400/60' : 'bg-rose-400/60'}`} style={{ height: '6px' }} />
                        </div>
                      ))}
                    </div>

                    {/* Volume Bars */}
                    <div className="w-full h-8 flex items-end gap-1 sm:gap-1.5 pr-14 border-t border-white/5 pt-1 opacity-70">
                      {[15, 22, 18, 30, 25, 40, 35, 48, 38, 55, 60, 45, 65, 52, 70, 58, 80, 68, 85, 75, 90].map((v, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 rounded-[1px] ${i % 2 === 0 ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`}
                          style={{ height: `${v * 0.28}px` }}
                        />
                      ))}
                    </div>

                    {/* Bottom Time Axis */}
                    <div className="w-full flex justify-between pr-14 text-[8px] font-mono text-slate-500 pt-1 border-t border-white/5">
                      <span>12:00</span>
                      <span>18:00</span>
                      <span className="text-amber-400/80 font-bold">12 Feb</span>
                      <span>06:00</span>
                      <span>12:00</span>
                      <span>18:00</span>
                    </div>

                  </div>

                </div>

                {/* BOTTOM POSITIONS PANEL */}
                <div className="mt-2 pt-2 border-t border-white/10 font-mono text-[9px] sm:text-[10px]">
                  
                  {/* Position Tabs */}
                  <div className="flex items-center gap-3 text-slate-400 pb-1.5 border-b border-white/5">
                    <button 
                      onClick={() => setActiveTab('positions')}
                      className={`pb-0.5 cursor-pointer font-bold ${activeTab === 'positions' ? 'text-amber-300 border-b-2 border-amber-400' : 'hover:text-white'}`}
                    >
                      {isEn ? 'Positions (2)' : 'Posiciones (2)'}
                    </button>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className={`pb-0.5 cursor-pointer ${activeTab === 'orders' ? 'text-amber-300 border-b-2 border-amber-400' : 'hover:text-white'}`}
                    >
                      {isEn ? 'Orders (1)' : 'Órdenes (1)'}
                    </button>
                    <button 
                      onClick={() => setActiveTab('history')}
                      className={`pb-0.5 cursor-pointer ${activeTab === 'history' ? 'text-amber-300 border-b-2 border-amber-400' : 'hover:text-white'}`}
                    >
                      {isEn ? 'History' : 'Historial'}
                    </button>
                  </div>

                  {/* Positions Table */}
                  <div className="overflow-x-auto no-scrollbar pt-1.5">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-500 text-[8px] uppercase tracking-wider">
                          <th className="pb-1">{isEn ? 'Symbol' : 'Símbolo'}</th>
                          <th className="pb-1">{isEn ? 'Side' : 'Lado'}</th>
                          <th className="pb-1">{isEn ? 'Size' : 'Tamaño'}</th>
                          <th className="pb-1">{isEn ? 'Entry' : 'Entrada'}</th>
                          <th className="pb-1">{isEn ? 'Mark Price' : 'Precio actual'}</th>
                          <th className="pb-1">{isEn ? 'PnL (USDT)' : 'PnL (USDT)'}</th>
                          <th className="pb-1">{isEn ? 'PnL (%)' : 'PnL (%)'}</th>
                          <th className="pb-1">TP / SL</th>
                          <th className="pb-1 text-right">{isEn ? 'Action' : 'Acciones'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <tr className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-1 font-bold text-white flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F7931A]" />
                            BTC/USDT
                          </td>
                          <td className="py-1 text-emerald-400 font-bold">Long</td>
                          <td className="py-1 text-slate-300">1,000 USDT</td>
                          <td className="py-1 text-slate-400">83,450.20</td>
                          <td className="py-1 text-white font-bold">84,532.78</td>
                          <td className="py-1 text-emerald-400 font-bold">+$1,082.58</td>
                          <td className="py-1 text-emerald-400 font-bold">+11.38%</td>
                          <td className="py-1 text-slate-400 text-[8px]">85,800 / 83,200</td>
                          <td className="py-1 text-right">
                            <button className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-[8px] transition-colors cursor-pointer">
                              {isEn ? 'Close' : 'Cerrar'}
                            </button>
                          </td>
                        </tr>
                        <tr className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-1 font-bold text-white flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#627EEA]" />
                            ETH/USDT
                          </td>
                          <td className="py-1 text-rose-400 font-bold">Short</td>
                          <td className="py-1 text-slate-300">500 USDT</td>
                          <td className="py-1 text-slate-400">3,312.34</td>
                          <td className="py-1 text-white font-bold">3,267.14</td>
                          <td className="py-1 text-emerald-400 font-bold">+$22.50</td>
                          <td className="py-1 text-emerald-400 font-bold">+4.50%</td>
                          <td className="py-1 text-slate-400 text-[8px]">3,150 / 3,420</td>
                          <td className="py-1 text-right">
                            <button className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-[8px] transition-colors cursor-pointer">
                              {isEn ? 'Close' : 'Cerrar'}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>

              {/* RIGHT: ORDER ENTRY PANEL */}
              <div className="lg:col-span-4 p-2.5 sm:p-3 flex flex-col justify-between space-y-2 bg-[#0B0F19]/90 font-mono text-xs">
                
                {/* Comprar / Vender Tabs */}
                <div className="grid grid-cols-2 gap-1 p-0.5 rounded-xl bg-black/50 border border-white/5">
                  <button
                    onClick={() => setActiveSide('buy')}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
                      activeSide === 'buy'
                        ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isEn ? 'Buy' : 'Comprar'}
                  </button>
                  <button
                    onClick={() => setActiveSide('sell')}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
                      activeSide === 'sell'
                        ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isEn ? 'Sell' : 'Vender'}
                  </button>
                </div>

                {/* Tipo de Orden */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{isEn ? 'Order Type' : 'Tipo de orden'}</span>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-white cursor-pointer">
                    <span>{orderType}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </div>

                {/* Tamaño (Size) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{isEn ? 'Size' : 'Tamaño'}</span>
                    <span className="text-white font-bold">{orderSize} USDT</span>
                  </div>
                  
                  {/* Percentage Slider (25% 50% 75% 100%) */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => handleSliderChange(pct)}
                        className={`flex-1 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                          sliderPercent === pct 
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                            : 'bg-black/30 text-slate-500 hover:text-white'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stop Loss (Opcional) */}
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[10px]">
                  <span className="text-slate-400">{isEn ? 'Stop Loss (Optional)' : 'Stop Loss (Opcional)'}</span>
                  <span className="text-rose-400 font-bold">83,200.00 USDT</span>
                </div>

                {/* Take Profit (Opcional) */}
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[10px]">
                  <span className="text-slate-400">{isEn ? 'Take Profit (Optional)' : 'Take Profit (Opcional)'}</span>
                  <span className="text-emerald-400 font-bold">85,800.00 USDT</span>
                </div>

                {/* Big Action Button */}
                <button
                  onClick={handleBuyOrder}
                  className={`w-full py-2.5 rounded-xl font-bold font-sans text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-lg flex items-center justify-center gap-1.5 ${
                    isOrderPlaced
                      ? 'bg-emerald-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.6)]'
                      : activeSide === 'buy'
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  }`}
                >
                  {isOrderPlaced ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isEn ? 'ORDER SUBMITTED' : 'ORDEN EJECUTADA'}</span>
                    </>
                  ) : (
                    <span>{activeSide === 'buy' ? 'Comprar BTC/USDT' : 'Vender BTC/USDT'}</span>
                  )}
                </button>

                {/* Margin, Commission, Leverage Footer */}
                <div className="space-y-0.5 pt-1 border-t border-white/5 text-[9px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>{isEn ? 'Required Margin' : 'Margen requerido'}</span>
                    <span className="text-slate-200">1,000 USDT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isEn ? 'Estimated Fee' : 'Comisión estimada'}</span>
                    <span className="text-slate-200">0.04 USDT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isEn ? 'Leverage' : 'Apalancamiento'}</span>
                    <span className="text-amber-400 font-bold">27x</span>
                  </div>
                </div>

              </div>

            </div>

          </motion.div>

        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM 4 FEATURE COLUMNS / PILLS                                       */}
        {/* ========================================================================= */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 shrink-0 pt-1">
          
          <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl bg-[#090C14]/80 border border-white/10 backdrop-blur-md shadow-md hover:border-amber-400/30 transition-all">
            <div className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/20">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-white">
                {isEn ? 'Ultra-fast execution' : 'Ejecución ultrarrápida'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isEn ? 'Institutional grade infrastructure.' : 'Infraestructura de grado institucional.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl bg-[#090C14]/80 border border-white/10 backdrop-blur-md shadow-md hover:border-amber-400/30 transition-all">
            <div className="w-7 h-7 rounded-lg bg-emerald-400/10 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/20">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-white">
                {isEn ? 'Real-time data' : 'Datos en tiempo real'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isEn ? 'Global markets 24/7.' : 'Mercados globales 24/7.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl bg-[#090C14]/80 border border-white/10 backdrop-blur-md shadow-md hover:border-amber-400/30 transition-all">
            <div className="w-7 h-7 rounded-lg bg-blue-400/10 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-white">
                {isEn ? 'Risk control' : 'Control de riesgo'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isEn ? 'Advanced management tools.' : 'Herramientas avanzadas de gestión.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl bg-[#090C14]/80 border border-white/10 backdrop-blur-md shadow-md hover:border-amber-400/30 transition-all">
            <div className="w-7 h-7 rounded-lg bg-purple-400/10 text-purple-300 flex items-center justify-center shrink-0 border border-purple-400/20">
              <Monitor className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-white">
                {isEn ? 'All in one terminal' : 'Todo en un solo terminal'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isEn ? 'Analyze, execute and monitor.' : 'Analiza, ejecuta y supervisa.'}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
