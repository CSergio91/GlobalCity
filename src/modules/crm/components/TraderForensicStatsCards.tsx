import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  HelpCircle, 
  Layers, 
  Award,
  PieChart,
  ShieldCheck,
  Zap,
  Target,
  BarChart2
} from 'lucide-react';
import { TraderTradeAuditItem } from '../types/crm.types';

interface TraderForensicStatsCardsProps {
  account: {
    initialBalance: number;
    currentBalance: number;
    equity: number;
    currency?: string;
  };
  stats: {
    totalTrades: number;
    closedTradesCount: number;
    winRatePct: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
    netRealizedPnl: number;
    grossProfits: number;
    grossLosses: number;
  };
  trades: TraderTradeAuditItem[];
  isEs?: boolean;
}

interface AssetDistributionItem {
  symbol: string;
  cleanSymbol: string;
  tradesCount: number;
  totalLots: number;
  netPnl: number;
  percentage: number;
  color: string;
  isProfit: boolean;
}

const ASSET_PALETTE = [
  '#10B981', // Emerald
  '#6366F1', // Cobalt / Indigo
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#64748B'  // Slate
];

export const TraderForensicStatsCards: React.FC<TraderForensicStatsCardsProps> = ({
  account,
  stats,
  trades = [],
  isEs = true
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);

  // Formato monetario institucional limpio
  const formatMoney = (val: number, withSign: boolean = false) => {
    const sign = withSign && val > 0 ? '+' : '';
    return `${sign}${val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
  };

  const closedTrades = useMemo(() => {
    return trades.filter(t => t.status === 'CLOSED');
  }, [trades]);

  const winningTradesCount = useMemo(() => {
    return closedTrades.filter(t => (Number(t.realizedPnl) || 0) > 0).length;
  }, [closedTrades]);

  const losingTradesCount = useMemo(() => {
    return closedTrades.filter(t => (Number(t.realizedPnl) || 0) < 0).length;
  }, [closedTrades]);

  // 1. Cálculo de Lotes / Volumen Total
  const totalLots = useMemo(() => {
    if (closedTrades.length === 0) return 0;
    return closedTrades.reduce((acc, t) => acc + (Number(t.size) || 0), 0);
  }, [closedTrades]);

  // 2. RRR Promedio (Risk-Reward Ratio) = Beneficio Promedio / Pérdida Promedio
  const averageRrr = useMemo(() => {
    const avgWin = stats.avgWin || 0;
    const avgLoss = Math.abs(stats.avgLoss || 0);
    if (avgLoss > 0 && avgWin > 0) {
      return (avgWin / avgLoss).toFixed(2);
    }
    return avgWin > 0 ? '3.00' : '0.00';
  }, [stats.avgWin, stats.avgLoss]);

  // 3. Expectativa Matemática por Operación (Mathematical Expectancy)
  const expectancy = useMemo(() => {
    const wr = (stats.winRatePct || 0) / 100;
    const lr = 1 - wr;
    const avgWin = stats.avgWin || 0;
    const avgLoss = Math.abs(stats.avgLoss || 0);
    const exp = (wr * avgWin) - (lr * avgLoss);
    return exp;
  }, [stats.winRatePct, stats.avgWin, stats.avgLoss]);

  // 4. Ratio de Sharpe empírico
  const sharpeRatio = useMemo(() => {
    const returns = closedTrades
      .map(t => Number(t.realizedPnl ?? 0))
      .filter(p => !isNaN(p));

    if (returns.length < 3) return '-';

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev <= 0.0001) return '-';
    const sharpe = (mean / stdDev) * Math.sqrt(returns.length);
    return isFinite(sharpe) ? sharpe.toFixed(2) : '-';
  }, [closedTrades]);

  // 5. Cúmulo de Activos & Distribución en Pastel (100% en base a posiciones y volumen)
  const assetStats = useMemo(() => {
    const map = new Map<string, { count: number; lots: number; pnl: number }>();
    let totalPositions = 0;
    let totalLotsSum = 0;

    trades.forEach(t => {
      if (!t.symbol) return;
      const sym = t.symbol.toUpperCase();
      const cur = map.get(sym) || { count: 0, lots: 0, pnl: 0 };
      cur.count += 1;
      cur.lots += Number(t.size) || 0;
      cur.pnl += Number(t.realizedPnl) || 0;
      map.set(sym, cur);
      totalPositions += 1;
      totalLotsSum += Number(t.size) || 0;
    });

    const items: AssetDistributionItem[] = Array.from(map.entries())
      .map(([symbol, data], index) => {
        const percentage = totalPositions > 0 ? (data.count / totalPositions) * 100 : 0;
        return {
          symbol,
          cleanSymbol: symbol.replace('/', ''),
          tradesCount: data.count,
          totalLots: data.lots,
          netPnl: data.pnl,
          percentage: Number(percentage.toFixed(1)),
          color: ASSET_PALETTE[index % ASSET_PALETTE.length],
          isProfit: data.pnl >= 0
        };
      })
      .sort((a, b) => b.tradesCount - a.tradesCount || b.totalLots - a.totalLots);

    const topAsset = items.length > 0 ? items[0] : null;

    return {
      items,
      totalPositions,
      totalLotsSum,
      topAsset,
      uniqueAssetsCount: items.length
    };
  }, [trades]);

  // Diccionario de tooltips institucionales limpios
  const tooltips: Record<string, string> = {
    capital: isEs 
      ? 'Valor neto de la cuenta en tiempo real incluyendo posiciones flotantes (Equidad).' 
      : 'Real-time net account value including floating positions (Equity).',
    balance: isEs 
      ? 'Saldo efectivo consolidado tras el cierre de todas las operaciones.' 
      : 'Consolidated cash balance reflecting only closed operations.',
    winRate: isEs 
      ? 'Porcentaje de trades cerrados en ganancia respecto al total.' 
      : 'Percentage of winning closed trades over total operations.',
    avgWin: isEs 
      ? 'Ganancia media obtenida en operaciones positivas.' 
      : 'Average monetary gain on winning trades.',
    avgLoss: isEs 
      ? 'Pérdida media experimentada en operaciones negativas.' 
      : 'Average monetary loss on losing trades.',
    tradeCount: isEs 
      ? 'Número total de posiciones ejecutadas y cerradas en el reto.' 
      : 'Total number of executed and closed positions.',
    lots: isEs 
      ? 'Suma acumulada del volumen nominal o lotes operados.' 
      : 'Cumulative sum of notional volume or lots traded.',
    sharpe: isEs 
      ? 'Rendimiento ajustado al riesgo. Mide retorno sobre volatilidad.' 
      : 'Risk-adjusted return measuring return over volatility.',
    rrr: isEs 
      ? 'Ratio Riesgo/Beneficio Promedio (Ganancia promedio / Pérdida promedio).' 
      : 'Average Reward-to-Risk ratio.',
    expectancy: isEs 
      ? 'Expectativa matemática monetaria por cada operación ejecutada.' 
      : 'Expected monetary value per trade.',
    profitFactor: isEs 
      ? 'Coeficiente de beneficio: Ganancias brutas divididas entre Pérdidas brutas.' 
      : 'Gross profits divided by gross losses.',
    assets: isEs 
      ? 'Distribución porcentual de posiciones sobre el 100% de activos operados.' 
      : 'Percentage distribution of positions across 100% of traded assets.'
  };

  // Parámetros geométricos del Donut SVG (Pastel 100%)
  const donutSize = 148;
  const strokeWidth = 20;
  const donutRadius = (donutSize - strokeWidth) / 2; // (148 - 20) / 2 = 64
  const donutCenter = donutSize / 2; // 74
  const donutCircumference = 2 * Math.PI * donutRadius; // ~402.1

  let accumulatedPercent = 0;
  const hoveredAssetItem = assetStats.items.find(i => i.symbol === hoveredAsset);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-stretch">
      {/* ==================================================================== */}
      {/* 1. PANEL IZQUIERDO (7 COLS): ESTADÍSTICAS DEL TRADER POR ÁREAS      */}
      {/* ==================================================================== */}
      <div className="lg:col-span-7 rounded-3xl bg-[#FAF8F5]/45 backdrop-blur-xs border border-[#E5DEC9] p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
        <div>
          {/* Header de Estadísticas */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#ECE7DC]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-700">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#0F172A] tracking-tight">
                  {isEs ? 'Estadísticas del Trader & Calidad de Ejecución' : 'Trader Statistics & Execution Quality'}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {isEs ? 'Métricas forenses financieras agrupadas por áreas operativas' : 'Forensic financial metrics grouped by operational areas'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTooltip(prev => prev ? null : 'capital')}
              className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              title={isEs ? 'Ver glosario de términos' : 'View glossary'}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-Área A: Capital & Saldos Efectivos */}
          <div className="mt-4 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              {isEs ? '1. Capital & Saldos Efectivos' : '1. Capital & Effective Balances'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Capital (Equity) */}
              <div 
                title={tooltips.capital}
                className="p-3 rounded-2xl bg-white/70 border border-[#EBE5D8] hover:border-indigo-300 transition-all cursor-default"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold text-slate-500">
                    {isEs ? 'Capital (Equidad)' : 'Equity'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-base sm:text-lg font-mono font-black text-slate-900 mt-0.5">
                  {formatMoney(account.equity)}
                </div>
              </div>

              {/* Balance */}
              <div 
                title={tooltips.balance}
                className="p-3 rounded-2xl bg-white/70 border border-[#EBE5D8] hover:border-indigo-300 transition-all cursor-default"
              >
                <span className="text-[10.5px] font-mono font-bold text-slate-500 block">
                  {isEs ? 'Balance Consolidado' : 'Balance'}
                </span>
                <div className="text-base sm:text-lg font-mono font-black text-slate-900 mt-0.5">
                  {formatMoney(account.currentBalance)}
                </div>
              </div>

              {/* PnL Neto */}
              <div 
                className="p-3 rounded-2xl bg-white/70 border border-[#EBE5D8] hover:border-indigo-300 transition-all cursor-default"
              >
                <span className="text-[10.5px] font-mono font-bold text-slate-500 block">
                  {isEs ? 'PnL Neto Realizado' : 'Net Realized PnL'}
                </span>
                <div className={`text-base sm:text-lg font-mono font-black mt-0.5 ${stats.netRealizedPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatMoney(stats.netRealizedPnl, true)}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Área B: Consistencia & Calidad de Ratios */}
          <div className="mt-4 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              {isEs ? '2. Ratios & Consistencia de Estrategia' : '2. Ratios & Strategy Consistency'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Tasa Éxito */}
              <div 
                title={tooltips.winRate}
                className="p-2.5 rounded-xl bg-white/60 border border-[#EBE5D8] hover:border-slate-300 transition-all cursor-default"
              >
                <span className="text-[10px] font-mono font-bold text-slate-500 block">
                  {isEs ? 'Tasa Éxito' : 'Win Rate'}
                </span>
                <div className={`text-sm sm:text-base font-mono font-black mt-0.5 ${stats.winRatePct >= 50 ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {stats.winRatePct.toFixed(1)}%
                </div>
              </div>

              {/* Profit Factor */}
              <div 
                title={tooltips.profitFactor}
                className="p-2.5 rounded-xl bg-white/60 border border-[#EBE5D8] hover:border-slate-300 transition-all cursor-default"
              >
                <span className="text-[10px] font-mono font-bold text-slate-500 block">
                  Profit Factor
                </span>
                <div className={`text-sm sm:text-base font-mono font-black mt-0.5 ${stats.profitFactor >= 1.5 ? 'text-emerald-700' : stats.profitFactor >= 1.0 ? 'text-slate-900' : 'text-rose-700'}`}>
                  {stats.profitFactor.toFixed(2)}
                </div>
              </div>

              {/* RRR Promedio */}
              <div 
                title={tooltips.rrr}
                className="p-2.5 rounded-xl bg-white/60 border border-[#EBE5D8] hover:border-slate-300 transition-all cursor-default"
              >
                <span className="text-[10px] font-mono font-bold text-slate-500 block">
                  RRR Promedio
                </span>
                <div className="text-sm sm:text-base font-mono font-black text-slate-900 mt-0.5">
                  1:{averageRrr}
                </div>
              </div>

              {/* Ratio Sharpe */}
              <div 
                title={tooltips.sharpe}
                className="p-2.5 rounded-xl bg-white/60 border border-[#EBE5D8] hover:border-slate-300 transition-all cursor-default"
              >
                <span className="text-[10px] font-mono font-bold text-slate-500 block">
                  Ratio Sharpe
                </span>
                <div className="text-sm sm:text-base font-mono font-black text-slate-900 mt-0.5">
                  {sharpeRatio}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Área C: Actividad, Volumen & Expectativa */}
          <div className="mt-4 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              {isEs ? '3. Actividad, Ejecución & Ganancia Media' : '3. Activity, Execution & Average Gain'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Trades Totales */}
              <div 
                title={tooltips.tradeCount}
                className="p-2.5 rounded-xl bg-white/60 border border-[#EBE5D8] hover:border-slate-300 transition-all cursor-default"
              >
                <span className="text-[10px] font-mono font-bold text-slate-500 block">
                  {isEs ? 'Trades' : 'Trades'}
                </span>
                <div className="text-sm sm:text-base font-mono font-black text-slate-900 mt-0.5">
                  {stats.closedTradesCount} <span className="text-[10px] font-normal text-slate-400">({winningTradesCount}G / {losingTradesCount}P)</span>
                </div>
              </div>

              {/* Volumen Total */}
              <div 
                title={tooltips.lots}
                className="p-2.5 rounded-xl bg-white/60 border border-[#EBE5D8] hover:border-slate-300 transition-all cursor-default"
              >
                <span className="text-[10px] font-mono font-bold text-slate-500 block">
                  {isEs ? 'Volumen Total' : 'Total Lots'}
                </span>
                <div className="text-sm sm:text-base font-mono font-black text-slate-900 mt-0.5">
                  {totalLots > 0 ? totalLots.toFixed(2) : '0.00'} <span className="text-[10px] font-normal text-slate-400">lot</span>
                </div>
              </div>

              {/* Ganancia Prom */}
              <div 
                title={tooltips.avgWin}
                className="p-2.5 rounded-xl bg-white/60 border border-[#EBE5D8] hover:border-emerald-200 transition-all cursor-default"
              >
                <span className="text-[10px] font-mono font-bold text-slate-500 block">
                  {isEs ? 'Ganancia Prom' : 'Avg Win'}
                </span>
                <div className="text-sm sm:text-base font-mono font-black text-emerald-700 mt-0.5">
                  {stats.avgWin > 0 ? formatMoney(stats.avgWin) : '0 $'}
                </div>
              </div>

              {/* Pérdida Prom */}
              <div 
                title={tooltips.avgLoss}
                className="p-2.5 rounded-xl bg-white/60 border border-[#EBE5D8] hover:border-rose-200 transition-all cursor-default"
              >
                <span className="text-[10px] font-mono font-bold text-slate-500 block">
                  {isEs ? 'Pérdida Prom' : 'Avg Loss'}
                </span>
                <div className="text-sm sm:text-base font-mono font-black text-rose-700 mt-0.5">
                  {stats.avgLoss > 0 ? `-${formatMoney(stats.avgLoss)}` : '0 $'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notificación informativa del Tooltip Activo */}
        {activeTooltip && (
          <div className="mt-3 p-3 rounded-2xl bg-[#0F172A] border border-slate-700 shadow-xl animate-fadeIn flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs font-medium text-slate-100 leading-relaxed" style={{ color: '#F8FAFC' }}>
              {tooltips[activeTooltip]}
            </div>
            <button
              type="button"
              onClick={() => setActiveTooltip(null)}
              className="ml-auto text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 2. PANEL DERECHO (5 COLS): DISTRIBUCIÓN DE ACTIVOS (PASTEL 100%)    */}
      {/* ==================================================================== */}
      <div className="lg:col-span-5 rounded-3xl bg-[#FAF8F5]/45 backdrop-blur-xs border border-[#E5DEC9] p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
        <div>
          {/* Header de Distribución de Activos */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#ECE7DC]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-700">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#0F172A] tracking-tight">
                  {isEs ? 'Distribución de Activos' : 'Asset Distribution'}
                </h3>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/80 border border-[#E5DEC9] px-2.5 py-1 rounded-xl">
              {assetStats.totalPositions} {isEs ? 'posiciones' : 'positions'}
            </span>
          </div>

          {/* Donut SVG (Pastel 100%) */}
          <div className="flex items-center justify-center my-3">
            <div className="relative">
              <svg width={donutSize} height={donutSize} className="block overflow-visible">
                {assetStats.items.length === 0 ? (
                  <circle
                    cx={donutCenter}
                    cy={donutCenter}
                    r={donutRadius}
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth={strokeWidth}
                  />
                ) : (
                  assetStats.items.map((item) => {
                    const strokeDasharray = `${(item.percentage / 100) * donutCircumference} ${donutCircumference}`;
                    const strokeDashoffset = -((accumulatedPercent / 100) * donutCircumference);
                    accumulatedPercent += item.percentage;
                    const isHovered = hoveredAsset === item.symbol;

                    return (
                      <circle
                        key={item.symbol}
                        cx={donutCenter}
                        cy={donutCenter}
                        r={donutRadius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        transform={`rotate(-90 ${donutCenter} ${donutCenter})`}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredAsset(item.symbol)}
                        onMouseLeave={() => setHoveredAsset(null)}
                      />
                    );
                  })
                )}

                {/* Centro del Donut */}
                <g className="pointer-events-none">
                  {hoveredAssetItem ? (
                    <>
                      <text
                        x={donutCenter}
                        y={donutCenter - 4}
                        textAnchor="middle"
                        className="font-mono font-black text-sm fill-slate-900"
                      >
                        {hoveredAssetItem.percentage}%
                      </text>
                      <text
                        x={donutCenter}
                        y={donutCenter + 13}
                        textAnchor="middle"
                        className="font-mono font-bold text-[9.5px] fill-slate-500 uppercase tracking-tight"
                      >
                        {hoveredAssetItem.cleanSymbol}
                      </text>
                    </>
                  ) : (
                    <>
                      <text
                        x={donutCenter}
                        y={donutCenter - 4}
                        textAnchor="middle"
                        className="font-mono font-black text-base fill-slate-900"
                      >
                        {assetStats.totalPositions}
                      </text>
                      <text
                        x={donutCenter}
                        y={donutCenter + 13}
                        textAnchor="middle"
                        className="font-mono font-bold text-[9.5px] fill-slate-500 uppercase tracking-tight"
                      >
                        {isEs ? 'Posiciones' : 'Positions'}
                      </text>
                    </>
                  )}
                </g>
              </svg>
            </div>
          </div>

          {/* Banner de Activo Más Operado */}
          {assetStats.topAsset && (
            <div className="my-2.5 p-2 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-[10px] font-mono font-bold text-amber-950 uppercase">
                  {isEs ? 'Más Operado:' : 'Top Asset:'} <span className="font-black text-slate-900">{assetStats.topAsset.symbol}</span>
                </span>
              </div>
              <span className="text-[10px] font-mono font-black text-amber-800">
                {assetStats.topAsset.percentage}% {isEs ? 'del total' : 'share'}
              </span>
            </div>
          )}

          {/* Desglose de Activos */}
          <div className="space-y-1.5 overflow-y-auto max-h-[140px] pr-1 scrollbar-none">
            {assetStats.items.map((item) => (
              <div
                key={item.symbol}
                onMouseEnter={() => setHoveredAsset(item.symbol)}
                onMouseLeave={() => setHoveredAsset(null)}
                className={`p-2 rounded-xl border transition-all ${
                  hoveredAsset === item.symbol
                    ? 'bg-white border-indigo-300 shadow-2xs'
                    : 'bg-white/60 border-[#EBE5D8] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-mono font-bold text-slate-900 text-[11px]">
                      {item.symbol}
                    </span>
                    <span className="text-[9.5px] font-mono text-slate-400">
                      ({item.tradesCount} {isEs ? 'pos' : 'pos'})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="font-black text-slate-800">
                      {item.percentage}%
                    </span>
                    <span className={`text-[10px] font-bold ${item.isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {formatMoney(item.netPnl, true)}
                    </span>
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div className="w-full h-1 bg-slate-200/80 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer de Distribución de Activos */}
        <div className="pt-2.5 mt-2.5 border-t border-[#ECE7DC] flex items-center justify-between text-[10.5px] font-mono text-slate-500">
          <span>{isEs ? 'Volumen Total:' : 'Total Volume:'}</span>
          <span className="font-black text-slate-900">
            {assetStats.totalLotsSum.toFixed(2)} {isEs ? 'lotes' : 'lots'}
          </span>
        </div>
      </div>
    </div>
  );
};
