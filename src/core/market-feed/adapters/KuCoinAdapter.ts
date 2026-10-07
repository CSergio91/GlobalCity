/**
 * ZYTI Trade - KuCoin Native Adapter (Spot & USDT-M Futures)
 * Implementación WebSocket pura con Bullet-Public Token Handshake.
 * Soporta Spot y Futuros con heartbeat y multiplexado de velas, book y ticker.
 */

import { MarketType, KLineBar, OrderBookPayload, MarketStats } from '../types';
import { BaseMarketAdapter } from './BaseMarketAdapter';

export class KuCoinAdapter extends BaseMarketAdapter {
  private lastStats: Map<string, MarketStats> = new Map();
  private lastBars: Map<string, KLineBar> = new Map();

  constructor() {
    super({
      exchangeId: 'kucoin',
      baseDelayMs: 1200,
      maxDelayMs: 30000,
      maxCommandsPerSec: 5,
      idleDisconnectDelayMs: 4000,
      heartbeatIntervalMs: 18000 // KuCoin requiere ping cada 18-20s
    });
  }

  /**
   * Obtiene dinámicamente el token bullet-public y el endpoint WSS de KuCoin.
   */
  protected async getEndpointUrl(marketType: MarketType): Promise<string> {
    const baseUrl = marketType === 'futures'
      ? 'https://api-futures.kucoin.com/api/v1/bullet-public'
      : 'https://api.kucoin.com/api/v1/bullet-public';

    try {
      const res = await fetch(baseUrl, { method: 'POST' });
      if (!res.ok) {
        throw new Error(`Fallo HTTP al obtener bullet-public token: ${res.statusText}`);
      }

      const json = await res.json();
      if (json.code !== '200000' || !json.data || !json.data.instanceServers?.length) {
        throw new Error(`Token inválido retornado por KuCoin: ${JSON.stringify(json)}`);
      }

      const server = json.data.instanceServers[0];
      const token = json.data.token;
      const connectId = Date.now();

      return `${server.endpoint}?token=${token}&connectId=${connectId}`;
    } catch (err) {
      console.warn(`[KuCoin] Fallo al solicitar bullet-public para ${marketType}, reintentando fallback...`, err);
      // Fallback a endpoint público estándar si existiera
      return marketType === 'futures'
        ? 'wss://ws-api-futures.kucoin.com/endpoint'
        : 'wss://ws-api-spot.kucoin.com/endpoint';
    }
  }

  private normalizeSymbol(symbol: string, marketType: MarketType): string {
    const clean = symbol.replace('/', '').toUpperCase();
    if (marketType === 'futures') {
      // KuCoin usa XBTUSDTM para Bitcoin USDT Margin Perpetual
      if (clean === 'BTCUSDT' || clean.startsWith('BTCUSDT')) {
        return 'XBTUSDTM';
      }
      return `${clean}M`;
    }
    // Spot usa formato DASH: BTC-USDT
    const parts = symbol.split('/');
    if (parts.length === 2) {
      return `${parts[0].toUpperCase()}-${parts[1].toUpperCase()}`;
    }
    if (clean.endsWith('USDT')) {
      return `${clean.replace('USDT', '')}-USDT`;
    }
    return clean;
  }

  private denormalizeSymbol(raw: string): string {
    const upper = raw.toUpperCase();
    if (upper === 'XBTUSDTM' || upper.startsWith('XBTUSDT')) {
      return 'BTC/USDT';
    }
    if (upper.endsWith('M')) {
      const stripped = upper.slice(0, -1);
      if (stripped.endsWith('USDT')) {
        return `${stripped.replace('USDT', '')}/USDT`;
      }
    }
    if (upper.includes('-')) {
      const [base, quote] = upper.split('-');
      return `${base}/${quote}`;
    }
    return upper;
  }

  private mapTimeframe(tf: string): string {
    const map: Record<string, string> = {
      '1m': '1min',
      '3m': '3min',
      '5m': '5min',
      '15m': '15min',
      '30m': '30min',
      '1h': '1hour',
      '2h': '2hour',
      '4h': '4hour',
      '1d': '1day',
      '1D': '1day',
      '1w': '1week'
    };
    return map[tf] || '15min';
  }

  protected sendSubscription(symbol: string, timeframe: string, marketType: MarketType): void {
    const instId = this.normalizeSymbol(symbol, marketType);
    const klineTf = this.mapTimeframe(timeframe);

    const topics = marketType === 'futures'
      ? [
          `/contractMarket/candles:${instId}_${klineTf}`,
          `/contractMarket/ticker:${instId}`,
          `/contractMarket/level2Depth5:${instId}`
        ]
      : [
          `/market/candles:${instId}_${klineTf}`,
          `/market/ticker:${instId}`,
          `/spotMarket/level2Depth5:${instId}`
        ];

    topics.forEach((topic) => {
      this.sendCommand(marketType, {
        id: Date.now().toString(),
        type: 'subscribe',
        topic,
        privateChannel: false,
        response: true
      });
    });
  }

