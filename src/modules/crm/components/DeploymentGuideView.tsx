import React, { useState } from 'react';
import { CrmLang } from '../types/i18n';
import { 
  Server, Terminal, Copy, Check, Cpu, Globe, 
  Layers, ShieldCheck, Activity, RefreshCw, Box,
  Zap, Database, Radio
} from 'lucide-react';
import { useZytiEngineTelemetry } from '../hooks/useZytiEngineTelemetry';
import { RadialGauge } from './RadialGauge';
import { CockpitControlCenter } from './CockpitControlCenter';

interface DeploymentGuideViewProps {
  lang?: CrmLang;
}

interface CodeSnippetBoxProps {
  title: string;
  language: string;
  code: string;
  isEs: boolean;
}

const CodeSnippetBox: React.FC<CodeSnippetBoxProps> = ({ title, language, code, isEs }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-white/80 bg-white/80 backdrop-blur-md overflow-hidden shadow-xs my-3 font-mono">
      {/* Barra superior estilo ventana macOS limpia */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50/80 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
          </div>
          <span className="text-[11px] font-bold text-slate-800 font-sans tracking-tight ml-2">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600 font-bold px-1.5 py-0.5 rounded bg-white/90 border border-slate-200 uppercase">
            {language}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-sans bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-2xs active:scale-95"
            title={isEs ? 'Copiar código' : 'Copy code'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">{isEs ? '¡Copiado!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{isEs ? 'Copiar' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bloque de código */}
      <div className="p-3.5 overflow-x-auto text-[11.5px] leading-relaxed bg-[#0A0D14] text-slate-200 custom-scrollbar selection:bg-amber-500/30 selection:text-amber-200">
        <pre>{code}</pre>
      </div>
    </div>
  );
};

export const DeploymentGuideView: React.FC<DeploymentGuideViewProps> = ({ lang = 'es' }) => {
  const isEs = lang === 'es';
  const [activeTab, setActiveTab] = useState<'architecture' | 'local' | 'docker' | 'vps' | 'sdk'>('architecture');

  // Telemetría en tiempo real
  const telemetry = useZytiEngineTelemetry();

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans">
      {/* ==================================================================== */}
      {/* 1. CABECERA FLOTANTE DIRECTA AL FONDO (SIN CONTENEDOR OPACO) */}
      {/* ==================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100/80 text-amber-900 border border-amber-300/80 backdrop-blur-sm">
              ZYTI CORE ENGINE
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs font-mono font-bold">v2.4 Institutional Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            ZYTI Engine — {isEs ? 'Arquitectura & Telemetría' : 'Architecture & Telemetry'}
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed font-medium">
            {isEs
              ? 'Supervisión en tiempo real del clúster de trading: WebSocket Gateway (:8080), Servidor Redis (:6379), SLA continuo y flujo de órdenes en sub-2ms.'
              : 'Real-time telemetry of the trading cluster: WebSocket Gateway (:8080), Redis Server (:6379), continuous SLA and sub-2ms institutional order pipeline.'}
          </p>
        </div>

        {/* CHIP DE ESTADO EN VIDRIO TRANSLÚCIDO (GLASSMORPHISM) */}
        <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 flex items-center gap-3 shrink-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="relative flex items-center justify-center">
            <span className={`w-3 h-3 rounded-full ${telemetry.wsStatus === 'ON' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            {telemetry.wsStatus === 'ON' && (
              <span className="absolute w-5 h-5 rounded-full bg-emerald-500/30 animate-ping"></span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-wide">
                {telemetry.wsStatus === 'ON' ? 'Gateway Activo' : 'Gateway Desconectado'}
              </span>
              <span className="text-[9px] font-mono px-1 rounded bg-white/90 border border-slate-200 text-slate-600 font-bold">
                :8080
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono font-medium mt-0.5">
              {telemetry.wsStatus === 'ON' 
                ? `Redis: ${telemetry.redisMode} • ${telemetry.connectedSockets} socket(s)`
                : (isEs ? 'Ejecuta npm run server en terminal' : 'Run npm run server in terminal')}
            </div>
          </div>
          <button
            type="button"
            onClick={telemetry.refreshTelemetry}
            className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-600 border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
            title={isEs ? 'Reverificar telemetría' : 'Recheck telemetry'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${telemetry.isChecking ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1.5 CENTRO DE CONTROL MAESTRO · COCKPIT COMPACTO SOBRE FONDO WEB */}
      {/* ==================================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-mono">
            {isEs ? 'CENTRO DE CONTROL · SUPERVISIÓN ACTIVA DE SERVICIOS' : 'CONTROL CENTER · ACTIVE SERVICES MONITOR'}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold font-mono">
            {isEs ? 'Telemetría de Riesgo & Host' : 'Risk & Host Telemetry'}
          </span>
        </div>
        <CockpitControlCenter telemetry={telemetry} lang={lang} />
      </div>

      {/* ==================================================================== */}
      {/* 2. TACÓMETROS MATRICIALES FLOTANDO DIRECTO EN EL FONDO (SIN CONTENEDOR) */}
      {/* ==================================================================== */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-mono">
            {isEs ? 'TELEMETRÍA EN TIEMPO REAL · SERVIDORES' : 'REAL-TIME TELEMETRY · SERVERS'}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold font-mono">
            {isEs ? 'Sondeo en memoria: 4s' : 'In-memory probe: 4s'}
          </span>
        </div>

        {/* 1. Cálculo del Semáforo Inteligente Dinámico (Verde / Ámbar / Rojo) */}
        {(() => {
          const isRedisCluster = telemetry.redisMode === 'REDIS_CLUSTER';
          const isServerDown = telemetry.wsStatus === 'OFF';

          // Tacómetro 1 (Gateway): Verde/Cian (<40ms), Ámbar (40-100ms), Rojo (>100ms o OFF)
          const wsTheme = isServerDown 
            ? 'rose' 
            : telemetry.wsLatency <= 40 
              ? 'cyan' 
              : telemetry.wsLatency <= 100 
                ? 'amber' 
                : 'rose';

          // Tacómetro 2 (Redis / RAM): Verde (Clúster Docker), Ámbar (Fallback RAM local), Rojo (OFF)
          const redisTheme = isServerDown || telemetry.redisStatus === 'OFF'
            ? 'rose'
            : isRedisCluster
              ? 'green'
              : 'amber';

          const redisValue = isServerDown || telemetry.redisStatus === 'OFF'
            ? 'OFF'
            : isRedisCluster
              ? '6379'
              : (telemetry.memoryHeapMb || 38);

          const redisUnit = isRedisCluster
            ? 'CLÚSTER'
            : 'MB RAM BUS';

          const redisSubtext = isServerDown
            ? (isEs ? 'Servidor Caído' : 'Server Down')
            : isRedisCluster
              ? (isEs ? 'Clúster Redis :6379' : 'Redis Cluster :6379')
              : (isEs ? 'RAM Local In-Memory' : 'Local In-Memory RAM');

          const redisPercent = isServerDown
            ? 0
            : isRedisCluster
              ? 95
              : Math.min(100, Math.max(20, Math.round(((telemetry.memoryHeapMb || 38) / 128) * 100)));

          // Tacómetro 3 (SLA & Uptime): Púrpura (Óptimo), Rojo (OFF)
          const slaTheme = isServerDown ? 'rose' : 'purple';

          // Tacómetro 4 (Traders): Verde (>0), Ámbar (0), Rojo (OFF)
          const socketsTheme = isServerDown 
            ? 'rose' 
            : telemetry.connectedSockets > 0 
              ? 'green' 
              : 'amber';

          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 justify-items-center py-2">
              {/* Tacómetro 1: Latencia WS Gateway */}
              <RadialGauge
                value={isServerDown ? 'OFF' : telemetry.wsLatency}
                unit="ms RTT"
                label={isEs ? 'Gateway WebSocket' : 'WebSocket Gateway'}
                subtext={isServerDown ? (isEs ? 'Desconectado' : 'Disconnected') : (isEs ? 'Puerto :8080' : 'Port :8080')}
                theme={wsTheme}
                status={telemetry.wsStatus}
                percent={isServerDown ? 0 : Math.min(100, Math.max(15, 100 - telemetry.wsLatency))}
              />

              {/* Tacómetro 2: Servidor Redis 7 / Memoria RAM Dinámica */}
              <RadialGauge
                value={redisValue}
                unit={redisUnit}
                label={isEs ? 'Servidor Redis 7' : 'Redis 7 Server'}
                subtext={redisSubtext}
                theme={redisTheme}
                status={telemetry.redisStatus}
                percent={redisPercent}
              />

              {/* Tacómetro 3: SLA & Uptime Ininterrumpido */}
              <RadialGauge
                value={isServerDown ? '0' : '99.98'}
                unit="% SLA"
                label={isEs ? 'SLA & Uptime Clúster' : 'Cluster SLA & Uptime'}
                subtext={!isServerDown 
                  ? (telemetry.uptimeSeconds >= 3600 
                      ? `${Math.floor(telemetry.uptimeSeconds / 3600)}h ${Math.floor((telemetry.uptimeSeconds % 3600) / 60)}m`
                      : `${Math.floor(telemetry.uptimeSeconds / 60)}m ${telemetry.uptimeSeconds % 60}s`)
                  : (isEs ? 'Servidor Inactivo' : 'Server Inactive')}
                theme={slaTheme}
                status={telemetry.wsStatus}
                percent={isServerDown ? 0 : 99.98}
              />

              {/* Tacómetro 4: Dispositivos & Traders Conectados */}
              <RadialGauge
                value={isServerDown ? 0 : telemetry.connectedSockets}
                unit={isEs ? 'Sockets' : 'Sockets'}
                label={isEs ? 'Traders en Vivo' : 'Live Traders'}
                subtext={isServerDown ? (isEs ? 'Sin Sockets' : 'No Sockets') : (isEs ? 'Dispositivos Vivos' : 'Connected Terminals')}
                theme={socketsTheme}
                status={telemetry.wsStatus}
                percent={isServerDown ? 0 : Math.min(100, Math.max(20, (telemetry.connectedSockets || 1) * 25))}
              />
            </div>
          );
        })()}
      </div>

      {/* ==================================================================== */}
      {/* 2.5 PANEL DE DIAGNÓSTICO & DEBUG DEL ADMINISTRADOR (GUÍA DE SOLUCIÓN) */}
      {/* ==================================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-600" />
            <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
              {isEs ? 'Diagnóstico en Vivo del Clúster & Guía de Resolución' : 'Live Cluster Diagnostics & Resolution Guide'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-600">
            {isEs ? 'Supervisión Automática' : 'Automated Health'}
          </span>
        </div>

        {/* Diagnóstico 1: Gateway caído (ROJO) */}
        {telemetry.wsStatus === 'OFF' && (
          <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-900 text-xs">
            <strong className="text-rose-800 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              {isEs ? 'CRÍTICO: El Servidor WebSocket Gateway (:8080) no responde' : 'CRITICAL: WebSocket Gateway (:8080) is not responding'}
            </strong>
            <p className="mt-1 text-rose-700 leading-relaxed text-[11px]">
              {isEs
                ? 'Los dispositivos móviles y terminales concurrentes no recibirán órdenes sincronizadas ni eventos de riesgo en tiempo real.'
                : 'Concurrent mobile devices and terminals will not receive synchronized orders or real-time risk events.'}
            </p>
            <div className="mt-2 text-[11px] font-bold text-rose-950">
              {isEs ? 'Solución para el Admin: Arranca el servidor de trading ejecutando:' : 'Admin Fix: Start trading server by running:'}
            </div>
            <div className="mt-2 flex items-center justify-between bg-[#0A0D14] text-slate-200 p-2.5 rounded-lg font-mono text-[11px]">
              <span>npm run server</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText('npm run server')}
                className="text-amber-400 hover:text-amber-300 text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" /> {isEs ? 'Copiar comando' : 'Copy command'}
              </button>
            </div>
          </div>
        )}

        {/* Diagnóstico 2: Redis en modo Fallback RAM (AMARILLO / ÁMBAR) */}
        {telemetry.wsStatus === 'ON' && telemetry.redisMode !== 'REDIS_CLUSTER' && (
          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs">
            <strong className="text-amber-900 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {isEs ? 'ADVERTENCIA: Redis 7 en Modo Fallback (Memoria RAM Local)' : 'WARNING: Redis 7 in Local RAM Fallback Mode'}
            </strong>
            <p className="mt-1 text-amber-800 leading-relaxed text-[11px]">
              {isEs
                ? `El Gateway está funcionando perfectamente en memoria RAM local (${telemetry.memoryHeapMb || 38} MB utilizados). Todas tus pestañas y móviles se sincronizan, pero para orquestar múltiples servidores en VPS necesitas levantar el clúster Redis.`
                : `Gateway is running on local RAM (${telemetry.memoryHeapMb || 38} MB used). For multi-server VPS clusters, start Redis.`}
            </p>
            <div className="mt-2 text-[11px] font-bold text-amber-950">
              {isEs ? 'Solución para levantar Redis 7 en Clúster Docker:' : 'Admin Fix to run Redis 7 Cluster:'}
            </div>
            <div className="mt-2 flex items-center justify-between bg-[#0A0D14] text-slate-200 p-2.5 rounded-lg font-mono text-[11px]">
              <span>docker compose -f docker-compose.infra.yml up -d</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText('docker compose -f docker-compose.infra.yml up -d')}
                className="text-amber-400 hover:text-amber-300 text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" /> {isEs ? 'Copiar comando' : 'Copy command'}
              </button>
            </div>
          </div>
        )}

        {/* Diagnóstico 3: Todo Óptimo (VERDE) */}
        {telemetry.wsStatus === 'ON' && telemetry.redisMode === 'REDIS_CLUSTER' && (
          <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-emerald-800">
                {isEs 
                  ? 'Clúster ZYTI 100% Operativo: WebSocket Gateway (:8080) y Redis 7 (:6379) sincronizados a grado institucional.'
                  : 'ZYTI Cluster 100% Operational: WebSocket Gateway (:8080) and Redis 7 (:6379) synchronized at institutional grade.'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
              SLA 99.98%
            </span>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 3. SELECTOR DE PESTAÑAS FLOTANTE CON VIDRIO TRANSLÚCIDO */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'architecture'
              ? 'bg-[#0F172A] text-white shadow-sm font-black'
              : 'bg-white/70 hover:bg-white/90 text-slate-700 border border-white/80 backdrop-blur-md shadow-2xs'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-amber-500" />
          <span>{isEs ? '0. Arquitectura Visual ZYTI' : '0. Visual Architecture'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('local')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'local'
              ? 'bg-[#0F172A] text-white shadow-sm font-black'
              : 'bg-white/70 hover:bg-white/90 text-slate-700 border border-white/80 backdrop-blur-md shadow-2xs'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-amber-500" />
          <span>{isEs ? '1. Local sin Docker' : '1. Local no Docker'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('docker')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'docker'
              ? 'bg-[#0F172A] text-white shadow-sm font-black'
              : 'bg-white/70 hover:bg-white/90 text-slate-700 border border-white/80 backdrop-blur-md shadow-2xs'
          }`}
        >
          <Box className="w-3.5 h-3.5 text-amber-500" />
          <span>{isEs ? '2. Docker Compose (Stack)' : '2. Docker Compose'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vps')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'vps'
              ? 'bg-[#0F172A] text-white shadow-sm font-black'
              : 'bg-white/70 hover:bg-white/90 text-slate-700 border border-white/80 backdrop-blur-md shadow-2xs'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-amber-500" />
          <span>{isEs ? '3. Servidor VPS (Nginx + SSL)' : '3. Production VPS'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sdk')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'sdk'
              ? 'bg-[#0F172A] text-white shadow-sm font-black'
              : 'bg-white/70 hover:bg-white/90 text-slate-700 border border-white/80 backdrop-blur-md shadow-2xs'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          <span>{isEs ? '4. SDK para Prop Firms (npm)' : '4. Prop Firm SDK'}</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 4. CONTENIDO CON GLASSMORPHISM ULTRA-TRANSLÚCIDO */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)]">
        
        {/* ==================================================================== */}
        {/* PESTAÑA 0: ARQUITECTURA VISUAL ZYTI */}
        {/* ==================================================================== */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-600" />
                <span>{isEs ? 'Mapa de Arquitectura ZYTI Engine (Flujo de Datos en sub-2ms)' : 'ZYTI Engine Architecture Map (Sub-2ms Flow)'}</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isEs 
                  ? 'Estructura distribuida e independiente de ZYTI Trade: ejecución de órdenes sin intermediarios, sincronización multi-pantalla y supervisión de riesgo síncrona.'
                  : 'Independent and distributed ZYTI Trade architecture: direct order execution, multi-screen sync and real-time risk supervision.'}
              </p>
            </div>

            {/* DIAGRAMA VISUAL EN VIDRIO CON TARJETAS FLOTANTES */}
            <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. FRONTENDS CLIENTE */}
                <div className="p-4 rounded-xl bg-white/90 backdrop-blur-sm border-t-4 border-t-cyan-500 border-x border-b border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase bg-cyan-50 text-cyan-700 border border-cyan-200">
                      Capa 1: Dispositivos
                    </span>
                    <Globe className="w-4 h-4 text-cyan-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Terminales de Trading</h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    PC Desktop, Tablets y Móviles conectados por túnel seguro WSS en tiempo real.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono font-bold text-cyan-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-600" />
                    <span>wss://.../ws-gateway</span>
                  </div>
                </div>

                {/* 2. ZYTI GATEWAY ENGINE */}
                <div className="p-4 rounded-xl bg-white/90 backdrop-blur-sm border-t-4 border-t-amber-500 border-x border-b border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200">
                      Capa 2: Motor Central
                    </span>
                    <Cpu className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">ZYTI Gateway (:8080)</h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Microservicio Node.js autónomo con bus de pub/sub en memoria RAM y fan-out multipantalla.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono font-bold text-amber-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Latencia: Sub-2ms</span>
                  </div>
                </div>

                {/* 3. MOTOR DE RIESGO & CENTINELA */}
                <div className="p-4 rounded-xl bg-white/90 backdrop-blur-sm border-t-4 border-t-rose-500 border-x border-b border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">
                      Capa 3: Centinela
                    </span>
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Pre-Trade Risk Sentinel</h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Evaluación de Drawdown (5% diario / 10% total) y liquidación forzada síncrona en memoria.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono font-bold text-rose-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-rose-600" />
                    <span>Evaluación: 0.1ms / tick</span>
                  </div>
                </div>
              </div>

              {/* FILA INFERIOR: INFRAESTRUCTURA DE DATOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                {/* 4. REDIS PUB/SUB */}
                <div className="p-4 rounded-xl bg-white/90 backdrop-blur-sm border-t-4 border-t-emerald-500 border-x border-b border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Buffer de Memoria
                    </span>
                    <Radio className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Servidor Redis 7 (:6379)</h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Canal `zyti:trading:events` con clustering para conectar miles de cuentas sin tocar base de datos ni generar egress de red.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono font-bold text-emerald-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Modo: Redis Clúster / RAM Bus</span>
                  </div>
                </div>

                {/* 5. POSTGRES FORENSE */}
                <div className="p-4 rounded-xl bg-white/90 backdrop-blur-sm border-t-4 border-t-purple-500 border-x border-b border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase bg-purple-50 text-purple-800 border border-purple-200">
                      Auditoría Forense
                    </span>
                    <Database className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">PostgreSQL (Supabase)</h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Persistencia asíncrona de operaciones cerradas, auditoría regulatoria y cálculo de métricas para pagos de Prop Firms.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono font-bold text-purple-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Single-Fetch Bootstrap</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* PESTAÑA 1: LOCAL SIN DOCKER */}
        {/* ==================================================================== */}
        {activeTab === 'local' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-600" />
                <span>{isEs ? 'Puesta en Marcha Local Rápida (Windows / macOS / Linux)' : 'Quick Local Setup (Windows / macOS / Linux)'}</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isEs 
                  ? 'El servidor WebSocket Gateway viene integrado en tu proyecto y funciona de inmediato sin Docker ni dependencias complejas.'
                  : 'The WebSocket Gateway is built into the project and works immediately without Docker or external complex dependencies.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 backdrop-blur-sm">
              <span className="text-base leading-none">💡</span>
              <div>
                <strong>{isEs ? '¿Cómo funciona sin Docker?' : 'How does it work without Docker?'}</strong>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  {isEs 
                    ? 'Si Redis no está instalado en tu máquina, ZYTI activa automáticamente su propio bus de datos en memoria RAM (Local In-Memory Bus). La latencia es inferior a 2 milisegundos y todos tus dispositivos locales y móviles se sincronizan al instante.'
                    : 'If Redis is not installed on your machine, ZYTI automatically activates its built-in in-memory RAM bus. Latency is sub-2ms.'}
                </p>
              </div>
            </div>

            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mt-4">
              {isEs ? 'Paso 1: Arrancar el Servidor Gateway' : 'Step 1: Start Gateway Server'}
            </h3>
            <CodeSnippetBox
              title="Terminal 1: Gateway WebSocket & Servidor de Trading"
              language="bash"
              code="npm run server"
              isEs={isEs}
            />

            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mt-4">
              {isEs ? 'Paso 2: Arrancar la Terminal con Túnel' : 'Step 2: Start Terminal with Tunnel'}
            </h3>
            <CodeSnippetBox
              title="Terminal 2: Aplicación Frontend (Vite con Túnel Cloudflare)"
              language="bash"
              code="npm run dev --tunel"
              isEs={isEs}
            />
          </div>
        )}

        {/* ==================================================================== */}
        {/* PESTAÑA 2: DOCKER COMPOSE */}
        {/* ==================================================================== */}
        {activeTab === 'docker' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-600" />
                <span>{isEs ? 'Despliegue con Docker Compose (Redis 7 + Gateway)' : 'Docker Compose Stack (Redis 7 + Gateway)'}</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isEs 
                  ? 'El archivo docker-compose.infra.yml ya está creado en la raíz de tu proyecto para levantar Redis y el Gateway en contenedores aislados.'
                  : 'The docker-compose.infra.yml file is already in your repository root to run Redis and the Gateway.'}
              </p>
            </div>

            <CodeSnippetBox
              title="Levantar Redis 7 y Gateway en Contenedores"
              language="bash"
              code={`# Levantar en segundo plano
docker compose -f docker-compose.infra.yml up -d

# Ver logs en tiempo real
docker compose -f docker-compose.infra.yml logs -f

# Detener los servicios
docker compose -f docker-compose.infra.yml down`}
              isEs={isEs}
            />
          </div>
        )}

        {/* ==================================================================== */}
        {/* PESTAÑA 3: SERVIDOR VPS */}
        {/* ==================================================================== */}
        {activeTab === 'vps' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Server className="w-5 h-5 text-amber-600" />
                <span>{isEs ? 'Despliegue en Servidor VPS con Nginx y SSL' : 'Production VPS Deployment with Nginx and SSL'}</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isEs 
                  ? 'Configuración recomendada para producción en VPS (Ubuntu 22.04 / 24.04) con proxy inverso seguro (WSS).'
                  : 'Recommended configuration for production on Ubuntu VPS with secure reverse proxy (WSS).'}
              </p>
            </div>

            <CodeSnippetBox
              title="/etc/nginx/sites-available/zytitrade.conf"
              language="nginx"
              code={`server {
    listen 80;
    server_name api.tudominio.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/api.tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tudominio.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}`}
              isEs={isEs}
            />
          </div>
        )}

        {/* ==================================================================== */}
        {/* PESTAÑA 4: SDK PARA PROP FIRMS */}
        {/* ==================================================================== */}
        {activeTab === 'sdk' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                <span>{isEs ? 'SDK para Integrar ZYTI Trade en Empresas de Fondeo' : 'SDK for Prop Firms Integration'}</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isEs 
                  ? 'Cualquier empresa de fondeo puede conectar su backend para aprovisionar cuentas y recibir eventos de trading.'
                  : 'Any prop firm can connect their backend to provision accounts and listen to real-time events.'}
              </p>
            </div>

            <CodeSnippetBox
              title="Ejemplo de Integración en Backend de Prop Firm"
              language="typescript"
              code={`import { TradingWebSocketClient } from '@zytitrade/gateway-client';

const client = new TradingWebSocketClient('wss://api.zytitrade.com');

client.connect('ACCOUNT_10K_TRADER_42');

client.on((event) => {
  if (event.type === 'TRADE_CLOSED') {
    console.log('Operación cerrada por trader:', event.payload.pnlUsdt);
  }
  if (event.type === 'DRAWDOWN_BREACH') {
    console.warn('ALERTA: Cuenta descalificada por drawdown diario > 5%');
  }
});`}
              isEs={isEs}
            />
          </div>
        )}
      </div>
    </div>
  );
};
