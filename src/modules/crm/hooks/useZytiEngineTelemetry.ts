import { useState, useEffect, useCallback, useRef } from 'react';

export interface ZytiEngineTelemetry {
  wsStatus: 'ON' | 'OFF';
  wsLatency: number; // en ms RTT medido por WebSocket
  connectedSockets: number;
  uptimeSeconds: number;
  redisMode: 'REDIS_CLUSTER' | 'LOCAL_IN_MEMORY' | 'OFFLINE';
  redisStatus: 'ON' | 'OFF';
  memoryHeapMb: number;
  memoryRssMb: number;
  riskSentinelLatency: number; // en ms (0.1ms en RAM)
  riskSentinelStatus: 'ON' | 'OFF';
  cpuUsagePercent: number; // % de uso de CPU del proceso
  eventLoopLagMs: number; // Lag del Event Loop en ms
  throughputTps: number; // Ticks/mensajes procesados por segundo
  cpuCores: number;
  osTotalMemMb: number;
  osFreeMemMb: number;
  activeAccounts: number;
  openPositions: number;
  monitoredSymbols: string[];
  activeRulesCount: number;
  serviceName: string;
  version: string;
  healthStatus: 'healthy' | 'degraded' | 'offline';
  lastChecked: Date;
  isChecking: boolean;
}

