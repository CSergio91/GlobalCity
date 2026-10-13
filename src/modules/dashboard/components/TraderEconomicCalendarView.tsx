import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Filter, 
  ShieldAlert, 
  RefreshCw, 
  Globe, 
  TrendingUp, 
  ArrowUpRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface EconomicEvent {
  id: string;
  timeUTC: string;
  timestamp: number;
  country: string;
  flag: string;
  currency: string;
  event: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actual?: string;
  forecast?: string;
  previous?: string;
  restrictedForPropFirm?: boolean;
}

const DEFAULT_EVENTS: EconomicEvent[] = [
  {
    id: 'ev-1',
    timeUTC: '12:30',
    timestamp: Date.now() + 1000 * 60 * 45, // en 45 min
    country: 'USA',
    flag: '🇺🇸',
    currency: 'USD',
    event: 'Core CPI (MoM) & Consumer Price Index YoY',
    impact: 'HIGH',
    actual: '',
    forecast: '3.1%',
    previous: '3.2%',
    restrictedForPropFirm: true
  },
  {
    id: 'ev-2',
    timeUTC: '14:00',
    timestamp: Date.now() + 1000 * 60 * 135,
    country: 'USA',
    flag: '🇺🇸',
    currency: 'USD',
    event: 'FOMC Member Speech & Inflation Outlook',
    impact: 'HIGH',
    actual: '',
    forecast: '-',
    previous: '-',
    restrictedForPropFirm: true
  },
  {
    id: 'ev-3',
    timeUTC: '08:00',
    timestamp: Date.now() - 1000 * 60 * 120,
    country: 'EUR',
    flag: '🇪🇺',
    currency: 'EUR',
    event: 'ECB Non-Monetary Policy Meeting',
    impact: 'MEDIUM',
    actual: 'Neutral',
    forecast: 'Neutral',
    previous: 'Dovish',
    restrictedForPropFirm: false
  },
  {
    id: 'ev-4',
    timeUTC: '09:30',
    timestamp: Date.now() - 1000 * 60 * 30,
    country: 'GBR',
    flag: '🇬🇧',
    currency: 'GBP',
    event: 'Retail Sales MoM',
    impact: 'MEDIUM',
    actual: '0.4%',
    forecast: '0.2%',
    previous: '-0.3%',
    restrictedForPropFirm: false
  },
  {
    id: 'ev-5',
    timeUTC: '15:30',
    timestamp: Date.now() + 1000 * 60 * 240,
    country: 'USA',
    flag: '🇺🇸',
    currency: 'USD',
    event: 'Crude Oil Inventories',
    impact: 'MEDIUM',
    actual: '',
    forecast: '-1.2M',
    previous: '+2.1M',
    restrictedForPropFirm: false
  },
  {
    id: 'ev-6',
    timeUTC: '16:00',
    timestamp: Date.now() + 1000 * 60 * 300,
    country: 'GLOBAL',
    flag: '🌐',
    currency: 'BTC',
    event: 'Crypto Derivatives Monthly Expiry & Max Pain',
    impact: 'HIGH',
    actual: '',
    forecast: '$64,500',
    previous: '$62,000',
    restrictedForPropFirm: true
  },
  {
    id: 'ev-7',
    timeUTC: '19:00',
    timestamp: Date.now() + 1000 * 60 * 480,
    country: 'USA',
    flag: '🇺🇸',
    currency: 'USD',
    event: 'Federal Budget Balance',
    impact: 'LOW',
    actual: '',
    forecast: '-$120B',
    previous: '-$145B',
    restrictedForPropFirm: false
  }
];

