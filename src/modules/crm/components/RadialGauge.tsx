import React, { useState, useEffect, useRef } from 'react';

export type RadialGaugeTheme = 'cyan' | 'green' | 'purple' | 'amber' | 'rose';

interface RadialGaugeProps {
  value: number | string;
  unit: string;
  label: string;
  subtext?: string;
  percent?: number; // 0 to 100
  theme?: RadialGaugeTheme;
  size?: number; // default 210
  status?: 'ON' | 'OFF';
}

const THEME_CONFIG: Record<RadialGaugeTheme, {
  primary: string;
  glow: string;
  activeTip: string;
  gradientColors: string[];
  darkBg: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}> = {
  cyan: {
    primary: '#00F0FF',
    glow: 'rgba(0, 240, 255, 0.45)',
    activeTip: '#E0FFFF',
    gradientColors: ['#0072FF', '#00C6FF', '#00F0FF', '#70FFFF'],
    darkBg: '#060B14',
    badgeBg: 'rgba(0, 240, 255, 0.1)',
    badgeText: '#00B4D8',
    badgeBorder: 'rgba(0, 240, 255, 0.3)'
  },
  green: {
    primary: '#00E676',
    glow: 'rgba(0, 230, 118, 0.45)',
    activeTip: '#E8F5E9',
    gradientColors: ['#009688', '#00C853', '#00E676', '#69F0AE'],
    darkBg: '#050E0A',
    badgeBg: 'rgba(0, 230, 118, 0.1)',
    badgeText: '#00A854',
    badgeBorder: 'rgba(0, 230, 118, 0.3)'
  },
  purple: {
    primary: '#B388FF',
    glow: 'rgba(179, 136, 255, 0.45)',
    activeTip: '#EDE7F6',
    gradientColors: ['#7C4DFF', '#9C27B0', '#B388FF', '#EA80FC'],
    darkBg: '#0B0714',
    badgeBg: 'rgba(179, 136, 255, 0.1)',
    badgeText: '#7C4DFF',
    badgeBorder: 'rgba(179, 136, 255, 0.3)'
  },
  amber: {
    primary: '#FF9100',
    glow: 'rgba(255, 145, 0, 0.45)',
    activeTip: '#FFF8E1',
    gradientColors: ['#FF6D00', '#FF9100', '#FFAB00', '#FFD54F'],
    darkBg: '#120A04',
    badgeBg: 'rgba(255, 145, 0, 0.1)',
    badgeText: '#FF8F00',
    badgeBorder: 'rgba(255, 145, 0, 0.3)'
  },
  rose: {
    primary: '#F43F5E',
    glow: 'rgba(244, 63, 94, 0.45)',
    activeTip: '#FFE4E6',
    gradientColors: ['#9F1239', '#BE123C', '#E11D48', '#FB7185'],
    darkBg: '#160508',
    badgeBg: 'rgba(244, 63, 94, 0.1)',
    badgeText: '#E11D48',
    badgeBorder: 'rgba(244, 63, 94, 0.3)'
  }
};

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  unit,
  label,
  subtext,
  percent = 70,
  theme = 'cyan',
  size = 205,
  status = 'ON'
}) => {
  const isOff = status === 'OFF';
  const cfg = THEME_CONFIG[theme];

  const cx = size / 2;
  const cy = size / 2;

  // Parámetros de la matriz segmentada
  const totalColumns = 34; // Número de columnas radiales
  const totalRows = 4;     // 4 filas concéntricas de celdas
  const startAngle = 140;  // Empieza a las 140° (abajo izquierda)
  const sweepAngle = 260;  // Abarca 260°

  // ----------------------------------------------------------------------------
  // 1. MOTOR DE ANIMACIÓN SUAVE A 60 FPS (LERP CONTINUO SIN SALTOS)
  // ----------------------------------------------------------------------------
  const targetPercent = isOff ? 0 : Math.min(100, Math.max(0, percent));
  const [animPercent, setAnimPercent] = useState<number>(targetPercent);
  const animPercentRef = useRef<number>(targetPercent);
  const targetPercentRef = useRef<number>(targetPercent);
  targetPercentRef.current = targetPercent;

  useEffect(() => {
    let rafId: number;
    const animate = () => {
      const diff = targetPercentRef.current - animPercentRef.current;
      if (Math.abs(diff) > 0.05) {
        // Amortiguación aceitada fluida (Damped spring lerp a 60 FPS)
        animPercentRef.current += diff * 0.10;
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

  // Animación suave del valor numérico
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
          numRef.current += diff * 0.12;
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
  }, [value]);

  // Radio de las filas concéntricas de la matriz
  const rMin = size * 0.28;
  const rMax = size * 0.41;
  const rowHeight = (rMax - rMin) / totalRows;

  // Columna continua flotante para iluminación gradual
  const continuousCol = (animPercent / 100) * totalColumns;

  // 1. Generar la matriz segmentada (Curved Grid Cells) con gradiente continuo
  const matrixCells: React.ReactElement[] = [];

  for (let c = 0; c < totalColumns; c++) {
    const colPercent = c / (totalColumns - 1);
    const a1 = (startAngle + colPercent * sweepAngle) * (Math.PI / 180);
    const a2 = (startAngle + (colPercent + 0.85 / totalColumns) * sweepAngle) * (Math.PI / 180);

    // Iluminación gradual continua entre celdas (elimina saltos bruscos)
    const cellActivity = Math.min(1, Math.max(0, continuousCol - c));
    const isActive = cellActivity > 0;

    let cellColor = '#131B28'; // Inactivo
    let cellOpacity = 0.35;

    if (isActive) {
      const gradIdx = Math.min(
        cfg.gradientColors.length - 1,
        Math.floor((c / totalColumns) * cfg.gradientColors.length)
      );
      cellColor = cfg.gradientColors[gradIdx];
      // Interpolación suave de opacidad según el avance milimétrico de la aguja
      cellOpacity = (0.35 + cellActivity * 0.6) * (0.85 + (c / totalColumns) * 0.15);
    }

    for (let r = 0; r < totalRows; r++) {
      const innerR = rMin + r * rowHeight + 1;
      const outerR = rMin + (r + 1) * rowHeight - 1;

      // Puntos del cuadrilátero curvo
      const x1 = cx + innerR * Math.cos(a1);
      const y1 = cy + innerR * Math.sin(a1);
      const x2 = cx + outerR * Math.cos(a1);
      const y2 = cy + outerR * Math.sin(a1);
      const x3 = cx + outerR * Math.cos(a2);
      const y3 = cy + outerR * Math.sin(a2);
      const x4 = cx + innerR * Math.cos(a2);
      const y4 = cy + innerR * Math.sin(a2);

      const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`;

      matrixCells.push(
        <path
          key={`cell-${c}-${r}`}
          d={pathData}
          fill={cellColor}
          opacity={cellOpacity}
        />
      );
    }
  }

  // 2. Aguja / Punta Luminosa Continua a 60 FPS (Flotante en grados exactos sin saltos)
  let activeTipLine: React.ReactElement | null = null;
  if (!isOff && animPercent > 1) {
    const tipAngle = (startAngle + (animPercent / 100) * sweepAngle) * (Math.PI / 180);
    const tipX1 = cx + (rMin - 2) * Math.cos(tipAngle);
    const tipY1 = cy + (rMin - 2) * Math.sin(tipAngle);
    const tipX2 = cx + (rMax + 3) * Math.cos(tipAngle);
    const tipY2 = cy + (rMax + 3) * Math.sin(tipAngle);

    activeTipLine = (
      <line
        x1={tipX1}
        y1={tipY1}
        x2={tipX2}
        y2={tipY2}
        stroke={cfg.activeTip}
        strokeWidth={3}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 7px ${cfg.primary})`
        }}
      />
    );
  }

  // 3. Anillo de Muescas Exteriores continuo
  const outerTicks: React.ReactElement[] = [];
  const numOuterTicks = 42;
  for (let i = 0; i < numOuterTicks; i++) {
    const angle = (startAngle + (i / (numOuterTicks - 1)) * sweepAngle) * (Math.PI / 180);
    const tickOuterR = size * 0.485;
    const tickInnerR = size * 0.445;
    const isTickActive = !isOff && (i / numOuterTicks) <= (animPercent / 100);

    outerTicks.push(
      <line
        key={`out-tick-${i}`}
        x1={cx + tickInnerR * Math.cos(angle)}
        y1={cy + tickInnerR * Math.sin(angle)}
        x2={cx + tickOuterR * Math.cos(angle)}
        y2={cy + tickOuterR * Math.sin(angle)}
        stroke={isTickActive ? cfg.primary : '#182232'}
        strokeWidth={2.2}
        strokeLinecap="butt"
        opacity={isTickActive ? 0.9 : 0.4}
      />
    );
  }

  // 4. Arco fino de guía exterior
  const guideArcR = size * 0.422;
  const guideCircumference = 2 * Math.PI * guideArcR;
  const guideArcLength = guideCircumference * (sweepAngle / 360);

  // 5. Sonrisa brillante inferior
  const smileAngle1 = 70 * (Math.PI / 180);
  const smileAngle2 = 110 * (Math.PI / 180);
  const smileR = size * 0.38;
  const smileX1 = cx + smileR * Math.cos(smileAngle1);
  const smileY1 = cy + smileR * Math.sin(smileAngle1);
  const smileX2 = cx + smileR * Math.cos(smileAngle2);
  const smileY2 = cy + smileR * Math.sin(smileAngle2);
  const smilePath = `M ${smileX1} ${smileY1} A ${smileR} ${smileR} 0 0 1 ${smileX2} ${smileY2}`;

  // Formato del número mostrado
  const renderedValue = (() => {
    if (isOff) return 'OFF';
    if (isNumeric && displayNum !== null) {
      if (typeof value === 'number' && !Number.isInteger(value)) {
        return displayNum.toFixed(2);
      }
      return Math.round(displayNum);
    }
    return value;
  })();

  return (
    <div className="flex flex-col items-center select-none font-sans group">
      {/* TACÓMETRO INSTRUMENTAL CON ESTILO EXACTO A LA FOTO */}
      <div 
        className="relative flex items-center justify-center rounded-full transition-transform duration-300 hover:scale-[1.02]"
        style={{ 
          width: size, 
          height: size,
          background: 'radial-gradient(circle at center, #0B111D 0%, #05080E 90%)',
          boxShadow: isOff 
            ? '0 12px 32px -4px rgba(244,63,94,0.18), inset 0 0 20px rgba(0,0,0,0.95)'
            : `0 14px 38px -4px ${cfg.glow}, 0 4px 12px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.95)`,
          border: '1.5px solid rgba(255,255,255,0.06)'
        }}
      >
        <svg 
          width={size} 
          height={size} 
          className="absolute inset-0 pointer-events-none"
        >
          {/* Muescas exteriores rectangulares */}
          {outerTicks}

          {/* Arco guía circular sutil exterior */}
          <circle
            cx={cx}
            cy={cy}
            r={guideArcR}
            fill="none"
            stroke="#152132"
            strokeWidth={1}
            strokeDasharray={`${guideArcLength} ${guideCircumference}`}
            strokeDashoffset={0}
            transform={`rotate(${startAngle} ${cx} ${cy})`}
          />

          {/* Matriz de celdas segmentadas curvas (The Curved Grid Matrix) */}
          {matrixCells}

          {/* Aguja / Punta luminosa en el extremo activo */}
          {activeTipLine}

          {/* Arco inferior con sutil sonrisa azulada */}
          {!isOff && (
            <path
              d={smilePath}
              fill="none"
              stroke={cfg.primary}
              strokeWidth={1.5}
              opacity={0.4}
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* NÚCLEO CENTRAL CON ANILLO DE NEÓN Y TEXTOS */}
        <div 
          className="relative z-10 flex flex-col items-center justify-center rounded-full text-center"
          style={{
            width: size * 0.49,
            height: size * 0.49,
            background: 'radial-gradient(circle at center, #0E1624 0%, #060910 92%)',
            border: `2px solid ${isOff ? 'rgba(244,63,94,0.5)' : cfg.primary}`,
            boxShadow: isOff 
              ? '0 0 14px rgba(244,63,94,0.3), inset 0 0 10px rgba(0,0,0,0.9)'
              : `0 0 16px ${cfg.glow}, inset 0 0 10px rgba(0,0,0,0.9)`
          }}
        >
          {isOff ? (
            <div className="flex flex-col items-center">
              <span className="text-base font-black text-rose-500 tracking-wider font-mono">OFF</span>
              <span className="text-[8.5px] text-slate-500 font-mono mt-0.5">DETENIDO</span>
            </div>
          ) : (
            <>
              {/* Valor Principal Grande y Brillante */}
              <span 
                className="text-2xl font-black tracking-tight leading-none text-white font-mono"
                style={{
                  textShadow: `0 0 10px ${cfg.primary}, 0 0 20px ${cfg.glow}`
                }}
              >
                {renderedValue}
              </span>

              {/* Unidad bajo el número (Km/h / ms RTT / % SLA) */}
              <span 
                className="text-[10px] font-bold tracking-wider mt-1 uppercase"
                style={{ color: cfg.primary }}
              >
                {unit}
              </span>
            </>
          )}
        </div>

        {/* Métrica secundaria inferior dentro del tacómetro (como el 12345Km de la foto) */}
        {subtext && !isOff && (
          <div 
            className="absolute bottom-4 z-20 text-[9px] font-mono font-bold tracking-tight px-1.5 py-0.5 rounded"
            style={{ color: cfg.primary, textShadow: `0 0 8px ${cfg.glow}` }}
          >
            {subtext}
          </div>
        )}
      </div>

      {/* Etiqueta institucional inferior flotando limpia */}
      <div className="mt-3 flex flex-col items-center text-center">
        <span className="text-xs font-black text-slate-900 tracking-tight uppercase">
          {label}
        </span>
        <div 
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 border shadow-2xs backdrop-blur-sm"
          style={{
            backgroundColor: isOff ? '#FFF1F2' : cfg.badgeBg,
            borderColor: isOff ? '#FECDD3' : cfg.badgeBorder,
            color: isOff ? '#BE123C' : cfg.badgeText
          }}
        >
          <span 
            className={`w-1.5 h-1.5 rounded-full ${isOff ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}
          />
          <span>{status} {isOff ? '• CAÍDO' : '• EN LÍNEA'}</span>
        </div>
      </div>
    </div>
  );
};