export function useZytiEngineTelemetry() {
  const [telemetry, setTelemetry] = useState<ZytiEngineTelemetry>({
    wsStatus: 'OFF',
    wsLatency: 0,
    connectedSockets: 0,
    uptimeSeconds: 0,
    redisMode: 'LOCAL_IN_MEMORY',
    redisStatus: 'OFF',
    memoryHeapMb: 0,
    memoryRssMb: 0,
    riskSentinelLatency: 0.1,
    riskSentinelStatus: 'ON',
    cpuUsagePercent: 1.2,
    eventLoopLagMs: 0.14,
    throughputTps: 4,
    cpuCores: 4,
    osTotalMemMb: 16384,
    osFreeMemMb: 8192,
    activeAccounts: 0,
    openPositions: 0,
    monitoredSymbols: [],
    activeRulesCount: 0,
    serviceName: 'ZYTI Core Gateway',
    version: '2.0.0',
    healthStatus: 'offline',
    lastChecked: new Date(),
    isChecking: false
  });

  const wsRef = useRef<WebSocket | null>(null);
  const pingTimeRef = useRef<number>(0);

  // Determinar URL de WebSocket local o túnel
  const getWsUrl = useCallback(() => {
    if (typeof window === 'undefined') return 'ws://localhost:8080';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return 'ws://localhost:8080';
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws-gateway`;
  }, []);

  // 0. Sondeo continuo y robusto vía /health cada 3.5 segundos
  useEffect(() => {
    let active = true;
    const fetchHealth = async () => {
      try {
        const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const url = isLocalhost ? 'http://localhost:8080/health' : '/gateway-health';
        const start = performance.now();
        const res = await fetch(url);
        const rtt = Math.max(1, Math.round(performance.now() - start));
        if (res.ok && active) {
          const data = await res.json();
          setTelemetry(prev => ({
            ...prev,
            wsStatus: 'ON',
            wsLatency: prev.wsLatency > 0 ? prev.wsLatency : rtt,
            connectedSockets: data.connectedSockets !== undefined ? data.connectedSockets : prev.connectedSockets,
            uptimeSeconds: data.uptimeSeconds || prev.uptimeSeconds,
            redisMode: data.mode === 'REDIS_CLUSTER' ? 'REDIS_CLUSTER' : 'LOCAL_IN_MEMORY',
            redisStatus: 'ON',
            riskSentinelStatus: 'ON',
            memoryHeapMb: data.memoryHeapMb || prev.memoryHeapMb,
            memoryRssMb: data.memoryRssMb || prev.memoryRssMb,
            cpuUsagePercent: typeof data.cpuUsagePercent === 'number' ? data.cpuUsagePercent : prev.cpuUsagePercent,
            eventLoopLagMs: typeof data.eventLoopLagMs === 'number' ? data.eventLoopLagMs : prev.eventLoopLagMs,
            throughputTps: typeof data.throughputTps === 'number' ? data.throughputTps : prev.throughputTps,
            cpuCores: typeof data.cpuCores === 'number' ? data.cpuCores : prev.cpuCores,
            osTotalMemMb: typeof data.osTotalMemMb === 'number' ? data.osTotalMemMb : prev.osTotalMemMb,
            osFreeMemMb: typeof data.osFreeMemMb === 'number' ? data.osFreeMemMb : prev.osFreeMemMb,
            activeAccounts: data.activeAccounts !== undefined ? data.activeAccounts : prev.activeAccounts,
            openPositions: data.openPositions !== undefined ? data.openPositions : prev.openPositions,
            monitoredSymbols: Array.isArray(data.monitoredSymbols) ? data.monitoredSymbols : prev.monitoredSymbols,
            activeRulesCount: data.activeRulesCount !== undefined ? data.activeRulesCount : prev.activeRulesCount,
            serviceName: data.name || prev.serviceName,
            version: data.version || prev.version,
            healthStatus: data.status === 'healthy' ? 'healthy' : 'degraded',
            lastChecked: new Date()
          }));
        }
      } catch (_) {
        if (active) {
          // Si falló fetch de health y no hay WS, marcar offline
          setTelemetry(prev => prev.wsStatus === 'ON' ? prev : { ...prev, healthStatus: 'offline' });
        }
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 3500);
    return () => { 
      active = false; 
      clearInterval(interval);
    };
  }, []);

  // 1. Conexión WebSocket Real Streaming a la Pasarela
  useEffect(() => {
    let isCancelled = false;
    let pingInterval: any = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      if (isCancelled) return;
      const wsUrl = getWsUrl();

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isCancelled) return;
          // Suscribirse al canal continuo de telemetría institucional
          ws.send(JSON.stringify({ action: 'SUBSCRIBE_TELEMETRY', type: 'SUBSCRIBE_TELEMETRY' }));
          
          // Medir RTT inmediatamente
          pingTimeRef.current = performance.now();
          ws.send(JSON.stringify({ action: 'PING', type: 'PING', timestamp: Date.now() }));

          setTelemetry(prev => ({
            ...prev,
            wsStatus: 'ON',
            redisStatus: 'ON',
            riskSentinelStatus: 'ON',
            isChecking: false
          }));

          // Ticker de medición de ping RTT cada 2 segundos por WebSocket
          clearInterval(pingInterval);
          pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              pingTimeRef.current = performance.now();
              ws.send(JSON.stringify({ action: 'PING', type: 'PING', timestamp: Date.now() }));
            }
          }, 2000);
        };

        ws.onmessage = (event) => {
          if (isCancelled) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'PONG') {
              const rtt = Math.max(1, Math.round(performance.now() - pingTimeRef.current));
              setTelemetry(prev => ({
                ...prev,
                wsStatus: 'ON',
                wsLatency: rtt,
                connectedSockets: typeof data.connectedSockets === 'number' ? data.connectedSockets : prev.connectedSockets,
                uptimeSeconds: typeof data.uptimeSeconds === 'number' ? data.uptimeSeconds : prev.uptimeSeconds,
                redisMode: data.mode === 'REDIS_CLUSTER' ? 'REDIS_CLUSTER' : 'LOCAL_IN_MEMORY',
                redisStatus: 'ON',
                memoryHeapMb: typeof data.memoryHeapMb === 'number' ? data.memoryHeapMb : prev.memoryHeapMb,
                memoryRssMb: typeof data.memoryRssMb === 'number' ? data.memoryRssMb : prev.memoryRssMb,
                cpuUsagePercent: typeof data.cpuUsagePercent === 'number' ? data.cpuUsagePercent : prev.cpuUsagePercent,
                eventLoopLagMs: typeof data.eventLoopLagMs === 'number' ? data.eventLoopLagMs : prev.eventLoopLagMs,
                throughputTps: typeof data.throughputTps === 'number' ? data.throughputTps : prev.throughputTps,
                cpuCores: typeof data.cpuCores === 'number' ? data.cpuCores : prev.cpuCores,
                osTotalMemMb: typeof data.osTotalMemMb === 'number' ? data.osTotalMemMb : prev.osTotalMemMb,
                osFreeMemMb: typeof data.osFreeMemMb === 'number' ? data.osFreeMemMb : prev.osFreeMemMb,
                activeAccounts: typeof data.activeAccounts === 'number' ? data.activeAccounts : prev.activeAccounts,
                openPositions: typeof data.openPositions === 'number' ? data.openPositions : prev.openPositions,
                monitoredSymbols: Array.isArray(data.monitoredSymbols) ? data.monitoredSymbols : prev.monitoredSymbols,
                activeRulesCount: typeof data.activeRulesCount === 'number' ? data.activeRulesCount : prev.activeRulesCount,
                healthStatus: 'healthy',
                lastChecked: new Date(),
                isChecking: false
              }));
            } else if (data.type === 'TELEMETRY_UPDATE') {
              setTelemetry(prev => ({
                ...prev,
                wsStatus: 'ON',
                connectedSockets: typeof data.connectedSockets === 'number' ? data.connectedSockets : prev.connectedSockets,
                uptimeSeconds: typeof data.uptimeSeconds === 'number' ? data.uptimeSeconds : prev.uptimeSeconds,
                redisMode: data.mode === 'REDIS_CLUSTER' ? 'REDIS_CLUSTER' : 'LOCAL_IN_MEMORY',
                redisStatus: 'ON',
                memoryHeapMb: typeof data.memoryHeapMb === 'number' ? data.memoryHeapMb : prev.memoryHeapMb,
                memoryRssMb: typeof data.memoryRssMb === 'number' ? data.memoryRssMb : prev.memoryRssMb,
                activeAccounts: typeof data.activeAccounts === 'number' ? data.activeAccounts : prev.activeAccounts,
                openPositions: typeof data.openPositions === 'number' ? data.openPositions : prev.openPositions,
                monitoredSymbols: Array.isArray(data.monitoredSymbols) ? data.monitoredSymbols : prev.monitoredSymbols,
                activeRulesCount: typeof data.activeRulesCount === 'number' ? data.activeRulesCount : prev.activeRulesCount,
                healthStatus: 'healthy',
                lastChecked: new Date()
              }));
            }
          } catch {}
        };

        ws.onerror = () => {
          // Si falla WS, se encarga el onclose
        };

        ws.onclose = () => {
          clearInterval(pingInterval);
          if (!isCancelled) {
            setTelemetry(prev => ({
              ...prev,
              wsStatus: 'OFF',
              redisStatus: 'OFF',
              redisMode: 'OFFLINE',
              riskSentinelStatus: 'OFF'
            }));
            // Reintentar conexión en 3.5 segundos
            reconnectTimeout = setTimeout(connectWs, 3500);
          }
        };
      } catch {
        if (!isCancelled) {
          reconnectTimeout = setTimeout(connectWs, 3500);
        }
      }
    };

    connectWs();

    return () => {
      isCancelled = true;
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        const socket = wsRef.current;
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        if (socket.readyState === WebSocket.OPEN) {
          try { socket.close(1000, 'Normal unmount'); } catch (_) {}
        } else if (socket.readyState === WebSocket.CONNECTING) {
          socket.onopen = () => {
            try { socket.close(1000, 'Normal unmount'); } catch (_) {}
          };
        }
      }
    };
  }, [getWsUrl]);

  // Forzar refresco manual
  const refreshTelemetry = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setTelemetry(prev => ({ ...prev, isChecking: true }));
      pingTimeRef.current = performance.now();
      wsRef.current.send(JSON.stringify({ action: 'PING', type: 'PING', timestamp: Date.now() }));
    }
  }, []);

  return { ...telemetry, refreshTelemetry };
}
