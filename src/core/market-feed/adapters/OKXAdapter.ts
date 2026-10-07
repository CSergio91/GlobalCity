/**
 * ZYTI Trade - OKX Native Adapter (Spot & SWAP Perpetuals)
 * Implementación WebSocket v5 oficial de OKX sin dependencias externas.
 * Soporta Spot e Instrumentos SWAP con formato normalizado y Heartbeat de texto plano.
 */

import { MarketType, KLineBar, OrderBookPayload, MarketStats } from '../types';
import { BaseMarketAdapter } from './BaseMarketAdapter';

export class OKXAdapter extends BaseMarketAdapter {
  private lastStats: Map<string, MarketStats> = new Map();
  private lastBars: Map<string, KLineBar> = new Map();

  constructor() {
    super({
      exchangeId: 'okx',
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      maxCommandsPerSec: 5,
      idleDisconnectDelayMs: 4000,
      heartbeatIntervalMs: 22000 // OKX desconecta si no recibe "ping" en 30s
    });
  }

  protected getEndpointUrl(_marketType: MarketType): string {
    return 'wss://ws.okx.com:8443/ws/v5/public';
  }

  private normalizeSymbol(symbol: string, marketType: MarketType): string {
    const parts = symbol.split('/');
    let base = 'BTC';
    let quote = 'USDT';

    if (parts.length === 2) {
      base = parts[0].toUpperCase();
      quote = parts[1].toUpperCase();
    } else {
      const clean = symbol.replace('/', '').toUpperCase();
      if (clean.endsWith('USDT')) {
        base = clean.replace('USDT', '');
        quote = 'USDT';
      }
    }

    if (marketType === 'futures') {
      return `${base}-${quote}-SWAP`;
    }
    return `${base}-${quote}`;
  }

  private denormalizeSymbol(instId: string): string {
    const parts = instId.toUpperCase().split('-');
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return instId;
  }

  private mapTimeframe(tf: string): string {
    const map: Record<string, string> = {
      '1m': 'candle1m',
      '3m': 'candle3m',
      '5m': 'candle5m',
      '15m': 'candle15m',
      '30m': 'candle30m',
      '1h': 'candle1H',
      '2h': 'candle2H',
      '4h': 'candle4H',
      '1d': 'candle1D',
      '1D': 'candle1D',
      '1w': 'candle1W'
    };
    return map[tf] || 'candle15m';
  }

  protected sendSubscription(symbol: string, timeframe: string, marketType: MarketType): void {
    const instId = this.normalizeSymbol(symbol, marketType);
    const candleChannel = this.mapTimeframe(timeframe);

    this.sendCommand(marketType, {
      op: 'subscribe',
      args: [
        { channel: candleChannel, instId },
        { channel: 'tickers', instId },
        { channel: 'books5', instId }
      ]
    });
  }

  protected sendUnsubscription(symbol: string, marketType: MarketType): void {
    const instId = this.normalizeSymbol(symbol, marketType);
    const key = `${marketType}:${symbol}`;
    const tf = this.symbolTimeframes.get(key) || '15m';
    const candleChannel = this.mapTimeframe(tf);

    this.sendCommand(marketType, {
      op: 'unsubscribe',
      args: [
        { channel: candleChannel, instId },
        { channel: 'tickers', instId },
        { channel: 'books5', instId }
      ]
    });
  }

  protected handleRawMessage(rawData: string, marketType: MarketType): void {
    // Si es respuesta pong de texto plano
    if (rawData === 'pong') return;

    try {
      const msg = JSON.parse(rawData);
      if (!msg || !msg.arg || !msg.data) return;

      const channel = msg.arg.channel;
      const instId = msg.arg.instId;
      const symbol = this.denormalizeSymbol(instId);

      // 1. Mensaje de Velas KLine
      if (channel.startsWith('candle')) {
        const rows = msg.data;
        if (Array.isArray(rows) && rows.length > 0) {
          const row = rows[0];
          const closePrice = parseFloat(row[4]);
          if (isNaN(closePrice) || closePrice <= 0) return;

          const bar: KLineBar = {
            timestamp: parseInt(row[0], 10),
            open: parseFloat(row[1]),
            high: parseFloat(row[2]),
            low: parseFloat(row[3]),
            close: closePrice,
            volume: parseFloat(row[5]) || 0
          };

          const key = `${marketType}:${symbol}`;
          this.lastBars.set(key, bar);
          this.emit({
            type: 'KLINE',
            payload: {
              exchange: this.exchangeId,
              symbol,
              marketType,
              bar
            }
          });

          // TICK_UPDATE consolidado preservando stats anteriores
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
      else if (channel === 'tickers') {
        const row = msg.data[0];
        if (row) {
          const key = `${marketType}:${symbol}`;
          const prevStats = this.lastStats.get(key);

          const rawPrice = parseFloat(row.last);
          const lastPrice = !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : (prevStats?.lastPrice || 0);

          if (lastPrice <= 0) return;

          const open24h = parseFloat(row.open24h);
          let change24h = prevStats?.change24h ?? 0;
          if (!isNaN(open24h) && open24h > 0) {
            change24h = Number((((lastPrice - open24h) / open24h) * 100).toFixed(2));
          }

          const stats: MarketStats = {
            symbol,
            exchange: this.exchangeId,
            marketType,
            lastPrice,
            change24h: Number(change24h.toFixed(2)),
            high24h: parseFloat(row.high24h) || prevStats?.high24h || lastPrice,
            low24h: parseFloat(row.low24h) || prevStats?.low24h || lastPrice,
            volume24h: parseFloat(row.volCcy24h || row.vol24h || '0') || prevStats?.volume24h || 0
          };

          this.lastStats.set(key, stats);
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

      // 3. OrderBook L2 Books5
      else if (channel === 'books5') {
        const row = msg.data[0];
        if (row) {
          const rawBids = Array.isArray(row.bids) ? row.bids : [];
          const rawAsks = Array.isArray(row.asks) ? row.asks : [];

          const orderbook: OrderBookPayload = {
            symbol,
            exchange: this.exchangeId,
            marketType,
            timestamp: parseInt(row.ts, 10) || Date.now(),
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
      }
    } catch (err) {
      // Ignorar mensajes irrelevantes o errores de parseo
    }
  }

  /**
   * OKX requiere enviar el string plano 'ping' de forma continua
   */
  protected startHeartbeat(marketType: MarketType): void {
    this.stopHeartbeat(marketType);

    const timer = setInterval(() => {
      const ws = this.sockets.get(marketType);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send('ping');
        } catch {}
      }
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
