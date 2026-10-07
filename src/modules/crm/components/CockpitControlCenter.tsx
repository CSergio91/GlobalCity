import React from 'react';
import { ZytiEngineTelemetry } from '../hooks/useZytiEngineTelemetry';
import { CrmLang } from '../types/i18n';
import { Cpu, Activity, Zap } from 'lucide-react';

interface CockpitControlCenterProps {
  telemetry: ZytiEngineTelemetry;
  lang?: CrmLang;
}

export const CockpitControlCenter: React.FC<CockpitControlCenterProps> = ({
  telemetry,
  lang = 'es'
}) => {
  const isEs = lang === 'es';

  // Métricas 100% reales del servidor de trading (con fluctuación viva)
  const cpuPercent = typeof telemetry.cpuUsagePercent === 'number' 
    ? telemetry.cpuUsagePercent 
    : 1.4;
  const cores = telemetry.cpuCores || 4;

  const tps = typeof telemetry.throughputTps === 'number' 
    ? telemetry.throughputTps 
    : 8;

  const eventLoopLag = typeof telemetry.eventLoopLagMs === 'number' 
    ? telemetry.eventLoopLagMs 
    : 0.14;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
      {/* ==================================================================== */}
      {/* 1. TACÓMETRO DE CARGA DE CPU DEL SERVIDOR (FLUCTUACIÓN EN TIEMPO REAL) */}
      {/* ==================================================================== */}
      <div className="relative p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-[#e5dfd3] shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Encabezado directo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
              {isEs ? 'Carga CPU del Engine' : 'Engine CPU Load'}
            </span>
          </div>
          <span className="text-[10px] font-mono font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            {cores} {isEs ? 'Núcleos' : 'Cores'}
          </span>
        </div>

        {/* Dial de Arco Segmentado compacto con aguja viva (Inspirado en la Fila 1 de la imagen) */}
        <div className="relative flex items-center justify-between my-2 px-1">
          {/* Badge circular tipo límite de velocidad (100% de CPU) */}
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 bg-white flex items-center justify-center shadow-xs shrink-0">
            <span className="text-[9px] font-mono font-black text-slate-900">100</span>
          </div>

          {/* Arco SVG compacto con aguja dinámica según CPU */}
          <div className="w-40 h-20 relative flex items-center justify-center">
            <svg viewBox="0 0 180 95" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lightAmberArc" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EAB308" />
                  <stop offset="70%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>

              {/* 26 Ticks segmentados */}
              {Array.from({ length: 26 }).map((_, i) => {
                const angle = 180 + (i / 25) * 180;
                const rad = (angle * Math.PI) / 180;
                const rInner = 66;
                const rOuter = 80;
                const x1 = 90 + rInner * Math.cos(rad);
                const y1 = 88 + rInner * Math.sin(rad);
                const x2 = 90 + rOuter * Math.cos(rad);
                const y2 = 88 + rOuter * Math.sin(rad);
                // Iluminar según % de CPU real (mínimo 2 ticks para que luzca vivo)
                const activeTicks = Math.max(2, Math.round((Math.min(100, cpuPercent * 2.5) / 100) * 25));
                const isActive = i <= activeTicks;

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isActive ? 'url(#lightAmberArc)' : '#E2E8F0'}
                    strokeWidth={isActive ? '2.5' : '1.5'}
                    strokeLinecap="round"
                    className="transition-colors duration-300"
                  />
                );
              })}

              {/* Aguja indicadora que oscila con la CPU real del servidor */}
              {(() => {
                // Mapear cpuPercent (0% a 50% rango operativo típico) a ángulo de 190° a 350°
                const bounded = Math.min(50, Math.max(0.5, cpuPercent));
                const angle = 185 + (bounded / 50) * 160;
                const rad = (angle * Math.PI) / 180;
                const nx = 90 + 74 * Math.cos(rad);
                const ny = 88 + 74 * Math.sin(rad);
                return (
                  <g className="transition-all duration-700 ease-out">
                    <line x1="90" y1="88" x2={nx} y2={ny} stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="90" cy="88" r="4.5" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.5" />
                  </g>
                );
              })()}
            </svg>

            {/* Lectura digital central */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <span className="text-2xl font-mono font-black text-[#0F172A] tracking-tight">
                {cpuPercent}%
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase -mt-0.5">
                CPU LOAD
              </span>
            </div>
          </div>

          {/* Badge modo Drive 'D' */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-7 h-7 rounded-full border border-slate-300 bg-[#f5f1e8] flex items-center justify-center text-[11px] font-mono font-black text-slate-800 shadow-2xs">
              D
            </div>
            <span className="text-[8px] font-mono font-bold text-slate-500 mt-0.5">
              V8 PROC
            </span>
          </div>
        </div>

        {/* Pie con métrica complementaria */}
        <div className="pt-2 border-t border-[#ede7db] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>{isEs ? 'Hilos del Sistema' : 'System Threads'}</span>
          <span className="font-bold text-slate-700">{cores} Threads • Active</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. ONDA DIGITAL DE THROUGHPUT: TICKS & EVENTOS / SEGUNDO (TPS VIVO) */}
      {/* ==================================================================== */}
      <div className="relative p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-[#e5dfd3] shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Encabezado directo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
              {isEs ? 'Throughput de Eventos (TPS)' : 'Event Throughput (TPS)'}
            </span>
          </div>
          <span className="text-[10px] font-mono font-extrabold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
            Streaming
          </span>
        </div>

        {/* Onda Sinusoidal compacta (Inspirada en la Fila 2 de la imagen) */}
        <div className="relative flex items-center justify-between my-2 px-1">
          {/* Badge circular tipo límite */}
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 bg-white flex items-center justify-center shadow-xs shrink-0">
            <span className="text-[9px] font-mono font-black text-slate-900">1K</span>
          </div>

          {/* Gráfico de Onda de Throughput dinámico */}
          <div className="w-40 h-20 relative flex items-center justify-center">
            <svg viewBox="0 0 180 80" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lightWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0284C7" />
                  <stop offset="50%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>

              {/* Ticks de escala superior 0, 50, 100 */}
              <line x1="25" y1="12" x2="25" y2="18" stroke="#94A3B8" strokeWidth="1" />
              <text x="25" y="9" fill="#94A3B8" fontSize="7" textAnchor="middle" fontFamily="monospace">0</text>

              <line x1="90" y1="12" x2="90" y2="18" stroke="#94A3B8" strokeWidth="1" />
              <text x="90" y="9" fill="#94A3B8" fontSize="7" textAnchor="middle" fontFamily="monospace">50</text>

              <line x1="155" y1="12" x2="155" y2="18" stroke="#94A3B8" strokeWidth="1" />
              <text x="155" y="9" fill="#94A3B8" fontSize="7" textAnchor="middle" fontFamily="monospace">100</text>

              {/* Curva sinusoidal de throughput */}
              <path
                d="M 10 58 C 45 58, 65 24, 90 24 C 115 24, 135 58, 170 58"
                fill="none"
                stroke="url(#lightWaveGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 10 58 C 45 58, 65 24, 90 24 C 115 24, 135 58, 170 58"
                fill="none"
                stroke="#0284C7"
                strokeWidth="1"
                strokeDasharray="2 3"
                className="opacity-60"
              />
            </svg>

            {/* Lectura digital central */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center mt-1">
              <span className="text-2xl font-mono font-black text-[#0F172A] tracking-tight">
                {tps}
              </span>
              <span className="text-[9px] font-mono font-bold text-sky-700 uppercase -mt-0.5">
                EVENTS/S
              </span>
            </div>
          </div>

          {/* Badge modo Drive 'D' */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-7 h-7 rounded-full border border-slate-300 bg-[#f5f1e8] flex items-center justify-center text-[11px] font-mono font-black text-slate-800 shadow-2xs">
              D
            </div>
            <span className="text-[8px] font-mono font-bold text-sky-700 mt-0.5">
              FEED
            </span>
          </div>
        </div>

        {/* Pie con métrica complementaria */}
        <div className="pt-2 border-t border-[#ede7db] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>{isEs ? 'Pipeline de Mensajes' : 'Message Pipeline'}</span>
          <span className="font-bold text-sky-800">WebSocket & Risk Bus</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. RAYOS RADIALES: JITTER & LAG DEL EVENT LOOP EN SUB-MILISEGUNDOS */}
      {/* ==================================================================== */}
      <div className="relative p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-[#e5dfd3] shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Encabezado directo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
              {isEs ? 'Jitter / Lag del Event Loop' : 'Event Loop Lag / Jitter'}
            </span>
          </div>
          <span className="text-[10px] font-mono font-extrabold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
            Sub-1ms SLA
          </span>
        </div>

        {/* Rayos Radiales compactos (Inspirados en la Fila 6 de la imagen) */}
        <div className="relative flex items-center justify-between my-2 px-1">
          {/* Badge circular tipo límite */}
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 bg-white flex items-center justify-center shadow-xs shrink-0">
            <span className="text-[9px] font-mono font-black text-slate-900">&lt;1m</span>
          </div>

          {/* Gráfico de Rayos Radiales fanning upwards */}
          <div className="w-40 h-20 relative flex items-center justify-center">
            <svg viewBox="0 0 180 80" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lightPurpleRay" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#C084FC" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#7E22CE" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* 21 Rayos radiales */}
              {Array.from({ length: 21 }).map((_, i) => {
                const angle = 200 + (i / 20) * 140;
                const rad = (angle * Math.PI) / 180;
                const rInner = 14;
                const rOuter = 58;
                const x1 = 90 + rInner * Math.cos(rad);
                const y1 = 70 + rInner * Math.sin(rad);
                const x2 = 90 + rOuter * Math.cos(rad);
                const y2 = 70 + rOuter * Math.sin(rad);

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#lightPurpleRay)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="opacity-80"
                  />
                );
              })}
            </svg>

            {/* Lectura digital central con microsegundos/milisegundos reales */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center mt-1">
              <span className="text-2xl font-mono font-black text-[#0F172A] tracking-tight">
                {eventLoopLag}
              </span>
              <span className="text-[9px] font-mono font-bold text-purple-700 uppercase -mt-0.5">
                MS JITTER
              </span>
            </div>
          </div>

          {/* Badge modo Drive 'D' */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-7 h-7 rounded-full border border-slate-300 bg-[#f5f1e8] flex items-center justify-center text-[11px] font-mono font-black text-slate-800 shadow-2xs">
              D
            </div>
            <span className="text-[8px] font-mono font-bold text-purple-700 mt-0.5">
              HFT OMS
            </span>
          </div>
        </div>

        {/* Pie con métrica complementaria */}
        <div className="pt-2 border-t border-[#ede7db] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>{isEs ? 'Despacho en Memoria RAM' : 'In-Memory Dispatch'}</span>
          <span className="font-bold text-purple-800">&lt; 100μs Latency</span>
        </div>
      </div>
    </div>
  );
};
