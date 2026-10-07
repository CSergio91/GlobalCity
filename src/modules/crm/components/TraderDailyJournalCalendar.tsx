import React, { useMemo, useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  TrendingDown, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Layers,
  Sparkles
} from 'lucide-react';
import { TraderTradeAuditItem } from '../types/crm.types';

interface TraderDailyJournalCalendarProps {
  trades: TraderTradeAuditItem[];
  isEs?: boolean;
  selectedDay?: string | null;
  onSelectDay?: (dateKey: string) => void;
  currency?: string;
}

interface DayData {
  dateKey: string;     // YYYY-MM-DD
  dayNum: number;
  monthStr: string;
  dayOfWeekName: string;
  hasTrades: boolean;
  tradeCount: number;
  lots: number;
  pnl: number;
  isProfit: boolean;
  winCount: number;
  lossCount: number;
}

interface WeekRow {
  weekNumber: number;
  days: DayData[];
  totalPnl: number;
  totalTrades: number;
  totalLots: number;
  greenDays: number;
  redDays: number;
}

export const TraderDailyJournalCalendar: React.FC<TraderDailyJournalCalendarProps> = ({
  trades = [],
  isEs = true,
  selectedDay = null,
  onSelectDay,
  currency = 'USDT'
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Formato monetario institucional limpio
  const formatMoney = (val: number, withSign: boolean = false) => {
    const sign = withSign && val > 0 ? '+' : '';
    return `${sign}${val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
  };

  const closedTrades = useMemo(() => {
    return trades.filter(t => t.status === 'CLOSED');
  }, [trades]);

  // Agrupación de operaciones por día (YYYY-MM-DD)
  const dailyMap = useMemo(() => {
    const map = new Map<string, { count: number; lots: number; pnl: number; winCount: number; lossCount: number; dateObj: Date }>();

    closedTrades.forEach(t => {
      const rawDate = t.closedAt || t.openedAt;
      if (!rawDate) return;
      const d = new Date(rawDate);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const pnl = Number(t.realizedPnl) || 0;
      const size = Number(t.size) || 0;
      const cur = map.get(dateKey) || { count: 0, lots: 0, pnl: 0, winCount: 0, lossCount: 0, dateObj: d };
      cur.count += 1;
      cur.lots += size;
      cur.pnl += pnl;
      if (pnl > 0) cur.winCount += 1;
      else if (pnl < 0) cur.lossCount += 1;
      map.set(dateKey, cur);
    });

    return map;
  }, [closedTrades]);

  // Métricas agregadas de Journaling
  const journalMetrics = useMemo(() => {
    const days = Array.from(dailyMap.values());
    if (days.length === 0) {
      return {
        totalTradingDays: 0,
        greenDays: 0,
        redDays: 0,
        breakEvenDays: 0,
        dayWinRate: 0,
        bestDayPnl: 0,
        worstDayPnl: 0,
        avgDailyPnl: 0,
        totalRealizedPnl: 0
      };
    }

    let green = 0;
    let red = 0;
    let breakEven = 0;
    let totalPnl = 0;
    let bestDay = -Infinity;
    let worstDay = Infinity;

    days.forEach(d => {
      totalPnl += d.pnl;
      if (d.pnl > 0) green += 1;
      else if (d.pnl < 0) red += 1;
      else breakEven += 1;

      if (d.pnl > bestDay) bestDay = d.pnl;
      if (d.pnl < worstDay) worstDay = d.pnl;
    });

    const totalDays = days.length;
    const wr = totalDays > 0 ? (green / totalDays) * 100 : 0;
    const avg = totalDays > 0 ? totalPnl / totalDays : 0;

    return {
      totalTradingDays: totalDays,
      greenDays: green,
      redDays: red,
      breakEvenDays: breakEven,
      dayWinRate: wr,
      bestDayPnl: isFinite(bestDay) ? bestDay : 0,
      worstDayPnl: isFinite(worstDay) ? worstDay : 0,
      avgDailyPnl: avg,
      totalRealizedPnl: totalPnl
    };
  }, [dailyMap]);

  // Generación de semanas del Journaling (Lunes a Domingo + Total Semana)
  const calendarWeeks: WeekRow[] = useMemo(() => {
    const dates = Array.from(dailyMap.keys()).sort();

    let startDate: Date;
    let endDate: Date;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dates.length > 0) {
      const firstParts = dates[0].split('-').map(Number);
      startDate = new Date(firstParts[0], firstParts[1] - 1, firstParts[2]);

      const lastParts = dates[dates.length - 1].split('-').map(Number);
      const lastTradeDate = new Date(lastParts[0], lastParts[1] - 1, lastParts[2]);
      
      // La vista se extiende hasta la semana de hoy o del último trade, lo que sea posterior
      endDate = lastTradeDate > today ? lastTradeDate : today;
    } else {
      startDate = new Date(today);
      endDate = new Date(today);
    }

    // Calcular lunes de la semana de inicio
    const getMonday = (d: Date) => {
      const copy = new Date(d);
      const day = (copy.getDay() + 6) % 7; // 0 = Lunes, 6 = Domingo
      copy.setDate(copy.getDate() - day);
      copy.setHours(0, 0, 0, 0);
      return copy;
    };

    const currentMonday = getMonday(startDate);
    const endMonday = getMonday(endDate);

    const weekRows: WeekRow[] = [];
    let weekCount = 1;

    const dayNamesEs = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const dayNamesEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayNames = isEs ? dayNamesEs : dayNamesEn;

    const iterMonday = new Date(currentMonday);
    while (iterMonday <= endMonday) {
      const daysInWeek: DayData[] = [];
      let weekPnl = 0;
      let weekTrades = 0;
      let weekLots = 0;
      let weekGreen = 0;
      let weekRed = 0;

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(iterMonday);
        dayDate.setDate(iterMonday.getDate() + i);

        const dateKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
        const dayData = dailyMap.get(dateKey);

        const monthStr = dayDate.toLocaleDateString(isEs ? 'es-ES' : 'en-US', { month: 'short' });

        if (dayData && dayData.count > 0) {
          const isProfit = dayData.pnl >= 0;
          weekPnl += dayData.pnl;
          weekTrades += dayData.count;
          weekLots += dayData.lots;
          if (dayData.pnl > 0) weekGreen += 1;
          else if (dayData.pnl < 0) weekRed += 1;

          daysInWeek.push({
            dateKey,
            dayNum: dayDate.getDate(),
            monthStr,
            dayOfWeekName: dayNames[i],
            hasTrades: true,
            tradeCount: dayData.count,
            lots: dayData.lots,
            pnl: dayData.pnl,
            isProfit,
            winCount: dayData.winCount,
            lossCount: dayData.lossCount
          });
        } else {
          daysInWeek.push({
            dateKey,
            dayNum: dayDate.getDate(),
            monthStr,
            dayOfWeekName: dayNames[i],
            hasTrades: false,
            tradeCount: 0,
            lots: 0,
            pnl: 0,
            isProfit: false,
            winCount: 0,
            lossCount: 0
          });
        }
      }

      weekRows.push({
        weekNumber: weekCount,
        days: daysInWeek,
        totalPnl: weekPnl,
        totalTrades: weekTrades,
        totalLots: weekLots,
        greenDays: weekGreen,
        redDays: weekRed
      });

      weekCount += 1;
      iterMonday.setDate(iterMonday.getDate() + 7);
    }

    // Ordenar semanas de la más reciente a la más antigua para lectura natural institucional
    return weekRows.reverse();
  }, [dailyMap, isEs]);

  const dayHeaders = isEs 
    ? ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'] 
    : ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  return (
    <div className="w-full rounded-3xl bg-[#FAF8F5]/45 backdrop-blur-xs border border-[#E5DEC9] p-6 shadow-2xs space-y-5">
      {/* Header del Diario de Trading */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#ECE7DC]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0F172A] tracking-tight">
                {isEs ? 'Diario Forense de Trading (Weekly Journal Grid)' : 'Trader Forensic Journal (Weekly Grid)'}
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/80 border border-[#E5DEC9] px-2.5 py-0.5 rounded-full">
              {journalMetrics.totalTradingDays} {isEs ? 'jornadas operadas' : 'trading days'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {isEs 
              ? 'Rendimiento diario consolidado por día de la semana. Haz clic en cualquier recuadro para enfocar y auditar la curva de balance de ese día.' 
              : 'Consolidated performance per day of the week. Click any square to focus and audit balance evolution for that day.'}
          </p>
        </div>

        {/* KPIs Resumen del Diario */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Días Ganadores vs Perdedores */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 border border-[#E5DEC9] text-xs font-mono shadow-2xs">
            <div className="flex items-center gap-1 font-black text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{journalMetrics.greenDays} {isEs ? 'Verdes' : 'Green'}</span>
            </div>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-1 font-black text-rose-700">
              <XCircle className="w-3.5 h-3.5" />
              <span>{journalMetrics.redDays} {isEs ? 'Rojos' : 'Red'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold ml-1">
              ({journalMetrics.dayWinRate.toFixed(0)}% {isEs ? 'efectividad' : 'WR'})
            </span>
          </div>

          {/* Mejor Día */}
          {journalMetrics.bestDayPnl > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs font-mono font-bold text-emerald-900 shadow-2xs">
              <span className="text-[10px] text-emerald-700 font-semibold block">{isEs ? 'Mejor Día' : 'Best Day'}</span>
              <span>+{formatMoney(journalMetrics.bestDayPnl)}</span>
            </div>
          )}

          {/* Peor Día */}
          {journalMetrics.worstDayPnl < 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-50/80 border border-rose-200/80 text-xs font-mono font-bold text-rose-900 shadow-2xs">
              <span className="text-[10px] text-rose-700 font-semibold block">{isEs ? 'Peor Día' : 'Worst Day'}</span>
              <span>{formatMoney(journalMetrics.worstDayPnl)}</span>
            </div>
          )}

          {/* PnL Total Acumulado */}
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-mono font-black shadow-2xs">
            <span className="text-[9.5px] text-slate-400 uppercase tracking-wider block font-bold">
              {isEs ? 'Total Journal' : 'Journal Total'}
            </span>
            <span className={journalMetrics.totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {formatMoney(journalMetrics.totalRealizedPnl, true)}
            </span>
          </div>
        </div>
      </div>

      {/* Calendario Semanal de Cuadrados */}
      <div className="space-y-4">
        {/* Cabecera de Días de la Semana + Columna Total Semana */}
        <div className="hidden lg:grid grid-cols-8 gap-2.5 px-1 text-center font-mono font-black text-[10.5px] uppercase tracking-wider text-slate-500">
          {dayHeaders.map((header, idx) => (
            <div 
              key={header} 
              className={`py-1.5 rounded-xl border border-transparent ${
                idx >= 5 ? 'text-indigo-600 bg-indigo-50/40' : 'text-slate-600'
              }`}
            >
              {header}
            </div>
          ))}
          <div className="py-1.5 rounded-xl bg-[#0F172A] text-indigo-300 border border-slate-800">
            {isEs ? 'TOTAL SEMANA' : 'WEEK TOTAL'}
          </div>
        </div>

        {/* Filas de Semanas */}
        {calendarWeeks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 rounded-2xl border border-dashed border-[#E5DEC9] bg-white/30">
            <Clock className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-medium">
              {isEs ? 'Aún no hay operaciones registradas para generar el diario de trading.' : 'No closed trades recorded yet to generate the trading journal.'}
            </p>
          </div>
        ) : (
          calendarWeeks.map((week, weekIdx) => {
            return (
              <div 
                key={`week-${week.weekNumber}-${weekIdx}`}
                className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 items-stretch"
              >
                {/* 7 Cuadrados de Días (Lunes a Domingo) */}
                {week.days.map((day) => {
                  const isSelected = selectedDay === day.dateKey;
                  const isPositive = day.pnl > 0;
                  const isNegative = day.pnl < 0;

                  return (
                    <div
                      key={day.dateKey}
                      onClick={() => day.hasTrades && onSelectDay?.(day.dateKey)}
                      className={`relative p-3 rounded-2xl border transition-all flex flex-col justify-between min-h-[102px] ${
                        !day.hasTrades 
                          ? 'bg-white/30 border-[#E8E2D5]/60 hover:bg-white/50 text-slate-400' 
                          : isSelected
                          ? 'ring-2 ring-indigo-600 border-indigo-400 bg-indigo-50/90 shadow-md cursor-pointer'
                          : isPositive
                          ? 'bg-emerald-500/10 border-emerald-300/80 hover:border-emerald-400 hover:shadow-xs hover:bg-emerald-500/15 cursor-pointer'
                          : isNegative
                          ? 'bg-rose-500/10 border-rose-300/80 hover:border-rose-400 hover:shadow-xs hover:bg-rose-500/15 cursor-pointer'
                          : 'bg-white/70 border-slate-300/80 hover:border-slate-400 hover:shadow-xs cursor-pointer'
                      }`}
                      title={
                        day.hasTrades 
                          ? `${day.dayOfWeekName} ${day.dayNum} ${day.monthStr}: ${formatMoney(day.pnl, true)} (${day.tradeCount} trades) - ${isEs ? 'Clic para zoom' : 'Click to zoom'}`
                          : `${day.dayOfWeekName} ${day.dayNum} ${day.monthStr}: ${isEs ? 'Sin operaciones' : 'No trades'}`
                      }
                    >
                      {/* Top Bar del Día */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px] font-mono font-extrabold text-slate-700">
                          <span className="lg:hidden text-[10px] text-slate-400 uppercase mr-0.5">
                            {day.dayOfWeekName}
                          </span>
                          <span>{day.dayNum}</span>
                          <span className="text-[9.5px] text-slate-400 font-semibold">{day.monthStr}</span>
                        </div>

                        {day.hasTrades && (
                          <span className={`text-[9.5px] font-mono font-black px-1.5 py-0.5 rounded-md border ${
                            isPositive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : isNegative
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}>
                            {day.tradeCount} {day.tradeCount === 1 ? 'op' : 'ops'}
                          </span>
                        )}
                      </div>

                      {/* Cuerpo del Recuadro: PnL y Volumen */}
                      {day.hasTrades ? (
                        <div className="mt-2 space-y-0.5">
                          <div className={`text-xs sm:text-[13px] font-mono font-black tracking-tight ${
                            isPositive ? 'text-emerald-700' : isNegative ? 'text-rose-700' : 'text-slate-800'
                          }`}>
                            {formatMoney(day.pnl, true)}
                          </div>

                          <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-500">
                            <span>{day.lots.toFixed(2)} lot</span>
                            <span className="text-[9px] font-bold text-slate-400">
                              {day.winCount}G / {day.lossCount}P
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="my-auto py-1 text-center font-mono text-xs text-slate-300 select-none">
                          —
                        </div>
                      )}

                      {/* Indicador de Día Seleccionado */}
                      {isSelected && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-indigo-600" />
                      )}
                    </div>
                  );
                })}

                {/* CUADRADO 8: TOTAL SEMANA */}
                <div className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between min-h-[102px] ${
                  week.totalTrades > 0
                    ? 'bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-slate-800 text-white shadow-md'
                    : 'bg-[#0F172A]/70 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between text-[10px] font-mono font-extrabold uppercase tracking-wider text-indigo-300">
                    <span className="lg:hidden">{isEs ? 'Total Sem.' : 'Week Total'}</span>
                    <span className="hidden lg:inline">{isEs ? 'Semana' : 'Week'} {week.weekNumber}</span>
                    <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {week.totalTrades} {isEs ? 'ops' : 'trades'}
                    </span>
                  </div>

                  {week.totalTrades > 0 ? (
                    <div className="mt-2 space-y-1">
                      <div className={`text-sm sm:text-[14px] font-mono font-black ${
                        week.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {formatMoney(week.totalPnl, true)}
                      </div>

                      <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-300">
                        <span>{week.totalLots.toFixed(2)} lotes</span>
                        <div className="flex items-center gap-1 font-bold">
                          <span className="text-emerald-400">{week.greenDays}V</span>
                          <span className="text-slate-500">/</span>
                          <span className="text-rose-400">{week.redDays}R</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="my-auto py-1 text-center font-mono text-xs text-slate-500 select-none">
                      $0.00
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer del Diario */}
      <div className="pt-3 border-t border-[#ECE7DC] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 font-mono gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-emerald-500/20 border border-emerald-400" />
            <span className="text-[11px] text-slate-600">{isEs ? 'Día Ganador (+PnL)' : 'Winning Day'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-rose-500/20 border border-rose-400" />
            <span className="text-[11px] text-slate-600">{isEs ? 'Día Perdedor (-PnL)' : 'Losing Day'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-slate-900 border border-slate-700" />
            <span className="text-[11px] text-slate-600">{isEs ? 'Consolidado Semanal' : 'Weekly Total'}</span>
          </div>
        </div>

        {selectedDay && (
          <button
            onClick={() => onSelectDay?.('')}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
          >
            {isEs ? '✕ Limpiar filtro de día en el gráfico' : '✕ Reset day filter on chart'}
          </button>
        )}
      </div>
    </div>
  );
};
