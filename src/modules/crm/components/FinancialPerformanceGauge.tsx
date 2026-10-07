import React, { useState, useEffect, useRef, useMemo } from 'react';

export type FinancialGaugeTheme = 'emerald' | 'amber' | 'indigo' | 'cobalt' | 'crimson';

interface FinancialPerformanceGaugeProps {
  value: number | string;
  unit: string;
  label: string;
  subtext?: string;
  percent?: number; // 0 to 100
  theme?: FinancialGaugeTheme;
  size?: number; // default 200
  statusText?: string;
  isBreached?: boolean;
}

const THEME_CONFIG: Record<FinancialGaugeTheme, {
  primary: string;
  secondary: string;
  trackBg: string;
  glow: string;
  gradientColors: string[];
  pillBg: string;
  pillText: string;
  pillBorder: string;
}> = {
  emerald: {
    primary: '#059669',
    secondary: '#10B981',
    trackBg: '#E9E3D8',
    glow: 'rgba(5, 150, 105, 0.20)',
    gradientColors: ['#34D399', '#10B981', '#059669'],
    pillBg: '#ECFDF5',
    pillText: '#065F46',
    pillBorder: '#A7F3D0'
  },
  amber: {
    primary: '#D97706',
    secondary: '#F59E0B',
    trackBg: '#E9E3D8',
    glow: 'rgba(217, 119, 6, 0.20)',
    gradientColors: ['#FBBF24', '#F59E0B', '#D97706'],
    pillBg: '#FFFBEB',
    pillText: '#92400E',
    pillBorder: '#FDE68A'
  },
  indigo: {
    primary: '#4F46E5',
    secondary: '#6366F1',
    trackBg: '#E9E3D8',
    glow: 'rgba(79, 70, 229, 0.20)',
    gradientColors: ['#818CF8', '#6366F1', '#4F46E5'],
    pillBg: '#EEF2FF',
    pillText: '#3730A3',
    pillBorder: '#C7D2FE'
  },
  cobalt: {
    primary: '#0284C7',
    secondary: '#38BDF8',
    trackBg: '#E9E3D8',
    glow: 'rgba(2, 132, 199, 0.20)',
    gradientColors: ['#38BDF8', '#0EA5E9', '#0284C7'],
    pillBg: '#F0F9FF',
    pillText: '#0369A1',
    pillBorder: '#BAE6FD'
  },
  crimson: {
    primary: '#E11D48',
    secondary: '#FB7185',
    trackBg: '#FCE7E7',
    glow: 'rgba(225, 29, 72, 0.25)',
    gradientColors: ['#FB7185', '#F43F5E', '#E11D48'],
    pillBg: '#FFF1F2',
    pillText: '#9F1239',
    pillBorder: '#FECDD3'
  }
};

