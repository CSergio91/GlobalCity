import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronDown, Check } from 'lucide-react';

export interface ChartTimezoneSelectorProps {
  currentTimezone: string;
  onSelectTimezone: (timezone: string) => void;
  isEs?: boolean;
}

interface TimezoneOption {
  id: string;
  name: string;
  city: string;
}

const TIMEZONES: TimezoneOption[] = [
  { id: 'America/New_York', name: 'New York', city: 'NY' },
  { id: 'UTC', name: 'UTC', city: 'UTC' },
  { id: 'LOCAL', name: 'Local', city: 'LOC' }
];

export const ChartTimezoneSelector: React.FC<ChartTimezoneSelectorProps> = ({
  currentTimezone,
  onSelectTimezone,
  isEs = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [liveTime, setLiveTime] = useState('');
  const [nyOffset, setNyOffset] = useState('UTC-4');
  const [localOffset, setLocalOffset] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const effectiveTz = currentTimezone === 'LOCAL'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : currentTimezone;

      try {
        const timeFmt = new Intl.DateTimeFormat('en-GB', {
          timeZone: effectiveTz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        setLiveTime(timeFmt.format(now));

        // Offsets
        const nyFmt = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          timeZoneName: 'shortOffset'
        });
        const nyTz = nyFmt.formatToParts(now).find(p => p.type === 'timeZoneName')?.value || 'UTC-4';
        setNyOffset(nyTz.replace('GMT', 'UTC'));

        const locFmt = new Intl.DateTimeFormat('en-US', { timeZoneName: 'shortOffset' });
        const locTz = locFmt.formatToParts(now).find(p => p.type === 'timeZoneName')?.value || '';
        setLocalOffset(locTz.replace('GMT', 'UTC'));
      } catch {
        setLiveTime(now.toTimeString().slice(0, 8));
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [currentTimezone]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getOffsetForOption = (id: string) => {
    if (id === 'America/New_York') return nyOffset;
    if (id === 'UTC') return 'UTC';
    return localOffset;
  };

  const activeOption = TIMEZONES.find((t) => t.id === currentTimezone) || TIMEZONES[0];
  const activeOffset = getOffsetForOption(activeOption.id);

  return (
    <div ref={containerRef} className="relative z-30 select-none">
      {/* Botón trigger compacto en la esquina del gráfico */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#f5f1e8]/95 hover:bg-[#ece5d5] border border-[#dcd6ca] text-[10px] font-mono font-bold text-slate-700 shadow-2xs backdrop-blur-xs transition-colors cursor-pointer"
        title={isEs ? 'Huso horario' : 'Timezone'}
      >
        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
        <span className="font-semibold text-slate-600 hidden sm:inline">{liveTime}</span>
        <span className="text-amber-800 font-extrabold">{activeOption.city}</span>
        <span className="text-slate-400 text-[9px]">({activeOffset})</span>
        <ChevronDown className={`w-2.5 h-2.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover desplegable compacto */}
      {isOpen && (
        <div className="absolute bottom-full mb-1 right-0 w-48 rounded-xl bg-[#fdfcf9] border border-[#ded8cb] shadow-lg p-1 animate-in fade-in zoom-in-95 backdrop-blur-md">
          <div className="space-y-0.5">
            {TIMEZONES.map((opt) => {
              const isSelected = opt.id === currentTimezone;
              const offset = getOffsetForOption(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSelectTimezone(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100/90 text-amber-950 font-bold border border-amber-300/80'
                      : 'hover:bg-[#f3eee4] text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span>{opt.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({offset})</span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
