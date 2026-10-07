/**
 * ZYTI Trade - Base Market Adapter
 * Provee la infraestructura resiliente compartida por todos los adaptadores:
 * - Reference Counting (conteo de suscriptores para compartir canales)
 * - Exponential Backoff con Full Jitter (anti-ráfagas y anti-bans)
 * - Anti-Abort Guard (previene errores de cierre durante handshake CONNECTING)
 * - Debounce de inactividad (4s antes de cerrar sockets vacíos)
 * - Token Bucket Rate Limiter para comandos salientes
 * - Detección y rotación limpia de 24h (Binance, Bybit)
 */

import { 
  MarketType, 
  AdapterConnectionStatus, 
  MarketFeedEvent 
} from '../types';
import { IMarketAdapter } from './IMarketAdapter';

export interface BaseAdapterConfig {
  exchangeId: string;
  baseDelayMs?: number;
  maxDelayMs?: number;
  maxCommandsPerSec?: number;
  idleDisconnectDelayMs?: number;
  heartbeatIntervalMs?: number;
}

export abstract class BaseMarketAdapter implements IMarketAdapter {
  public readonly exchangeId: string;
  protected baseDelayMs: number;
  protected maxDelayMs: number;
  protected idleDisconnectDelayMs: number;
  protected heartbeatIntervalMs: number;

  // Estado por mercado (Spot vs Futuros)
  protected statuses: Map<MarketType, AdapterConnectionStatus> = new Map([
    ['spot', 'DISCONNECTED'],
    ['futures', 'DISCONNECTED']
  ]);

  // Sockets activos por tipo de mercado
  protected sockets: Map<MarketType, WebSocket | null> = new Map([
    ['spot', null],
    ['futures', null]
  ]);

  // Timestamps de conexión para detectar rotación de 24h
  protected connectedAt: Map<MarketType, number> = new Map();

  // Contadores de reintento para backoff por mercado
  protected retryAttempts: Map<MarketType, number> = new Map([
    ['spot', 0],
    ['futures', 0]
  ]);

  // Reference Counting: channelKey `${marketType}:${symbol}` -> Set de subscriberIds
  protected subscribers: Map<string, Set<string>> = new Map();

  // Timeframes asociados a cada símbolo `${marketType}:${symbol}` -> '15m'
  protected symbolTimeframes: Map<string, string> = new Map();

  // Temporizadores de desconexión por inactividad (Debounce)
  protected disconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  // Heartbeat timers por mercado
  protected heartbeatTimers: Map<MarketType, ReturnType<typeof setInterval>> = new Map();

  // Reconnection timers por mercado
  protected reconnectTimers: Map<MarketType, ReturnType<typeof setTimeout>> = new Map();

  // Listeners de eventos
  protected eventListeners: Set<(event: MarketFeedEvent) => void> = new Set();