  protected sendUnsubscription(symbol: string, marketType: MarketType): void {
    const instId = this.normalizeSymbol(symbol, marketType);
    const key = `${marketType}:${symbol}`;
    const tf = this.symbolTimeframes.get(key) || '15m';
    const klineTf = this.mapTimeframe(tf);

    const topics = marketType === 'futures'
      ? [
          `/contractMarket/candles:${instId}_${klineTf}`,
          `/contractMarket/ticker:${instId}`,
          `/contractMarket/level2Depth5:${instId}`
        ]
      : [
          `/market/candles:${instId}_${klineTf}`,
          `/market/ticker:${instId}`,
          `/spotMarket/level2Depth5:${instId}`
        ];

    topics.forEach((topic) => {
      this.sendCommand(marketType, {
        id: Date.now().toString(),
        type: 'unsubscribe',
        topic,
        privateChannel: false,
        response: false
      });
    });
  }

  protected handleRawMessage(rawData: string, marketType: MarketType): void {
    try {
      const msg = JSON.parse(rawData);
      if (!msg || msg.type !== 'message' || !msg.topic || !msg.data) return;

      const topic: string = msg.topic;
      const data = msg.data;

      // 1. Mensaje de Velas KLine
      if (topic.includes('/candles:')) {
        const parts = topic.split(':')[1]?.split('_');
        const instId = parts ? parts[0] : '';
        const symbol = this.denormalizeSymbol(instId);

        const candleData = data.candles;
        if (Array.isArray(candleData) && candleData.length >= 6) {
          const bar: KLineBar = {
            timestamp: parseInt(candleData[0], 10) * 1000,
            open: parseFloat(candleData[1]),
            close: parseFloat(candleData[2]),
            high: parseFloat(candleData[3]),
            low: parseFloat(candleData[4]),
            volume: parseFloat(candleData[5])
          };

          this.lastBars.set(`${marketType}:${symbol}`, bar);
          this.emit({
            type: 'KLINE',
            payload: {
              exchange: this.exchangeId,
              symbol,
              marketType,
              bar
            }
          });

          const key = `${marketType}:${symbol}`;
          this.lastBars.set(key, bar);

          // También emitir TICK_UPDATE consolidado
          const prevStats = this.lastStats.get(key);
          const stats: MarketStats = {
            symbol,
            exchange: this.exchangeId,
            marketType,
            lastPrice: bar.close,
            change24h: prevStats?.change24h ?? 0,
            high24h: Math.max(bar.high, prevStats?.high24h ?? bar.high),
            low24h: Math.min(bar.low, prevStats?.low24h ?? bar.low),
            volume24h: prevStats?.volume24h ?? bar.volume
          };
          this.lastStats.set(key, stats);

          this.emit({
            type: 'TICK_UPDATE',
            payload: {
              symbol,
              bar,
              stats,
              exchange: this.exchangeId,
              marketType
            }
          });
        }
      }

      // 2. Mensaje de Ticker L1
      else if (topic.includes('/ticker:')) {
        const instId = topic.split(':')[1] || '';
        const symbol = this.denormalizeSymbol(instId);

        const price = parseFloat(data.price || data.lastPrice || 0);
        if (price > 0) {
          const rawRate = parseFloat(data.changeRate || data.priceChange24h || 0) * 100;
          const change24h = !isNaN(rawRate) ? Number(rawRate.toFixed(2)) : 0;

          const stats: MarketStats = {
            symbol,
            exchange: this.exchangeId,
            marketType,
            lastPrice: price,
            change24h,
            high24h: parseFloat(data.high24h || data.highPrice || price),
            low24h: parseFloat(data.low24h || data.lowPrice || price),
            volume24h: parseFloat(data.volValue || data.volume || 0)
          };

          this.lastStats.set(`${marketType}:${symbol}`, stats);
          this.emit({
            type: 'TICKER',
            payload: {
              exchange: this.exchangeId,
              symbol,
              marketType,
              stats
            }
          });
        }
      }

      // 3. OrderBook L2 Depth5
      else if (topic.includes('level2Depth5:') || topic.includes('level2:')) {
        const instId = topic.split(':')[1] || '';
        const symbol = this.denormalizeSymbol(instId);

        const rawBids = Array.isArray(data.bids) ? data.bids : [];
        const rawAsks = Array.isArray(data.asks) ? data.asks : [];

        const orderbook: OrderBookPayload = {
          symbol,
          exchange: this.exchangeId,
          marketType,
          timestamp: data.timestamp || Date.now(),
          bids: rawBids.map((b: any) => ({
            price: parseFloat(b[0]),
            amount: parseFloat(b[1]),
            total: parseFloat(b[1])
          })),
          asks: rawAsks.map((a: any) => ({
            price: parseFloat(a[0]),
            amount: parseFloat(a[1]),
            total: parseFloat(a[1])
          }))
        };

        this.emit({
          type: 'ORDERBOOK_UPDATE',
          payload: orderbook
        });
      }
    } catch (err) {
      // Ignorar ruidos o heartbeats no estructurados
    }
  }

  protected startHeartbeat(marketType: MarketType): void {
    this.stopHeartbeat(marketType);

    const timer = setInterval(() => {
      this.sendCommand(marketType, {
        id: Date.now().toString(),
        type: 'ping'
      });
    }, this.heartbeatIntervalMs);

    this.heartbeatTimers.set(marketType, timer);
  }

  protected stopHeartbeat(marketType: MarketType): void {
    const timer = this.heartbeatTimers.get(marketType);
    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(marketType);
    }
  }
}