export const FinancialPerformanceGauge: React.FC<FinancialPerformanceGaugeProps> = ({
  value,
  unit,
  label,
  subtext,
  percent = 0,
  theme = 'emerald',
  size = 195,
  statusText,
  isBreached = false
}) => {
  const activeThemeKey = isBreached ? 'crimson' : theme;
  const cfg = THEME_CONFIG[activeThemeKey];

  const cx = size / 2;
  const cy = size / 2;

  // Ángulo de apertura del dial: 240° de barrido, iniciando en 150° (abajo izquierda)
  const startAngle = 150;
  const sweepAngle = 240;

  // 1. Motor de animación suave a 60 FPS con deflexión responsiva para micro-profits
  const visualTargetPercent = useMemo(() => {
    if (percent <= 0) return 0;
    if (percent >= 100) return 100;
    // Deflexión base para que cualquier profit, por pequeño que sea, mueva la aguja visiblemente
    const base = 5.0;
    const dynamic = Math.pow(percent / 100, 0.55) * (100 - base);
    return Math.min(100, Math.max(base, base + dynamic));
  }, [percent]);

  const targetPercent = Math.min(100, Math.max(0, visualTargetPercent));
  const [animPercent, setAnimPercent] = useState<number>(targetPercent);
  const animPercentRef = useRef<number>(targetPercent);
  const targetPercentRef = useRef<number>(targetPercent);
  targetPercentRef.current = targetPercent;

  useEffect(() => {
    let rafId: number;
    const animate = () => {
      const diff = targetPercentRef.current - animPercentRef.current;
      if (Math.abs(diff) > 0.05) {
        animPercentRef.current += diff * 0.12;
        setAnimPercent(animPercentRef.current);
      } else if (animPercentRef.current !== targetPercentRef.current) {
        animPercentRef.current = targetPercentRef.current;
        setAnimPercent(targetPercentRef.current);
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Animación numérica suave
  const isNumeric = typeof value === 'number' || (!isNaN(Number(value)) && typeof value === 'string' && value.trim() !== '');
  const targetNum = isNumeric ? Number(value) : null;
  const [displayNum, setDisplayNum] = useState<number | null>(targetNum);
  const numRef = useRef<number | null>(targetNum);
  const targetNumRef = useRef<number | null>(targetNum);
  targetNumRef.current = targetNum;

  useEffect(() => {
    if (targetNumRef.current === null) return;
    let rafId: number;
    const animateNum = () => {
      if (targetNumRef.current !== null && numRef.current !== null) {
        const diff = targetNumRef.current - numRef.current;
        if (Math.abs(diff) > 0.1) {
          numRef.current += diff * 0.14;
          setDisplayNum(numRef.current);
        } else if (numRef.current !== targetNumRef.current) {
          numRef.current = targetNumRef.current;
          setDisplayNum(targetNumRef.current);
        }
      }
      rafId = requestAnimationFrame(animateNum);
    };
    rafId = requestAnimationFrame(animateNum);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Geometría del arco principal
  const isCompact = size < 170;
  const radius = size * 0.38;
  const strokeWidth = isCompact ? 8 : 10;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (sweepAngle / 360);
  const activeLength = arcLength * (animPercent / 100);

  // Muescas exteriores sutiles de precisión relojera
  const ticks: React.ReactElement[] = [];
  const numTicks = isCompact ? 25 : 31;
  const tickOuterR = size * 0.475;
  const tickInnerR = size * 0.44;

  for (let i = 0; i < numTicks; i++) {
    const fraction = i / (numTicks - 1);
    const tickAngle = (startAngle + fraction * sweepAngle) * (Math.PI / 180);
    const isTickActive = (animPercent / 100) >= fraction;

    ticks.push(
      <line
        key={`tick-${i}`}
        x1={cx + tickInnerR * Math.cos(tickAngle)}
        y1={cy + tickInnerR * Math.sin(tickAngle)}
        x2={cx + tickOuterR * Math.cos(tickAngle)}
        y2={cy + tickOuterR * Math.sin(tickAngle)}
        stroke={isTickActive ? cfg.primary : '#D6CEC0'}
        strokeWidth={i % 5 === 0 ? 1.6 : 0.9}
        strokeLinecap="round"
        opacity={isTickActive ? 0.9 : 0.45}
      />
    );
  }

  // Aguja indicadora estilizada en el extremo del arco activo
  const tipAngleRad = (startAngle + (animPercent / 100) * sweepAngle) * (Math.PI / 180);
  const needleInnerR = radius - strokeWidth / 2 - 2;
  const needleOuterR = radius + strokeWidth / 2 + 2;

  // Valor formateado para display
  const renderedValue = (() => {
    if (isNumeric && displayNum !== null) {
      if (typeof value === 'number' && !Number.isInteger(value)) {
        return displayNum.toFixed(2);
      }
      return Math.round(displayNum);
    }
    return value;
  })();

  const gradientId = `fin-grad-${label.replace(/[^a-zA-Z0-9]/g, '')}-${activeThemeKey}`;

  return (
    <div className="flex flex-col items-center select-none font-sans group">
      {/* CUERPO DEL DIAL - TRANSLÚCIDO SOBRE EL FONDO CUADRICULADO DE LA PÁGINA */}
      <div 
        className="relative flex items-center justify-center rounded-full transition-transform duration-300 hover:scale-[1.02]"
        style={{ 
          width: size, 
          height: size,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.72) 0%, rgba(250,248,245,0.4) 65%, rgba(240,234,224,0.2) 100%)',
          backdropFilter: 'blur(3px)',
          boxShadow: '0 8px 24px -4px rgba(27,24,18,0.04), 0 2px 6px rgba(0,0,0,0.02), inset 0 0 12px rgba(255,255,255,0.8)',
          border: '1.5px solid rgba(226,219,206,0.7)'
        }}
      >
        <svg 
          width={size} 
          height={size} 
          className="absolute inset-0 pointer-events-none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={cfg.gradientColors[0]} />
              <stop offset="50%" stopColor={cfg.gradientColors[1]} />
              <stop offset="100%" stopColor={cfg.gradientColors[2]} />
            </linearGradient>
          </defs>

          {/* Muescas exteriores relojeras */}
          {ticks}

          {/* Pista de fondo inactiva (Arco suave en Warm Cream) */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={cfg.trackBg}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            transform={`rotate(${startAngle} ${cx} ${cy})`}
          />

          {/* Arco activo coloreado dinámico */}
          {animPercent > 0.01 && (
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${activeLength} ${circumference}`}
              strokeDashoffset={0}
              transform={`rotate(${startAngle} ${cx} ${cy})`}
              style={{
                filter: `drop-shadow(0 2px 6px ${cfg.glow})`
              }}
            />
          )}

          {/* Aguja terminal de precisión */}
          {animPercent > 0.01 && (
            <line
              x1={cx + needleInnerR * Math.cos(tipAngleRad)}
              y1={cy + needleInnerR * Math.sin(tipAngleRad)}
              x2={cx + needleOuterR * Math.cos(tipAngleRad)}
              y2={cy + needleOuterR * Math.sin(tipAngleRad)}
              stroke={cfg.primary}
              strokeWidth={isCompact ? 2.5 : 3}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 1px 3px rgba(0,0,0,0.15))`
              }}
            />
          )}
        </svg>

        {/* NÚCLEO CENTRAL LÍMPIDO EN BLANCO TRANSLÚCIDO */}
        <div 
          className="relative z-10 flex flex-col items-center justify-center rounded-full text-center px-1.5"
          style={{
            width: size * 0.53,
            height: size * 0.53,
            background: 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(3px)',
            border: `1.5px solid ${isBreached ? '#F43F5E' : 'rgba(226,219,206,0.8)'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 2px rgba(255,255,255,0.9)'
          }}
        >
          {/* Valor Principal en Obsidian Intenso y Legible */}
          <span className={`${isCompact ? 'text-[15px]' : 'text-xl'} font-black tracking-tight leading-none text-[#0F172A] font-mono`}>
            {renderedValue}
          </span>

          {/* Unidad / Meta bajo el valor */}
          <span 
            className={`${isCompact ? 'text-[9px]' : 'text-[10px]'} font-bold tracking-tight mt-0.5 font-mono`}
            style={{ color: cfg.primary }}
          >
            {unit}
          </span>

          {/* Estado breve bajo la unidad */}
          {statusText && (
            <span className={`${isCompact ? 'text-[8px]' : 'text-[9px]'} font-mono font-semibold text-slate-400 mt-0.5 truncate max-w-full px-1`}>
              {statusText}
            </span>
          )}
        </div>

        {/* Porcentaje en píldora inferior dentro del dial */}
        <div 
          className={`absolute ${isCompact ? 'bottom-1.5 text-[8.5px] px-1.5' : 'bottom-2.5 text-[10px] px-2'} z-20 font-mono font-extrabold py-0.5 rounded-full border shadow-2xs`}
          style={{
            backgroundColor: cfg.pillBg,
            borderColor: cfg.pillBorder,
            color: cfg.pillText
          }}
        >
          {animPercent.toFixed(1)}%
        </div>
      </div>

      {/* ETIQUETA INSTITUCIONAL INFERIOR DIRECTAMENTE SOBRE EL FONDO */}
      <div className="mt-3 flex flex-col items-center text-center">
        <span className="text-xs font-black text-[#0F172A] tracking-tight">
          {label}
        </span>
        {subtext && (
          <span className="text-[11px] font-medium text-slate-500 mt-0.5">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