export const TraderEconomicCalendarView: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [selectedImpact, setSelectedImpact] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [utcTime, setUtcTime] = useState<string>('');

  // Caché Local-First (15 min) para evitar egress repetido
  const [events, setEvents] = useState<EconomicEvent[]>(() => {
    try {
      const cached = localStorage.getItem('eklipse_calendar_cache_v1');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 1000 * 60 * 15 && Array.isArray(data)) {
          return data;
        }
      }
    } catch (_) {}
    return DEFAULT_EVENTS;
  });

  // Reloj UTC en tiempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Próximo evento de alto impacto
  const nextHighImpact = useMemo(() => {
    const now = Date.now();
    const upcoming = events
      .filter(e => e.impact === 'HIGH' && e.timestamp > now)
      .sort((a, b) => a.timestamp - b.timestamp);
    return upcoming[0] || null;
  }, [events]);

  const timeToNextMinutes = useMemo(() => {
    if (!nextHighImpact) return null;
    const diffMs = nextHighImpact.timestamp - Date.now();
    return Math.max(0, Math.round(diffMs / (1000 * 60)));
  }, [nextHighImpact]);

  // Filtrado reactivo
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchImpact = selectedImpact === 'ALL' || e.impact === selectedImpact;
      const matchCurrency = selectedCurrency === 'ALL' || e.currency === selectedCurrency;
      return matchImpact && matchCurrency;
    });
  }, [events, selectedImpact, selectedCurrency]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header con Alerta de Regla Institucional y Reloj UTC */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#0A0D15] border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isEn ? 'Institutional Economic Calendar' : 'Calendario Económico Institucional'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {isEn 
                ? 'High frequency macroeconomic events tracking and prop firm news restrictions.' 
                : 'Seguimiento macroeconómico de alta volatilidad y restricciones de trading ante noticias.'}
            </p>
          </div>

          {/* Reloj UTC y Próximo Evento */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-right">
              <div className="text-[10px] text-slate-400 font-mono">{isEn ? 'MARKET TIME' : 'HORA DE MERCADO'}</div>
              <div className="text-sm font-black font-mono text-amber-400">{utcTime || '12:00:00 UTC'}</div>
            </div>

            {nextHighImpact && (
              <div className="px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-right">
                <div className="text-[10px] text-rose-300 font-mono flex items-center gap-1 justify-end">
                  <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
                  <span>{isEn ? 'HIGH IMPACT IN' : 'ALTO IMPACTO EN'}</span>
                </div>
                <div className="text-sm font-black font-mono text-rose-400">
                  {timeToNextMinutes} {isEn ? 'MIN' : 'MINUTOS'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Banner de Aviso de Regla Prop Firm */}
        <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-start sm:items-center gap-3.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-xs font-mono text-slate-300 leading-relaxed">
            <strong className="text-amber-400">{isEn ? 'PROP FIRM RISK DIRECTIVE:' : 'DIRECTIVA DE RIESGO PROP FIRM:'}</strong>{' '}
            {isEn 
              ? 'Executing new orders within ±2 minutes of red-flag (HIGH impact) releases is monitored by the Risk Daemon. Protect your drawdown.' 
              : 'La ejecución de nuevas órdenes durante los ±2 minutos de eventos de Alto Impacto (Rojo) es vigilada por el Risk Daemon para proteger la reserva de tesorería.'}
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          {/* Filtro por Impacto */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{isEn ? 'Impact:' : 'Impacto:'}</span>
            </span>
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(imp => (
              <button
                key={imp}
                onClick={() => setSelectedImpact(imp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedImpact === imp
                    ? imp === 'HIGH' 
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' 
                      : imp === 'MEDIUM' 
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20' 
                        : 'bg-white/20 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {imp === 'ALL' ? (isEn ? 'All' : 'Todos') : imp}
              </button>
            ))}
          </div>

          {/* Filtro por Divisa */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1">{isEn ? 'Asset:' : 'Activo:'}</span>
            {['ALL', 'USD', 'EUR', 'GBP', 'BTC'].map(curr => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedCurrency === curr
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {curr === 'ALL' ? (isEn ? 'All' : 'Todos') : curr}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 2. Tabla Interactiva de Eventos Económicos */}
      <div className="rounded-3xl border border-white/5 bg-[#0A0D15] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">{isEn ? 'Time (UTC)' : 'Hora (UTC)'}</th>
                <th className="py-4 px-4">{isEn ? 'Country' : 'País'}</th>
                <th className="py-4 px-6">{isEn ? 'Event & Details' : 'Evento y Detalles'}</th>
                <th className="py-4 px-4 text-center">{isEn ? 'Impact' : 'Impacto'}</th>
                <th className="py-4 px-4 text-right">{isEn ? 'Forecast' : 'Previsión'}</th>
                <th className="py-4 px-4 text-right">{isEn ? 'Previous' : 'Anterior'}</th>
                <th className="py-4 px-6 text-right">{isEn ? 'Actual' : 'Real'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEvents.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  
                  {/* Hora */}
                  <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.timeUTC}</span>
                  </td>

                  {/* País y Bandera */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{item.flag}</span>
                      <span className="font-bold text-slate-300">{item.currency}</span>
                    </div>
                  </td>

                  {/* Nombre del Evento */}
                  <td className="py-4 px-6 font-medium text-slate-200">
                    <div className="flex items-center gap-2">
                      <span>{item.event}</span>
                      {item.restrictedForPropFirm && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {isEn ? 'NEWS RULE' : 'REGLA NOTICIAS'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Badge de Impacto */}
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.impact === 'HIGH' 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                        : item.impact === 'MEDIUM' 
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                          : 'bg-slate-700/30 text-slate-400 border border-slate-600/30'
                    }`}>
                      {item.impact}
                    </span>
                  </td>

                  {/* Previsión */}
                  <td className="py-4 px-4 text-right text-slate-400">
                    {item.forecast || '-'}
                  </td>

                  {/* Anterior */}
                  <td className="py-4 px-4 text-right text-slate-500">
                    {item.previous || '-'}
                  </td>

                  {/* Real */}
                  <td className="py-4 px-6 text-right font-bold text-white">
                    {item.actual ? (
                      <span className="text-emerald-400">{item.actual}</span>
                    ) : (
                      <span className="text-slate-600">Pending</span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