  // Token Bucket Rate Limiter para comandos salientes
  private tokenBucket = {
    tokens: 5,
    maxTokens: 5,
    refillRateMs: 200,
    lastRefill: Date.now()
  };
  private commandQueue: Array<{ marketType: MarketType; payload: any }> = [];
  private queueProcessorTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: BaseAdapterConfig) {
    this.exchangeId = config.exchangeId;
    this.baseDelayMs = config.baseDelayMs ?? 1000;
    this.maxDelayMs = config.maxDelayMs ?? 30000;
    this.idleDisconnectDelayMs = config.idleDisconnectDelayMs ?? 4000;
    this.heartbeatIntervalMs = config.heartbeatIntervalMs ?? 20000;

    this.startCommandQueueProcessor();
  }

  public getStatus(marketType: MarketType): AdapterConnectionStatus {
    return this.statuses.get(marketType) || 'DISCONNECTED';
  }

  public onEvent(handler: (event: MarketFeedEvent) => void): () => void {
    this.eventListeners.add(handler);
    return () => {
      this.eventListeners.delete(handler);
    };
  }

  protected emit(event: MarketFeedEvent): void {
    this.eventListeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error(`[${this.exchangeId}] Error en listener de evento:`, err);
      }
    });
  }

  protected setStatus(marketType: MarketType, status: AdapterConnectionStatus, message?: string): void {
    this.statuses.set(marketType, status);
    this.emit({
      type: 'STATUS_CHANGE',
      payload: {
        exchange: this.exchangeId,
        marketType,
        status,
        message
      }
    });
  }

  // -------------------------------------------------------------
  // REFERENCE COUNTING: SUBSCRIBE / UNSUBSCRIBE
  // -------------------------------------------------------------

  public subscribe(
    symbol: string,
    timeframe: string = '15m',
    subscriberId: string,
    marketType: MarketType = 'futures'
  ): void {
    const key = `${marketType}:${symbol}`;
    this.symbolTimeframes.set(key, timeframe);

    // Cancelar cualquier debounce de desconexión pendiente para este canal
    if (this.disconnectTimers.has(key)) {
      clearTimeout(this.disconnectTimers.get(key)!);
      this.disconnectTimers.delete(key);
    }

    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    const set = this.subscribers.get(key)!;
    const isFirstSubscriberForChannel = set.size === 0;
    set.add(subscriberId);

    // Si es el primer suscriptor, activar la conexión o suscribir el canal
    if (isFirstSubscriberForChannel) {
      this.ensureConnected(marketType);
      this.sendSubscription(symbol, timeframe, marketType);
    }
  }

  public unsubscribe(
    symbol: string,
    subscriberId: string,
    marketType: MarketType = 'futures'
  ): void {
    const key = `${marketType}:${symbol}`;
    const set = this.subscribers.get(key);
    if (!set) return;

    set.delete(subscriberId);

    // Si ya no quedan suscriptores para este símbolo, aplicar debounce de seguridad (4s)
    if (set.size === 0) {
      if (this.disconnectTimers.has(key)) {
        clearTimeout(this.disconnectTimers.get(key)!);
      }

      const timer = setTimeout(() => {
        this.disconnectTimers.delete(key);
        // Verificar nuevamente si sigue en 0
        if (this.subscribers.get(key)?.size === 0) {
          this.subscribers.delete(key);
          this.sendUnsubscription(symbol, marketType);

          // Si no queda ningún canal activo en este marketType, cerrar socket
          const hasActiveChannelsInMarket = Array.from(this.subscribers.keys()).some(
            (k) => k.startsWith(`${marketType}:`) && (this.subscribers.get(k)?.size ?? 0) > 0
          );

          if (!hasActiveChannelsInMarket) {
            this.disconnectSocket(marketType);
          }
        }
      }, this.idleDisconnectDelayMs);

      this.disconnectTimers.set(key, timer);
    }
  }

  // -------------------------------------------------------------
  // GESTIÓN DE WEBSOCKET RESILIENTE (ANTI-ABORT, BACKOFF, ROTACIÓN 24H)
  // -------------------------------------------------------------

  protected ensureConnected(marketType: MarketType): void {
    const currentStatus = this.getStatus(marketType);
    if (currentStatus === 'CONNECTED' || currentStatus === 'CONNECTING') {
      return;
    }

    this.connectSocket(marketType);
  }

  protected async connectSocket(marketType: MarketType): Promise<void> {
    this.setStatus(marketType, 'CONNECTING');

    try {
      const url = await this.getEndpointUrl(marketType);
      const ws = new WebSocket(url);
      this.sockets.set(marketType, ws);

      ws.onopen = () => {
        this.connectedAt.set(marketType, Date.now());
        this.retryAttempts.set(marketType, 0); // Reset de reintentos
        this.setStatus(marketType, 'CONNECTED');

        this.startHeartbeat(marketType);

        // Re-suscribir todos los canales activos para este mercado
        this.resubscribeActiveChannels(marketType);
      };

      ws.onmessage = (event: MessageEvent) => {
        this.handleRawMessage(event.data, marketType);
      };

      ws.onerror = (err) => {
        this.emit({
          type: 'ERROR',
          payload: {
            exchange: this.exchangeId,
            message: `Error en WebSocket ${marketType}: ${err instanceof Error ? err.message : 'Fallo de conexión'}`
          }
        });
      };

      ws.onclose = (e: CloseEvent) => {
        this.handleSocketClose(e, marketType);
      };
    } catch (err) {
      this.scheduleReconnection(marketType);
    }
  }

  /**
   * Anti-Abort Guard: Nunca llama a ws.close() si el socket está en CONNECTING (readyState 0).
   */
  protected disconnectSocket(marketType: MarketType): void {
    this.stopHeartbeat(marketType);
    const ws = this.sockets.get(marketType);
    if (!ws) return;

    if (ws.readyState === WebSocket.CONNECTING) {
      // El navegador arrojaría error si cerramos durante el handshake.
      // Limpiamos los callbacks y lo cerramos cuando complete onopen.
      ws.onopen = () => {
        try { ws.close(); } catch {}
      };
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
    } else if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.close(1000, 'Normal shutdown - zero subscribers');
      } catch {}
    }

    this.sockets.set(marketType, null);
    this.setStatus(marketType, 'DISCONNECTED');
  }

  private handleSocketClose(e: CloseEvent, marketType: MarketType): void {
    this.stopHeartbeat(marketType);
    this.sockets.set(marketType, null);

    // ¿Quedan suscriptores activos que necesitan reconexión?
    const hasActiveSubscribers = Array.from(this.subscribers.keys()).some(
      (k) => k.startsWith(`${marketType}:`) && (this.subscribers.get(k)?.size ?? 0) > 0
    );

    if (!hasActiveSubscribers) {
      this.setStatus(marketType, 'DISCONNECTED');
      return;
    }

    // Detección de rotación de 24h (ej. Binance cierra exactamente a las 24 horas)
    const connectedDurationMs = Date.now() - (this.connectedAt.get(marketType) || 0);
    const is24hRotation = connectedDurationMs >= 23.5 * 3600 * 1000 && (e.code === 1000 || e.code === 1001);

    if (is24hRotation) {
      this.setStatus(marketType, 'ROTATING_24H', 'Rotación grácil de 24h sin penalización');
      this.retryAttempts.set(marketType, 0); // Cero delay
      setTimeout(() => this.connectSocket(marketType), 150);
      return;
    }

    // Si fue caída inesperada: activar Exponential Backoff con Full Jitter
    this.scheduleReconnection(marketType);
  }

  /**
   * Exponential Backoff con Full Jitter (AWS & CCXT Standard):
   * temp = min(maxDelay, baseDelay * 2^attempt)
   * sleep = temp/2 + random(0, temp/2)
   */
  private scheduleReconnection(marketType: MarketType): void {
    this.setStatus(marketType, 'RECONNECTING');

    const attempt = this.retryAttempts.get(marketType) || 0;
    this.retryAttempts.set(marketType, attempt + 1);

    const tempDelay = Math.min(this.maxDelayMs, this.baseDelayMs * Math.pow(2, attempt));
    const jitter = Math.random() * (tempDelay / 2);
    const delayMs = Math.round((tempDelay / 2) + jitter);

    if (this.reconnectTimers.has(marketType)) {
      clearTimeout(this.reconnectTimers.get(marketType)!);
    }

    const timer = setTimeout(() => {
      this.reconnectTimers.delete(marketType);
      this.connectSocket(marketType);
    }, delayMs);

    this.reconnectTimers.set(marketType, timer);
  }

  private resubscribeActiveChannels(marketType: MarketType): void {
    this.subscribers.forEach((subs, key) => {
      if (key.startsWith(`${marketType}:`) && subs.size > 0) {
        const symbol = key.replace(`${marketType}:`, '');
        const timeframe = this.symbolTimeframes.get(key) || '15m';
        this.sendSubscription(symbol, timeframe, marketType);
      }
    });
  }

  // -------------------------------------------------------------
  // TOKEN BUCKET: CONTROL ANTI-RÁFAGA DE COMANDOS SALIENTES
  // -------------------------------------------------------------

  protected sendCommand(marketType: MarketType, payload: any): void {
    this.commandQueue.push({ marketType, payload });
  }

  private startCommandQueueProcessor(): void {
    this.queueProcessorTimer = setInterval(() => {
      if (this.commandQueue.length === 0) return;

      // Recargar tokens
      const now = Date.now();
      const elapsed = now - this.tokenBucket.lastRefill;
      const tokensToAdd = Math.floor(elapsed / this.tokenBucket.refillRateMs);
      if (tokensToAdd > 0) {
        this.tokenBucket.tokens = Math.min(this.tokenBucket.maxTokens, this.tokenBucket.tokens + tokensToAdd);
        this.tokenBucket.lastRefill = now;
      }

      // Despachar comandos si hay tokens
      while (this.tokenBucket.tokens > 0 && this.commandQueue.length > 0) {
        const item = this.commandQueue[0];
        const ws = this.sockets.get(item.marketType);
        if (ws && ws.readyState === WebSocket.OPEN) {
          this.commandQueue.shift();
          try {
            const raw = typeof item.payload === 'string' ? item.payload : JSON.stringify(item.payload);
            ws.send(raw);
            this.tokenBucket.tokens--;
          } catch {}
        } else {
          // Socket en CONNECTING o cerrado: pausar hasta que el socket esté OPEN sin perder el comando
          break;
        }
      }
    }, 50);
  }

  // -------------------------------------------------------------
  // MÉTODOS ABSTRACTOS IMPLEMENTADOS POR CADA EXCHANGE
  // -------------------------------------------------------------

  protected abstract getEndpointUrl(marketType: MarketType): Promise<string> | string;
  protected abstract sendSubscription(symbol: string, timeframe: string, marketType: MarketType): void;
  protected abstract sendUnsubscription(symbol: string, marketType: MarketType): void;
  protected abstract handleRawMessage(data: string, marketType: MarketType): void;
  protected abstract startHeartbeat(marketType: MarketType): void;
  protected abstract stopHeartbeat(marketType: MarketType): void;

  public destroy(): void {
    if (this.queueProcessorTimer) clearInterval(this.queueProcessorTimer);
    this.disconnectSocket('spot');
    this.disconnectSocket('futures');
    this.eventListeners.clear();
    this.subscribers.clear();
  }
}
